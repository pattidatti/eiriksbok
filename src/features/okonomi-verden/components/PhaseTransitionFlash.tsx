import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, Wrench, Sprout, X } from 'lucide-react';
import { useWorldStore } from '../store/worldStore';
import type { Phase, SimState } from '../types';
import { describePhaseConsequence, type PhaseConsequence } from '../engine/narrativeRules';

interface FlashConfig {
    icon: typeof Zap;
    overlay: string;
    ring: string;
    text: string;
    iconBg: string;
    headlineColor: string;
}

const CONFIG: Record<Phase, FlashConfig> = {
    expansion: {
        icon: Sprout,
        overlay: 'bg-emerald-400/15',
        ring: 'border-emerald-300',
        text: 'text-emerald-900',
        iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
        headlineColor: 'text-emerald-900',
    },
    boom: {
        icon: Flame,
        overlay: 'bg-amber-400/20',
        ring: 'border-amber-300',
        text: 'text-amber-900',
        iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
        headlineColor: 'text-amber-900',
    },
    bust: {
        icon: Zap,
        overlay: 'bg-rose-500/25',
        ring: 'border-rose-400',
        text: 'text-rose-900',
        iconBg: 'bg-gradient-to-br from-rose-500 to-red-600',
        headlineColor: 'text-rose-900',
    },
    recovery: {
        icon: Wrench,
        overlay: 'bg-sky-400/15',
        ring: 'border-sky-300',
        text: 'text-sky-900',
        iconBg: 'bg-gradient-to-br from-sky-400 to-blue-600',
        headlineColor: 'text-sky-900',
    },
};

interface ShownState {
    phase: Phase;
    consequence: PhaseConsequence | null;
    snapshot: SimState;
}

export function PhaseTransitionFlash() {
    const [shown, setShown] = useState<ShownState | null>(null);

    useEffect(() => {
        let prevPhase: Phase = useWorldStore.getState().sim.phase;
        let hideTimer: ReturnType<typeof setTimeout> | null = null;
        const unsub = useWorldStore.subscribe((state) => {
            const phase = state.sim.phase;
            if (phase !== prevPhase && state.sim.tick > 2) {
                const consequence = describePhaseConsequence(state.sim, prevPhase);
                setShown({ phase, consequence, snapshot: state.sim });
                if (hideTimer) clearTimeout(hideTimer);
                hideTimer = setTimeout(() => setShown(null), 6500);
            }
            prevPhase = phase;
        });
        return () => {
            unsub();
            if (hideTimer) clearTimeout(hideTimer);
        };
    }, []);

    return (
        <AnimatePresence>
            {shown && (
                <ConsequenceCard
                    phase={shown.phase}
                    consequence={shown.consequence}
                    onDismiss={() => setShown(null)}
                />
            )}
        </AnimatePresence>
    );
}

function ConsequenceCard({
    phase,
    consequence,
    onDismiss,
}: {
    phase: Phase;
    consequence: PhaseConsequence | null;
    onDismiss: () => void;
}) {
    const cfg = CONFIG[phase];
    const Icon = cfg.icon;
    const headline = consequence?.headline ?? phase;
    const bullets = consequence?.bullets ?? [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-none fixed inset-0 z-40 ${cfg.overlay} flex items-start justify-center pt-20`}
            aria-live="polite"
        >
            <motion.div
                initial={{ y: -16, scale: 0.92, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className={`pointer-events-auto flex items-start gap-4 bg-white/96 backdrop-blur-md rounded-3xl border-2 ${cfg.ring} shadow-2xl px-5 py-4 max-w-md`}
            >
                <motion.span
                    initial={{ rotate: -15, scale: 0.7 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                    className={`flex items-center justify-center w-12 h-12 rounded-2xl ${cfg.iconBg} shadow-md flex-shrink-0`}
                >
                    <Icon size={22} className="text-white" />
                </motion.span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <h2 className={`text-lg font-display font-bold leading-tight ${cfg.headlineColor}`}>
                            {headline}
                        </h2>
                        <button
                            type="button"
                            onClick={onDismiss}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
                            aria-label="Lukk"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    {bullets.length > 0 && (
                        <ul className="mt-2 space-y-1">
                            {bullets.map((b, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 + i * 0.08 }}
                                    className="text-sm text-slate-700 leading-snug flex items-start gap-2"
                                >
                                    <span className="text-slate-400 mt-0.5">•</span>
                                    <span>{b}</span>
                                </motion.li>
                            ))}
                        </ul>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
