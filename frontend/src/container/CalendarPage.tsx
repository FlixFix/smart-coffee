import React, {ReactElement, useEffect, useState} from 'react';
import {CalendarComponent} from "../components/CalendarComponent";
import BackendService from "../service/BackendService";
import {PicoConfigDto} from "../model/pico-config-dto";

/**
 * "Zeitsteuerung" page container.
 */
export function CalendarPage(): ReactElement {

    const [config, setConfig] = useState<PicoConfigDto>();
    const [showAlert, setShowAlert] = useState(false);


    useEffect(() => {
        BackendService.getCoffeeHubConfig().then((config) => {
            setConfig(config);
        });
    }, [])

    useEffect(() => {
        if (showAlert) {
            const timeId = setTimeout(() => {
                setShowAlert(false);
            }, 5000)

            return () => {
                clearTimeout(timeId)
            }
        }
    }, [showAlert]);


    function onClickSave(config: PicoConfigDto): void {
        BackendService.setCoffeeHubConfig(config).then((newConfig) => {
            setConfig(newConfig);
            setShowAlert(true);
        })
    }


    return (
        <>
            {config &&
        <CalendarComponent config={config}
                               onClickSave={onClickSave}
                               showAlert={showAlert}/>}
        </>)
}