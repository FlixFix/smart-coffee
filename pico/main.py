import uasyncio as asyncio
from machine import WDT

import access_point
import config
import config_helper
import logger
import web_server
import wifi
import pico_coffee
import pico_pid


# RP2040 hardware watchdog: max timeout is 8388 ms. We feed it every 2 s from
# an async heartbeat. If any task blocks the event loop or main() crashes into
# the zombie new_event_loop() state, the Pico hard-resets and reboots cleanly.
WDT_TIMEOUT_MS = 8388
WDT_FEED_INTERVAL = 2
_wdt = None


async def feed_watchdog():
    while True:
        if _wdt is not None:
            _wdt.feed()
        await asyncio.sleep(WDT_FEED_INTERVAL)


async def init():
    """
    Initializes the config and tries to connect to the local network.
    """
    config_helper.load_config()
    await wifi.connect_to_network()


async def main():
    global _wdt

    await init()

    # Start the watchdog only after the initial connect — a cold-boot connect
    # can legitimately exceed the 8.388 s timeout.
    _wdt = WDT(timeout=WDT_TIMEOUT_MS)
    asyncio.create_task(feed_watchdog())

    webserver_task = None
    access_point_task = None

    asyncio.create_task(wifi.check_wifi_connection())

    while True:
        if wifi.connected_to_wifi:
            if access_point_task is not None:
                access_point_task.cancel()
                access_point_task = None
            if webserver_task is None:
                webserver_task = asyncio.create_task(
                    asyncio.start_server(web_server.serve_client, "0.0.0.0", 80))
                logger.info('Webserver setup successfully!')
                logger.info('PID control inactive')
        else:
            if webserver_task is not None:
                webserver_task.cancel()
                webserver_task = None
            if access_point_task is None:
                access_point_task = asyncio.create_task(
                    asyncio.start_server(access_point.serve_client, "0.0.0.0", 88))
                logger.info('Access point setup successfully!')
            await wifi.connect_to_network()

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
