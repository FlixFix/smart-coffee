import config
import logger
from machine import Pin
import time
import network

connected_to_wifi = False


def connect_to_network():
    global connected_to_wifi

    network.hostname(config.PICO_HOSTNAME)
    config.wlan.active(True)
    config.wlan.config(pm=0xa11140)  # Disable power-save mode
    config.wlan.connect(config.CURRENT_CONFIG.wlan_ssid, config.CURRENT_CONFIG.wlan_pw)

    max_wait = 10
    while max_wait > 0:
        if config.wlan.status() < 0 or config.wlan.status() >= 3:
            break
        max_wait -= 1

        logger.info('waiting for connection...')
        Pin("LED", Pin.OUT).toggle()
        time.sleep(1)

    if config.wlan.status() != 3:
        run_server()
        connected_to_wifi = False
    else:
        logger.info('Successfully connected to WIFI!')
        status = config.wlan.ifconfig()
        Pin("LED", Pin.OUT, value=1)
        logger.info('ip = ' + status[0])
        connected_to_wifi = True


def run_server():
    ap = network.WLAN(network.AP_IF)
    ap.config(essid=config.PICO_AP_SSID, password=config.PICO_AP_PW)
    ap.active(True)
    print(ap.ifconfig())

    print('access point active')
