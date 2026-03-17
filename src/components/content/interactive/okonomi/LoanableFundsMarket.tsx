import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const NATURAL_RATE = 5;
const SVG_W = 400;
const SVG_H = 280;
const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
const PLOT_W = SVG_W - PAD.left - PAD.right;
const PLOT_H = SVG_H - PAD.top - PAD.bottom;

// Supply: upward sloping (more savings when rate is high)
const supplyY = (rate: number) => PAD.top + PLOT_H - (rate / 12) * PLOT_H;
const supplyX = (rate: number) => PAD.left + (rate / 12) * PLOT_W;

// Demand: downward sloping (more borrowing when rate is low)
const demandY = (rate: number) => PAD.top + PLOT_H - (rate / 12) * PLOT_H;
const demandX = (rate: number) => PAD.left + PLOT_W - (rate / 12) * PLOT_W;

function buildCurvePath(xFn: (r: number) => number, yFn: (r: number) => number) {
    const points: string[] = [];
    for (let r = 0.5; r <= 11.5; r += 0.5) {
        const x = xFn(r);
        const y = yFn(r);
        points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
}

type Phase = 'equilibrium' | 'mild' | 'bubble' | 'tight';

function getPhase(centralRate: number): Phase {
    const diff = centralRate - NATURAL_RATE;
    if (diff >= -0.5 && diff <= 0.5) return 'equilibrium';
    if (diff < -0.5 && diff >= -2.5) return 'mild';
    if (diff < -2.5) return 'bubble';
    return 'tight';
}

const phaseConfig: Record<Phase, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string; title: string; text: string }> = {
    equilibrium: {
        icon: CheckCircle,
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        title: 'Likevekt',
        text: 'Sparing og investering er i balanse. Renten gjenspeiler samfunnets tålmodighet. Entreprenører investerer bare i prosjekter som folk faktisk har spart nok til å bære.',
    },
    mild: {
        icon: TrendingDown,
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        title: 'Kredittekspansjon',
        text: 'Bankene låner ut mer enn folk faktisk sparer. Nye prosjekter starter overalt, men ressursene finnes ikke. Prisene begynner å stige.',
    },
    bubble: {
        icon: AlertTriangle,
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        title: 'Boble dannes',
        text: 'Eiendeler og aksjer stiger langt raskere enn realverdiene. Alle tror de er rike, men rikdommen er en illusjon bygget på billige lån. Korreksjon er uunngåelig.',
    },
    tight: {
        icon: TrendingUp,
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        title: 'Stram rente',
        text: 'Renten er over den naturlige raten. Prosjekter avlyses, eiendeler selges. Markedet rydder opp i tidligere feilinvesteringer.',
    },
};

export const LoanableFundsMarket: React.FC = () => {
    const [centralRate, setCentralRate] = useState(NATURAL_RATE);
    const phase = getPhase(centralRate);
    const config = phaseConfig[phase];
    const Icon = config.icon;

    // Equilibrium point coordinates
    const eqX = supplyX(NATURAL_RATE);
    const eqY = supplyY(NATURAL_RATE);

    // Central bank rate line Y position
    const cbY = PAD.top + PLOT_H - (centralRate / 12) * PLOT_H;

    // Gap polygon: area between CB rate line and equilibrium
    const gapPolygon = useMemo(() => {
        if (centralRate >= NATURAL_RATE - 0.5) return null;
        // Quantity supplied at CB rate (less savings)
        const qSupply = supplyX(centralRate);
        // Quantity demanded at CB rate (more borrowing)
        const qDemand = demandX(centralRate);
        return `${qSupply},${cbY} ${qDemand},${cbY} ${eqX},${eqY}`;
    }, [centralRate, cbY, eqX, eqY]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 my-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
                Utlånsmarkedet: Sparing møter investering
            </h3>
            <p className="text-slate-500 text-sm mb-6">
                Dra slideren for å se hva som skjer når sentralbanken setter renten under eller over den naturlige renten.
            </p>

            {/* SVG Diagram */}
            <div className="w-full overflow-x-auto mb-4">
                <svg
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    className="w-full max-w-[500px] mx-auto"
                    aria-label="Tilbud- og etterspørselsdiagram for utlånsmarkedet"
                >
                    {/* Axes */}
                    <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT_H} stroke="#94a3b8" strokeWidth={1.5} />
                    <line x1={PAD.left} y1={PAD.top + PLOT_H} x2={PAD.left + PLOT_W} y2={PAD.top + PLOT_H} stroke="#94a3b8" strokeWidth={1.5} />

                    {/* Axis labels */}
                    <text x={PAD.left - 8} y={PAD.top - 6} textAnchor="middle" className="fill-slate-500" fontSize={11} fontWeight={600}>Rente</text>
                    <text x={PAD.left + PLOT_W} y={PAD.top + PLOT_H + 30} textAnchor="end" className="fill-slate-500" fontSize={11} fontWeight={600}>Mengde kapital</text>

                    {/* Gap polygon */}
                    {gapPolygon && (
                        <polygon
                            points={gapPolygon}
                            fill="rgba(239, 68, 68, 0.12)"
                            stroke="rgba(239, 68, 68, 0.3)"
                            strokeWidth={1}
                            strokeDasharray="4 2"
                        />
                    )}
                    {gapPolygon && (
                        <text
                            x={(supplyX(centralRate) + demandX(centralRate)) / 2}
                            y={cbY - 6}
                            textAnchor="middle"
                            className="fill-red-500"
                            fontSize={10}
                            fontWeight={600}
                        >
                            Feilinvesteringsgap
                        </text>
                    )}

                    {/* Supply curve */}
                    <path
                        d={buildCurvePath(supplyX, supplyY)}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                    />
                    <text x={supplyX(10) + 4} y={supplyY(10) - 4} className="fill-emerald-600" fontSize={10} fontWeight={600}>Sparing</text>

                    {/* Demand curve */}
                    <path
                        d={buildCurvePath(demandX, demandY)}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                    />
                    <text x={demandX(10) - 4} y={demandY(10) - 4} textAnchor="end" className="fill-indigo-600" fontSize={10} fontWeight={600}>Investering</text>

                    {/* Natural rate equilibrium dot */}
                    <circle cx={eqX} cy={eqY} r={6} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
                    <text x={eqX + 10} y={eqY - 8} className="fill-amber-600" fontSize={10} fontWeight={700}>
                        Naturlig rente ({NATURAL_RATE}%)
                    </text>

                    {/* Central bank rate line */}
                    <line
                        x1={PAD.left}
                        y1={cbY}
                        x2={PAD.left + PLOT_W}
                        y2={cbY}
                        stroke={phase === 'equilibrium' ? '#10b981' : phase === 'tight' ? '#3b82f6' : '#ef4444'}
                        strokeWidth={2}
                        strokeDasharray="6 4"
                    />
                    <text
                        x={PAD.left + PLOT_W - 4}
                        y={cbY - 6}
                        textAnchor="end"
                        fill={phase === 'equilibrium' ? '#10b981' : phase === 'tight' ? '#3b82f6' : '#ef4444'}
                        fontSize={10}
                        fontWeight={700}
                    >
                        Sentralbank ({centralRate.toFixed(1)}%)
                    </text>
                </svg>
            </div>

            {/* Slider */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between mb-2">
                    <label className="font-medium text-slate-700 text-sm">Sentralbankens styringsrente</label>
                    <span className="font-bold text-indigo-600">{centralRate.toFixed(1)}%</span>
                </div>
                <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={centralRate}
                    onChange={(e) => setCentralRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0,5% (Svart lav)</span>
                    <span>Naturlig ({NATURAL_RATE}%)</span>
                    <span>10% (Svart høy)</span>
                </div>
            </div>

            {/* Consequence panel */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={phase}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className={`p-4 rounded-xl border ${config.bg} ${config.border}`}
                >
                    <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 shrink-0 mt-0.5 ${config.color}`} />
                        <div>
                            <h4 className={`font-bold ${config.color} mb-1`}>{config.title}</h4>
                            <p className="text-sm text-slate-700 leading-relaxed">{config.text}</p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
