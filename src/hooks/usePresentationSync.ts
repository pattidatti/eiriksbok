import { useState, useEffect, useCallback } from 'react';

interface PresentationState {
    currentSlideIndex: number;
    currentRevealIndex: number;
    isBlackout: boolean;
}

/**
 * Sync hook for Dual-View presentation.
 * Uses BroadcastChannel to communicate between the Controller (Teacher) 
 * and the Projector (Student) windows.
 */
export const usePresentationSync = (presentationId: string, role: 'controller' | 'projector') => {
    const [state, setState] = useState<PresentationState>({
        currentSlideIndex: 0,
        currentRevealIndex: -1,
        isBlackout: false
    });

    const [channel] = useState(() => new BroadcastChannel(`pres-sync-${presentationId}`));

    // Listen for state updates from the other side
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'STATE_UPDATE') {
                setState(event.data.state);
            }
        };

        channel.addEventListener('message', handleMessage);

        // Initial sync request from projector
        if (role === 'projector') {
            channel.postMessage({ type: 'SYNC_REQUEST' });
        }

        return () => {
            channel.removeEventListener('message', handleMessage);
        };
    }, [channel, role]);

    // Handle sync requests (usually from a newly opened projector window)
    useEffect(() => {
        if (role === 'controller') {
            const handleSyncRequest = (event: MessageEvent) => {
                if (event.data.type === 'SYNC_REQUEST') {
                    channel.postMessage({ type: 'STATE_UPDATE', state });
                }
            };
            channel.addEventListener('message', handleSyncRequest);
            return () => channel.removeEventListener('message', handleSyncRequest);
        }
    }, [channel, role, state]);

    const updateState = useCallback((newState: Partial<PresentationState>) => {
        if (role === 'controller') {
            const updated = { ...state, ...newState };
            setState(updated);
            channel.postMessage({ type: 'STATE_UPDATE', state: updated });
        }
    }, [channel, role, state]);

    return {
        state,
        updateState,
        isController: role === 'controller'
    };
};
