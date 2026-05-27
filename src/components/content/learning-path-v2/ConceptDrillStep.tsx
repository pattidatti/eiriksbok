import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, BookOpen, ArrowRight } from 'lucide-react';
import type { StepRendererProps } from './types';

// Concept-drill: viser en definisjon, eleven velger riktig begrep blant 4
// alternativer (én riktig + tre distraktorer fra samme drill-sett). Når alle
// begrepene er gått gjennom, må eleven nå minScore for å fullføre - ellers
// startes runden på nytt.

interface DrillCard {
    term: string;
    definition: string;
}

function shuffleStable<T>(arr: T[], seed: number): T[] {
    const copy = [...arr];
    let s = seed || 1;
    for (let i = copy.length - 1; i > 0; i--) {
        s = (s * 9301 + 49297) % 233280;
        const j = Math.floor((s / 233280) * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export const ConceptDrillStep: React.FC<StepRendererProps> = ({ step, onComplete }) => {
    const drills: DrillCard[] = useMemo(() => step.conceptDrills ?? [], [step.conceptDrills]);
    const minScore = step.completion.minScore ?? 0.7;

    const [attempt, setAttempt] = useState(1);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    // Generer 4 alternativer per spørsmål (deterministisk pr. attempt+idx)
    const optionsByIndex = useMemo(() => {
        if (drills.length === 0) return [];
        return drills.map((card, idx) => {
            const otherTerms = drills
                .filter((_, i) => i !== idx)
                .map((d) => d.term);
            const distractors = shuffleStable(otherTerms, attempt * 31 + idx).slice(0, 3);
            return shuffleStable([card.term, ...distractors], attempt * 17 + idx);
        });
    }, [drills, attempt]);

    if (drills.length === 0) {
        return (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-900 text-sm">
                Konfigurasjonsfeil: concept-drill uten conceptDrills.
            </div>
        );
    }

    const card = drills[currentIdx];
    const options = optionsByIndex[currentIdx] ?? [];
    const isLast = currentIdx === drills.length - 1;
    const isCorrect = selected === card.term;

    const handleConfirm = () => {
        if (!selected || showFeedback) return;
        setShowFeedback(true);
        if (selected === card.term) {
            setCorrectCount((c) => c + 1);
        }
    };

    const handleNext = () => {
        const finalCorrect = correctCount; // bekreftet før dette ble lagt til
        setShowFeedback(false);
        setSelected(null);

        if (isLast) {
            const score = finalCorrect / drills.length;
            if (score >= minScore) {
                onComplete({ score, completed: true });
            } else {
                // Reset for ny runde
                setAttempt(attempt + 1);
                setCurrentIdx(0);
                setCorrectCount(0);
            }
        } else {
            setCurrentIdx(currentIdx + 1);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
                        Begrepsdrill
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Begrep {currentIdx + 1} av {drills.length}
                        {attempt > 1 && ` - Forsøk ${attempt}`} - Riktig: {correctCount}/{currentIdx + (showFeedback ? 1 : 0)}
                    </p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${attempt}-${currentIdx}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                >
                    <div className="bg-slate-50 rounded-xl p-5 mb-5 border border-slate-100">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                            Hvilket begrep matcher denne definisjonen?
                        </p>
                        <p className="text-slate-800 leading-relaxed">{card.definition}</p>
                    </div>

                    <div className="space-y-2 mb-5">
                        {options.map((opt) => {
                            const isSel = selected === opt;
                            const isRight = opt === card.term;
                            let cls =
                                'w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm md:text-base ';
                            if (showFeedback) {
                                if (isRight) {
                                    cls += 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold';
                                } else if (isSel) {
                                    cls += 'border-rose-400 bg-rose-50 text-rose-900';
                                } else {
                                    cls += 'border-slate-200 bg-white text-slate-500';
                                }
                            } else if (isSel) {
                                cls += 'border-teal-500 bg-teal-50 text-teal-900 font-semibold';
                            } else {
                                cls += 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/50';
                            }
                            return (
                                <button
                                    key={opt}
                                    onClick={() => !showFeedback && setSelected(opt)}
                                    disabled={showFeedback}
                                    className={cls}
                                >
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
                                        {isCorrect ? 'Riktig!' : `Det var ${card.term}.`}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="flex justify-end">
                        {!showFeedback ? (
                            <button
                                onClick={handleConfirm}
                                disabled={!selected}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-teal-700 transition"
                            >
                                Sjekk svar
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow hover:bg-slate-800 transition"
                            >
                                {isLast ? 'Fullfør drill' : 'Neste begrep'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
