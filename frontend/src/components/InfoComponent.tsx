import React, {ReactElement, useEffect, useState} from 'react';

export interface InfoComponentProps {
    /**
     * True, if the machine is currently on.
     */
    machineIsOn?: boolean;
    /**
     * The current temperature.
     */
    temperature?: number;
    /**
     * The desired temperature, which is currently set for the controller.
     */
    desiredTemperature: number;
}

// gives the maximum allowed temperature derivation for the status to show as ready
const READY_DERIVATION = process.env.REACT_APP_READY_DERIVATION || 3;

// gives the maximum allowed temperature derivation for the status to show as optimal
const OPTIMAL_DERIVATION = process.env.REACT_APP_OPTIMAL_DERIVATION || 0.5;

/**
 * Gives the machine status based on the current temperature and a given derivation.
 */
enum MachineState {
    NOT_READY = 'NOT_READY',
    READY = 'READY',
    OPTIMAL = 'OPTIMAL'
}

/**
 * Info component, which indicates the temperature status of the machine by a text and a coloured indicator.
 */
export function InfoComponent(props: InfoComponentProps): ReactElement {

    const [status, setStatus] = useState(MachineState.NOT_READY);

    useEffect(() => {
        setStatus(getMachineStatus());
    }, [props.temperature, props.desiredTemperature])

    if (props.machineIsOn !== true) {
        return <></>;
    }

    function getMachineStatus(): MachineState {

        if (props.temperature === undefined) {
            return MachineState.NOT_READY;
        }

        if (Math.abs(props.temperature - props.desiredTemperature) <= OPTIMAL_DERIVATION) {
            return MachineState.OPTIMAL;
        }

        if (Math.abs(props.temperature - props.desiredTemperature) <= READY_DERIVATION) {
            return MachineState.READY;
        }

        return MachineState.NOT_READY;
    }

    function getStatusMessage(): string {
        if (status === MachineState.READY) {
            return 'Bereit'
        }

        if (status === MachineState.OPTIMAL) {
            return 'Optimal'
        }

        return 'Warten...'
    }


    return (<div className='small d-flex align-items-center gap-1'>
        <>{getStatusMessage()}</>
        <div className={`indicator-${status}`}/>
    </div>)
}