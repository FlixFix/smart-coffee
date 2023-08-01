import {useEffect, useRef} from 'react';

export function useInterval(callback: any, delay: number) {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {

        if (delay !== null && savedCallback.current !== undefined) {
            const id = setInterval(savedCallback.current, delay);
            return () => {
                clearInterval(id);
            }
        }
    }, [callback, delay]);
}