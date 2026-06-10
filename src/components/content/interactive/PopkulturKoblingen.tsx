import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Link2, RotateCcw, Check } from 'lucide-react';

interface Pair {
    id: string;
    pop: string;
    origin: string;
    note: string;
}

interface PopkulturKoblingenProps {
    title?: string;
    pairs?: Pair[];
}

const DEFAULT_PAIRS: Pair[] = [
    {
        id: 'superhelt',
        pop: 'Superhelten ofrer livet for å redde verden, og vekkes til live igjen',
        origin: 'Jesu død og oppstandelse',
        note: 'Mange superheltfilmer gjenforteller den kristne fortellingen om en helt som dør og står opp igjen.',
    },
    {
        id: 'flom',
        pop: 'Filmer om en enorm flom og en båt full av dyr',
        origin: 'Noahs ark fra Bibelen',
        note: 'Fortellingen om Noah som berger livet fra storflommen dukker opp igjen og igjen i film og spill.',
    },
    {
        id: 'karma',
        pop: 'Ordet «karma» i sangtekster, spill og hverdagsprat',
        origin: 'Karma i hinduisme og buddhisme',
        note: 'Tanken om at handlingene dine får følger kommer fra hinduisme og buddhisme, men brukes nå overalt.',
    },
    {
        id: 'jul',
        pop: 'Julelåter som spilles på radioen i hele desember',
        origin: 'Feiringen av Jesu fødsel',
        note: 'Julemusikken bygger på den kristne høytiden, selv når sangen bare handler om snø og gaver.',
    },
    {
        id: 'yoga',
        pop: 'Yoga og hilsenen «namasté» i treningsvideoer',
        origin: 'Praksis og hilsen fra hinduismen',
        note: 'Yoga og «namasté» har røtter i hinduismen, men er blitt en del av vanlig trening i Vesten.',
    },
];

// Deterministisk omstokking av høyre kolonne så svarene ikke ligger på linje.
const RIGHT_ORDER = [2, 4, 0, 3, 1];

type Feedback = { kind: 'ok' | 'fail' | 'idle'; text: string };

export function PopkulturKoblingen({
    title = 'Koble populærkultur til religiøst opphav',
    pairs = DEFAULT_PAIRS,
}: PopkulturKoblingenProps) {
    const rightCards = useMemo(
        () => RIGHT_ORDER.filter((i) => i < pairs.length).map((i) => pairs[i]),
        [pairs]
    );

    const [selectedPop, setSelectedPop] = useState<string | null>(null);
    const [matched, setMatched] = useState<string[]>([]);
    const [shakeId, setShakeId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Feedback>({
        kind: 'idle',
        text: 'Trykk på et eksempel til venstre, og så på det religiøse opphavet til høyre.',
    });

    const allDone = matched.length === pairs.length;

    const reset = () => {
        setSelectedPop(null);
        setMatched([]);
        setShakeId(null);
        setFeedback({
            kind: 'idle',
            text: 'Trykk på et eksempel til venstre, og så på det religiøse opphavet til høyre.',
        });
    };

    const pickPop = (id: string) => {
        if (matched.includes(id) || allDone) return;
        setSelectedPop(id);
        const p = pairs.find((x) => x.id === id);
        setFeedback({
            kind: 'idle',
            text: `Hvor kommer dette fra? «${p?.pop}»`,
        });
    };

    const pickOrigin = (id: string) => {
        if (matched.includes(id) || allDone) return;
        if (!selectedPop) {
            setFeedback({
                kind: 'idle',
                text: 'Velg først et eksempel fra populærkulturen til venstre.',
            });
            return;
        }
        const p = pairs.find((x) => x.id === selectedPop);
        if (selectedPop === id) {
            const next = [...matched, id];
            setMatched(next);
            setSelectedPop(null);
            if (next.length === pairs.length) {
                setFeedback({ kind: 'ok', text: 'Alle koblet! Religion er overalt i populærkulturen.' });
            } else {
                setFeedback({ kind: 'ok', text: p?.note ?? 'Riktig kobling!' });
            }
        } else {
            setShakeId(id);
            setFeedback({
                kind: 'fail',
                text: 'Ikke helt. Se på eksempelet en gang til, og prøv et annet opphav.',
            });
            window.setTimeout(() => setShakeId(null), 450);
        }
    };

    const fbStyle =
        feedback.kind === 'ok'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : feedback.kind === 'fail'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-blue-50 border-blue-200 text-blue-700';

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Link2 className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Trykk på et eksempel, så på det religiøse opphavet det bygger på.
                    </p>
                </div>
                <span className="ml-auto text-sm font-medium text-slate-400">
                    {matched.length}/{pairs.length}
                </span>
            </div>

            {/* Interaksjonsflate */}
            <div className="p-6 grid grid-cols-2 gap-4">
                {/* Venstre: populærkultur */}
                <div className="space-y-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        I populærkulturen
                    </p>
                    {pairs.map((p) => {
                        const isMatched = matched.includes(p.id);
                        const isSelected = selectedPop === p.id;
                        return (
                            <motion.button
                                key={p.id}
                                onClick={() => pickPop(p.id)}
                                disabled={isMatched}
                                whileTap={isMatched ? undefined : { scale: 0.97 }}
                                className={`w-full text-left rounded-xl border p-3 text-sm leading-snug transition-colors ${
                                    isMatched
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : isSelected
                                          ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-md'
                                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:shadow-md'
                                }`}
                            >
                                <span className="flex items-start gap-2">
                                    {isMatched && (
                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <span>{p.pop}</span>
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Høyre: religiøst opphav */}
                <div className="space-y-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Religiøst opphav
                    </p>
                    {rightCards.map((p) => {
                        const isMatched = matched.includes(p.id);
                        const isShaking = shakeId === p.id;
                        return (
                            <motion.button
                                key={p.id}
                                onClick={() => pickOrigin(p.id)}
                                disabled={isMatched}
                                animate={isShaking ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                                transition={{ duration: 0.4 }}
                                whileTap={isMatched ? undefined : { scale: 0.97 }}
                                className={`w-full text-left rounded-xl border p-3 text-sm leading-snug transition-colors ${
                                    isMatched
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : 'bg-white border-slate-200 text-slate-700 hover:shadow-md hover:border-indigo-200'
                                }`}
                            >
                                <span className="flex items-start gap-2">
                                    {isMatched && (
                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <span>{p.origin}</span>
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback-sone */}
            <div className="px-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={feedback.text}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`px-4 py-3 rounded-lg border text-sm ${fbStyle}`}
                    >
                        {feedback.text}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Suksess-finale */}
            <AnimatePresence>
                {allDone && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                        className="mx-6 mt-3 px-4 py-4 rounded-xl bg-gradient-to-r from-indigo-50 to-emerald-50 border border-indigo-200 flex items-center gap-3"
                    >
                        <motion.div
                            initial={{ rotate: -20, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 260 }}
                        >
                            <Sparkles className="w-6 h-6 text-indigo-500" />
                        </motion.div>
                        <p className="text-sm text-slate-700">
                            Du fant det religiøse opphavet bak fem eksempler fra film, musikk og
                            spill. Når du først ser det, oppdager du at religion preger
                            populærkulturen mye mer enn du tror.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 py-5 flex items-center justify-end">
                <button
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
