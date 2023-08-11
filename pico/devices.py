import json


class DeviceStatus:
    def __init__(self, device_number, value):
        """
        Creates a new device status object containing the device number as string as well as the current value.
        :param device_number: the number of the device as string.
        :param value: the current value of the device either 0 (off), or 1 (on).
        """
        self.device_number = device_number
        self.value = value


class Temperature:
    def __init__(self, temp):
        """
        Creates a new temperature object.
        :param temp: the current temperature as float.
        """
        self.temp = temp


class PicoStatus:
    def __init__(self, devices, system_time):
        """
        Object containing the status of all the devices attached to the pico.
        :param devices: array containing all the device status.
        :param system_time: the current pico system time.
        """
        self.devices = devices
        self.system_time = str(system_time)

    def to_json(self):
        """
        Converts the pico status object to a json string.
        :return: the pico status object as json string.
        """
        return json.dumps(dict(system_time=self.system_time, devices=[ob.__dict__ for ob in self.devices]))
