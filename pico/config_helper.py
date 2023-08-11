import json
import config
import logger


def load_config():
    """
    Loads the current config from config.json or writes the file with the default config, if no config exists yet.
    """
    try:
        read_config()
    except:
        write_config(config.CURRENT_CONFIG)


def read_config():
    """
    Reads the current config.json file and adjusts the CURRENT_CONFIG accordingly.
    """
    with open('config.json', 'r') as f:

        data = json.load(f)

        config.CURRENT_CONFIG.request_logging = data["request_logging"]
        config.CURRENT_CONFIG.pid_logging = data["pid_logging"]
        config.CURRENT_CONFIG.pid_control_logging = data["pid_control_logging"]
        config.CURRENT_CONFIG.info_logging = data["info_logging"]
        config.CURRENT_CONFIG.mqtt = data["mqtt"]
        config.CURRENT_CONFIG.mqtt_ip = data["mqtt_ip"]
        config.CURRENT_CONFIG.mqtt_topic = data["mqtt_topic"]
        config.CURRENT_CONFIG.wlan_pw = data["wlan_pw"]
        config.CURRENT_CONFIG.wlan_ssid = data["wlan_ssid"]

        config.CURRENT_CONFIG.idle_time = data['idle_time']
        config.CURRENT_CONFIG.single_brew_time = data['single_brew_time']
        config.CURRENT_CONFIG.double_brew_time = data['double_brew_time']
        config.CURRENT_CONFIG.brew_temp = data['brew_temp']
        config.CURRENT_CONFIG.pid_KP = data['pid_KP']
        config.CURRENT_CONFIG.pid_KI = data['pid_KI']
        config.CURRENT_CONFIG.pid_KD = data['pid_KD']

        logger.info('loaded config data successfully')
        logger.info(str(config.CURRENT_CONFIG.__dict__))


def write_config(update):
    """
    Writes the handed config to the config.json.
    :param update: the updated config.
    """
    logger.info('writing config file')
    try:
        with open('config.json', 'w') as f:
            json.dump(update.__dict__, f)
    except:
        logger.info("Could not write config file - using default values.")
