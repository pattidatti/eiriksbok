import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Exercise, FillBlankData } from '../../../data/virkemiddelverkstedet/types';

interface FillBlankExerciseProps {
    exercise: Exercise;
    deviceColor: string;
    onCorrect: (points: number) => void;
    onWrong: () => void;
}

export const FillBlankExercise = ({ exercise, onCorrect, onWrong }: FillBlankExerciseProps) => {
    const data = exercise.data as FillBlankData;
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [wrongKey, setWrongKey] = useState(0);

    const checkAnswer = () => {
        const normalized = answer.trim().toLowerCase();
        const isCorrect = data.correctAnswers.some(
            (a) => a.toLowerCase() === normalized
        );

        setAttempts((a) => a + 1);

        if (isCorrect) {
            setFeedback({ correct: true, text: data.explanation });
            onCorrect(attempts === 0 ? 100 : 50);
        } else {
            setFeedback({ correct: false, text: `Ikke helt. Prøv igjen!` });
            setWrongKey((k) => k + 1);
            onWrong();
            setTimeout(() => {
                setFeedback(null);
                setAnswer('');
            }, 1500);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && answer.trim()) {
            checkAnswer();
        }
    };

    return (
        <motion.div
            animate={wrongKey > 0 ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            key={wrongKey}
            transition={{ duration: 0.4 }}
        >
            <p className="text-sm font-medium text-slate-500 mb-4">{exercise.instruction}</p>

            <div className="bg-slate-50 rounded-xl p-5 mb-4">
                <p className="text-lg font-medium text-slate-800 leading-relaxed">
                    {data.textBefore}
                    <span className="inline-flex items-center mx-1">
                        {feedback?.correct ? (
                            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg font-bold border border-emerald-300">
                                {answer}
                            </span>
                        ) : (
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="____"
                                className="w-32 px-3 py-1 border-2 border-dashed border-indigo-300 rounded-lg text-center font-bold text-indigo-700 bg-white focus:border-indigo-500 focus:outline-none"
                                autoFocus
                            />
                        )}
                    </span>
                    {data.textAfter}
                </p>
            </div>

            {!feedback?.correct && (
                <div className="flex justify-end">
                    <button
                        onClick={checkAnswer}
                        disabled={!answer.trim()}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Sjekk svar
                    </button>
                </div>
            )}

            {feedback && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-xl border flex items-start gap-2 ${
                        feedback.correct
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                >
                    {feedback.correct ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm">{feedback.text}</p>
                </motion.div>
            )}
        </motion.div>
    );
};
