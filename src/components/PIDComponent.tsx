import React, {ReactElement, useState} from 'react';
import {LogoHeader} from "./LogoHeader";
import {Alert, Button, Chip, TextField} from "@mui/material";
import {Line} from "react-chartjs-2";
import {ChartData} from "chart.js";
import {CoffeeHubConfigDto} from "../model/coffee-hub-config-dto";
import {IconTemperature} from "@tabler/icons-react";

export interface PIDComponentProps {
    config: CoffeeHubConfigDto;
    onClickSave: (config: CoffeeHubConfigDto) => void;
    showAlert: boolean;
    data: ChartData<'line', number[], number>;
}

export const chartOption = {
    responsive: true,
    tension: 0.5,
    plugins: {
        legend: {
            display: false,
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Temperaturverlauf',
        },
    },
};

export function PIDComponent(props: PIDComponentProps): ReactElement {
    const [kp, setKp] = useState<string | undefined>(props.config.pidKP?.toString());
    const [ki, setKi] = useState<string | undefined>(props.config.pidKI?.toString());
    const [kd, setKd] = useState<string | undefined>(props.config.pidKD?.toString());

    function hasChanges(): boolean {
        if (kp !== props.config.pidKP?.toString()) {
            return true;
        }

        if (ki !== props.config.pidKI?.toString()) {
            return true;
        }

        if (kd !== props.config.pidKD?.toString()) {
            return true;
        }

        return false;
    }

    function onClickReset(): void {
        setKp(props.config.pidKP?.toString());
        setKi(props.config.pidKI?.toString());
        setKd(props.config.pidKD?.toString());
    }

    function onSave(e: React.MouseEvent<HTMLButtonElement>): void {
        e.preventDefault();
        if (kp && ki && kd) {
            props.onClickSave({...props.config, pidKP: parseFloat(kp), pidKI: parseFloat(ki), pidKD: parseFloat(kd)});
        }
    }

    return (<>
        <LogoHeader height='35px' text='PID'/>
        <div className='d-flex align-items-center flex-column pt-3 gap-3'>
            <TextField label={<>K<sub>p</sub></>}
                       type='text'
                       className='w-75'
                       variant="outlined"
                       value={kp}
                       onChange={(e) => {
                           e.preventDefault();
                           setKp(e.target.value)}}
                       size='small'/>
            <TextField label={<>K<sub>i</sub></>}
                       type='text'
                       className='w-75'
                       variant="outlined"
                       value={ki}
                       onChange={(e) => {
                           e.preventDefault();
                           setKi(e.target.value)}}
                       size='small'/>
            <TextField label={<>K<sub>d</sub></>}
                       type='text'
                       className='w-75'
                       variant="outlined"
                       value={kd}
                       onChange={(e) => {
                           e.preventDefault();
                           setKd(e.target.value)}}
                       size='small'/>
            <Button variant='contained'
                    className='coffee-button'
                    disabled={!hasChanges()}
                    onClick={onSave}>Speichern</Button>
            <Button variant='outlined'
                    disabled={!hasChanges()}
                    className='coffee-button mb-2'
                    onClick={(e) => {
                        e.preventDefault();
                        onClickReset();
                    }}>Verwerfen</Button>
            <div className='position-fixed bottom-0 end-0 pb-4 pe-2'>
                <Chip size='small' label={
                    <div className='d-flex gap-1 align-items-center'>
                        <div className='live-dot'/>
                        live
                    </div>
                }/>
            </div>
            {props.data.datasets[0].data[props.data.datasets[0].data.length - 1] &&
            <div className='position-fixed bottom-0 start-0 pb-4 ps-2'>
                <Chip size='small' label={
                    <div className='d-flex gap-1 align-items-center'>
                        <IconTemperature />
                        {`${props.data.datasets[0].data[props.data.datasets[0].data.length - 1]} °C`}
                    </div>
                }/>
            </div>
            }
            <Line options={chartOption} data={props.data} height='200px'/>
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