import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tone from 'tone';
import { Music, Play, RotateCcw, Sparkles, Sun, Moon } from 'lucide-react';

interface SkalaSammenlignerProps {
    title?: string;
}

type Mode = 'dur' | 'moll';
type Phase = 'idle' | 'heard-dur' | 'heard-moll' | 'complete';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ROOT_NOTES: { label: string; midi: number }[] = [
    { label: 'C', midi: 60 },
    { label: 'D', midi: 62 },
    { label: 'E', midi: 64 },
    { label: 'F', midi: 65 },
    { label: 'G', midi: 67 },
    { label: 'A', midi: 69 },
    { label: 'B', midi: 71 },
];

const DUR_INTERVALS = [0, 2, 4, 5, 7, 9, 11, 12];
const MOLL_INTERVALS = [0, 2, 3, 5, 7, 8, 10, 12];

const midiToNoteName = (midi: number): string => {
    const octave = Math.floor(midi / 12) - 1;
    const name = NOTE_NAMES[midi % 12];
    return `${name}${octave}`;
};

const midiToDisplay = (midi: number): string => {
    return NOTE_NAMES[midi % 12];
};

export function SkalaSammenligner({ title = 'Toneart-laben' }: SkalaSammenlignerProps) {
    const [rootMidi, setRootMidi] = useState<number>(60);
    const [mode, setMode] = useState<Mode>('dur');
    const [phase, setPhase] = useState<Phase>('idle');
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const synthRef = useRef<Tone.Synth | null>(null);

    useEffect(() => {
        const synth = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.5 },
        }).toDestination();
        synth.volume.value = -10;
        synthRef.current = synth;
        return () => {
            synth.dispose();
        };
    }, []);

    const intervals = mode === 'dur' ? DUR_INTERVALS : MOLL_INTERVALS;
    const scaleNotes = intervals.map((i) => rootMidi + i);
    const tersIndex = 2;

    const markHeard = (m: Mode) => {
        if (m === 'dur' && phase === 'idle') setPhase('heard-dur');
        else if (m === 'moll' && phase === 'idle') setPhase('heard-moll');
        else if (m === 'dur' && phase === 'heard-moll') setPhase('complete');
        else if (m === 'moll' && phase === 'heard-dur') setPhase('complete');
    };

    const playNote = async (midi: number, stepIndex: number) => {
        if (isPlaying) return;
        if (Tone.context.state !== 'running') await Tone.start();
        synthRef.current?.triggerAttackRelease(midiToNoteName(midi), '8n');
        setActiveStep(stepIndex);
        setTimeout(() => setActiveStep(null), 280);
    };

    const playScale = async () => {
        if (isPlaying) return;
        if (Tone.context.state !== 'running') await Tone.start();
        setIsPlaying(true);
        const stepDur = 0.32;
        let t = Tone.now();
        scaleNotes.forEach((midi, idx) => {
            synthRef.current?.triggerAttackRelease(midiToNoteName(midi), '8n', t);
            setTimeout(() => setActiveStep(idx), idx * stepDur * 1000);
            setTimeout(() => setActiveStep(null), idx * stepDur * 1000 + 260);
            t += stepDur;
        });
        const totalMs = scaleNotes.length * stepDur * 1000 + 250;
        setTimeout(() => {
            setIsPlaying(false);
            markHeard(mode);
        }, totalMs);
    };

    const playMelody = async () => {
        if (isPlaying) return;
        if (Tone.context.state !== 'running') await Tone.start();
        setIsPlaying(true);
        const pattern = [0, 2, 4, 2, 0];
        const durations = [0.28, 0.28, 0.4, 0.28, 0.55];
        let t = Tone.now();
        pattern.forEach((idx, i) => {
            const midi = scaleNotes[idx];
            synthRef.current?.triggerAttackRelease(midiToNoteName(midi), '8n', t);
            const ms = pattern.slice(0, i).reduce((s, _, k) => s + durations[k] * 1000, 0);
            setTimeout(() => setActiveStep(idx), ms);
            setTimeout(() => setActiveStep(null), ms + 200);
            t += durations[i];
        });
        const totalMs = durations.reduce((s, d) => s + d, 0) * 1000 + 200;
        setTimeout(() => {
            setIsPlaying(false);
            markHeard(mode);
        }, totalMs);
    };

    const handleReset = () => {
        setRootMidi(60);
        setMode('dur');
        setPhase('idle');
        setActiveStep(null);
    };

    const feedbackText = (() => {
        if (phase === 'idle') {
            return 'Trykk på et trinn, eller spill av hele skalaen. Bytt så mellom Dur og Moll og hør forskjellen.';
        }
        if (phase === 'heard-dur') {
            return 'Du har hørt dur — den lyse, åpne stemningen. Bytt til Moll for å høre den mørke versjonen av samme grunntone.';
        }
        if (phase === 'heard-moll') {
            return 'Du har hørt moll — den triste, alvorlige stemningen. Bytt til Dur for å høre forskjellen.';
        }
        return 'Aha! Forskjellen er bare tersen — den tredje tonen i skalaen. Den senkes ett halvt steg i moll, og hele stemningen snur.';
    })();

    const modeColor = mode === 'dur'
        ? {
              ring: 'ring-amber-400',
              bg: 'bg-amber-50',
              border: 'border-amber-200',
              text: 'text-amber-800',
              chip: 'bg-amber-500 text-white',
              tile: 'bg-amber-100 border-amber-300 text-amber-900',
              btn: 'bg-amber-500 hover:bg-amber-600 text-white',
          }
        : {
              ring: 'ring-indigo-400',
              bg: 'bg-indigo-50',
              border: 'border-indigo-200',
              text: 'text-indigo-800',
              chip: 'bg-indigo-600 text-white',
              tile: 'bg-indigo-100 border-indigo-300 text-indigo-900',
              btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Music className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Den ene tonen som endrer alt — sammenlign dur og moll på samme grunntone.
                    </p>
                </div>
            </div>

            {/* Root note picker */}
            <div className="px-6 pt-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Grunntone
                </p>
                <div className="flex flex-wrap gap-2">
                    {ROOT_NOTES.map((r) => (
                        <button
                            key={r.label}
                            onClick={() => {
                                setRootMidi(r.midi);
                                setActiveStep(null);
                            }}
                            className={`min-w-[2.5rem] px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                                rootMidi === r.midi
                                    ? 'bg-slate-800 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mode toggle */}
            <div className="px-6 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Stemning
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('dur')}
                        className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                            mode === 'dur'
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <Sun className="w-4 h-4" />
                        Dur (lys)
                    </button>
                    <button
                        onClick={() => setMode('moll')}
                        className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                            mode === 'moll'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <Moon className="w-4 h-4" />
                        Moll (mørk)
                    </button>
                </div>
            </div>

            {/* Scale ladder */}
            <div className="px-6 pt-5">
                <div className="grid grid-cols-8 gap-1.5">
                    {scaleNotes.map((midi, idx) => {
                        const isTers = idx === tersIndex;
                        const isActive = activeStep === idx;
                        const label = midiToDisplay(midi);
                        const degree = idx === 7 ? '8' : String(idx + 1);
                        return (
                            <motion.button
                                key={idx}
                                onClick={() => playNote(midi, idx)}
                                disabled={isPlaying}
                                animate={isActive ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                                className={`relative aspect-[3/4] rounded-lg border-2 flex flex-col items-center justify-between py-2 transition-shadow ${
                                    modeColor.tile
                                } ${isActive ? `ring-4 ${modeColor.ring} shadow-lg` : 'shadow-sm hover:shadow-md'} ${
                                    isPlaying ? 'cursor-default' : 'cursor-pointer'
                                }`}
                            >
                                <span className="text-[10px] font-bold opacity-70">{degree}</span>
                                <span className="text-base font-bold leading-none">{label}</span>
                                {isTers && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${modeColor.chip}`}>
                                        TERS
                                    </span>
                                )}
                                {!isTers && <span className="h-[14px]" aria-hidden="true" />}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 pt-4 flex flex-col sm:flex-row gap-2">
                <button
                    onClick={playScale}
                    disabled={isPlaying}
                    className={`flex-1 rounded-full px-5 py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                        isPlaying
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : modeColor.btn
                    }`}
                >
                    <Play className="w-4 h-4" />
                    Spill skala oppover
                </button>
                <button
                    onClick={playMelody}
                    disabled={isPlaying}
                    className={`flex-1 rounded-full px-5 py-2 text-sm font-semibold flex items-center justify-center gap-2 border-2 transition-colors ${
                        isPlaying
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    <Sparkles className="w-4 h-4" />
                    Spill liten melodi (1-3-5)
                </button>
            </div>

            {/* Feedback zone */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={phase}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm border ${
                        phase === 'complete'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : phase === 'idle'
                              ? 'bg-slate-50 border-slate-200 text-slate-600'
                              : `${modeColor.bg} ${modeColor.border} ${modeColor.text}`
                    }`}
                >
                    <div className="flex items-start gap-2">
                        {phase === 'complete' && (
                            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        <p>{feedbackText}</p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Control row */}
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
