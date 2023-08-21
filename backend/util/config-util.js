const {readFileSync, writeFileSync, existsSync, remove, unlink, unlinkSync} = require("fs");

/**
 * Reads the current config and returns it as a json object. If no custom config exists, the default config is returned.
 * @returns {any} the config as JSON.
 */
function readConfig() {
    // use path from root of project instead of relative to current file!
    // only if a config exists, take it, otherwise use default config
    let configData;
    if (existsSync('service/config.json')) {
        configData = readFileSync('service/config.json');
    } else {
        configData = readFileSync('service/default_config.json');
    }
    return JSON.parse(configData);
}

/**
 * Writes the updated config to the config.json.
 * @param config the updated config as JSON.
 * @returns {*} the updated config as JSON.
 */
function writeConfig(config) {
    // use path from root of project instead of relative to current file!
    writeFileSync('service/config.json', JSON.stringify(config));
    return readConfig();
}

/**
 * Deletes the custom config.
 */
function deleteConfig() {
    if (existsSync('service/config.json')) {
        console.log('resetting config to default values!')
        unlinkSync('service/config.json');
    }
}

exports.writeConfig = writeConfig;
exports.readConfig = readConfig;
exports.deleteConfig = deleteConfig;