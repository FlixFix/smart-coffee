from machine import Pin, RTC
import network
from PID import PID

# debugging -----------------------------------------
print_to_console = True
main_loop_delay = 0.25
pid_pom = False
# ---------------------------------------------------

# ssid and password for the access point ------------
PICO_AP_SSID = "SmartCoffee Pico"
PICO_AP_PW = "iWantCoffee"
# ---------------------------------------------------

# the ip used for the mqtt connection ---------------
mqtt_broker_ip = '192.168.178.146'
mqtt_broker_topic = b"pico_log"
# ---------------------------------------------------

# relais --------------------------------------------
pin_io = 5
pin_pump = 9
pin_heat = 13
# ---------------------------------------------------

# temperature sensors
pin_sensor_tank = 16
pin_sensor_ref = 21
temp_sensor_resolution = 10
# ---------------------------------------------------

# setup devices, network and real time clock --------
relais_io = Pin(pin_io, Pin.OUT, value=0)  # i/o
relais_pump = Pin(pin_pump, Pin.OUT, value=0)  # pump
relais_heat = Pin(pin_heat, Pin.OUT, value=0)  # heat

wlan = network.WLAN(network.STA_IF)
rtc = RTC()
# ---------------------------------------------------

# PID -----------------------------------------------
kP = 80
kI = 0.45
kD = 100
brewTemp = 90
pid_controller = PID(kP, kI, kD, setpoint=brewTemp, scale='ms')
pid_controller.proportional_on_measurement = pid_pom
# ---------------------------------------------------


class CONFIG:
    def __init__(self, request=True, pid=True, pid_control=True, info=True, mqtt_connect=True, mqtt_ip=mqtt_broker_ip, mqtt_topic=mqtt_broker_topic):
        self.request_logging = request
        self.pid_logging = pid
        self.pid_control_logging = pid_control
        self.info_logging = info
        self.mqtt = mqtt_connect
        self.mqtt_ip = mqtt_ip
        self.mqtt_topic = mqtt_topic
        self.wlan_pw = ''
        self.wlan_ssid = ''


CURRENT_CONFIG = CONFIG()
