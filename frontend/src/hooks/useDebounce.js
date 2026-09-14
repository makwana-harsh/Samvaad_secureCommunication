import { useState, useEffect } from "react";

/**
 * Returns a debounced version of the passed value after a specified delay.
 * 
 * @param {any} value - Input value (e.g. search term)
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 */
function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}


export default useDebounce;