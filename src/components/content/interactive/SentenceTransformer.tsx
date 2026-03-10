import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw, ChevronLeft, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react';

interface SentenceTransformerProps {
    title?: string;
    sentences: {
        id: string;
        original: string;
        techniques: {
            id: string;
            name: string;
            icon: string;
            transformed: string;
            overdoseVersion?: string;
        }[];
        sweetSpot: number;
    }[];
}

const METER_COLORS = ['bg-green-400', 'bg-green-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-500', 'bg-purple-600'];
const getMeterColor = (n: number) => METER_COLORS[Math.min(n, METER_COLORS.length - 1)];

export const SentenceTransformer = ({ title = 'Mal med ord', sentences }: SentenceTransformerProps) => {
    const [idx, setIdx] = useState(0);
    const [activeMap, setActiveMap] = useState<Record<string, Set<string>>>({});
    const [celebrated, setCelebrated] = useState<Set<string>>(new Set());

    const s = sentences[idx];
    const active = activeMap[s.id] ?? new Set<string>();
    const count = active.size;
    const isOver = count > s.sweetSpot;
    const isPerfect = count === s.sweetSpot;

    const displayText = useCallback(() => {
        if (count === 0) return s.original;
        const applied = s.techniques.filter((t) => active.has(t.id));
        if (isOver) {
            return applied.map((t) => t.overdoseVersion ?? t.transformed).join(' ') || applied[applied.length - 1].transformed;
        }
        return applied[applied.length - 1].transformed;
    }, [s, active, count, isOver]);

    const toggle = (techId: string) => {
        setActiveMap((prev) => {
            const cur = new Set(prev[s.id] ?? []);
            cur.has(techId) ? cur.delete(techId) : cur.add(techId);
            if (cur.size === s.sweetSpot && !celebrated.has(s.id)) {
                setCelebrated((c) => new Set(c).add(s.id));
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            }
            return { ...prev, [s.id]: cur };
        });
    };

    const reset = () => {
        setActiveMap((p) => { const n = { ...p }; delete n[s.id]; return n; });
        setCelebrated((c) => { const n = new Set(c); n.delete(s.id); return n; });
    };

    const pct = Math.min((count / (s.sweetSpot + 2)) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden my-8"
        >
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" /> {title}
                </h4>
                {sentences.length > 1 && (
                    <span className="text-sm text-slate-400">{idx + 1} / {sentences.length}</span>
                )}
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={s.id + '-' + count}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{
                            opacity: 1, y: 0,
                            rotate: isOver ? [0, -1, 1, -0.5, 0.5, 0] : 0,
                        }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={isOver ? { rotate: { repeat: Infinity, duration: 0.8 } } : { duration: 0.3 }}
                        className={`relative text-lg md:text-xl font-medium leading-relaxed text-center px-4 py-6 rounded-lg border-2 transition-colors duration-300 ${
                            isOver ? 'bg-purple-50 border-purple-300 text-purple-900'
                                : isPerfect ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : count > 0 ? 'bg-amber-50 border-amber-200 text-slate-800'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                        style={isOver ? {
                            textShadow: '0 0 8px rgba(147,51,234,0.3)',
                            filter: `hue-rotate(${(count - s.sweetSpot) * 20}deg)`,
                        } : undefined}
                    >
                        {isOver && (
                            <motion.div
                                className="absolute inset-0 rounded-lg bg-gradient-to-b from-purple-200/40 via-transparent to-purple-300/50 pointer-events-none"
                                animate={{ opacity: [0.3, 0.7, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                        )}
                        <span className={isOver ? 'italic' : ''}>{displayText()}</span>
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence>
                    {isPerfect && (
                        <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="text-center text-emerald-600 font-bold mt-3 text-sm">
                            Perfekt balanse!
                        </motion.p>
                    )}
                    {isOver && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center text-purple-600 font-semibold mt-3 text-sm flex items-center justify-center gap-1">
                            <AlertTriangle className="w-4 h-4" /> Overdose! Teksten drukner i virkemidler.
                        </motion.p>
                    )}
                </AnimatePresence>

                <div className="mt-5">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Enkelt</span><span>Balanse</span><span>Overdose</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full ${getMeterColor(count)}`}
                            initial={false}
                            animate={{ width: `${pct}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-5">
                    {s.techniques.map((t) => (
                        <motion.button
                            key={t.id}
                            onClick={() => toggle(t.id)}
                            whileTap={{ scale: 0.93 }}
                            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 flex items-center gap-1.5 ${
                                active.has(t.id)
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:shadow-sm'
                            }`}
                        >
                            <span>{t.icon}</span> {t.name}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-2">
                    {sentences.length > 1 && (<>
                        <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIdx((i) => Math.min(sentences.length - 1, i + 1))} disabled={idx === sentences.length - 1}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>)}
                </div>
                <button onClick={reset} disabled={count === 0}
                    className="px-4 py-2 text-slate-500 rounded-lg font-medium hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 flex items-center gap-2 transition-all">
                    <RotateCcw className="w-4 h-4" /> Nullstill
                </button>
            </div>
        </motion.div>
    );
};
