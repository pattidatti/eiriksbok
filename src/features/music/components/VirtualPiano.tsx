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
    const baseClass = isBlack
        ? "w-8 h-32 -mx-4 z-10 rounded-b-lg border border-slate-900"
        : "w-12 h-48 border border-slate-200 rounded-b-lg z-0 bg-white hover:bg-slate-50";

    const colorClass = isPressed
        ? (isBlack ? "bg-indigo-600" : "bg-indigo-100")
        : isHighlighted
            ? (isBlack ? "bg-emerald-600" : "bg-emerald-100")
            : (isBlack ? "bg-slate-800" : "bg-white");

    return (
        <div
            className={`${baseClass} ${colorClass} relative flex flex-col justify-end items-center pb-2 transition-colors cursor-pointer select-none`}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onMouseEnter={onMouseEnter}
        >
            {label && !isBlack && (
                <span className={`text-xs font-bold ${isPressed ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {label}
                </span>
            )}
        </div>
    );
};

interface VirtualPianoProps {
    highlightKeys?: string[];
}

export const VirtualPiano: React.FC<VirtualPianoProps> = ({ highlightKeys = [] }) => {
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
                        isHighlighted={highlightKeys.includes(fullNote)}
                        label={!isBlack ? note : undefined}
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
                isHighlighted={highlightKeys.includes(finalC)}
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
