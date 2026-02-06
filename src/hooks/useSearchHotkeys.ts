import { useEffect } from 'react';

export const useSearchHotkeys = (onOpen: () => void) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl+K (or Cmd+K on Mac)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onOpen();
                return;
            }

            // Check for '/' but guard against inputs
            if (e.key === '/') {
                const activeElement = document.activeElement;
                const isInputActive = activeElement && (
                    activeElement.tagName === 'INPUT' ||
                    activeElement.tagName === 'TEXTAREA' ||
                    (activeElement as HTMLElement).isContentEditable
                );

                if (!isInputActive) {
                    e.preventDefault();
                    onOpen();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onOpen]);
};
