import uasyncio as asyncio
import utime
from machine import Pin

import access_point
import config
import config_helper
import logger
import web_server
import wifi


def init():
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
    if wifi.connected_to_wifi:
        if web_server.brew_start_time > -1:
            logger.info('Started brewing with a duration of: ' + str(web_server.brew_duration))

            if utime.ticks_diff(utime.ticks_ms(), web_server.brew_start_time) > web_server.brew_duration:
                logger.info('Finished brewing!')
                Pin(config.pin_pump, Pin.OUT, value=0)
                web_server.brew_duration = -1
                web_server.brew_start_time = -1
            else:
                logger.info('brewing...')
                Pin(config.pin_pump, Pin.OUT, value=1)

        temperature = 0
        if config.relais_io.value() == 1:
            temperature = web_server.measure_temp(config.temp_sensor_resolution, config.pin_sensor_tank,
                                                  last_temp=temperature)
            output = config.pid_controller(float(temperature))
            logger.pid_control(str(temperature), str(output))
            logger.info('The PID components are: ' + str(config.pid_controller.components))

            heating_on = 0
            if output > 0:
                heating_on = 1
                logger.info('keep heating up...')
            else:
                heating_on = 0
                logger.info('turn heating off.')

            Pin(config.pin_heat, Pin.OUT, value=heating_on)
        else:
            Pin(config.pin_heat, Pin.OUT, value=0)


try:
    asyncio.run(main())
finally:
    asyncio.new_event_loop()
