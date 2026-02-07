import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    type DragStartEvent,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import type { Section, SectionType } from './types';
import { Plus } from 'lucide-react';
import { SortableSectionItem } from './SortableSectionItem';

interface StructureTimelineProps {
    sections: Section[];
    activeSectionId: string;
    onSelectSection: (id: string) => void;
    onAddSection: (type: SectionType) => void;
    onRemoveSection: (id: string) => void;
    onReorderSections?: (oldIndex: number, newIndex: number) => void; // Added prop
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
    onRemoveSection,
    onReorderSections
}) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags when clicking
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id && onReorderSections) {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over.id);
            onReorderSections(oldIndex, newIndex);
        }
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    const activeSection = sections.find(s => s.id === activeId);

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Current Structure Row */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <SortableContext
                        items={sections.map(s => s.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {sections.map((section) => (
                            <SortableSectionItem
                                key={section.id}
                                section={section}
                                isActive={section.id === activeSectionId}
                                onSelect={() => onSelectSection(section.id)}
                                onRemove={() => onRemoveSection(section.id)}
                            />
                        ))}
                    </SortableContext>
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId && activeSection ? (
                        <SortableSectionItem
                            section={activeSection}
                            isActive={activeSectionId === activeSection.id}
                            onSelect={() => { }}
                            onRemove={() => { }}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Add Section Palette (Separate Row) */}
            <div className="flex items-center gap-2 border-t border-slate-100 pt-2 overflow-x-auto no-scrollbar">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mr-2 whitespace-nowrap">Legg til:</span>
                {SECTION_TYPES.map((def) => (
                    <button
                        key={def.type}
                        onClick={() => onAddSection(def.type)}
                        className={`
                            h-7 px-3 rounded flex items-center gap-1.5
                            text-[9px] font-black uppercase tracking-tight
                            transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-black/5
                            ${def.color} opacity-60 hover:opacity-100 whitespace-nowrap
                        `}
                    >
                        <Plus size={10} strokeWidth={4} />
                        {def.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
