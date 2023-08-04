import React, {ReactElement} from 'react';
import {Button} from "@mui/material";

export interface BrewingButtonComponentProps {
    disabled?: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
    brewing?: boolean;
    labelInactive: string;
    labelActive: string;
    iconActive: ReactElement;
    iconInactive: ReactElement;
    className?: string;
}

export function BrewingButtonComponent(props: BrewingButtonComponentProps): ReactElement {

return (<Button variant='contained'
                className={props.className}
                disabled={props.disabled}
                onClick={(e) => {
                    e.preventDefault();
                    props.brewing === true ? props.onDeactivate() : props.onActivate()
                }}>
    <div className='d-flex align-items-center gap-2 justify-content-start' style={{width: '180px'}}>
        {props.brewing === true ?
            <>
                <span>{props.labelActive}</span>
                {props.iconActive}
            </> :
            <>
                <span>{props.labelInactive}</span>
                {props.iconInactive}
            </>}
    </div>
</Button>)
}