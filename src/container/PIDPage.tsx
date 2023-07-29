import React, {ReactElement, useEffect, useState} from 'react';
import {PIDComponent} from "../components/PIDComponent";
import {faker} from "@faker-js/faker";
import {ChartData} from "chart.js";
import {useInterval} from "../hooks/use-interval-hook";
import BackendService from "../service/BackendService";
import {TemperatureDto} from "../model/temperature-dto";
import {CoffeeHubConfigDto} from "../model/coffee-hub-config-dto";


const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data: ChartData<'line', number[], string> = {
    labels,
    datasets: [
        {
            label: 'Temperaturverlauf',
            data: labels.map(() => faker.datatype.number({min: 15, max: 140})),
            borderColor: 'rgba(19, 126, 72, 0.42)',
            backgroundColor: 'rgba(19, 126, 72, 0.42)',
        }
    ],
};

const TEMP_INTERVAL = 1000;

export function PIDPage(): ReactElement {
    const [config, setConfig] = useState<CoffeeHubConfigDto>();
    const [showAlert, setShowAlert] = useState(false);

    const [tempArray, setTempArray] = useState<number[]>([]);
    const [labelArray, setLabelArray] = useState<number[]>([]);

    useEffect(() => {
        BackendService.getCoffeeHubConfig().then((config) => {
            setConfig(config);
        });
    }, [])

    // useInterval(updateTemperatureArray, TEMP_INTERVAL);

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

    async function getTemperature(): Promise<TemperatureDto> {
        return await BackendService.getTemperature();
    }

    function updateTemperatureArray(): void {
        getTemperature().then((temp) => {
            const currentTemp = [...tempArray];
            currentTemp.push(parseFloat(temp.temp.toFixed(1)));

            const currentLabel = [...labelArray];
            if (currentLabel.length === 0) {
                currentLabel.push(0);
            } else {
                currentLabel.push(currentLabel[currentLabel.length - 1] + (TEMP_INTERVAL / 1000));
            }

            setTempArray(currentTemp);
            setLabelArray(currentLabel);
        })
    }


    return (
        <>
            {config &&
                <PIDComponent onClickSave={onClickSave}
                              showAlert={showAlert}
                              config={config}
                              data={
                    {
                        labels: labelArray,
                        datasets: [
                            {
                                label: 'Temperaturverlauf',
                                data: tempArray,
                                borderColor: 'rgba(19, 126, 72, 0.42)',
                                backgroundColor: 'rgba(19, 126, 72, 0.42)',
                            }
                        ],
                    }
                }/>}
        </>
    )
}