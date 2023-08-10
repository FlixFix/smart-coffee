import React, {ReactElement, useEffect, useState} from 'react';
import CoffeeHubComponent from "../components/CoffeeHubComponent";
import {DashboardPage} from "./DashboardPage";
import BackendService from "../service/BackendService";
import {BrewingPage} from "./BrewingPage";
import {CalendarPage} from "./CalendarPage";
import {AboutComponent} from "../components/AboutComponent";
import {PIDPage} from "./PIDPage";
import {LogsPage} from "./LogsPage";
import {PicoConfigPage} from "./PicoConfigPage";
import {PicoConfigDto} from "../model/pico-config-dto";


export const emptyConfig: PicoConfigDto = {
    requestLogging: true,
    pidLogging: true,
    pidControlLogging: true,
    infoLogging: true,
    mqtt: true,
    mqttTopic: 'pico_log',
    mqttIp: '',
    wlanPw: '',
    wlanSsid: '',
    scheduled: false,
    daysOn: [],
    timesOn: [
        "06:00",
        "13:00"
    ],
    idleTime: 0,
    singleBrewTime: 10,
    doubleBrewTime: 20,
    brewTemp: 90
}

/**
 * Main application container handling navigation logic.
 */
export function CoffeeHubPage(): ReactElement {

    const [content, setContent] = useState(<DashboardPage/>);
    const [config, setConfig] = useState<PicoConfigDto>(emptyConfig);
    const [currentView, setCurrentView] = useState('dashboard');

    useEffect(() => {
        BackendService.getCoffeeHubConfig().then((config) => {
            setConfig(config);
        })
    }, [content])

    useEffect(() => {
        if (currentView === 'dashboard') {
            setContent(<DashboardPage/>)
        } else if (currentView === 'brewing') {
            setContent(<BrewingPage/>);
        } else if (currentView === 'calendar') {
            setContent(<CalendarPage/>);
        } else if (currentView === 'pid') {
            setContent(<PIDPage/>);
        } else if (currentView === 'logs') {
            setContent(<LogsPage/>);
        } else if (currentView === 'config') {
            setContent(<PicoConfigPage/>);
        } else {
            setContent(<AboutComponent/>)
        }
    }, [currentView])

    return (<CoffeeHubComponent content={content}
                                config={config}
                                onClickMenuItem={setCurrentView}/>)
}