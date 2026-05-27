import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, Compass } from 'lucide-react';
import { useStepSounds } from '../../../hooks/useStepSounds';
import type { MapQuestHotspot } from '../../../types';
import type { StepRendererProps } from './types';

interface ClickedHotspot {
    id: string;
    correct: boolean;
    clickedAtOrder: number;  // brukerens rekkefølge (1-indeksert)
}

export const MapQuestStep: React.FC<StepRendererProps> = ({
    step,
    onComplete,
    isAlreadyCompleted,
}) => {
    const quest = step.mapQuest;
    const sounds = useStepSounds();
    const [clicked, setClicked] = useState<ClickedHotspot[]>([]);
    const [done, setDone] = useState(isAlreadyCompleted);

    const hotspots = useMemo(
        () => [...(quest?.hotspots ?? [])].sort((a, b) => a.order - b.order),
        [quest]
    );
    const total = hotspots.length;
    const viewBox = quest?.viewBox ?? '0 0 1000 600';

    if (!quest || total === 0) {
        return (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 text-rose-900">
                Kart-oppdraget mangler hotspots.
            </div>
        );
    }

    const nextExpectedOrder = clicked.length + 1;
    const correctCount = clicked.filter((c) => c.correct).length;

    const handleClick = (hotspot: MapQuestHotspot) => {
        if (done) return;
        if (clicked.some((c) => c.id === hotspot.id)) return;

        const isCorrect = hotspot.order === nextExpectedOrder;
        sounds.play(isCorrect ? 'correct' : 'incorrect');

        const next: ClickedHotspot[] = [
            ...clicked,
            { id: hotspot.id, correct: isCorrect, clickedAtOrder: nextExpectedOrder },
        ];
        setClicked(next);

        if (next.length === total) {
            const score = next.filter((c) => c.correct).length / total;
            setTimeout(() => {
                sounds.play('complete');
                setDone(true);
                onComplete({
                    score,
                    completed: true,
                    artifact: { clicked: next, total },
                });
            }, 700);
        }
    };

    const handleRetry = () => {
        setClicked([]);
        setDone(false);
    };

    const hotspotState = (h: MapQuestHotspot) => {
        const click = clicked.find((c) => c.id === h.id);
        if (!click) return 'idle';
        return click.correct ? 'correct' : 'wrong';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-4 md:p-6 shadow-sm"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                    <Compass className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                        Kart-oppdrag
                    </span>
                    <p className="text-xs text-slate-600">
                        Klikk hotspots i kronologisk rekkefølge
                    </p>
                </div>
                <div className="ml-auto text-xs font-mono text-slate-600">
                    {clicked.length} / {total}
                </div>
            </div>

            {/* Kart */}
            <div className="relative bg-[#e8d8b8] rounded-xl border-2 border-amber-300 overflow-hidden shadow-inner">
                <svg
                    viewBox={viewBox}
                    className="w-full h-auto block"
                    style={{ aspectRatio: '5 / 3' }}
                >
                    {/* Stilisert middelhavskart-bakgrunn */}
                    <defs>
                        <pattern
                            id="map-grid"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="rgba(120, 80, 30, 0.08)"
                                strokeWidth="1"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#map-grid)" />

                    {/* Stilisert hav-overlay */}
                    <ellipse cx="500" cy="380" rx="380" ry="100" fill="rgba(70, 130, 180, 0.18)" />
                    <ellipse cx="500" cy="380" rx="300" ry="70" fill="rgba(70, 130, 180, 0.25)" />

                    {/* Hotspot-linjer mellom korrekt klikket */}
                    {(() => {
                        const correctClicks = clicked.filter((c) => c.correct);
                        const points = correctClicks
                            .map((c) => hotspots.find((h) => h.id === c.id))
                            .filter(Boolean) as MapQuestHotspot[];
                        if (points.length < 2) return null;
                        const w = parseFloat(viewBox.split(' ')[2]);
                        const h = parseFloat(viewBox.split(' ')[3]);
                        const path = points
                            .map((p, i) => {
                                const x = (p.x / 100) * w;
                                const y = (p.y / 100) * h;
                                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                            })
                            .join(' ');
                        return (
                            <motion.path
                                d={path}
                                fill="none"
                                stroke="#b45309"
                                strokeWidth="3"
                                strokeDasharray="6 4"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.6 }}
                            />
                        );
                    })()}

                    {/* Hotspots */}
                    {hotspots.map((h) => {
                        const state = hotspotState(h);
                        const w = parseFloat(viewBox.split(' ')[2]);
                        const ht = parseFloat(viewBox.split(' ')[3]);
                        const cx = (h.x / 100) * w;
                        const cy = (h.y / 100) * ht;
                        const click = clicked.find((c) => c.id === h.id);

                        return (
                            <Hotspot
                                key={h.id}
                                cx={cx}
                                cy={cy}
                                label={h.label}
                                state={state}
                                clickedOrder={click?.clickedAtOrder}
                                onClick={() => handleClick(h)}
                                disabled={done || state !== 'idle'}
                            />
                        );
                    })}
                </svg>

                {/* Hjelpelinje når feil */}
                {clicked.length > 0 && clicked[clicked.length - 1].correct === false && !done && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-3 left-3 right-3 px-3 py-2 bg-rose-100 border border-rose-300 rounded-lg text-rose-900 text-xs font-semibold text-center"
                    >
                        Den hendelsen kom ikke der i kronologien. Prøv en annen!
                    </motion.div>
                )}
            </div>

            {/* Status og knapper */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
                {done ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-bold">
                            {correctCount}/{total} på riktig sted
                            {quest.completionMessage ? ` — ${quest.completionMessage}` : ''}
                        </span>
                    </div>
                ) : (
                    <div className="text-xs text-slate-600 italic">
                        Velg det som skjedde først, så det neste, osv.
                    </div>
                )}
                {clicked.length > 0 && !done && (
                    <button
                        onClick={handleRetry}
                        className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Start på nytt
                    </button>
                )}
            </div>

            {/* Avslørt detail */}
            <AnimatePresence>
                {clicked.length > 0 && (() => {
                    const last = clicked[clicked.length - 1];
                    const hotspot = hotspots.find((h) => h.id === last.id);
                    if (!hotspot?.detail || !last.correct) return null;
                    return (
                        <motion.div
                            key={last.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 bg-white border border-amber-200 rounded-xl p-4"
                        >
                            <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
                                {hotspot.label}
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {hotspot.detail}
                            </p>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>
        </motion.div>
    );
};

interface HotspotProps {
    cx: number;
    cy: number;
    label: string;
    state: 'idle' | 'correct' | 'wrong';
    clickedOrder?: number;
    onClick: () => void;
    disabled: boolean;
}

const Hotspot: React.FC<HotspotProps> = ({ cx, cy, label, state, clickedOrder, onClick, disabled }) => {
    const colors = {
        idle: { fill: '#fef3c7', stroke: '#b45309', text: '#7c2d12' },
        correct: { fill: '#bbf7d0', stroke: '#15803d', text: '#14532d' },
        wrong: { fill: '#fecaca', stroke: '#b91c1c', text: '#7f1d1d' },
    }[state];

    return (
        <g
            onClick={disabled ? undefined : onClick}
            style={{ cursor: disabled ? 'default' : 'pointer' }}
        >
            {state === 'idle' && (
                <circle
                    cx={cx}
                    cy={cy}
                    r="22"
                    fill={colors.fill}
                    opacity="0.5"
                >
                    <animate
                        attributeName="r"
                        from="18"
                        to="28"
                        dur="1.6s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        from="0.5"
                        to="0"
                        dur="1.6s"
                        repeatCount="indefinite"
                    />
                </circle>
            )}
            <motion.circle
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                whileHover={disabled ? undefined : { scale: 1.15 }}
                cx={cx}
                cy={cy}
                r="14"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="3"
            />
            {clickedOrder !== undefined && (
                <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill={colors.text}
                    pointerEvents="none"
                >
                    {clickedOrder}
                </text>
            )}
            <text
                x={cx}
                y={cy - 22}
                textAnchor="middle"
                fontSize="13"
                fontWeight="600"
                fill="#3a2418"
                pointerEvents="none"
                style={{ paintOrder: 'stroke', stroke: '#f6efe2', strokeWidth: 3 }}
            >
                {label}
            </text>
        </g>
    );
};
