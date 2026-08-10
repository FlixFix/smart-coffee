#!/usr/bin/env node
/**
 * Home Assistant bridge.
 *
 * Publishes MQTT discovery messages so Home Assistant creates a "Coffee Hub" device with all entities on its own -
 * no YAML on the Home Assistant side - and keeps their state up to date. Commands coming back from Home Assistant are
 * translated into the very same service calls the REST API uses, so the on-timer, the idle auto-off and the coffee
 * counter keep working no matter where the machine is switched from.
 *
 * Home Assistant is deliberately never pointed at the pico directly: the pico runs its PID loop and its webserver on a
 * single asyncio event loop, so every additional poller competes with temperature control. The backend polls once and
 * fans the result out over MQTT instead.
 */
const {mqttClient, BASE_TOPIC, AVAILABILITY_TOPIC} = require("./mqtt-service");
const {
    getPicoStatus, getTemperature, getReferenceTemperature, picoBrewCoffee, cancelBrewing, setDeviceStatus, updateConfig
} = require("./pico-service");
const {setMachinePower, getOnTime} = require("./coffee-service");
const {readConfig, patchConfig} = require("../util/config-util");
const {readStats, statsAddCoffee} = require("../util/stats-util");

const DISCOVERY_PREFIX = process.env.HA_DISCOVERY_PREFIX || 'homeassistant';
const NODE_ID = 'coffee_hub';
const STATE_TOPIC = `${BASE_TOPIC}/state`;
const COMMAND_PREFIX = `${BASE_TOPIC}/command`;

// How often the pico is polled for state. Don't go much below this: every cycle costs the pico a blocking DS18B20
// conversion on the same event loop that runs the PID.
const STATE_INTERVAL_MS = parseInt(process.env.HA_STATE_INTERVAL_MS || '10000');
// The reference sensor sits at the bottom of the machine and barely moves, so it is polled every n-th cycle only.
const REF_TEMP_EVERY_N_CYCLES = 6;

const DEVICE = {
    identifiers: [NODE_ID],
    name: 'Coffee Hub',
    manufacturer: 'Rancilio',
    model: 'Silvia (Raspberry Pi Pico W)',
    sw_version: require('../package.json').version,
};

// Device numbers as used by the pico (see pico/web_server.py).
const DEVICE_IO = '0';
const DEVICE_PUMP = '1';

let cycleCount = 0;
let publishing = false;
let lastRefTemp = null;

/**
 * Builds the shared part of every discovery payload.
 * @param objectId the unique object id of the entity.
 * @param config the entity specific part of the discovery payload.
 * @returns {*} the complete discovery payload.
 */
function discoveryPayload(objectId, config) {
    return {
        ...config,
        unique_id: `${NODE_ID}_${objectId}`,
        object_id: `${NODE_ID}_${objectId}`,
        device: DEVICE,
        availability_topic: AVAILABILITY_TOPIC,
        payload_available: 'online',
        payload_not_available: 'offline',
    };
}

/**
 * All entities exposed to Home Assistant. Every entry results in one retained discovery message.
 */
const ENTITIES = [
    ['switch', 'power', {
        name: 'Coffee machine',
        icon: 'mdi:coffee-maker',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.power }}',
        command_topic: `${COMMAND_PREFIX}/power`,
        state_on: 'ON',
        state_off: 'OFF',
        payload_on: 'ON',
        payload_off: 'OFF',
    }],
    ['switch', 'pump', {
        name: 'Pump',
        icon: 'mdi:water-pump',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.pump }}',
        command_topic: `${COMMAND_PREFIX}/pump`,
        state_on: 'ON',
        state_off: 'OFF',
        payload_on: 'ON',
        payload_off: 'OFF',
    }],
    ['switch', 'scheduler', {
        name: 'Scheduled start',
        icon: 'mdi:calendar-clock',
        entity_category: 'config',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.scheduler }}',
        command_topic: `${COMMAND_PREFIX}/scheduler`,
        state_on: 'ON',
        state_off: 'OFF',
        payload_on: 'ON',
        payload_off: 'OFF',
    }],
    ['binary_sensor', 'brewing', {
        name: 'Brewing',
        icon: 'mdi:coffee-to-go',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.pump }}',
        payload_on: 'ON',
        payload_off: 'OFF',
    }],
    ['binary_sensor', 'heating', {
        name: 'Heating',
        device_class: 'heat',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.heating }}',
        payload_on: 'ON',
        payload_off: 'OFF',
    }],
    // The tank pin is an input with a pull-up; the frontend treats any non-zero value as "please refill"
    // (see DashboardComponent.tsx), so the same polarity is used here.
    ['binary_sensor', 'tank_empty', {
        name: 'Water tank',
        device_class: 'problem',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.tankEmpty }}',
        payload_on: 'ON',
        payload_off: 'OFF',
    }],
    ['sensor', 'boiler_temperature', {
        name: 'Boiler temperature',
        device_class: 'temperature',
        state_class: 'measurement',
        unit_of_measurement: '°C',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.boilerTemperature }}',
    }],
    ['sensor', 'reference_temperature', {
        name: 'Reference temperature',
        device_class: 'temperature',
        state_class: 'measurement',
        unit_of_measurement: '°C',
        entity_category: 'diagnostic',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.referenceTemperature }}',
    }],
    ['sensor', 'on_since', {
        name: 'On since',
        device_class: 'timestamp',
        icon: 'mdi:timer-outline',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.onSince }}',
    }],
    ['sensor', 'coffee_count', {
        name: 'Coffees brewed',
        state_class: 'total_increasing',
        icon: 'mdi:counter',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.coffeeCount }}',
    }],
    ['button', 'brew_single', {
        name: 'Brew single shot',
        icon: 'mdi:coffee',
        command_topic: `${COMMAND_PREFIX}/brew`,
        payload_press: 'single',
    }],
    ['button', 'brew_double', {
        name: 'Brew double shot',
        icon: 'mdi:coffee-outline',
        command_topic: `${COMMAND_PREFIX}/brew`,
        payload_press: 'double',
    }],
    ['button', 'cancel_brew', {
        name: 'Cancel brewing',
        icon: 'mdi:stop-circle-outline',
        command_topic: `${COMMAND_PREFIX}/cancel-brew`,
        payload_press: 'PRESS',
    }],
    ['number', 'brew_temp', {
        name: 'Target temperature',
        device_class: 'temperature',
        unit_of_measurement: '°C',
        entity_category: 'config',
        min: 80,
        max: 110,
        step: 0.5,
        mode: 'box',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.brewTemp }}',
        command_topic: `${COMMAND_PREFIX}/config/brewTemp`,
    }],
    ['number', 'single_brew_time', {
        name: 'Single shot time',
        device_class: 'duration',
        unit_of_measurement: 's',
        entity_category: 'config',
        min: 1,
        max: 60,
        step: 0.5,
        mode: 'box',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.singleBrewTime }}',
        command_topic: `${COMMAND_PREFIX}/config/singleBrewTime`,
    }],
    ['number', 'double_brew_time', {
        name: 'Double shot time',
        device_class: 'duration',
        unit_of_measurement: 's',
        entity_category: 'config',
        min: 1,
        max: 90,
        step: 0.5,
        mode: 'box',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.doubleBrewTime }}',
        command_topic: `${COMMAND_PREFIX}/config/doubleBrewTime`,
    }],
    ['number', 'idle_time', {
        name: 'Idle switch-off',
        device_class: 'duration',
        unit_of_measurement: 'min',
        entity_category: 'config',
        min: 1,
        max: 240,
        step: 1,
        mode: 'box',
        state_topic: STATE_TOPIC,
        value_template: '{{ value_json.idleTime }}',
        command_topic: `${COMMAND_PREFIX}/config/idleTime`,
    }],
];

// Config keys writable through a number entity. Anything not listed here is ignored, so a stray MQTT message can't
// write arbitrary keys (the wlan credentials in particular) into the config file.
const WRITABLE_CONFIG_KEYS = ['brewTemp', 'singleBrewTime', 'doubleBrewTime', 'idleTime'];

/**
 * Publishes the retained discovery messages for every entity.
 */
function publishDiscovery() {
    ENTITIES.forEach(([component, objectId, config]) => {
        const topic = `${DISCOVERY_PREFIX}/${component}/${NODE_ID}/${objectId}/config`;
        mqttClient.publish(topic, JSON.stringify(discoveryPayload(objectId, config)), {retain: true, qos: 1});
    });
    console.log(`Published Home Assistant discovery for ${ENTITIES.length} entities.`);
}

/**
 * Subscribes to all command topics of the entities that can be controlled.
 */
function subscribeToCommands() {
    mqttClient.subscribe(`${COMMAND_PREFIX}/#`, (err) => {
        if (err) {
            console.log('Could not subscribe to Home Assistant command topics', err);
        } else {
            console.log(`Subscribed to Home Assistant command topics on ${COMMAND_PREFIX}/#`);
        }
    });
}

/**
 * Reads the value of a device from a pico status response.
 * @param picoStatus the pico-status-dto.
 * @param deviceNumber the device number as string.
 * @returns {number|undefined} the device value or undefined, if the device is not part of the response.
 */
function deviceValue(picoStatus, deviceNumber) {
    const device = picoStatus?.devices?.find((d) => d.device_number === deviceNumber);
    return device !== undefined ? device.value : undefined;
}

/**
 * Converts a device value into an MQTT switch payload.
 * @param value the device value being 0 or 1.
 * @returns {string} 'ON' or 'OFF'.
 */
function onOff(value) {
    return value === 1 ? 'ON' : 'OFF';
}

/**
 * Marks the device as available or unavailable in Home Assistant.
 * @param available true, if the pico could be reached.
 */
function publishAvailability(available) {
    mqttClient.publish(AVAILABILITY_TOPIC, available ? 'online' : 'offline', {retain: true, qos: 1});
}

/**
 * Polls the pico once and publishes the complete state as a single retained JSON message. All entities read their
 * value from this one message, so one poll feeds the whole device.
 */
async function publishState() {
    // Skip if the previous cycle is still waiting on the pico - a slow or unreachable pico must not pile up requests.
    if (publishing) {
        return;
    }
    publishing = true;

    try {
        const picoStatus = await getPicoStatus();

        if (picoStatus === undefined || picoStatus.devices === undefined) {
            publishAvailability(false);
            return;
        }

        const boilerTemp = await getTemperature().catch(() => undefined);

        if (cycleCount % REF_TEMP_EVERY_N_CYCLES === 0) {
            const refTemp = await getReferenceTemperature().catch(() => undefined);
            if (refTemp !== undefined && refTemp.temp !== undefined) {
                lastRefTemp = round(refTemp.temp);
            }
        }
        cycleCount++;

        const config = readConfig();
        const onTime = getOnTime();

        const state = {
            power: onOff(deviceValue(picoStatus, DEVICE_IO)),
            pump: onOff(deviceValue(picoStatus, DEVICE_PUMP)),
            heating: onOff(deviceValue(picoStatus, '2')),
            // any non-zero value on the tank pin means the tank needs refilling
            tankEmpty: deviceValue(picoStatus, '3') !== 0 ? 'ON' : 'OFF',
            boilerTemperature: boilerTemp !== undefined && boilerTemp.temp !== undefined ? round(boilerTemp.temp) : null,
            referenceTemperature: lastRefTemp,
            onSince: onTime !== null ? onTime.toISO() : null,
            coffeeCount: readStats().coffeeCount ?? 0,
            scheduler: config.scheduled === false ? 'OFF' : 'ON',
            brewTemp: config.brewTemp,
            singleBrewTime: config.singleBrewTime,
            doubleBrewTime: config.doubleBrewTime,
            idleTime: config.idleTime,
        };

        publishAvailability(true);
        mqttClient.publish(STATE_TOPIC, JSON.stringify(state), {retain: true});
    } catch (e) {
        console.log('Could not publish state to Home Assistant', e);
        publishAvailability(false);
    } finally {
        publishing = false;
    }
}

/**
 * Rounds a temperature to one decimal.
 * @param value the temperature.
 * @returns {number} the rounded temperature.
 */
function round(value) {
    return Math.round(parseFloat(value) * 10) / 10;
}

/**
 * Applies a config change coming from a Home Assistant number entity and forwards the merged config to the pico.
 * @param key the config key to be changed.
 * @param rawValue the new value as string.
 */
async function handleConfigCommand(key, rawValue) {
    if (!WRITABLE_CONFIG_KEYS.includes(key)) {
        console.log(`Ignoring config command for non-writable key ${key}`);
        return;
    }

    const value = parseFloat(rawValue);
    if (isNaN(value)) {
        console.log(`Ignoring config command for ${key} - '${rawValue}' is not a number`);
        return;
    }

    // The pico needs the complete config object, so the single value is merged into the stored config first.
    const config = patchConfig({[key]: value});
    await updateConfig(config);
    console.log(`Set ${key} to ${value} from Home Assistant.`);
}

/**
 * Handles a command message coming from Home Assistant.
 * @param topic the command topic.
 * @param payload the message payload.
 */
async function handleCommand(topic, payload) {
    const command = topic.slice(COMMAND_PREFIX.length + 1);
    const value = payload.toString().trim();
    console.log(`Home Assistant command: ${command} -> ${value}`);

    try {
        if (command === 'power') {
            await setMachinePower(value === 'ON' ? 1 : 0);
        } else if (command === 'pump') {
            const on = value === 'ON';
            await setDeviceStatus({device_number: DEVICE_PUMP, value: on ? 1 : 0});
            if (on) {
                statsAddCoffee();
            }
        } else if (command === 'brew') {
            await picoBrewCoffee(value === 'double' ? 'double' : 'single');
            statsAddCoffee();
        } else if (command === 'cancel-brew') {
            await cancelBrewing();
        } else if (command === 'scheduler') {
            patchConfig({scheduled: value === 'ON'});
        } else if (command.startsWith('config/')) {
            await handleConfigCommand(command.slice('config/'.length), value);
        } else {
            console.log(`Unknown Home Assistant command topic: ${topic}`);
            return;
        }
    } catch (e) {
        console.log(`Handling Home Assistant command ${command} failed`, e);
    }

    // Reflect the result straight away instead of waiting for the next poll.
    await publishState();
}

/**
 * Starts the Home Assistant bridge. Called once the MQTT client is connected.
 */
function startHomeAssistantBridge() {
    publishDiscovery();
    subscribeToCommands();
    publishState();
    setInterval(publishState, STATE_INTERVAL_MS);
}

exports.startHomeAssistantBridge = startHomeAssistantBridge;
exports.handleCommand = handleCommand;
exports.COMMAND_PREFIX = COMMAND_PREFIX;
