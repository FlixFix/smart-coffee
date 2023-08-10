import React, {ReactElement, useEffect, useState} from 'react';
import {DashboardComponent} from "../components/DashboardComponent";
import {DeviceStatusDto} from "../model/device-status-dto";
import BackendService from "../service/BackendService";
import {BrewTypeEnum} from "../model/brew-type-enum";
import {emptyConfig} from "./CoffeeHubPage";
import {DateTime} from "luxon";
import {useInterval} from "../hooks/use-interval-hook";
import {PicoConfigDto} from "../model/pico-config-dto";

/**
 * "Dashboard" page container.
 */
export function DashboardPage(): ReactElement {

    const [machineStatus, setMachineStatus] = useState<DeviceStatusDto>();
    const [heatingStatus, setHeatingStatus] = useState<DeviceStatusDto>();
    const [tankStatus, setTankStatus] = useState<DeviceStatusDto>();
    const [config, setConfig] = useState<PicoConfigDto>(emptyConfig);
    const [brewingTime, setBrewingTime] = useState<number | undefined>(undefined);
    const [onSince, setOnSince] = useState<string>();
    const [temp, setTemp] = useState<number | undefined>(undefined);

    useEffect(() => {
        getMachineStatus();
        getMachineOnTime();

        BackendService.getCoffeeHubConfig().then((config) => {
            setConfig(config);
        });
    }, [])

    useEffect(() => {
        getMachineOnTime();
    }, [machineStatus])

    useInterval(getMachineStatus, 2000);
    useInterval(getTemperature, 2000);


    function getMachineStatus(): void {
        BackendService.getMachineStatus().then((picoStatus) => {
            const derivedStatus = picoStatus?.devices?.find(s => s.device_number === '0');
            const heatingStatus = picoStatus?.devices?.find(s => s.device_number === '2');
            const tankStatus = picoStatus?.devices?.find(s => s.device_number === '3');
            setMachineStatus(derivedStatus);
            setHeatingStatus(heatingStatus);
            setTankStatus(tankStatus);
        });
    }

    function getTemperature(): void {
        if (machineStatus?.value === 1) {
            BackendService.getTemperature().then((temp) => {
                setTemp(temp.temp);
            });
        } else {
            setTemp(undefined);
        }
    }

    function getMachineOnTime(): void {
        BackendService.getMachineOnTime().then((time) => {
            let onMinutes = undefined;
            if (time !== undefined) {
                const parsedOnMinutes = DateTime.now().diff(time, 'minutes').toObject().minutes;
                if (parsedOnMinutes !== undefined) {
                    onMinutes = parsedOnMinutes.toFixed(0).toString();
                }
            }
            setOnSince(onMinutes);
        });
    }

    function onClickSingeShot(): void {

        BackendService.brewCoffee(BrewTypeEnum.SINGLE).then(() => {
            setBrewingTime(config.singleBrewTime);
        });
    }

    function onClickDoubleShot(): void {
        BackendService.brewCoffee(BrewTypeEnum.DOUBLE).then(() => {
            setBrewingTime(config.doubleBrewTime);
        });
    }

    function onClickToggle(): void {
        const value = machineStatus === undefined || machineStatus.value === 0 ? 1 : 0;
        BackendService.toggleDevice({device_number: '0', value: value}).then((newStatus) => {
            setMachineStatus(newStatus);
        });

    }

    function toggleBrewing(brewing: boolean): void {
        const status = brewing ? 1 : 0;
        BackendService.toggleDevice({device_number: '1', value: status}).then((newStatus) => {
            if (newStatus.value === 1) {
                setBrewingTime(Infinity);
            } else {
                setBrewingTime(undefined);
            }
        });
    }

    function cancelBrewing(): void {
        BackendService.cancelBrewing().then(() => {
            setBrewingTime(undefined);
        })
    }


    return (<DashboardComponent onClickDoubleShot={onClickDoubleShot}
                                onClickSingleShot={onClickSingeShot}
                                onClickToggle={onClickToggle}
                                heatingStatus={heatingStatus}
                                machineStatus={machineStatus}
                                brewingTime={brewingTime}
                                machineOnTime={onSince}
                                temperature={temp}
                                toggleBrewing={toggleBrewing}
                                onCancelBrewing={cancelBrewing}
                                setBrewingTime={setBrewingTime}
                                desiredTemperature={config.brewTemp}
                                tankStatus={tankStatus}/>)
}