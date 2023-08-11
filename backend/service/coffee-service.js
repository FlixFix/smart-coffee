#!/usr/bin/env node
const {setDeviceStatus, getDeviceStatus, picoBrewCoffee} = require("./pico-service");
const {readConfig} = require("../util/config-util");
const {DateTime} = require("luxon");

let deviceOnTime = null;

/**
 * Sets the on time of the machine to the given value.
 * @param time the on time to be set.
 */
function setOnTime(time) {
    deviceOnTime = time;
}

/**
 * Gets the current on time.
 * @returns {null} the current on time.
 */
function getOnTime() {
    return deviceOnTime;
}

/**
 * Sets the interval and callback for the scheduled on and off.
 */
setInterval(scheduler, 10000);

/**
 * Main callback for the automated on and off timer. Days and times to which the machine should be turned on, can be set
 * in the config.json. The complete scheduling can also be turned off through the according value. This methode also takes
 * care of turning off the machine after the set idle time.
 */
async function scheduler() {
    await scheduleMachine();

    // check, whether the machine has been on for the configured time already
    const configOnTimeInMinutes = readConfig().idleTime;
    const machineStatus = await getMachineStatus();

    if (machineStatus === 1 && deviceOnTime != null) {
        const onMinutes = DateTime.now().diff(deviceOnTime, 'minutes').toObject().minutes;

        if (onMinutes >= configOnTimeInMinutes) {
            console.log(`Turning machine off after ${configOnTimeInMinutes} minutes due to idle...`);
            await setDeviceStatus({
                value: 0,
                device_number: "0"
            }).then(() => setOnTime(null));
        } else {
            console.log(`Machine is running since ${onMinutes.toFixed(2)} minutes`)
        }
    }

    console.log('heartbeat <3...')
}

/**
 * Turns the machine on and off based on the configured schedule.
 */
async function scheduleMachine() {
    const config = readConfig();
    if (config.scheduled === false) {
        console.log('Scheduling turned off!')
        return;
    }

    if (currentTimeInConfiguredTimes(config)) {
        // turn on
        // check device status:
        const machineStatus = await getMachineStatus();

        if (machineStatus === 1) {
            return;
        }

        setDeviceStatus({
            value: 1,
            device_number: "0"
        }).then((data) => {
            console.log('Device turned on successfully!');
            deviceOnTime = DateTime.now();
        }).catch((e) => console.log(e));
    }
}

/**
 * Check whether the current time is part of the configured schedule.
 * @param config the current config.
 * @returns {boolean} true, if the current time is part of the configured schedule.
 */
function currentTimeInConfiguredTimes(config) {
    const currentTime = DateTime.local().toFormat("HH:mm");
    const currentDay = DateTime.local().weekday - 1;

    // check day
    if (!config.daysOn.includes(currentDay)) {
        return false;
    }

    if (!config.timesOn.includes(currentTime)) {
        return false;
    }

    return true;
}

/**
 * Gets the current machine status.
 * @returns {Promise<number|*>} the status of the machine - 0 if the machine is turned off else 1.
 */
async function getMachineStatus() {
    const machineStatus = await getDeviceStatus('0');
    if (machineStatus !== undefined) {
        return machineStatus.value;
    } else {
        console.log('Could not get machine status');
        return 0;
    }
}

exports.setOnTime = setOnTime;
exports.getOnTime = getOnTime;
