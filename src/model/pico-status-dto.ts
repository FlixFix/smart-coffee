import {DeviceStatusDto} from "./device-status-dto";

export interface PicoStatusDto {
    systemTime: string,
    devices: DeviceStatusDto[];
}