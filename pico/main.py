import uasyncio as asyncio

import access_point
import config
import config_helper
import logger
import web_server
import wifi
import pico_coffee
import pico_pid


def init():
    """
    Initializes the config and tries to connect to the local network.
    """
    config_helper.load_config()
    wifi.connect_to_network()


async def main():
    init()
    webserver_running = False
    access_point_running = False
    access_point_task = None

    while True:
        if wifi.connected_to_wifi and webserver_running is False:
            if access_point_task is not None:
                access_point_task.cancel()
            asyncio.create_task(asyncio.start_server(web_server.serve_client, "0.0.0.0", 80))
            logger.info('Webserver setup successfully!')
            logger.info('PID control inactive')
            webserver_running = True
        elif wifi.connected_to_wifi is False and access_point_running is False:
            access_point_task = asyncio.create_task(asyncio.start_server(access_point.serve_client, "0.0.0.0", 88))
            logger.info('Access point setup successfully!')
            access_point_running = True

        await smart_coffee_loop()
        await asyncio.sleep(config.main_loop_delay)


async def smart_coffee_loop():
    """
    Main method handling all coffee related functions, such as brewing and temperature control.
    """
    if wifi.connected_to_wifi:
        if web_server.brew_start_time > -1:
            await pico_coffee.brewing()

        await pico_pid.pid()

try:
    asyncio.run(main())
finally:
    asyncio.new_event_loop()
