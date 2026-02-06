import React from 'react';
import { motion } from 'framer-motion';
import type { Bar, RhythmNode, NoteDuration, NoteType } from './types';

interface NotationEditorProps {
    bars: Bar[];
    selectedDuration: NoteDuration;
    isRestMode: boolean;
    onUpdateBar: (barId: string, nodes: RhythmNode[]) => void;
    onAddChord: (barId: string, beat: number, chord: string) => void;
    onRemoveChord: (barId: string, chordIndex: number) => void;
}

export const NotationEditor: React.FC<NotationEditorProps> = ({
    bars,
    selectedDuration,
    isRestMode,
    onUpdateBar,
    onAddChord,
    onRemoveChord
}) => {
    const [editingChord, setEditingChord] = React.useState<{ barId: string, beat: number, x: number, y: number } | null>(null);

    return (
        <div className="w-full relative" onClick={() => setEditingChord(null)}>
            <div className="flex flex-wrap gap-x-0 gap-y-12 items-start content-start">
                {bars.map((bar, barIndex) => (
                    <div key={bar.id} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                        <BarView
                            bar={bar}
                            index={barIndex + 1}
                            selectedDuration={selectedDuration}
                            isRestMode={isRestMode}
                            onUpdateNodes={(nodes) => onUpdateBar(bar.id, nodes)}
                            onAddChord={(beat, chord) => onAddChord(bar.id, beat, chord)}
                            onRemoveChord={(idx) => onRemoveChord(bar.id, idx)}
                            setEditingChord={setEditingChord}
                        />
                    </div>
                ))}
            </div>

            {/* Inline Chord Input Overlay */}
            {editingChord && (
                <div
                    className="fixed z-50 bg-white shadow-xl rounded-lg border border-indigo-200 p-1 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100"
                    style={{ left: editingChord.x - 20, top: editingChord.y - 10 }}
                    onClick={(e) => {
                        e.stopPropagation(); // Critical: Prevent click from bubbling to the container which closes it
                    }}
                >
                    <input
                        autoFocus
                        placeholder="Am7..."
                        className="w-20 px-2 py-1 text-sm font-bold font-serif outline-none bg-transparent"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = e.currentTarget.value.trim();
                                if (val) onAddChord(editingChord.barId, editingChord.beat, val);
                                setEditingChord(null);
                            }
                            if (e.key === 'Escape') setEditingChord(null);
                        }}
                        onBlur={(e) => {
                            const val = e.currentTarget.value.trim();
                            if (val) onAddChord(editingChord.barId, editingChord.beat, val);
                            setEditingChord(null);
                        }}
                    />
                    <div className="text-[9px] text-slate-400 px-1 font-sans">Trykk Enter</div>
                </div>
            )}
        </div>
    );
};

// --- Sub-components ---

const BarView: React.FC<{
    bar: Bar,
    index: number,
    selectedDuration: NoteDuration,
    isRestMode: boolean,
    onUpdateNodes: (nodes: RhythmNode[]) => void,
    onAddChord: (beat: number, chord: string) => void,
    onRemoveChord: (index: number) => void,
    setEditingChord: (data: { barId: string, beat: number, x: number, y: number }) => void
}> = ({ bar, index, selectedDuration, isRestMode, onUpdateNodes, onAddChord, onRemoveChord, setEditingChord }) => {

    const handleNodeClick = (nodeIndex: number) => {
        // Replace logic: Update the clicked node with the selected duration/type
        // In a real editor, this would handle splitting/merging logic to maintain time signature.
        // For now: Simple replacement
        const newNodes = [...bar.nodes];
        newNodes[nodeIndex] = {
            ...newNodes[nodeIndex],
            type: isRestMode ? 'rest' : 'note',
            duration: selectedDuration
        };
        onUpdateNodes(newNodes);
    };

    return (
        <div className="relative w-full h-[220px] border-r-0 border-b border-slate-100 flex flex-col justify-center group transform transition-all hover:bg-white/50 rounded-xl hover:shadow-sm">
            {/* Bar Number */}
            <div className="absolute top-4 left-4 text-[10px] font-serif font-bold text-slate-300 select-none">
                {index}
            </div>

            {/* Chord Layer (Top) */}
            <div className="absolute top-2 left-0 right-0 h-10 z-20 group/chord-layer">
                {/* Visual Cue: Dotted line or faint text indicating clickable area */}
                <div className="absolute inset-0 border-b border-indigo-100/50 opacity-0 group-hover/chord-layer:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-indigo-300 font-sans tracking-widest uppercase">Klikk for å legge til akkord</span>
                </div>

                {bar.chords.map((chord, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, y: 5 }}
                        animate={{ scale: 1, y: 0 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Slette ${chord.chord}?`)) onRemoveChord(i);
                        }}
                        className="absolute -translate-x-1/2 bg-white px-2 py-0.5 rounded-lg text-slate-800 font-serif text-xs shadow-sm border border-slate-100 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors cursor-pointer z-30 select-none"
                        style={{ left: `${(chord.beatPosition / 4) * 100}%` }}
                    >
                        {chord.chord}
                    </motion.div>
                ))}

                {/* Input Field Overlay (Conditional) or Global Handler */}
                <div
                    className="absolute inset-x-0 h-full cursor-text"
                    onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const beat = Math.round((x / rect.width) * 4 * 2) / 2;

                        // We use a custom Input element positioned at the click
                        setEditingChord({ barId: bar.id, beat, x: e.clientX, y: rect.top });
                    }}
                />
            </div>

            {/* Staff Area */}
            <div className="relative mx-4 h-32 flex items-center mt-6">
                {/* 5-Line Staff (Visual Only) */}
                <div className="absolute inset-x-0 h-16 border-t border-b border-slate-200 opacity-40 flex flex-col justify-between py-[5px] pointer-events-none">
                    <div className="w-full h-px bg-slate-200" />
                    <div className="w-full h-px bg-slate-200" />
                    <div className="w-full h-px bg-slate-200" />
                </div>

                {/* Nodes Container */}
                <div className="absolute inset-0 flex items-center z-10 w-full">
                    {bar.nodes.map((node, i) => (
                        <div
                            key={node.id}
                            onClick={() => handleNodeClick(i)}
                            className="flex-1 flex justify-center items-center h-full relative group/note cursor-pointer hover:bg-indigo-50/20 rounded-md transition-colors"
                        >
                            <NoteSymbol type={node.type} duration={node.duration} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const NoteSymbol: React.FC<{ type: NoteType, duration: NoteDuration }> = ({ type, duration }) => {
    // Custom SVG rendering for "Avant-Garde" look
    const isRest = type === 'rest';

    return (
        <motion.div
            whileHover={{ scale: 1.2, rotate: isRest ? 0 : 5 }}
            whileTap={{ scale: 0.9 }}
            className={`w-10 h-10 flex items-center justify-center ${isRest ? 'opacity-40' : 'opacity-100'}`}
        >
            {isRest ? (
                // Rest Symbol (Simplified abstract shape)
                <div className="w-6 h-2 bg-slate-400 rounded-full" />
            ) : (
                // Note Symbol (Circle with stem)
                <div className="relative pointer-events-none">
                    <div className={`w-4 h-4 rounded-full bg-slate-800 ${duration === '1n' || duration === '2n' ? 'bg-transparent border-[3px] border-slate-800' : ''}`} />
                    {duration !== '1n' && <div className="absolute right-0 bottom-1 w-[2px] h-10 bg-slate-800 rounded-full" />}
                    {duration === '8n' && <div className="absolute right-0 top-[-16px] w-4 h-3 border-t-[3px] border-r-[3px] border-slate-800 rounded-tr-md" />}
                </div>
            )}
        </motion.div>
    );
};
