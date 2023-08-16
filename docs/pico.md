# 🕹️  Microcontroller code
⚠️ Code is not yet properly refactored!
The used microcontroller is a raspberry pi pico W. However, the code can also be used with any other microcontroller after changing the pico specifc parts.

## Getting started
When initially connecting the flashed pico to the power, it will create an access point, which can be accessed using: **192.168.4.1:88**. The access point also provides the endpoint **/pico/wifi**, which lets you set the wifi credetials for your home network. This can be done using a PUT request like so:

```shell
curl -X PUT http://192.168.4.1:88/pico/wifi
    -H "Content-Type: application/json" 
    -d '{
          "wlan_pw": "password",
          "wlan_ssid": "ssid"
        }'" 
```
or by using any other framework to fire http request. When the request was successful and the provided data is correct, the pico should automatically connect to the provided network (A successful connection will be indicated by a permanently shining LED).

On the initial startup, the pico will also write a config.json file, which then stores the config values of the pico configured through the app.

Once the pico is connected to the network provides the following endpoints:
* **GET /pico/health**: standard health endpoint, returns status code 200, if the pico is up and running
* **GET /pico/status**: returns a [pico-status-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Fpico-status-dto.ts) holding the current pico time and all the devices with the respective status
* **GET /pico/on**: turns the main cycle on, which results in starting the PID control such as starting the heating if necessary


* **GET /pico/brew**: Starts the brewing process either single or double depending on the given request parameter
* **DELETE /pico/brew**: Forces the stopping of the current brewing process


* **GET /pico/temperature**: returns a [temperature-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Ftemperature-dto.ts) containing the current temperature of the boiler temperature sensor
* **GET /pico/ref-temperature**: returns a [temperature-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Ftemperature-dto.ts) containing the current temperature of the reference temperature sensor


* **GET /pico/config**: returns a [pico-config-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Fpico-config-dto.ts) containing the current config values stored on the pico.
* **PUT /pico/config**: accepts a [pico-config-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Fpico-config-dto.ts) to configure the current pico config. The config values are stored in the config.json file on the pico.


* **GET /devices/status**: returns an array of [device-status-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Fdevice-status-dto.ts) containing the status of all the devices connected to the pico.
* **PUT /devices/status**: accepts a [device-status-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Fdevice-status-dto.ts) and sets the status of the device on the pico accordingly.


## Configuration
The main configuration variables for an initial setup are already set to proper values and should work out of the box. However, the following can be configured directly in the [config.py](config.py) file. The configurable values are:
### basic configuration
 * **print_to_console**: if true, the log output of the pico is also printed to the pico's console
 * **main_loop_delay**: the wait time between consequent main loop cycles. This has to account for the conversion time of the temperature within the temperature sensor based on the respective sensor resolution
 * **pid_pom**: If this is set to true, the PID controller uses proportional on measurement, which tries to avoid overshoot. See https://simple-pid.readthedocs.io/en/latest/user_guide.html#proportional-on-measurement for more information.
 * **PICO_AP_SSID**: The SSID for the pico before it has been connected to any WIFI network
 * **PICO_AP_PW**: The password to access the access point provided by the pico
 * **PICO_HOSTNAME**: The hostname under which the pico will show up in the local network
 * **mqtt_broker_ip**: The IP address of the mqtt broker, if you want to use this feature
 * **mqtt_broker_topic**: The topic for the messages delivered to the mqtt broker
 * **temp_sensor_resolution**: The resolution for the temperature sensors. The values can be 9, 10, 11, 12. The **main_loop_delay** has to be set accordingly. See the following table and [then sensor datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/ds18b20.pdf) for more detail.
 
| resolution  | conversion time (=**main_loop_delay**) |
|-------------|----------------------------------------|
| 9           | 93.75ms                                |
| 10          | 187.5ms                                |
| 11          | 375ms                                  |
| 12          | 750ms                                  |
* The default values for P, I, and D components such as the brewing temperature can also be configured.

### pin configuration
* **pin_io**: The pin number of the pin used to turn on and off the machine
* **pin_pump**: The pin number of the pin used to turn on and off the pump (brewing)
* **pin_heat**: The pin number of the pin used to turn on and off the heating
* **pin_sensor_tank**: The pin number of the pin used for the tank temperature sensor
* **pin_sensor_ref**: The pin number of the pin used for the reference temperature sensor


## Logging
The logging can take place at two different stages depending on your needs
* print to the pico console if configured
* send log messages via MQTT if configured

Any combination of the both is possible.

Further errors are logged to a day specific error.log file in order to help with debugging.

