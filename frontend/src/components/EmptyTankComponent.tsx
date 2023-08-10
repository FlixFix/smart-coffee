import React, {ReactElement} from 'react';
import {IconAlertTriangle} from "@tabler/icons-react";

export interface EmptyTankComponentProps {
    /**
     * True if the tank is empty or rather reached a critical water level,
     * else either false or undefined.
     */
    tankEmpty?: boolean;
}

/**
 * The component shown, if the tank has reached a critical water level.
 */
export function EmptyTankComponent(props: EmptyTankComponentProps): ReactElement {

    if (props.tankEmpty !== true) {
        return <></>;
    }

return (<div className='tank-chip small ps-3 pe-3 d-flex align-items-center gap-2 fw-bold'>
    <IconAlertTriangle className='icon-dark '/>
    Bitte Tank füllen!
</div>)
}