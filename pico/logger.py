from umqtt.simple import MQTTClient
from config import mqtt_broker_ip, mqtt_broker_topic, CURRENT_CONFIG, rtc, print_to_console

# ---------------------------------------------------
# logging
# ---------------------------------------------------

def info(message):
    if CURRENT_CONFIG.info_logging is True:
        if print_to_console is True:
            print('[' + get_date_time() + ']: ' + message)
        send_log_to_backend(message)


def pid(message):
    if CURRENT_CONFIG.pid_logging is True:
        if print_to_console is True:
            print('[' + get_date_time() + ']: ' + message)
        send_log_to_backend(message)


def pid_control(current_temp, pid_output):
    if CURRENT_CONFIG.pid_control_logging is True:
        message = 'current temperature: ' + str(current_temp) + ' - pid_output: ' + str(pid_output)
        if print_to_console is True:
            print('[' + get_date_time() + ']: ' + message)
        send_log_to_backend('temp=' + str(current_temp) + '$$pid_output=' + str(pid_output))


def request(message):
    if CURRENT_CONFIG.request_logging is True:
        if print_to_console is True:
            print('[' + get_date_time() + ']: ' + message)
        send_log_to_backend(message)


def get_date_time():
    timestamp = rtc.datetime()
    timestring = "%04d-%02d-%02d %02d:%02d:%02d" % (timestamp[0:3] +
                                                    timestamp[4:7])
    return timestring


def send_log_to_backend(message):
    if CURRENT_CONFIG.mqtt is True:
        try:
            client = mqtt_connect()
            client.publish(mqtt_broker_topic, message)
            client.disconnect()
        except OSError:
            print('Fehler: Keine MQTT-Verbindung')


def mqtt_connect():
    client = MQTTClient('', mqtt_broker_ip)
    client.connect()
    return client
