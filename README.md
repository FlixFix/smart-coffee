![logo_coffee_hub.png](assets%2Flogo_coffee_hub.png)

# ☕️ What is this about
This app adds IoT to a Rancilio Silvia espresso machine. However, it can also be used for any other kind of single-circuit coffee machine or be extended for individual requirements. The software is based on three parts:

* The microcontroller software written in micro-python, since the used microcontroller is a raspberry pico w.
* The backend application in form of a Node.js application handling communication between the frontend and the microcontroller and doing some configuration and automation handling. 
* The frontend react app providing an easy user interface for the smart control of the coffee machine.

## 🍬 Main features

The main features of this setup are:
* timed switching on and off of the Rancilio Silvia also based on a configurable schedule.
* auto switch-off of the Rancilio Silvia after a given idle-time.
* fully configurable PID controller for controlling and keeping a consistent brewing temperature of the Rancilio Silvia.
* configuration and setup of two different brewing times (single and double shot), such as a cleaning function for cleaning the brew group after brewing.
* various monitoring settings and functions for temperature and microcontroller events.
* connection to an MQTT broker for logging the microcontroller events.

# ☕️ Documentation
The documentation within the code is not yet properly, since this project is only used for personal use. However, I tried to include very detailed READMEs in order to account for missing code comments. These files for the components can be found under:
* For the pico: [README.md](pico%2FREADME.md)
* For the backend: [README.md](backend%2FREADME.md)
* For the frontend: [README.md](frontend%2FREADME.md)
* For the evaluation script: [README.md](eval%2FREADME.md)

# ☕️ Setup
The microcontroller resides inside the Rancilio Silvia and has the following devices connected:

* a relais, which handles turning on and off the machine
* a relais, which handles turning on and off the heating of the machine
* a temperature sensor measuring the temperature at the boiler (this replaces the original temperature sensor, which is used for controlling the brewing temperature inside the Rancilio Silvia)
* another temperature sensor, which acts as a reference temperature sensor to account for a cold start of the machine and therefore different PID values in contrast to an already running machine

The backend and frontend, such as an MQTT broker are hosted on a local network server.

# ☕️ Deploying new versions
To easily deploy new versions of the backend and frontend the [deployment folder](deployment) contains a respective script. By running the script with the respective -hotfix, -minor, or -major options, the respective part of the version is updated based on the current version. The current version is stored in the [.env](frontend%2F.env) of the frontend split in the parts:
* **REACT_APP_APP_MAJOR_VERSION**
* **REACT_APP_APP_MINOR_VERSION**
* **REACT_APP_APP_HOTFIX_VERSION**

In order to use the deployment script on another machine, the ssh configuration of the script has to be adjusted according to your setup. Also, note that I am running this application as a linux service on my server, so that the script also restarts the service after a new version is deployed (One-Click Deployment 🤩). The script can be used like so:

```shell
/bin/bash ./deploy-to-homepod.sh major
```
I created respective IntelliJ configurations to run the command with either major, minor, or hotfix based on the configuration, which makes deployments even easier.

# ☕️ Additional content

In order to evaluate the PID controller such as tuning it properly an evaluation routine has been added, which parses the logs derived from the MQTT broker and displays resulting temperature curves for any number of control cycles.

# ☕️ Space for improvement
This is my first time working with microcontrollers and also Node.js, therefore in the development process I already got a lot of ideas for various improvements, which are:
* refactor the web server on the pico to use an actual web server library, which is provided by asyncio
* do not store configuration on the pico and the backend, do this solely on the pico
* let the pico then handle turning on and off the machine based on idle time, which also reduces the complexity in the backend code
* Remove the web socket between frontend and backend and let the frontend directly communicate with the MQTT broker

I am happy for any contributions and critics!