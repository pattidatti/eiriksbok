import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Target, CheckCircle } from 'lucide-react';
import * as Tone from 'tone';

type Phase = 'idle' | 'playing' | 'done';
type Tempo = 60 | 80;

// stringIndex 0 = high E, 5 = low E
const OPEN_SEMITONES = [4, 11, 7, 2, 9, 4];
const OPEN_NAMES = ['E', 'B', 'G', 'D', 'A', 'E'];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BASE_OCTAVES = [4, 3, 3, 3, 2, 2];
const FRET_COUNT = 5;

function toneNote(si: number, fret: number): string {
    const total = OPEN_SEMITONES[si] + fret;
    return `${NOTE_NAMES[total % 12]}${BASE_OCTAVES[si] + Math.floor(total / 12)}`;
}

interface ChordConfig {
    id: string;
    rootPositions: { si: number; fret: number }[];
    toneNotes: string[];
    dotColor: string;
    glowColor: string;
}

const PROGRESSION: ChordConfig[] = [
    {
        id: 'G', toneNotes: ['G2', 'D3', 'G3', 'B3'],
        rootPositions: [{ si: 5, fret: 3 }, { si: 3, fret: 5 }, { si: 2, fret: 0 }, { si: 0, fret: 3 }],
        dotColor: 'bg-amber-500', glowColor: 'ring-amber-400',
    },
    {
        id: 'D', toneNotes: ['D3', 'A3', 'D4'],
        rootPositions: [{ si: 4, fret: 5 }, { si: 3, fret: 0 }, { si: 1, fret: 3 }],
        dotColor: 'bg-sky-500', glowColor: 'ring-sky-400',
    },
    {
        id: 'Am', toneNotes: ['A2', 'E3', 'A3', 'C4'],
        rootPositions: [{ si: 5, fret: 5 }, { si: 4, fret: 0 }, { si: 2, fret: 2 }, { si: 0, fret: 5 }],
        dotColor: 'bg-violet-500', glowColor: 'ring-violet-400',
    },
    {
        id: 'C', toneNotes: ['C3', 'G3', 'C4'],
        rootPositions: [{ si: 4, fret: 3 }, { si: 2, fret: 5 }, { si: 1, fret: 1 }],
        dotColor: 'bg-emerald-500', glowColor: 'ring-emerald-400',
    },
];

const CHORD_COLORS: Record<string, string> = { G: 'text-amber-600', D: 'text-sky-600', Am: 'text-violet-600', C: 'text-emerald-600' };

const LANDING_THRESHOLD = 0.78; // progress > this = landing window open
const TICK_MS = 40;

export const AkkordskiftePraksis: React.FC = () => {
    const [phase, setPhase] = useState<Phase>('idle');
    const [tempo, setTempo] = useState<Tempo>(60);
    const [chordIdx, setChordIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [landingOpen, setLandingOpen] = useState(false);
    const [hits, setHits] = useState<(boolean | null)[]>([null, null, null, null]);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [hitThisBar, setHitThisBar] = useState(false);

    const synthRef = useRef<Tone.PolySynth | null>(null);
    const noteSynthRef = useRef<Tone.PolySynth | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const progressRef = useRef(0);
    const barDurationMs = useRef(0);
    const hitThisBarRef = useRef(false);
    const chordIdxRef = useRef(0);
    const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.05, decay: 0.3, sustain: 0.1, release: 1.0 },
        }).toDestination();
        const noteSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.005, decay: 0.12, sustain: 0.2, release: 0.5 },
        }).toDestination();
        synth.volume.value = -10;
        noteSynth.volume.value = -4;
        synthRef.current = synth;
        noteSynthRef.current = noteSynth;
        return () => {
            synth.dispose();
            noteSynth.dispose();
        };
    }, []);

    const stopGame = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    }, []);

    useEffect(() => () => stopGame(), [stopGame]);

    async function playChordAudio(idx: number) {
        if (Tone.context.state !== 'running') await Tone.start();
        const barSec = (60 / tempo) * 4 * 0.85;
        synthRef.current?.triggerAttackRelease(PROGRESSION[idx].toneNotes, barSec);
    }

    async function startGame() {
        if (Tone.context.state !== 'running') await Tone.start();
        stopGame();
        barDurationMs.current = (60 / tempo) * 4 * 1000;
        progressRef.current = 0;
        hitThisBarRef.current = false;
        chordIdxRef.current = 0;

        setPhase('playing');
        setChordIdx(0);
        setProgress(0);
        setLandingOpen(false);
        setHits([null, null, null, null]);
        setFeedback(null);
        setHitThisBar(false);

        playChordAudio(0);

        intervalRef.current = setInterval(() => {
            progressRef.current += TICK_MS / barDurationMs.current;
            const p = Math.min(progressRef.current, 1);
            setProgress(p);
            const open = p >= LANDING_THRESHOLD;
            setLandingOpen(open);

            if (p >= 1) {
                // Bar ended
                const missed = !hitThisBarRef.current;
                const idx = chordIdxRef.current;

                if (missed) {
                    setHits((prev) => {
                        const next = [...prev];
                        next[idx] = false;
                        return next;
                    });
                    setFeedback(`Prøv å klikke en grunntone til ${PROGRESSION[idx].id} neste gang`);
                    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
                    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 2500);
                }

                const nextIdx = idx + 1;
                if (nextIdx >= PROGRESSION.length) {
                    stopGame();
                    setPhase('done');
                } else {
                    progressRef.current = 0;
                    hitThisBarRef.current = false;
                    chordIdxRef.current = nextIdx;
                    setProgress(0);
                    setLandingOpen(false);
                    setHitThisBar(false);
                    setChordIdx(nextIdx);
                    playChordAudio(nextIdx);
                }
            }
        }, TICK_MS);
    }

    async function handleFretClick(si: number, fret: number) {
        if (phase !== 'playing' || hitThisBarRef.current) return;
        if (!landingOpen) {
            setFeedback('Vent til stripen er nesten full - da åpnes landingsvinderet');
            if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
            feedbackTimerRef.current = setTimeout(() => setFeedback(null), 2000);
            return;
        }
        const idx = chordIdxRef.current;
        const chord = PROGRESSION[idx];
        const isRoot = chord.rootPositions.some((p) => p.si === si && p.fret === fret);

        hitThisBarRef.current = true;
        setHitThisBar(true);

        if (isRoot) {
            if (Tone.context.state !== 'running') await Tone.start();
            noteSynthRef.current?.triggerAttackRelease(toneNote(si, fret), 0.5);
            setHits((prev) => {
                const next = [...prev];
                next[idx] = true;
                return next;
            });
            setFeedback('Perfekt landing!');
        } else {
            setFeedback(`Ikke helt - prøv en av de markerte posisjonene`);
            setHits((prev) => {
                const next = [...prev];
                next[idx] = false;
                return next;
            });
        }
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = setTimeout(() => setFeedback(null), 2000);
    }

    const currentChord = PROGRESSION[chordIdx];
    const rootSet = new Set(currentChord.rootPositions.map((p) => `${p.si}-${p.fret}`));
    const score = hits.filter((h) => h === true).length;

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Target size={20} className="text-slate-600" />
                <div>
                    <h3 className="font-bold text-slate-800 text-base">Akkordskifte-praksis</h3>
                    <p className="text-xs text-slate-500">
                        Klikk en grunntone når stripen er nesten full
                    </p>
                </div>
            </div>

            {phase === 'idle' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600 font-medium">Tempo:</span>
                        {([60, 80] as Tempo[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTempo(t)}
                                className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all
                                    ${tempo === t ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'}`}
                            >
                                {t === 60 ? 'Sakte (60)' : 'Moderat (80)'}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
                        <strong>Slik fungerer det:</strong> Akkordene spilles én etter én. Når fremdriftsstripen
                        er nesten full (landing-vinduet), klikk på en grunntone-posisjon (farget prikk) på
                        gripebrettet for å "lande" riktig.
                    </div>
                    <button
                        onClick={startGame}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold text-sm hover:bg-slate-700 transition-colors"
                    >
                        <Play size={16} />
                        Start øvelsen
                    </button>
                </div>
            )}

            {phase === 'playing' && (
                <div className="space-y-3">
                    {/* Score indicators */}
                    <div className="flex gap-2 items-center">
                        {PROGRESSION.map((c, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-sm font-bold transition-all
                                    ${i === chordIdx ? 'border-slate-400 bg-slate-100 scale-105' : 'border-slate-200 bg-white text-slate-400'}
                                    ${CHORD_COLORS[c.id]}`}
                            >
                                {c.id}
                                {hits[i] === true && <span className="text-emerald-500 text-xs">✓</span>}
                                {hits[i] === false && <span className="text-rose-400 text-xs">✗</span>}
                            </div>
                        ))}
                    </div>

                    {/* Current chord + progress */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-2xl font-black ${CHORD_COLORS[currentChord.id]}`}>
                                {currentChord.id}
                            </span>
                            <AnimatePresence>
                                {landingOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full"
                                    >
                                        Land nå!
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                        {/* Progress bar */}
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full transition-colors ${landingOpen ? 'bg-emerald-400' : 'bg-slate-300'}`}
                                style={{ width: `${progress * 100}%` }}
                            />
                        </div>
                        {!landingOpen && (
                            <p className="text-xs text-slate-400 mt-1">Venter på landing-vinduet...</p>
                        )}
                        {landingOpen && !hitThisBar && (
                            <p className="text-xs text-emerald-600 font-semibold mt-1">Klikk en grunntone!</p>
                        )}
                        {hitThisBar && (
                            <p className="text-xs text-slate-500 mt-1">Venter på neste akkord...</p>
                        )}
                    </div>

                    {/* Fretboard */}
                    <div className="overflow-x-auto">
                        <div className="min-w-[380px] bg-[#5c4033] rounded-lg p-3 relative">
                            <div className="absolute left-[44px] top-0 bottom-0 w-3 bg-slate-100 rounded-sm z-10 pointer-events-none" />
                            <div className="flex flex-col gap-3 py-2">
                                {Array.from({ length: 6 }, (_, si) => (
                                    <div key={si} className="flex items-center relative">
                                        <div className="w-[44px] flex justify-center shrink-0 z-20 relative">
                                            <span className="text-white/60 text-xs font-medium">
                                                {OPEN_NAMES[si]}
                                            </span>
                                        </div>
                                        <div
                                            className="absolute left-[44px] right-0 bg-slate-400 opacity-60 pointer-events-none"
                                            style={{ height: `${1 + (5 - si) * 0.4}px`, top: '50%', transform: 'translateY(-50%)' }}
                                        />
                                        <div className="flex flex-1">
                                            {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => {
                                                const key = `${si}-${fret}`;
                                                const isRoot = rootSet.has(key);
                                                return (
                                                    <div
                                                        key={fret}
                                                        onClick={() => handleFretClick(si, fret)}
                                                        className={`flex-1 h-8 flex items-center justify-center relative cursor-pointer
                                                            ${fret > 0 ? 'border-r border-slate-600' : ''}
                                                            ${isRoot ? 'hover:opacity-80' : ''}`}
                                                    >
                                                        {isRoot && (
                                                            <motion.div
                                                                animate={landingOpen && !hitThisBar
                                                                    ? { scale: [1, 1.15, 1], boxShadow: ['0 0 0px 0px rgba(255,255,255,0)', '0 0 8px 3px rgba(255,255,255,0.4)', '0 0 0px 0px rgba(255,255,255,0)'] }
                                                                    : { scale: 1 }}
                                                                transition={{ duration: 0.8, repeat: landingOpen && !hitThisBar ? Infinity : 0 }}
                                                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md z-20
                                                                    ${currentChord.dotColor} text-white
                                                                    ${landingOpen && !hitThisBar ? `ring-2 ring-offset-1 ring-offset-[#5c4033] ${currentChord.glowColor}` : ''}`}
                                                            >
                                                                {NOTE_NAMES[(OPEN_SEMITONES[si] + fret) % 12]}
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex mt-0.5">
                                <div className="w-[44px] shrink-0" />
                                {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => (
                                    <div key={fret} className="flex-1 text-center text-white/30 text-[10px]">{fret}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feedback */}
                    <AnimatePresence>
                        {feedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className={`text-sm font-semibold px-3 py-2 rounded-lg border
                                    ${feedback.startsWith('Perfekt')
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : 'bg-slate-100 border-slate-200 text-slate-600'}`}
                            >
                                {feedback}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {phase === 'done' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                >
                    <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${score >= 3 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-100 border-slate-300'}`}>
                        <CheckCircle size={28} className={score >= 3 ? 'text-emerald-600' : 'text-slate-400'} />
                        <div>
                            <p className="font-bold text-slate-800">
                                {score}/4 vellykkede landinger
                            </p>
                            <p className="text-sm text-slate-600">
                                {score === 4 && 'Utmerket! Du styrer soloens retning.'}
                                {score === 3 && 'Bra jobb! En akkord unngikk deg.'}
                                {score === 2 && 'Halvveis. Prøv igjen med lavere tempo.'}
                                {score <= 1 && 'Øv mer på å se grunntone-posisjonene.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {PROGRESSION.map((c, i) => (
                            <div key={i} className={`w-14 h-10 rounded-lg flex flex-col items-center justify-center text-sm font-bold border-2
                                ${hits[i] === true ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-500'}`}>
                                {c.id}
                                <span className="text-xs">{hits[i] === true ? '✓' : '✗'}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={startGame}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold text-sm hover:bg-slate-700 transition-colors"
                    >
                        <Play size={16} />
                        Prøv igjen
                    </button>
                </motion.div>
            )}
        </div>
    );
};
