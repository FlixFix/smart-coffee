import React, {ReactElement, useState} from 'react';
import {LogoHeader} from "./LogoHeader";
import {PicoConfigDto} from "../model/pico-config-dto";
import {Alert, Button, Checkbox, FormControlLabel, TextField} from "@mui/material";

export interface PicoConfigComponentProps {
    picoConfig: PicoConfigDto;
    onSaveConfig: (config: PicoConfigDto) => void;
    showAlert: boolean;
}

export function PicoConfigComponent(props: PicoConfigComponentProps): ReactElement {

    const [editedConfig, setEditedConfig] = useState(props.picoConfig);

    function hasChanges(): boolean {
        if (props.picoConfig.info_logging !== editedConfig.info_logging) {
            return true;
        }

        if (props.picoConfig.mqtt !== editedConfig.mqtt) {
            return true;
        }

        if (props.picoConfig.mqtt_topic !== editedConfig.mqtt_topic) {
            return true;
        }

        if (props.picoConfig.mqtt_ip !== editedConfig.mqtt_ip) {
            return true;
        }

        if (props.picoConfig.request_logging !== editedConfig.request_logging) {
            return true;
        }

        if (props.picoConfig.pid_logging !== editedConfig.pid_logging) {
            return true;
        }

        if (props.picoConfig.pid_control_logging !== editedConfig.pid_control_logging) {
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
                       value={editedConfig.mqtt_ip}
                       onChange={(e) => {
                           e.preventDefault();
                           setEditedConfig({...editedConfig, mqtt_ip: e.target.value})
                       }}/>
            <TextField label="MQTT Topic"
                       type='text'
                       variant="outlined"
                       size='small'
                       value={editedConfig.mqtt_topic}
                       onChange={(e) => {
                           e.preventDefault();
                           setEditedConfig({...editedConfig, mqtt_topic: e.target.value})
                       }}/>
                </div>}
            <FormControlLabel control={<Checkbox checked={editedConfig.info_logging}
                                                 onChange={(e) => {
                                                     setEditedConfig({...editedConfig, info_logging: e.target.checked})
                                                 }}/>}
                              label='Log info'/>
            <FormControlLabel control={<Checkbox checked={editedConfig.request_logging}
                                                 onChange={(e) => {
                                                     setEditedConfig({
                                                         ...editedConfig,
                                                         request_logging: e.target.checked
                                                     })
                                                 }}/>}
                              label='Log requests'/>
            <FormControlLabel control={<Checkbox checked={editedConfig.pid_logging}
                                                 onChange={(e) => {
                                                     setEditedConfig({...editedConfig, pid_logging: e.target.checked})
                                                 }}/>}
                              label='Log PID'/>
            <FormControlLabel control={<Checkbox checked={editedConfig.pid_control_logging}
                                                 onChange={(e) => {
                                                     setEditedConfig({
                                                         ...editedConfig,
                                                         pid_control_logging: e.target.checked
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