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

const PianoKey: React.FC<KeyProps & { width: string; leftMargin?: string }> = ({
    isBlack, isPressed, isHighlighted, label, onMouseDown, onMouseUp, onMouseEnter, width, leftMargin
}) => {
    // Base structural classes (no fixed dimensions)
    const baseClass = isBlack
        ? "z-10 rounded-b-lg border border-slate-900 flex-shrink-0 origin-top"
        : "border border-slate-200 rounded-b-lg z-0 hover:bg-slate-50 flex-shrink-0";

    const colorClass = isPressed
        ? (isBlack ? "bg-indigo-600" : "bg-indigo-200")
        : isHighlighted
            ? (isBlack ? "bg-emerald-500" : "bg-emerald-300")
            : (isBlack ? "bg-slate-800" : "bg-white");

    return (
        <div
            className={`${baseClass} ${colorClass} ${isBlack ? 'absolute top-0' : 'relative'} flex flex-col justify-end items-center pb-2 transition-colors cursor-pointer select-none shadow-sm`}
            style={{
                width: width,
                left: isBlack ? leftMargin : undefined,
                marginLeft: !isBlack ? undefined : undefined,
                // For white keys, just width. For black keys, absolute positioning is easier for overlays in % world?
                // Mixed flex/absolute flow is tricky.
                // Let's stick to the negative margin flow if possible, OR Absolute Black Keys.
                // Absolute Black Keys is safer for % layouts.
                height: isBlack ? '60%' : '100%'
            }}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onMouseEnter={onMouseEnter}
        >
            {(label || isHighlighted) && (
                <span className={`text-[10px] sm:text-xs font-bold mb-1 sm:mb-2 ${isPressed ? 'text-indigo-800' :
                    isHighlighted ? (isBlack ? 'text-white' : 'text-emerald-900') : (isBlack ? 'text-slate-300' : 'text-slate-400')
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
    // ... logic ...

    // We need to move renderKeys logic to use the new sizing
    // And actually, we need to rewrite renderKeys entirely to respect the new structure.

    // We'll preserve state logic...
    // just re-implement the render part in the main component body for clean replacement.

    const highlightedNormalized = React.useMemo(() => {
        return new Set(highlightKeys.map(k => normalizeNote(k)));
    }, [highlightKeys]);

    const isKeyHighlighted = (noteName: string) => {
        const norm = normalizeNote(noteName);
        return highlightedNormalized.has(norm);
    };

    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
    const [isMouseDown, setIsMouseDown] = useState(false);
    const synthRef = useRef<Tone.PolySynth | null>(null);

    const octaves = 2;
    const startOctave = 3;

    useEffect(() => {
        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
        }).toDestination();
        synthRef.current = synth;
        return () => { synth.dispose(); };
    }, []);

    const playNote = async (note: string) => {
        if (Tone.context.state !== 'running') await Tone.start();
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

    const handleInput = (note: string, type: 'down' | 'up' | 'enter') => {
        if (type === 'down') { setIsMouseDown(true); playNote(note); }
        else if (type === 'up') { setIsMouseDown(false); stopNote(note); }
        else if (type === 'enter' && isMouseDown) { playNote(note); }
    };

    // Render Logic with Percentage Scaling
    const renderKeys = () => {
        const whiteWithBlackMap: { note: string; hasBlack: { note: string } | null }[] = [];

        // Build data structure first
        for (let oct = 0; oct < octaves; oct++) {
            const currentOctave = startOctave + oct;
            // C, D, E, F, G, A, B
            // C has C#, D has D#, E has null, F has F#, G has G#, A has A#, B has null
            const map = [
                { note: `C${currentOctave}`, black: `C#${currentOctave}` },
                { note: `D${currentOctave}`, black: `D#${currentOctave}` },
                { note: `E${currentOctave}`, black: null },
                { note: `F${currentOctave}`, black: `F#${currentOctave}` },
                { note: `G${currentOctave}`, black: `G#${currentOctave}` },
                { note: `A${currentOctave}`, black: `A#${currentOctave}` },
                { note: `B${currentOctave}`, black: null },
            ];
            map.forEach(m => whiteWithBlackMap.push({ note: m.note, hasBlack: m.black ? { note: m.black } : null }));
        }
        // Final C
        whiteWithBlackMap.push({ note: `C${startOctave + octaves}`, hasBlack: null });

        const numWhite = whiteWithBlackMap.length;
        const whiteWidthPct = 100 / numWhite;

        return whiteWithBlackMap.map((group) => (
            <div key={group.note} className="relative flex-shrink-0" style={{ width: `${whiteWidthPct}%`, aspectRatio: '1/3.5' }}>
                {/* White Key */}
                <PianoKey
                    note={group.note} isBlack={false} width="100%"
                    isPressed={pressedKeys.has(group.note)}
                    isHighlighted={isKeyHighlighted(group.note)}
                    label={group.note.replace(/[0-9]/g, '')}
                    onMouseDown={() => handleInput(group.note, 'down')}
                    onMouseUp={() => handleInput(group.note, 'up')}
                    onMouseEnter={() => handleInput(group.note, 'enter')}
                />

                {/* Black Key (Overlay) */}
                {group.hasBlack && (
                    <div
                        className="absolute z-20 top-0 left-full h-[65%] w-[70%] -ml-[35%]"
                    >
                        <PianoKey
                            note={group.hasBlack.note} isBlack={true} width="100%"
                            label={group.hasBlack.note.replace(/[0-9]/g, '')}
                            isPressed={pressedKeys.has(group.hasBlack.note)}
                            isHighlighted={isKeyHighlighted(group.hasBlack.note)}
                            onMouseDown={() => handleInput(group.hasBlack!.note, 'down')}
                            onMouseUp={() => handleInput(group.hasBlack!.note, 'up')}
                            onMouseEnter={() => handleInput(group.hasBlack!.note, 'enter')}
                        />
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm my-2 w-full">
            <div className="text-center mb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Virtuelt Piano</h3>
                <p className="text-xs text-slate-400">Klikk og dra for å spille</p>
            </div>

            <div className="flex justify-center select-none py-2 w-full">
                {/* Aspect Ratio Container */}
                {/* We rely on the keys themselves to enforce aspect ratio */}
                <div className="flex relative items-start w-full max-w-4xl mx-auto">
                    {renderKeys()}
                </div>
            </div>
        </div>
    );
};
