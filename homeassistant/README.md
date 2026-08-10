# Home Assistant integration

The backend announces the coffee machine to Home Assistant over MQTT discovery. Home Assistant creates the device and
all of its entities on its own - **no YAML needed on the Home Assistant side**.

## Setup

1. **Broker** - in Home Assistant: *Settings → Add-ons → Add-on Store → Mosquitto broker*, install and start it.
   Then *Settings → Devices & Services → Add Integration → MQTT*, point it at the broker.
   Create a Home Assistant user for the backend (*Settings → People → Users*) if the broker requires login.
2. **Backend** - set the broker address and credentials in `backend/.env`:
   ```
   MQTT_BROKER_IP=<home assistant ip>
   MQTT_BROKER_PORT=1883
   MQTT_USERNAME=<user>
   MQTT_PASSWORD=<password>
   ```
3. Restart the backend. The log shows `Published Home Assistant discovery for 17 entities.`
4. The machine appears under *Settings → Devices & Services → MQTT → Coffee Hub*. Add it to a dashboard from there.

## Entities

| Entity | Type | Notes |
|---|---|---|
| Coffee machine | switch | On goes through `/pico/on`, so the PID is rebuilt from the current config and the idle auto-off timer starts |
| Pump | switch | Manual pump control, counts towards the coffee counter like the frontend does |
| Scheduled start | switch | Toggles the backend scheduler (`scheduled` in the config) |
| Brew single / double shot | button | Same brew times as the frontend |
| Cancel brewing | button | Force-stops the pump |
| Brewing / Heating | binary sensor | Live pump and heater relais state |
| Water tank | binary sensor | `problem` class - on means refill (any non-zero value on the tank pin) |
| Boiler / Reference temperature | sensor | Boiler every cycle, reference every 6th cycle |
| On since | sensor | Timestamp the machine was switched on, drives the idle auto-off |
| Coffees brewed | sensor | Total counter from `log/stats.json` |
| Target temperature | number | Writes `brewTemp` and pushes the merged config to the pico |
| Single / Double shot time | number | Writes `singleBrewTime` / `doubleBrewTime` |
| Idle switch-off | number | Writes `idleTime` (minutes) |

## How it works

* State is polled from the pico **once** every `HA_STATE_INTERVAL_MS` (default 10 s) and published as a single retained
  JSON message on `coffee-hub/state`; every entity reads its value from that one message. Home Assistant never talks to
  the pico directly - the pico runs its PID loop and its webserver on one asyncio event loop, so each extra poller
  competes with temperature control. Don't lower the interval much below 10 s.
* Commands arrive on `coffee-hub/command/#` and are translated into the same service calls the REST API uses, so the
  on-timer, the idle auto-off and the coffee counter behave identically no matter whether you use Home Assistant, the
  web frontend or the REST API.
* Availability is published on `coffee-hub/availability`. The backend registers it as an MQTT last will, so entities
  grey out when the backend dies, and it flips to `offline` on its own when the pico stops answering.
* Only `brewTemp`, `singleBrewTime`, `doubleBrewTime` and `idleTime` are writable over MQTT. The wlan credentials in
  the config file can't be changed or read this way.

## Without MQTT: REST fallback

`smart-coffee.yaml` is a Home Assistant package that talks to the backend's REST API instead. It needs no broker but
has to be copied into the Home Assistant config by hand, polls more, and can't change the config. Use the MQTT route
unless you have a reason not to.
