import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Exercise, ExplainData } from '../../../data/virkemiddelverkstedet/types';
import { deviceColorMap } from '../../../data/virkemiddelverkstedet/devices';

interface ExplainExerciseProps {
    exercise: Exercise;
    deviceColor: string;
    onCorrect: (points: number) => void;
    onWrong: () => void;
}

export const ExplainExercise = ({ exercise, deviceColor, onCorrect, onWrong }: ExplainExerciseProps) => {
    const data = exercise.data as ExplainData;
    const colors = deviceColorMap[deviceColor];
    const [selected, setSelected] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [wrongKey, setWrongKey] = useState(0);

    // Highlight the specified words in the text
    const highlightedText = useMemo(() => {
        const hlWords = data.highlightedWords.toLowerCase();
        const textLower = data.text.toLowerCase();
        const idx = textLower.indexOf(hlWords);
        if (idx === -1) return data.text;

        const before = data.text.slice(0, idx);
        const highlighted = data.text.slice(idx, idx + hlWords.length);
        const after = data.text.slice(idx + hlWords.length);

        return { before, highlighted, after };
    }, [data.text, data.highlightedWords]);

    const handleSelect = (index: number) => {
        if (feedback?.correct) return;

        const option = data.options[index];
        setSelected(index);
        setAttempts((a) => a + 1);

        if (option.correct) {
            setFeedback({ text: option.feedback, correct: true });
            onCorrect(attempts === 0 ? 100 : 50);
        } else {
            setFeedback({ text: option.feedback, correct: false });
            setWrongKey((k) => k + 1);
            onWrong();
            setTimeout(() => {
                setSelected(null);
                setFeedback(null);
            }, 2500);
        }
    };

    return (
        <motion.div
            animate={wrongKey > 0 ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            key={wrongKey}
            transition={{ duration: 0.4 }}
        >
            <p className="text-sm font-medium text-slate-500 mb-4">{exercise.instruction}</p>

            {/* Text with highlighted section */}
            <div className="bg-slate-50 rounded-xl p-5 mb-4">
                <p className="text-lg font-medium text-slate-800 leading-relaxed">
                    {typeof highlightedText === 'string' ? (
                        highlightedText
                    ) : (
                        <>
                            {highlightedText.before}
                            <span className={`${colors?.light || 'bg-indigo-100'} px-1 py-0.5 rounded font-bold ${colors?.text || 'text-indigo-700'}`}>
                                {highlightedText.highlighted}
                            </span>
                            {highlightedText.after}
                        </>
                    )}
                </p>
            </div>

            {/* Question */}
            <p className="font-bold text-slate-800 mb-3">{data.question}</p>

            {/* Options */}
            <div className="space-y-2">
                {data.options.map((option, i) => {
                    const isSelected = selected === i;
                    const showResult = isSelected && feedback;

                    return (
                        <motion.button
                            key={i}
                            onClick={() => handleSelect(i)}
                            disabled={feedback?.correct === true}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                showResult
                                    ? feedback.correct
                                        ? 'border-emerald-400 bg-emerald-50'
                                        : 'border-red-400 bg-red-50'
                                    : feedback?.correct
                                      ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                                      : 'border-slate-200 bg-white hover:border-indigo-400 hover:shadow-sm cursor-pointer'
                            }`}
                            whileHover={!feedback?.correct ? { scale: 1.01 } : undefined}
                            whileTap={!feedback?.correct ? { scale: 0.99 } : undefined}
                        >
                            <div className="flex items-start gap-2">
                                {showResult && feedback.correct && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                )}
                                {showResult && !feedback.correct && (
                                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium text-slate-700">{option.text}</span>
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
