// @ts-nocheck
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { Scene } from './Scene';
import { UIOverlay } from './UIOverlay';
import { useGameStore } from './store';
import { Loader } from '@react-three/drei';

export default function ChronoGliderPage() {
    const { setEvents } = useGameStore();

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
                    }))
                    // Sort by year just in case, or shuffle for random gameplay?
                    // "Chrono Glider" implies gliding through history. Chronological order makes sense?
                    // Or random quiz mode. Let's do Chronological for now, or random subset.
                    // Game loop handles simplified "Next Event".
                    // Let's Shuffle for replayability!
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 10); // Take 10 random events for a "Session"

                setEvents(validEvents);
            })
            .catch(err => console.error("Failed to load timeline", err));
    }, [setEvents]);

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
