#!/usr/bin/env node
const {put, get} = require("axios");


async function getPicoStatus() {
    return await picoStatus();
}

async function getDeviceStatus(deviceNumber) {
    return await deviceStatus(deviceNumber);
}

async function picoBrewCoffee(duration) {
    return await doBrewCoffee(duration);
}

async function getTemperature() {
    return await temperature();
}

async function getReferenceTemperature() {
    return await refTemperature();
}

async function turnMachineOn(kP, kI, kD, brewTemp) {
    return await turnOn(kP, kI, kD, brewTemp);
}

async function updateConfig(config) {
    return await doConfig(config)
}

async function getConfig() {
    return await doGetConfig()
}

const doConfig = async (config) => {
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

async function doBrewCoffee(duration) {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/brew?duration=${duration}`)
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

async function turnOn(kP, kI, kD, brewTemp) {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/on?kP=${kP}&kI=${kI}&kD=${kD}&brewTemp=${brewTemp}`)
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