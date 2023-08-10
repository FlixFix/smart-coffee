import React, {ReactElement, useState} from 'react';
import {LogoHeader} from "./LogoHeader";
import {PicoConfigDto} from "../model/pico-config-dto";
import {Alert, Button, Checkbox, FormControlLabel, TextField} from "@mui/material";

export interface PicoConfigComponentProps {
    /**
     * The current pico config.
     */
    picoConfig: PicoConfigDto;
    /**
     * onClick event handler for clicking the save button.
     * @param config the updated config dto.
     */
    onSaveConfig: (config: PicoConfigDto) => void;
    /**
     * If true, the successfully saved alert will be shown.
     */
    showAlert: boolean;
}

/**
 * The component for the "Pico Config" page.
 */
export function PicoConfigComponent(props: PicoConfigComponentProps): ReactElement {

    const [editedConfig, setEditedConfig] = useState(props.picoConfig);

    function hasChanges(): boolean {
        if (props.picoConfig.infoLogging !== editedConfig.infoLogging) {
            return true;
        }

        if (props.picoConfig.mqtt !== editedConfig.mqtt) {
            return true;
        }

        if (props.picoConfig.mqttTopic !== editedConfig.mqttTopic) {
            return true;
        }

        if (props.picoConfig.mqttIp !== editedConfig.mqttIp) {
            return true;
        }

        if (props.picoConfig.requestLogging !== editedConfig.requestLogging) {
            return true;
        }

        if (props.picoConfig.pidLogging !== editedConfig.pidLogging) {
            return true;
        }

        if (props.picoConfig.pidControlLogging !== editedConfig.pidControlLogging) {
            return true;
        }

        return false;
    }

    function onClickReset(): void {
        setEditedConfig(props.picoConfig);
    }


    return (<>
        <LogoHeader height='35px' text='Pico Config'/>
        <div className='d-flex flex-column pt-3 gap-3 ms-3'>
            <FormControlLabel control={<Checkbox checked={editedConfig.mqtt}
                                                 onChange={(e) => {
                                                     setEditedConfig({...editedConfig, mqtt: e.target.checked})
                                                 }}/>}
                              label='MQTT'/>
            {editedConfig.mqtt &&
                <div className='pe-2 d-flex flex-column gap-3'>
            <TextField label="MQTT IP"
                       type='text'
                       variant="outlined"
                       size='small'
                       value={editedConfig.mqttIp}
                       onChange={(e) => {
                           e.preventDefault();
                           setEditedConfig({...editedConfig, mqttIp: e.target.value})
                       }}/>
            <TextField label="MQTT Topic"
                       type='text'
                       variant="outlined"
                       size='small'
                       value={editedConfig.mqttTopic}
                       onChange={(e) => {
                           e.preventDefault();
                           setEditedConfig({...editedConfig, mqttTopic: e.target.value})
                       }}/>
                </div>}
            <FormControlLabel control={<Checkbox checked={editedConfig.infoLogging}
                                                 onChange={(e) => {
                                                     setEditedConfig({...editedConfig, infoLogging: e.target.checked})
                                                 }}/>}
                              label='Log info'/>
            <FormControlLabel control={<Checkbox checked={editedConfig.requestLogging}
                                                 onChange={(e) => {
                                                     setEditedConfig({
                                                         ...editedConfig,
                                                         requestLogging: e.target.checked
                                                     })
                                                 }}/>}
                              label='Log requests'/>
            <FormControlLabel control={<Checkbox checked={editedConfig.pidLogging}
                                                 onChange={(e) => {
                                                     setEditedConfig({...editedConfig, pidLogging: e.target.checked})
                                                 }}/>}
                              label='Log PID'/>
            <FormControlLabel control={<Checkbox checked={editedConfig.pidControlLogging}
                                                 onChange={(e) => {
                                                     setEditedConfig({
                                                         ...editedConfig,
                                                         pidControlLogging: e.target.checked
                                                     })
                                                 }}/>}
                              label='Log PID control'/>
        </div>
        <div className='d-flex align-items-center flex-column pt-3 gap-3'>
            <Button variant='contained'
                    className='coffee-button'
                    disabled={!hasChanges()}
                    onClick={(e) => {
                        e.preventDefault();
                        props.onSaveConfig(editedConfig);
                    }}>Speichern</Button>
            <Button variant='outlined'
                    disabled={!hasChanges()}
                    className='coffee-button mb-2'
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