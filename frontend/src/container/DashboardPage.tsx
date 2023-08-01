import React, {ReactElement, useEffect, useState} from 'react';
import {DashboardComponent} from "../components/DashboardComponent";
import {DeviceStatusDto} from "../model/device-status-dto";
import BackendService from "../service/BackendService";
import {BrewTypeEnum} from "../model/brew-type-enum";
import {CoffeeHubConfigDto} from "../model/coffee-hub-config-dto";
import {emptyConfig} from "./CoffeeHubPage";
import {DateTime} from "luxon";
import {useInterval} from "../hooks/use-interval-hook";


export function DashboardPage(): ReactElement {

    const [machineStatus, setMachineStatus] = useState<DeviceStatusDto>();
    const [heatingStatus, setHeatingStatus] = useState<DeviceStatusDto>();
    const [brewingProcess, setBrewingProcess] = useState<number | undefined>(undefined);
    const [config, setConfig] = useState<CoffeeHubConfigDto>(emptyConfig);
    const [brewingTime, setBrewingTime] = useState(0);
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
            setMachineStatus(derivedStatus);
            setHeatingStatus(heatingStatus);
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
        setBrewingTime(config.singleBrewTime);
        BackendService.brewCoffee(BrewTypeEnum.SINGLE).then(() => {
            setBrewingProcess(undefined);
        });

        // start time, when brewing starts
        // when brewing finishes timer should be done
        let counter = 0;
        let intervalId = setInterval(() => {
            counter += 1;
            setBrewingProcess(counter);

            if (counter >= config.singleBrewTime) clearInterval(intervalId)
        }, 1000)

    }

    function onClickDoubleShot(): void {
        setBrewingTime(config.doubleBrewTime);
        BackendService.brewCoffee(BrewTypeEnum.DOUBLE).then(() => {
            setBrewingProcess(undefined);
        });

        // start time, when brewing starts
        // when brewing finishes timer should be done
        let counter = 0;
        let intervalId = setInterval(() => {
            counter += 1;
            setBrewingProcess(counter);

            if (counter >= config.doubleBrewTime) clearInterval(intervalId)
        }, 1000)
    }

    function onClickToggle(): void {
        const value = machineStatus === undefined || machineStatus.value === 0 ? 1 : 0;
        BackendService.toggleDevice({device_number: '0', value: value}).then((newStatus) => {
            setMachineStatus(newStatus);
        });

    }

    function onClickCancel(): void {
        BackendService.toggleDevice({device_number: '1', value: 0}).then((newStatus) => {
            setBrewingProcess(undefined);
        });
    }

    async function onClickClean(): Promise<void> {
        await BackendService.clean();
    }

    return (<DashboardComponent onClickDoubleShot={onClickDoubleShot}
                                onClickSingleShot={onClickSingeShot}
                                onClickToggle={onClickToggle}
                                heatingStatus={heatingStatus}
                                machineStatus={machineStatus}
                                brewingProcess={brewingProcess}
                                brewingTime={brewingTime}
                                onClickClean={onClickClean}
                                machineOnTime={onSince}
                                onClickStop={onClickCancel}
                                temperature={temp}/>)
}