import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, AlertTriangle, Timer } from 'lucide-react';
import type { ChronosEffect } from '../../../data/chronos/types';

interface GasOption {
    id: string;
    text: string;
    requiresItem?: string;
    nextNodeId: string;
    effects?: ChronosEffect;
}

interface GasMaskGameProps {
    config: {
        situation: string;
        timeLimit: number;
        options: GasOption[];
        noMaskMessage: string;
        noMaskNextNodeId: string;
        noMaskEffects?: ChronosEffect;
        timeoutNextNodeId: string;
        timeoutEffects?: ChronosEffect;
    };
    inventory: string[];
    onComplete: (result: { nextNodeId: string; effects?: ChronosEffect }) => void;
}

export const GasMaskGame: React.FC<GasMaskGameProps> = ({ config, inventory, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(config.timeLimit);
    const [chosen, setChosen] = useState<string | null>(null);
    const [noMaskWarning, setNoMaskWarning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    setTimeout(() => {
                        onComplete({
                            nextNodeId: config.timeoutNextNodeId,
                            effects: config.timeoutEffects,
                        });
                    }, 600);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current!);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChoice = (option: GasOption) => {
        if (chosen) return;
        clearInterval(intervalRef.current!);

        if (option.requiresItem && !inventory.includes(option.requiresItem)) {
            setNoMaskWarning(true);
            setChosen(option.id);
            setTimeout(() => {
                onComplete({
                    nextNodeId: config.noMaskNextNodeId,
                    effects: config.noMaskEffects,
                });
            }, 2000);
            return;
        }

        setChosen(option.id);
        setTimeout(() => {
            onComplete({ nextNodeId: option.nextNodeId, effects: option.effects });
        }, 1200);
    };

    const pct = timeLeft / config.timeLimit;
    const timerColor = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f59e0b' : '#ef4444';

    return (
        <div className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-700">
            {/* Danger Header */}
            <div className="bg-red-900/80 p-4 flex items-center gap-3">
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                >
                    <Wind className="text-red-300" size={24} />
                </motion.div>
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-300">
                        Gassalarm
                    </p>
                    <p className="text-sm font-bold text-white leading-snug">{config.situation}</p>
                </div>
            </div>

            {/* Timer Bar */}
            <div className="px-4 pt-3 pb-1">
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold">
                        <Timer size={12} />
                        Sekunder igjen
                    </div>
                    <span
                        className="text-xl font-black tabular-nums"
                        style={{ color: timerColor }}
                    >
                        {timeLeft}
                    </span>
                </div>
                <div className="w-full h-2.5 bg-stone-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: timerColor }}
                        animate={{ width: `${pct * 100}%` }}
                        transition={{ duration: 0.9, ease: 'linear' }}
                    />
                </div>
            </div>

            {/* Options */}
            <div className="p-4 space-y-2">
                <AnimatePresence>
                    {noMaskWarning && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 bg-red-800 rounded-2xl border border-red-600 flex items-center gap-2 mb-2"
                        >
                            <AlertTriangle size={16} className="text-red-300 flex-shrink-0" />
                            <p className="text-sm font-bold text-red-200">{config.noMaskMessage}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {config.options.map((option, i) => {
                    const isSelected = chosen === option.id;
                    const needsItem = option.requiresItem && !inventory.includes(option.requiresItem);
                    return (
                        <motion.button
                            key={option.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => handleChoice(option)}
                            disabled={!!chosen}
                            className={`w-full p-4 text-left rounded-2xl font-bold text-sm transition-all duration-200 border ${
                                isSelected
                                    ? noMaskWarning
                                        ? 'bg-red-800 border-red-600 text-red-200'
                                        : 'bg-emerald-700 border-emerald-500 text-white'
                                    : chosen
                                      ? 'bg-stone-800 border-stone-700 text-stone-500 opacity-40'
                                      : 'bg-stone-800 border-stone-600 text-white hover:bg-stone-700 hover:border-stone-500 active:scale-[0.98]'
                            }`}
                        >
                            <span>{option.text}</span>
                            {needsItem && !chosen && (
                                <span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-1">
                                    Krever: {option.requiresItem}
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
