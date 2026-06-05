import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { GlobalTimelineEvent } from '../../types';
import { formatYear } from '../../utils/timelineLayout';

const SUBJECT_COLOR: Record<string, string> = {
    historie: '#b45309',
    norsk: '#0891b2',
    krle: '#7c3aed',
    samfunnskunnskap: '#059669',
    musikk: '#db2777',
};

const SUBJECT_LABEL: Record<string, string> = {
    historie: 'Historie',
    norsk: 'Norsk',
    krle: 'KRLE',
    samfunnskunnskap: 'Samfunn',
    musikk: 'Musikk',
};

interface Props {
    title: string | null;
    events: GlobalTimelineEvent[];
    onClose: () => void;
}

export function AtlasEventPanel({ title, events, onClose }: Props) {
    // Dedupliser på lenke — flere sub-events peker til samme artikkel. Behold den
    // mest "artikkel-aktige" (lesson/text vinner over sub-event), sortér kronologisk.
    const items = useMemo(() => {
        const byLink = new Map<string, GlobalTimelineEvent>();
        for (const ev of events) {
            if (!ev.link) continue;
            const existing = byLink.get(ev.link);
            if (!existing) {
                byLink.set(ev.link, ev);
            } else if (existing.type === 'sub-event' && ev.type !== 'sub-event') {
                byLink.set(ev.link, ev);
            }
        }
        return [...byLink.values()].sort((a, b) => a.startDate - b.startDate);
    }, [events]);

    return (
        <AnimatePresence>
            {title !== null && (
                <motion.aside
                    initial={{ x: '100%', opacity: 0.4 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0.4 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                    className="absolute top-0 right-0 h-full w-full sm:w-[360px] max-w-[88vw] bg-white/95 backdrop-blur-md border-l border-slate-200 shadow-2xl z-30 flex flex-col"
                >
                    <div className="flex items-start justify-between gap-2 p-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 leading-tight">{title}</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {items.length} {items.length === 1 ? 'artikkel' : 'artikler'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="shrink-0 w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center text-lg"
                            title="Lukk"
                        >
                            ×
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {items.length === 0 && (
                            <p className="text-sm text-slate-400 p-4 text-center">
                                Ingen artikler knyttet til dette stedet ennå.
                            </p>
                        )}
                        {items.map((ev) => {
                            const color = SUBJECT_COLOR[ev.subjectId] || '#64748b';
                            return (
                                <Link
                                    key={ev.id}
                                    to={ev.link}
                                    className="block rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all p-3 bg-white group"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                                            style={{ color, background: `${color}1a` }}
                                        >
                                            {SUBJECT_LABEL[ev.subjectId] || ev.subjectId}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium tabular-nums">
                                            {ev.displayDate || formatYear(ev.startDate)}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-amber-700 leading-snug">
                                        {ev.title}
                                    </h3>
                                    {ev.description && (
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                            {ev.description}
                                        </p>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
