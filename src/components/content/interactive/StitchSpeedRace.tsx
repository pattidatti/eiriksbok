import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Cog, Play, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';

interface Racer {
    id: 'hand' | 'machine';
    label: string;
    icon: 'hand' | 'cog';
    stitchesPerMinute: number; // sting i minuttet
    totalStitches: number; // sting som trengs for én skjorte
    color: string; // tailwind tekst/aksent
    barColor: string; // tailwind bakgrunn for fremdriftsbar
    timeLabel: string; // hvor lang tid en hel skjorte tar i virkeligheten
}

interface StitchSpeedRaceProps {
    title?: string;
    instruction?: string;
    racers?: Racer[];
    insight?: string;
}

const ICONS = {
    hand: Hand,
    cog: Cog,
};

// Lengden på selve animasjonen i sekunder (ikke virkelig tid).
const RACE_SECONDS = 6;
const TICK_MS = 50;

const DEFAULT_RACERS: Racer[] = [
    {
        id: 'hand',
        label: 'Håndsøm',
        icon: 'hand',
        stitchesPerMinute: 30,
        totalStitches: 30000,
        color: 'text-amber-600',
        barColor: 'bg-amber-400',
        timeLabel: 'rundt 14 timer',
    },
    {
        id: 'machine',
        label: 'Symaskin',
        icon: 'cog',
        stitchesPerMinute: 800,
        totalStitches: 30000,
        color: 'text-indigo-600',
        barColor: 'bg-indigo-500',
        timeLabel: 'under 1 time',
    },
];

export function StitchSpeedRace({
    title = 'Kappløpet: hånd mot maskin',
    instruction = 'Trykk start og se hvem som syr én skjorte ferdig først.',
    racers = DEFAULT_RACERS,
    insight = 'Det som tok en hel dag for hånd, sydde maskinen på en time - og klær ble noe alle hadde råd til.',
}: StitchSpeedRaceProps) {
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState<Record<string, number>>({});
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Maskinen er raskest, så den blir alltid ferdig først.
    const fastest = racers.reduce((a, b) =>
        b.stitchesPerMinute / b.totalStitches > a.stitchesPerMinute / a.totalStitches ? b : a
    );

    const fastestDone = (progress[fastest.id] ?? 0) >= 1;

    useEffect(() => {
        if (!running) return;

        const start = Date.now();
        intervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - start) / 1000;
            const next: Record<string, number> = {};
            for (const r of racers) {
                // Tidsbasert opptelling: hver racer fyller mot 1 i takt med sin egen fart.
                const rate = r.stitchesPerMinute / fastest.stitchesPerMinute; // 1 for raskeste
                const frac = Math.min(1, (elapsed / RACE_SECONDS) * rate);
                next[r.id] = frac;
            }
            setProgress(next);

            if ((next[fastest.id] ?? 0) >= 1) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setRunning(false);
            }
        }, TICK_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [running, racers, fastest]);

    const handleStart = () => {
        setProgress({});
        setRunning(true);
    };

    const handleReset = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setRunning(false);
        setProgress({});
    };

    const started = running || Object.keys(progress).length > 0;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Cog className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{instruction}</p>
                </div>
            </div>

            {/* Banene */}
            <div className="px-4 sm:px-6 py-6 space-y-6">
                {racers.map((r) => {
                    const Icon = ICONS[r.icon];
                    const frac = progress[r.id] ?? 0;
                    const done = frac >= 1;
                    const stitchesDone = Math.round(frac * r.totalStitches);
                    return (
                        <div key={r.id}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Icon className={`w-4 h-4 ${r.color}`} />
                                    {r.label}
                                </span>
                                <span className={`text-xs font-medium ${r.color}`}>
                                    {r.stitchesPerMinute} sting i minuttet
                                </span>
                            </div>

                            {/* Fremdriftsbar */}
                            <div className="relative h-9 rounded-full bg-slate-100 overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full ${r.barColor}`}
                                    animate={{ width: `${frac * 100}%` }}
                                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                                />
                                {/* Mål-merke */}
                                <div className="absolute inset-y-0 right-2 flex items-center">
                                    <AnimatePresence>
                                        {done && (
                                            <motion.span
                                                initial={{ scale: 0, rotate: -30 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 400,
                                                    damping: 14,
                                                }}
                                            >
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Tellere */}
                            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                                <span>
                                    {stitchesDone.toLocaleString('nb-NO')} av{' '}
                                    {r.totalStitches.toLocaleString('nb-NO')} sting
                                </span>
                                <span>Tid for én skjorte: {r.timeLabel}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Innsiktsbanner ved mål */}
            <AnimatePresence>
                {fastestDone && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="mx-6 mb-4 flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700"
                    >
                        <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                        {insight}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <button
                    onClick={handleStart}
                    disabled={running}
                    className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                        running
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                    }`}
                >
                    <Play className="h-4 w-4" />
                    {running ? 'Syr ...' : 'Start'}
                </button>
                <button
                    onClick={handleReset}
                    disabled={!started}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-40 text-sm transition-colors"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start på nytt
                </button>
            </div>
        </div>
    );
}
