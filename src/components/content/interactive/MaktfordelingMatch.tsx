import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Briefcase, Scale, RotateCcw, Sparkles } from 'lucide-react';

interface Scenario {
    id: string;
    text: string;
    answer: 'storting' | 'regjering' | 'domstol';
    explanation: string;
}

interface MaktfordelingMatchProps {
    title?: string;
    intro?: string;
    scenarios?: Scenario[];
}

const DEFAULT_SCENARIOS: Scenario[] = [
    {
        id: 's1',
        text: 'Norge trenger en ny lov om bruk av kunstig intelligens i skolen.',
        answer: 'storting',
        explanation: 'Stortinget lager alle nye lover. 169 representanter stemmer over forslaget.',
    },
    {
        id: 's2',
        text: 'En person mener fengselsstraffen hen fikk er for streng.',
        answer: 'domstol',
        explanation: 'Domstolene tolker loven og avgjør anker. Høyesterett har siste ord.',
    },
    {
        id: 's3',
        text: 'Skolene i Norge trenger nye datamaskiner — hvem fordeler pengene?',
        answer: 'regjering',
        explanation: 'Regjeringen styrer den daglige driften av staten og fordeler budsjettet etter at Stortinget har vedtatt det.',
    },
    {
        id: 's4',
        text: 'En statsråd er anklaget for å bryte loven. Hvem avgjør om hen er skyldig?',
        answer: 'domstol',
        explanation: 'Domstolene er uavhengige og kan dømme selv landets mektigste personer. Det er kjernen i rettsstaten.',
    },
    {
        id: 's5',
        text: 'Bør Norge endre Grunnloven slik at flere unge får stemmerett?',
        answer: 'storting',
        explanation: 'Bare Stortinget kan endre Grunnloven, og det krever to tredjedels flertall i to ulike perioder.',
    },
];

const POWERS = {
    storting: {
        label: 'Stortinget',
        sublabel: 'Lovgivende makt',
        icon: Landmark,
        color: 'indigo',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-700',
        ring: 'ring-indigo-400',
        glow: 'shadow-indigo-200',
    },
    regjering: {
        label: 'Regjeringen',
        sublabel: 'Utøvende makt',
        icon: Briefcase,
        color: 'amber',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        ring: 'ring-amber-400',
        glow: 'shadow-amber-200',
    },
    domstol: {
        label: 'Domstolene',
        sublabel: 'Dømmende makt',
        icon: Scale,
        color: 'emerald',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        ring: 'ring-emerald-400',
        glow: 'shadow-emerald-200',
    },
} as const;

type PowerKey = keyof typeof POWERS;
type Phase = 'idle' | 'active' | 'wrong' | 'correct' | 'complete';

export function MaktfordelingMatch({
    title = 'Hvem bestemmer hva?',
    intro = 'Klikk på den statsmakten som har ansvar for hvert tilfelle.',
    scenarios = DEFAULT_SCENARIOS,
}: MaktfordelingMatchProps) {
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState<Phase>('idle');
    const [score, setScore] = useState(0);
    const [lastChoice, setLastChoice] = useState<PowerKey | null>(null);

    const current = scenarios[idx];
    const isComplete = phase === 'complete';

    const handleChoice = (choice: PowerKey) => {
        if (phase === 'wrong' || phase === 'correct' || isComplete) return;
        setLastChoice(choice);
        if (choice === current.answer) {
            setScore((s) => s + 1);
            setPhase('correct');
        } else {
            setPhase('wrong');
        }
    };

    const handleNext = () => {
        if (idx + 1 >= scenarios.length) {
            setPhase('complete');
        } else {
            setIdx((i) => i + 1);
            setPhase('active');
            setLastChoice(null);
        }
    };

    const handleReset = () => {
        setIdx(0);
        setPhase('idle');
        setScore(0);
        setLastChoice(null);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
                <Landmark className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{intro}</p>
                </div>
                <div className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                    {isComplete ? `${score}/${scenarios.length}` : `${idx + 1}/${scenarios.length}`}
                </div>
            </div>

            <div className="p-6">
                {!isComplete ? (
                    <>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    x: phase === 'wrong' ? [0, -8, 8, -6, 6, 0] : 0,
                                }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.35 }}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-6 mb-5 text-center"
                            >
                                <p className="text-base sm:text-lg text-slate-800 font-medium">
                                    {current.text}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {(Object.keys(POWERS) as PowerKey[]).map((key) => {
                                const p = POWERS[key];
                                const Icon = p.icon;
                                const wasChosen = lastChoice === key;
                                const isAnswer = current.answer === key;
                                const showCorrect = phase === 'correct' && wasChosen;
                                const showWrong = phase === 'wrong' && wasChosen;
                                const revealAnswer = phase === 'wrong' && isAnswer;
                                const disabled =
                                    phase === 'correct' || phase === 'wrong';

                                return (
                                    <motion.button
                                        key={key}
                                        onClick={() => handleChoice(key)}
                                        disabled={disabled}
                                        whileHover={disabled ? {} : { y: -3 }}
                                        whileTap={disabled ? {} : { scale: 0.97 }}
                                        animate={
                                            showCorrect
                                                ? { scale: [1, 1.06, 1] }
                                                : revealAnswer
                                                  ? { scale: [1, 1.03, 1] }
                                                  : {}
                                        }
                                        transition={{ duration: 0.45 }}
                                        className={`relative flex flex-col items-center gap-2 px-4 py-5 rounded-xl border-2 transition-colors ${
                                            showCorrect || revealAnswer
                                                ? `${POWERS[key].bg} ${POWERS[key].border} ring-2 ${POWERS[key].ring} shadow-md`
                                                : showWrong
                                                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-300'
                                                  : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-md'
                                        } ${disabled && !wasChosen && !isAnswer ? 'opacity-50' : ''}`}
                                    >
                                        <Icon
                                            className={`w-7 h-7 ${POWERS[key].text}`}
                                        />
                                        <div>
                                            <div
                                                className={`font-semibold text-sm ${POWERS[key].text}`}
                                            >
                                                {p.label}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {p.sublabel}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-6"
                    >
                        <motion.div
                            animate={{ rotate: [0, -8, 8, -6, 6, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.2 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 via-amber-100 to-emerald-100 mb-4"
                        >
                            <Sparkles className="w-8 h-8 text-indigo-600" />
                        </motion.div>
                        <h4 className="text-xl font-semibold text-slate-800 mb-2">
                            Maktbalansen er klar!
                        </h4>
                        <p className="text-slate-600 mb-1">
                            Du svarte riktig på {score} av {scenarios.length}.
                        </p>
                        <p className="text-sm text-slate-500 italic max-w-md mx-auto mt-3">
                            «Når makten er delt, er friheten trygg.» — fritt etter
                            Montesquieu, mannen Eidsvollsmennene leste på sengekanten.
                        </p>
                    </motion.div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {(phase === 'correct' || phase === 'wrong') && (
                    <motion.div
                        key={`fb-${idx}-${phase}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mx-6 mb-4 px-4 py-3 rounded-lg border text-sm ${
                            phase === 'correct'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                    >
                        <strong className="block mb-1">
                            {phase === 'correct'
                                ? 'Riktig!'
                                : `Riktig svar: ${POWERS[current.answer].label}`}
                        </strong>
                        <span>{current.explanation}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                {!isComplete && (phase === 'correct' || phase === 'wrong') ? (
                    <button
                        onClick={handleNext}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                    >
                        {idx + 1 >= scenarios.length ? 'Se resultatet' : 'Neste sak'}
                    </button>
                ) : (
                    <span className="text-xs text-slate-400">
                        {isComplete
                            ? 'Du er ferdig.'
                            : 'Velg én av de tre statsmaktene.'}
                    </span>
                )}
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors flex items-center gap-1"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
