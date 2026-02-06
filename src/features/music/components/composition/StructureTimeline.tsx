import React from 'react';
import { motion } from 'framer-motion';
import type { Section, SectionType } from './types';
import { Plus } from 'lucide-react';

interface StructureTimelineProps {
    sections: Section[];
    activeSectionId: string;
    onSelectSection: (id: string) => void;
    onAddSection: (type: SectionType) => void;
    onRemoveSection: (id: string) => void;
}

const SECTION_TYPES: { type: SectionType, label: string, color: string }[] = [
    { type: 'intro', label: 'Intro', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
    { type: 'verse', label: 'Vers', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { type: 'chorus', label: 'Refreng', color: 'bg-rose-100 border-rose-300 text-rose-800' },
    { type: 'bridge', label: 'Bro', color: 'bg-amber-100 border-amber-300 text-amber-800' },
    { type: 'solo', label: 'Solo', color: 'bg-orange-100 border-orange-300 text-orange-800' },
    { type: 'outro', label: 'Outro', color: 'bg-purple-100 border-purple-300 text-purple-800' },
];

export const StructureTimeline: React.FC<StructureTimelineProps> = ({
    sections,
    activeSectionId,
    onSelectSection,
    onAddSection,
    onRemoveSection
}) => {
    return (
        <div className="w-full space-y-4">
            <div className="flex flex-wrap items-center gap-2 pb-2">
                {sections.map((section) => (
                    <motion.div
                        key={section.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => onSelectSection(section.id)}
                        className={`
                            relative h-10 px-4 rounded-full border cursor-pointer
                            flex items-center gap-2 transition-all group
                            ${section.id === activeSectionId ? 'ring-2 ring-offset-1 ring-slate-400 font-bold shadow-md transform scale-105' : 'opacity-80 hover:opacity-100 hover:scale-105 active:scale-95'}
                            ${getSectionStyles(section.type)}
                        `}
                    >
                        <span className="text-xs uppercase tracking-widest">{section.name}</span>
                        {/* Delete Button */}
                        <div
                            role="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Slette seksjon?')) onRemoveSection(section.id);
                            }}
                            className="ml-2 w-4 h-4 rounded-full bg-black/10 hover:bg-red-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-[10px]"
                        >
                            ✕
                        </div>
                    </motion.div>
                ))}

                {/* Add Section Group */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-2">
                    {SECTION_TYPES.map((def) => (
                        <button
                            key={def.type}
                            onClick={() => onAddSection(def.type)}
                            className={`
                                h-8 px-3 rounded-full flex items-center gap-1.5
                                text-xs font-bold uppercase tracking-wider
                                transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md
                                ${def.color} opacity-80 hover:opacity-100
                            `}
                        >
                            <Plus size={12} strokeWidth={3} />
                            {def.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const getSectionStyles = (type: SectionType) => {
    switch (type) {
        case 'intro': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
        case 'verse': return 'bg-blue-50 border-blue-200 text-blue-700';
        case 'chorus': return 'bg-rose-50 border-rose-200 text-rose-700';
        case 'bridge': return 'bg-amber-50 border-amber-200 text-amber-700';
        case 'solo': return 'bg-orange-50 border-orange-200 text-orange-700';
        case 'outro': return 'bg-purple-50 border-purple-200 text-purple-700';
        default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
};
