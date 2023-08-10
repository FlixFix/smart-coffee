# 🖥️ Frontend code
The frontend is a basic react app optimised and only properly working on a smartphone since it relies on swipe gestures. However, for local testing or development, switching the device mode to tablet or smartphone in the browser also works.
Navigation is handled through a slide-out side-panel, which can simply be slid out using a sliding gesture to the right side of the screen.

## Configuration
The following values can be configured in the frontend [.env](.env) file:
* **REACT_APP_BACKEND_IP**: defines the IP address of the backend. This should be localhost, if the backend and the frontend run on the same machine.
* **REACT_APP_READY_DERIVATION**: Maximum derivation of the temperature from the desired temperature for a ready status to show on the dashboard. (Defaults to 3°C)
* **REACT_APP_OPTIMAL_DERIVATION**: Maximum derivation of the temperature from the desired temperature for a optimal status to show on the dashboard. (Defaults to 0.5°C)

## App structure

### Dashboard
<table>
<tr>
<td style='width: 50%'>

![IMG_5020.PNG](..%2Fassets%2Fscreenshots%2FIMG_5020.PNG)
</td>
<td>
The Dashboard component is the entry point of the application as handles brewing coffee, such as turning the machine on and off. It also gives information about the brewing process, the temperature, the state of the heating, and shows an alert in case the water tank needs refilling.
</td>
</tr>
</table>

### Zubereitung (Recipe)
<table>
<tr>
<td style='width: 50%'>

![IMG_5021.PNG](..%2Fassets%2Fscreenshots%2FIMG_5021.PNG)
</td>
<td>
The recipe component allows setting the desired brewing temperature, which is then also used for the pid controller such as setting times for the single and double shot brewing once you dialed in your coffee beans for more convenience.
</td>
</tr>
</table>


### Zeitsteuerung (Calendar)
<table>
<tr>
<td style='width: 50%'>

![IMG_5021.PNG](..%2Fassets%2Fscreenshots%2FIMG_5022.PNG)
</td>
<td>
The calendar page allows for setting up a schedule for turning on and off the coffee machine on certain days and on certain times as well as defining a idle time, after which the coffee machine will turn itself off.
</td>
</tr>
</table>


### PID
<table>
<tr>
<td style='width: 50%'>

![temperature_curve.gif](..%2Fassets%2Fanimations%2Ftemperature_curve.gif)
</td>
<td>
The PID component lets you set the various parameters for the PID controller and also shows a relatime graph of the current temperature as well as showing the state of the heating.
</td>
</tr>
</table>


### Pico Config
<table>
<tr>
<td style='width: 50%'>

![IMG_5021.PNG](..%2Fassets%2Fscreenshots%2FIMG_5023.PNG)
</td>
<td>
The pico config page lets you configure the different logging levels for the pico as well as setting up a MQTT topic such as a MQTT broker IP.
</td>
</tr>
</table>


### About
<table>
<tr>
<td style='width: 50%'>

![IMG_5021.PNG](..%2Fassets%2Fscreenshots%2FIMG_5023.PNG)
</td>
<td>
This page shows information about the current version of the software such as the author.
</td>
</tr>
</table>
