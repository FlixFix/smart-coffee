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
        // the host is taken from the page url instead of a build time env variable: the frontend is served by the
        // backend itself, so this always points at the right machine - a baked in 'localhost' only ever worked in a
        // browser running on the server and left the log view silently empty on every other device.
        const socket = new WebSocket(`ws://${window.location.hostname}:7071`);
        socket.addEventListener('open', () => {
        });

        socket.addEventListener('error', () => {
            appendLogEntries(`Could not connect to the log stream at ws://${window.location.hostname}:7071`,
                LogType.PICO);
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