import { useEffect } from 'react';

export const useScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (!isLocked) return;

        // Save original overflow
        const originalStyle = window.getComputedStyle(document.body).overflow;

        // Lock scroll
        document.body.style.overflow = 'hidden';

        return () => {
            // Restore original overflow
            document.body.style.overflow = originalStyle;
        };
    }, [isLocked]);
};
