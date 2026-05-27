import { useEffect, useRef, useState } from 'react';
import { useWorldStore } from '../store/worldStore';

interface Particle {
    id: number;
    fromIdx: number;
    toIdx: number;
    progress: number;
    speed: number;
    color: string;
    radius: number;
}

interface FlowParticlesProps {
    width: number;
    height: number;
    stagePositions: { x: number; y: number }[];
    intensity?: number;
}

const PARTICLE_COLORS = {
    money: '#f59e0b',
    capital: '#6366f1',
    labor: '#10b981',
};

export function FlowParticles({ width, height, stagePositions, intensity = 1 }: FlowParticlesProps) {
    const [particles, setParticles] = useState<Particle[]>([]);
    const nextIdRef = useRef(0);
    const lastEmitRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const positionsRef = useRef(stagePositions);
    const intensityRef = useRef(intensity);

    useEffect(() => {
        positionsRef.current = stagePositions;
    }, [stagePositions]);
    useEffect(() => {
        intensityRef.current = intensity;
    }, [intensity]);

    // Subscribe to store values via refs so the RAF loop never restarts.
    const stateRef = useRef({
        moneyGrowth: 0,
        freeMarket: false,
        phase: 'expansion' as 'expansion' | 'boom' | 'bust' | 'recovery',
        stageActivity: [1, 1, 1, 1, 1] as number[],
    });
    useEffect(() => {
        const sync = () => {
            const s = useWorldStore.getState();
            stateRef.current.moneyGrowth = s.controls.moneyGrowth;
            stateRef.current.freeMarket = s.controls.freeMarket;
            stateRef.current.phase = s.sim.phase;
            stateRef.current.stageActivity = s.sim.stages.map((st) => Math.max(0.1, st.output / 120));
        };
        sync();
        const unsub = useWorldStore.subscribe(sync);
        return unsub;
    }, []);

    useEffect(() => {
        let last = performance.now();
        const loop = (now: number) => {
            const dt = now - last;
            last = now;

            setParticles((prev) => {
                const next = prev
                    .map((p) => ({ ...p, progress: p.progress + (p.speed * dt) / 1000 }))
                    .filter((p) => p.progress < 1);

                const positions = positionsRef.current;
                const { moneyGrowth, freeMarket, phase, stageActivity } = stateRef.current;
                const elapsed = now - lastEmitRef.current;
                const emitInterval = Math.max(180, 600 - intensityRef.current * 200 - moneyGrowth * 800);
                if (elapsed > emitInterval && positions.length >= 2) {
                    lastEmitRef.current = now;
                    const particlesToEmit = Math.max(1, Math.round(intensityRef.current * 1.5));
                    for (let i = 0; i < particlesToEmit; i++) {
                        const isMoney = Math.random() < (freeMarket ? 0.4 : 0.55);
                        let fromIdx: number;
                        let toIdx: number;
                        if (isMoney) {
                            const start = Math.floor(Math.random() * positions.length);
                            fromIdx = start;
                            toIdx = Math.max(0, start - 1);
                            if (fromIdx === toIdx) toIdx = Math.min(positions.length - 1, start + 1);
                        } else {
                            const start = Math.floor(Math.random() * (positions.length - 1));
                            fromIdx = start;
                            toIdx = start + 1;
                        }
                        const color = isMoney
                            ? PARTICLE_COLORS.money
                            : Math.random() < 0.5
                                ? PARTICLE_COLORS.labor
                                : PARTICLE_COLORS.capital;
                        const activityFrom = stageActivity[fromIdx] ?? 1;
                        const radius = 2 + activityFrom * 1.5;
                        const speedFactor = phase === 'bust' ? 0.4 : phase === 'boom' ? 1.4 : 1;
                        const particleSpeed = (0.45 + Math.random() * 0.4) * speedFactor;
                        next.push({
                            id: ++nextIdRef.current,
                            fromIdx,
                            toIdx,
                            progress: 0,
                            speed: particleSpeed,
                            color,
                            radius,
                        });
                    }
                }

                if (next.length > 80) return next.slice(next.length - 80);
                return next;
            });

            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
        >
            <defs>
                <filter id="flow-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            {particles.map((p) => {
                const from = stagePositions[p.fromIdx];
                const to = stagePositions[p.toIdx];
                if (!from || !to) return null;
                const t = p.progress;
                const cx = from.x + (to.x - from.x) * t;
                const cy = from.y + (to.y - from.y) * t - Math.sin(t * Math.PI) * 14;
                const opacity = t < 0.1 ? t * 10 : t > 0.85 ? (1 - t) * 6.66 : 1;
                return (
                    <circle
                        key={p.id}
                        cx={cx}
                        cy={cy}
                        r={p.radius}
                        fill={p.color}
                        opacity={opacity * 0.85}
                        filter="url(#flow-glow)"
                    />
                );
            })}
        </svg>
    );
}
