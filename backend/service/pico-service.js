#!/usr/bin/env node
const { get, put} = require("axios");
const axios = require("axios");

async function getPicoStatus() {
    return await picoStatus();
}

async function getPicoHealth() {
    return await picoHealth();
}

async function getDeviceStatus(deviceNumber) {
    return await deviceStatus(deviceNumber);
}

async function picoBrewCoffee(type) {
    return await doBrewCoffee(type);
}

async function picoCancelBrewing() {
    return await doDeleteBrew();
}

async function getTemperature() {
    return await temperature();
}

async function getReferenceTemperature() {
    return await refTemperature();
}

async function turnMachineOn() {
    return await turnOn();
}

async function updateConfig(config) {
    return await doPutConfig(config)
}

async function getConfig() {
    return await doGetConfig()
}

const doPutConfig = async (config) => {
    return await put(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/config`, config)
        .then((res) => res.data
        )
        .catch((err) => {
            console.error(err);
        });
};

const doGetConfig = async () => {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/config`)
        .then((res) => res.data
        )
        .catch((err) => {
            console.error(err);
        });
};

const setDeviceStatus = async (deviceStatus) => {
    return await put(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/devices/status`, deviceStatus)
        .then((res) => res.data
        )
        .catch((err) => {
            console.error(err);
        });
};

async function picoStatus() {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/status`)
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}


async function picoHealth() {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/health`)
        .then((res) => res)
        .catch((err) => {
            console.error(err);
        });
}

async function deviceStatus(deviceNumber) {
   return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/devices/status/${deviceNumber}`, {})
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

async function temperature() {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/temperature`, {})
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

async function refTemperature() {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/ref-temperature`, {})
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

async function doBrewCoffee(type) {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/brew?type=${type}`)
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

async function doDeleteBrew() {
    return await axios.delete(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/brew`)
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

async function turnOn() {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/on`)
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

exports.getPicoStatus = getPicoStatus;
exports.setDeviceStatus = setDeviceStatus;
exports.getDeviceStatus = getDeviceStatus;
exports.picoBrewCoffee = picoBrewCoffee;
exports.getTemperature = getTemperature;
exports.getReferenceTemperature = getReferenceTemperature;
exports.turnMachineOn = turnMachineOn;
exports.updateConfig = updateConfig;
exports.getConfig = getConfig;
exports.cancelBrewing = picoCancelBrewing;
exports.getPicoHealth = getPicoHealth;