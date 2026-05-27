import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorldStore } from '../store/worldStore';
import { buildNarrative, type NarrativeTone } from '../engine/narrativeRules';

const TONE_STYLES: Record<NarrativeTone, { bg: string; border: string; text: string; iconBg: string }> = {
    good: {
        bg: 'bg-emerald-50/90',
        border: 'border-emerald-200',
        text: 'text-emerald-900',
        iconBg: 'bg-emerald-100',
    },
    info: {
        bg: 'bg-sky-50/90',
        border: 'border-sky-200',
        text: 'text-sky-900',
        iconBg: 'bg-sky-100',
    },
    warn: {
        bg: 'bg-amber-50/90',
        border: 'border-amber-200',
        text: 'text-amber-900',
        iconBg: 'bg-amber-100',
    },
    danger: {
        bg: 'bg-rose-50/95',
        border: 'border-rose-300',
        text: 'text-rose-900',
        iconBg: 'bg-rose-100',
    },
};

export function NarrativeFeed() {
    const sim = useWorldStore((s) => s.sim);
    const controls = useWorldStore((s) => s.controls);

    const items = useMemo(() => buildNarrative(sim, controls).slice(0, 4), [sim, controls]);

    return (
        <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
                {items.map((item) => {
                    const style = TONE_STYLES[item.tone];
                    return (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                            className={`flex items-start gap-2.5 px-3 py-2 rounded-xl border ${style.bg} ${style.border} backdrop-blur-sm shadow-sm max-w-xs flex-1 min-w-[14rem]`}
                        >
                            <span
                                className={`flex items-center justify-center w-7 h-7 rounded-lg text-base flex-shrink-0 ${style.iconBg}`}
                                aria-hidden="true"
                            >
                                {item.icon}
                            </span>
                            <div className="min-w-0 flex-1">
                                <h4 className={`text-xs font-bold leading-tight ${style.text}`}>
                                    {item.title}
                                </h4>
                                <p className="text-[11px] text-slate-700 leading-snug mt-0.5">
                                    {item.body}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
