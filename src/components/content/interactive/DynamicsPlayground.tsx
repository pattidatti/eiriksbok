import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Play, RotateCcw, Sparkles } from 'lucide-react';

interface DynamicsPlaygroundProps {
    title?: string;
    description?: string;
}

type DynamicLevel = 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff';
type Phase = 'idle' | 'playing' | 'complete';

const LEVELS: DynamicLevel[] = ['pp', 'p', 'mp', 'mf', 'f', 'ff'];

const LEVEL_CONFIG: Record<DynamicLevel, { label: string; height: number; color: string; bg: string }> = {
    pp: { label: 'Pianissimo — veldig svakt', height: 16, color: 'text-indigo-400', bg: 'bg-indigo-100' },
    p: { label: 'Piano — svakt', height: 28, color: 'text-indigo-500', bg: 'bg-indigo-200' },
    mp: { label: 'Mezzo piano — middels svakt', height: 40, color: 'text-violet-500', bg: 'bg-violet-200' },
    mf: { label: 'Mezzo forte — middels sterkt', height: 56, color: 'text-purple-500', bg: 'bg-purple-200' },
    f: { label: 'Forte — sterkt', height: 72, color: 'text-fuchsia-600', bg: 'bg-fuchsia-200' },
    ff: { label: 'Fortissimo — veldig sterkt', height: 88, color: 'text-rose-600', bg: 'bg-rose-200' },
};

const INITIAL_SEGMENTS: DynamicLevel[] = ['mf', 'mf', 'mf', 'mf', 'mf', 'mf', 'mf', 'mf'];
const SEGMENT_LABELS = ['Intro', 'Vers 1', 'Pre-ref.', 'Refreng', 'Vers 2', 'Bro', 'Refreng 2', 'Outro'];

function contrastScore(segments: DynamicLevel[]): number {
    let score = 0;
    for (let i = 1; i < segments.length; i++) {
        const diff = Math.abs(LEVELS.indexOf(segments[i]) - LEVELS.indexOf(segments[i - 1]));
        score += diff;
    }
    return score;
}

export function DynamicsPlayground({
    title = 'Dynamikk-laboratoriet',
    description = 'Sett dynamikkmerke på hver del av låten — se og føl forskjellen.',
}: DynamicsPlaygroundProps) {
    const [segments, setSegments] = useState<DynamicLevel[]>([...INITIAL_SEGMENTS]);
    const [phase, setPhase] = useState<Phase>('idle');
    const [activeSegment, setActiveSegment] = useState<number | null>(null);
    const [playIndex, setPlayIndex] = useState(-1);

    const cycleDynamic = useCallback((index: number) => {
        if (phase === 'playing') return;
        setSegments((prev) => {
            const next = [...prev];
            const currentIdx = LEVELS.indexOf(next[index]);
            next[index] = LEVELS[(currentIdx + 1) % LEVELS.length];
            return next;
        });
        setPhase('idle');
    }, [phase]);

    const handlePlay = useCallback(() => {
        if (phase === 'playing') return;
        setPhase('playing');
        setPlayIndex(0);

        let i = 0;
        const interval = setInterval(() => {
            i++;
            if (i >= segments.length) {
                clearInterval(interval);
                setPlayIndex(-1);
                setPhase('complete');
            } else {
                setPlayIndex(i);
            }
        }, 600);
    }, [phase, segments.length]);

    const handleReset = useCallback(() => {
        setSegments([...INITIAL_SEGMENTS]);
        setPhase('idle');
        setPlayIndex(-1);
        setActiveSegment(null);
    }, []);

    const score = contrastScore(segments);
    const allSame = segments.every((s) => s === segments[0]);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-end gap-2 justify-center mb-2" style={{ minHeight: 120 }}>
                    {segments.map((level, i) => {
                        const config = LEVEL_CONFIG[level];
                        const isPlaying = playIndex === i;
                        return (
                            <button
                                key={i}
                                onClick={() => cycleDynamic(i)}
                                onMouseEnter={() => setActiveSegment(i)}
                                onMouseLeave={() => setActiveSegment(null)}
                                className="flex flex-col items-center gap-1 focus:outline-none group"
                                aria-label={`${SEGMENT_LABELS[i]}: ${config.label}. Klikk for å endre.`}
                            >
                                <motion.div
                                    animate={{
                                        height: config.height,
                                        scale: isPlaying ? 1.15 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className={`w-10 sm:w-14 rounded-lg ${config.bg} ${
                                        isPlaying ? 'ring-2 ring-indigo-400' : ''
                                    } group-hover:shadow-md transition-shadow cursor-pointer`}
                                />
                                <span className={`text-xs font-bold ${config.color}`}>{level}</span>
                                <span className="text-[10px] text-slate-400 leading-tight text-center w-12 sm:w-14 truncate">
                                    {SEGMENT_LABELS[i]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {activeSegment !== null && (
                        <motion.p
                            key={activeSegment}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-center text-sm text-slate-500 mt-2"
                        >
                            {LEVEL_CONFIG[segments[activeSegment]].label}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                {phase === 'complete' && (
                    <motion.div
                        key="feedback"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mx-6 mb-4 px-4 py-3 rounded-lg text-sm ${
                            score >= 8
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                : allSame
                                  ? 'bg-amber-50 border border-amber-200 text-amber-700'
                                  : 'bg-blue-50 border border-blue-200 text-blue-700'
                        }`}
                    >
                        {score >= 8 ? (
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Sterk dynamisk kontrast! Legg merke til hvordan de svake delene gjør de sterke
                                enda kraftigere. Det er dette som gir en låt følelse.
                            </span>
                        ) : allSame ? (
                            'Alt er på samme nivå — det høres flatt ut. Prøv å variere mellom svakt og sterkt!'
                        ) : (
                            'Litt variasjon, men prøv enda større forskjeller. Hva skjer om broen er pp og refrenget er ff?'
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                <button
                    onClick={handlePlay}
                    disabled={phase === 'playing'}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <Play className="w-4 h-4" />
                    Spill av
                </button>
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
