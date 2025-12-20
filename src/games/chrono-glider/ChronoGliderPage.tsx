// @ts-nocheck
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { Scene } from './Scene';
import { UIOverlay } from './UIOverlay';
import { useGameStore } from './store';
import { Loader } from '@react-three/drei';

import { AudioManager } from './systems/AudioManager';
import { useLayout } from '../../context/LayoutContext';

export default function ChronoGliderPage() {
    const { setAllEvents } = useGameStore();
    const { setFullWidth } = useLayout();

    useEffect(() => {
        setFullWidth(true);
        return () => setFullWidth(false);
    }, [setFullWidth]);

    useEffect(() => {
        // Init audio
        const handleInteraction = () => {
            AudioManager.getInstance().resume();
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    useEffect(() => {
        // Fetch timeline data
        fetch('/content/global-timeline.json')
            .then(res => res.json())
            .then((data: any[]) => {
                // Filter valid events (must have year/startDate)
                // Transform to simplified format
                const validEvents = data
                    .filter(d => d.startDate !== undefined && (d.title || d.id))
                    .map(d => ({
                        id: d.id,
                        title: d.title || d.id,
                        year: parseInt(d.startDate), // Simplified: assume startDate is year for now.
                        // Note: global-timeline uses negative numbers for BCE.
                        description: d.description || "",
                        displayDate: d.displayDate
                    }));

                setAllEvents(validEvents);
            })
            .catch(err => console.error("Failed to load timeline", err));
    }, [setAllEvents]);

    return (
        <div className="w-full h-screen bg-slate-900 overflow-hidden relative">
            <Canvas
                shadows
                camera={{ position: [0, 2, 10], fov: 60 }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>
            <Loader />
            <UIOverlay />
        </div>
    );
}
