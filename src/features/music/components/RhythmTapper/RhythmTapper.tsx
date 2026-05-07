import { useState } from 'react';
import { Settings } from 'lucide-react';
import { CalibrationStep } from './CalibrationStep';
import { ModeASeeAndTap } from './ModeASeeAndTap';
import { ModeBCallResponse } from './ModeBCallResponse';
import { ModeCFreeMetronome } from './ModeCFreeMetronome';
import { LevelSelector } from './LevelSelector';
import { loadCalibration, loadProgress } from '../../lib/progressStore';
import type { LevelProgress } from '../../lib/rhythmTypes';

type Mode = 'A' | 'B' | 'C';

const MODE_TABS: { id: Mode; title: string; description: string }[] = [
    { id: 'A', title: 'Se og tapp', description: 'Les noter, tapp i takt' },
    { id: 'B', title: 'Hør og tapp', description: 'Lytt og gjengi' },
    { id: 'C', title: 'Fri metronom', description: 'Tap fritt mot puls' },
];

export function RhythmTapper() {
    const [calibrated, setCalibrated] = useState<boolean>(() => loadCalibration() !== null);
    const [latencyOffsetMs, setLatencyOffsetMs] = useState(
        () => loadCalibration()?.latencyOffsetMs ?? 0
    );
    const [showCalibration, setShowCalibration] = useState(false);
    const [mode, setMode] = useState<Mode>('A');
    const [level, setLevel] = useState(1);
    const [bpm, setBpm] = useState(80);
    const [progress, setProgress] = useState<Record<number, LevelProgress>>(() => loadProgress());

    const handleScoreRecorded = () => {
        setProgress(loadProgress());
    };

    const handleCalibrationComplete = (offset: number) => {
        setLatencyOffsetMs(offset);
        setCalibrated(true);
        setShowCalibration(false);
    };

    if (!calibrated || showCalibration) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-6">
                <CalibrationStep
                    onComplete={handleCalibrationComplete}
                    onSkip={() => {
                        setLatencyOffsetMs(0);
                        setCalibrated(true);
                        setShowCalibration(false);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <header className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Rytme-klikker</h1>
                    <p className="text-sm text-slate-600">
                        Tren rytmesansen og se nøyaktigheten din
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCalibration(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    title="Kalibrer på nytt"
                >
                    <Settings className="w-4 h-4" />
                    Kalibrering ({Math.round(latencyOffsetMs)} ms)
                </button>
            </header>

            <div className="bg-slate-100 rounded-xl p-1.5 mb-5 grid grid-cols-3 gap-1.5">
                {MODE_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setMode(tab.id)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                            mode === tab.id
                                ? 'bg-white shadow-sm text-indigo-700'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <div>{tab.title}</div>
                        <div className="text-xs font-normal text-slate-500">{tab.description}</div>
                    </button>
                ))}
            </div>

            {(mode === 'A' || mode === 'B') && (
                <div className="mb-5">
                    <LevelSelector
                        progress={progress}
                        activeLevel={level}
                        onSelect={setLevel}
                    />
                </div>
            )}

            {mode === 'A' && (
                <ModeASeeAndTap
                    level={level}
                    bpm={bpm}
                    latencyOffsetMs={latencyOffsetMs}
                    onScoreRecorded={handleScoreRecorded}
                    onChangeBpm={setBpm}
                />
            )}
            {mode === 'B' && (
                <ModeBCallResponse
                    level={level}
                    bpm={bpm}
                    latencyOffsetMs={latencyOffsetMs}
                    onChangeBpm={setBpm}
                />
            )}
            {mode === 'C' && (
                <ModeCFreeMetronome
                    bpm={bpm}
                    onChangeBpm={setBpm}
                    latencyOffsetMs={latencyOffsetMs}
                />
            )}
        </div>
    );
}
