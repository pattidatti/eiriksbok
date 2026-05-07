import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import {
    ensureAudioReady,
    schedulePlayback,
    startTransport,
    stopTransport,
} from '../../audio/rhythmTransport';
import { playTapClick } from '../../audio/clickSynths';
import { TapZone } from './TapZone';
import { MetronomePulse } from './MetronomePulse';

const BPM_PRESETS = [40, 60, 80, 100, 120, 140];

interface Props {
    bpm: number;
    onChangeBpm: (bpm: number) => void;
    latencyOffsetMs: number;
}

interface TapEntry {
    deviationMs: number;
    rating: 'perfect' | 'good' | 'miss';
}

export function ModeCFreeMetronome({ bpm, onChangeBpm, latencyOffsetMs }: Props) {
    const [running, setRunning] = useState(false);
    const [activeBeat, setActiveBeat] = useState(0);
    const [recentTaps, setRecentTaps] = useState<TapEntry[]>([]);

    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        return () => stopTransport();
    }, []);

    useEffect(() => {
        if (running) {
            stopTransport();
            beginInternal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bpm]);

    const beginInternal = () => {
        startTimeRef.current = Tone.now() + 0.15;
        schedulePlayback({
            bpm,
            bars: 100,
            timeSignature: [4, 4],
            countInBeats: 0,
            onMetronome: (beatIndex) => setActiveBeat(beatIndex),
        });
        startTransport();
    };

    const begin = async () => {
        await ensureAudioReady();
        setRunning(true);
        beginInternal();
    };

    const stop = () => {
        stopTransport();
        setRunning(false);
        setActiveBeat(0);
        setRecentTaps([]);
    };

    const handleTap = () => {
        if (!running) return;
        playTapClick();
        const now = Tone.now() - latencyOffsetMs / 1000;
        const secondsPerBeat = 60 / bpm;
        const elapsed = now - startTimeRef.current;
        const nearestBeat = Math.round(elapsed / secondsPerBeat);
        const expected = startTimeRef.current + nearestBeat * secondsPerBeat;
        const deviationMs = (now - expected) * 1000;
        const absMs = Math.abs(deviationMs);
        const rating: TapEntry['rating'] =
            absMs <= 60 ? 'perfect' : absMs <= 120 ? 'good' : 'miss';
        setRecentTaps((prev) => [{ deviationMs, rating }, ...prev].slice(0, 8));
    };

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-slate-700">Fri metronom</span>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">BPM</span>
                        <span className="font-mono text-2xl font-bold w-16 text-center">{bpm}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                    {BPM_PRESETS.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => onChangeBpm(preset)}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition ${
                                preset === bpm
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                        >
                            {preset}
                        </button>
                    ))}
                </div>
                <div className="mt-3">
                    <input
                        type="range"
                        min={40}
                        max={160}
                        value={bpm}
                        onChange={(e) => onChangeBpm(Number(e.target.value))}
                        className="w-full"
                        aria-label="BPM-slider"
                    />
                </div>
            </div>

            <MetronomePulse beatIndex={activeBeat} beatsPerBar={4} isCountIn={false} />

            <TapZone
                onTap={handleTap}
                disabled={!running}
                label={running ? 'TAP' : 'Start metronomet først'}
            />

            <div className="flex gap-3 justify-center">
                {!running ? (
                    <button
                        type="button"
                        onClick={begin}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                    >
                        Start metronom
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={stop}
                        className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition"
                    >
                        Stopp
                    </button>
                )}
            </div>

            {recentTaps.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                        Siste tap (nyeste først)
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                        {recentTaps.map((t, i) => {
                            const color =
                                t.rating === 'perfect'
                                    ? 'bg-green-100 text-green-700 border-green-300'
                                    : t.rating === 'good'
                                      ? 'bg-amber-100 text-amber-700 border-amber-300'
                                      : 'bg-rose-100 text-rose-700 border-rose-300';
                            return (
                                <span
                                    key={i}
                                    className={`px-2.5 py-1 rounded-full border text-xs font-mono ${color}`}
                                >
                                    {t.deviationMs > 0 ? '+' : ''}
                                    {Math.round(t.deviationMs)} ms
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
