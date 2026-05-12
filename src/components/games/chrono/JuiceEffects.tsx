import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

export type EraColorKey = 'amber' | 'emerald' | 'rose' | 'indigo';

const ERA_HEX: Record<EraColorKey, string[]> = {
    amber: ['#f59e0b', '#fbbf24', '#fde68a', '#fff7ed'],
    emerald: ['#10b981', '#34d399', '#a7f3d0', '#ecfdf5'],
    rose: ['#f43f5e', '#fb7185', '#fecdd3', '#fff1f2'],
    indigo: ['#4f46e5', '#818cf8', '#c7d2fe', '#eef2ff'],
};

interface JuiceEffectsProps {
    color: EraColorKey;
    points: number;
    streakActive: boolean;
}

export const JuiceEffects: React.FC<JuiceEffectsProps> = ({ color, points, streakActive }) => {
    const reduced = useReducedMotion();
    const palette = ERA_HEX[color];

    const [particles] = useState(() => {
        const count = reduced ? 0 : 14;
        return Array.from({ length: count }).map((_, i) => {
            const angle = (i / Math.max(count, 1)) * Math.PI * 2;
            const distance = 50 + Math.random() * 40;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            const size = 6 + Math.random() * 6;
            const colorIdx = Math.floor(Math.random() * palette.length);
            const rotate = (Math.random() - 0.5) * 360;
            return { dx, dy, size, color: palette[colorIdx], rotate, delay: i * 0.012 };
        });
    });

    return (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible">
            {/* Score popup */}
            <motion.div
                initial={{ y: 0, opacity: 0, scale: 0.6 }}
                animate={reduced ? { opacity: 1, y: -30 } : { y: -70, opacity: [0, 1, 1, 0], scale: [0.6, 1.3, 1, 0.9] }}
                transition={{ duration: reduced ? 0.4 : 1.0, ease: 'easeOut', times: reduced ? undefined : [0, 0.2, 0.7, 1] }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
            >
                <div
                    className="font-black text-3xl drop-shadow-lg flex items-center gap-1"
                    style={{ color: palette[0], textShadow: '0 2px 8px rgba(255,255,255,0.9)' }}
                >
                    +{points}
                    {streakActive && (
                        <span className="text-xs font-black uppercase tracking-widest ml-1 bg-white/80 px-1.5 py-0.5 rounded-md">
                            streak
                        </span>
                    )}
                </div>
            </motion.div>

            {/* Particle burst */}
            {particles.map((p, i) => (
                <motion.span
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
                    animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 1, rotate: p.rotate }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: p.delay }}
                    className="absolute rounded-sm"
                    style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        boxShadow: `0 0 8px ${p.color}`,
                    }}
                />
            ))}

            {/* Soft glow ring */}
            {!reduced && (
                <motion.div
                    initial={{ opacity: 0.7, scale: 0.3 }}
                    animate={{ opacity: 0, scale: 1.8 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
                    style={{ background: `radial-gradient(circle, ${palette[1]}66 0%, transparent 70%)` }}
                />
            )}
        </div>
    );
};
