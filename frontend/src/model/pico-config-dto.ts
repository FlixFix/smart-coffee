/**
 * DTO used for handling the pico config.
 */
export interface PicoConfigDto {
    /**
     * If true all requests to the pico will be logged.
     */
    requestLogging: boolean
    /**
     * If true, all pid outputs from the pid controller on the pico will be logged.
     */
    pidLogging: boolean
    /**
     * If true, all pid controlling outputs on the pico will be logged.
     */
    pidControlLogging: boolean
    /**
     * If true, all infos on the pico will be logged.
     */
    infoLogging: boolean
    /**
     * If true, MQTT on the pico will be turned on.
     */
    mqtt: boolean
    /**
     * Defines the mqtt topic used for the mqtt broker.
     */
    mqttTopic: string
    /**
     * Defines the IP of the mqtt broker.
     */
    mqttIp: string
    /**
     * The WLAN PW - NOT USED BY PICO!
     */
    wlanPw: string
    /**
     * The WLAN SSID - NOT USED BY THE PICO!
     */
    wlanSsid: string
    /**
     * If true, the backend on/off scheduler is working.
     */
    scheduled: boolean
    /**
     * Array containing all the days on which the coffee machine will be turned on automatically.
     */
    daysOn: number[]
    /**
     * Array containing all the times at which the coffee machine will be turned on automatically.
     */
    timesOn: string[]
    /**
     * Defining the time, after which the machine will turn off automatically.
     */
    idleTime: number
    /**
     * Set brewing time for a single shot.
     */
    singleBrewTime: number
    /**
     * Set brewing time for a double shot.
     */
    doubleBrewTime: number
    /**
     * Brewing temperature used by the PID controller.
     */
    brewTemp: number
    /**
     * P constant of the PID controller.
     */
    pidKP?: number
    /**
     * I constant of the PID controller.
     */
    pidKI?: number
    /**
     * D constant of the PID controller.
     */
    pidKD?: number
}