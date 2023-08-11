import httpUtils
from devices import DeviceStatus, PicoStatus, Temperature
from machine import Pin
import onewire
from ds18x20 import DS18X20

import utime
import json
import config
from config import relais_io, relais_pump, relais_heat, rtc, CURRENT_CONFIG, pin_sensor_ref, \
    pin_sensor_tank, print_to_console, temp_sensor_resolution, tank_toggle
import logger
import config_helper
from PID import PID

# brewing coffee
brew_duration: int = -1
brew_start_time: int = -1

PICO_STATUS_PATH = '/pico/status'
PICO_HEALTH_PATH = '/pico/health'
PICO_ON_PATH = '/pico/on'
PICO_CONFIG_PATH = '/pico/config'
PICO_LOGGING_PATH = '/pico/logging'
PICO_BREW_PATH = '/pico/brew'
PICO_TEMPERATURE_PATH = '/pico/temperature'
PICO_REF_TEMPERATURE_PATH = '/pico/ref-temperature'
DEVICES_STATUS_PATH = '/devices/status'


def get_device_response(device_number):
    """
    Returns the device status for a given device.
    :param device_number: the device number as string.
    :return: the device status object or null, if an invalid device number was given.
    """
    if device_number == '0':
        return DeviceStatus(device_number, relais_io.value())
    elif device_number == '1':
        return DeviceStatus(device_number, relais_pump.value())
    elif device_number == '2':
        return DeviceStatus(device_number, relais_heat.value())
    elif device_number == '3':
        return DeviceStatus(device_number, tank_toggle.value())
    else:
        print("No device with number " + str(device_number) + " exists!")


def set_device_status(device_status):
    """
    Sets the actual status of a device attached to the pico based on the given device status.
    :param device_status: the new device status.
    :return: the actual device status after the update.
    """
    if device_status.device_number == '0':
        Pin(5, Pin.OUT, value=device_status.value)
        return DeviceStatus(device_status.device_number, relais_io.value())
    elif device_status.device_number == '1':
        Pin(9, Pin.OUT, value=device_status.value)
        return DeviceStatus(device_status.device_number, relais_pump.value())
    elif device_status.device_number == '2':
        Pin(13, Pin.OUT, value=device_status.value)
        return DeviceStatus(device_status.device_number, relais_heat.value())
    else:
        print("No device with number " + str(device_status.device_number) + " exists!")


async def serve_client(reader, writer):
    """
    The main request handling methode for the pico, handling all incoming requests.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    request_line = await reader.readline()
    logger.request(str(request_line))

    request = str(request_line)
    request_method = httpUtils.get_request_method(request.lstrip())
    request_path = httpUtils.get_request_path(request.lstrip())

    if request_method == 'GET' and request_path == PICO_HEALTH_PATH:
        await handle_get_pico_health(reader, writer)

    elif request_method == 'GET' and request_path == PICO_STATUS_PATH:
        await handle_get_pico_status(reader, writer)

    elif request_method == 'GET' and PICO_ON_PATH in request_path:
        await handle_get_pico_on(reader, writer)

    elif request_method == 'GET' and PICO_BREW_PATH in request_path:
        await handle_get_pico_brew(reader, request_path, writer)

    elif request_method == 'DELETE' and PICO_BREW_PATH in request_path:
        await handle_delete_pico_brew(reader, writer)

    elif request_method == 'GET' and PICO_TEMPERATURE_PATH in request_path:
        await handle_get_pico_temperature(reader, writer)

    elif request_method == 'GET' and PICO_REF_TEMPERATURE_PATH in request_path:
        await handle_get_pico_ref_temperature(reader, writer)

    elif request_method == 'GET' and DEVICES_STATUS_PATH in request_path:
        await handle_get_devices_status(reader, request_path, writer)

    elif request_method == 'PUT' and DEVICES_STATUS_PATH in request_path:
        await handle_put_device_status(reader, writer)

    elif request_method == 'PUT' and PICO_CONFIG_PATH in request_path:
        await handle_put_pico_config(reader, writer)

    elif request_method == 'GET' and PICO_CONFIG_PATH in request_path:
        await handle_get_pico_config(reader, writer)

    else:
        await read_complete_request(reader)
        writer.write('HTTP/1.0 418 \r\n\r\n')

    await writer.drain()
    await writer.wait_closed()
    logger.request('Request finished: ' + request_path)


async def handle_get_devices_status(reader, request_path, writer):
    """
    Handles the get device status request and returns an array containing the status of all attached devices.
    :param request_path:
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    await read_complete_request(reader)
    if request_path == DEVICES_STATUS_PATH:
        # return status for all devices
        device_1_status = get_device_response('0')
        device_2_status = get_device_response('1')
        device_3_status = get_device_response('2')
        device_4_status = get_device_response('3')
        status = [device_1_status, device_2_status, device_3_status, device_4_status]
        response = httpUtils.write_array_response(status)
    else:
        # get the id for the requested device
        device_id = request_path[request_path.rindex('/') + 1:]
        status = get_device_response(device_id)
        response = httpUtils.write_response(status)
    writer.write('HTTP/1.0 200 OK\r\nContent-type: application/json\r\n\r\n')
    writer.write(response)


async def handle_get_pico_ref_temperature(reader, writer):
    """
    Handles the GET pico reference temperature request.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    await read_complete_request(reader)
    current_temp = Temperature(measure_temp(temp_sensor_resolution, pin_sensor_ref))
    writer.write('HTTP/1.0 200 OK\r\nContent-type: application/json\r\n\r\n')
    writer.write(json.dumps(current_temp.__dict__))


async def handle_get_pico_temperature(reader, writer):
    """
    Handles the GET pico temperature request.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    await read_complete_request(reader)
    current_temp = Temperature(measure_temp(temp_sensor_resolution, pin_sensor_tank))
    writer.write('HTTP/1.0 200 OK\r\nContent-type: application/json\r\n\r\n')
    writer.write(json.dumps(current_temp.__dict__))


async def handle_put_device_status(reader, writer):
    """
    Handles the PUT device status request and changes the device status on the pico accordingly.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    data = await reader.read(300)
    data_array = str(data).split('\\r\\n')
    parsed_request_body = data_array[-1].replace('\\n', '').replace('    ', '').replace('\'', '')
    body_as_json = json.loads(parsed_request_body)
    request_body_object = DeviceStatus(body_as_json['device_number'], body_as_json['value'])
    new_status = set_device_status(request_body_object)

    write_toggle_message(new_status)
    writer.write('HTTP/1.0 200 OK\r\nContent-type: application/json\r\n\r\n')
    writer.write(httpUtils.write_response(new_status))


async def handle_put_pico_config(reader, writer):
    """
    Handles the PUT pico config request, which updates the current config on the pico and updates the config.json.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    data = await reader.read(900)
    data_array = str(data).split('\\r\\n')
    parsed_request_body = data_array[-1].replace('\\n', '').replace('    ', '').replace('\'', '')
    body_as_json = json.loads(parsed_request_body)
    CURRENT_CONFIG.mqtt = body_as_json['mqtt']
    CURRENT_CONFIG.mqtt_topic = body_as_json['mqttTopic']
    CURRENT_CONFIG.mqtt_ip = body_as_json['mqttIp']
    CURRENT_CONFIG.request_logging = body_as_json['requestLogging']
    CURRENT_CONFIG.pid_logging = body_as_json['pidLogging']
    CURRENT_CONFIG.pid_control_logging = body_as_json['pidControlLogging']
    CURRENT_CONFIG.info_logging = body_as_json['infoLogging']

    CURRENT_CONFIG.idle_time = float(body_as_json['idleTime'])
    CURRENT_CONFIG.single_brew_time = float(body_as_json['singleBrewTime'])
    CURRENT_CONFIG.double_brew_time = float(body_as_json['doubleBrewTime'])
    CURRENT_CONFIG.brew_temp = float(body_as_json['brewTemp'])
    CURRENT_CONFIG.pid_KP = float(body_as_json['pidKP'])
    CURRENT_CONFIG.pid_KI = float(body_as_json['pidKI'])
    CURRENT_CONFIG.pid_KD = float(body_as_json['pidKD'])

    if print_to_console is True:
        print(str(CURRENT_CONFIG.__dict__))
    config_helper.write_config(CURRENT_CONFIG)
    config_helper.read_config()

    writer.write('HTTP/1.0 200 OK\r\nContent-type: application/json\r\n\r\n')
    writer.write(httpUtils.write_response(CURRENT_CONFIG))


async def handle_get_pico_config(reader, writer):
    """
    Handles the GET pico config request.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    await read_complete_request(reader)

    writer.write('HTTP/1.0 200 OK\r\nContent-type: application/json\r\n\r\n')
    writer.write(json.dumps(config.CURRENT_CONFIG.__dict__))


async def handle_get_pico_brew(reader, request_path, writer):
    """
    Handles the GET pico brew request and starts brewing coffee.
    :type request_path: the complete request path as string to determine the brewing type.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    await read_complete_request(reader)
    brew_type = request_path[request_path.rfind('=') + 1:]
    brew_coffee(brew_type)
    writer.write('HTTP/1.0 200 OK\r\nContent-Length: 0\r\n\r\n')


async def handle_delete_pico_brew(reader, writer):
    """
    Handles the DELETE pico brewing request and cancels the brewing process respectively.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    await read_complete_request(reader)
    cancel_brewing()
    writer.write('HTTP/1.0 200 OK\r\nContent-Length: 0\r\n\r\n')


async def handle_get_pico_on(reader, writer):
    """
    Handles the GET pico on request.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    await read_complete_request(reader)
    # set parameters to the PIDController object
    tunings = (config.CURRENT_CONFIG.pid_KP, config.CURRENT_CONFIG.pid_KI, config.CURRENT_CONFIG.pid_KD)
    brew_temp = config.CURRENT_CONFIG.brew_temp

    config.pid_controller = PID(tunings[0], tunings[1], tunings[2], setpoint=brew_temp, scale='ms')

    log_message = "Started PID with values: kp=" + str(config.CURRENT_CONFIG.pid_KP) + " ki=" + str(
        config.CURRENT_CONFIG.pid_KI) + " kd=" + str(config.CURRENT_CONFIG.pid_KD)
    logger.pid(log_message)
    if print_to_console is True:
        print(log_message)
    logger.pid('Desired temperature is: ' + str(brew_temp))
    status = set_device_status(DeviceStatus('0', 1))
    write_toggle_message(status)
    writer.write('HTTP/1.0 200 OK\r\nContent-type: application/json\r\n\r\n')
    writer.write(httpUtils.write_response(status))


async def handle_get_pico_health(reader, writer):
    """
    Handles the GET pico health request.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    await read_complete_request(reader)
    writer.write('HTTP/1.0 200 OK\r\nContent-Length: 0\r\n\r\n')


async def handle_get_pico_status(reader, writer):
    """
    Handles the GET pico status request.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    await read_complete_request(reader)
    device_1_status = get_device_response('0')
    device_2_status = get_device_response('1')
    device_3_status = get_device_response('2')
    device_4_status = get_device_response('3')
    status = [device_1_status, device_2_status, device_3_status, device_4_status]
    pico_status = PicoStatus(status, rtc.datetime())
    writer.write('HTTP/1.0 200 OK\r\nContent-type: application/json\r\n\r\n')
    writer.write(str(pico_status.to_json()))


async def read_complete_request(reader):
    """
    Reads the complete request read buffer.
    :param reader: the read buffer of the current request.
    """
    while await reader.readline() != b"\r\n":
        pass


def write_toggle_message(new_status):
    """
    Writes the toggle message to the pico's terminal.
    :param new_status: the new status of a device.
    """
    if print_to_console is True:
        toggled_str = ' turned on!'
        print('new value: ' + str(new_status.value))
        if new_status.value == 0:
            toggled_str = ' turned off!'

        if new_status.device_number == '0':
            print('Device on PIN 5 is now' + toggled_str)
        elif new_status.device_number == '1':
            print('Device on PIN 9 is now' + toggled_str)
        elif new_status.device_number == '2':
            print('Device on PIN 13 is now' + toggled_str)
        else:
            print("No device with number " + str(new_status.device_number) + " exists!")


def brew_coffee(brew_type):
    """
    Brews coffee based on the given type and the configured brewing times.
    :param brew_type: the type of the brewing being either single or double.
    """
    global brew_duration, brew_start_time

    if brew_type == 'single':
        brew_duration = float(config.CURRENT_CONFIG.single_brew_time) * 1000
    else:
        brew_duration = float(config.CURRENT_CONFIG.double_brew_time) * 1000

    brew_start_time = utime.ticks_ms()


def cancel_brewing():
    """
    Cancels the current brewing process by turning the pump off.
    """
    global brew_start_time, brew_duration
    brew_start_time = -1
    brew_duration = -1
    Pin(config.pin_pump, Pin.OUT, value=0)


def read_raw_temp(sensor_pin):
    """
    Read and return the temperature of one DS18x20 device.
    Pass the 8-byte bytes object with the ROM of the specific device you want to read.
    If only one DS18x20 device is attached to the bus you may omit the rom parameter.
    :param sensor_pin: the sensors pin.
    """
    dat = Pin(sensor_pin)
    ds = DS18X20(onewire.OneWire(dat))
    roms = ds.scan()

    rom = roms[0]

    ow = onewire.OneWire(dat)
    ow.reset()
    ow.select_rom(rom)
    ow.writebyte(0x44)  # Convert Temp


def measure_temp(resolution, sensor_pin, last_temp=0):
    """
    Measures the temperature of a temperature sensor connected to the given pin. In case the sensor is still busy
    converting temperature we simply return the last measured temperature as a workaround
    :param resolution: the sensor resolution.
    :param sensor_pin: the sensor pin at the pico.
    :param last_temp: the last measured temperature.
    :return:
    """
    try:
        read_raw_temp(sensor_pin)
        dat = Pin(sensor_pin)
        ds = DS18X20(onewire.OneWire(dat))
        roms = ds.scan()
        boiler_rom = roms[0]

        config = b'\x00\x00\x7f'
        if resolution == 9:
            config = b'\x00\x00\x1f'
        if resolution == 10:
            config = b'\x00\x00\x3f'
        if resolution == 11:
            config = b'\x00\x00\x5f'
        ds.write_scratch(boiler_rom, config)

        return ds.read_temp(roms[0])

    except IndexError:
        print('Sensor still busy converting temperature. Skipping measure cycle.')
        return last_temp


