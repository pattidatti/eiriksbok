import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Eraser } from 'lucide-react';
import type { Exercise, HighlightData } from '../../../data/virkemiddelverkstedet/types';

interface HighlightExerciseProps {
    exercise: Exercise;
    deviceColor: string;
    onCorrect: (points: number) => void;
    onWrong: () => void;
}

export const HighlightExercise = ({ exercise, onCorrect, onWrong }: HighlightExerciseProps) => {
    const data = exercise.data as HighlightData;
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [checked, setChecked] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [showExplanation, setShowExplanation] = useState<string | null>(null);

    const words = useMemo(() => data.text.split(' '), [data.text]);

    const cleanWord = (w: string) => w.replace(/[.,!?;:"""''()]/g, '').toLowerCase();

    // Build a map of which word indices belong to correct ranges
    const correctIndices = useMemo(() => {
        const indices = new Set<number>();
        const explanations = new Map<number, string>();

        data.correctRanges.forEach((range) => {
            const rangeWords = range.words.split(' ');
            // Find this phrase in the text
            for (let i = 0; i <= words.length - rangeWords.length; i++) {
                let match = true;
                for (let j = 0; j < rangeWords.length; j++) {
                    if (cleanWord(words[i + j]) !== cleanWord(rangeWords[j])) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    for (let j = 0; j < rangeWords.length; j++) {
                        indices.add(i + j);
                        explanations.set(i + j, range.explanation);
                    }
                }
            }
        });

        return { indices, explanations };
    }, [words, data.correctRanges]);

    const toggleWord = (index: number) => {
        if (checked) return;
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const checkAnswer = () => {
        setChecked(true);
        setAttempts((a) => a + 1);

        // Check if user found at least one correct range
        const wrongSelected = [...selected].filter((i) => !correctIndices.indices.has(i));
        const missed = [...correctIndices.indices].filter((i) => !selected.has(i));

        if (wrongSelected.length === 0 && missed.length === 0) {
            // Perfect
            const explanation = correctIndices.explanations.values().next().value;
            setShowExplanation(explanation || null);
            onCorrect(attempts === 0 ? 100 : 50);
        } else {
            onWrong();
        }
    };

    const retry = () => {
        setSelected(new Set());
        setChecked(false);
        setShowExplanation(null);
    };

    const isCorrectAnswer = checked && showExplanation !== null;

    return (
        <div>
            <p className="text-sm font-medium text-slate-500 mb-4">{exercise.instruction}</p>

            <div className="flex flex-wrap gap-x-1.5 gap-y-3 text-lg leading-loose font-medium text-slate-700 mb-6 p-4 bg-slate-50 rounded-xl">
                {words.map((word, i) => {
                    const isSelected = selected.has(i);
                    const isCorrect = correctIndices.indices.has(i);

                    let className = 'px-1.5 py-0.5 rounded cursor-pointer border-b-2 transition-all ';

                    if (!checked) {
                        if (isSelected) {
                            className += `bg-indigo-100 border-indigo-400 text-indigo-800`;
                        } else {
                            className += 'border-transparent hover:bg-slate-200';
                        }
                    } else {
                        if (isCorrect && isSelected) {
                            className += 'bg-emerald-100 border-emerald-400 text-emerald-800 ring-2 ring-emerald-300/50';
                        } else if (isCorrect && !isSelected) {
                            className += 'bg-transparent border-dashed border-amber-400 text-slate-400';
                        } else if (!isCorrect && isSelected) {
                            className += 'bg-red-50 border-red-200 text-red-400 line-through';
                        } else {
                            className += 'border-transparent opacity-50';
                        }
                    }

                    return (
                        <motion.span
                            key={i}
                            onClick={() => toggleWord(i)}
                            className={className}
                            whileTap={!checked ? { scale: 0.95 } : undefined}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            {word}
                        </motion.span>
                    );
                })}
            </div>

            {/* Explanation on success */}
            {showExplanation && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4"
                >
                    <p className="text-sm text-emerald-800">{showExplanation}</p>
                </motion.div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
                {!checked ? (
                    <>
                        <button
                            onClick={() => setSelected(new Set())}
                            disabled={selected.size === 0}
                            className="px-4 py-2 text-slate-500 rounded-lg font-medium hover:bg-slate-200 disabled:opacity-0 flex items-center gap-2 transition-all"
                        >
                            <Eraser className="w-4 h-4" /> Nullstill
                        </button>
                        <button
                            onClick={checkAnswer}
                            disabled={selected.size === 0}
                            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all"
                        >
                            <Check className="w-4 h-4" /> Sjekk svar
                        </button>
                    </>
                ) : !isCorrectAnswer ? (
                    <button
                        onClick={retry}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 transition-all"
                    >
                        Prøv igjen
                    </button>
                ) : null}
            </div>
        </div>
    );
};
