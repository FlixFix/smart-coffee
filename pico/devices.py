import json


class DeviceStatus:
    def __init__(self, device_number, value):
        self.device_number = device_number
        self.value = value

    def jsonable(self):
        return self.__dict__


class Temperature:
    def __init__(self, temp):
        self.temp = temp


class PicoStatus:
    def __init__(self, devices, system_time):
        self.devices = devices
        self.system_time = str(system_time)

    def to_json(self):
        return json.dumps(dict(system_time=self.system_time, devices=[ob.__dict__ for ob in self.devices]))
