import React, {ReactElement, useEffect, useState} from 'react';
import {LogsComponent} from "../components/LogsComponent";
import {DateTime} from "luxon";

enum LogType {
    PICO = 'PICO'
}

export interface LogEntry {
    type: LogType,
    message: string,
    timeStamp: string | null
}

export function LogsPage(): ReactElement {

    const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

    const appendLogEntries = (log: string, type: LogType): void => {
        const current_logs = [...logEntries];

        current_logs.unshift({
            timeStamp: DateTime.now().toISOTime(),
            message: log,
            type: type
        });
        setLogEntries(current_logs);
    };


    useEffect(() => {
        const socket = new WebSocket(`ws://${process.env.REACT_APP_BACKEND_IP}:7071`);
        socket.addEventListener('open', () => {
        });

        socket.addEventListener('message', (event) => {
            const blob = event.data;

            const reader = new FileReader();
            reader.onload = () => {
                const content = reader.result as string;
                appendLogEntries(content, LogType.PICO);
            };

            reader.readAsText(blob);
        });

        return (() => {socket.close()})

    }, [appendLogEntries])



    return (<LogsComponent logEntries={logEntries}/>)
}