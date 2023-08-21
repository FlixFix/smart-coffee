const {writeFileSync, existsSync, readFileSync} = require("fs");

function statsAddCoffee() {
    let currentStats = readStats();
    currentStats['coffeeCount'] = parseInt(currentStats['coffeeCount']) + 1;
    writeStats(currentStats);
}

/**
 * Writes the updated stats to the stats file.
 * @param stats the stats as JSON.
 * @returns {*} the updated stats as JSON.
 */
function writeStats(stats) {
    // use path from root of project instead of relative to current file!
    writeFileSync('log/stats.json', JSON.stringify(stats));
    return readStats();
}

/**
 * Reads the stats file and returns it as JSON.
 * @returns {any} the current stats as JSON.
 */
function readStats() {
    let stats = {};
    if (existsSync('log/stats.json')) {
        stats = readFileSync('log/stats.json');
        return JSON.parse(stats);
    } else {
        writeStats({});
        return {};
    }
}

exports.writeStats = writeStats;
exports.readStats = readStats;
exports.statsAddCoffee = statsAddCoffee;
