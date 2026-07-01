import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crown,
    Globe2,
    ScrollText,
    Landmark,
    Shield,
    Scale,
    Coins,
    Users,
    Check,
    X,
    Sparkles,
    RotateCcw,
} from 'lucide-react';

// Signaturkomponent til artikkelen "Unionen med Sverige".
// Lyspære-øyeblikket: Norge delte BARE kongen og utenrikspolitikken med Sverige.
// Alt annet - grunnlov, storting, hær, lover, penger, regjering - var Norges eget.
// Derfor het det personalunion: bare personen (kongen) var felles.

type Side = 'delt' | 'eget';

interface Institution {
    id: string;
    label: string;
    hint: string;
    correct: Side;
    Icon: typeof Crown;
}

const INSTITUTIONS: Institution[] = [
    { id: 'konge', label: 'Kongen', hint: 'Én konge styrte begge land', correct: 'delt', Icon: Crown },
    {
        id: 'utenriks',
        label: 'Utenrikspolitikken',
        hint: 'Sverige talte for begge land ute i verden',
        correct: 'delt',
        Icon: Globe2,
    },
    {
        id: 'grunnlov',
        label: 'Grunnloven',
        hint: 'Norge beholdt sin egen fra 1814',
        correct: 'eget',
        Icon: ScrollText,
    },
    { id: 'storting', label: 'Stortinget', hint: 'Norges egen folkevalgte forsamling', correct: 'eget', Icon: Landmark },
    { id: 'haer', label: 'Hæren', hint: 'Norge hadde sine egne soldater', correct: 'eget', Icon: Shield },
    { id: 'lover', label: 'Lovene', hint: 'Norske lover gjaldt i Norge', correct: 'eget', Icon: Scale },
    { id: 'penger', label: 'Pengene', hint: 'Norge hadde sin egen mynt', correct: 'eget', Icon: Coins },
    {
        id: 'regjering',
        label: 'Regjeringen',
        hint: 'Norge styrte sine egne saker hjemme',
        correct: 'eget',
        Icon: Users,
    },
];

interface PersonalunionSorterProps {
    title?: string;
}

type Phase = 'sorting' | 'checked';

export function PersonalunionSorter({ title = 'Delt med Sverige, eller Norges eget?' }: PersonalunionSorterProps) {
    const [choices, setChoices] = useState<Record<string, Side>>({});
    const [phase, setPhase] = useState<Phase>('sorting');

    const allAnswered = Object.keys(choices).length === INSTITUTIONS.length;
    const correctCount = useMemo(
        () => INSTITUTIONS.filter((i) => choices[i.id] === i.correct).length,
        [choices]
    );
    const allCorrect = phase === 'checked' && correctCount === INSTITUTIONS.length;

    const assign = (id: string, side: Side) => {
        if (phase === 'checked') return;
        setChoices((prev) => ({ ...prev, [id]: side }));
    };

    const check = () => {
        if (allAnswered) setPhase('checked');
    };

    const reset = () => {
        setChoices({});
        setPhase('sorting');
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden not-prose">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 leading-tight">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg for hver del av staten: styrte Norge og Sverige den sammen, eller hadde Norge sin egen?
                    </p>
                </div>
            </div>

            {/* Interaksjonsflate */}
            <div className="p-4 sm:p-5 space-y-2">
                {INSTITUTIONS.map((inst) => {
                    const picked = choices[inst.id];
                    const isCorrect = phase === 'checked' && picked === inst.correct;
                    const isWrong = phase === 'checked' && picked !== undefined && picked !== inst.correct;
                    return (
                        <div
                            key={inst.id}
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                                isCorrect
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : isWrong
                                      ? 'bg-rose-50 border-rose-200'
                                      : 'bg-slate-50 border-slate-200'
                            }`}
                        >
                            <inst.Icon
                                className={`w-5 h-5 flex-shrink-0 ${
                                    isCorrect ? 'text-emerald-500' : isWrong ? 'text-rose-500' : 'text-slate-400'
                                }`}
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-800 leading-tight">{inst.label}</p>
                                <p className="text-xs text-slate-500 leading-tight truncate">{inst.hint}</p>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                                <SideButton
                                    active={picked === 'delt'}
                                    onClick={() => assign(inst.id, 'delt')}
                                    label="Delt"
                                />
                                <SideButton
                                    active={picked === 'eget'}
                                    onClick={() => assign(inst.id, 'eget')}
                                    label="Eget"
                                />
                            </div>
                            {phase === 'checked' && (
                                <span className="flex-shrink-0 w-5">
                                    {isCorrect ? (
                                        <Check className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <X className="w-5 h-5 text-rose-500" />
                                    )}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Feedback-sone */}
            <div className="px-4 sm:px-5">
                <AnimatePresence mode="wait">
                    {phase === 'checked' && (
                        <motion.div
                            key={allCorrect ? 'win' : 'partial'}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`mb-1 px-4 py-3 rounded-lg border text-sm ${
                                allCorrect
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : 'bg-blue-50 border-blue-200 text-blue-800'
                            }`}
                        >
                            {allCorrect ? (
                                <span className="flex items-start gap-2">
                                    <motion.span
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                                    >
                                        <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    </motion.span>
                                    <span>
                                        Riktig! Norge delte bare kongen og utenrikspolitikken med Sverige. Alt annet var
                                        Norges eget. Derfor heter det personalunion: bare personen, kongen, var felles.
                                    </span>
                                </span>
                            ) : (
                                <span>
                                    Du fikk {correctCount} av {INSTITUTIONS.length} riktig. Tips: Norge ga fra seg
                                    overraskende lite. Bare to av delene var felles med Sverige. Prøv igjen.
                                </span>
                            )}
                        </motion.div>
                    )}
                    {phase === 'sorting' && (
                        <motion.p
                            key="prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mb-1 px-1 text-xs text-slate-400"
                        >
                            {allAnswered
                                ? 'Alt er plassert. Trykk "Sjekk svar".'
                                : `Plasser alle ${INSTITUTIONS.length} delene for å sjekke.`}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-4 sm:px-5 py-4 flex items-center justify-between">
                <button
                    onClick={check}
                    disabled={!allAnswered || phase === 'checked'}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                >
                    Sjekk svar
                </button>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}

function SideButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onClick}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                active
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
        >
            {label}
        </motion.button>
    );
}
