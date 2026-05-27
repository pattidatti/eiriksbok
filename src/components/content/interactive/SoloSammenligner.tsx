import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square } from 'lucide-react';
import * as Tone from 'tone';

type Playback = 'idle' | 'a' | 'b';

const BPM = 80;
const BEAT_S = 60 / BPM;
const BAR_S = BEAT_S * 4;
const SHORT = BEAT_S * 0.82;
const LONG = BEAT_S * 1.75;

interface ScheduledNote {
    offset: number;
    note: string;
    dur: number;
    isLanding?: boolean;
}

interface ChordEvent {
    offset: number;
    idx: number;
    label: string;
    toneNotes: string[];
}

const CHORD_EVENTS: ChordEvent[] = [
    { offset: 0,       idx: 0, label: 'G',  toneNotes: ['G2', 'D3', 'G3', 'B3'] },
    { offset: BAR_S,   idx: 1, label: 'D',  toneNotes: ['D3', 'A3', 'D4'] },
    { offset: BAR_S*2, idx: 2, label: 'Am', toneNotes: ['A2', 'E3', 'A3', 'C4'] },
    { offset: BAR_S*3, idx: 3, label: 'C',  toneNotes: ['C3', 'G3', 'C4'] },
];

// Solo A: skalanotorer uten mål - høres tilfeldig ut
const SOLO_A: ScheduledNote[] = [
    { offset: 0,             note: 'D4', dur: SHORT },
    { offset: BEAT_S,        note: 'B3', dur: SHORT },
    { offset: BEAT_S*2,      note: 'A3', dur: SHORT },
    { offset: BEAT_S*3,      note: 'E4', dur: SHORT },
    { offset: BAR_S,         note: 'B3', dur: SHORT },
    { offset: BAR_S+BEAT_S,  note: 'G3', dur: SHORT },
    { offset: BAR_S+BEAT_S*2,note: 'E4', dur: SHORT },
    { offset: BAR_S+BEAT_S*3,note: 'G3', dur: SHORT },
    { offset: BAR_S*2,         note: 'A3', dur: SHORT },
    { offset: BAR_S*2+BEAT_S,  note: 'G3', dur: SHORT },
    { offset: BAR_S*2+BEAT_S*2,note: 'D4', dur: SHORT },
    { offset: BAR_S*2+BEAT_S*3,note: 'E4', dur: SHORT },
    { offset: BAR_S*3,         note: 'B3', dur: SHORT },
    { offset: BAR_S*3+BEAT_S,  note: 'A3', dur: SHORT },
    { offset: BAR_S*3+BEAT_S*2,note: 'G3', dur: SHORT },
    { offset: BAR_S*3+BEAT_S*3,note: 'D4', dur: SHORT },
];

// Solo B: lander på grunntonen ved hvert akkordskifte
const SOLO_B: ScheduledNote[] = [
    { offset: 0,             note: 'B3', dur: SHORT },
    { offset: BEAT_S,        note: 'D4', dur: SHORT },
    { offset: BEAT_S*2,      note: 'A3', dur: SHORT },
    { offset: BEAT_S*3,      note: 'G3', dur: LONG, isLanding: true },  // LAND G
    { offset: BAR_S,         note: 'A3', dur: SHORT },
    { offset: BAR_S+BEAT_S,  note: 'G3', dur: SHORT },
    { offset: BAR_S+BEAT_S*2,note: 'B3', dur: SHORT },
    { offset: BAR_S+BEAT_S*3,note: 'D4', dur: LONG, isLanding: true },  // LAND D
    { offset: BAR_S*2,         note: 'B3', dur: SHORT },
    { offset: BAR_S*2+BEAT_S,  note: 'G3', dur: SHORT },
    { offset: BAR_S*2+BEAT_S*2,note: 'E4', dur: SHORT },
    { offset: BAR_S*2+BEAT_S*3,note: 'A3', dur: LONG, isLanding: true }, // LAND A
    { offset: BAR_S*3,         note: 'G3', dur: SHORT },
    { offset: BAR_S*3+BEAT_S,  note: 'D4', dur: SHORT },
    { offset: BAR_S*3+BEAT_S*2,note: 'E4', dur: SHORT },
    { offset: BAR_S*3+BEAT_S*3,note: 'C4', dur: LONG, isLanding: true }, // LAND C
];

const CHORD_COLORS: Record<string, string> = {
    G: 'bg-amber-500',
    D: 'bg-sky-500',
    Am: 'bg-violet-500',
    C: 'bg-emerald-500',
};

const TOTAL_S = BAR_S * 4 + BEAT_S;

export const SoloSammenligner: React.FC = () => {
    const [playback, setPlayback] = useState<Playback>('idle');
    const [currentChordIdx, setCurrentChordIdx] = useState(-1);
    const [showLanding, setShowLanding] = useState(false);
    const melodyRef = useRef<Tone.PolySynth | null>(null);
    const chordRef = useRef<Tone.PolySynth | null>(null);
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        const melody = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.005, decay: 0.12, sustain: 0.25, release: 0.6 },
        }).toDestination();
        const chord = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.05, decay: 0.3, sustain: 0.15, release: 1.2 },
        }).toDestination();
        melody.volume.value = -2;
        chord.volume.value = -8;
        melodyRef.current = melody;
        chordRef.current = chord;
        return () => {
            melody.dispose();
            chord.dispose();
        };
    }, []);

    function clearTimeouts() {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
    }

    async function startPlayback(version: 'a' | 'b') {
        if (Tone.context.state !== 'running') await Tone.start();
        clearTimeouts();
        setPlayback(version);
        setCurrentChordIdx(0);
        setShowLanding(false);

        const t0 = Tone.now() + 0.05;
        const solo = version === 'a' ? SOLO_A : SOLO_B;

        solo.forEach(({ offset, note, dur, isLanding }) => {
            melodyRef.current?.triggerAttackRelease(note, dur, t0 + offset);
            if (isLanding && version === 'b') {
                const tid = setTimeout(() => setShowLanding(true), offset * 1000);
                const tid2 = setTimeout(() => setShowLanding(false), (offset + 0.5) * 1000);
                timeoutsRef.current.push(tid, tid2);
            }
        });

        CHORD_EVENTS.forEach(({ offset, idx, toneNotes }) => {
            chordRef.current?.triggerAttackRelease(toneNotes, BAR_S * 0.85, t0 + offset);
            const tid = setTimeout(() => setCurrentChordIdx(idx), offset * 1000);
            timeoutsRef.current.push(tid);
        });

        const tid = setTimeout(() => {
            setPlayback('idle');
            setCurrentChordIdx(-1);
        }, TOTAL_S * 1000);
        timeoutsRef.current.push(tid);
    }

    function stop() {
        clearTimeouts();
        melodyRef.current?.releaseAll();
        chordRef.current?.releaseAll();
        setPlayback('idle');
        setCurrentChordIdx(-1);
        setShowLanding(false);
    }

    useEffect(() => () => clearTimeouts(), []);

    const isPlaying = playback !== 'idle';

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-6 shadow-sm">
            <div className="mb-3">
                <h3 className="font-bold text-slate-800 text-base">Hør forskjellen</h3>
                <p className="text-xs text-slate-500">
                    Samme akkordprogresjon (G D Am C) - to forskjellige tilnærminger
                </p>
            </div>

            {/* Playback buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Version A */}
                <div className={`rounded-xl border-2 p-3 transition-all
                    ${playback === 'a' ? 'border-slate-400 bg-slate-100' : 'border-slate-200 bg-white'}`}>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Versjon A</p>
                    <p className="text-sm font-bold text-slate-700 mb-2">Tilfeldig skalagrind</p>
                    <p className="text-xs text-slate-500 mb-3">
                        Pentatone noter uten mål. Alle noter er "riktige", men soloen mangler retning.
                    </p>
                    <button
                        onClick={() => (playback === 'a' ? stop() : startPlayback('a'))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
                            ${playback === 'a'
                                ? 'bg-slate-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-500'}`}
                    >
                        {playback === 'a' ? <Square size={14} /> : <Play size={14} />}
                        {playback === 'a' ? 'Stopp' : 'Spill A'}
                    </button>
                </div>

                {/* Version B */}
                <div className={`rounded-xl border-2 p-3 transition-all
                    ${playback === 'b' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                    <p className="text-xs font-semibold text-emerald-600 mb-1">Versjon B</p>
                    <p className="text-sm font-bold text-slate-700 mb-2">Med grunntone-landing</p>
                    <p className="text-xs text-slate-500 mb-3">
                        Lander på grunntonen ved hvert akkordskifte. Soloen følger harmonien.
                    </p>
                    <button
                        onClick={() => (playback === 'b' ? stop() : startPlayback('b'))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
                            ${playback === 'b'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-500'}`}
                    >
                        {playback === 'b' ? <Square size={14} /> : <Play size={14} />}
                        {playback === 'b' ? 'Stopp' : 'Spill B'}
                    </button>
                </div>
            </div>

            {/* Chord progression display */}
            <div className="flex gap-2 justify-center">
                {CHORD_EVENTS.map(({ idx, label }) => {
                    const isActive = isPlaying && currentChordIdx === idx;
                    const colorClass = CHORD_COLORS[label] ?? 'bg-slate-400';
                    return (
                        <div key={idx} className="relative flex flex-col items-center gap-1">
                            <motion.div
                                animate={isActive ? { scale: 1.12 } : { scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border-2 transition-all
                                    ${isActive
                                        ? `${colorClass} text-white border-transparent shadow-md`
                                        : 'bg-white text-slate-500 border-slate-200'
                                    }`}
                            >
                                {label}
                            </motion.div>
                            {/* Landing ring - only shows for version B */}
                            <AnimatePresence>
                                {showLanding && isActive && playback === 'b' && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0.9 }}
                                        animate={{ scale: 1.6, opacity: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className={`absolute inset-0 rounded-xl border-2 ${colorClass.replace('bg-', 'border-')} pointer-events-none`}
                                    />
                                )}
                            </AnimatePresence>
                            <span className="text-xs text-slate-400">
                                {isActive && isPlaying ? '▶' : ''}
                            </span>
                        </div>
                    );
                })}
            </div>

            {isPlaying && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-center text-xs font-semibold mt-3 ${playback === 'b' ? 'text-emerald-600' : 'text-slate-500'}`}
                >
                    {playback === 'b' ? 'Merk: hør hvordan soloen lander og slår seg ro ved akkordskiftet' : 'Spiller... hør at soloen ikke følger akkordene'}
                </motion.p>
            )}
        </div>
    );
};
