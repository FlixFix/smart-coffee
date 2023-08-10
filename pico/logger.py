from umqtt.simple import MQTTClient
import os
import config

# ---------------------------------------------------
# logging
# ---------------------------------------------------

# this ensures, that errors are logged to a logfile
# in case the pico crashes ->
# duplicate stdout and stderr to the log file
year = config.rtc.datetime()[0]
month = config.rtc.datetime()[1]
day = config.rtc.datetime()[2]
logFile = str(year) + '-' + str(month) + '-' + str(day) + '_error.log'
logfile = open(logFile, 'w')
os.dupterm(logfile)


def info(message):
    if config.CURRENT_CONFIG.info_logging is True:
        if config.print_to_console is True:
            print('[' + get_date_time() + ']: ' + message)
        send_log_to_backend(message)


def pid(message):
    if config.CURRENT_CONFIG.pid_logging is True:
        if config.print_to_console is True:
            print('[' + get_date_time() + ']: ' + message)
        send_log_to_backend(message)


def pid_control(current_temp, pid_output):
    if config.CURRENT_CONFIG.pid_control_logging is True:
        message = 'current temperature: ' + str(current_temp) + ' - pid_output: ' + str(pid_output)
        if config.print_to_console is True:
            print('[' + get_date_time() + ']: ' + message)
        send_log_to_backend('temp=' + str(current_temp) + '$$pid_output=' + str(pid_output))


def request(message):
    if config.CURRENT_CONFIG.request_logging is True:
        if config.print_to_console is True:
            print('[' + get_date_time() + ']: ' + message)
        send_log_to_backend(message)


def get_date_time():
    timestamp = config.rtc.datetime()
    timestring = "%04d-%02d-%02d %02d:%02d:%02d" % (timestamp[0:3] +
                                                    timestamp[4:7])
    return timestring


def send_log_to_backend(message):
    if config.CURRENT_CONFIG.mqtt is True:
        try:
            client = mqtt_connect()
            client.publish(config.CURRENT_CONFIG.mqtt_topic, message)
            client.disconnect()
        except OSError:
            print('Fehler: Keine MQTT-Verbindung')


def mqtt_connect():
    client = MQTTClient('', config.CURRENT_CONFIG.mqtt_ip)
    client.connect()
    return client
