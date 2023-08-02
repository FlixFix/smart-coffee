import React, {ReactElement} from 'react';
import {LogEntry} from "../container/LogsPage";
import {LogoHeader} from "./LogoHeader";

export interface LogsComponentProps {
    logEntries: LogEntry[];
}

export function LogsComponent(props: LogsComponentProps): ReactElement {

function getFormattedLogMessage(logEntry: LogEntry): ReactElement {
    return <div className='w-100 justify-content-start d-flex align-items-center' key={logEntry.timeStamp}>
        <span style={{minWidth: '160px'}}><b>{`${logEntry.type} [${logEntry.timeStamp}]    `}</b>
        </span>
            <span>
            {logEntry.message}
                </span>
    </div>
}

return (<>
    <LogoHeader height='35px' text='Logs'/>
    <div className='d-flex justify-content-center mb-3'>
        <span>Log-Output:</span>
    </div>
    <div className='d-flex ps-2 pt-5 align-items-center flex-column-reverse pt-3 log-panel'>
        {
            props.logEntries.map((entry) =>
                getFormattedLogMessage(entry)
            )
        }
    </div>
</>)
}