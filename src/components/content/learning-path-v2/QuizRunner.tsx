import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import type { ComprehensionQuestion } from '../../../types';

interface QuizRunnerProps {
    questions: ComprehensionQuestion[];
    minScore: number; // 0-1
    onPass: (score: number, answers: number[]) => void;
    title?: string;
}

// Gjenbrukbar mini-quiz: presenterer ett spørsmål av gangen, viser feedback,
// og lar eleven prøve igjen hvis hun ikke når minScore.
export const QuizRunner: React.FC<QuizRunnerProps> = ({
    questions,
    minScore,
    onPass,
    title,
}) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [attempt, setAttempt] = useState(1);

    const question = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;

    const handleSelect = (idx: number) => {
        if (showFeedback) return;
        setSelected(idx);
    };

    const handleConfirm = () => {
        if (selected === null) return;
        setShowFeedback(true);
    };

    const handleNext = () => {
        const nextAnswers = [...answers, selected!];
        setAnswers(nextAnswers);
        setSelected(null);
        setShowFeedback(false);

        if (isLast) {
            const correctCount = nextAnswers.filter((a, i) => a === questions[i].correct).length;
            const score = correctCount / questions.length;
            if (score >= minScore) {
                onPass(score, nextAnswers);
            } else {
                // Reset for ny runde
                setAttempt(attempt + 1);
                setCurrentIdx(0);
                setAnswers([]);
            }
        } else {
            setCurrentIdx(currentIdx + 1);
        }
    };

    const isCorrect = selected !== null && selected === question.correct;
    const correctCountSoFar = answers.filter((a, i) => a === questions[i].correct).length;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
            {title && (
                <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
            )}
            <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-slate-500">
                    Spørsmål {currentIdx + 1} av {questions.length}
                    {attempt > 1 && ` · Forsøk ${attempt}`}
                </span>
                <span className="text-xs font-mono text-slate-500">
                    Riktig så langt: {correctCountSoFar}/{currentIdx + (showFeedback ? 1 : 0)}
                </span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIdx + '-' + attempt}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                >
                    <p className="text-lg font-semibold text-slate-800 mb-5">{question.question}</p>

                    <div className="space-y-2 mb-5">
                        {question.options.map((opt, i) => {
                            const isSelected = selected === i;
                            const isCorrectOpt = i === question.correct;
                            let cls =
                                'w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm md:text-base ';
                            if (showFeedback) {
                                if (isCorrectOpt) {
                                    cls += 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold';
                                } else if (isSelected) {
                                    cls += 'border-rose-400 bg-rose-50 text-rose-900';
                                } else {
                                    cls += 'border-slate-200 bg-white text-slate-500';
                                }
                            } else if (isSelected) {
                                cls += 'border-indigo-500 bg-indigo-50 text-indigo-900 font-semibold';
                            } else {
                                cls += 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50';
                            }
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleSelect(i)}
                                    disabled={showFeedback}
                                    className={cls}
                                >
                                    <span className="font-mono text-xs mr-3 text-slate-400">
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {showFeedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-xl p-4 mb-4 ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}
                        >
                            <div className="flex items-start gap-3">
                                {isCorrect ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className={`font-bold text-sm ${isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                                        {isCorrect ? 'Riktig!' : 'Ikke helt.'}
                                    </p>
                                    {question.explanation && (
                                        <p className={`text-sm mt-1 ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                                            {question.explanation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="flex justify-end">
                        {!showFeedback ? (
                            <button
                                onClick={handleConfirm}
                                disabled={selected === null}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
                            >
                                Sjekk svar
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow hover:bg-slate-800 transition"
                            >
                                {isLast ? 'Fullfør' : 'Neste'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
