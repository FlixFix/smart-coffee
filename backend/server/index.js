#!/usr/bin/env node
// server/index.js

const express = require("express");
const {writeConfig, readConfig, deleteConfig} = require("../util/config-util");
const {
    getPicoStatus, setDeviceStatus, picoBrewCoffee, getTemperature, turnMachineOn,
    getReferenceTemperature, updateConfig, getConfig
} = require("../service/pico-service");
const {brewCoffee, setOnTime, getOnTime} = require("../service/coffee-service");
const {resolve} = require("path");
const {DateTime} = require("luxon");
const {json} = require("express");
const {logPicoMessage} = require("../util/logging-util");
const {mqttClient} = require("../service/mqtt-service");


require('dotenv').config({path: '.env'})

const PORT = process.env.PORT || 3001;

// giving the cleaning time of the machine used to clean
// the brewing group after brewing coffee
const CLEAN_TIME = process.env.CLEAN_TIME ||  2;

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

app.put("/coffee-hub/api/v1/devices", (req, res) => {
    console.log(`setting status: ${req.body.value} for device ${req.body.device_number}`);
    if (req.body.device_number === '0' && req.body.value === 1) {
        const config = readConfig();
        turnMachineOn(config.pidKP, config.pidKI, config.pidKD, config.brewTemp).then((data) => {
            if (data.value === 1) {
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

app.put("/coffee-hub/api/v1/pico-config", (req, res) => {
    updateConfig(req.body).then((data) => {
        res.status(200);
        res.json(data);
    });
});

app.get("/coffee-hub/api/v1/pico-config", (req, res) => {
    getConfig(req.body).then((data) => {
        res.status(200);
        res.json(data);
    });
});

app.get("/coffee-hub/api/v1/clean", (req, res) => {
    console.log('Cleaning brewing group ...')
    picoBrewCoffee(CLEAN_TIME).then(() => {
        res.status(200);
        res.json();
    })
});

app.put("/coffee-hub/api/v1/config", (req, res) => {
    if (req.body) {
        writeConfig(req.body);
        console.log(`Updated config: ${JSON.stringify(req.body)}`);
        res.status(200);
        res.json(readConfig());
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
        res.status(200);
        res.json(readConfig());
    } else {
        res.status(400);
    }
});

app.post("/coffee-hub/api/v1/log", (req, res) => {
    console.log('receiving log entry...');
    logPicoMessage(req.body);
    res.status(200)
    res.json(json())
})

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








