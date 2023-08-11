import json

import config_helper
import httpUtils
import logger
import wifi
from config import CURRENT_CONFIG, print_to_console

PICO_WIFI = '/pico/wifi'


async def serve_client(reader, writer):
    """
    The main client serving methode, providing the configured access point for inducing network ssid and pw to the pico.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    request_line = await reader.readline()
    logger.request(str(request_line))

    request = str(request_line)
    request_method = httpUtils.get_request_method(request.lstrip())
    request_path = httpUtils.get_request_path(request.lstrip())

    if request_method == 'PUT' and PICO_WIFI in request_path:
        await handle_put_pico_wifi(reader, writer)
    else:
        while await reader.readline() != b"\r\n":
            pass
        writer.write('HTTP/1.0 418 \r\n\r\n')

    await writer.drain()
    await writer.wait_closed()
    logger.request('Request finished: ' + request_path)


async def handle_put_pico_wifi(reader, writer):
    """
    Handles the put request for configuring the ssid and pw of the local network.
    :param reader: the read buffer of the current request.
    :param writer: the write buffer of the current response.
    """
    data = await reader.read(300)
    data_array = str(data).split('\\r\\n')
    parsed_request_body = data_array[-1].replace('\\n', '').replace('    ', '').replace('\'', '')
    body_as_json = json.loads(parsed_request_body)
    CURRENT_CONFIG.wlan_pw = body_as_json['wlan_pw']
    CURRENT_CONFIG.wlan_ssid = body_as_json['wlan_ssid']

    if print_to_console is True:
        print(str(CURRENT_CONFIG.__dict__))
    config_helper.write_config(CURRENT_CONFIG)

    # try to reconnect to the network
    wifi.connect_to_network()

    writer.write('HTTP/1.0 200 OK\r\nContent-type: application/json\r\n\r\n')
    writer.write(httpUtils.write_response(CURRENT_CONFIG))
