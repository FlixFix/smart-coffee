export interface PicoConfigDto {
    request_logging: boolean
    pid_logging: boolean
    pid_control_logging: boolean
    info_logging: boolean
    mqtt: boolean
    mqtt_topic: string
    mqtt_ip: string
    wlan_pw: string
    wlan_ssid: string
}