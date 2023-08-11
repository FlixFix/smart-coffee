#!/usr/bin/env node

// MQTT setup
const mqtt = require('mqtt')
require('dotenv').config()

const protocol = 'mqtt'
const host = process.env.MQTT_BROKER_IP
const port = process.env.MQTT_BROKER_PORT

const connectUrl = `${protocol}://${host}:${port}`

const client = mqtt.connect(connectUrl, {
    clientId: '',
    clean: true,
    connectTimeout: 4000,
    username: '',
    password: '',
    reconnectPeriod: 1000,
})

exports.mqttClient = client;