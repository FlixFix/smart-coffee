(pico)=
# Microcontroller code
⚠️ Code is not yet properly refactored!
The used microcontroller is a raspberry pi pico W. However, the code can also be used with any other microcontroller after changing the pico specific parts.

## Getting started
When initially connecting the flashed pico to the power, it will create an access point, which can be accessed using: **192.168.4.1:88**. The access point also provides the endpoint **/pico/wifi**, which lets you set the wifi credentials for your home network. This can be done using a PUT request like so:

```sh
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
* **GET /pico/status**: returns a _frontend/src/model/pico-status-dto.ts_ holding the current pico time and all the devices with the respective status
* **GET /pico/on**: turns the main cycle on, which results in starting the PID control such as starting the heating if necessary


* **GET /pico/brew**: Starts the brewing process either single or double depending on the given request parameter
* **DELETE /pico/brew**: Forces the stopping of the current brewing process


* **GET /pico/temperature**: returns a _frontend/src/model/temperature-dto.ts_ containing the current temperature of the boiler temperature sensor
* **GET /pico/ref-temperature**: returns a _frontend/src/model/temperature-dto.ts_ containing the current temperature of the reference temperature sensor


* **GET /pico/config**: returns a _frontend/src/model/pico-config-dto.ts_ containing the current config values stored on the pico.
* **PUT /pico/config**: accepts a _frontend/src/model/pico-config-dto.ts_ to configure the current pico config. The config values are stored in the config.json file on the pico.


* **GET /devices/status**: returns an array of _frontend/src/model/device-status-dto.ts_ containing the status of all the devices connected to the pico.
* **PUT /devices/status**: accepts a _frontend/src/model/device-status-dto.ts_ and sets the status of the device on the pico accordingly.


## Configuration
The main configuration variables for an initial setup are already set to proper values and should work out of the box. However, the following can be configured directly in the _pico/config.py_ file. The configurable values are:
### basic configuration
 * **print_to_console**: if true, the log output of the pico is also printed to the pico's console
 * **main_loop_delay**: the wait time between consequent main loop cycles. This has to account for the conversion time of the temperature within the temperature sensor based on the respective sensor resolution
 * **pid_pom**: If this is set to true, the PID controller uses proportional on measurement, which tries to avoid overshoot. See https://simple-pid.readthedocs.io/en/latest/user_guide.html#proportional-on-measurement for more information.
 * **PICO_AP_SSID**: The SSID for the pico before it has been connected to any WIFI network
 * **PICO_AP_PW**: The password to access the access point provided by the pico
 * **PICO_HOSTNAME**: The hostname under which the pico will show up in the local network
 * **mqtt_broker_ip**: The IP address of the mqtt broker, if you want to use this feature
 * **mqtt_broker_topic**: The topic for the messages delivered to the mqtt broker
 * **temp_sensor_resolution**: The resolution for the temperature sensors. The values can be 9, 10, 11, 12. The **main_loop_delay** has to be set accordingly. See the following table and [the sensor datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/ds18b20.pdf) for more detail.
 
| resolution  | conversion time (=**main_loop_delay**) |
|-------------|----------------------------------------|
| 9           | 93.75ms                                |
| 10          | 187.5ms                                |
| 11          | 375ms                                  |
| 12          | 750ms                                  |
* The default values for P, I, and D components such as the brewing temperature can also be configured.
* **cold_start_threshold**: Temperature threshold for detecting a cold start of the machine (if temp_tank-temp_ref < threshold -> coldstart)
* **cold_start_temp_diff**: In case of a detected coldstart the PID values will be reset, when the tank temperature reaches a temperature difference of this value from the brewing temperature temperature

### pin configuration
* **pin_io**: The pin number of the pin used to turn on and off the machine
* **pin_pump**: The pin number of the pin used to turn on and off the pump (brewing)
* **pin_heat**: The pin number of the pin used to turn on and off the heating
* **pin_tank**: The pin number of the pin used to determine the sensor status inside the water tank
* **pin_sensor_tank**: The pin number of the pin used for the tank temperature sensor
* **pin_sensor_ref**: The pin number of the pin used for the reference temperature sensor

### PID control
The PID control works based on the configurable P, I, and D values. Besides, a crude cold-start detection is implemented based on **cold_start_threshold** and **cold_start_temp_diff**.
These values can only be configured by flashing the PICO software. When the tank temperature has a difference >= **cold_start_threshold**, a cold start is detected by the software. In this case the machine will keep heating up until the tank temperature is within a range of **cold_start_temp_diff** from the anticipated brewing temperature and then reset the pid. This results in a pretty smooth temperature curve and very short heating times of the machine up to reaching the anticipated brewing temperature.

## Logging
The logging can take place at two different stages depending on your needs
* print to the pico console if configured
* send log messages via MQTT if configured

Any combination of the both is possible.

Further errors are logged to a day specific error.log file in order to help with debugging.

