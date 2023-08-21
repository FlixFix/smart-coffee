import logger
from machine import Pin
import web_server
import utime
import config


async def brewing():
    """
    The main brewing control function.
    """
    logger.info('Started brewing with a duration of: ' + str(web_server.brew_duration))

    if utime.ticks_diff(utime.ticks_ms(), web_server.brew_start_time) > web_server.brew_duration:
        logger.info('Finished brewing after ' + str(web_server.brew_duration) + ' seconds.')
        Pin(config.pin_pump, Pin.OUT, value=0)
        web_server.brew_duration = -1
        web_server.brew_start_time = -1
    else:
        logger.info('brewing...')
        Pin(config.pin_pump, Pin.OUT, value=1)


