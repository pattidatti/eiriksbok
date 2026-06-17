import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Scale, Crown, Waves, Sparkles, RotateCcw } from 'lucide-react';

interface Citizen {
    name: string;
    wish: string;
}

type OptionKind = 'tyranni' | 'sum' | 'allmenn';

interface DecisionOption {
    label: string;
    kind: OptionKind;
    explanation: string;
}

interface AllmennviljeVerkstedProps {
    title?: string;
    prompt?: string;
    citizens?: Citizen[];
    options?: DecisionOption[];
}

type Phase = 'reveal' | 'decide' | 'complete';

const DEFAULT_CITIZENS: Citizen[] = [
    { name: 'Mølleren', wish: 'Jeg vil demme opp hele elva til mølla mi.' },
    { name: 'Fiskeren', wish: 'Jeg vil ha elva helt fri, så fisken kommer opp.' },
    { name: 'Bonden', wish: 'Jeg vil lede alt vannet inn på åkeren min.' },
    { name: 'Smeden', wish: 'Jeg vil bruke elva til å kjøle ned jernet mitt.' },
];

const DEFAULT_OPTIONS: DecisionOption[] = [
    {
        label: 'La den sterkeste i landsbyen bestemme alt',
        kind: 'tyranni',
        explanation:
            'Da styrer bare én vilje over alle andre. Rousseau kalte dette tvang, ikke frihet. Et fellesskap kan ikke bygge på at den mektigste får viljen sin.',
    },
    {
        label: 'Alle tar det de vil ha, helt uten felles regler',
        kind: 'sum',
        explanation:
            'Dette er bare summen av alle de private ønskene. De krasjer med hverandre, elva tørker ut, og ingen får det de trengte. Allmennviljen er ikke det samme som alle egoismene lagt sammen.',
    },
    {
        label: 'Lag en felles regel: alle får vann etter tur, og elva holdes levende',
        kind: 'allmenn',
        explanation:
            'Dette tjener landsbyen som helhet, ikke bare én person. Dette er allmennviljen. Og fordi dere har gitt regelen til dere selv, er det å følge den ekte frihet, ifølge Rousseau.',
    },
];

export function AllmennviljeVerksted({
    title = 'Allmennviljens verksted',
    prompt = 'Landsbyen har bare én elv. Hva skal dere bestemme sammen?',
    citizens = DEFAULT_CITIZENS,
    options = DEFAULT_OPTIONS,
}: AllmennviljeVerkstedProps) {
    const [phase, setPhase] = useState<Phase>('reveal');
    const [revealed, setRevealed] = useState<boolean[]>(() => citizens.map(() => false));
    const [picked, setPicked] = useState<number | null>(null);

    const pickedOption = picked !== null ? options[picked] : null;

    const reveal = (i: number) => {
        if (revealed[i]) return;
        const next = revealed.map((r, idx) => (idx === i ? true : r));
        setRevealed(next);
        if (next.every(Boolean)) {
            setTimeout(() => setPhase('decide'), 500);
        }
    };

    const choose = (i: number) => {
        setPicked(i);
        if (options[i].kind === 'allmenn') {
            setPhase('complete');
        }
    };

    const reset = () => {
        setPhase('reveal');
        setRevealed(citizens.map(() => false));
        setPicked(null);
    };

    const feedback =
        phase === 'complete'
            ? { tone: 'ok' as const, text: pickedOption?.explanation ?? '' }
            : pickedOption && pickedOption.kind !== 'allmenn'
              ? { tone: 'no' as const, text: pickedOption.explanation }
              : phase === 'reveal'
                ? {
                      tone: 'info' as const,
                      text: 'Trykk på hver innbygger for å se hva de vil ha. Legg merke til at de vil i hver sin retning.',
                  }
                : {
                      tone: 'info' as const,
                      text: 'Hver innbygger har sitt eget private ønske. Hva er best for hele landsbyen?',
                  };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{prompt}</p>
                </div>
            </div>

            {/* Innbyggerne */}
            <div className="px-6 pt-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {citizens.map((c, i) => (
                        <motion.button
                            key={c.name}
                            type="button"
                            onClick={() => phase === 'reveal' && reveal(i)}
                            disabled={phase !== 'reveal'}
                            whileHover={phase === 'reveal' && !revealed[i] ? { scale: 1.04 } : {}}
                            whileTap={phase === 'reveal' && !revealed[i] ? { scale: 0.97 } : {}}
                            animate={
                                phase === 'complete'
                                    ? { y: [0, -6, 0], scale: [1, 1.05, 1] }
                                    : { y: 0, scale: 1 }
                            }
                            transition={
                                phase === 'complete'
                                    ? { duration: 0.6, delay: i * 0.08 }
                                    : { duration: 0.2 }
                            }
                            className={`flex flex-col items-center text-center rounded-xl border p-3 transition-colors ${
                                phase === 'complete'
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : revealed[i]
                                      ? 'bg-indigo-50 border-indigo-200'
                                      : 'bg-slate-50 border-slate-200 hover:border-indigo-300 cursor-pointer'
                            }`}
                        >
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                                    phase === 'complete'
                                        ? 'bg-emerald-500 text-white'
                                        : revealed[i]
                                          ? 'bg-indigo-500 text-white'
                                          : 'bg-slate-300 text-white'
                                }`}
                            >
                                <Users className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{c.name}</span>
                            <AnimatePresence mode="wait">
                                {revealed[i] && phase !== 'complete' && (
                                    <motion.span
                                        key="wish"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0 }}
                                        className="mt-1 text-[11px] leading-tight text-slate-500"
                                    >
                                        {c.wish}
                                    </motion.span>
                                )}
                                {phase === 'complete' && (
                                    <motion.span
                                        key="united"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-1 text-[11px] font-medium text-emerald-600"
                                    >
                                        Enige
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Beslutning */}
            <div className="px-6 pt-5">
                <AnimatePresence mode="wait">
                    {phase !== 'reveal' && (
                        <motion.div
                            key="options"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-2"
                        >
                            {options.map((o, i) => {
                                const isPicked = picked === i;
                                const Icon =
                                    o.kind === 'tyranni'
                                        ? Crown
                                        : o.kind === 'sum'
                                          ? Waves
                                          : Scale;
                                const done = phase === 'complete';
                                const showRight = done && o.kind === 'allmenn';
                                return (
                                    <motion.button
                                        key={o.label}
                                        type="button"
                                        onClick={() => !done && choose(i)}
                                        disabled={done}
                                        whileHover={!done ? { scale: 1.01 } : {}}
                                        whileTap={!done ? { scale: 0.99 } : {}}
                                        className={`w-full flex items-center gap-3 text-left rounded-xl border px-4 py-3 transition-colors ${
                                            showRight
                                                ? 'bg-emerald-50 border-emerald-300'
                                                : isPicked && o.kind !== 'allmenn'
                                                  ? 'bg-rose-50 border-rose-300'
                                                  : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                                        } ${done && !showRight ? 'opacity-50' : ''}`}
                                    >
                                        <Icon
                                            className={`w-5 h-5 shrink-0 ${
                                                showRight
                                                    ? 'text-emerald-600'
                                                    : isPicked && o.kind !== 'allmenn'
                                                      ? 'text-rose-500'
                                                      : 'text-slate-400'
                                            }`}
                                        />
                                        <span className="text-sm text-slate-700">{o.label}</span>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Feedback-sone */}
            <div className="px-6 pt-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={feedback.tone + (pickedOption?.label ?? '')}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-start gap-2 px-4 py-3 rounded-lg text-sm border ${
                            feedback.tone === 'ok'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : feedback.tone === 'no'
                                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                                  : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}
                    >
                        {feedback.tone === 'ok' && (
                            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                        )}
                        <span>{feedback.text}</span>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 py-5 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                    {phase === 'complete'
                        ? 'Dere fant allmennviljen.'
                        : phase === 'decide'
                          ? 'Velg det som tjener fellesskapet.'
                          : `${revealed.filter(Boolean).length} av ${citizens.length} ønsker avdekket`}
                </span>
                <button
                    type="button"
                    onClick={reset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
