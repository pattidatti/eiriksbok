import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Users, RotateCcw, Check, X } from 'lucide-react';

interface Challenge {
    id: string;
    scenario: string;
    peopleCount: string;
    visualPeople: number;
    correctGlue: string;
    explanation: string;
}

interface GlueOption {
    id: string;
    label: string;
    scale: string;
}

const GLUE_OPTIONS: GlueOption[] = [
    { id: 'venner', label: 'Personlig vennskap', scale: '5–10 personer' },
    { id: 'slekt', label: 'Slekt og stamme', scale: '50–150 personer' },
    { id: 'myte', label: 'Felles myte eller religion', scale: 'tusenvis' },
    { id: 'penger', label: 'Felles tro på penger og lover', scale: 'milliarder' },
];

const CHALLENGES: Challenge[] = [
    {
        id: 'hytte',
        scenario: 'Du og fire kompiser skal bygge en hytte i skogen.',
        peopleCount: '5 personer',
        visualPeople: 5,
        correctGlue: 'venner',
        explanation:
            'Når dere er få, holder det å kjenne hverandre. Dere kan snakke direkte og bli enige med en gang.',
    },
    {
        id: 'stamme',
        scenario: 'Hundre mennesker skal jakte mammut sammen i istiden.',
        peopleCount: '100 personer',
        visualPeople: 12,
        correctGlue: 'slekt',
        explanation:
            'En stamme er familie og kjente ansikter. Du stoler på dem fordi dere har vokst opp sammen og har felles forfedre.',
    },
    {
        id: 'pyramide',
        scenario: 'Ti tusen mennesker skal bygge en pyramide i Egypt.',
        peopleCount: '10 000 personer',
        visualPeople: 30,
        correctGlue: 'myte',
        explanation:
            'Så mange kan ikke kjenne hverandre. Men de tror på den samme guden — faraoen må få et evig hjem. Myten binder dem sammen.',
    },
    {
        id: 'marked',
        scenario: 'En million fremmede handler varer i samme by hver dag.',
        peopleCount: '1 000 000 personer',
        visualPeople: 60,
        correctGlue: 'penger',
        explanation:
            'Ingen kjenner alle. Men alle tror på det samme: at en seddel er verdt noe. Penger er felles fiksjon som virker.',
    },
];

type Phase = 'idle' | 'active' | 'complete';

interface FeedbackState {
    glueId: string;
    correct: boolean;
}

export function FiksjonensKraft({ title = 'Hva binder mennesker sammen?' }: { title?: string }) {
    const [phase, setPhase] = useState<Phase>('idle');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [solved, setSolved] = useState<Set<number>>(new Set());
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);

    const challenge = CHALLENGES[currentIndex];
    const isLast = solved.size === CHALLENGES.length - 1;

    const handleGlueClick = (glueId: string) => {
        if (phase === 'complete') return;
        if (feedback?.correct) return;
        if (phase === 'idle') setPhase('active');

        const correct = glueId === challenge.correctGlue;
        setFeedback({ glueId, correct });

        if (correct) {
            const next = new Set(solved);
            next.add(currentIndex);
            setSolved(next);

            if (isLast) {
                setTimeout(() => setPhase('complete'), 900);
            }
        }
    };

    const handleNext = () => {
        const nextIdx = CHALLENGES.findIndex((_, i) => !solved.has(i) && i !== currentIndex);
        if (nextIdx !== -1) {
            setCurrentIndex(nextIdx);
            setFeedback(null);
        }
    };

    const handleReset = () => {
        setPhase('idle');
        setCurrentIndex(0);
        setSolved(new Set());
        setFeedback(null);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg hva som limer menneskene sammen i hvert eksempel.
                    </p>
                </div>
                <div className="flex gap-1.5">
                    {CHALLENGES.map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                backgroundColor: solved.has(i) ? '#10b981' : '#e2e8f0',
                                scale: solved.has(i) ? 1.1 : 1,
                            }}
                            className="w-2.5 h-2.5 rounded-full"
                        />
                    ))}
                </div>
            </div>

            <div className="p-6 bg-slate-50">
                {phase !== 'complete' && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={challenge.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600">
                                    <Users className="w-3.5 h-3.5" />
                                    {challenge.peopleCount}
                                </div>
                            </div>

                            <p className="text-lg text-slate-800 font-medium mb-4">
                                {challenge.scenario}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mb-5 min-h-[3rem]">
                                {Array.from({ length: challenge.visualPeople }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.02, duration: 0.2 }}
                                        className="w-5 h-5 rounded-full bg-indigo-200 border border-indigo-300"
                                    />
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {GLUE_OPTIONS.map((opt) => {
                                    const isSelected = feedback?.glueId === opt.id;
                                    const isCorrect = isSelected && feedback?.correct;
                                    const isWrong = isSelected && !feedback?.correct;

                                    return (
                                        <motion.button
                                            key={opt.id}
                                            whileHover={{ scale: feedback?.correct ? 1 : 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleGlueClick(opt.id)}
                                            disabled={feedback?.correct === true}
                                            className={`text-left px-4 py-3 rounded-lg border transition-colors ${
                                                isCorrect
                                                    ? 'bg-emerald-50 border-emerald-300'
                                                    : isWrong
                                                      ? 'bg-rose-50 border-rose-300'
                                                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                                            } ${feedback?.correct ? 'cursor-default' : 'cursor-pointer'}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="font-medium text-slate-800 text-sm">
                                                        {opt.label}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        Fungerer for {opt.scale}
                                                    </div>
                                                </div>
                                                {isCorrect && (
                                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                )}
                                                {isWrong && (
                                                    <X className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                                                )}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}

                {phase === 'complete' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="text-center py-6"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                            className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center mb-4"
                        >
                            <Lightbulb className="w-8 h-8 text-amber-600" />
                        </motion.div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">
                            Du har funnet menneskets superkraft
                        </h4>
                        <p className="text-slate-600 max-w-md mx-auto">
                            Vi er den eneste arten som kan oppfinne historier — guder, lover,
                            penger, nasjoner — og få millioner av fremmede til å samarbeide rundt
                            dem. Det er denne evnen som lar oss bygge byer, sende raketter og
                            samles om felles drømmer.
                        </p>
                    </motion.div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {feedback && (
                    <motion.div
                        key={`${currentIndex}-${feedback.glueId}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mx-6 mb-4 px-4 py-3 rounded-lg border text-sm ${
                            feedback.correct
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                    >
                        {feedback.correct ? challenge.explanation : 'Ikke helt. Prøv igjen — tenk på hvor mange mennesker som er involvert.'}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                {phase !== 'complete' && feedback?.correct && !isLast ? (
                    <button
                        onClick={handleNext}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                    >
                        Neste utfordring
                    </button>
                ) : (
                    <span className="text-sm text-slate-400">
                        {phase === 'complete'
                            ? 'Alle løst!'
                            : `Utfordring ${solved.size + 1} av ${CHALLENGES.length}`}
                    </span>
                )}
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
