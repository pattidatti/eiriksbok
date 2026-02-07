import type { Bar, NoteDuration, NoteType } from './types';

interface NotationEditorProps {
    bars: Bar[];
    color: string;
    selectedDuration: NoteDuration;
    isRestMode: boolean;
    onUpdateBar: (barId: string, nodeIndex: number, duration: NoteDuration, isRest: boolean) => void;
    onAddChord: (barId: string, beat: number, chord: string) => void;
    onRemoveChord: (barId: string, chordIndex: number) => void;
}

export const NotationEditor: React.FC<NotationEditorProps> = ({
    bars,
    color,
    selectedDuration,
    isRestMode,
    onUpdateBar,
    onAddChord,
    onRemoveChord
}) => {
    const [editingChord, setEditingChord] = React.useState<{ barId: string, beat: number, x: number, y: number } | null>(null);

    return (
        <div className="w-full relative" onClick={() => setEditingChord(null)}>
            <LayoutGroup>
                <div className="flex flex-wrap gap-x-0 gap-y-4 items-start content-start">
                    {bars.map((bar, barIndex) => (
                        <div key={bar.id} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                            <BarView
                                bar={bar}
                                index={barIndex + 1}
                                color={color}
                                onNodeClick={(idx) => onUpdateBar(bar.id, idx, selectedDuration, isRestMode)}
                                onRemoveChord={(idx) => onRemoveChord(bar.id, idx)}
                                setEditingChord={setEditingChord}
                            />
                        </div>
                    ))}
                </div>
            </LayoutGroup>


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
    color: string,
    onNodeClick: (nodeIndex: number) => void,
    onRemoveChord: (index: number) => void,
    setEditingChord: (data: { barId: string, beat: number, x: number, y: number }) => void
}> = ({ bar, index, color, onNodeClick, onRemoveChord, setEditingChord }) => {

    return (
        <div className={`relative w-full h-[100px] border-r-0 border-b border-slate-100 flex flex-col justify-end group transform transition-all hover:bg-white/50 rounded-xl hover:shadow-sm pb-1 overflow-hidden`}>
            {/* Color tint background */}
            <div className={`absolute inset-0 ${color} opacity-[0.06] pointer-events-none`} />

            {/* Bar Number */}
            <div className="absolute top-1.5 left-2 text-[9px] font-serif font-bold text-slate-300 select-none">
                {index}
            </div>

            {/* Staff & Notes Area */}
            <div className="relative mx-3 h-14 flex items-center">
                {/* 5-Line Staff (Visual Only) */}
                <div className="absolute inset-x-0 h-8 border-t border-b border-slate-200 opacity-40 flex flex-col justify-between py-[2px] pointer-events-none">
                    <div className={`w-full h-px ${color.replace('bg-', 'bg-').replace('-100', '-300')} opacity-30`} />
                    <div className={`w-full h-px ${color.replace('bg-', 'bg-').replace('-100', '-300')} opacity-30`} />
                    <div className={`w-full h-px ${color.replace('bg-', 'bg-').replace('-100', '-300')} opacity-30`} />
                </div>

                {/* Nodes Container */}
                <div className="absolute inset-0 flex items-center z-10 w-full">
                    {bar.nodes.map((node, i) => {
                        const beatPos = i;
                        const nodeChord = bar.chords.find(c => Math.abs(c.beatPosition - beatPos) < 0.1);

                        return (
                            <motion.div
                                key={node.id}
                                layout
                                className="flex-1 flex flex-col justify-end items-center h-full relative group/note"
                            >
                                {/* Chord Zone (Above Note) - Higher elevation */}
                                <div
                                    className="absolute -top-10 inset-x-0 h-10 flex items-center justify-center cursor-text z-20"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setEditingChord({ barId: bar.id, beat: beatPos, x: rect.left + rect.width / 2, y: rect.top });
                                    }}
                                >
                                    {nodeChord ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const idx = bar.chords.indexOf(nodeChord);
                                                if (confirm(`Slette ${nodeChord.chord}?`)) onRemoveChord(idx);
                                            }}
                                            className={`bg-white/95 backdrop-blur-sm px-2.5 py-0.5 rounded text-slate-900 font-serif text-[15px] font-black shadow-lg border-2 ${color.replace('bg-', 'border-').replace('-100', '-300')} hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors cursor-pointer z-30`}
                                        >
                                            {nodeChord.chord}
                                        </motion.div>
                                    ) : (
                                        <div className="opacity-0 group-hover/note:opacity-100 transition-opacity">
                                            <div className="w-6 h-4 border border-dashed border-indigo-200 rounded flex items-center justify-center text-[8px] text-indigo-300 uppercase font-bold bg-white/50">
                                                C
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div
                                    onClick={() => onNodeClick(i)}
                                    className="w-full flex justify-center items-center h-16 cursor-pointer hover:bg-indigo-50/20 rounded transition-colors group/symbol"
                                >
                                    <NoteSymbol type={node.type} duration={node.duration} />
                                    {/* Split Glow Highlight */}
                                    <div className="absolute inset-x-1 bottom-0 h-1 bg-indigo-500/0 group-hover/symbol:bg-indigo-500/10 rounded-full transition-all" />
                                </div>
                            </motion.div>
                        );
                    })}
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
