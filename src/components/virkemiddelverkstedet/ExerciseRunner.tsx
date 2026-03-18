import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exercise, Level, ApplyLevel, WorkshopMode } from '../../data/virkemiddelverkstedet/types';
import { getDevice } from '../../data/virkemiddelverkstedet/devices';
import { getExercisesForDevice } from '../../data/virkemiddelverkstedet/exercises';
import { getApplyExercisesForDevice } from '../../data/virkemiddelverkstedet/exercises/apply';
import { getLevelName, getApplyLevelName } from '../../data/virkemiddelverkstedet/levels';
import { useVirkemiddelStore } from '../../stores/useVirkemiddelStore';
import { ScoreDisplay } from './ScoreDisplay';
import { HighlightExercise } from './exercises/HighlightExercise';
import { IdentifyExercise } from './exercises/IdentifyExercise';
import { ExplainExercise } from './exercises/ExplainExercise';
import { MatchExercise } from './exercises/MatchExercise';
import { WriteExercise } from './exercises/WriteExercise';
import { FillBlankExercise } from './exercises/FillBlankExercise';
import { SortExercise } from './exercises/SortExercise';
import { TrueFalseExercise } from './exercises/TrueFalseExercise';
import { FindErrorExercise } from './exercises/FindErrorExercise';

interface ExerciseRunnerProps {
    deviceId: string;
    level: Level | ApplyLevel;
    mode: WorkshopMode;
    onComplete: (score: number) => void;
    onBack: () => void;
}

export const ExerciseRunner = ({ deviceId, level, mode, onComplete, onBack }: ExerciseRunnerProps) => {
    const device = getDevice(deviceId);
    const isApply = mode === 'bruk';
    const exercises = isApply
        ? getApplyExercisesForDevice(deviceId, level as ApplyLevel)
        : getExercisesForDevice(deviceId, level as Level);
    const {
        completeExercise,
        incrementStreak,
        resetStreak,
        getDeviceProgress,
        completeApplyExercise,
        incrementApplyStreak,
        resetApplyStreak,
        getApplyDeviceProgress,
    } = useVirkemiddelStore();
    const progress = isApply ? getApplyDeviceProgress(deviceId) : getDeviceProgress(deviceId);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionScore, setSessionScore] = useState(0);
    const [streak, setStreak] = useState(progress.currentStreak);
    const [exerciseDone, setExerciseDone] = useState(false);

    const currentExercise = exercises[currentIndex];

    const levelName = isApply
        ? getApplyLevelName(level as ApplyLevel)
        : getLevelName(level as Level);

    const handleCorrect = useCallback(
        (points: number) => {
            const streakBonus = Math.min(streak * 10, 50);
            const totalPoints = points + streakBonus;

            setSessionScore((s) => s + totalPoints);
            setStreak((s) => s + 1);
            setExerciseDone(true);

            if (isApply) {
                completeApplyExercise(deviceId, currentExercise.id, totalPoints);
                incrementApplyStreak(deviceId);
            } else {
                completeExercise(deviceId, currentExercise.id, totalPoints);
                incrementStreak(deviceId);
            }
        },
        [
            deviceId,
            currentExercise,
            streak,
            isApply,
            completeExercise,
            incrementStreak,
            completeApplyExercise,
            incrementApplyStreak,
        ]
    );

    const handleWrong = useCallback(() => {
        setStreak(0);
        if (isApply) {
            resetApplyStreak(deviceId);
        } else {
            resetStreak(deviceId);
        }
    }, [deviceId, isApply, resetStreak, resetApplyStreak]);

    const handleNext = () => {
        if (currentIndex + 1 >= exercises.length) {
            onComplete(sessionScore);
        } else {
            setCurrentIndex((i) => i + 1);
            setExerciseDone(false);
        }
    };

    if (!device || !currentExercise) return null;

    const renderExercise = (exercise: Exercise) => {
        const props = {
            exercise,
            deviceColor: device.color,
            onCorrect: handleCorrect,
            onWrong: handleWrong,
        };

        switch (exercise.data.type) {
            case 'highlight':
                return <HighlightExercise key={exercise.id} {...props} />;
            case 'identify':
                return <IdentifyExercise key={exercise.id} {...props} />;
            case 'explain':
                return <ExplainExercise key={exercise.id} {...props} />;
            case 'match':
                return <MatchExercise key={exercise.id} {...props} />;
            case 'write':
                return <WriteExercise key={exercise.id} {...props} />;
            case 'fill-blank':
                return <FillBlankExercise key={exercise.id} {...props} />;
            case 'sort':
                return <SortExercise key={exercise.id} {...props} />;
            case 'true-false':
                return <TrueFalseExercise key={exercise.id} {...props} />;
            case 'find-error':
                return <FindErrorExercise key={exercise.id} {...props} />;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={onBack}
                className="text-sm text-slate-500 hover:text-slate-800 font-medium mb-4 inline-block transition-colors"
            >
                ← Avbryt
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{device.emoji}</span>
                <div>
                    <h2 className="font-bold text-slate-900">
                        {device.name}
                        {isApply && (
                            <span className="text-indigo-500 text-sm font-medium ml-2">
                                Bruk
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-400">
                        Nivå {level} - {levelName}
                    </p>
                </div>
            </div>

            <ScoreDisplay
                score={sessionScore}
                streak={streak}
                currentExercise={currentIndex + 1}
                totalExercises={exercises.length}
            />

            {/* Exercise card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentExercise.id}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                        className="p-6"
                    >
                        {renderExercise(currentExercise)}
                    </motion.div>
                </AnimatePresence>

                {/* Next button */}
                {exerciseDone && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center"
                    >
                        <motion.button
                            onClick={handleNext}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {currentIndex + 1 >= exercises.length
                                ? 'Se resultater'
                                : 'Neste oppgave'}
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
