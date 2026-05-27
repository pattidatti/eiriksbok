import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Guitar, Music, CheckCircle } from 'lucide-react';

type ShapeId = 'C' | 'A' | 'G' | 'E' | 'D';

interface NotePosition {
    stringIndex: number; // 0 = high E, 5 = low E
    fret: number; // 0 = open string
    role: 'root' | 'third' | 'fifth';
    note: string;
}

interface ShapeConfig {
    id: ShapeId;
    naturalKey: string;
    keyNote: number; // semitones from C (C=0, D=2, E=4, G=7, A=9)
    description: string;
    rootString: string;
    mutedStrings: number[];
    positions: NotePosition[];
}

// stringIndex 0 = high E (1st), 5 = low E (6th)
// Open string notes in semitones from C: high E=4, B=11, G=7, D=2, A=9, low E=4
const OPEN_STRING_SEMITONES = [4, 11, 7, 2, 9, 4];
const OPEN_STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E'];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAJOR_PENTATONIC_INTERVALS = new Set([0, 2, 4, 7, 9]);
const FRET_COUNT = 5; // display frets 0-5
const FRET_MARKERS = new Set([3, 5]);

const SHAPES: ShapeConfig[] = [
    {
        id: 'C',
        naturalKey: 'C dur',
        keyNote: 0,
        description:
            'C-formen starter med grunntonen C på A-strengen (bånd 3). Det åpne C-grepet er denne formen. Flytt den opp halsen med barré, så spiller du andre dur-akkorder.',
        rootString: 'A-strengen, bånd 3',
        mutedStrings: [5],
        positions: [
            { stringIndex: 4, fret: 3, role: 'root', note: 'C' },
            { stringIndex: 3, fret: 2, role: 'third', note: 'E' },
            { stringIndex: 2, fret: 0, role: 'fifth', note: 'G' },
            { stringIndex: 1, fret: 1, role: 'root', note: 'C' },
            { stringIndex: 0, fret: 0, role: 'third', note: 'E' },
        ],
    },
    {
        id: 'A',
        naturalKey: 'A dur',
        keyNote: 9,
        description:
            'A-formen har grunntonen på A-strengen, åpen. Den klassiske barré-formen du bruker for H, D og mange andre akkorder. Kobles naturlig til C-formen foran seg.',
        rootString: 'A-strengen, åpen',
        mutedStrings: [5],
        positions: [
            { stringIndex: 4, fret: 0, role: 'root', note: 'A' },
            { stringIndex: 3, fret: 2, role: 'fifth', note: 'E' },
            { stringIndex: 2, fret: 2, role: 'root', note: 'A' },
            { stringIndex: 1, fret: 2, role: 'third', note: 'C#' },
            { stringIndex: 0, fret: 0, role: 'fifth', note: 'E' },
        ],
    },
    {
        id: 'G',
        naturalKey: 'G dur',
        keyNote: 7,
        description:
            'G-formen dekker alle seks strenger. Grunntonen sitter både på lav og høy E-streng. Vanskelig som barré, men viktig å kjenne igjen som soloposisjon.',
        rootString: 'Begge E-strenger, bånd 3',
        mutedStrings: [],
        positions: [
            { stringIndex: 5, fret: 3, role: 'root', note: 'G' },
            { stringIndex: 4, fret: 2, role: 'third', note: 'B' },
            { stringIndex: 3, fret: 0, role: 'fifth', note: 'D' },
            { stringIndex: 2, fret: 0, role: 'root', note: 'G' },
            { stringIndex: 1, fret: 0, role: 'third', note: 'B' },
            { stringIndex: 0, fret: 3, role: 'root', note: 'G' },
        ],
    },
    {
        id: 'E',
        naturalKey: 'E dur',
        keyNote: 4,
        description:
            'E-formen er den klassiske barré-formen de fleste lærer først. Grunntonen på lav E-streng, åpen. Kjent fra barré-grep på bånd 1 (F dur).',
        rootString: 'E-streng (lav), åpen',
        mutedStrings: [],
        positions: [
            { stringIndex: 5, fret: 0, role: 'root', note: 'E' },
            { stringIndex: 4, fret: 2, role: 'fifth', note: 'B' },
            { stringIndex: 3, fret: 2, role: 'root', note: 'E' },
            { stringIndex: 2, fret: 1, role: 'third', note: 'G#' },
            { stringIndex: 1, fret: 0, role: 'fifth', note: 'B' },
            { stringIndex: 0, fret: 0, role: 'root', note: 'E' },
        ],
    },
    {
        id: 'D',
        naturalKey: 'D dur',
        keyNote: 2,
        description:
            'D-formen bruker de fire tynneste strengene. Grunntonen på D-strengen, åpen. Perfekt i solopassasjer og i høye register på halsen.',
        rootString: 'D-strengen, åpen',
        mutedStrings: [5, 4],
        positions: [
            { stringIndex: 3, fret: 0, role: 'root', note: 'D' },
            { stringIndex: 2, fret: 2, role: 'fifth', note: 'A' },
            { stringIndex: 1, fret: 3, role: 'root', note: 'D' },
            { stringIndex: 0, fret: 2, role: 'third', note: 'F#' },
        ],
    },
];

const SHAPE_COLORS: Record<ShapeId, { btn: string; active: string; dot: string }> = {
    C: { btn: 'border-amber-400 text-amber-700 hover:bg-amber-100', active: 'bg-amber-500 text-white border-amber-500', dot: 'bg-amber-500' },
    A: { btn: 'border-violet-400 text-violet-700 hover:bg-violet-100', active: 'bg-violet-500 text-white border-violet-500', dot: 'bg-violet-500' },
    G: { btn: 'border-emerald-400 text-emerald-700 hover:bg-emerald-100', active: 'bg-emerald-500 text-white border-emerald-500', dot: 'bg-emerald-500' },
    E: { btn: 'border-sky-400 text-sky-700 hover:bg-sky-100', active: 'bg-sky-500 text-white border-sky-500', dot: 'bg-sky-500' },
    D: { btn: 'border-rose-400 text-rose-700 hover:bg-rose-100', active: 'bg-rose-500 text-white border-rose-500', dot: 'bg-rose-500' },
};

function getPentatonicPositions(keyNote: number): Set<string> {
    const result = new Set<string>();
    for (let si = 0; si < 6; si++) {
        for (let fret = 0; fret <= FRET_COUNT; fret++) {
            const noteVal = (OPEN_STRING_SEMITONES[si] + fret) % 12;
            const interval = (noteVal - keyNote + 12) % 12;
            if (MAJOR_PENTATONIC_INTERVALS.has(interval)) {
                result.add(`${si}-${fret}`);
            }
        }
    }
    return result;
}

interface CAGEDExplorerProps {
    showSoloToggle?: boolean;
}

export const CAGEDExplorer: React.FC<CAGEDExplorerProps> = ({ showSoloToggle = true }) => {
    const [activeShape, setActiveShape] = useState<ShapeId>('C');
    const [soloMode, setSoloMode] = useState(false);
    const [visited, setVisited] = useState<Set<ShapeId>>(new Set(['C']));
    const allVisited = visited.size === 5;

    const shape = SHAPES.find((s) => s.id === activeShape)!;
    const colors = SHAPE_COLORS[activeShape];
    const pentatonicSet = soloMode ? getPentatonicPositions(shape.keyNote) : new Set<string>();

    const noteMap = new Map<string, NotePosition>();
    shape.positions.forEach((p) => noteMap.set(`${p.stringIndex}-${p.fret}`, p));
    const mutedSet = new Set(shape.mutedStrings);

    function handleShapeSelect(id: ShapeId) {
        setActiveShape(id);
        setVisited((prev) => new Set([...prev, id]));
    }

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Guitar size={20} className="text-amber-700" />
                <h3 className="font-bold text-amber-900 text-base">CAGED-utforskeren</h3>
                {allVisited && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto flex items-center gap-1 text-emerald-700 text-sm font-semibold"
                    >
                        <CheckCircle size={16} />
                        Alle fem former utforsket!
                    </motion.div>
                )}
            </div>

            {/* Shape selector */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {SHAPES.map((s) => {
                    const c = SHAPE_COLORS[s.id];
                    const isActive = s.id === activeShape;
                    const isVisited = visited.has(s.id);
                    return (
                        <button
                            key={s.id}
                            onClick={() => handleShapeSelect(s.id)}
                            className={`
                                relative px-4 py-2 rounded-lg border-2 font-bold text-sm transition-all
                                ${isActive ? c.active : c.btn}
                            `}
                        >
                            {s.id}
                            {isVisited && !isActive && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Fretboard */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeShape}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                >
                    <div className="overflow-x-auto">
                        <div className="min-w-[400px] bg-[#5c4033] rounded-lg p-3 relative">
                            {/* Nut */}
                            <div className="absolute left-[40px] top-0 bottom-0 w-3 bg-slate-100 rounded-sm z-10" />

                            {/* Fret marker dots */}
                            <div className="absolute left-0 right-0 flex">
                                {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => (
                                    <div key={fret} className={`flex-1 ${fret === 0 ? 'max-w-[40px]' : ''}`}>
                                        {fret > 0 && FRET_MARKERS.has(fret) && (
                                            <div className="flex justify-center mt-1">
                                                <div className="w-2 h-2 rounded-full bg-white/20" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Strings */}
                            <div className="flex flex-col gap-4 py-3">
                                {Array.from({ length: 6 }, (_, si) => {
                                    const isMuted = mutedSet.has(si);
                                    const stringThickness = 1 + (5 - si) * 0.4; // thicker for lower strings
                                    return (
                                        <div key={si} className="flex items-center relative">
                                            {/* Open string label */}
                                            <div className="w-[40px] flex justify-center z-20 relative">
                                                {isMuted ? (
                                                    <span className="text-red-400 font-bold text-sm">×</span>
                                                ) : (
                                                    <span className="text-white/60 text-xs font-medium">{OPEN_STRING_NAMES[si]}</span>
                                                )}
                                            </div>

                                            {/* String line */}
                                            {!isMuted && (
                                                <div
                                                    className="absolute left-[40px] right-0 bg-slate-400 opacity-60"
                                                    style={{ height: `${stringThickness}px`, top: '50%', transform: 'translateY(-50%)' }}
                                                />
                                            )}

                                            {/* Fret cells */}
                                            <div className="flex flex-1">
                                                {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => {
                                                    const key = `${si}-${fret}`;
                                                    const notePos = noteMap.get(key);
                                                    const isPentatonic = pentatonicSet.has(key) && !notePos && !isMuted;
                                                    const noteVal = (OPEN_STRING_SEMITONES[si] + fret) % 12;
                                                    const noteName = NOTE_NAMES[noteVal];

                                                    return (
                                                        <div
                                                            key={fret}
                                                            className={`
                                                                flex-1 h-8 flex items-center justify-center relative
                                                                ${fret > 0 ? 'border-r border-slate-600' : ''}
                                                            `}
                                                        >
                                                            {notePos ? (
                                                                <div
                                                                    className={`
                                                                        w-7 h-7 rounded-full flex items-center justify-center
                                                                        text-[11px] font-bold shadow-md z-20
                                                                        ${notePos.role === 'root'
                                                                            ? `${colors.dot} text-white`
                                                                            : notePos.role === 'third'
                                                                            ? 'bg-indigo-500 text-white'
                                                                            : 'bg-teal-500 text-white'}
                                                                    `}
                                                                >
                                                                    {notePos.note}
                                                                </div>
                                                            ) : isPentatonic ? (
                                                                <div className="w-4 h-4 rounded-full bg-emerald-400/50 border border-emerald-300 flex items-center justify-center z-10">
                                                                    <span className="text-[8px] text-emerald-900 font-bold">{noteName}</span>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Fret numbers */}
                            <div className="flex mt-1">
                                <div className="w-[40px]" />
                                {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => (
                                    <div key={fret} className="flex-1 text-center text-white/40 text-[10px]">
                                        {fret > 0 ? fret : ''}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Legend */}
            <div className="flex gap-3 mt-3 flex-wrap text-xs text-amber-800">
                <div className="flex items-center gap-1">
                    <div className={`w-4 h-4 rounded-full ${colors.dot}`} />
                    <span>Grunntone</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-indigo-500" />
                    <span>Ters</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-teal-500" />
                    <span>Kvint</span>
                </div>
                {soloMode && (
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-emerald-400/50 border border-emerald-300" />
                        <span>Pentatonskala</span>
                    </div>
                )}
            </div>

            {/* Description + solo toggle */}
            <div className="mt-3 bg-white/70 rounded-lg p-3 border border-amber-100">
                <p className="text-sm text-amber-900 leading-relaxed">
                    <span className="font-bold">{shape.id}-formen ({shape.naturalKey})</span> - Grunntone på: {shape.rootString}.{' '}
                    {shape.description}
                </p>
                {showSoloToggle && (
                    <button
                        onClick={() => setSoloMode((v) => !v)}
                        className={`mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                            ${soloMode
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'}`}
                    >
                        <Music size={12} />
                        {soloMode ? 'Skjul soloposisjoner' : 'Vis soloposisjoner (pentatonskala)'}
                    </button>
                )}
            </div>
        </div>
    );
};
