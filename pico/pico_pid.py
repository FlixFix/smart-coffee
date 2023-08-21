import config
import web_server
import logger
from machine import Pin
from PID import PID

cold_start_detected: bool = False
cold_start_checked: bool = False


async def pid():
    """
    The main pid control logic.
    """
    global cold_start_checked, cold_start_detected

    temperature = 0
    if config.relais_io.value() == 1:
        if not cold_start_checked:
            check_coldstart()

        if cold_start_detected:
            temperature, pid_needs_reset = pid_needs_resetting(temperature)
            if pid_needs_reset:
                reset_pid()
                cold_start_detected = False
        else:
            temperature = web_server.measure_temp(config.temp_sensor_resolution, config.pin_sensor_tank,
                                                  last_temp=temperature)
        output = config.pid_controller(float(temperature))
        logger.pid_control(str(temperature), str(output))
        logger.pid('The PID components are: ' + str(config.pid_controller.components))

        if output > 0:
            heating_on = 1
            logger.pid('keep heating up...')
        else:
            heating_on = 0
            logger.pid('turn heating off.')

        Pin(config.pin_heat, Pin.OUT, value=heating_on)
    else:
        cold_start_checked = False
        Pin(config.pin_heat, Pin.OUT, value=0)


def check_coldstart():
    """
    Defines whether the current machine startup heating should be treated as a cold start or not.
    """
    global cold_start_checked
    global cold_start_detected

    temp_ref = web_server.measure_temp(config.temp_sensor_resolution, config.pin_sensor_ref, 0)
    temp_tank = web_server.measure_temp(config.temp_sensor_resolution, config.pin_sensor_tank, 0)
    coldstart = abs(temp_tank - temp_ref) <= config.cold_start_threshold
    cold_start_checked = True
    if coldstart:
        cold_start_detected = True
        logger.pid('Cold start detected!')
    else:
        logger.pid('No cold start necessary.')


def pid_needs_resetting(last_temp):
    """
    Defines whether the pid control error needs to be reset due to a detected cold start and to limit overshoot.
    :return:  the measured tank temperature in order to avoid unnecessary temperature measurements.
    :return:  true, if the pid controller needs resetting, else false.
    """
    temp_tank = web_server.measure_temp(config.temp_sensor_resolution, config.pin_sensor_tank, last_temp)
    return temp_tank, abs(config.CURRENT_CONFIG.brew_temp - temp_tank) <= config.cold_start_temp_diff


def reset_pid():
    """
    Resets the pid controller in case of a coldstart to limit overshooting.
    """
    logger.pid('Resetting pid values due to cold start!')
    tunings = (config.CURRENT_CONFIG.pid_KP, config.CURRENT_CONFIG.pid_KI, config.CURRENT_CONFIG.pid_KD)
    brew_temp = config.CURRENT_CONFIG.brew_temp

    config.pid_controller = PID(tunings[0], tunings[1], tunings[2], setpoint=brew_temp, scale='ms')
