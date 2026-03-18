import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';
import type { ViewState, Level, ApplyLevel, WorkshopMode } from '../data/virkemiddelverkstedet/types';
import { getDevice } from '../data/virkemiddelverkstedet/devices';
import { getExerciseCountForDevice } from '../data/virkemiddelverkstedet/exercises';
import { getApplyExerciseCountForDevice } from '../data/virkemiddelverkstedet/exercises/apply';
import { useVirkemiddelStore } from '../stores/useVirkemiddelStore';
import { DeviceGrid } from '../components/virkemiddelverkstedet/DeviceGrid';
import { TheoryCard } from '../components/virkemiddelverkstedet/TheoryCard';
import { LevelSelector } from '../components/virkemiddelverkstedet/LevelSelector';
import { ExerciseRunner } from '../components/virkemiddelverkstedet/ExerciseRunner';
import { CompletionScreen } from '../components/virkemiddelverkstedet/CompletionScreen';
import { MasteryScreen } from '../components/virkemiddelverkstedet/MasteryScreen';

export const VirkemiddelverkstedetPage = () => {
    usePageTitle('Virkemiddelverkstedet');
    const [viewState, setViewState] = useState<ViewState>({ view: 'grid' });
    const [mode, setMode] = useState<WorkshopMode>('analyser');
    const { getDeviceProgress, getApplyDeviceProgress, resetAll } = useVirkemiddelStore();

    const getProgress = (deviceId: string) =>
        mode === 'analyser' ? getDeviceProgress(deviceId) : getApplyDeviceProgress(deviceId);

    const getTotal = (deviceId: string) =>
        mode === 'analyser'
            ? getExerciseCountForDevice(deviceId)
            : getApplyExerciseCountForDevice(deviceId);

    const handleSelectDevice = (deviceId: string) => {
        setViewState({ view: 'theory', deviceId });
    };

    const handleModeChange = (newMode: WorkshopMode) => {
        setMode(newMode);
        setViewState({ view: 'grid' });
    };

    const maxLevel = mode === 'analyser' ? 10 : 3;

    const renderView = () => {
        switch (viewState.view) {
            case 'grid':
                return (
                    <DeviceGrid
                        key={`grid-${mode}`}
                        mode={mode}
                        onSelectDevice={handleSelectDevice}
                    />
                );

            case 'theory': {
                const device = getDevice(viewState.deviceId);
                if (!device) return null;
                return (
                    <TheoryCard
                        key={`theory-${viewState.deviceId}-${mode}`}
                        device={device}
                        mode={mode}
                        onStart={() =>
                            setViewState({ view: 'levels', deviceId: viewState.deviceId })
                        }
                        onBack={() => setViewState({ view: 'grid' })}
                    />
                );
            }

            case 'levels': {
                const device = getDevice(viewState.deviceId);
                if (!device) return null;
                return (
                    <LevelSelector
                        key={`levels-${viewState.deviceId}-${mode}`}
                        device={device}
                        mode={mode}
                        progress={getProgress(viewState.deviceId)}
                        onSelectLevel={(level) =>
                            setViewState({
                                view: 'exercise',
                                deviceId: viewState.deviceId,
                                level,
                            })
                        }
                        onBack={() =>
                            setViewState({ view: 'theory', deviceId: viewState.deviceId })
                        }
                    />
                );
            }

            case 'exercise':
                return (
                    <ExerciseRunner
                        key={`exercise-${viewState.deviceId}-${viewState.level}-${mode}`}
                        deviceId={viewState.deviceId}
                        level={viewState.level}
                        mode={mode}
                        onComplete={(score) => {
                            const totalAll = getTotal(viewState.deviceId);
                            const progress = getProgress(viewState.deviceId);
                            const completedAll = progress.completedExercises.length;

                            if (completedAll >= totalAll && totalAll > 0) {
                                setViewState({
                                    view: 'mastery',
                                    deviceId: viewState.deviceId,
                                });
                            } else {
                                setViewState({
                                    view: 'completion',
                                    deviceId: viewState.deviceId,
                                    level: viewState.level,
                                    score,
                                });
                            }
                        }}
                        onBack={() =>
                            setViewState({ view: 'levels', deviceId: viewState.deviceId })
                        }
                    />
                );

            case 'completion': {
                const device = getDevice(viewState.deviceId);
                if (!device) return null;
                const nextLevel =
                    viewState.level < maxLevel
                        ? ((viewState.level + 1) as Level | ApplyLevel)
                        : null;
                return (
                    <CompletionScreen
                        key={`completion-${viewState.deviceId}-${viewState.level}-${mode}`}
                        device={device}
                        level={viewState.level}
                        score={viewState.score}
                        mode={mode}
                        onNextLevel={() => {
                            if (nextLevel) {
                                setViewState({
                                    view: 'exercise',
                                    deviceId: viewState.deviceId,
                                    level: nextLevel,
                                });
                            }
                        }}
                        onRetry={() =>
                            setViewState({
                                view: 'exercise',
                                deviceId: viewState.deviceId,
                                level: viewState.level,
                            })
                        }
                        onBack={() => setViewState({ view: 'grid' })}
                    />
                );
            }

            case 'mastery': {
                const device = getDevice(viewState.deviceId);
                if (!device) return null;
                return (
                    <MasteryScreen
                        key={`mastery-${viewState.deviceId}-${mode}`}
                        device={device}
                        mode={mode}
                        onBack={() => setViewState({ view: 'grid' })}
                    />
                );
            }

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen py-8 pb-16">
            <div className="max-w-5xl mx-auto px-4">
                {viewState.view === 'grid' && (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <Link
                                to="/oving"
                                className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                ← Tilbake til Oving
                            </Link>
                            <button
                                onClick={() => {
                                    if (window.confirm('Vil du nullstille all fremgang?')) {
                                        resetAll();
                                    }
                                }}
                                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                            >
                                Nullstill
                            </button>
                        </div>

                        {/* Mode tabs */}
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex bg-slate-100 rounded-full p-1">
                                <button
                                    onClick={() => handleModeChange('analyser')}
                                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                                        mode === 'analyser'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    🔍 Analyser
                                </button>
                                <button
                                    onClick={() => handleModeChange('bruk')}
                                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                                        mode === 'bruk'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    ✏️ Bruk
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
            </div>
        </div>
    );
};
