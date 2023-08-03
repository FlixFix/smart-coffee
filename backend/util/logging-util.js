const {appendFile, readFile, writeFile, existsSync} = require("fs");
const {DateTime} = require("luxon");

function logPicoMessage(logMessage) {
    let logEntry = `PICO [${DateTime.now()}]: ${logMessage}`
    logEntry = logEntry.replace('\n', '');
    console.log('MQTT message: ', logEntry)

    const currentLogFile = `log/${DateTime.now().toISODate()}_pico.log`
    if (!existsSync(currentLogFile)) {
        writeFile(currentLogFile, logEntry + '\n', (err) => {});
    } else {
        appendFile(currentLogFile, logEntry + '\n', function (err) {
            if (err) throw err;
        });
    }
}

exports.logPicoMessage = logPicoMessage;