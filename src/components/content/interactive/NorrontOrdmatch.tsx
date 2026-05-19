import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, RotateCcw, Sparkles } from 'lucide-react';

interface Pair {
    norront: string;
    modern: string;
    hint?: string;
}

interface NorrontOrdmatchProps {
    title?: string;
    intro?: string;
    pairs?: Pair[];
    successText?: string;
}

const DEFAULT_PAIRS: Pair[] = [
    { norront: 'maðr', modern: 'mann', hint: 'ð uttales som engelsk "th" i "the"' },
    { norront: 'auga', modern: 'øye', hint: 'g blir borte i moderne norsk' },
    { norront: 'hús', modern: 'hus', hint: 'nesten likt — bare aksenten er borte' },
    { norront: 'skip', modern: 'skip', hint: 'helt likt — gikk uendret i 1000 år' },
    { norront: 'fjǫrðr', modern: 'fjord', hint: 'ǫ er en o-lyd. Slik fikk vi fjord-ordet' },
    { norront: 'kýr', modern: 'ku', hint: 'ý er en y-lyd. Vokalen ble kortere' },
];

type Phase = 'idle' | 'active' | 'complete';

function shuffle<T>(arr: T[], seed: number): T[] {
    const copy = [...arr];
    let s = seed;
    for (let i = copy.length - 1; i > 0; i--) {
        s = (s * 9301 + 49297) % 233280;
        const j = Math.floor((s / 233280) * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function NorrontOrdmatch({
    title = 'Norrønt-ordmatch',
    intro = 'Klikk et norrønt ord, så det moderne ordet det ble til. Seks par — hvor mange forstår du?',
    pairs = DEFAULT_PAIRS,
    successText = 'Du leste seks norrøne ord. Et språk fra år 1000 — ikke så fremmed likevel.',
}: NorrontOrdmatchProps) {
    const [phase, setPhase] = useState<Phase>('idle');
    const [selectedNorront, setSelectedNorront] = useState<string | null>(null);
    const [selectedModern, setSelectedModern] = useState<string | null>(null);
    const [matched, setMatched] = useState<Set<string>>(new Set());
    const [wrong, setWrong] = useState<{ n: string; m: string } | null>(null);
    const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());
    const [seed, setSeed] = useState(1);

    const shuffledModern = useMemo(() => shuffle(pairs.map((p) => p.modern), seed + 7), [pairs, seed]);
    const shuffledNorront = useMemo(() => shuffle(pairs.map((p) => p.norront), seed), [pairs, seed]);

    const handleSelectNorront = (n: string) => {
        if (matched.has(n) || wrong) return;
        if (phase === 'idle') setPhase('active');
        if (selectedNorront === n) {
            setSelectedNorront(null);
            return;
        }
        setSelectedNorront(n);
        if (selectedModern) tryMatch(n, selectedModern);
    };

    const handleSelectModern = (m: string) => {
        const pair = pairs.find((p) => p.modern === m);
        if (!pair || matched.has(pair.norront) || wrong) return;
        if (phase === 'idle') setPhase('active');
        if (selectedModern === m) {
            setSelectedModern(null);
            return;
        }
        setSelectedModern(m);
        if (selectedNorront) tryMatch(selectedNorront, m);
    };

    const tryMatch = (n: string, m: string) => {
        const correct = pairs.find((p) => p.norront === n && p.modern === m);
        if (correct) {
            const next = new Set(matched);
            next.add(n);
            setMatched(next);
            setRevealedHints((prev) => new Set(prev).add(n));
            setSelectedNorront(null);
            setSelectedModern(null);
            if (next.size === pairs.length) {
                setPhase('complete');
            }
        } else {
            setWrong({ n, m });
            setTimeout(() => {
                setWrong(null);
                setSelectedNorront(null);
                setSelectedModern(null);
            }, 700);
        }
    };

    const handleReset = () => {
        setPhase('idle');
        setSelectedNorront(null);
        setSelectedModern(null);
        setMatched(new Set());
        setRevealedHints(new Set());
        setWrong(null);
        setSeed((s) => s + 1);
    };

    const getNorrontState = (n: string) => {
        if (matched.has(n)) return 'matched';
        if (wrong?.n === n) return 'wrong';
        if (selectedNorront === n) return 'selected';
        return 'idle';
    };

    const getModernState = (m: string) => {
        const pair = pairs.find((p) => p.modern === m);
        if (pair && matched.has(pair.norront)) return 'matched';
        if (wrong?.m === m) return 'wrong';
        if (selectedModern === m) return 'selected';
        return 'idle';
    };

    const cardClass = (state: string) => {
        if (state === 'matched') return 'bg-emerald-50 border-emerald-300 text-emerald-700 cursor-default';
        if (state === 'wrong') return 'bg-rose-50 border-rose-300 text-rose-700';
        if (state === 'selected') return 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-md';
        return 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-md';
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <ScrollText className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{intro}</p>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div>
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">
                            Norrønt (ca. år 1000)
                        </h4>
                        <div className="space-y-2">
                            {shuffledNorront.map((n) => {
                                const state = getNorrontState(n);
                                return (
                                    <motion.button
                                        key={n}
                                        onClick={() => handleSelectNorront(n)}
                                        disabled={state === 'matched'}
                                        animate={
                                            state === 'wrong'
                                                ? { x: [0, -6, 6, -6, 6, 0] }
                                                : state === 'matched'
                                                  ? { scale: [1, 1.05, 1] }
                                                  : {}
                                        }
                                        transition={{ duration: 0.4 }}
                                        whileTap={state === 'idle' || state === 'selected' ? { scale: 0.97 } : {}}
                                        className={`w-full px-4 py-3 border rounded-xl text-left font-serif text-lg transition-colors ${cardClass(state)}`}
                                    >
                                        {n}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">
                            Moderne norsk
                        </h4>
                        <div className="space-y-2">
                            {shuffledModern.map((m) => {
                                const state = getModernState(m);
                                return (
                                    <motion.button
                                        key={m}
                                        onClick={() => handleSelectModern(m)}
                                        disabled={state === 'matched'}
                                        animate={
                                            state === 'wrong'
                                                ? { x: [0, -6, 6, -6, 6, 0] }
                                                : state === 'matched'
                                                  ? { scale: [1, 1.05, 1] }
                                                  : {}
                                        }
                                        transition={{ duration: 0.4 }}
                                        whileTap={state === 'idle' || state === 'selected' ? { scale: 0.97 } : {}}
                                        className={`w-full px-4 py-3 border rounded-xl text-left font-medium text-lg transition-colors ${cardClass(state)}`}
                                    >
                                        {m}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {revealedHints.size > 0 && phase !== 'complete' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-5 space-y-1"
                        >
                            {pairs
                                .filter((p) => revealedHints.has(p.norront))
                                .map((p) => (
                                    <div key={p.norront} className="text-xs text-slate-500">
                                        <span className="font-serif text-slate-700">{p.norront}</span> →{' '}
                                        <span className="font-medium text-slate-700">{p.modern}</span>
                                        {p.hint ? <span className="text-slate-400"> · {p.hint}</span> : null}
                                    </div>
                                ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                {phase === 'complete' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2"
                    >
                        <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{successText}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                    {matched.size} / {pairs.length} ord matchet
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
