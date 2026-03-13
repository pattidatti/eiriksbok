import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronRight, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import type { ChronosEffect } from '../../../data/chronos/types';

interface PropagandaOption {
    id: string;
    label: string;
    description: string;
    credibilityChange: number;
    setsFlag?: string;
    effects?: ChronosEffect;
}

interface PropagandaItem {
    id: string;
    headline: string;
    realFacts: string;
    options: PropagandaOption[];
}

interface PropagandaGameProps {
    config: {
        onComplete: { nextNodeId: string };
        outlet: string;
        outletType: 'soviet' | 'western';
        date: string;
        items: PropagandaItem[];
    };
    onComplete: (result: { setFlags: string[]; effects: ChronosEffect }) => void;
}

export const PropagandaGame: React.FC<PropagandaGameProps> = ({ config, onComplete }) => {
    const [itemIndex, setItemIndex] = useState(0);
    const [chosenOptions, setChosenOptions] = useState<PropagandaOption[]>([]);
    const [phase, setPhase] = useState<'choosing' | 'feedback' | 'summary'>('choosing');
    const [lastChosen, setLastChosen] = useState<PropagandaOption | null>(null);
    const [credibility, setCredibility] = useState(50);
    const [finishing, setFinishing] = useState(false);

    const { items, outlet, outletType, date } = config;
    const currentItem = items[itemIndex];
    const isSoviet = outletType === 'soviet';
    const totalItems = items.length;

    const headerBg = isSoviet ? 'bg-red-950' : 'bg-zinc-900';
    const accentText = isSoviet ? 'text-red-300' : 'text-amber-400';
    const progressColor =
        credibility > 60 ? 'bg-emerald-400' : credibility > 30 ? 'bg-amber-400' : 'bg-red-400';

    const handleChoose = (option: PropagandaOption) => {
        if (phase !== 'choosing') return;
        setLastChosen(option);
        setChosenOptions((prev) => [...prev, option]);
        setCredibility((prev) => Math.max(0, Math.min(100, prev + option.credibilityChange)));
        setPhase('feedback');
    };

    const handleNext = () => {
        if (itemIndex + 1 >= totalItems) {
            setPhase('summary');
        } else {
            setItemIndex((i) => i + 1);
            setLastChosen(null);
            setPhase('choosing');
        }
    };

    const handleFinish = () => {
        if (finishing) return;
        setFinishing(true);
        const setFlags = chosenOptions.flatMap((o) => (o.setsFlag ? [o.setsFlag] : []));
        const effects: ChronosEffect = {};
        for (const opt of chosenOptions) {
            if (opt.effects) {
                for (const [k, v] of Object.entries(opt.effects)) {
                    effects[k] = (effects[k] ?? 0) + v;
                }
            }
        }
        setTimeout(() => onComplete({ setFlags, effects }), 1200);
    };

    /* ── Summary screen ─────────────────────────────────────────────── */
    if (phase === 'summary') {
        const credLabel =
            credibility > 70
                ? 'God troverdighet'
                : credibility > 40
                  ? 'Svekket troverdighet'
                  : 'Lav troverdighet';

        return (
            <div className="bg-stone-100 rounded-3xl border border-stone-200 overflow-hidden">
                <div className={`${headerBg} px-4 py-3`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${accentText} mb-0.5`}>
                        {outlet}
                    </p>
                    <p className="text-base font-display font-bold text-white">
                        {isSoviet ? 'Avisen er klar til trykk' : 'Sendingen er fullfort'}
                    </p>
                </div>

                <div className="p-4">
                    {/* Troverdighet */}
                    <div className="mb-4 bg-white rounded-2xl p-3 border border-stone-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                                Troverdighet
                            </span>
                            <span
                                className={`text-sm font-black ${
                                    credibility > 60
                                        ? 'text-emerald-600'
                                        : credibility > 30
                                          ? 'text-amber-600'
                                          : 'text-red-600'
                                }`}
                            >
                                {credibility}% — {credLabel}
                            </span>
                        </div>
                        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${progressColor}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${credibility}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>
                    </div>

                    {/* Choices list */}
                    <div className="space-y-1.5 mb-4">
                        {chosenOptions.map((opt, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="flex items-start gap-2 bg-white rounded-xl p-2.5 border border-stone-200"
                            >
                                <span className="text-[10px] font-mono text-stone-400 flex-shrink-0 pt-0.5 w-5">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-stone-700 truncate">
                                        {items[i].headline}
                                    </p>
                                    <p className="text-[10px] text-stone-400 mt-0.5">{opt.label}</p>
                                </div>
                                <span
                                    className={`text-xs font-black flex-shrink-0 ${
                                        opt.credibilityChange > 0
                                            ? 'text-emerald-600'
                                            : opt.credibilityChange < 0
                                              ? 'text-red-500'
                                              : 'text-stone-400'
                                    }`}
                                >
                                    {opt.credibilityChange > 0
                                        ? `+${opt.credibilityChange}`
                                        : opt.credibilityChange === 0
                                          ? '±0'
                                          : opt.credibilityChange}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    <button
                        onClick={handleFinish}
                        disabled={finishing}
                        className="w-full py-3 rounded-2xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition-colors disabled:opacity-50"
                    >
                        {finishing ? 'Behandler...' : 'Fortsett'}
                    </button>
                </div>
            </div>
        );
    }

    /* ── Main choosing / feedback screen ───────────────────────────── */
    return (
        <div className="bg-stone-100 rounded-3xl border border-stone-200 overflow-hidden">
            {/* Newspaper masthead */}
            <div className={`${headerBg} px-4 py-2.5 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <FileText size={12} className={`${accentText} flex-shrink-0`} />
                    <span className={`text-xs font-display font-bold ${accentText} tracking-wide`}>
                        {outlet}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500">{date}</span>
                    <span className="text-[10px] font-mono text-stone-500 bg-stone-800 px-1.5 py-0.5 rounded-full">
                        {itemIndex + 1}/{totalItems}
                    </span>
                </div>
            </div>

            {/* Troverdighet progress strip */}
            <div className="h-1.5 bg-stone-300">
                <motion.div
                    className={`h-full ${progressColor} transition-colors duration-500`}
                    animate={{ width: `${credibility}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${itemIndex}-${phase}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Incoming dispatch */}
                    <div className="mx-3 mt-3 rounded-xl bg-stone-800 overflow-hidden">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-stone-700/60">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">
                                Innkommende melding
                            </span>
                        </div>
                        <p className="px-3 py-2.5 font-mono text-sm font-semibold text-stone-100 leading-snug">
                            {currentItem.headline}
                        </p>
                    </div>

                    {/* Reality note — the truth the editor knows */}
                    <div className="mx-3 mt-2 rounded-xl bg-amber-50 border border-amber-200/80 px-3 py-2 flex items-start gap-2">
                        <Eye size={11} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 italic leading-relaxed">
                            {currentItem.realFacts}
                        </p>
                    </div>

                    <div className="p-3 space-y-2">
                        {phase === 'choosing' && (
                            <>
                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                                    Velg dekning:
                                </p>
                                {currentItem.options.map((opt, i) => (
                                    <motion.button
                                        key={opt.id}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        onClick={() => handleChoose(opt)}
                                        className="w-full py-2.5 px-3 text-left rounded-2xl bg-white border-2 border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all active:scale-[0.98]"
                                    >
                                        <p className="text-sm font-bold text-stone-800">{opt.label}</p>
                                        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                                            {opt.description}
                                        </p>
                                    </motion.button>
                                ))}
                            </>
                        )}

                        {phase === 'feedback' && lastChosen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-3 rounded-2xl border-2 ${
                                    lastChosen.credibilityChange >= 0
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-rose-50 border-rose-200'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {lastChosen.credibilityChange >= 0 ? (
                                        <TrendingUp size={13} className="text-emerald-600 flex-shrink-0" />
                                    ) : (
                                        <TrendingDown size={13} className="text-rose-500 flex-shrink-0" />
                                    )}
                                    <span
                                        className={`text-xs font-bold ${
                                            lastChosen.credibilityChange >= 0
                                                ? 'text-emerald-700'
                                                : 'text-rose-600'
                                        }`}
                                    >
                                        Troverdighet:{' '}
                                        {lastChosen.credibilityChange >= 0 ? '+' : ''}
                                        {lastChosen.credibilityChange}
                                    </span>
                                </div>
                                <p className="text-xs text-stone-600 leading-relaxed">
                                    {lastChosen.description}
                                </p>
                            </motion.div>
                        )}

                        {phase === 'feedback' && (
                            <button
                                onClick={handleNext}
                                className="w-full mt-1 py-2.5 flex items-center justify-center gap-1.5 rounded-2xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition-colors"
                            >
                                <span>
                                    {itemIndex + 1 >= totalItems ? 'Se oppsummering' : 'Neste sak'}
                                </span>
                                <ChevronRight size={13} />
                            </button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
