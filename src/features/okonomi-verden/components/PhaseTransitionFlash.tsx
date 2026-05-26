import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, Wrench, Sprout } from 'lucide-react';
import { useWorldStore } from '../store/worldStore';
import type { Phase } from '../types';

interface FlashConfig {
    label: string;
    sublabel: string;
    icon: typeof Zap;
    overlay: string;
    ring: string;
    text: string;
    iconBg: string;
}

const CONFIG: Record<Phase, FlashConfig> = {
    expansion: {
        label: 'Tilbake i ekspansjon',
        sublabel: 'Økonomien vokser stabilt igjen',
        icon: Sprout,
        overlay: 'bg-emerald-400/15',
        ring: 'border-emerald-300',
        text: 'text-emerald-900',
        iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    },
    boom: {
        label: 'Kunstig boom',
        sublabel: 'Det bygges over evne - boblen vokser',
        icon: Flame,
        overlay: 'bg-amber-400/20',
        ring: 'border-amber-300',
        text: 'text-amber-900',
        iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    },
    bust: {
        label: 'Krisen rammer',
        sublabel: 'Feilinvesteringene rives ned',
        icon: Zap,
        overlay: 'bg-rose-500/25',
        ring: 'border-rose-400',
        text: 'text-rose-900',
        iconBg: 'bg-gradient-to-br from-rose-500 to-red-600',
    },
    recovery: {
        label: 'Restitusjon',
        sublabel: 'Økonomien finner langsomt tilbake',
        icon: Wrench,
        overlay: 'bg-sky-400/15',
        ring: 'border-sky-300',
        text: 'text-sky-900',
        iconBg: 'bg-gradient-to-br from-sky-400 to-blue-600',
    },
};

export function PhaseTransitionFlash() {
    const [shown, setShown] = useState<Phase | null>(null);

    useEffect(() => {
        let prevPhase: Phase = useWorldStore.getState().sim.phase;
        let hideTimer: ReturnType<typeof setTimeout> | null = null;
        const unsub = useWorldStore.subscribe((state) => {
            const phase = state.sim.phase;
            if (phase !== prevPhase && state.sim.tick > 2) {
                setShown(phase);
                if (hideTimer) clearTimeout(hideTimer);
                hideTimer = setTimeout(() => setShown(null), 2400);
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
            {shown && <FlashOverlay phase={shown} />}
        </AnimatePresence>
    );
}

function FlashOverlay({ phase }: { phase: Phase }) {
    const cfg = CONFIG[phase];
    const Icon = cfg.icon;
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-none fixed inset-0 z-40 ${cfg.overlay} flex items-start justify-center pt-24`}
            aria-live="polite"
        >
            <motion.div
                initial={{ y: -16, scale: 0.9, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className={`flex items-center gap-4 bg-white/95 backdrop-blur-md rounded-3xl border-2 ${cfg.ring} shadow-2xl px-6 py-4 max-w-md`}
            >
                <motion.span
                    initial={{ rotate: -15, scale: 0.7 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                    className={`flex items-center justify-center w-14 h-14 rounded-2xl ${cfg.iconBg} shadow-md`}
                >
                    <Icon size={26} className="text-white" />
                </motion.span>
                <div>
                    <h2 className={`text-xl font-display font-bold leading-tight ${cfg.text}`}>
                        {cfg.label}
                    </h2>
                    <p className="text-sm text-slate-600 leading-snug mt-0.5">{cfg.sublabel}</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
