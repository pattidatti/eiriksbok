import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Scale, Flame, Play, X, Sparkles } from 'lucide-react';
import { useWorldStore } from '../store/worldStore';
import { CAPSULES } from '../data/presets';
import type { Capsule } from '../types';

const STORAGE_KEY = 'okonomi-verden-seen';

function readSeen(): boolean {
    try {
        return Boolean(window.localStorage.getItem(STORAGE_KEY));
    } catch {
        return true;
    }
}
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    wind: Wind,
    scale: Scale,
    flame: Flame,
};

const CAPSULE_STYLES = [
    { accent: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-300' },
    { accent: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-300' },
    { accent: 'from-rose-500 to-orange-500', bg: 'bg-rose-50', border: 'border-rose-300' },
];

export function OnboardingTour() {
    const [open, setOpen] = useState(() => !readSeen());
    const loadPreset = useWorldStore((s) => s.loadPreset);
    const setActiveView = useWorldStore((s) => s.setActiveView);

    function dismiss() {
        try {
            window.localStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // ignore
        }
        setOpen(false);
    }

    function startCapsule(c: Capsule) {
        loadPreset(
            c.id,
            c.initialControls ?? {},
            c.initialState?.avgTimePreference,
            c.initialState?.M
        );
        setActiveView('live');
        dismiss();
    }

    function startEmpty() {
        setActiveView('live');
        dismiss();
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.92, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.94, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
                    >
                        <button
                            type="button"
                            onClick={dismiss}
                            aria-label="Lukk"
                            className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-200/60">
                                <Sparkles size={22} className="text-white" />
                            </span>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900 leading-tight">
                                    Velkommen til Økonomi-Verden
                                </h1>
                                <p className="text-sm text-slate-600 leading-snug mt-0.5">
                                    Velg et eksperiment å starte med — du kan endre alt etterpå.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
                            {CAPSULES.map((c, idx) => {
                                const style = CAPSULE_STYLES[idx % CAPSULE_STYLES.length];
                                const Icon = ICON_MAP[c.icon ?? ''] ?? Wind;
                                return (
                                    <motion.button
                                        key={c.id}
                                        type="button"
                                        onClick={() => startCapsule(c)}
                                        whileHover={{ y: -3 }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                        className={`text-left p-4 rounded-2xl border-2 ${style.bg} ${style.border} hover:shadow-lg transition-shadow group`}
                                    >
                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${style.accent} flex items-center justify-center shadow-md mb-3 group-hover:rotate-6 group-hover:scale-110 transition-transform`}>
                                            <Icon size={20} className="text-white" />
                                        </div>
                                        <h3 className="text-base font-display font-bold text-slate-900 leading-tight">
                                            {c.title}
                                        </h3>
                                        <p className="text-xs font-semibold text-slate-600 mt-0.5">
                                            {c.subtitle}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-2 leading-snug">
                                            {c.summary}
                                        </p>
                                        <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br ${style.accent} text-white text-xs font-bold shadow group-hover:shadow-md`}>
                                            <Play size={11} fill="currentColor" />
                                            Start
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-slate-500 leading-snug max-w-md">
                                Dra i kontrollene til høyre og se hvordan økonomien reagerer. Du kan
                                bytte til Cockpit, Triangel, Landsby eller Atlas for å se det samme
                                fra andre vinkler.
                            </p>
                            <button
                                type="button"
                                onClick={startEmpty}
                                className="text-sm font-bold text-slate-600 hover:text-slate-900 underline underline-offset-2"
                            >
                                Hopp over og start med tom verden
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
