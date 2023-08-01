const {appendFile, readFile, writeFile} = require("fs");
const {DateTime} = require("luxon");

function logPicoMessage(logMessage) {
    let logEntry = `PICO [${DateTime.now()}]: ${logMessage}`
    logEntry = logEntry.replace('\n', '');
    console.log('MQTT message: ', logEntry)
    appendFile('log/pico.log', logEntry + '\n', function (err) {
        if (err) throw err;
    });
}

exports.logPicoMessage = logPicoMessage;