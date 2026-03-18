import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { Exercise, TrueFalseData } from '../../../data/virkemiddelverkstedet/types';

interface TrueFalseExerciseProps {
    exercise: Exercise;
    deviceColor: string;
    onCorrect: (points: number) => void;
    onWrong: () => void;
}

export const TrueFalseExercise = ({ exercise, onCorrect, onWrong }: TrueFalseExerciseProps) => {
    const data = exercise.data as TrueFalseData;
    const [answered, setAnswered] = useState<boolean | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [wrongKey, setWrongKey] = useState(0);

    const handleAnswer = (answer: boolean) => {
        if (answered !== null && answered === data.correct) return; // Already correct

        setAttempts((a) => a + 1);
        setAnswered(answer);

        if (answer === data.correct) {
            onCorrect(attempts === 0 ? 100 : 50);
        } else {
            setWrongKey((k) => k + 1);
            onWrong();
            setTimeout(() => setAnswered(null), 1500);
        }
    };

    const isCorrect = answered === data.correct;

    return (
        <motion.div
            animate={wrongKey > 0 ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            key={wrongKey}
            transition={{ duration: 0.4 }}
        >
            <p className="text-sm font-medium text-slate-500 mb-4">{exercise.instruction}</p>

            <div className="bg-slate-50 rounded-xl p-5 mb-6">
                <p className="text-lg font-medium text-slate-800 leading-relaxed">
                    "{data.statement}"
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <motion.button
                    onClick={() => handleAnswer(true)}
                    disabled={isCorrect}
                    className={`p-5 rounded-xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                        answered === true
                            ? isCorrect
                                ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                                : 'border-red-400 bg-red-50 text-red-800'
                            : isCorrect
                              ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                              : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer text-slate-700'
                    }`}
                    whileHover={!isCorrect ? { scale: 1.02 } : undefined}
                    whileTap={!isCorrect ? { scale: 0.98 } : undefined}
                >
                    <Check className="w-5 h-5" /> Sant
                </motion.button>

                <motion.button
                    onClick={() => handleAnswer(false)}
                    disabled={isCorrect}
                    className={`p-5 rounded-xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                        answered === false
                            ? isCorrect
                                ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                                : 'border-red-400 bg-red-50 text-red-800'
                            : isCorrect
                              ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                              : 'border-slate-200 bg-white hover:border-red-400 hover:bg-red-50 cursor-pointer text-slate-700'
                    }`}
                    whileHover={!isCorrect ? { scale: 1.02 } : undefined}
                    whileTap={!isCorrect ? { scale: 0.98 } : undefined}
                >
                    <X className="w-5 h-5" /> Usant
                </motion.button>
            </div>

            {answered !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-xl border ${
                        isCorrect
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                >
                    <p className="text-sm">
                        {isCorrect ? data.explanation : 'Ikke helt riktig. Tenk en gang til!'}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};
