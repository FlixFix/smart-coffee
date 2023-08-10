import React, {ReactElement, useState} from 'react';
import {LogoHeader} from "./LogoHeader";
import {Alert, Button, TextField} from "@mui/material";
import {IconCoffee, IconTemperature} from "@tabler/icons-react";
import {PicoConfigDto} from "../model/pico-config-dto";

export interface BrewingComponentProps {
    /**
     * The current pico config.
     */
    config: PicoConfigDto;
    /**
     * onClick event handler for clicking the save button.
     * @param config the updated config dto.
     */
    onClickSave: (config: PicoConfigDto) => void;
    /**
     * If true, the successfully saved alert will be shown.
     */
    showAlert: boolean;
}

/**
 * Component for the "Zubereitung" page.
 */
export function BrewingComponent(props: BrewingComponentProps): ReactElement {

    const [brewingTemp, setBrewingTemp] = useState(props.config.brewTemp);
    const [singleBrewTime, setSingleBrewTime] = useState(props.config.singleBrewTime);
    const [doubleBrewTime, setDoubleBrewTime] = useState(props.config.doubleBrewTime);

    function onSave(e: React.MouseEvent): void {
        e.preventDefault();
        props.onClickSave({
            ...props.config,
            doubleBrewTime: doubleBrewTime,
            singleBrewTime: singleBrewTime,
            brewTemp: brewingTemp
        });
    }


    function onClickReset(): void {
        setBrewingTemp(props.config.brewTemp);
        setSingleBrewTime(props.config.singleBrewTime);
        setDoubleBrewTime(props.config.doubleBrewTime);
    }

    function hasChanges(): boolean {
        if (brewingTemp !== props.config.brewTemp) {
            return true;
        }

        if (singleBrewTime !== props.config.singleBrewTime) {
            return true;
        }

        if (doubleBrewTime !== props.config.doubleBrewTime) {
            return true;
        }


        return false;
    }

    return (<>
        <LogoHeader height='35px' text='Zubereitung'/>
        <div className='d-flex flex-column align-items-center gap-4 mt-5 pt-5'>
            <div className='d-flex gap-2 align-items-center'>
                <IconTemperature className='icon-dark'/>
                <TextField label="Temperatur"
                           type='number'
                           variant="outlined"
                           size='small'
                           value={brewingTemp}
                           onChange={(e) => setBrewingTemp(parseInt(e.target.value))}/>
            </div>
            <div className='d-flex gap-2 align-items-center'>
                <IconCoffee className='icon-dark'/>
                <TextField label="Single Shot"
                           type='number'
                           variant="outlined"
                           size='small'
                           value={singleBrewTime}
                           onChange={(e) => setSingleBrewTime(parseInt(e.target.value))}/>
            </div>
            <div className='d-flex gap-2 align-items-center'>
                <IconCoffee className='icon-dark'/>
                <TextField label="Double Shot"
                           variant="outlined"
                           type='number'
                           size='small'
                           value={doubleBrewTime}
                           onChange={(e) => setDoubleBrewTime(parseInt(e.target.value))}/>
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