import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle } from 'lucide-react';
import { MiniGameHeader } from './MiniGameHeader';
import type { ChronosEffect } from '../../../data/chronos/types';

interface Soldier {
    id: string;
    name: string;
    role: string;
    context: string;
    effects: {
        ifGiven: ChronosEffect;
        ifSkipped: ChronosEffect;
    };
}

interface RationingGameProps {
    config: {
        onComplete: { nextNodeId: string };
        rations: number;
        soldiers: Soldier[];
    };
    onComplete: (effects: ChronosEffect) => void;
}

export const RationingGame: React.FC<RationingGameProps> = ({ config, onComplete }) => {
    const [given, setGiven] = useState<Set<string>>(new Set());
    const [submitted, setSubmitted] = useState(false);

    const rationCount = given.size;
    const remaining = config.rations - rationCount;

    const toggleGiven = (id: string) => {
        if (submitted) return;
        setGiven((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else if (next.size < config.rations) {
                next.add(id);
            }
            return next;
        });
    };

    const handleSubmit = () => {
        const combinedEffects: ChronosEffect = {};
        config.soldiers.forEach((s) => {
            const effects = given.has(s.id) ? s.effects.ifGiven : s.effects.ifSkipped;
            Object.entries(effects).forEach(([key, val]) => {
                combinedEffects[key] = (combinedEffects[key] || 0) + (val as number);
            });
        });
        setSubmitted(true);
        setTimeout(() => onComplete(combinedEffects), 2200);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-stone-100 rounded-3xl border border-stone-200">
                <CheckCircle className="text-amber-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-stone-800 mb-2">Rasjonering fordelt</h3>
                <p className="text-stone-600 text-center text-sm leading-relaxed max-w-xs">
                    Konsekvensene av valget ditt kjenner du i neste time. I krigen er alle valg reelle.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-stone-100 rounded-3xl border border-stone-200 overflow-hidden">
            <MiniGameHeader
                icon={Users}
                title="Rasjonering"
                badge={
                    <span className="text-[10px] text-stone-400">
                        <span className="font-bold text-amber-400">{remaining}</span>/{config.rations} igjen
                    </span>
                }
            />

            <div className="p-3 bg-amber-50/60 border-b border-stone-200 text-center">
                <span className="text-xs font-black uppercase tracking-widest text-stone-500">
                    {remaining > 0 ? (
                        <>
                            <span className="text-amber-700">{remaining} rasjon{remaining !== 1 ? 'er' : ''}</span>{' '}
                            igjen å fordele
                        </>
                    ) : (
                        <span className="text-emerald-700">Alle rasjoner fordelt — klar til å sende</span>
                    )}
                </span>
            </div>

            <div className="p-4 space-y-2">
                {config.soldiers.map((soldier, i) => {
                    const isGiven = given.has(soldier.id);
                    const canGive = remaining > 0 || isGiven;
                    return (
                        <motion.button
                            key={soldier.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            onClick={() => toggleGiven(soldier.id)}
                            disabled={!canGive}
                            className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                                isGiven
                                    ? 'bg-amber-50 border-amber-400 shadow-sm'
                                    : canGive
                                      ? 'bg-white border-stone-200 hover:border-stone-300'
                                      : 'bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-0.5">
                                        {soldier.name} — {soldier.role}
                                    </div>
                                    <p className="text-sm text-stone-700 italic leading-snug">
                                        {soldier.context}
                                    </p>
                                </div>
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ml-3 font-bold transition-colors ${
                                        isGiven
                                            ? 'bg-amber-400 text-white'
                                            : 'bg-stone-100 text-stone-400'
                                    }`}
                                >
                                    {isGiven ? '🥃' : '—'}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="p-4 pt-0">
                <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-colors"
                >
                    Bekreft fordeling
                </button>
            </div>
        </div>
    );
};
