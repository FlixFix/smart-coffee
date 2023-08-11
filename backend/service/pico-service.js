#!/usr/bin/env node
const { get, put} = require("axios");
const axios = require("axios");

/**
 * Returns the current pico status containing the current pico system time and the device status of all the devices
 * attached to pico.
 * @returns {Promise<T>} the pico status as a pico-status-dto.
 */
async function getPicoStatus() {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/status`)
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

/**
 * Pings the pico health endpoint and checks for response with status 200.
 */
async function getPicoHealth() {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/health`)
        .then((res) => res)
        .catch((err) => {
            console.error(err);
        });
}

/**
 * Returns the status of a specific device attached to the pico.
 * @param deviceNumber the device number.
 * @returns {Promise<T>} returns a device-status-dto for the given device.
 */
async function getDeviceStatus(deviceNumber) {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/devices/status/${deviceNumber}`, {})
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

/**
 * Starts the brewing process on the pico based on the brew type.
 * @param type being either single or double, depending on the given type.
 */
async function picoBrewCoffee(type) {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/brew?type=${type}`)
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

/**
 * Force cancels the current brewing process by turning off the pump.
 */
async function picoCancelBrewing() {
    return await axios.delete(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/brew`)
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

/**
 * Returns the reference temperature measured at the boiler temperature sensor as a temperature-dto.
 * @returns {Promise<T>} the boiler temperature as temperature-dto.
 */
async function getTemperature() {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/temperature`, {})
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

/**
 * Returns the reference temperature measured at the reference temperature sensor as a temperature-dto.
 * @returns {Promise<T>} the reference temperature as temperature-dto.
 */
async function getReferenceTemperature() {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/ref-temperature`, {})
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

/**
 * Turns the coffee machine on and starts the heating cycle.
 */
async function turnMachineOn() {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/on`)
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
        });
}

/**
 * Updates the config on the pico based on a given pico-config-dto.
 * @param config the new config as pico-config-dto.
 * @returns {Promise<T>} the updated config stored on the pico as pico-config-dto.
 */
async function updateConfig(config) {
    return await put(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/config`, config)
        .then((res) => res.data
        )
        .catch((err) => {
            console.error(err);
        })
}

/**
 * Gets the current config stored on the pico as a pico-config-dto.
 * @returns {Promise<T>} the pico-config-dto.
 */
async function getConfig() {
    return await get(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/pico/config`)
        .then((res) => res.data
        )
        .catch((err) => {
            console.error(err);
        })
}

/**
 * Sets the status for a device on the pico based on a device-status-dto.
 * @param deviceStatus the new device status.
 * @returns {Promise<T>} the updated device status.
 */
const setDeviceStatus = async (deviceStatus) => {
    return await put(`http://${process.env.PICO_IP}:${process.env.PICO_PORT}/devices/status`, deviceStatus)
        .then((res) => res.data
        )
        .catch((err) => {
            console.error(err);
        });
};
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