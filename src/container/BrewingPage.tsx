import React, {ReactElement, useEffect, useState} from 'react';
import {BrewingComponent} from "../components/BrewingComponent";
import {CoffeeHubConfigDto} from "../model/coffee-hub-config-dto";
import BackendService from "../service/BackendService";

export interface BrewingPageProps {
}

export function BrewingPage(props: BrewingPageProps): ReactElement {

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
        <> {config &&
        <BrewingComponent config={config} onClickSave={onClickSave} showAlert={showAlert}/>}
        </>)
}