import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { Section, SectionType } from './types';

interface SortableSectionItemProps {
    section: Section;
    isActive: boolean;
    onSelect: () => void;
    onRemove: () => void;
}

export const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
    section,
    isActive,
    onSelect,
    onRemove
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative group touch-none outline-none`} // touch-none for better mobile drag
        >
            <motion.div
                layout
                onClick={onSelect}
                className={`
                    relative h-8 px-3 rounded border cursor-grab active:cursor-grabbing
                    flex items-center gap-2 transition-all select-none
                    ${isActive ? 'ring-2 ring-slate-400 font-bold shadow-sm ring-inset' : 'opacity-70 hover:opacity-100 hover:bg-white'}
                    ${getSectionStyles(section.type)}
                    ${isDragging ? 'shadow-2xl scale-105 rotate-2 opacity-90 ring-2 ring-slate-900 ring-offset-2' : ''}
                `}
            >
                <span className="text-[10px] font-black uppercase tracking-wider">{section.name}</span>

                {/* Remove Button - Stop propagation to prevent drag start on click if possible, or just handle carefully */}
                <div
                    role="button"
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking remove
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Slette seksjon?')) onRemove();
                    }}
                    className="w-3 h-3 rounded-full bg-black/5 hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-[8px]"
                >
                    ✕
                </div>
            </motion.div>
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
