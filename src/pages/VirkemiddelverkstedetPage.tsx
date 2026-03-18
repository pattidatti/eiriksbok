import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';
import type { ViewState, Level } from '../data/virkemiddelverkstedet/types';
import { getDevice } from '../data/virkemiddelverkstedet/devices';
import { getExerciseCountForDevice } from '../data/virkemiddelverkstedet/exercises';
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
    const { getDeviceProgress, resetAll } = useVirkemiddelStore();

    const handleSelectDevice = (deviceId: string) => {
        setViewState({ view: 'theory', deviceId });
    };

    const renderView = () => {
        switch (viewState.view) {
            case 'grid':
                return <DeviceGrid key="grid" onSelectDevice={handleSelectDevice} />;

            case 'theory': {
                const device = getDevice(viewState.deviceId);
                if (!device) return null;
                return (
                    <TheoryCard
                        key={`theory-${viewState.deviceId}`}
                        device={device}
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
                        key={`levels-${viewState.deviceId}`}
                        device={device}
                        progress={getDeviceProgress(viewState.deviceId)}
                        onSelectLevel={(level) =>
                            setViewState({ view: 'exercise', deviceId: viewState.deviceId, level })
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
                        key={`exercise-${viewState.deviceId}-${viewState.level}`}
                        deviceId={viewState.deviceId}
                        level={viewState.level}
                        onComplete={(score) => {
                            // Check if all levels are done
                            const totalAll = getExerciseCountForDevice(viewState.deviceId);
                            const progress = getDeviceProgress(viewState.deviceId);
                            const completedAll = progress.completedExercises.length;

                            // We just completed this level's exercises, so check if mastery
                            if (completedAll >= totalAll && totalAll > 0) {
                                setViewState({ view: 'mastery', deviceId: viewState.deviceId });
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
                const nextLevel = viewState.level < 10 ? ((viewState.level + 1) as Level) : null;
                return (
                    <CompletionScreen
                        key={`completion-${viewState.deviceId}-${viewState.level}`}
                        device={device}
                        level={viewState.level}
                        score={viewState.score}
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
                        key={`mastery-${viewState.deviceId}`}
                        device={device}
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
                )}

                <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
            </div>
        </div>
    );
};
