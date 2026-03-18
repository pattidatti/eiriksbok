import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Exercise, IdentifyData } from '../../../data/virkemiddelverkstedet/types';

interface IdentifyExerciseProps {
    exercise: Exercise;
    deviceColor: string;
    onCorrect: (points: number) => void;
    onWrong: () => void;
}

export const IdentifyExercise = ({ exercise, onCorrect, onWrong }: IdentifyExerciseProps) => {
    const data = exercise.data as IdentifyData;
    const [selected, setSelected] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [wrongKey, setWrongKey] = useState(0);

    const handleSelect = (option: (typeof data.options)[number], index: number) => {
        if (feedback?.correct) return; // Already answered correctly

        setSelected(index);
        setAttempts((a) => a + 1);

        if (option.correct) {
            setFeedback({ text: option.feedback, correct: true });
            onCorrect(attempts === 0 ? 100 : 50);
        } else {
            setFeedback({ text: option.feedback, correct: false });
            setWrongKey((k) => k + 1);
            onWrong();
            // Reset after showing feedback
            setTimeout(() => {
                setSelected(null);
                setFeedback(null);
            }, 2000);
        }
    };

    return (
        <motion.div
            animate={
                wrongKey > 0
                    ? { x: [0, -8, 8, -6, 6, 0] }
                    : { x: 0 }
            }
            key={wrongKey}
            transition={{ duration: 0.4 }}
        >
            <p className="text-sm font-medium text-slate-500 mb-4">{exercise.instruction}</p>

            {/* Text to analyze */}
            <div className="bg-slate-50 rounded-xl p-5 mb-6">
                <p className="text-lg font-medium text-slate-800 leading-relaxed italic">
                    "{data.text}"
                </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
                {data.options.map((option, index) => {
                    const isSelected = selected === index;
                    const showResult = isSelected && feedback;

                    return (
                        <motion.button
                            key={index}
                            onClick={() => handleSelect(option, index)}
                            disabled={feedback?.correct === true}
                            className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${
                                showResult
                                    ? feedback.correct
                                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                                        : 'border-red-400 bg-red-50 text-red-800'
                                    : feedback?.correct
                                      ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                                      : 'border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md cursor-pointer text-slate-700'
                            }`}
                            whileHover={!feedback?.correct ? { scale: 1.02 } : undefined}
                            whileTap={!feedback?.correct ? { scale: 0.98 } : undefined}
                        >
                            <div className="flex items-center gap-2">
                                {showResult && feedback.correct && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                )}
                                {showResult && !feedback.correct && (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                )}
                                {option.label}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Feedback */}
            {feedback && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-xl border ${
                        feedback.correct
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                >
                    <p className="text-sm">{feedback.text}</p>
                </motion.div>
            )}
        </motion.div>
    );
};
