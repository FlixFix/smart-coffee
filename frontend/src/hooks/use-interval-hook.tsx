import {useEffect, useRef} from 'react';

/**
 * This hook is used for custom intervals.
 * @param callback the callback to be called at every interval increment.
 * @param delay the interval increment.
 */
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