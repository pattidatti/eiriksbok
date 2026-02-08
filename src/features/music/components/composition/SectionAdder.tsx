import React from 'react';
import { Plus } from 'lucide-react';
import type { SectionType } from './types';
import { motion } from 'framer-motion';

interface SectionAdderProps {
    onAddSection: (type: SectionType) => void;
}

const SECTION_TYPES: { type: SectionType, label: string, color: string }[] = [
    { type: 'intro', label: 'Intro', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
    { type: 'verse', label: 'Vers', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { type: 'preChorus', label: 'Pre-refreng', color: 'bg-pink-100 border-pink-300 text-pink-800' },
    { type: 'chorus', label: 'Refreng', color: 'bg-rose-100 border-rose-300 text-rose-800' },
    { type: 'bridge', label: 'Bro', color: 'bg-amber-100 border-amber-300 text-amber-800' },
    { type: 'interlude', label: 'Mellomspill', color: 'bg-teal-100 border-teal-300 text-teal-800' },
    { type: 'solo', label: 'Solo', color: 'bg-orange-100 border-orange-300 text-orange-800' },
    { type: 'outro', label: 'Outro', color: 'bg-purple-100 border-purple-300 text-purple-800' },
];

export const SectionAdder: React.FC<SectionAdderProps> = ({ onAddSection }) => {
    return (
        <div className="w-full py-8 flex flex-col items-center justify-center gap-4 border-t border-slate-100 mt-8">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">
                Legg til ny del
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
                {SECTION_TYPES.map((def, i) => (
                    <motion.button
                        key={def.type}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAddSection(def.type)}
                        className={`
                            h-9 px-4 rounded-xl flex items-center gap-2
                            text-[10px] font-black uppercase tracking-widest
                            transition-all border border-transparent hover:border-black/5 shadow-sm hover:shadow-md
                            ${def.color} opacity-80 hover:opacity-100 whitespace-nowrap
                        `}
                    >
                        <Plus size={12} strokeWidth={4} />
                        {def.label}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
