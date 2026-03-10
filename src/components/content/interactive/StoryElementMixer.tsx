import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FlaskConical, RotateCcw, Eye } from 'lucide-react';

interface StoryElementMixerProps {
    title?: string;
    originalText: string;
    ingredients: {
        id: string;
        name: string;
        icon: string;
        description: string;
        transforms: { find: string; replace: string; color: string }[];
    }[];
}

interface AppliedTransform {
    find: string;
    replace: string;
    color: string;
}

const COLORS: Record<string, string> = {
    amber: 'bg-amber-200/60', emerald: 'bg-emerald-200/60', violet: 'bg-violet-200/60',
    rose: 'bg-rose-200/60', sky: 'bg-sky-200/60', orange: 'bg-orange-200/60',
    teal: 'bg-teal-200/60', pink: 'bg-pink-200/60',
};

const bgFor = (c: string) => COLORS[c] || 'bg-indigo-200/60';

export const StoryElementMixer: React.FC<StoryElementMixerProps> = ({
    title = 'Forfatterens laboratorium',
    originalText,
    ingredients,
}) => {
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
    const [transforms, setTransforms] = useState<AppliedTransform[]>([]);
    const [animatingId, setAnimatingId] = useState<string | null>(null);
    const [showComparison, setShowComparison] = useState(false);
    const [done, setDone] = useState(false);

    const progress = appliedIds.size / ingredients.length;
    const allApplied = appliedIds.size === ingredients.length;

    const buildSegments = useCallback((txs: AppliedTransform[]) => {
        type Seg = { text: string; color?: string };
        let segs: Seg[] = [{ text: originalText }];
        for (const t of txs) {
            const next: Seg[] = [];
            for (const seg of segs) {
                if (seg.color) { next.push(seg); continue; }
                const parts = seg.text.split(t.find);
                parts.forEach((part, i) => {
                    if (part) next.push({ text: part });
                    if (i < parts.length - 1) next.push({ text: t.replace, color: t.color });
                });
            }
            segs = next;
        }
        return segs;
    }, [originalText]);

    const segments = buildSegments(transforms);

    const applyIngredient = useCallback(async (ing: (typeof ingredients)[0]) => {
        if (appliedIds.has(ing.id) || animatingId) return;
        setAnimatingId(ing.id);

        for (const t of ing.transforms) {
            await new Promise((r) => setTimeout(r, 350));
            setTransforms((prev) => [...prev, t]);
        }

        await new Promise((r) => setTimeout(r, 200));
        setAppliedIds((prev) => new Set(prev).add(ing.id));
        setAnimatingId(null);

        if (appliedIds.size + 1 === ingredients.length) {
            setDone(true);
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
    }, [appliedIds, animatingId, ingredients.length]);

    const reset = () => {
        setAppliedIds(new Set());
        setTransforms([]);
        setAnimatingId(null);
        setShowComparison(false);
        setDone(false);
    };

    const renderSegments = (animated: boolean) =>
        segments.map((seg, i) =>
            seg.color ? (
                animated ? (
                    <motion.span
                        key={`${i}-${seg.text}`}
                        initial={{ backgroundColor: 'rgba(139,92,246,0.5)', scale: 1.08 }}
                        animate={{ backgroundColor: 'rgba(139,92,246,0)', scale: 1 }}
                        transition={{ duration: 0.8, type: 'spring' }}
                        className={`${bgFor(seg.color)} px-1 rounded font-semibold`}
                    >{seg.text}</motion.span>
                ) : (
                    <span key={i} className={`${bgFor(seg.color)} px-1 rounded font-semibold`}>{seg.text}</span>
                )
            ) : <span key={i}>{seg.text}</span>
        );

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden my-8"
        >
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-violet-400" />
                    <h3 className="font-bold text-base">{title}</h3>
                </div>
                <button onClick={reset} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-700" title="Nullstill">
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Potion meter */}
            <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                    <span>Eliksir-meter</span>
                    <span>{appliedIds.size} / {ingredients.length} ingredienser</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    />
                </div>
            </div>

            {/* Text display */}
            <div className="px-6 py-4">
                <AnimatePresence mode="wait">
                    {showComparison ? (
                        <motion.div key="cmp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Før</div>
                                <p className="text-slate-400 leading-relaxed line-through decoration-slate-300 text-sm">{originalText}</p>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Etter</div>
                                <p className="leading-relaxed text-sm text-slate-700">{renderSegments(false)}</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="txt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <p className="leading-relaxed text-slate-700">{renderSegments(true)}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Ingredient bottles */}
            <div className="px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ingredients.map((ing) => {
                        const used = appliedIds.has(ing.id);
                        const busy = animatingId === ing.id;
                        return (
                            <motion.button
                                key={ing.id}
                                onClick={() => applyIngredient(ing)}
                                disabled={used || !!animatingId}
                                whileHover={!used && !animatingId ? { scale: 1.04, y: -2 } : {}}
                                whileTap={!used && !animatingId ? { scale: 0.97 } : {}}
                                className={`relative p-4 rounded-xl border text-left transition-all ${
                                    used ? 'border-slate-200 bg-slate-50 opacity-50'
                                    : busy ? 'border-violet-400 bg-violet-50 shadow-lg ring-2 ring-violet-300'
                                    : 'border-slate-200 bg-white/70 backdrop-blur-sm hover:border-violet-300 hover:shadow-md cursor-pointer'
                                }`}
                            >
                                <div className="text-2xl mb-1.5">{ing.icon}</div>
                                <div className="font-bold text-slate-800 text-sm">{ing.name}</div>
                                <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ing.description}</div>
                                {used && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="absolute top-2 right-2 text-xs font-bold text-emerald-600">
                                        ✓
                                    </motion.div>
                                )}
                                {busy && (
                                    <motion.div className="absolute inset-0 rounded-xl border-2 border-violet-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Footer — appears after all ingredients applied */}
            {allApplied && done && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between"
                >
                    <span className="text-sm font-bold text-emerald-600">Alle ingredienser er tilsatt!</span>
                    <button
                        onClick={() => setShowComparison((v) => !v)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 transition-all duration-300"
                    >
                        <Eye className="w-4 h-4" />
                        {showComparison ? 'Vis tekst' : 'Sammenlign før/etter'}
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};
