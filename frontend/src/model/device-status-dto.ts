/**
 * DTO used for the status of a device attached to the pico.
 */
export interface DeviceStatusDto {
    /**
     * The value of the device: 0 = off , 1 = on.
     */
    value: number;
    /**
     * The number of the device.
     */
    device_number: string;
}