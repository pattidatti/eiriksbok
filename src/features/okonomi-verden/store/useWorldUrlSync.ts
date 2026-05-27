import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorldStore } from './worldStore';
import type { ViewKind } from '../types';
import { CAPSULES } from '../data/presets';

const ALL_VIEWS: ViewKind[] = ['live', 'cockpit', 'triangle', 'village', 'capsules', 'atlas'];

export function useWorldUrlSync(): void {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeView = useWorldStore((s) => s.activeView);
    const presetId = useWorldStore((s) => s.presetId);
    const setActiveView = useWorldStore((s) => s.setActiveView);
    const loadPreset = useWorldStore((s) => s.loadPreset);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const viewParam = searchParams.get('view');
        if (viewParam && ALL_VIEWS.includes(viewParam as ViewKind)) {
            setActiveView(viewParam as ViewKind);
        }

        const presetParam = searchParams.get('preset');
        if (presetParam) {
            const capsule = CAPSULES.find((c) => c.id === presetParam);
            if (capsule) {
                loadPreset(
                    capsule.id,
                    capsule.initialControls ?? {},
                    capsule.initialState?.avgTimePreference,
                    capsule.initialState?.M
                );
            }
        }
    }, [searchParams, setActiveView, loadPreset]);

    useEffect(() => {
        if (!initializedRef.current) return;
        const next = new URLSearchParams(searchParams);
        next.set('view', activeView);
        if (presetId) {
            next.set('preset', presetId);
        } else {
            next.delete('preset');
        }
        if (next.toString() !== searchParams.toString()) {
            setSearchParams(next, { replace: true });
        }
    }, [activeView, presetId, searchParams, setSearchParams]);
}
