import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
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
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 0 : 1,
    };

    if (isOverlay) {
        return (
            <div className="relative group/section bg-white rounded-xl shadow-2xl rotate-2 scale-105 opacity-90 border border-slate-900/10 cursor-grabbing">
                {/* Simplified Overlay View */}
                <div className="flex items-center gap-2 mb-3 flex-wrap p-4 bg-slate-50/50 rounded-t-xl">
                    <div className="p-2 text-slate-400">
                        <GripVertical size={20} />
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-sm border border-slate-200/50 ${section.color} ${section.color.replace('bg-', 'text-').replace('-100', '-900')}`}>
                        <span className="text-xs font-black uppercase tracking-widest">{section.name}</span>
                    </div>
                </div>
                <div className="pl-16 pr-4 pb-4 opacity-50">
                    <div className="h-24 bg-slate-100 rounded-lg w-full" />
                </div>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} id={`section-${section.id}`} className="relative group/section pl-2">

            <div className="pl-2">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">

                    {/* Main Control Strip (Draggable Handle) */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="flex items-center shadow-sm border border-slate-200 rounded-xl bg-white overflow-hidden h-10 cursor-grab active:cursor-grabbing hover:border-slate-300 transition-colors touch-none"
                    >
                        {/* Section Handle/Name */}
                        <div className={`h-full px-4 flex items-center justify-center gap-2 ${section.color} ${section.color.replace('bg-', 'text-').replace('-100', '-900')} border-r border-black/5`}>
                            <span className="text-xs font-black uppercase tracking-widest pointer-events-none">{section.name}</span>
                        </div>

                        {/* Bars Input */}
                        <div className="h-full flex items-center px-3 gap-2 border-r border-slate-100 hover:bg-slate-50 transition-colors"
                            onPointerDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Takter</span>
                            <input
                                type="number"
                                min={1}
                                max={64}
                                value={section.bars.length}
                                onChange={(e) => updateSectionBars(section.id, parseInt(e.target.value) || 4)}
                                className="w-8 bg-transparent text-center font-bold text-slate-800 text-sm outline-none appearance-none"
                            />
                        </div>

                        {/* Repeats (Runder) */}
                        <div className="h-full flex items-center px-3 gap-2 hover:bg-slate-50 transition-colors"
                            onPointerDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Runder</span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => updateSection(section.id, { repeatCount: Math.max(1, section.repeatCount - 1) })}
                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 text-slate-500 font-bold transition-colors"
                                >
                                    -
                                </button>
                                <span className="w-4 text-center font-bold text-slate-800 text-sm">{section.repeatCount}</span>
                                <button
                                    onClick={() => updateSection(section.id, { repeatCount: section.repeatCount + 1 })}
                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 text-slate-500 font-bold transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-slate-200 hidden sm:block" />

                    {/* Instruments */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm h-10">
                        {['Vokal', 'Trommer', 'Bass', 'Gitar', 'Piano'].map((inst) => (
                            <button
                                key={inst}
                                onClick={() => toggleInstrument(section.id, inst as any)}
                                className={`px-2.5 h-full rounded-lg text-[10px] font-black transition-all border border-transparent ${section.instruments?.includes(inst as any)
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {inst}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => removeSection(section.id)}
                        className="ml-auto w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Fjern seksjon"
                    >
                        <span className="sr-only">Fjern</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <div className="pl-4 relative">
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
