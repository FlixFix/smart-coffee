import React, {ReactElement, useEffect, useState} from 'react';
import {LogsComponent} from "../components/LogsComponent";
import {DateTime} from "luxon";

/**
 * The type of the Log messages.
 */
enum LogType {
    PICO = 'PICO'
}

/**
 * Interface defining a single log entry.
 */
export interface LogEntry {
    /**
     * type of the log entry.
     */
    type: LogType;
    /**
     * Log message,
     */
    message: string;
    /**
     * Timestamp of the log message,
     */
    timeStamp: string | null;
}

/**
 * "Logs" page container.
 */
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