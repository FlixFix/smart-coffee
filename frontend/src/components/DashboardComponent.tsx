import React, {ReactElement, useEffect, useState} from 'react';
import {LogoHeader} from "./LogoHeader";
import {Button, Switch} from "@mui/material";
import {IconCoffee, IconHandFinger, IconHandStop, IconTemperature, IconWind, IconWindOff} from "@tabler/icons-react";
import {DeviceStatusDto} from "../model/device-status-dto";
import CircularProgress from "@mui/material/CircularProgress";
import {FillingCoffeeMugComponent} from "../common/FillingCoffeeMugComponent";
import {InfoComponent} from "./InfoComponent";
import {EmptyTankComponent} from "./EmptyTankComponent";

export interface DashboardComponentProps {
    /**
     * Status of the coffee machine.
     */
    machineStatus?: DeviceStatusDto;
    /**
     * Status of the heating.
     */
    heatingStatus?: DeviceStatusDto;
    /**
     * Status of the tank sensor.
     */
    tankStatus?: DeviceStatusDto;
    /**
     * onClick event handler for the on/off toggle.
     */
    onClickToggle: () => void;
    /**
     * onClick event handler for the Single Shot button.
     */
    onClickSingleShot: () => void;
    /**
     * onClick event handler for the Double Shot button.
     */
    onClickDoubleShot: () => void;
    /**
     * onClick event handler for the cancel brewing button.
     */
    onCancelBrewing: () => void;
    /**
     * The brewing time for the current brewing process (single, double).
     * If the brewing type is manual, the brewingTime is set to -1. If no
     * brewing is in progress the brewing time is undefined.
     */
    brewingTime?: number;
    /**
     * Sets the brewing time to the given number. This is used for the cancel
     * event in order to reset the counter.
     * @param time the time the brewing time should be set to.
     */
    setBrewingTime: (time?: number) => void;
    /**
     * The current on-timer for the machine.
     */
    machineOnTime?: string;
    /**
     * The current temperature given by the boiler temperature sensor.
     */
    temperature?: number;
    /**
     * The anticipated temperature, which is currently set for the controller.
     */
    desiredTemperature: number;
    /**
     * onClickEvent handler for the manual brewing button.
     * @param brewing true, brewing on, else brewing off.
     */
    toggleBrewing: (brewing: boolean) => void;
}

/**
 * The component for the "Dashboard" page.
 */
export function DashboardComponent(props: DashboardComponentProps): ReactElement {

    const [brewing, setBrewing] = useState<boolean>(false);
    const [brewTimeout, setBrewTimeout] = useState<NodeJS.Timeout>();
    const [brewTimer, setBrewTimer] = useState<number>(0);

    useEffect(() => {
        setBrewing(props.brewingTime !== undefined)
    }, [props.brewingTime])


    useEffect(() => {
        if (props.brewingTime !== undefined) {
            const brewTimeout = setTimeout(() => {
                setBrewTimer(brewTimer + 1);
            }, 1000)

            setBrewTimeout(brewTimeout);

            if (brewTimer > props.brewingTime) {
                clearTimeout(brewTimeout);
                props.setBrewingTime(undefined);
                setBrewTimeout(undefined);
                setBrewTimer(0);
            }


            return () => {
                clearTimeout(brewTimeout);
            }
        }
    }, [brewTimer, props.brewingTime])


    function cancelBrewing(): void {
        setBrewTimer(0);
        clearInterval(brewTimeout);
        setBrewTimeout(undefined);
        props.onCancelBrewing();
    }


    function machineIsOn(): boolean {
        return props.machineStatus !== undefined && props.machineStatus.value === 1;
    }


    return (<>
        <div className='position-absolute bottom-0 pb-2 end-0 me-2'>
            <EmptyTankComponent tankEmpty={props.tankStatus !== undefined && props.tankStatus.value !== 1}/>
        </div>
        <LogoHeader height='35px' text='Dashboard'/>
        <div className='ps-2 d-flex flex-column align-items-center gap-3 position-relative'>

            {props.machineStatus === undefined ? <>
                    <CircularProgress/>
                </> :
                <>
                    <div className='d-flex flex-column gap-1 align-items-center'>
                        <div className='d-flex align-items-center gap-1 mb-1'>
                                    <span
                                        className={props.machineStatus.value === 1 ? 'machine-status-text' : ''}>aus</span>
                            <Switch checked={props.machineStatus.value === 1} onClick={(e) => {
                                props.onClickToggle();
                            }}/>
                            <span
                                className={props.machineStatus.value === 1 ? '' : 'machine-status-text'}>an</span>
                        </div>
                        <div className='d-flex justify-content-center'>
                            {props.machineStatus.value === 1 && props.machineOnTime !== undefined &&
                                <span>
                        {`ein seit: ${props.machineOnTime} min.`}
                    </span>
                            }
                        </div>

                        {props.temperature && props.machineStatus.value === 1 &&
                            <>
                                <div className='d-flex justify-content-center gap-2'>
                                    <IconTemperature className='icon-dark'/>
                                    <span>{`${props.temperature.toFixed(1)} °C`}</span>
                                    {props.heatingStatus !== undefined && props.heatingStatus.value === 1 ?
                                        <IconWind className='icon-dark icon-heat'/> :
                                        <IconWindOff className='icon-dark'/>
                                    }
                                </div>
                                <div className='mb-5'>
                                    <InfoComponent temperature={props.temperature}
                                                   machineIsOn={machineIsOn()}
                                                   desiredTemperature={props.desiredTemperature}/>
                                </div>
                            </>}

                    </div>

                    {brewing ? <Button variant='outlined'
                                       onClick={cancelBrewing}>
                        <div className='d-flex align-items-center gap-2 justify-content-start'
                             style={{width: '180px'}}>
                            <span>Stop</span>
                            <IconCoffee className='ms-auto icon-heat icon-dark'/>
                            <IconHandStop className='icon-dark'/>
                        </div>
                    </Button> : <>
                        <Button variant='contained'
                                disabled={!machineIsOn()}
                                onClick={(e) => {
                                    e.preventDefault();
                                    props.onClickSingleShot();
                                }}>
                            <div className='d-flex align-items-center gap-2 justify-content-start'
                                 style={{width: '180px'}}>
                                <span>Single Shot</span>
                                <IconCoffee className='ms-auto'/>
                            </div>
                        </Button>

                        <Button variant='contained'
                                disabled={!machineIsOn()}
                                onClick={(e) => {
                                    e.preventDefault();
                                    props.onClickDoubleShot();
                                }}>
                            <div className='d-flex align-items-center gap-2 justify-content-start'
                                 style={{width: '180px'}}>
                                <span>Double Shot</span>
                                <IconCoffee className='ms-auto'/>
                                <IconCoffee/>
                            </div>
                        </Button>

                        <Button variant='contained'
                                disabled={!machineIsOn()}
                                onClick={(e) => {
                                    e.preventDefault();
                                    props.toggleBrewing(true);
                                }}>
                            <div className='d-flex align-items-center gap-2 justify-content-start'
                                 style={{width: '180px'}}>
                                <span>Manuell</span>
                                <IconHandFinger className='ms-auto'/>
                            </div>
                        </Button>

                    </>}


                    {
                        props.brewingTime &&
                        <div className='mt-4 mb-2 d-flex justify-content-center'>
                            <span className='position-absolute fw-bold'>{`${brewTimer} Sekunden`}</span>
                            <div className='mt-5 pt-5 d-flex justify-content-center'>
                                <FillingCoffeeMugComponent
                                    maxValue={props.brewingTime === Infinity ? 40 : props.brewingTime + 1}/>
                            </div>
                        </div>
                    }
                </>}
        </div>
    </>)
}