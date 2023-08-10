import React, {ReactElement} from 'react';

import logo from '../assets/logo_coffee_hub.png'

export interface LogoHeaderProps {
    /**
     * The height of the header.
     */
    height: string;
    /**
     * The text to be displayed on the right side of the header.
     */
    text?: string;
}

/**
 * The logo and header component used on any sub page of the application.
 * @param props
 * @constructor
 */
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