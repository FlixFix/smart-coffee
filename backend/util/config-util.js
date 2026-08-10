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
 * Merges a partial config into the current config and persists the result. Needed because both the pico and the
 * frontend expect a complete config object - the pico's PUT handler indexes all of its keys unconditionally and
 * raises a KeyError on a partial body - so single-value changes (e.g. a Home Assistant number entity setting the
 * brew temperature) have to be merged on top of the stored config first.
 * @param partialConfig an object holding only the keys to be changed.
 * @returns {*} the merged config as JSON.
 */
function patchConfig(partialConfig) {
    return writeConfig({...readConfig(), ...partialConfig});
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
exports.patchConfig = patchConfig;
exports.readConfig = readConfig;
exports.deleteConfig = deleteConfig;