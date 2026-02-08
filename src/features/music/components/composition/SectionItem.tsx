import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LayoutGrid, Repeat, Trash2 } from 'lucide-react';
import { NotationEditor } from './NotationEditor';
import type { Section, NoteDuration, InstrumentType } from './types';

interface SectionItemProps {
    section: Section;
    selectedDuration: NoteDuration;
    isRestMode: boolean;
    updateSection: (id: string, updates: Partial<Section>) => void;
    updateSectionBars: (id: string, count: number) => void;
    updateBar: (sectionId: string, barId: string, index: number, duration: NoteDuration, isRest: boolean) => void;
    addChord: (sectionId: string, barId: string, beatIndex: number, chord: string) => void;
    removeChord: (sectionId: string, barId: string, chordIndex: number) => void;
    toggleInstrument: (sectionId: string, instrument: InstrumentType) => void;
    removeSection: (id: string) => void;
    onUpdateLyrics?: (sectionId: string, barId: string, text: string) => void;
    isOverlay?: boolean;
}

export const SectionItem: React.FC<SectionItemProps> = ({
    section,
    selectedDuration,
    isRestMode,
    updateSection,
    updateSectionBars,
    updateBar,
    addChord,
    removeChord,
    toggleInstrument,
    removeSection,
    onUpdateLyrics,
    isOverlay = false
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
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 1,
        position: 'relative' as const,
    };

    if (isOverlay) {
        return (
            <div className="relative bg-white rounded-2xl shadow-xl p-4 border border-slate-100 opacity-90 scale-105 rotate-1">
                <div className="h-10 bg-slate-50 rounded-xl w-full mb-4" />
                <div className="h-24 bg-slate-50/50 rounded-xl w-full" />
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} id={`section-${section.id}`} className="mb-6 touch-none">

            {/* Main Container acting as Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="group/section bg-white rounded-3xl p-1 pl-2 shadow-sm border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing relative"
            >
                {/* Header / Control Strip */}
                <div className="flex items-center gap-4 p-2">

                    {/* Section Name Pill */}
                    <div className={`px-4 py-1.5 rounded-full ${section.color} ${section.color.replace('bg-', 'text-').replace('-100', '-700')} shadow-sm`}>
                        <span className="text-[10px] font-black uppercase tracking-widest pointer-events-none">{section.name}</span>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-slate-100 hidden sm:block" />

                    {/* Metrics Group */}
                    <div className="flex items-center gap-6">
                        {/* Bars */}
                        <div className="flex items-center gap-2 group/metric"
                            onPointerDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <LayoutGrid size={15} className="text-slate-300 group-hover/metric:text-indigo-400 transition-colors" />
                            <input
                                type="number"
                                min={1}
                                max={64}
                                value={section.bars.length}
                                onChange={(e) => updateSectionBars(section.id, parseInt(e.target.value) || 4)}
                                className="w-8 bg-transparent font-bold text-sm text-slate-700 outline-none hover:text-indigo-600 transition-colors cursor-text"
                                title="Antall takter"
                            />
                        </div>

                        {/* Repeats */}
                        <div className="flex items-center gap-2 group/metric"
                            onPointerDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <Repeat size={15} className="text-slate-300 group-hover/metric:text-amber-400 transition-colors" />
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-sm text-slate-700 w-4 text-center">{section.repeatCount}</span>
                                <div className="flex flex-col opacity-0 group-hover/metric:opacity-100 transition-opacity -space-y-1">
                                    <button
                                        onClick={() => updateSection(section.id, { repeatCount: section.repeatCount + 1 })}
                                        className="text-[8px] hover:text-amber-600 px-1"
                                    >▲</button>
                                    <button
                                        onClick={() => updateSection(section.id, { repeatCount: Math.max(1, section.repeatCount - 1) })}
                                        className="text-[8px] hover:text-amber-600 px-1"
                                    >▼</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instrument Toggles */}
                    <div className="flex items-center gap-1 ml-auto"
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                        {[
                            { id: 'Vokal', label: 'V' },
                            { id: 'Trommer', label: 'T' },
                            { id: 'Bass', label: 'B' },
                            { id: 'Gitar', label: 'G' },
                            { id: 'Piano', label: 'P' }
                        ].map((inst) => (
                            <button
                                key={inst.id}
                                onClick={() => toggleInstrument(section.id, inst.id as any)}
                                title={inst.id}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-200 border border-transparent ${section.instruments?.includes(inst.id as any)
                                        ? 'bg-slate-900 text-white shadow-md scale-100'
                                        : 'bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-400 hover:scale-105'
                                    }`}
                            >
                                {inst.label}
                            </button>
                        ))}
                    </div>

                    {/* Delete Action */}
                    <button
                        onClick={() => removeSection(section.id)}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all ml-2"
                        title="Fjern seksjon"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="px-2 pb-4 pt-0"
                    onPointerDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <NotationEditor
                        bars={section.bars}
                        color={section.color}
                        selectedDuration={selectedDuration}
                        isRestMode={isRestMode}
                        onUpdateBar={(barId, nodeIndex, duration, isRest) => updateBar(section.id, barId, nodeIndex, duration, isRest)}
                        onAddChord={(barId, beat, chord) => addChord(section.id, barId, beat, chord)}
                        onRemoveChord={(barId, chordIdx) => removeChord(section.id, barId, chordIdx)}
                        onUpdateLyrics={(barId, text) => onUpdateLyrics && onUpdateLyrics(section.id, barId, text)}
                    />
                </div>
            </div>
        </div>
    );
};
