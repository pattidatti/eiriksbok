import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, CheckCircle } from 'lucide-react';

interface AllocationGameProps {
    config: {
        onComplete: { nextNodeId: string };
        totalPoints: number;
        categories: Array<{
            id: string;
            label: string;
            description: string;
        }>;
    };
    onComplete: (results: any) => void;
}

export const AllocationGame: React.FC<AllocationGameProps> = ({ config, onComplete }) => {
    const even = Math.floor(config.totalPoints / config.categories.length);
    const [allocations, setAllocations] = useState<Record<string, number>>(
        Object.fromEntries(config.categories.map((c) => [c.id, even]))
    );
    const [submitted, setSubmitted] = useState(false);

    const total = Object.values(allocations).reduce((a, b) => a + b, 0);
    const remaining = config.totalPoints - total;

    const handleChange = (id: string, delta: number) => {
        const newVal = allocations[id] + delta;
        if (newVal < 0) return;
        const othersTotal = config.categories
            .filter((c) => c.id !== id)
            .reduce((sum, c) => sum + allocations[c.id], 0);
        if (newVal > config.totalPoints - othersTotal) return;
        setAllocations((prev) => ({ ...prev, [id]: newVal }));
    };

    const handleSubmit = () => {
        setSubmitted(true);
        setTimeout(() => {
            onComplete({ allocations });
        }, 2000);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-stone-100 rounded-3xl border border-stone-200">
                <CheckCircle className="text-emerald-600 mb-4" size={48} />
                <h3 className="text-xl font-bold text-stone-800 mb-2">Ressurser fordelt</h3>
                <p className="text-stone-600 text-center text-sm">
                    Konsekvensene av dine prioriteringer vil snart vise seg.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-stone-100 rounded-3xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-800 text-stone-100 p-5 text-center">
                <Sliders className="mx-auto mb-2 opacity-80" size={28} />
                <h2 className="text-xl font-display font-medium tracking-wide">Ressursfordeling</h2>
                <div
                    className={`mt-2 text-sm font-bold ${remaining === 0 ? 'text-emerald-400' : 'text-amber-400'}`}
                >
                    {remaining === 0
                        ? 'Alle ressurser fordelt'
                        : `${remaining} enheter gjenstår`}
                </div>
            </div>

            <div className="p-5 space-y-4">
                {config.categories.map((cat) => {
                    const pct = (allocations[cat.id] / config.totalPoints) * 100;
                    return (
                        <div key={cat.id} className="bg-white rounded-2xl p-4 border border-stone-200">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-bold text-stone-800">{cat.label}</div>
                                    <div className="text-xs text-stone-500 mt-0.5">{cat.description}</div>
                                </div>
                                <div className="text-2xl font-black text-stone-700 ml-4">
                                    {allocations[cat.id]}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleChange(cat.id, -5)}
                                    disabled={allocations[cat.id] === 0}
                                    className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 font-bold text-stone-600 hover:bg-stone-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    −
                                </button>
                                <div className="flex-1 h-3 bg-stone-200 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        className="h-full rounded-full bg-stone-700"
                                        animate={{ width: `${pct}%` }}
                                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                                    />
                                </div>
                                <button
                                    onClick={() => handleChange(cat.id, 5)}
                                    disabled={remaining === 0}
                                    className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 font-bold text-stone-600 hover:bg-stone-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="px-5 pb-5">
                <button
                    onClick={handleSubmit}
                    disabled={remaining !== 0}
                    className="w-full py-3 bg-stone-900 text-white font-bold rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-800 transition-colors"
                >
                    {remaining === 0
                        ? 'Bekreft fordeling'
                        : `Juster — ${remaining} enheter gjenstår`}
                </button>
            </div>
        </div>
    );
};
