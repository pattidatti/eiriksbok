import { useEffect, useRef } from 'react';
import { useWorldStore } from './worldStore';

const TICK_INTERVAL_MS = 100;

export function useWorldTick(): void {
    const speed = useWorldStore((s) => s.speed);
    const advance = useWorldStore((s) => s.advanceTicks);
    const accumulatorRef = useRef(0);
    const lastTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (speed === 0) {
            lastTimeRef.current = null;
            return;
        }

        const loop = (now: number) => {
            if (lastTimeRef.current === null) {
                lastTimeRef.current = now;
            }
            const dt = now - lastTimeRef.current;
            lastTimeRef.current = now;
            accumulatorRef.current += dt * speed;

            let stepsThisFrame = 0;
            const maxStepsPerFrame = 12;
            while (accumulatorRef.current >= TICK_INTERVAL_MS && stepsThisFrame < maxStepsPerFrame) {
                accumulatorRef.current -= TICK_INTERVAL_MS;
                stepsThisFrame++;
            }

            if (stepsThisFrame > 0) {
                advance(stepsThisFrame);
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [speed, advance]);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) {
                const current = useWorldStore.getState().speed;
                if (current !== 0) {
                    useWorldStore.setState({ speed: 0 });
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);
}
