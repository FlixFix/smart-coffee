const {appendFile, readFile, writeFile, existsSync, writeFileSync, readFileSync} = require("fs");
const {DateTime} = require("luxon");

/**
 * Writes a PICO log message to the log file.
 * @param logMessage the log message to be logged.
 */
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