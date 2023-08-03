#!/usr/bin/env node
const {setDeviceStatus, getDeviceStatus, picoBrewCoffee} = require("./pico-service");
const {readConfig} = require("../util/config-util");
const {DateTime} = require("luxon");

let deviceOnTime = null;

function setOnTime(time) {
    deviceOnTime = time;
}

function getOnTime() {
    return deviceOnTime;
}

setInterval(scheduler, 10000);

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

function currentTimeInConfiguredTimes(config) {
    const currentTime = DateTime.local().toFormat("HH:mm");
    const currentDay = DateTime.local().day % 6;

    // check day
    if (!config.daysOn.includes(currentDay)) {
        return false;
    }

    if (!config.timesOn.includes(currentTime)) {
        return false;
    }

    return true;
}

async function brewCoffee(coffeeType) {
    let brewTime = readConfig().doubleBrewTime;
    if (coffeeType === 'single') {
        brewTime = readConfig().singleBrewTime;
    }

    console.log(`Brewing coffee of type ${coffeeType} with a duration of ${brewTime} seconds!`)

    await picoBrewCoffee(brewTime);
}

async function getMachineStatus() {
    const machineStatus = await getDeviceStatus('0');
    if (machineStatus !== undefined) {
        return machineStatus.value;
    } else {
        console.log('Could not get machine status');
        return 0;
    }
}

exports.brewCoffee = brewCoffee;
exports.setOnTime = setOnTime;
exports.getOnTime = getOnTime;
