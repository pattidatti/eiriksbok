import React, { useState } from 'react';

interface FretboardProps {
    instrument?: 'guitar' | 'bass';
    frets?: number;
    highlightPositions?: { string: number; fret: number }[]; // New prop for external control
}

export const FretboardExplorer: React.FC<FretboardProps> = ({ instrument = 'guitar', frets = 12, highlightPositions }) => {
    const [internalSelectedNotes, setInternalSelectedNotes] = useState<Set<string>>(new Set());

    // Use external props if provided, otherwise internal state
    const isControlled = highlightPositions !== undefined;

    const getIsSelected = (stringIndex: number, fret: number) => {
        if (isControlled && highlightPositions) {
            return highlightPositions.some(p => p.string === stringIndex && p.fret === fret);
        }
        return internalSelectedNotes.has(`${stringIndex}-${fret}`);
    };

    const handleToggle = (stringIndex: number, fret: number) => {
        if (isControlled) return; // Read-only in controlled mode
        const key = `${stringIndex}-${fret}`;
        setInternalSelectedNotes(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };


    const stringNotes = instrument === 'guitar'
        ? ['E', 'B', 'G', 'D', 'A', 'E'] // Top to Bottom (High E to Low E)
        : ['G', 'D', 'A', 'E'];

    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const getNoteAtFret = (openNote: string, fret: number) => {
        // Detailed logic needed if we care about octaves, but for simple visualization:
        const baseNote = openNote;
        let noteIndex = notes.indexOf(baseNote);
        if (noteIndex === -1) noteIndex = 0; // Fallback

        const targetIndex = (noteIndex + fret) % 12;
        return notes[targetIndex];
    };



    return (
        <div className="p-8 bg-amber-50 rounded-3xl border border-amber-200 shadow-sm my-8 overflow-x-auto">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-amber-900">
                    {instrument === 'guitar' ? 'Gitar' : 'Bass'} Gripebrett
                </h3>
                <p className="text-amber-700">Utforsk tonene på {instrument}.</p>
            </div>

            <div className="relative min-w-[600px] bg-[#5c4033] p-4 rounded-lg shadow-inner">
                {/* Nut */}
                <div className="absolute left-12 top-0 bottom-0 w-2 bg-slate-200 z-10" />

                <div className="flex flex-col gap-8 relative py-4">
                    {stringNotes.map((openNote, stringIndex) => (
                        <div key={stringIndex} className="relative h-1 bg-slate-400 flex items-center">
                            {/* String line */}
                            <div className={`absolute left-0 right-0 h-[${1 + stringIndex}px] bg-slate-300 shadow-sm`} style={{ height: instrument === 'bass' ? 3 : 1 + (stringIndex * 0.5) }} />

                            {/* Open String Label */}
                            <div className="absolute left-2 -translate-y-1/2 w-8 text-center font-bold text-white text-sm">
                                {openNote}
                            </div>

                            {/* Frets */}
                            {Array.from({ length: frets + 1 }).map((_, fret) => (
                                <div
                                    key={fret}
                                    className="flex-1 border-r border-slate-500 h-16 -mt-8 relative flex items-center justify-center cursor-pointer group"
                                    onClick={() => handleToggle(stringIndex, fret)}
                                >
                                    {/* Fret marker dots (3, 5, 7, 9, 12) */}
                                    {stringIndex === (instrument === 'guitar' ? 2 : 1) && [3, 5, 7, 9].includes(fret) && (
                                        <div className="absolute w-3 h-3 bg-slate-400/50 rounded-full" />
                                    )}
                                    {stringIndex === (instrument === 'guitar' ? 2 : 1) && fret === 12 && ( // Double dot for 12
                                        <div className="absolute flex gap-2">
                                            <div className="w-3 h-3 bg-slate-400/50 rounded-full" />
                                            <div className="w-3 h-3 bg-slate-400/50 rounded-full" />
                                        </div>
                                    )}

                                    {/* Note / Finger position */}
                                    {(getIsSelected(stringIndex, fret) || (fret === 0 && getIsSelected(stringIndex, fret))) && (
                                        <div className="w-6 h-6 bg-amber-500 rounded-full shadow-md z-20 flex items-center justify-center text-[10px] font-bold text-white transform transition-transform scale-110">
                                            {getNoteAtFret(openNote, fret)}
                                        </div>
                                    )}

                                    {/* Ghost note on hover */}
                                    <div className="hidden group-hover:flex w-6 h-6 bg-white/20 rounded-full z-10 items-center justify-center text-[10px] text-white">
                                        {getNoteAtFret(openNote, fret)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex justify-center gap-4">
                <button
                    onClick={() => !isControlled && setInternalSelectedNotes(new Set())}
                    className="px-4 py-2 bg-amber-200 text-amber-900 rounded-full text-sm font-bold hover:bg-amber-300 transition-colors"
                >
                    Nullstill
                </button>
            </div>
        </div>
    );
};
