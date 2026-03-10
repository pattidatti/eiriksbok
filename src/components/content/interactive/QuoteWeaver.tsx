import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    Quote,
    CheckCircle2,
    XCircle,
    ChevronRight,
    BookOpen,
    Sparkles,
    RotateCcw,
} from 'lucide-react';

interface QuoteMethod {
    type: 'direct' | 'paraphrase' | 'woven';
    template: string;
    correctQuote: string;
    modelAnswer: string;
}

interface Exercise {
    id: string;
    claim: string;
    availableQuotes: string[];
    methods: QuoteMethod[];
}

interface QuoteWeaverProps {
    title?: string;
    sourceText: string;
    sourceAuthor: string;
    exercises: Exercise[];
}

const METHOD_LABELS: Record<string, { label: string; description: string; color: string }> = {
    direct: {
        label: 'Direkte sitat',
        description: 'Bruk forfatterens eksakte ord i anførselstegn',
        color: 'blue',
    },
    paraphrase: {
        label: 'Parafrase',
        description: 'Gjengi innholdet med egne ord',
        color: 'amber',
    },
    woven: {
        label: 'Innvevd sitat',
        description: 'Flett sitatet naturlig inn i din egen setning',
        color: 'emerald',
    },
};

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        text: 'text-blue-700',
        glow: 'shadow-blue-200',
    },
    amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        text: 'text-amber-700',
        glow: 'shadow-amber-200',
    },
    emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
        text: 'text-emerald-700',
        glow: 'shadow-emerald-200',
    },
};

export const QuoteWeaver: React.FC<QuoteWeaverProps> = ({
    title = 'Sitatveveren',
    sourceText,
    sourceAuthor,
    exercises,
}) => {
    const [currentExIdx, setCurrentExIdx] = useState(0);
    const [activeMethodIdx, setActiveMethodIdx] = useState(0);
    const [completedMethods, setCompletedMethods] = useState<Set<string>>(new Set());
    const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);
    const [showModel, setShowModel] = useState(false);
    const [shaking, setShaking] = useState(false);
    const [allDone, setAllDone] = useState(false);

    const exercise = exercises[currentExIdx];
    const method = exercise?.methods[activeMethodIdx];
    const methodKey = exercise ? `${exercise.id}-${method?.type}` : '';

    const isMethodComplete = completedMethods.has(methodKey);

    const totalMethods = useMemo(
        () => exercises.reduce((sum, ex) => sum + ex.methods.length, 0),
        [exercises]
    );
    const progress = completedMethods.size / totalMethods;

    const handleQuoteClick = useCallback(
        (quote: string) => {
            if (isMethodComplete || !method) return;

            setSelectedQuote(quote);

            if (quote === method.correctQuote) {
                setFeedback({ message: 'Riktig! Sitatet passer perfekt.', type: 'success' });
                setCompletedMethods((prev) => {
                    const next = new Set(prev);
                    next.add(methodKey);

                    if (next.size === totalMethods) {
                        setTimeout(() => {
                            setAllDone(true);
                            confetti({
                                particleCount: 120,
                                spread: 80,
                                origin: { y: 0.6 },
                                colors: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'],
                            });
                        }, 400);
                    }
                    return next;
                });
                setShowModel(true);
            } else {
                setFeedback({ message: 'Ikke helt — prøv et annet sitat.', type: 'error' });
                setShaking(true);
                setTimeout(() => setShaking(false), 500);
            }
        },
        [isMethodComplete, method, methodKey, totalMethods]
    );

    const nextMethod = useCallback(() => {
        setFeedback(null);
        setSelectedQuote(null);
        setShowModel(false);

        const currentExMethods = exercises[currentExIdx].methods;
        if (activeMethodIdx < currentExMethods.length - 1) {
            setActiveMethodIdx(activeMethodIdx + 1);
        } else if (currentExIdx < exercises.length - 1) {
            setCurrentExIdx(currentExIdx + 1);
            setActiveMethodIdx(0);
        }
    }, [activeMethodIdx, currentExIdx, exercises]);

    const reset = useCallback(() => {
        setCurrentExIdx(0);
        setActiveMethodIdx(0);
        setCompletedMethods(new Set());
        setSelectedQuote(null);
        setFeedback(null);
        setShowModel(false);
        setAllDone(false);
    }, []);

    const filledTemplate = useMemo(() => {
        if (!method) return '';
        if (isMethodComplete || selectedQuote === method.correctQuote) {
            return method.template.replace('[SITAT]', method.correctQuote);
        }
        return method.template;
    }, [method, isMethodComplete, selectedQuote]);

    if (!exercise || !method) return null;

    const methodColor = METHOD_LABELS[method.type]?.color || 'blue';
    const colors = COLOR_MAP[methodColor];

    return (
        <div className="my-8 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                    <Quote size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Øvelse {currentExIdx + 1} av {exercises.length}
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Fremgang</span>
                    <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-500"
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    />
                </div>
            </div>

            {/* Source text */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <BookOpen size={14} />
                    Kildetekst — {sourceAuthor}
                </div>
                <p className="text-sm leading-relaxed text-slate-700 italic">&laquo;{sourceText}&raquo;</p>
            </div>

            {/* Claim */}
            <div className="mb-4">
                <p className="text-sm font-medium text-slate-600">Din påstand:</p>
                <p className="mt-1 text-slate-800">{exercise.claim}</p>
            </div>

            {/* Method tabs */}
            <div className="mb-4 flex gap-2">
                {exercise.methods.map((m, i) => {
                    const mKey = `${exercise.id}-${m.type}`;
                    const done = completedMethods.has(mKey);
                    const active = i === activeMethodIdx;
                    const info = METHOD_LABELS[m.type];
                    const c = COLOR_MAP[info.color];

                    return (
                        <button
                            key={m.type}
                            onClick={() => {
                                setActiveMethodIdx(i);
                                setFeedback(null);
                                setSelectedQuote(null);
                                setShowModel(false);
                            }}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                active
                                    ? `${c.bg} ${c.border} ${c.text} border`
                                    : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {done && <CheckCircle2 size={14} className="text-emerald-500" />}
                            {info.label}
                        </button>
                    );
                })}
            </div>

            {/* Method description */}
            <p className="mb-4 text-sm text-slate-500 italic">
                {METHOD_LABELS[method.type].description}
            </p>

            {/* Template */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={methodKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        x: shaking ? [0, -6, 6, -4, 4, 0] : 0,
                    }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-6 rounded-xl border-2 p-4 ${
                        isMethodComplete
                            ? `${colors.border} ${colors.bg} shadow-lg ${colors.glow}`
                            : 'border-dashed border-slate-300 bg-white'
                    }`}
                >
                    <p className="text-sm leading-relaxed text-slate-700">
                        {isMethodComplete || selectedQuote === method.correctQuote
                            ? filledTemplate
                            : method.template
                                  .split('[SITAT]')
                                  .map((part, i, arr) =>
                                      i < arr.length - 1 ? (
                                          <React.Fragment key={i}>
                                              {part}
                                              <span
                                                  className={`mx-1 inline-block rounded border-2 border-dashed px-3 py-0.5 text-xs ${colors.border} ${colors.text}`}
                                              >
                                                  ← velg sitat
                                              </span>
                                          </React.Fragment>
                                      ) : (
                                          <React.Fragment key={i}>{part}</React.Fragment>
                                      )
                                  )}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Available quotes */}
            {!isMethodComplete && (
                <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-slate-600">Velg riktig sitat:</p>
                    <div className="flex flex-wrap gap-2">
                        {exercise.availableQuotes.map((q) => (
                            <motion.button
                                key={q}
                                onClick={() => handleQuoteClick(q)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                                    selectedQuote === q && feedback?.type === 'error'
                                        ? 'border-red-300 bg-red-50 text-red-700'
                                        : selectedQuote === q && feedback?.type === 'success'
                                          ? `${colors.border} ${colors.bg} ${colors.text}`
                                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm'
                                }`}
                            >
                                &laquo;{q}&raquo;
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

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

            {/* Model answer */}
            <AnimatePresence>
                {showModel && isMethodComplete && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
                    >
                        <p className="mb-1 text-xs font-medium text-emerald-600">Mønsterformulering:</p>
                        <p className="text-sm text-emerald-800 italic">{method.modelAnswer}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
                >
                    <RotateCcw size={14} />
                    Start på nytt
                </button>

                {isMethodComplete && !allDone && (
                    <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={nextMethod}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg"
                    >
                        Neste
                        <ChevronRight size={14} />
                    </motion.button>
                )}
            </div>

            {/* Completion */}
            <AnimatePresence>
                {allDone && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 via-amber-50 to-emerald-50 p-6 text-center"
                    >
                        <Sparkles className="mx-auto mb-2 text-amber-500" size={28} />
                        <p className="text-lg font-semibold text-slate-800">
                            Mesterlig sitatvev!
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            Du behersker nå direkte sitat, parafrase og innvevd sitat.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuoteWeaver;
