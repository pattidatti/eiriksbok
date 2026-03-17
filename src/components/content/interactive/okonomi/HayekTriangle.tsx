import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';

const STAGES = [
    { label: 'Forbruksvarer', color: '#10b981', baseWidth: 1.0 },
    { label: 'Handel og distribusjon', color: '#3b82f6', baseWidth: 0.8 },
    { label: 'Maskiner og utstyr', color: '#f59e0b', baseWidth: 0.6 },
    { label: 'Halvfabrikata', color: '#ef4444', baseWidth: 0.4 },
    { label: 'Råvarer og gruvedrift', color: '#8b5cf6', baseWidth: 0.25 },
];

const BAR_H = 32;
const GAP = 6;
const MAX_BAR_W = 280;

type Phase = 'low' | 'natural' | 'high';

function getPhase(rate: number): Phase {
    if (rate < 4) return 'low';
    if (rate > 7) return 'high';
    return 'natural';
}

const phaseConfig: Record<Phase, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string; title: string; text: string }> = {
    low: {
        icon: AlertTriangle,
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        title: 'Kunstig lav rente',
        text: 'Ressurser flommer inn i langsiktige prosjekter (bygging, teknologi, gruvedrift). Forbruksvareprodusentene mangler arbeidskraft og materialer. Priser stiger. En boble bygges opp.',
    },
    natural: {
        icon: CheckCircle,
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        title: 'Naturlig likevekt',
        text: 'Fordelingen av ressurser mellom konsum og langsiktig investering gjenspeiler det folk faktisk sparer og ønsker. Bærekraftig vekst.',
    },
    high: {
        icon: TrendingDown,
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        title: 'Stram rente',
        text: 'Ressurser holdes nært konsumsiden. Langsiktige investeringsprosjekter utsettes eller avlyses. Veksten bremser, men produksjonsstrukturen er realistisk.',
    },
};

export const HayekTriangle: React.FC = () => {
    const [interestRate, setInterestRate] = useState(5);
    const phase = getPhase(interestRate);
    const config = phaseConfig[phase];
    const Icon = config.icon;

    // Distortion factor: low rates stretch higher-order stages, shrink consumer goods
    // At natural rate (5), factor is 0 (no distortion)
    // At rate 1, factor is ~0.5 (large distortion toward capital goods)
    // At rate 10, factor is ~-0.3 (slight tilt toward consumer goods)
    const distortion = (5 - interestRate) * 0.1;

    const getBarWidth = (baseWidth: number, stageIndex: number) => {
        // Higher stageIndex = higher order (further from consumer)
        // Positive distortion (low rate) grows higher-order stages, shrinks lower
        const orderFactor = (stageIndex - 2) / 2; // -1 to +1
        const adjusted = baseWidth + distortion * orderFactor;
        return Math.max(0.1, Math.min(1.2, adjusted)) * MAX_BAR_W;
    };

    const totalH = STAGES.length * (BAR_H + GAP) - GAP;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 my-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-600" />
                Hayeks produksjonstriangel
            </h3>
            <p className="text-slate-500 text-sm mb-6">
                Se hvordan rentenivået endrer kapitalstrukturen i økonomien. Når renten presses ned, flyter ressurser bort fra forbruksvarer og inn i langsiktige prosjekter.
            </p>

            {/* Triangle visualization */}
            <div className="mb-6 overflow-x-auto">
                <div className="min-w-[340px] max-w-[500px] mx-auto">
                    {/* Axis labels */}
                    <div className="flex justify-between text-xs text-slate-400 font-medium mb-2 px-1">
                        <span>Nær forbruker (i dag)</span>
                        <span>Langt fra forbruker (fremtid)</span>
                    </div>

                    {/* Bars */}
                    <div className="relative" style={{ height: totalH }}>
                        {STAGES.map((stage, i) => {
                            const w = getBarWidth(stage.baseWidth, i);
                            return (
                                <div
                                    key={stage.label}
                                    className="absolute left-0 flex items-center"
                                    style={{ top: i * (BAR_H + GAP), height: BAR_H }}
                                >
                                    <motion.div
                                        className="h-full rounded-r-lg flex items-center px-3 overflow-hidden"
                                        style={{ backgroundColor: stage.color }}
                                        initial={false}
                                        animate={{ width: w }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                    >
                                        <span className="text-white text-xs font-semibold whitespace-nowrap drop-shadow-sm">
                                            {stage.label}
                                        </span>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Stage order labels */}
                    <div className="flex justify-between text-xs text-slate-400 mt-3 px-1">
                        <span>Lavordenskapital</span>
                        <span>Høyordenskapital</span>
                    </div>
                </div>
            </div>

            {/* Slider */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between mb-2">
                    <label className="font-medium text-slate-700 text-sm">Rentenivå</label>
                    <span className="font-bold text-indigo-600">{interestRate}%</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1% (Kunstig lav)</span>
                    <span>5% (Naturlig)</span>
                    <span>10% (Høy)</span>
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
