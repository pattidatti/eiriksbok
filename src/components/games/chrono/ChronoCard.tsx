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
}

export const ChronoCard: React.FC<ChronoCardProps> = ({
    event,
    isRevealed = false,
    onClick,
    className = ''
}) => {
    return (
        <motion.div
            layout
            className={`
                relative bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md 
                p-4 w-48 h-64 flex flex-col items-center justify-between text-center cursor-pointer select-none
                transition-all duration-200
                ${className}
            `}
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
        >
            <div className="flex-1 flex flex-col justify-center items-center gap-2">
                <h3 className="font-bold text-slate-800 line-clamp-3">{event.title}</h3>

                {isRevealed ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2"
                    >
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold font-mono text-sm">
                            {event.displayDate}
                        </span>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-3">{event.description}</p>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center gap-2 mt-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">
                            ?
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed">{event.description}</p>
                    </div>
                )}
            </div>

            {/* Decorative bottom bar */}
            <div className={`w-full h-1 rounded-full mt-4 ${isRevealed ? 'bg-indigo-500' : 'bg-slate-200'}`} />
        </motion.div>
    );
};
