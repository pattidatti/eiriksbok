import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, ArrowRight, RotateCcw, Sparkles, Check } from 'lucide-react';

interface TekstVerkstedProps {
    title?: string;
}

type Phase = 'idle' | 'active' | 'complete';

interface Challenge {
    vague: string;
    options: { text: string; score: number }[];
    explanation: string;
}

const CHALLENGES: Challenge[] = [
    {
        vague: 'Jeg er lei meg i dag.',
        options: [
            { text: 'Tårene mine renner som en elv.', score: 1 },
            { text: 'Skoene mine står fortsatt ved døra di.', score: 3 },
            { text: 'Jeg føler meg veldig trist og alene.', score: 0 },
        ],
        explanation:
            'Den konkrete detaljen — skoene ved døra — viser savnet uten å si det direkte. Leseren ser bildet og føler selv.',
    },
    {
        vague: 'Jeg er glad og fri.',
        options: [
            { text: 'Jeg danser gjennom huset med musikken på fullt.', score: 3 },
            { text: 'Hjertet mitt er fullt av lykke.', score: 0 },
            { text: 'Sola skinner og fuglene synger.', score: 1 },
        ],
        explanation:
            'Å danse gjennom huset med musikken på fullt er en handling vi kan se for oss. Det viser gleden i stedet for å bare fortelle om den.',
    },
    {
        vague: 'Tiden går fort.',
        options: [
            { text: 'Dagene flyr avgårde.', score: 0 },
            { text: 'I går var du åtte og mistet en tann. Nå låner du nøklene til bilen.', score: 3 },
            { text: 'Klokka tikker raskere og raskere.', score: 1 },
        ],
        explanation:
            'To konkrete øyeblikk — å miste en tann som barn og å låne bilnøklene — viser tidens gang gjennom ting vi gjenkjenner.',
    },
    {
        vague: 'Jeg savner deg.',
        options: [
            { text: 'Savnet brenner i brystet mitt.', score: 1 },
            { text: 'Jeg tenker på deg hele tiden.', score: 0 },
            { text: 'Koppen din står der du satte den, kaffen er fortsatt kald.', score: 3 },
        ],
        explanation:
            'Den kalde kaffen i koppen forteller oss at noen har gått, uten å si det med et eneste ord. Bildet gjør jobben.',
    },
];

export function TekstVerksted({ title = 'Vis, ikke fortell' }: TekstVerkstedProps) {
    const [phase, setPhase] = useState<Phase>('idle');
    const [step, setStep] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);

    const challenge = CHALLENGES[step];
    const isLast = step === CHALLENGES.length - 1;

    const handleSelect = (idx: number) => {
        if (showFeedback) return;
        setSelected(idx);
        if (phase === 'idle') setPhase('active');
    };

    const handleConfirm = () => {
        if (selected === null) return;
        const pts = challenge.options[selected].score;
        setScore((s) => s + pts);
        setAnswers((a) => [...a, selected]);
        setShowFeedback(true);
    };

    const handleNext = () => {
        if (isLast) {
            setPhase('complete');
        } else {
            setStep((s) => s + 1);
            setSelected(null);
            setShowFeedback(false);
        }
    };

    const handleReset = () => {
        setPhase('idle');
        setStep(0);
        setSelected(null);
        setShowFeedback(false);
        setScore(0);
        setAnswers([]);
    };

    const maxScore = CHALLENGES.length * 3;
    const progressPct = ((step + (showFeedback ? 1 : 0)) / CHALLENGES.length) * 100;

    const getScoreColor = (s: number) => {
        if (s === 3) return 'bg-emerald-50 border-emerald-300 text-emerald-700';
        if (s === 1) return 'bg-amber-50 border-amber-300 text-amber-700';
        return 'bg-rose-50 border-rose-300 text-rose-700';
    };

    const getScoreLabel = (s: number) => {
        if (s === 3) return 'Konkret og bilderik!';
        if (s === 1) return 'Litt bedre, men fortsatt generelt.';
        return 'For generelt — dette forteller i stedet for å vise.';
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <PenLine className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Gjør vage tekstlinjer om til konkrete bilder
                    </p>
                </div>
            </div>

            <div className="px-6 pt-3 pb-1">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-indigo-500 rounded-full"
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                    {step + 1} av {CHALLENGES.length}
                </p>
            </div>

            {phase !== 'complete' ? (
                <div className="p-6">
                    <div className="mb-5 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                            Vag tekstlinje
                        </p>
                        <p className="text-lg text-slate-700 italic">&ldquo;{challenge.vague}&rdquo;</p>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">
                        Hvilken versjon viser følelsen best, uten å si den rett ut?
                    </p>

                    <div className="space-y-2">
                        {challenge.options.map((opt, idx) => {
                            const isSelected = selected === idx;
                            const isRevealed = showFeedback;
                            let border = 'border-slate-200';
                            let bg = 'bg-white hover:bg-slate-50';
                            if (isSelected && !isRevealed) {
                                border = 'border-indigo-400';
                                bg = 'bg-indigo-50';
                            }
                            if (isRevealed) {
                                if (opt.score === 3) {
                                    border = 'border-emerald-400';
                                    bg = 'bg-emerald-50';
                                } else if (isSelected && opt.score < 3) {
                                    border = 'border-amber-300';
                                    bg = 'bg-amber-50';
                                }
                            }
                            return (
                                <motion.button
                                    key={idx}
                                    onClick={() => handleSelect(idx)}
                                    whileTap={!isRevealed ? { scale: 0.98 } : {}}
                                    className={`w-full text-left px-4 py-3 rounded-xl border ${border} ${bg} transition-colors text-sm text-slate-700`}
                                >
                                    <span className="flex items-center gap-2">
                                        {isRevealed && opt.score === 3 && (
                                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        )}
                                        &ldquo;{opt.text}&rdquo;
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        {showFeedback && selected !== null && (
                            <motion.div
                                key="feedback"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mt-4 px-4 py-3 rounded-lg border text-sm ${getScoreColor(challenge.options[selected].score)}`}
                            >
                                <p className="font-medium mb-1">
                                    {getScoreLabel(challenge.options[selected].score)}
                                </p>
                                <p className="opacity-80">{challenge.explanation}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 text-center"
                >
                    <motion.div
                        initial={{ rotate: -20, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    >
                        <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    </motion.div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-1">Ferdig!</h4>
                    <p className="text-slate-600 mb-4">
                        Du fikk {score} av {maxScore} poeng.{' '}
                        {score >= 9
                            ? 'Du har øye for konkrete bilder!'
                            : score >= 6
                              ? 'Bra jobba — du er på rett vei.'
                              : 'Øv mer på å finne de konkrete bildene.'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {CHALLENGES.map((ch, i) => {
                            const chosen = answers[i];
                            const s = chosen !== undefined ? ch.options[chosen].score : 0;
                            const color =
                                s === 3
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : s === 1
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-rose-100 text-rose-700';
                            return (
                                <span
                                    key={i}
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${color}`}
                                >
                                    {i + 1}: {s}/3
                                </span>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            <div className="px-6 pb-5 flex items-center justify-between">
                {phase !== 'complete' && !showFeedback ? (
                    <button
                        onClick={handleConfirm}
                        disabled={selected === null}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                    >
                        Bekreft valg
                    </button>
                ) : phase !== 'complete' ? (
                    <button
                        onClick={handleNext}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        {isLast ? 'Se resultat' : 'Neste'} <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <div />
                )}
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors flex items-center gap-1"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
