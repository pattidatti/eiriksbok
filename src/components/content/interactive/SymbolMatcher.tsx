import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shapes, RotateCcw, Check } from 'lucide-react';

interface SymbolPair {
    id: string;
    glyph: string;
    religion: string;
    meaning: string;
}

interface SymbolMatcherProps {
    title?: string;
    pairs?: SymbolPair[];
}

const DEFAULT_PAIRS: SymbolPair[] = [
    {
        id: 'kors',
        glyph: '✝',
        religion: 'Kristendom',
        meaning: 'Korset minner om at Jesus døde på et kors. Det er det viktigste tegnet i kristen tro.',
    },
    {
        id: 'halvmane',
        glyph: '☪',
        religion: 'Islam',
        meaning: 'Halvmånen og stjernen er blitt et kjent tegn for islam, og pryder mange moskeer.',
    },
    {
        id: 'davidsstjerne',
        glyph: '✡',
        religion: 'Jødedom',
        meaning: 'Davidsstjernen er en sekskantet stjerne og er det mest kjente tegnet på jødisk tro.',
    },
    {
        id: 'dharmahjul',
        glyph: '☸',
        religion: 'Buddhisme',
        meaning: 'Hjulet viser Buddhas lære. De åtte eikene står for den veien som fører bort fra lidelse.',
    },
    {
        id: 'om',
        glyph: 'ॐ',
        religion: 'Hinduisme',
        meaning: 'Tegnet Om står for en hellig lyd. Mange hinduer sier den når de mediterer eller ber.',
    },
    {
        id: 'khanda',
        glyph: '☬',
        religion: 'Sikhisme',
        meaning: 'Khanda er sikhenes tegn. Sverdene og ringen minner om mot, rettferd og at Gud er én.',
    },
];

type Phase = 'idle' | 'active' | 'complete';

// Bland en liste pseudo-tilfeldig, men stabilt for samme input.
function shuffled<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(((i * 9301 + 49297) % 233280) / 233280 * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function SymbolMatcher({
    title = 'Koble symbol til religion',
    pairs = DEFAULT_PAIRS,
}: SymbolMatcherProps) {
    const religions = useMemo(() => shuffled(pairs.map((p) => p.religion)), [pairs]);
    const [selected, setSelected] = useState<string | null>(null);
    const [matched, setMatched] = useState<Record<string, boolean>>({});
    const [wrong, setWrong] = useState<string | null>(null);
    const [lastMeaning, setLastMeaning] = useState<string | null>(null);

    const matchedCount = Object.keys(matched).length;
    const phase: Phase =
        matchedCount === pairs.length ? 'complete' : matchedCount > 0 || selected ? 'active' : 'idle';

    const handleReset = () => {
        setSelected(null);
        setMatched({});
        setWrong(null);
        setLastMeaning(null);
    };

    const pickSymbol = (id: string) => {
        if (matched[id]) return;
        setSelected((cur) => (cur === id ? null : id));
        setWrong(null);
    };

    const pickReligion = (religion: string) => {
        if (!selected) return;
        const pair = pairs.find((p) => p.id === selected);
        if (!pair) return;
        if (pair.religion === religion) {
            setMatched((m) => ({ ...m, [pair.id]: true }));
            setLastMeaning(pair.meaning);
            setSelected(null);
            setWrong(null);
        } else {
            setWrong(religion);
            setLastMeaning(null);
            setTimeout(() => setWrong(null), 600);
        }
    };

    const religionMatched = (religion: string) =>
        pairs.some((p) => p.religion === religion && matched[p.id]);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Shapes className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Trykk et symbol, og så religionen det hører til.
                    </p>
                </div>
                <span className="ml-auto text-sm font-medium text-slate-400">
                    {matchedCount}/{pairs.length}
                </span>
            </div>

            {/* Interaksjonsflate */}
            <div className="p-6 grid grid-cols-2 gap-4">
                {/* Symboler */}
                <div className="flex flex-col gap-2">
                    {pairs.map((p) => {
                        const isMatched = matched[p.id];
                        const isSel = selected === p.id;
                        return (
                            <motion.button
                                key={p.id}
                                onClick={() => pickSymbol(p.id)}
                                disabled={isMatched}
                                animate={isSel ? { scale: 1.04 } : { scale: 1 }}
                                whileTap={{ scale: 0.96 }}
                                className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                                    isMatched
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : isSel
                                          ? 'bg-indigo-50 border-indigo-300 shadow-md'
                                          : 'bg-slate-50 border-slate-200 hover:border-indigo-200'
                                }`}
                            >
                                <span className="text-3xl leading-none w-9 text-center">
                                    {p.glyph}
                                </span>
                                {isMatched && (
                                    <span className="ml-auto text-xs font-semibold text-emerald-600">
                                        {p.religion}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Religioner */}
                <div className="flex flex-col gap-2">
                    {religions.map((r) => {
                        const done = religionMatched(r);
                        const isWrong = wrong === r;
                        return (
                            <motion.button
                                key={r}
                                onClick={() => pickReligion(r)}
                                disabled={done || !selected}
                                animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                                transition={{ duration: 0.4 }}
                                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                                    done
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : isWrong
                                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                                          : selected
                                            ? 'bg-white border-indigo-200 text-slate-700 hover:bg-indigo-50'
                                            : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}
                            >
                                {done && <Check className="w-4 h-4 flex-shrink-0" />}
                                {r}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback-sone */}
            <div className="mx-6 mb-4 min-h-[3.25rem]">
                <AnimatePresence mode="wait">
                    {phase === 'complete' ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium"
                        >
                            Alle symbolene er på plass! Nå kan du kjenne igjen seks religioner bare
                            ved tegnet deres.
                        </motion.div>
                    ) : lastMeaning ? (
                        <motion.div
                            key={lastMeaning}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm"
                        >
                            {lastMeaning}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="hint"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-sm"
                        >
                            {selected
                                ? 'Velg religionen dette symbolet hører til.'
                                : 'Hvert symbol peker til én religion. Klarer du alle seks?'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
