# 📀 Backend code
## Summary
The backend is based on a Node.js app, which serves an express http web client. It provides basic functionality for communicating with the pico such as a web socket for sending mqtt log messages to the frontend (For some reason I couldn't get a direct communication between the frontend and the mqtt broker to work, so I used this dirty work around).
Further, the backend handles the monitoring of the on-timer of the Rancilio Silvia and turns the machine in case the set idle time is exceeded. (This is handled by the backend, since the pico loses its time information on reboot without a working internet connection, so doing this via the backend, which is somewhat more stable regarding RTC is the safer option)

## Initial startup
On the initial startup, the backend tries to do the following:
* set up a websocket for the frontend to broadcast the MQTT messages
* set up a MQTT connection to the MQTT broker
* send a request to **pico/health** in order to check, whether the pico is up and running and reachable. If this is the case, the current configured config either from [config.json](service%2Fconfig.json) or if none is present the [default_config.json](service%2Fdefault_config.json) is sent to the pico.

## The HTTP client
The included http client provides the following endpoints:
* **GET /coffee-hub/api/v1/pico-status**: returns a [pico-status-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Fpico-status-dto.ts) containing the current system time of the pico such as the status of all the connected devices.
* **GET /coffee-hub/api/v1/on-status**: returns a JSON object containing the current status of the machine based on the held on-timer of the backend.
* **GET /coffee-hub/api/v1/temperature**: returns a [temperature-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Ftemperature-dto.ts) containing the temperature of the main temperature sensor.
* **GET /coffee-hub/api/v1/reference-temperature**: returns a [temperature-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Ftemperature-dto.ts) containing the temperature of the reference temperature sensor.
* **GET /coffee-hub/api/v1/brew**: Starts the brewing process on the pico using the provided time by the query parameter as the brewing time.
* **DELETE /coffee-hub/api/v1/brew**: Forces the cancellation of the current brewing process.
* **PUT /coffee-hub/api/v1/devices**: Accepts a [device-status-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Fdevice-status-dto.ts) and sets the device's status on the pico accordingly. If the device is the main i/o connected device, this endpoint triggers the PID control on the pico.


* **PUT /coffee-hub/api/v1/config**: Accepts a [coffee-hub-config-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Fcoffee-hub-config-dto.ts), which holds the config for the backend, which is then stored in the [config.json](service%2Fconfig.json) of the backend and sent to the pico.
* **GET /coffee-hub/api/v1/config**: Returns a [coffee-hub-config-dto.ts](..%2Ffrontend%2Fsrc%2Fmodel%2Fcoffee-hub-config-dto.ts), which holds the config for the backend, which is based on the stored [config.json](service%2Fconfig.json) of the backend.
* **DELETE /coffee-hub/api/v1/config**: Deletes the current [config.json](service%2Fconfig.json) of the backend, which makes the config fall back to the [default_config.json](service%2Fdefault_config.json). The default config is then also sent to the pico.

## Configuration
The backend configuration is done through the [.env](.env). Following values can be configured:
* **PORT**: Which gives the backend port - default: 3001.
* **PICO_IP**: The IP address of the pico in the local network.
* **PICO_PORT**: The port of the web server served by the pico.
* **MQTT_BROKER_IP**: The IP address of the MQTT broker host.
* **MQTT_BROKER_PORT**: The port of the MQTT broker host.
* **MQTT_TOPIC**: The MQTT topic used for the application.
* **CLEAN_TIME**: The time used for the cleaning of the brew group.

## Logging
In case the MQTT broker is setup and the feature is activated on the PICO, every message received from the broker is logged by the backend in the [pico.log](log%2Fpico.log) (A different log file will be created for each day). The messages follow a custom log format, which is also included in this repository ([pico_custom_log_format.xml](..%2Fpico_custom_log_format.xml)) and can be imported into IntellJ in order to get colour coded and more manageable logs.