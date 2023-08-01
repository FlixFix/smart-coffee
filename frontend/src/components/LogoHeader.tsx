import React, {ReactElement} from 'react';

import logo from '../assets/logo_coffee_hub.png'

export interface LogoHeaderProps {
    height: string;
    text?: string;
}

export function LogoHeader(props: LogoHeaderProps): ReactElement {

    return (
        <>
            <div className='d-flex justify-content-between align-items-center px-1'>
                <img alt='Logo' src={logo} style={{maxHeight: `${props.height}`}}/>
                <span className='header-text'>{props.text}</span>
            </div>
            <hr className='pt-0 mt-2'/>
        </>)
}