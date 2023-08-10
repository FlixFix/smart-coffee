#!/usr/bin/env node
// server/index.js

const express = require("express");
const {writeConfig, readConfig, deleteConfig} = require("../util/config-util");
const {
    getPicoStatus, setDeviceStatus, getTemperature, turnMachineOn,
    getReferenceTemperature, updateConfig, cancelBrewing, getPicoHealth
} = require("../service/pico-service");
const {brewCoffee, setOnTime, getOnTime} = require("../service/coffee-service");
const {resolve} = require("path");
const {DateTime} = require("luxon");
const {json} = require("express");
const {logPicoMessage} = require("../util/logging-util");
const {mqttClient} = require("../service/mqtt-service");


require('dotenv').config({path: '.env'})

init()


const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

app.use(express.static(resolve(__dirname, '../../frontend/build')));

app.get("/coffee-hub/api/v1/pico-status", (req, res) => {
    getPicoStatus().then((response) => {
        res.status(200);
        res.json(response);
    });
});

app.get("/coffee-hub/api/v1/on-status", (req, res) => {
    res.status(200);
    res.json(getOnTime() !== null ? getOnTime() : json());
});

app.get("/coffee-hub/api/v1/temperature", (req, res) => {
    getTemperature().then((temp) => {
        res.status(200);
        res.json(temp);
    }).catch(() => {
        console.log('Could not retrieve temperature!')
    })
});

app.get("/coffee-hub/api/v1/reference-temperature", (req, res) => {
    getReferenceTemperature().then((temp) => {
        res.status(200);
        res.json(temp);
    }).catch(() => {
        console.log('Could not retrieve temperature!')
    })
});

app.get("/coffee-hub/api/v1/brew", (req, res) => {
    const type = req.query.type;
    brewCoffee(type).then(() => {
        res.status(201);
        res.json();
    }).catch(() => {
        console.log('Could not brew coffee!')
    })
});

app.delete("/coffee-hub/api/v1/brew", (req, res) => {
    cancelBrewing().then(() => {
        res.status(200);
        res.json();
    }).catch(() => {
        console.log('Could not brew coffee!')
    })
});

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
    } else {
        setDeviceStatus(req.body).then((data) => {
            res.status(200);
            res.json(data);
        });
    }
});

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

app.get("/coffee-hub/api/v1/config", (req, res) => {
    res.json(readConfig());
    res.status(200);
});

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

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(resolve(__dirname, '../../frontend/build', 'index.html'));
});


const WebSocket = require('ws');

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

mqttClient.on('connect', () => {
    console.log('Successfully connected to MQTT broker.');
    mqttClient.subscribe([process.env.MQTT_TOPIC], () => {
        console.log(`Subscribe to topic ${process.env.MQTT_TOPIC}`)
    })
})


mqttClient.on('error', (e) => {
    console.log('Could not connect to MQTT broker', e);
})

mqttClient.on('message', (topic, payload) => {
    logPicoMessage(payload);
    sendMessageToClients(payload);
})

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








