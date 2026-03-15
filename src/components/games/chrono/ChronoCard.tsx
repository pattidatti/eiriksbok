import React from 'react';
import { motion } from 'framer-motion';

export interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    startDate: number;
    displayDate: string;
    sourceUrl?: string; // Optional link to learn more
}

interface ChronoCardProps {
    event: TimelineEvent;
    isRevealed?: boolean; // If true, shows the date
    isDraggable?: boolean; // If true, allows drag interaction (logic handled by parent usually, but visual cue)
    onClick?: () => void;
    className?: string;
    showDescriptionWhenUnrevealed?: boolean;
}

export const ChronoCard: React.FC<ChronoCardProps> = ({
    event,
    isRevealed = false,
    onClick,
    className = '',
    showDescriptionWhenUnrevealed = true
}) => {
    return (
        <motion.div
            className={`relative w-56 h-72 perspective-1000 cursor-pointer select-none ${className}`}
            onClick={onClick}
            whileHover={{ y: -5 }}
        >
            <motion.div
                className="w-full h-full relative preserve-3d transition-all duration-700"
                animate={{ rotateY: isRevealed ? 180 : 0 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front of Card (Hidden/Revealing) */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-start p-4 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="flex-1 flex flex-col items-center gap-2 pt-2">
                        <h3 className="font-bold text-slate-800 line-clamp-2 text-center text-sm leading-tight h-10 flex items-center">{event.title}</h3>
                        <div className="flex flex-col items-center gap-2 mt-1">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold shrink-0 border border-slate-100 shadow-inner">
                                ?
                            </div>
                            {showDescriptionWhenUnrevealed && (
                                <p className="text-xs text-slate-500 line-clamp-5 leading-relaxed text-center px-1">{event.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="w-full h-1 bg-slate-200 rounded-full" />
                </div>

                {/* Back of Card (Revealed) */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-start p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl shadow-md overflow-hidden"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    <div className="flex-1 flex flex-col items-center gap-3 pt-4 text-center">
                        <motion.span
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={isRevealed ? { scale: 1, opacity: 1 } : {}}
                            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-2xl font-black font-mono text-2xl shadow-md tracking-tight border-2 border-white/20"
                        >
                            {event.displayDate}
                        </motion.span>
                        <h3 className="font-bold text-slate-900 line-clamp-2 text-sm leading-tight h-10 flex items-center mt-2">{event.title}</h3>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-5 leading-relaxed italic px-1">
                            "{event.description}"
                        </p>

                        {event.sourceUrl && (
                            <a
                                href={event.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Les mer →
                            </a>
                        )}
                    </div>
                    <div className="w-full h-1 bg-indigo-500 rounded-full" />
                </div>
            </motion.div>
        </motion.div>
    );
};
