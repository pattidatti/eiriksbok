import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import type { LiteraryDevice, DeviceProgress, Level, ApplyLevel, WorkshopMode } from '../../data/virkemiddelverkstedet/types';
import { deviceColorMap } from '../../data/virkemiddelverkstedet/devices';
import { getLevelExerciseCount } from '../../data/virkemiddelverkstedet/exercises';
import { getApplyLevelExerciseCount } from '../../data/virkemiddelverkstedet/exercises/apply';
import { LEVEL_INFO, APPLY_LEVEL_INFO } from '../../data/virkemiddelverkstedet/levels';

interface LevelSelectorProps {
    device: LiteraryDevice;
    mode: WorkshopMode;
    progress: DeviceProgress;
    onSelectLevel: (level: Level | ApplyLevel) => void;
    onBack: () => void;
}

export const LevelSelector = ({ device, mode, progress, onSelectLevel, onBack }: LevelSelectorProps) => {
    const colors = deviceColorMap[device.color];
    const isApply = mode === 'bruk';
    const levelInfo = isApply ? APPLY_LEVEL_INFO : LEVEL_INFO;

    const getLevelCompletedCount = (level: number) => {
        const prefix = isApply ? `apply-${device.id}-${level}-` : `${device.id}-${level}-`;
        return progress.completedExercises.filter((id) => id.startsWith(prefix)).length;
    };

    const getLevelTotal = (level: number) => {
        return isApply
            ? getApplyLevelExerciseCount(device.id, level as ApplyLevel)
            : getLevelExerciseCount(device.id, level as Level);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
        >
            <button
                onClick={onBack}
                className="text-sm text-slate-500 hover:text-slate-800 font-medium mb-4 inline-block transition-colors"
            >
                ← Tilbake til {device.name}
            </button>

            <div className="text-center mb-6">
                <span className="text-4xl mb-2 block">{device.emoji}</span>
                <h2 className="text-2xl font-display font-bold text-slate-900">{device.name}</h2>
                <p className="text-slate-500 mt-1">
                    {isApply ? 'Velg nivå — Bruk virkemiddelet' : 'Velg nivå'}
                </p>
            </div>

            <div className={`grid grid-cols-1 ${isApply ? '' : 'sm:grid-cols-2'} gap-2`}>
                {levelInfo.map(({ level, title, description }, i) => {
                    // In apply mode all levels are unlocked
                    const isUnlocked = isApply ? true : level <= progress.levelUnlocked;
                    const totalForLevel = getLevelTotal(level);
                    const completedForLevel = getLevelCompletedCount(level);
                    const isComplete = totalForLevel > 0 && completedForLevel >= totalForLevel;
                    const hasContent = totalForLevel > 0;

                    return (
                        <motion.button
                            key={level}
                            onClick={() => isUnlocked && hasContent && onSelectLevel(level as Level | ApplyLevel)}
                            disabled={!isUnlocked || !hasContent}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                                !hasContent
                                    ? 'bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed'
                                    : !isUnlocked
                                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                      : isComplete
                                        ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 cursor-pointer hover:shadow-md'
                                        : 'bg-white border-slate-200 hover:border-indigo-400 cursor-pointer hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                            !isUnlocked || !hasContent
                                                ? 'bg-slate-200 text-slate-400'
                                                : isComplete
                                                  ? 'bg-emerald-500 text-white'
                                                  : `${colors.bg} text-white`
                                        }`}
                                    >
                                        {!isUnlocked ? (
                                            <Lock className="w-3.5 h-3.5" />
                                        ) : isComplete ? (
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        ) : (
                                            level
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">{title}</div>
                                        <div className="text-xs text-slate-500">{description}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {isUnlocked && totalForLevel > 0 && (
                                        <span className="text-xs text-slate-400">
                                            {completedForLevel}/{totalForLevel}
                                        </span>
                                    )}
                                    {isUnlocked && hasContent && (
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};
