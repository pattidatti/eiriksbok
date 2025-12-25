import React from 'react';
import { motion } from 'framer-motion';
import { dilemmas } from '../../../../data/ethics/dilemmas';

interface MoralCompassProps {
    choices: Record<string, string>;
}

export const MoralCompass: React.FC<MoralCompassProps> = ({ choices }) => {
    // Calculate weights for each system
    const systemScores: Record<string, number> = {};
    // categories list used for charting
    const categories = [
        { id: 'utilitarianism', label: 'Konsekvens' },
        { id: 'deontology', label: 'Plikt' },
        { id: 'virtue-ethics', label: 'Dyd' },
        { id: 'social-contract', label: 'Kontrakt' },
        { id: 'existentialism', label: 'Frihet' },
        { id: 'christianity', label: 'Barmhjertighet' }
    ];

    categories.forEach(cat => systemScores[cat.id] = 0);

    let totalWeight = 0;

    Object.entries(choices).forEach(([dilemmaId, choiceId]) => {
        const dilemma = dilemmas.find(d => d.id === dilemmaId);
        const choice = dilemma?.choices.find(c => c.id === choiceId);

        choice?.responses.forEach(resp => {
            const weight = resp.verdict === 'accept' ? 1 : resp.verdict === 'complex' ? 0.5 : resp.verdict === 'nuanced' ? 0.4 : 0;
            if (systemScores[resp.systemId] !== undefined) {
                systemScores[resp.systemId] += weight;
            }
        });
        totalWeight += 1;
    });

    const size = 300;
    const center = size / 2;
    const radius = size * 0.4;

    const getPoint = (index: number, value: number) => {
        const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
        const normalizedValue = Math.min(value / (totalWeight || 1), 1) * 0.8 + 0.2; // Min viewable
        const x = center + radius * normalizedValue * Math.cos(angle);
        const y = center + radius * normalizedValue * Math.sin(angle);
        return { x, y };
    };

    const points = categories.map((cat, i) => getPoint(i, systemScores[cat.id] || 0));
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Background Circles */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((step, i) => (
                    <circle
                        key={i}
                        cx={center}
                        cy={center}
                        r={radius * step}
                        fill="none"
                        stroke="white"
                        strokeOpacity="0.05"
                        strokeDasharray={i === 4 ? "0" : "4 4"}
                    />
                ))}

                {/* Axis Lines */}
                {categories.map((_, i) => {
                    const p = getPoint(i, totalWeight);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={p.x}
                            y2={p.y}
                            stroke="white"
                            strokeOpacity="0.05"
                        />
                    );
                })}

                {/* The Shape */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    d={pathData}
                    fill="rgba(99, 102, 241, 0.3)"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeLinejoin="round"
                />

                {/* Labels */}
                {categories.map((cat, i) => {
                    const p = getPoint(i, totalWeight * 1.25);
                    return (
                        <text
                            key={i}
                            x={p.x}
                            y={p.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[10px] font-black uppercase tracking-widest fill-slate-400"
                        >
                            {cat.label}
                        </text>
                    );
                })}
            </svg>

            {/* Central Glow */}
            <div className="absolute w-4 h-4 bg-indigo-500 rounded-full blur-md opacity-50" />
        </div>
    );
};
