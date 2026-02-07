import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Share2, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComposition } from './useComposition';
import { useCompositionSync } from './useCompositionSync';
import { getCreatorId } from './utils';
import { StructureTimeline } from './StructureTimeline';
import { NotationEditor } from './NotationEditor';
import { RhythmPalette } from './RhythmPalette';
import { ProjectManager } from './ProjectManager';

export const CompositionTool: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const songId = searchParams.get('id');

    const {
        composition,
        setComposition,
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
        setIsRestMode,
        toggleInstrument,
        renameComposition,
        resetToDefault,
        moveSection
    } = useComposition();

    const { activeUsers, isLoading, saveAsNew, deleteSong } = useCompositionSync(
        composition,
        setComposition,
        songId,
        resetToDefault
    );

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNamingOpen, setIsNamingOpen] = useState(false);
    const [pendingName, setPendingName] = useState('');

    const isCreator = composition.creatorId === getCreatorId();

    const scrollToSection = (id: string) => {
        setActiveSectionId(id);
        const el = document.getElementById(`section-${id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleSaveAsNew = async () => {
        if (!pendingName.trim()) return;

        console.log('Saving as new:', pendingName);
        const newId = await saveAsNew({
            ...composition,
            title: pendingName
        });
        console.log('Saved with ID:', newId);
        setSearchParams({ id: newId });
        setIsNamingOpen(false);
        setPendingName('');
    };

    const handleSelectSong = (id: string) => {
        setSearchParams({ id });
    };

    const handleDeleteSong = async (id: string) => {
        await deleteSong(id);
        if (id === songId) {
            setSearchParams({});
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-[#FDFBF7] relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            {/* Header / Timeline Area */}
            <div className="px-5 py-3 bg-white/40 backdrop-blur-xl border-b border-slate-200/50 z-20 sticky top-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-serif font-black text-slate-900 tracking-tighter">
                            {composition.title}
                            {songId && <span className="ml-3 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-500 font-normal uppercase tracking-widest">{songId}</span>}
                        </h2>

                        {/* Presence Bubble */}
                        {songId ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 shadow-sm animate-pulse">
                                <Users size={12} className="fill-current" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">{activeUsers} aktive</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setPendingName(composition.title);
                                    setIsNamingOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200/50 shadow-sm hover:bg-amber-100 transition-colors animate-in fade-in zoom-in duration-300"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Utkast (Ikke lagret)</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 bg-white rounded-xl border border-slate-100 text-[10px] font-mono text-slate-500 shadow-sm flex items-center gap-3">
                            <span className="opacity-50 uppercase tracking-tighter">Tempo</span>
                            <span className="font-bold text-slate-800 text-xs">{composition.tempo} BPM</span>
                        </div>

                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black hover:shadow-lg transition-all flex items-center gap-2"
                            title="Prosjektmeny"
                        >
                            <Menu size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Meny</span>
                        </button>
                    </div>
                </div>

                <StructureTimeline
                    sections={composition.sections}
                    activeSectionId={activeSectionId}
                    onSelectSection={scrollToSection}
                    onAddSection={addSection}
                    onRemoveSection={removeSection}
                    onReorderSections={moveSection}
                />
            </div>

            {/* Main Content Area */}
            <div id="composition-tool-content" className="flex-1 overflow-y-auto relative px-5 py-6 scroll-smooth pb-40">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FDFBF7] z-30">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Åpner sang...</span>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto space-y-6">
                        {composition.sections.map((section) => (
                            <div key={section.id} id={`section-${section.id}`} className="relative group/section">
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
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="h-40 flex flex-col items-center justify-center gap-4 border-t border-slate-100 mt-12 opacity-40 hover:opacity-100 transition-opacity">
                            {!songId && (
                                <button
                                    onClick={() => {
                                        setPendingName(composition.title);
                                        setIsNamingOpen(true);
                                    }}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-black hover:shadow-xl transition-all hover:scale-105"
                                >
                                    <Share2 size={16} />
                                    Lagre og få delelink
                                </button>
                            )}
                            <div className="text-slate-300 italic text-sm">— Slutt på komposisjon —</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Project Manager Modal */}
            <ProjectManager
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                activeComposition={composition}
                activeSongId={songId}
                isCreator={isCreator}
                onRename={renameComposition}
                onDelete={handleDeleteSong}
                shareUrl={window.location.origin + window.location.pathname + (songId ? `?id=${songId}` : '')}
                onSelect={handleSelectSong}
                onNew={() => {
                    resetToDefault();
                    setSearchParams({});
                    setPendingName('Ny Sang');
                    setIsNamingOpen(true);
                }}
            />

            {/* Floating Palette */}
            {!isLoading && (
                <RhythmPalette
                    selectedDuration={selectedDuration}
                    isRestMode={isRestMode}
                    onSelectDuration={setSelectedDuration}
                    onToggleRestMode={() => setIsRestMode(!isRestMode)}
                />
            )}

            {/* Naming Modal */}
            <AnimatePresence>
                {isNamingOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsNamingOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-slate-100"
                        >
                            <h3 className="text-2xl font-serif font-black text-slate-900 tracking-tighter mb-6">Navngi sangen din</h3>
                            <input
                                autoFocus
                                type="text"
                                value={pendingName}
                                onChange={(e) => setPendingName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveAsNew()}
                                placeholder="Min nye komposisjon..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 mb-6 font-serif text-lg"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsNamingOpen(false)}
                                    className="flex-1 py-3 px-4 rounded-xl text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-colors"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={handleSaveAsNew}
                                    disabled={!pendingName.trim()}
                                    className="flex-[2] py-3 px-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors disabled:opacity-50"
                                >
                                    Lagre sang
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat z-0" />
        </div>
    );
};
