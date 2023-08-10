import {DeviceStatusDto} from "./device-status-dto";

/**
 * DTO used for the current pico status.
 */
export interface PicoStatusDto {
    /**
     * The current pico status time.
     */
    systemTime: string;
    /**
     * Array containing the status of all the devices attached to the pico.
     */
    devices: DeviceStatusDto[];
}