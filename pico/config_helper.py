import json
import config
import logger


def load_config():
    try:
        read_config()
    except:
        write_config(config.CURRENT_CONFIG)


def read_config():
    with open('config.json', 'r') as f:
        data = json.load(f)
        config.CURRENT_CONFIG.request_logging = data["request_logging"]
        config.CURRENT_CONFIG.pid_logging = data["pid_logging"]
        config.CURRENT_CONFIG.pid_control_logging = data["pid_control_logging"]
        config.CURRENT_CONFIG.info_logging = data["info_logging"]
        config.CURRENT_CONFIG.mqtt = data["mqtt"]
        config.CURRENT_CONFIG.wlan_pw = data["wlan_pw"]
        config.CURRENT_CONFIG.wlan_ssid = data["wlan_ssid"]

        logger.info('loaded config data successfully')
        logger.info(str(config.CURRENT_CONFIG.__dict__))


def write_config(update):
    logger.info('writing config file')
    try:
        with open('config.json', 'w') as f:
            json.dump(update.__dict__, f)
    except:
        logger.info("Could not write config file - using default values.")
