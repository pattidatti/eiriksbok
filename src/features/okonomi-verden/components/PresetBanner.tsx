import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, ChevronRight, BookOpen } from 'lucide-react';
import { useWorldStore } from '../store/worldStore';
import { findCapsule } from '../data/presets';

export function PresetBanner() {
    const presetId = useWorldStore((s) => s.presetId);
    const activeBeatIndex = useWorldStore((s) => s.activeBeatIndex);
    const advanceBeat = useWorldStore((s) => s.advanceBeat);
    const clearPreset = useWorldStore((s) => s.clearPreset);
    const resetToEquilibrium = useWorldStore((s) => s.resetToEquilibrium);

    const capsule = findCapsule(presetId);
    if (!capsule) return null;

    const beats = capsule.narrativeBeats ?? [];
    const currentBeat = beats[Math.min(activeBeatIndex, beats.length - 1)] ?? beats[0];
    const hasNext = activeBeatIndex < beats.length - 1;

    return (
        <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-gradient-to-r from-amber-100 via-orange-50 to-rose-50 border-b-2 border-amber-300/60 px-4 lg:px-6 py-3 shadow-sm relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 via-transparent to-rose-200/20 pointer-events-none" />
            <div className="relative max-w-screen-2xl mx-auto flex items-start gap-4">
                <motion.div
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-md shadow-amber-300/40"
                >
                    <Flame size={20} className="text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-amber-700 font-bold">
                            Tidskapsel
                        </span>
                        <span className="text-xs text-amber-900/70">·</span>
                        <span className="text-xs font-semibold text-amber-900">
                            {capsule.title}
                        </span>
                    </div>
                    <AnimatePresence mode="wait">
                        {currentBeat && (
                            <motion.div
                                key={activeBeatIndex}
                                initial={{ opacity: 0, x: 6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -6 }}
                                transition={{ duration: 0.25 }}
                            >
                                <h3 className="text-base lg:text-lg font-display font-bold text-amber-950 leading-tight">
                                    {currentBeat.title}
                                </h3>
                                <p className="text-sm text-amber-900/85 leading-snug mt-0.5 max-w-3xl">
                                    {currentBeat.body}
                                </p>
                                {currentBeat.quote && (
                                    <p className="text-xs italic text-amber-800/75 mt-1.5 flex items-start gap-1">
                                        <BookOpen size={11} className="mt-0.5 flex-shrink-0 opacity-60" />
                                        "{currentBeat.quote.text}" - {currentBeat.quote.author}
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {hasNext && (
                        <motion.button
                            type="button"
                            onClick={advanceBeat}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 text-xs font-semibold text-amber-900 bg-white/80 hover:bg-white border border-amber-300 px-3 py-2 rounded-xl shadow-sm hover:shadow transition-all"
                        >
                            Neste
                            <ChevronRight size={13} />
                        </motion.button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            clearPreset();
                            resetToEquilibrium();
                        }}
                        className="flex items-center justify-center w-8 h-8 rounded-xl text-amber-700 hover:text-amber-900 hover:bg-amber-200/50 active:scale-90 transition-all"
                        aria-label="Avslutt kapsel"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
