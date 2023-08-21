#!/usr/bin/env node
// server/index.js

const express = require("express");
const {writeConfig, readConfig, deleteConfig} = require("../util/config-util");
const {
    getPicoStatus, setDeviceStatus, getTemperature, turnMachineOn,
    getReferenceTemperature, updateConfig, cancelBrewing, getPicoHealth, picoBrewCoffee
} = require("../service/pico-service");
const {setOnTime, getOnTime} = require("../service/coffee-service");
const {resolve} = require("path");
const {DateTime} = require("luxon");
const {json} = require("express");
const {logPicoMessage} = require("../util/logging-util");
const {mqttClient} = require("../service/mqtt-service");


require('dotenv').config({path: '.env'})

init()

// initialize application port
const PORT = process.env.PORT || 3001;

// initialize express
const app = express();
app.use(express.json());

// use frontend components to be served directly from the backend
app.use(express.static(resolve(__dirname, '../../frontend/build')));

/**
 * Returns the current stats of the application - these stats will not be overridden on a new deployment.
 */
app.get("/coffee-hub/api/v1/stats", (req, res) => {
    const stats = readStats();
    res.json(stats);
    res.status(200);
});

/**
 * Returns the pico status containing the status of all the devices attached to the pico and the current pico system time.
 */
app.get("/coffee-hub/api/v1/pico-status", (req, res) => {
    getPicoStatus().then((response) => {
        res.status(200);
        res.json(response);
    });
});

/**
 * Returns the current on-timer of the coffee machine or an empty json, if the machine is turned off.
 */
app.get("/coffee-hub/api/v1/on-status", (req, res) => {
    res.status(200);
    res.json(getOnTime() !== null ? getOnTime() : json());
});

/**
 * Returns a temperature-dto containing the temperature of the temperature sensor attached to the boiler.
 */
app.get("/coffee-hub/api/v1/temperature", (req, res) => {
    getTemperature().then((temp) => {
        res.status(200);
        res.json(temp);
    }).catch(() => {
        console.log('Could not retrieve temperature!')
    })
});

/**
 * Returns a temperature-dto containing the temperature of the reference temperature sensor attached to the bottom of the machine.
 */
app.get("/coffee-hub/api/v1/reference-temperature", (req, res) => {
    getReferenceTemperature().then((temp) => {
        res.status(200);
        res.json(temp);
    }).catch(() => {
        console.log('Could not retrieve temperature!')
    })
});

/**
 * Starts the brewing process on the pico either a single or a double shot. The type of the coffee, is determined by
 * a query parameter being either sigle or double. Once brewing is done, the pump will turn off automatically.
 */
app.get("/coffee-hub/api/v1/brew", (req, res) => {
    const type = req.query.type;
    picoBrewCoffee(type).then(() => {
        statsAddCoffee();
        res.status(201);
        res.json();
    }).catch(() => {
        console.log('Could not brew coffee!')
    })
});

/**
 * Force cancels the current brewing process by turning off the pump.
 */
app.delete("/coffee-hub/api/v1/brew", (req, res) => {
    cancelBrewing().then(() => {
        res.status(200);
        res.json();
    }).catch(() => {
        console.log('Could not brew coffee!')
    })
});

/**
 * Updates the status of a device attached to the pico based on a device-status-dto. If the device is the I/O device
 * the coffee machine will be turned on and the heating process is started (handled by the pico).
 */
app.put("/coffee-hub/api/v1/devices", (req, res) => {
    console.log(`setting status: ${req.body.value} for device ${req.body.device_number}`);
    if (req.body.device_number === '0' && req.body.value === 1) {
        turnMachineOn().then((data) => {
            if (data.value === 1) {
                console.log('Machine turned on!')
                setOnTime(DateTime.now());
            } else {
                setOnTime(null);
            }
            res.status(200);
            res.json(data);
        })
    } else if (req.body.device_number === '1' && req.body.value === 1) {
        setDeviceStatus(req.body).then((data) => {
            statsAddCoffee();
            res.status(200);
            res.json(data);
        });
    } else {
        setDeviceStatus(req.body).then((data) => {
            res.status(200);
            res.json(data);
        });
    }
});

/**
 * Updates the config on the pico based on a pico-config-dto. The config will also be written to the backend in the
 * config.json in case the pico has to be re-flashed and to keep the config.
 */
app.put("/coffee-hub/api/v1/config", (req, res) => {
    if (req.body) {
        // send the config to the pico
        updateConfig(req.body).then(() => {
            writeConfig(req.body);
            res.status(200);
            res.json(readConfig());
            console.log('Sent config to pico successfully!')
            console.log(`Updated config: ${JSON.stringify(req.body)}`);
        }).catch(() => {
            res.json(readConfig());
            console.log('Could not write config to pico!')
        })
    } else {
        res.status(400);
    }
});

/**
 * Gets the current pico-config from the backend, which is always in sync with the config on the pico.
 */
app.get("/coffee-hub/api/v1/config", (req, res) => {
    res.json(readConfig());
    res.status(200);
});

/**
 * Deletes the current custom config and resets it to the default config inside default_config.json. The default config will
 * then also be sent to the pico.
 */
app.delete("/coffee-hub/api/v1/config", (req, res) => {
    if (req.body) {
        deleteConfig();
        const defaultConfig = readConfig()
        
        // send config to pico
        updateConfig(defaultConfig).then(() => {
            console.log('reset config on pico')
            res.status(200);
            res.json(defaultConfig);
        }).catch(() => console.log('Config reset failed!'))
    } else {
        res.status(400);
    }
});

/**
 * Start the webserver on the configured port.
 */
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(resolve(__dirname, '../../frontend/build', 'index.html'));
});


// this code opens a websocket to broadcast MQTT messages received from the broker to the frontend
const WebSocket = require('ws');
const {statsAddCoffee, readStats} = require("../util/stats-util");

const wss = new WebSocket.Server({port: 7071});

wss.on('connection', (ws) => {
    // WebSocket connection is established
    console.log('WebSocket client connected');
});


function sendMessageToClients(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

/**
 * Connects the backend to the MQTT broker.
 */
mqttClient.on('connect', () => {
    console.log('Successfully connected to MQTT broker.');
    mqttClient.subscribe([process.env.MQTT_TOPIC], () => {
        console.log(`Subscribe to topic ${process.env.MQTT_TOPIC}`)
    })
})

/**
 * Successful connection message.
 */
mqttClient.on('error', (e) => {
    console.log('Could not connect to MQTT broker', e);
})

/**
 * When a message from the MQTT broker is received, it will be sent through the websocket as well as written to the log file.
 */
mqttClient.on('message', (topic, payload) => {
    logPicoMessage(payload);
    sendMessageToClients(payload);
})

/**
 * Initialize functions, which sends the backend config to the pico and checks, whether the connection to the pico was
 * successful.
 */
function init() {
    // check if pico is up and running
    getPicoHealth().then((response) => {
        if (response.status === 200) {
            console.log('Pico up and running - connection successful!')
            // send config to pico to keep config in sync
            updateConfig(readConfig()).then(() => console.log('Send config from backend to pico!')).catch(() => console.log('Updating pico config failed!'))
        } else {
            console.log('Could not connect to PICO!')
        }
    }).catch(() => console.log('Pico connection failed!'))
}








