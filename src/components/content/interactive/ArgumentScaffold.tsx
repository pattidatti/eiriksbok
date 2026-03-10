import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    TrendingUp,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    XCircle,
    Play,
    RotateCcw,
    Trophy,
} from 'lucide-react';

interface Level {
    id: string;
    name: string;
    color: string;
    example: string;
    explanation: string;
    additions: string[];
}

interface ClimbAddition {
    id: string;
    text: string;
    correctLevel: number;
    feedback: string;
}

interface ClimbMode {
    baseText: string;
    additions: ClimbAddition[];
}

interface ArgumentScaffoldProps {
    title?: string;
    topic: string;
    levels: Level[];
    climbMode?: ClimbMode;
}

const LEVEL_COLORS: Record<
    string,
    {
        bg: string;
        border: string;
        text: string;
        badge: string;
        gradient: string;
        glow: string;
        step: string;
    }
> = {
    red: {
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-700',
        gradient: 'from-red-400 to-red-500',
        glow: 'shadow-red-200',
        step: 'bg-red-400',
    },
    yellow: {
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
        gradient: 'from-amber-400 to-amber-500',
        glow: 'shadow-amber-200',
        step: 'bg-amber-400',
    },
    green: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-700',
        gradient: 'from-emerald-400 to-emerald-500',
        glow: 'shadow-emerald-200',
        step: 'bg-emerald-400',
    },
    gold: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-400',
        text: 'text-yellow-800',
        badge: 'bg-yellow-100 text-yellow-800',
        gradient: 'from-yellow-400 to-amber-500',
        glow: 'shadow-yellow-300',
        step: 'bg-yellow-400',
    },
};

export const ArgumentScaffold: React.FC<ArgumentScaffoldProps> = ({
    title = 'Argumentstigen',
    topic,
    levels,
    climbMode,
}) => {
    const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
    const [isClimbing, setIsClimbing] = useState(false);
    const [climbProgress, setClimbProgress] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [usedAdditions, setUsedAdditions] = useState<Set<string>>(new Set());
    const [feedback, setFeedback] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);
    const [climbComplete, setClimbComplete] = useState(false);

    const startClimb = useCallback(() => {
        if (!climbMode) return;
        setIsClimbing(true);
        setClimbProgress(0);
        setCurrentText(climbMode.baseText);
        setUsedAdditions(new Set());
        setFeedback(null);
        setClimbComplete(false);
        setExpandedLevel(null);
    }, [climbMode]);

    const availableAdditions = useMemo(() => {
        if (!climbMode) return [];
        return climbMode.additions.filter((a) => !usedAdditions.has(a.id));
    }, [climbMode, usedAdditions]);

    const handleAdditionClick = useCallback(
        (addition: ClimbAddition) => {
            if (climbComplete) return;

            const targetLevel = climbProgress + 1;

            if (addition.correctLevel === targetLevel) {
                const newText = currentText + ' ' + addition.text;
                setCurrentText(newText);
                setUsedAdditions((prev) => new Set(prev).add(addition.id));
                setFeedback({ message: addition.feedback, type: 'success' });

                const newProgress = targetLevel;
                setClimbProgress(newProgress);

                if (newProgress >= levels.length - 1) {
                    setTimeout(() => {
                        setClimbComplete(true);
                        confetti({
                            particleCount: 150,
                            spread: 90,
                            origin: { y: 0.4 },
                            colors: ['#f59e0b', '#10b981', '#3b82f6', '#eab308'],
                        });
                    }, 300);
                }
            } else {
                setFeedback({ message: addition.feedback, type: 'error' });
            }
        },
        [climbProgress, currentText, climbComplete, levels.length]
    );

    const resetClimb = useCallback(() => {
        setIsClimbing(false);
        setClimbProgress(0);
        setCurrentText('');
        setUsedAdditions(new Set());
        setFeedback(null);
        setClimbComplete(false);
    }, []);

    const toggleLevel = useCallback(
        (levelId: string) => {
            if (isClimbing) return;
            setExpandedLevel(expandedLevel === levelId ? null : levelId);
        },
        [expandedLevel, isClimbing]
    );

    return (
        <div className="my-8 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            {/* Header */}
            <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{topic}</p>
                </div>
            </div>

            <p className="mb-6 text-sm text-slate-500">
                Klikk på hvert nivå for å se forskjellen — fra enkel gjenfortelling til sterk
                drøfting.
            </p>

            {/* Staircase visualization */}
            <div className="relative mb-6 flex flex-col-reverse gap-2">
                {levels.map((level, i) => {
                    const colors = LEVEL_COLORS[level.color] || LEVEL_COLORS.yellow;
                    const isExpanded = expandedLevel === level.id;
                    const isReached =
                        isClimbing && i <= climbProgress;
                    const isCurrent = isClimbing && i === climbProgress;

                    return (
                        <motion.div
                            key={level.id}
                            layout
                            onClick={() => toggleLevel(level.id)}
                            className={`cursor-pointer rounded-xl border-2 transition-all ${
                                isReached
                                    ? `${colors.border} ${colors.bg} shadow-lg ${colors.glow}`
                                    : isExpanded
                                      ? `${colors.border} ${colors.bg}`
                                      : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                            style={{ marginLeft: `${i * 16}px` }}
                        >
                            <div className="flex items-center gap-3 p-3">
                                {/* Step indicator */}
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${
                                        isReached
                                            ? `bg-gradient-to-br ${colors.gradient}`
                                            : 'bg-slate-300'
                                    }`}
                                >
                                    {isReached && i <= climbProgress ? (
                                        <CheckCircle2 size={16} />
                                    ) : (
                                        i + 1
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                                                isReached || isExpanded
                                                    ? colors.badge
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {level.name}
                                        </span>
                                        {isCurrent && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-xs text-emerald-600 font-medium"
                                            >
                                                ← du er her
                                            </motion.span>
                                        )}
                                    </div>
                                </div>

                                {!isClimbing && (
                                    <div className="text-slate-400">
                                        {isExpanded ? (
                                            <ChevronUp size={16} />
                                        ) : (
                                            <ChevronDown size={16} />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Expanded content */}
                            <AnimatePresence>
                                {(isExpanded || isReached) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-slate-100 px-3 pb-3 pt-2">
                                            <p className="mb-2 text-sm leading-relaxed text-slate-700 italic">
                                                &laquo;{level.example}&raquo;
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {level.explanation}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Climb mode controls */}
            {climbMode && !isClimbing && (
                <motion.button
                    onClick={startClimb}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-3 font-medium text-white shadow-md hover:shadow-lg"
                >
                    <Play size={18} />
                    Start klatringen
                </motion.button>
            )}

            {/* Climbing interface */}
            <AnimatePresence>
                {isClimbing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        {/* Current built text */}
                        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-1 text-xs font-medium text-slate-500">
                                Din analyse hittil:
                            </p>
                            <p className="text-sm leading-relaxed text-slate-700">
                                {currentText}
                            </p>
                        </div>

                        {/* Feedback */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                                        feedback.type === 'success'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-red-50 text-red-700'
                                    }`}
                                >
                                    {feedback.type === 'success' ? (
                                        <CheckCircle2 size={16} />
                                    ) : (
                                        <XCircle size={16} />
                                    )}
                                    {feedback.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Additions pool */}
                        {!climbComplete && (
                            <div className="mb-4">
                                <p className="mb-2 text-sm font-medium text-slate-600">
                                    Velg neste tillegg for å klatre til nivå{' '}
                                    {levels[climbProgress + 1]?.name || 'toppen'}:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {availableAdditions.map((a) => (
                                        <motion.button
                                            key={a.id}
                                            onClick={() => handleAdditionClick(a)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition-all hover:border-amber-300 hover:shadow-sm"
                                        >
                                            {a.text}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reset */}
                        <button
                            onClick={resetClimb}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
                        >
                            <RotateCcw size={14} />
                            Prøv på nytt
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completion */}
            <AnimatePresence>
                {climbComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 rounded-xl bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 p-6 text-center"
                    >
                        <Trophy className="mx-auto mb-2 text-yellow-500" size={32} />
                        <p className="text-lg font-semibold text-slate-800">
                            Du nådde toppen!
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            Fra gjenfortelling til drøfting — du ser nå forskjellen mellom svak og
                            sterk analyse.
                        </p>
                        <div className="mt-4 rounded-lg border border-emerald-200 bg-white/80 p-3 text-left">
                            <p className="mb-1 text-xs font-medium text-emerald-600">
                                Din ferdige analyse:
                            </p>
                            <p className="text-sm leading-relaxed text-slate-700 italic">
                                {currentText}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArgumentScaffold;
