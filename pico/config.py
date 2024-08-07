import network
from PID import PID
from machine import Pin, RTC

idle = 60  # default idle time
single_brew = 15  # default brew time for a single shot
double_brew = 28  # default brew time for a double shot
temp = 93  # default brewing temperature

# debugging -----------------------------------------
print_to_console = True
main_loop_delay = 0.25
pid_pom = False
# ---------------------------------------------------

# ssid and password for the access point ------------
PICO_AP_SSID = "SmartCoffee Pico"
PICO_AP_PW = "iWantCoffee"
PICO_HOSTNAME = "Rancilio-Silvia"
# ---------------------------------------------------

# the ip used for the mqtt connection ---------------
mqtt_broker_ip = '192.168.178.86'
mqtt_broker_topic = b"pico_log"
# ---------------------------------------------------

# relais --------------------------------------------
pin_io = 5
pin_pump = 9
pin_heat = 13
pin_tank = 22
# ---------------------------------------------------

# temperature sensors -------------------------------
pin_sensor_tank = 16
pin_sensor_ref = 21
temp_sensor_resolution = 10
# ---------------------------------------------------

# setup devices, network and real time clock --------
relais_io = Pin(pin_io, Pin.OUT, value=0)  # i/o
relais_pump = Pin(pin_pump, Pin.OUT, value=0)  # pump
relais_heat = Pin(pin_heat, Pin.OUT, value=0)  # heat
tank_toggle = Pin(pin_tank, Pin.IN, Pin.PULL_UP)  # tank pin

wlan = network.WLAN(network.STA_IF)
rtc = RTC()
# ---------------------------------------------------

# PID -----------------------------------------------
kP = 48
kI = 0.192
kD = 2880
brewTemp = 90
pid_controller = PID(kP, kI, kD, setpoint=brewTemp, scale='ms')
pid_controller.proportional_on_measurement = pid_pom

cold_start_threshold = 20  # if temp_tank-temp_ref < threshold -> coldstart
cold_start_temp_diff = 15  # if temp_soll - temp_tank < diff -> reset PID for coldstart

# ---------------------------------------------------


class CONFIG:
    def __init__(self, request=True, pid=True, pid_control=True, info=True, mqtt_connect=False, mqtt_ip=mqtt_broker_ip,
                 mqtt_topic=mqtt_broker_topic, idle_time=idle, single_brew_time=single_brew,
                 double_brew_time=double_brew, brew_temp=temp,
                 pid_KP=kP, pid_KI=kI, pid_KD=kD):
        """
        Creates a new config object, which is the used throughout the application to handle configuration values.
        :param request: if true, requests are logged.
        :param pid: if true, pid information is logged.
        :param pid_control: if true, pid output values etc. are logged.
        :param info: if true, infos are logged.
        :param mqtt_connect: if true, mqtt is turned on.
        :param mqtt_ip: the IP address of the mqtt broker machine.
        :param mqtt_topic: the topic for the MQTT messaging.
        :param idle_time: the idle time of the machine after which it will turn off automatically (no effect here - handled by the backend)
        :param single_brew_time: the brewing time for a single shot.
        :param double_brew_time: the brew time for a double shot.
        :param brew_temp: the brew temperature.
        :param pid_KP: the value for the P component of the controller.
        :param pid_KI: the value for the I component of the controller.
        :param pid_KD: the value for the D component of the controller.
        """
        self.request_logging = request
        self.pid_logging = pid
        self.pid_control_logging = pid_control
        self.info_logging = info
        self.mqtt = mqtt_connect
        self.mqtt_ip = mqtt_ip
        self.mqtt_topic = mqtt_topic
        self.wlan_pw = ''
        self.wlan_ssid = ''

        # prior coffee hub time
        self.idle_time = idle_time
        self.single_brew_time = single_brew_time
        self.double_brew_time = double_brew_time
        self.brew_temp = brew_temp
        self.pid_KP = pid_KP
        self.pid_KI = pid_KI
        self.pid_KD = pid_KD


CURRENT_CONFIG = CONFIG()
