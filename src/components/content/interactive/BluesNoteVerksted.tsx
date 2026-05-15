import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tone from 'tone';
import { Music2, Play, RotateCcw, Sparkles } from 'lucide-react';

interface BluesNoteVerkstedProps {
    title?: string;
}

type Mode = 'dur' | 'blues';
type Phase = 'idle' | 'explored-dur' | 'explored-blues' | 'complete';

interface Key {
    note: string;
    label: string;
    isBlack: boolean;
}

const KEYS: Key[] = [
    { note: 'C4', label: 'C', isBlack: false },
    { note: 'C#4', label: 'C#', isBlack: true },
    { note: 'D4', label: 'D', isBlack: false },
    { note: 'D#4', label: 'D#', isBlack: true },
    { note: 'E4', label: 'E', isBlack: false },
    { note: 'F4', label: 'F', isBlack: false },
    { note: 'F#4', label: 'F#', isBlack: true },
    { note: 'G4', label: 'G', isBlack: false },
    { note: 'G#4', label: 'G#', isBlack: true },
    { note: 'A4', label: 'A', isBlack: false },
    { note: 'A#4', label: 'A#', isBlack: true },
    { note: 'B4', label: 'B', isBlack: false },
    { note: 'C5', label: 'C', isBlack: false },
];

const DUR_NOTES = new Set(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']);
const BLUES_NOTES = new Set(['C4', 'D#4', 'F4', 'F#4', 'G4', 'A#4', 'C5']);

const DUR_RIFF: Array<{ note: string; dur: number }> = [
    { note: 'C4', dur: 0.25 },
    { note: 'D4', dur: 0.25 },
    { note: 'E4', dur: 0.25 },
    { note: 'G4', dur: 0.35 },
    { note: 'E4', dur: 0.25 },
    { note: 'C5', dur: 0.5 },
];

const BLUES_RIFF: Array<{ note: string; dur: number }> = [
    { note: 'C4', dur: 0.25 },
    { note: 'D#4', dur: 0.2 },
    { note: 'F4', dur: 0.2 },
    { note: 'F#4', dur: 0.15 },
    { note: 'G4', dur: 0.35 },
    { note: 'A#4', dur: 0.25 },
    { note: 'C5', dur: 0.5 },
];

export function BluesNoteVerksted({ title = 'Blå-note-verkstedet' }: BluesNoteVerkstedProps) {
    const [mode, setMode] = useState<Mode>('dur');
    const [phase, setPhase] = useState<Phase>('idle');
    const [pressed, setPressed] = useState<string | null>(null);
    const [isPlayingRiff, setIsPlayingRiff] = useState(false);
    const synthRef = useRef<Tone.Synth | null>(null);

    useEffect(() => {
        const synth = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.15, sustain: 0.25, release: 0.6 },
        }).toDestination();
        synth.volume.value = -8;
        synthRef.current = synth;
        return () => {
            synth.dispose();
        };
    }, []);

    const activeSet = mode === 'dur' ? DUR_NOTES : BLUES_NOTES;

    const playSingleNote = async (note: string) => {
        if (!activeSet.has(note)) return;
        if (Tone.context.state !== 'running') await Tone.start();
        synthRef.current?.triggerAttackRelease(note, '8n');
        setPressed(note);
        setTimeout(() => setPressed(null), 220);

        if (mode === 'dur' && phase === 'idle') setPhase('explored-dur');
        if (mode === 'blues' && (phase === 'idle' || phase === 'explored-dur'))
            setPhase('explored-blues');
    };

    const playRiff = async () => {
        if (isPlayingRiff) return;
        if (Tone.context.state !== 'running') await Tone.start();
        setIsPlayingRiff(true);
        const riff = mode === 'dur' ? DUR_RIFF : BLUES_RIFF;
        let t = Tone.now();
        for (const step of riff) {
            synthRef.current?.triggerAttackRelease(step.note, step.dur, t);
            t += step.dur;
        }
        const totalMs = riff.reduce((s, r) => s + r.dur, 0) * 1000 + 200;

        // Track exploration via riff too
        if (mode === 'dur' && phase === 'idle') setPhase('explored-dur');
        if (mode === 'blues' && (phase === 'idle' || phase === 'explored-dur'))
            setPhase('explored-blues');

        setTimeout(() => {
            setIsPlayingRiff(false);
            if (phase === 'explored-blues' || mode === 'blues') {
                // mark complete once both moods have been heard
                setPhase((p) => (p === 'explored-blues' ? 'complete' : p));
            }
        }, totalMs);
    };

    const handleReset = () => {
        setMode('dur');
        setPhase('idle');
        setPressed(null);
    };

    const switchMode = (m: Mode) => {
        setMode(m);
        if (m === 'blues' && phase === 'explored-dur') {
            // primed to discover the blues scale
        }
    };

    const feedbackText = (() => {
        if (phase === 'idle') {
            return 'Trykk på en tangent eller spill av riff-et. Bytt så til Blues og hør forskjellen.';
        }
        if (phase === 'explored-dur') {
            return 'Det var dur-skalaen — glad og åpen. Bytt til Blues for å høre de blå tonene.';
        }
        if (phase === 'explored-blues') {
            return 'Hører du forskjellen? Blues-skalaen bruker tre svarte tangenter mellom de hvite — Eb, F#, og Bb. Det er der jazz-følelsen bor.';
        }
        return 'Aha! Forskjellen mellom dur og blues handler om tre toner. Disse "blå" tonene gir jazz sin særegne stemning.';
    })();

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Music2 className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Sammenlign dur-skalaen med blues-skalaen — lytt etter de blå tonene.
                    </p>
                </div>
            </div>

            {/* Mode toggle */}
            <div className="px-6 pt-5 flex gap-2">
                <button
                    onClick={() => switchMode('dur')}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        mode === 'dur'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    Dur-skala (glad)
                </button>
                <button
                    onClick={() => switchMode('blues')}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        mode === 'blues'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    Blues-skala (rå)
                </button>
            </div>

            {/* Piano */}
            <div className="px-6 pt-5">
                <div className="relative h-44 select-none">
                    {/* White keys */}
                    <div className="absolute inset-0 flex gap-[2px]">
                        {KEYS.filter((k) => !k.isBlack).map((k) => {
                            const active = activeSet.has(k.note);
                            const isPressed = pressed === k.note;
                            const colour =
                                mode === 'dur'
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                    : 'bg-blue-100 border-blue-300 text-blue-700';
                            return (
                                <motion.button
                                    key={k.note}
                                    onClick={() => playSingleNote(k.note)}
                                    disabled={!active}
                                    animate={isPressed ? { scale: 0.96 } : { scale: 1 }}
                                    transition={{ duration: 0.15 }}
                                    className={`flex-1 rounded-b-lg border flex flex-col justify-end items-center pb-2 transition-colors shadow-sm ${
                                        active
                                            ? `${colour} hover:brightness-105 cursor-pointer`
                                            : 'bg-white border-slate-200 text-slate-300 cursor-not-allowed'
                                    } ${isPressed ? 'ring-2 ring-indigo-400' : ''}`}
                                >
                                    <span className="text-[10px] sm:text-xs font-bold">
                                        {active ? k.label : ''}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Black keys overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                        {KEYS.map((k, i) => {
                            if (!k.isBlack) return null;
                            // Compute position: black key sits between white keys
                            const whiteKeys = KEYS.filter((kk) => !kk.isBlack);
                            const whiteCount = whiteKeys.length;
                            // The previous white key index
                            const prevWhiteIdx = whiteKeys.findIndex(
                                (kk) => kk.note === KEYS[i - 1].note
                            );
                            const leftPct = ((prevWhiteIdx + 1) / whiteCount) * 100;
                            const widthPct = (100 / whiteCount) * 0.6;
                            const active = activeSet.has(k.note);
                            const isPressed = pressed === k.note;
                            const colour =
                                mode === 'blues' && active
                                    ? 'bg-blue-600 border-blue-700'
                                    : active
                                    ? 'bg-emerald-700 border-emerald-800'
                                    : 'bg-slate-800 border-slate-900';
                            return (
                                <motion.button
                                    key={k.note}
                                    onClick={() => playSingleNote(k.note)}
                                    disabled={!active}
                                    animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                        position: 'absolute',
                                        left: `calc(${leftPct}% - ${widthPct / 2}%)`,
                                        width: `${widthPct}%`,
                                        top: 0,
                                        height: '62%',
                                        pointerEvents: active ? 'auto' : 'none',
                                    }}
                                    className={`rounded-b-md border ${colour} ${
                                        active ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
                                    } ${isPressed ? 'ring-2 ring-amber-300' : ''} shadow-md flex items-end justify-center pb-1`}
                                >
                                    {active && (
                                        <span className="text-[9px] font-bold text-white">
                                            {k.label}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Action row */}
            <div className="px-6 pt-4">
                <button
                    onClick={playRiff}
                    disabled={isPlayingRiff}
                    className={`w-full rounded-full px-5 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        isPlayingRiff
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : mode === 'dur'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    <Play className="w-4 h-4" />
                    {isPlayingRiff
                        ? 'Spiller...'
                        : mode === 'dur'
                        ? 'Spill dur-riff'
                        : 'Spill blues-riff'}
                </button>
            </div>

            {/* Feedback zone — alltid synlig */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={phase + '-' + mode}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm border ${
                        phase === 'complete'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : phase === 'idle'
                            ? 'bg-slate-50 border-slate-200 text-slate-600'
                            : mode === 'blues'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                >
                    <div className="flex items-start gap-2">
                        {phase === 'complete' && (
                            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{feedbackText}</span>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 py-4 flex items-center justify-end">
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
