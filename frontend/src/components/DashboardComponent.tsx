import React, {ReactElement, useEffect, useState} from 'react';
import {LogoHeader} from "./LogoHeader";
import {Alert, Button, Switch} from "@mui/material";
import {
    IconBlur,
    IconBlurOff,
    IconCircleCheck,
    IconCoffee,
    IconDroplet, IconHandClick, IconHandFinger, IconHandFingerOff, IconHandStop, IconHomeHand,
    IconTemperature,
    IconWind, IconWindOff
} from "@tabler/icons-react";
import {FillingCoffeeMugComponent} from "../common/FillingCoffeeMugComponent";
import {DeviceStatusDto} from "../model/device-status-dto";
import CircularProgress from "@mui/material/CircularProgress";
import {BrewingButtonComponent} from "../common/BrewingButtonComponent";

export interface DashboardComponentProps {
    machineStatus?: DeviceStatusDto;
    heatingStatus?: DeviceStatusDto;
    onClickToggle: () => void;
    onClickSingleShot: () => void;
    onClickDoubleShot: () => void;
    brewingProcess?: number;
    brewingTime: number;
    onClickClean: () => void;
    machineOnTime?: string;
    temperature?: number;
    manuallyBrewing?: boolean;
    toggleBrewing: (brewing: boolean) => void;
}

export function DashboardComponent(props: DashboardComponentProps): ReactElement {

    const [showAlert, setShowAlert] = useState(false);
    const [brewingTime, setBrewingTime] = useState<number | undefined>(undefined);


    useEffect(() => {

        if (props.brewingProcess !== undefined && props.brewingProcess >= props.brewingTime) {
            setShowAlert(true);
            setBrewingTime(undefined);
        }

        if (showAlert) {
            const timeId = setTimeout(() => {
                setShowAlert(false);
            }, 5000)

            return () => {
                clearTimeout(timeId)
            }
        }
    }, [props.brewingTime, props.brewingProcess, showAlert]);

    useEffect(() => {
        if (brewingTime !== undefined) {
            const brewTimeout = setTimeout(() => {
                setBrewingTime(brewingTime + 1);
            }, 1000)

            return () => {
                clearTimeout(brewTimeout)
            }
        }
    }, [brewingTime])


    function startTimer(): void {
        setBrewingTime(0);
    }

    return (<>
        <LogoHeader height='35px' text='Dashboard'/>
        <div className='ps-2 d-flex flex-column align-items-center gap-3'>
            {props.machineStatus === undefined ? <>
                    <CircularProgress/>
                </> :
                <>
                    <div className='d-flex flex-column gap-1 align-items-center'>
                        <div className='d-flex align-items-center gap-1 mb-1'>
                            <span className={props.machineStatus.value === 1 ? 'machine-status-text' : ''}>aus</span>
                            <Switch checked={props.machineStatus.value === 1} onClick={(e) => {
                                props.onClickToggle();
                            }}/>
                            <span className={props.machineStatus.value === 1 ? '' : 'machine-status-text'}>an</span>
                        </div>
                        <div className='d-flex justify-content-center'>
                            {props.machineStatus.value === 1 && props.machineOnTime !== undefined &&
                                <span>
                        {`ein seit: ${props.machineOnTime} min.`}
                    </span>
                            }
                        </div>

                        {props.temperature && props.machineStatus.value === 1 &&
                            <div className='d-flex justify-content-center mb-5 gap-2'>
                                <IconTemperature className='icon-dark'/>
                                <span>{`${props.temperature.toFixed(1)} °C`}</span>
                                {props.heatingStatus !== undefined && props.heatingStatus.value === 1 ?
                                    <IconWind className='icon-dark icon-heat'/> : <IconWindOff className='icon-dark'/>
                                }
                            </div>}

                    </div>


                    <BrewingButtonComponent
                        onActivate={() => {
                            props.onClickSingleShot();
                            startTimer();
                        }}
                        onDeactivate={() => props.toggleBrewing(true)}
                        labelInactive='Single Shot'
                        labelActive='Stop'
                        iconActive={<><IconCoffee className='ms-auto icon-heat'/>
                            <IconHandStop/></>}
                        iconInactive={
                            <IconCoffee className='ms-auto'/>
                        }
                        brewing={props.brewingProcess !== undefined}
                        disabled={props.machineStatus.value !== 1}/>

                    <BrewingButtonComponent
                        onActivate={() => {
                            props.onClickDoubleShot();
                            startTimer();
                        }}
                        onDeactivate={() => props.toggleBrewing(true)}
                        labelInactive='Double Shot'
                        labelActive='Stop'
                        iconActive={<><IconCoffee className='ms-auto icon-heat'/>
                            <IconHandStop/></>}
                        iconInactive={<>
                            <IconCoffee className='ms-auto'/>
                            <IconCoffee/></>}
                        brewing={props.brewingProcess !== undefined}
                        disabled={props.machineStatus.value !== 1}/>

                    <BrewingButtonComponent className='mb-5'
                                            onActivate={() => props.toggleBrewing(true)}
                                            onDeactivate={() => props.toggleBrewing(false)}
                                            labelInactive='Manuell'
                                            labelActive='Stop'
                                            iconActive={<><IconCoffee className='ms-auto icon-heat'/>
                                                <IconHandStop/></>}
                                            iconInactive={<IconHandFinger className='ms-auto'/>}
                                            brewing={props.manuallyBrewing}
                                            disabled={props.machineStatus.value !== 1}
                    />

                    {
                        (props.brewingProcess !== undefined && props.brewingProcess < props.brewingTime && !showAlert) &&
                        <div className='mt-4 mb-2 d-flex justify-content-center'>
                            {brewingTime &&
                                <span className='position-absolute fw-bold'>{`${brewingTime} Sekunden`}</span>}
                            <div className='mt-5 pt-5 d-flex justify-content-center'>
                                <FillingCoffeeMugComponent maxValue={props.brewingTime + 1}/>
                            </div>
                        </div>
                    }
                    {
                        showAlert &&
                        <div className='position-absolute bottom-0 w-100 d-flex justify-content-center pb-4'>
                            <Alert severity="success">
                                Viel Spaß beim genießen!
                            </Alert>
                        </div>
                    }
                </>}
        </div>
    </>)
}