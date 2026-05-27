import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, ChevronsRight } from 'lucide-react';
import { useWorldStore } from '../store/worldStore';
import type { KeyMetrics } from '../types';

interface MetricRow {
    label: string;
    key: keyof KeyMetrics;
    suffix: string;
    decimals: number;
    higherIsWorse: boolean;
}

const ROWS: MetricRow[] = [
    { label: 'Inflasjon', key: 'inflation', suffix: ' %', decimals: 1, higherIsWorse: true },
    { label: 'Ledighet', key: 'unemployment', suffix: ' %', decimals: 1, higherIsWorse: true },
    { label: 'BNP', key: 'bnp', suffix: '', decimals: 0, higherIsWorse: false },
    { label: 'Feilinvestering', key: 'malinvestment', suffix: '', decimals: 0, higherIsWorse: true },
    { label: 'Ulikhet', key: 'gini', suffix: '', decimals: 2, higherIsWorse: true },
];

export function DeltaCard() {
    const delta = useWorldStore((s) => s.lastFastForwardDelta);
    const dismiss = useWorldStore((s) => s.dismissFastForwardDelta);

    return (
        <AnimatePresence>
            {delta && (
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                    className="fixed bottom-6 right-6 z-50 w-80 bg-white/96 backdrop-blur-md border-2 border-indigo-300 rounded-3xl shadow-2xl p-4"
                >
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                                <ChevronsRight size={16} />
                            </span>
                            <div>
                                <h3 className="text-sm font-display font-bold text-slate-900 leading-tight">
                                    Spolt {Math.round(delta.ticks / 60)} år
                                </h3>
                                <p className="text-[11px] text-slate-500 leading-tight">
                                    Slik endret økonomien seg.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={dismiss}
                            aria-label="Lukk"
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {ROWS.map((row, i) => {
                            const before = delta.before[row.key] as number;
                            const after = delta.after[row.key] as number;
                            const diff = after - before;
                            const worsened = row.higherIsWorse ? diff > 0 : diff < 0;
                            const improved = row.higherIsWorse ? diff < 0 : diff > 0;
                            const flat = Math.abs(diff) < 0.05;
                            const color = flat
                                ? 'text-slate-500'
                                : improved
                                ? 'text-emerald-600'
                                : worsened
                                ? 'text-rose-600'
                                : 'text-slate-500';
                            return (
                                <motion.div
                                    key={row.key}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    className="flex items-center justify-between text-xs"
                                >
                                    <span className="text-slate-600 font-medium">{row.label}</span>
                                    <span className="flex items-center gap-1.5 font-mono tabular-nums">
                                        <span className="text-slate-500">
                                            {before.toFixed(row.decimals)}{row.suffix}
                                        </span>
                                        <ArrowRight size={10} className="text-slate-400" />
                                        <span className={`font-bold ${color}`}>
                                            {after.toFixed(row.decimals)}{row.suffix}
                                        </span>
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
