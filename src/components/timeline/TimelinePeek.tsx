import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Calendar } from 'lucide-react';
import type { GlobalTimelineEvent } from '../../types';
import { getSubjectColor } from '../../utils/subjectColors';
import { getEraForYear } from '../../data/timelineEras';

interface TimelinePeekProps {
    event: GlobalTimelineEvent | null;
    onClose: () => void;
    onTagClick: (tag: string) => void;
}

export const TimelinePeek: React.FC<TimelinePeekProps> = ({
    event,
    onClose,
    onTagClick,
}) => {
    useEffect(() => {
        if (!event) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [event, onClose]);

    return (
        <AnimatePresence>
            {event && (
                <>
                    <motion.div
                        key="peek-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-slate-900/40 z-40"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <motion.aside
                        key="peek-panel"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="peek-title"
                        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl overflow-y-auto flex flex-col"
                    >
                        <PeekContent
                            event={event}
                            onClose={onClose}
                            onTagClick={onTagClick}
                        />
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

const PeekContent: React.FC<{
    event: GlobalTimelineEvent;
    onClose: () => void;
    onTagClick: (tag: string) => void;
}> = ({ event, onClose, onTagClick }) => {
    const color = getSubjectColor(event.subjectId);
    const era = getEraForYear(event.startDate);

    return (
        <>
            <div className={`${color.bgSoft} border-b ${color.border} px-5 py-4 flex items-start justify-between`}>
                <div className="flex flex-col gap-1 pr-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <span className={`inline-flex items-center gap-1.5 ${color.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                            {color.label}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className={era.textClass}>{era.shortLabel}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        {event.displayDate}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-white/70 text-slate-500 hover:text-slate-800 transition-colors"
                    aria-label="Lukk"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="px-5 py-5 flex-1">
                <h2 id="peek-title" className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
                    {event.title}
                </h2>
                {event.description && (
                    <p className="text-slate-600 leading-relaxed mb-5">
                        {event.description}
                    </p>
                )}

                {Array.isArray(event.tags) && event.tags.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Tagger
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {event.tags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => onTagClick(tag)}
                                    className="px-2.5 py-1 text-xs font-medium rounded-full border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {event.link && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                    <Link
                        to={event.link}
                        className={`inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white ${color.bg} hover:opacity-90 rounded-xl transition-opacity`}
                    >
                        Les artikkelen
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </>
    );
};
