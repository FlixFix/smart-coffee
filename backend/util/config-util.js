const {readFileSync, writeFileSync, existsSync, remove, unlink, unlinkSync} = require("fs");

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

function writeConfig(config) {
    // use path from root of project instead of relative to current file!
    writeFileSync('service/config.json', JSON.stringify(config));
    return readConfig();
}

function deleteConfig() {
    if (existsSync('service/config.json')) {
        console.log('resetting config to default values!')
        unlinkSync('service/config.json');
    }
}

exports.writeConfig = writeConfig;
exports.readConfig = readConfig;
exports.deleteConfig = deleteConfig;