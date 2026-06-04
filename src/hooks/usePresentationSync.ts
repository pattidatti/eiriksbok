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

    // Hold the live channel in a ref. The channel is created and closed inside
    // the effect below so its lifecycle matches a single mount. Creating it via
    // useState would keep one instance across React StrictMode's mount→cleanup→
    // remount cycle, and the remount would then post to the already-closed
    // channel (InvalidStateError). The ref lets updateState reach the current
    // channel while staying null after cleanup.
    const channelRef = useRef<BroadcastChannel | null>(null);

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
        const channel = new BroadcastChannel(`pres-sync-${presentationId}`);
        channelRef.current = channel;

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
            channelRef.current = null;
        };
    }, [presentationId, role]);

    // Both roles may drive navigation: the controller in a dual-screen setup,
    // and the projector when the teacher mirrors a single screen. Every change
    // is broadcast so any other open window (controller or projector) stays in
    // sync. A BroadcastChannel never echoes a message back to the instance that
    // sent it, so there is no feedback loop between the two windows.
    const updateState = useCallback((newState: Partial<PresentationState> | ((prev: PresentationState) => Partial<PresentationState>)) => {
        setState(prev => {
            const patch = typeof newState === 'function' ? newState(prev) : newState;
            const updated = { ...prev, ...patch };
            channelRef.current?.postMessage({ type: 'STATE_UPDATE', state: updated });
            return updated;
        });
    }, []);

    return {
        state,
        updateState,
        isController: role === 'controller'
    };
};
