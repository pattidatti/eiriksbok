import React from 'react';
import { motion } from 'framer-motion';

interface FilterBarProps {
    subjects: string[];
    selectedSubject: string;
    onSelectSubject: (subject: string) => void;
    counts: Record<string, number>;
}

export const FilterBar: React.FC<FilterBarProps> = ({ subjects, selectedSubject, onSelectSubject, counts }) => {
    return (
        <div className="sticky top-[64px] z-30 w-full bg-slate-50/80 backdrop-blur-md border-b border-indigo-100/50 py-3 px-6 transition-all duration-300">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 max-w-[1920px] mx-auto items-center">

                {/* "Alle" Pill */}
                <button
                    onClick={() => onSelectSubject('Alle')}
                    className={`
                        whitespace-nowrap px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                        ${selectedSubject === 'Alle'
                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-105'
                            : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/60'}
                    `}
                >
                    Alle <span className="ml-1.5 opacity-60 text-xs">{Object.values(counts).reduce((a, b) => a + b, 0)}</span>
                </button>

                <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

                {/* Subject Pills */}
                {subjects.map((subject) => (
                    <button
                        key={subject}
                        onClick={() => onSelectSubject(subject)}
                        className={`
                            whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 capitalize
                            ${selectedSubject === subject
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105'
                                : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/60'}
                        `}
                    >
                        {subject}
                        <span className={`ml-1.5 text-xs ${selectedSubject === subject ? 'opacity-80' : 'opacity-40'}`}>
                            {counts[subject] || 0}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
