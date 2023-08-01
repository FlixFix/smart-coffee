import React, {ReactElement, useEffect, useState} from 'react';
import {CalendarComponent} from "../components/CalendarComponent";
import {CoffeeHubConfigDto} from "../model/coffee-hub-config-dto";
import BackendService from "../service/BackendService";

export interface CalendarPageProps {
}

export function CalendarPage(props: CalendarPageProps): ReactElement {

    const [config, setConfig] = useState<CoffeeHubConfigDto>();
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


    function onClickSave(config: CoffeeHubConfigDto): void {
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