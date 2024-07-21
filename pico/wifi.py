import config
import logger
from machine import Pin
import time
import network
import uasyncio as asyncio

connected_to_wifi = False
MAX_RETRIES = 5
RETRY_DELAY = 5  # seconds


async def check_wifi_connection():
    """
    Periodically checks if the Pico is still connected to Wi-Fi.
    """
    global connected_to_wifi

    while True:
        if not config.wlan.isconnected():
            if connected_to_wifi:
                logger.info('lost wifi connection...')
            connected_to_wifi = False
        await asyncio.sleep(5)  # Check every 5 seconds


def connect_to_network():
    """
    Tries to connect the pico to the configured wifi network with retries. If successful, the pico's LED will stop flashing.
    """
    global connected_to_wifi

    network.hostname(config.PICO_HOSTNAME)
    config.wlan.active(True)
    config.wlan.config(pm=0xa11140)  # Disable power-save mode

    retries = 0
    while retries < MAX_RETRIES:
        config.wlan.connect(config.CURRENT_CONFIG.wlan_ssid, config.CURRENT_CONFIG.wlan_pw)
        max_wait = 10
        while max_wait > 0:
            if config.wlan.status() < 0 or config.wlan.status() >= 3:
                break
            max_wait -= 1

            logger.info('waiting for connection...')
            Pin("LED", Pin.OUT).toggle()
            time.sleep(1)

        if config.wlan.status() == 3:
            logger.info('Successfully connected to WIFI!')
            status = config.wlan.ifconfig()
            Pin("LED", Pin.OUT, value=1)
            logger.info('ip = ' + status[0])
            connected_to_wifi = True
            return True
        else:
            logger.info(f'Failed to connect to WIFI. Retrying in {RETRY_DELAY} seconds...')
            retries += 1
            time.sleep(RETRY_DELAY)

    logger.info('Failed to connect to WIFI after several attempts. Running access point.')
    run_server()
    connected_to_wifi = False
    return False


def run_server():
    """
    Runs the webserver on the pico.
    """
    ap = network.WLAN(network.AP_IF)
    ap.config(essid=config.PICO_AP_SSID, password=config.PICO_AP_PW)
    ap.active(True)
    print(ap.ifconfig())

    print('access point active')
