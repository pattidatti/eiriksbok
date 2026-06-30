import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Check, RotateCcw, Sparkles } from 'lucide-react';

interface Pair {
    id: string;
    left: string; // setning fra 1789
    right: string; // hva den betyr for deg i dag
}

interface ArvenFra1789Props {
    title?: string;
    pairs?: Pair[];
}

const DEFAULT_PAIRS: Pair[] = [
    {
        id: 'likhet',
        left: 'Alle mennesker fødes frie og like i verdighet og rettigheter.',
        right: 'Ingen kan eie et annet menneske. En elev og en statsminister har samme menneskeverd.',
    },
    {
        id: 'lov-lik',
        left: 'Loven skal være den samme for alle.',
        right: 'Du dømmes etter de samme reglene som alle andre, uansett hvem foreldrene dine er.',
    },
    {
        id: 'ingen-straff',
        left: 'Ingen kan straffes uten at en lov sier det på forhånd.',
        right: 'Du kan bare straffes for noe som var forbudt akkurat da du gjorde det.',
    },
    {
        id: 'frihet-mene',
        left: 'Alle har frihet til å tenke, tro og si sin mening.',
        right: 'Du kan tro på det du vil og si meningen din, så lenge du ikke skader andre.',
    },
];

// Fast, deterministisk rekkefølge på høyre kolonne (ingen Math.random).
const RIGHT_ORDER = [2, 0, 3, 1];

export function ArvenFra1789({
    title = 'Arven fra 1789',
    pairs = DEFAULT_PAIRS,
}: ArvenFra1789Props) {
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [matched, setMatched] = useState<string[]>([]);
    const [wrong, setWrong] = useState<string | null>(null);

    const rightCards = RIGHT_ORDER.filter((i) => i < pairs.length).map((i) => pairs[i]);
    const done = matched.length === pairs.length;

    const pickLeft = (id: string) => {
        if (matched.includes(id) || done) return;
        setWrong(null);
        setSelectedLeft((cur) => (cur === id ? null : id));
    };

    const pickRight = (id: string) => {
        if (matched.includes(id) || done) return;
        if (!selectedLeft) return;
        if (selectedLeft === id) {
            setMatched((m) => [...m, id]);
            setSelectedLeft(null);
            setWrong(null);
        } else {
            setWrong(id);
            setTimeout(() => setWrong(null), 500);
        }
    };

    const reset = () => {
        setSelectedLeft(null);
        setMatched([]);
        setWrong(null);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Scale className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Trykk en setning fra 1789, og koble den til det den betyr for deg i dag.
                    </p>
                </div>
            </div>

            {/* Interaksjonsflate */}
            <div className="p-5 grid grid-cols-2 gap-3 sm:gap-4">
                {/* Venstre: 1789 */}
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                        Erklæringen, 1789
                    </p>
                    {pairs.map((p) => {
                        const isMatched = matched.includes(p.id);
                        const isSel = selectedLeft === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => pickLeft(p.id)}
                                disabled={isMatched}
                                className={`text-left text-sm rounded-xl border px-4 py-3 transition-colors ${
                                    isMatched
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : isSel
                                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-sm'
                                }`}
                            >
                                <span className="flex items-start gap-2">
                                    {isMatched && (
                                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                                    )}
                                    <span>{p.left}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Høyre: i dag */}
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Slik lever du i dag
                    </p>
                    {rightCards.map((p) => {
                        const isMatched = matched.includes(p.id);
                        const isWrong = wrong === p.id;
                        const armed = selectedLeft !== null && !isMatched;
                        return (
                            <motion.button
                                key={p.id}
                                onClick={() => pickRight(p.id)}
                                disabled={isMatched}
                                animate={isWrong ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                                transition={{ duration: 0.4 }}
                                className={`text-left text-sm rounded-xl border px-4 py-3 transition-colors ${
                                    isMatched
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : isWrong
                                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                                          : armed
                                            ? 'bg-indigo-50 border-indigo-300 text-slate-700 hover:bg-indigo-100 cursor-pointer'
                                            : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}
                            >
                                <span className="flex items-start gap-2">
                                    {isMatched && (
                                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                                    )}
                                    <span>{p.right}</span>
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback-sone */}
            <div className="px-5">
                <AnimatePresence mode="wait">
                    {done ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="mb-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2"
                        >
                            <Sparkles className="w-5 h-5 shrink-0 text-emerald-500" />
                            <span>
                                Alt henger sammen. Rettighetene du har i dag ble født som ideer i
                                1789. De ble ikke gitt deg av en konge, og derfor kan ingen konge ta
                                dem tilbake.
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mb-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-sm"
                        >
                            {selectedLeft
                                ? 'Bra. Trykk nå setningen til høyre som hører sammen med den.'
                                : `Riktige koblinger: ${matched.length} av ${pairs.length}.`}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-5 pb-5 flex items-center justify-end">
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
