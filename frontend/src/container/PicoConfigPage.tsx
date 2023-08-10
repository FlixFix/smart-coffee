import React, {ReactElement, useEffect, useState} from 'react';
import {PicoConfigComponent} from "../components/PicoConfigComponent";
import {PicoConfigDto} from "../model/pico-config-dto";
import BackendService from "../service/BackendService";

/**
 * "Pico config" page container.
 */
export function PicoConfigPage(): ReactElement {

    const [config, setConfig] = useState<PicoConfigDto>();
    const [showAlert, setShowAlert] = useState(false);


    useEffect(() => {
        BackendService.getCoffeeHubConfig().then((response) => {
            setConfig(response);
        })
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


    function onSaveConfig(config: PicoConfigDto): void {
        BackendService.setCoffeeHubConfig(config).then((newConfig) => {
            setConfig(newConfig);
            setShowAlert(true);
        })
    }

    return (
        <>
            {config &&
                <PicoConfigComponent onSaveConfig={onSaveConfig}
                                     picoConfig={config}
                                     showAlert={showAlert}/>}
        </>
        )
}