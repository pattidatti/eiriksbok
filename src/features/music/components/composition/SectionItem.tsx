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

            {/* Drag Handle Area */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-0 top-0 bottom-0 w-10 flex items-start justify-center pt-8 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 transition-colors z-10 touch-none"
                title="Dra for å flytte"
            >
                <GripVertical size={20} />
            </div>

            <div className="pl-10">
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-sm border border-slate-200/50 ${section.color} ${section.color.replace('bg-', 'text-').replace('-100', '-900')}`}>
                        <span className="text-[11px] md:text-xs font-black uppercase tracking-widest">{section.name}</span>
                        <div className="flex items-center gap-1 bg-white/40 px-2 py-0.5 rounded-lg cursor-default border border-black/5 ml-1">
                            <span className="text-[11px] font-black opacity-80">x{section.repeatCount}</span>
                            <div className="flex flex-col -space-y-1 ml-1 scale-75 origin-left border-l border-black/10 pl-1.5">
                                <button
                                    onClick={() => updateSection(section.id, { repeatCount: section.repeatCount + 1 })}
                                    className="hover:text-black transition-colors opacity-50 hover:opacity-100"
                                >
                                    ▲
                                </button>
                                <button
                                    onClick={() => updateSection(section.id, { repeatCount: Math.max(1, section.repeatCount - 1) })}
                                    className="hover:text-black transition-colors opacity-50 hover:opacity-100"
                                >
                                    ▼
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                        <span className="opacity-60 uppercase font-black tracking-tighter">Takter:</span>
                        <input
                            type="number"
                            min={1}
                            max={64}
                            value={section.bars.length}
                            onChange={(e) => updateSectionBars(section.id, parseInt(e.target.value) || 4)}
                            className="w-10 bg-slate-50 rounded text-center font-black text-slate-900 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-1 ml-auto bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
                        {['Vokal', 'Trommer', 'Bass', 'Gitar', 'Piano'].map((inst) => (
                            <button
                                key={inst}
                                onClick={() => toggleInstrument(section.id, inst as any)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all border ${section.instruments?.includes(inst as any)
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {inst}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => removeSection(section.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                        title="Fjern seksjon"
                    >
                        <span className="sr-only">Fjern</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
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
