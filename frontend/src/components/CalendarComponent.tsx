import React, {ReactElement, useState} from 'react';
import {LogoHeader} from "./LogoHeader";
import {Alert, Button, Checkbox, FormControlLabel, TextField} from "@mui/material";
import {IconCalendarTime, IconCirclePlus, IconClockHour3, IconTrash} from "@tabler/icons-react";
import {CoffeeHubConfigDto} from "../model/coffee-hub-config-dto";


export interface CalendarComponentProps {
    config: CoffeeHubConfigDto;
    onClickSave: (config: CoffeeHubConfigDto) => void;
    showAlert: boolean;
}

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function CalendarComponent(props: CalendarComponentProps): ReactElement {

    const [days, setDays] = useState<number[]>(props.config.daysOn);
    const [times, setTimes] = useState<string[]>(props.config.timesOn);
    const [idleTime, setIdleTime] = useState(props.config.idleTime);

    function setDay(index: number): void {
        let currentDays = [...days];

        const indexOf = currentDays.findIndex(d => d === index);

        if (indexOf > -1) {
            currentDays.splice(indexOf, 1);
        } else {
            currentDays.push(index);
        }

        setDays(currentDays);
    }

    function setOnTime(index: number, time: string): void {
        let currentTimes = [...times];

        if (currentTimes.length >= index) {
            currentTimes[index] = time;
        } else {
            currentTimes.push(time);
        }
        setTimes(currentTimes);
    }

    function onSave(e: React.MouseEvent): void {
        e.preventDefault();
        props.onClickSave({
            ...props.config,
            daysOn: days,
            timesOn: times,
            idleTime: idleTime
        });
    }

    function onClickReset(): void {
        setDays(props.config.daysOn);
        setTimes(props.config.timesOn);
        setIdleTime(props.config.idleTime);
    }

    function addNewOnTime(): void {
        let currentTimes = [...times];
        currentTimes.push('00:00');
        setTimes(currentTimes);
    }

    function removeOnTime(index: number): void {
        let currentTimes = [...times];
        currentTimes.splice(index, 1);
        setTimes(currentTimes);
    }

    function hasChanges(): boolean {
        if (idleTime !== props.config.idleTime) {
            return true;
        }

        for (const time of times) {
            if (props.config.timesOn.indexOf(time) === -1) {
                return true;
            }
        }

        for (const time of props.config.timesOn) {
            if (times.indexOf(time) === -1) {
                return true;
            }
        }

        // check for added days
        for (const day of days) {
            if (props.config.daysOn.indexOf(day) === -1) {
                return true;
            }
        }
        // check for removed days
        for (const day of props.config.daysOn) {
            if (days.indexOf(day) === -1) {
                return true;
            }
        }

        return false;
    }


    return (<>
        <LogoHeader height='35px' text='Zeitsteuerung'/>
        <div className='d-flex align-items-center flex-column pt-3'>
            <div className='d-flex gap-2 mb-2'>
                <IconCalendarTime className='icon-dark'/>
                <span>Einschalttage</span>
            </div>
            <div className='d-flex flex-wrap justify-content-center gap-2'>
                {
                    DAYS.map((day, index) =>
                        <FormControlLabel key={day} control={<Checkbox checked={days.includes(index)}
                                                                       onChange={(e) => {
                                                                           setDay(index);
                                                                       }}/>} label={day}/>
                    )
                }
            </div>
            <div className='d-flex flex-column gap-3 mt-5 align-items-center w-100'>
                <div className='d-flex gap-2'>
                    <IconClockHour3 className='icon-dark'/>
                    <span>Einschaltzeiten</span>
                </div>
                {
                    times.map((time, index) =>
                        <div key={time} className='d-flex w-100 justify-content-around'>
                            <div className='col-3'/>
                            <div className='col-6 d-flex gap-2 align-items-center'>
                                <TextField label={`Einschalten ${index + 1}`}
                                           type='time'
                                           className='w-75'
                                           variant="outlined"
                                           size='small'
                                           value={time}
                                           onChange={(e) => {
                                               e.preventDefault();
                                               setOnTime(index, e.target.value);
                                           }}/>
                                <IconTrash className='icon-dark me-auto'
                                onClick={(e) => {
                                    e.preventDefault();
                                    removeOnTime(index);
                                }}/>
                            </div>
                            <div className='d-flex col-3 align-items-center'>
                                {index === times.length - 1 &&
                                    <IconCirclePlus className='icon-dark'
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        addNewOnTime();
                                                    }}/>
                                }
                            </div>
                        </div>
                    )
                }
                <div className='d-flex w-100 justify-content-around mt-5'>
                    <div className='col-3'/>
                    <div className='d-flex col-6 gap-2 align-items-center'>
                        <TextField label="Ausschalten"
                                   type='number'
                                   className='w-75'
                                   variant="outlined"
                                   value={idleTime}
                                   size='small'
                                   onChange={(e) => {
                                       e.preventDefault();
                                       setIdleTime(parseInt(e.target.value));
                                   }}/>
                    </div>
                    <div className='col-3 '/>
                </div>
            </div>
        </div>
        <div className='d-flex flex-column align-items-center gap-2 mt-5 mb-5'>
            <Button variant='contained'
                    className='coffee-button'
                    disabled={!hasChanges()}
                    onClick={onSave}>Speichern</Button>
            <Button variant='outlined'
                    disabled={!hasChanges()}
                    className='coffee-button'
                    onClick={(e) => {
                        e.preventDefault();
                        onClickReset();
                    }}>Verwerfen</Button>
        </div>
        {
            props.showAlert &&
            <div className='position-absolute bottom-0 w-100 d-flex justify-content-center pe-4 pb-4'>
                <Alert severity="success">
                    Einstellungen gespeichert!
                </Alert>
            </div>
        }
    </>)
}