import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

interface KeyProps {
    note: string;
    isBlack: boolean;
    isPressed: boolean;
    isHighlighted?: boolean;
    label?: string;
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseEnter: () => void;
}

const PianoKey: React.FC<KeyProps> = ({ isBlack, isPressed, isHighlighted, label, onMouseDown, onMouseUp, onMouseEnter }) => {
    // Base structural classes (no colors)
    const baseClass = isBlack
        ? "w-8 h-32 -mx-4 z-10 rounded-b-lg border border-slate-900"
        : "w-12 h-48 border border-slate-200 rounded-b-lg z-0 hover:bg-slate-50";

    const colorClass = isPressed
        ? (isBlack ? "bg-indigo-600" : "bg-indigo-200")
        : isHighlighted
            ? (isBlack ? "bg-emerald-500" : "bg-emerald-300")
            : (isBlack ? "bg-slate-800" : "bg-white");

    return (
        <div
            className={`${baseClass} ${colorClass} relative flex flex-col justify-end items-center pb-2 transition-colors cursor-pointer select-none`}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onMouseEnter={onMouseEnter}
        >
            {/* Always show label if highlighted, or if it's a white key (standard piano label) */}
            {(label || isHighlighted) && (
                <span className={`text-xs font-bold mb-2 ${isPressed ? 'text-indigo-800' :
                    isHighlighted ? (isBlack ? 'text-white' : 'text-emerald-900') : 'text-slate-400'
                    }`}>
                    {label}
                </span>
            )}
        </div>
    );
};

interface VirtualPianoProps {
    highlightKeys?: string[];
}


// Helper to normalize notes for comparison (e.g. "C#", "Db", "C#4" -> "C#4")
const normalizeNote = (note: string): string => {
    // Extract pitch and octave
    // Regex: Start with pitch (A-G followed by optional #/b), then capture optional rest (Octave)
    const match = note.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return note;

    const pitch = match[1];
    const octave = match[2]; // Preserved!

    // Canonical Map to Sharps
    const canonical: Record<string, string> = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
        'Cb': 'B', 'Fb': 'E', 'B#': 'C', 'E#': 'F'
    };

    const normPitch = canonical[pitch] || pitch;
    return `${normPitch}${octave}`;
};

export const VirtualPiano: React.FC<VirtualPianoProps> = ({ highlightKeys = [] }) => {
    // derived set of highlighted normalized notes for easier lookup
    const highlightedNormalized = React.useMemo(() => {
        return new Set(highlightKeys.map(k => normalizeNote(k)));
    }, [highlightKeys]);

    const isKeyHighlighted = (noteName: string) => {
        // noteName is the key on the piano, e.g. "C#4"
        const norm = normalizeNote(noteName);
        const has = highlightedNormalized.has(norm);
        // Reduce log spam by only logging if meaningful or once per render cycle (impossible here without ref logic)
        // Instead, let's rely on the Set logging above which I'll add now
        console.log(`[VirtualPiano] Checking key: ${noteName} (normalized: ${norm}). Is highlighted: ${has}`);
        return has;
    };

    // Debug logging for normalized set
    React.useEffect(() => {
        console.log('[VirtualPiano] Highlight Keys:', highlightKeys);
        console.log('[VirtualPiano] Normalized Set:', Array.from(highlightedNormalized));
    }, [highlightKeys, highlightedNormalized]);

    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
    const [isMouseDown, setIsMouseDown] = useState(false);
    const synthRef = useRef<Tone.PolySynth | null>(null);

    const octaves = 2;
    const startOctave = 3;

    useEffect(() => {
        // Initialize synth
        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: "triangle"
            },
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.3,
                release: 1
            }
        }).toDestination();

        synthRef.current = synth;

        return () => {
            synth.dispose();
        };
    }, []);

    const playNote = async (note: string) => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }

        synthRef.current?.triggerAttack(note);
        setPressedKeys(prev => new Set(prev).add(note));
    };

    const stopNote = (note: string) => {
        synthRef.current?.triggerRelease(note);
        setPressedKeys(prev => {
            const next = new Set(prev);
            next.delete(note);
            return next;
        });
    };

    const handleMouseDown = (note: string) => {
        setIsMouseDown(true);
        playNote(note);
    };

    const handleMouseUp = (note: string) => {
        setIsMouseDown(false);
        stopNote(note);
    };

    const handleMouseEnter = (note: string) => {
        if (isMouseDown) {
            playNote(note);
        }
    };

    const renderKeys = () => {
        const keys = [];
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        for (let oct = 0; oct < octaves; oct++) {
            const currentOctave = startOctave + oct;

            notes.forEach((note) => {
                const isBlack = note.includes('#');
                const fullNote = `${note}${currentOctave}`;

                keys.push(
                    <PianoKey
                        key={fullNote}
                        note={fullNote}
                        isBlack={isBlack}
                        isPressed={pressedKeys.has(fullNote)}
                        isHighlighted={isKeyHighlighted(fullNote)}
                        label={note} // Pass note name as label for ALL keys
                        onMouseDown={() => handleMouseDown(fullNote)}
                        onMouseUp={() => handleMouseUp(fullNote)}
                        onMouseEnter={() => handleMouseEnter(fullNote)}
                    />
                );
            });
        }
        // Add final C
        const finalC = `C${startOctave + octaves}`;
        keys.push(
            <PianoKey
                key={finalC}
                note={finalC}
                isBlack={false}
                isPressed={pressedKeys.has(finalC)}
                isHighlighted={isKeyHighlighted(finalC)}
                label="C"
                onMouseDown={() => handleMouseDown(finalC)}
                onMouseUp={() => handleMouseUp(finalC)}
                onMouseEnter={() => handleMouseEnter(finalC)}
            />
        );

        return keys;
    };

    return (
        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm my-8">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Virtuelt Piano</h3>
                <p className="text-slate-500">Klikk og dra for å spille - nå med lyd!</p>
            </div>

            <div className="flex justify-center select-none overflow-x-auto py-4">
                <div className="flex relative">
                    {renderKeys()}
                </div>
            </div>
        </div>
    );
};
