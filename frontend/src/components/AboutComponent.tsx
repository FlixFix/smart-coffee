import {DateTime} from 'luxon';
import React, {ReactElement} from 'react';
import {LogoHeader} from "./LogoHeader";
import {IconCopyright, IconGitCommit, IconVersions} from "@tabler/icons-react";


export function AboutComponent(): ReactElement {

    const versionString = `${process.env.REACT_APP_APP_MAJOR_VERSION}.${process.env.REACT_APP_APP_MINOR_VERSION}.${process.env.REACT_APP_APP_HOTFIX_VERSION}`

    function getDeploymentTime(): string {
        // 2023-06-16_06:22:10
        const rawTime = process.env.REACT_APP_APP_BUILD_TIME;
        if (rawTime !== undefined) {
            const parsedDateTime = DateTime.fromFormat(rawTime, 'yyyy-MM-dd_HH:mm:ss');
            const parsedTimePart = `${parsedDateTime.toFormat('HH:mm:ss', {locale: 'de'})} Uhr`;
            const parsedDatePart = parsedDateTime.toFormat('dd.MM.yyyy', {locale: 'de'});
            return `am ${parsedDatePart} um ${parsedTimePart}`;
        }
        return '';
    }

    return (<>
        <LogoHeader height='35px' text='About'/>
        <div className='p-2 d-flex flex-column align-items-center'>
            <div className='d-flex align-items-center mt-4 gap-1 my-1'>
                <h6 className='m-0'>Version</h6>
                <IconGitCommit className='icon-dark'/>
            </div>
            <span>{versionString}</span>
            <div className='d-flex align-items-center mt-4 gap-1 my-1'>
                <h6 className='m-0'>Deployment</h6>
                <IconVersions className='icon-dark'/>
            </div>
            <span>{getDeploymentTime()}</span>
            <div className='d-flex align-items-center mt-4 gap-1 my-1'>
                <h6 className='m-0'>Copyright</h6>
                <IconCopyright className=' icon-dark'/>
            </div>
            <span>Felix Rampf</span>
        </div>
    </>)
}