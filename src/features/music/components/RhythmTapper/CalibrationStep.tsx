import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import {
    ensureAudioReady,
    scheduleCountIn,
    startTransport,
    stopTransport,
} from '../../audio/rhythmTransport';
import { calibrationOffsetFromTaps } from '../../lib/accuracy';
import { saveCalibration } from '../../lib/progressStore';

type Phase = 'intro' | 'countIn' | 'tapping' | 'result';

const CALIBRATION_BPM = 80;
const TAPS_REQUIRED = 8;
const COUNT_IN_BEATS = 4;

interface Props {
    onComplete: (offsetMs: number) => void;
    onSkip: () => void;
}

export function CalibrationStep({ onComplete, onSkip }: Props) {
    const [phase, setPhase] = useState<Phase>('intro');
    const [tapCount, setTapCount] = useState(0);
    const [resultMs, setResultMs] = useState<number | null>(null);
    const tapTimesRef = useRef<number[]>([]);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        return () => {
            stopTransport();
        };
    }, []);

    useEffect(() => {
        if (phase !== 'tapping' && phase !== 'countIn') return;

        const handler = (e: KeyboardEvent) => {
            if (e.code !== 'Space') return;
            e.preventDefault();
            if (phase !== 'tapping') return;
            const now = Tone.now();
            tapTimesRef.current.push(now);
            setTapCount(tapTimesRef.current.length);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [phase]);

    const handleTap = () => {
        if (phase !== 'tapping') return;
        const now = Tone.now();
        tapTimesRef.current.push(now);
        setTapCount(tapTimesRef.current.length);
    };

    const begin = async () => {
        await ensureAudioReady();
        tapTimesRef.current = [];
        setTapCount(0);
        setPhase('countIn');

        const secondsPerBeat = 60 / CALIBRATION_BPM;

        scheduleCountIn({
            bpm: CALIBRATION_BPM,
            beats: COUNT_IN_BEATS + TAPS_REQUIRED,
            onTick: (beatIndex, time) => {
                if (beatIndex === COUNT_IN_BEATS) {
                    setPhase('tapping');
                    startTimeRef.current = time;
                }
            },
            onComplete: () => {
                finalize(secondsPerBeat);
            },
        });
        startTransport();
    };

    const finalize = (secondsPerBeat: number) => {
        stopTransport();
        const taps = tapTimesRef.current;
        const expected: number[] = [];
        for (let i = 0; i < TAPS_REQUIRED; i++) {
            expected.push(startTimeRef.current + i * secondsPerBeat);
        }
        const offset = calibrationOffsetFromTaps(taps, expected);
        setResultMs(offset);
        setPhase('result');
        saveCalibration({
            latencyOffsetMs: offset,
            calibratedAt: Date.now(),
            sampleCount: taps.length,
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-display font-bold mb-2">Kalibrering</h2>
            <p className="text-slate-600 mb-6">
                Vi måler hvor lang tid det tar fra du trykker til datamaskinen registrerer det.
                Trykk i takt med metronomet 8 ganger.
            </p>

            {phase === 'intro' && (
                <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
                        <p className="mb-2 font-semibold">Slik gjør du:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Klikk &quot;Start kalibrering&quot;</li>
                            <li>Hør 4 forberedende slag</li>
                            <li>Tap i takt med de neste 8 slagene (mellomrom eller klikk)</li>
                        </ol>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={begin}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                        >
                            Start kalibrering
                        </button>
                        <button
                            type="button"
                            onClick={onSkip}
                            className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-medium"
                        >
                            Hopp over (bruk standard)
                        </button>
                    </div>
                </div>
            )}

            {phase === 'countIn' && (
                <div className="text-center py-12">
                    <p className="text-lg text-slate-600 mb-4">Lytt til slagene...</p>
                    <p className="text-sm text-slate-500">Tap når det er din tur</p>
                </div>
            )}

            {phase === 'tapping' && (
                <div className="text-center py-8">
                    <p className="text-lg text-slate-600 mb-4">Tap nå!</p>
                    <button
                        type="button"
                        onClick={handleTap}
                        className="w-48 h-48 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-full text-xl font-bold mx-auto block transition"
                    >
                        TAP
                    </button>
                    <p className="mt-4 text-2xl font-mono text-slate-700">
                        {tapCount} / {TAPS_REQUIRED}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">Eller bruk mellomrom</p>
                </div>
            )}

            {phase === 'result' && resultMs !== null && (
                <div className="text-center py-8 space-y-4">
                    <p className="text-lg text-slate-700">Kalibrering ferdig</p>
                    <p className="text-3xl font-mono font-bold text-indigo-600">
                        {Math.round(resultMs)} ms
                    </p>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                        {Math.abs(resultMs) < 30
                            ? 'Veldig presis! Liten eller ingen forsinkelse.'
                            : resultMs > 0
                              ? `Du tapper litt etter slaget. Vi kompenserer automatisk.`
                              : `Du tapper litt før slaget. Vi kompenserer automatisk.`}
                    </p>
                    <button
                        type="button"
                        onClick={() => onComplete(resultMs)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                    >
                        Fortsett
                    </button>
                </div>
            )}
        </div>
    );
}
