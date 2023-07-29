import {DeviceStatusDto} from "../model/device-status-dto";
import axios from 'axios';
import {PicoStatusDto} from "../model/pico-status-dto";
import {BrewTypeEnum} from "../model/brew-type-enum";
import {CoffeeHubConfigDto} from "../model/coffee-hub-config-dto";
import {DateTime} from "luxon";
import {TemperatureDto} from "../model/temperature-dto";
const API_PATH = '/coffee-hub/api/v1';

class BackendService {
    static getMachineStatus(): Promise<PicoStatusDto> {
        return axios.get(`${API_PATH}/pico-status`)
            .then((response) => response.data)
            .catch((e) => {console.log(e)});
    }

    static getTemperature(): Promise<TemperatureDto> {
        return axios.get(`${API_PATH}/temperature`)
            .then((response) => response.data)
            .catch((e) => {console.log(e)});
    }

    static getMachineOnTime(): Promise<void | DateTime | undefined> {
        return axios.get(`${API_PATH}/on-status`)
            .then((response) => {
                // 2023-06-27T18:32:40.228+02:00
                try {
                    const parsedDate = DateTime.fromISO(response.data);
                    if (parsedDate !== undefined && parsedDate !== null) {
                        return parsedDate;
                    } else {
                        return undefined;
                    }
                } catch {
                    return undefined;
                }
            })
            .catch((e) => {console.log(e)});
    }

    static brewCoffee(type: BrewTypeEnum): Promise<any> {
        return axios.get(`${API_PATH}/brew?type=${type.toString()}`)
            .then((response) => response.data)
            .catch((e) => {console.log(e)});
    }

    static clean(): Promise<any> {
        return axios.get(`${API_PATH}/clean`)
            .then((response) => response.data)
            .catch((e) => {console.log(e)});
    }

    static toggleDevice(status: DeviceStatusDto): Promise<DeviceStatusDto> {
        return axios.put(`${API_PATH}/devices`, status)
            .then((response) => response.data)
            .catch((e) => {console.log(e)});
    }

    static getCoffeeHubConfig(): Promise<CoffeeHubConfigDto> {
        return axios.get(`${API_PATH}/config`).then((res) => res.data).catch((e) => console.log(e));
    }

    static setCoffeeHubConfig(config: CoffeeHubConfigDto): Promise<CoffeeHubConfigDto> {
        return axios.put(`${API_PATH}/config`, config).then((res) => res.data).catch((e) => console.log(e));
    }

    static resetCoffeeHubConfig(config: CoffeeHubConfigDto): Promise<CoffeeHubConfigDto> {
        return axios.delete(`${API_PATH}/config`).then((res) => res.data).catch((e) => console.log(e));
    }
}

export default BackendService;