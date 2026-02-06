import React from 'react';
import { useComposition } from './useComposition';
import { StructureTimeline } from './StructureTimeline';
import { NotationEditor } from './NotationEditor';
import { RhythmPalette } from './RhythmPalette';

export const CompositionTool: React.FC = () => {
    const {
        composition,
        activeSection,
        activeSectionId,
        setActiveSectionId,
        addSection,
        updateSection,
        updateSectionBars,
        updateBar,
        addChord,
        removeChord,
        removeSection,
        selectedDuration,
        setSelectedDuration,
        isRestMode,
        setIsRestMode
    } = useComposition();

    const scrollToSection = (id: string) => {
        setActiveSectionId(id);
        const el = document.getElementById(`section-${id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-[#FDFBF7] relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            {/* Header / Timeline Area */}
            <div className="p-6 pb-2 bg-slate-50/50 backdrop-blur-sm border-b border-slate-200 z-10 sticky top-0">
                <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">{composition.title}</h2>
                    <div className="px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-mono text-slate-500">
                        {composition.tempo} BPM
                    </div>
                </div>

                <StructureTimeline
                    sections={composition.sections}
                    activeSectionId={activeSectionId}
                    onSelectSection={scrollToSection}
                    onAddSection={addSection}
                    onRemoveSection={removeSection}
                />
            </div>

            {/* Main Content: Continuous Scroll List */}
            <div className="flex-1 overflow-y-auto relative p-8 scroll-smooth pb-32">
                <div className="max-w-6xl mx-auto space-y-16">
                    {composition.sections.map((section) => (
                        <div key={section.id} id={`section-${section.id}`} className="relative">
                            {/* Section Header */}
                            <div className="flex items-center gap-4 mb-6 flex-wrap">
                                <h3 className="text-xl font-bold uppercase tracking-widest text-slate-700 bg-slate-100/50 px-3 py-1 rounded">
                                    {section.name}
                                </h3>

                                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
                                    <span>Gjenta:</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={99}
                                        value={section.repeatCount}
                                        onChange={(e) => updateSection(section.id, { repeatCount: parseInt(e.target.value) || 1 })}
                                        className="w-10 bg-transparent text-center font-bold text-slate-800 outline-none focus:bg-slate-50 rounded"
                                    />
                                    <span>ganger</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
                                    <span>Takter:</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={64}
                                        value={section.bars.length}
                                        onChange={(e) => updateSectionBars(section.id, parseInt(e.target.value) || 4)}
                                        className="w-10 bg-transparent text-center font-bold text-slate-800 outline-none focus:bg-slate-50 rounded"
                                    />
                                </div>
                            </div>

                            {/* Section Editor */}
                            <div className="pl-4 border-l-2 border-slate-100">
                                <NotationEditor
                                    bars={section.bars}
                                    selectedDuration={selectedDuration}
                                    isRestMode={isRestMode}
                                    onUpdateBar={(barId, nodes) => updateBar(section.id, barId, nodes)}
                                    onAddChord={(barId, beat, chord) => addChord(section.id, barId, beat, chord)}
                                    onRemoveChord={(barId, chordIdx) => removeChord(section.id, barId, chordIdx)}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Empty State / End of song */}
                    <div className="h-32 flex items-center justify-center text-slate-300 italic">
                        — Slutt på komposisjon —
                    </div>
                </div>
            </div>

            {/* Floating Palette */}
            <RhythmPalette
                selectedDuration={selectedDuration}
                isRestMode={isRestMode}
                onSelectDuration={setSelectedDuration}
                onToggleRestMode={() => setIsRestMode(!isRestMode)}
            />

            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-20 z-0 pointer-events-none" />
        </div>
    );
};
