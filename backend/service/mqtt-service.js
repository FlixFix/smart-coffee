#!/usr/bin/env node

// MQTT setup
const mqtt = require('mqtt')
require('dotenv').config()

const protocol = 'mqtt'
const host = process.env.MQTT_BROKER_IP
const port = process.env.MQTT_BROKER_PORT

const connectUrl = `${protocol}://${host}:${port}`

// Base topic for everything this backend publishes for Home Assistant. The log topic (MQTT_TOPIC) is separate and
// stays reserved for the raw pico log stream.
const BASE_TOPIC = process.env.MQTT_BASE_TOPIC || 'coffee-hub';
const AVAILABILITY_TOPIC = `${BASE_TOPIC}/availability`;

const client = mqtt.connect(connectUrl, {
    clientId: process.env.MQTT_CLIENT_ID || 'coffee-hub-backend',
    clean: true,
    connectTimeout: 4000,
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
    reconnectPeriod: 1000,
    // Last will: if the backend dies or loses the broker, the broker publishes 'offline' for us and every Home
    // Assistant entity greys out instead of showing a stale state.
    will: {
        topic: AVAILABILITY_TOPIC,
        payload: 'offline',
        qos: 1,
        retain: true,
    },
})

exports.mqttClient = client;
exports.BASE_TOPIC = BASE_TOPIC;
exports.AVAILABILITY_TOPIC = AVAILABILITY_TOPIC;
