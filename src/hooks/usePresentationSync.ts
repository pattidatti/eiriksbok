import { useState, useEffect, useCallback, useRef } from 'react';

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

    // Mirror state in a ref so sync-request responses always read the latest
    // committed value without re-binding listeners on every state change.
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Single message listener for the lifetime of the hook. Handles both
    // STATE_UPDATE (controller→projector and vice versa) and SYNC_REQUEST
    // (newly opened projector asks the controller for current state).
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'STATE_UPDATE') {
                setState(event.data.state);
            } else if (event.data.type === 'SYNC_REQUEST' && role === 'controller') {
                channel.postMessage({ type: 'STATE_UPDATE', state: stateRef.current });
            }
        };

        channel.addEventListener('message', handleMessage);

        if (role === 'projector') {
            channel.postMessage({ type: 'SYNC_REQUEST' });
        }

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, [channel, role]);

    const updateState = useCallback((newState: Partial<PresentationState> | ((prev: PresentationState) => Partial<PresentationState>)) => {
        if (role !== 'controller') return;
        setState(prev => {
            const patch = typeof newState === 'function' ? newState(prev) : newState;
            const updated = { ...prev, ...patch };
            channel.postMessage({ type: 'STATE_UPDATE', state: updated });
            return updated;
        });
    }, [channel, role]);

    return {
        state,
        updateState,
        isController: role === 'controller'
    };
};
