import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, RotateCcw, ChevronRight, Sparkles } from 'lucide-react';

interface KommaOption {
    sentence: string;
    meaning: string;
    emoji: string;
    vibe: 'safe' | 'danger' | 'odd';
}

interface KommaExample {
    title: string;
    options: [KommaOption, KommaOption];
    insight: string;
}

interface KommaRedderProps {
    examples?: KommaExample[];
}

const DEFAULT_EXAMPLES: KommaExample[] = [
    {
        title: 'Spis bestemor',
        options: [
            {
                sentence: 'Spis bestemor!',
                meaning: 'Vi blir bedt om å spise bestemor. Yikes.',
                emoji: '😱',
                vibe: 'danger',
            },
            {
                sentence: 'Spis, bestemor!',
                meaning: 'Vi snakker til bestemor og ber henne spise.',
                emoji: '👵🍝',
                vibe: 'safe',
            },
        ],
        insight: 'Kommaet før et navn viser at vi tiltaler den personen. Uten det blir personen plutselig maten.',
    },
    {
        title: 'Jeg liker matlaging hunder og venner',
        options: [
            {
                sentence: 'Jeg liker matlaging hunder og venner.',
                meaning: 'Jeg liker en helt spesiell hobby: å lage mat av hunder. Og venner.',
                emoji: '🐶🍳',
                vibe: 'odd',
            },
            {
                sentence: 'Jeg liker matlaging, hunder og venner.',
                meaning: 'Jeg liker tre ting: å lage mat, hunder og venner.',
                emoji: '🥘🐕👯',
                vibe: 'safe',
            },
        ],
        insight: 'Kommaer mellom ledd i en oppramsing skiller tingene fra hverandre. Uten dem klistrer ordene seg sammen til noe helt annet.',
    },
    {
        title: 'Vi inviterte to klovner Hans og Olav',
        options: [
            {
                sentence: 'Vi inviterte to klovner, Hans og Olav.',
                meaning: 'Vi inviterte to klovner. De heter Hans og Olav.',
                emoji: '🤡🤡',
                vibe: 'odd',
            },
            {
                sentence: 'Vi inviterte to klovner, Hans, og Olav.',
                meaning: 'Vi inviterte fire personer: to klovner, Hans og Olav.',
                emoji: '🤡🤡👨👨',
                vibe: 'safe',
            },
        ],
        insight: 'Ekstra komma kan skille ut Hans og Olav som egne gjester. Uten det blir de selve klovnene.',
    },
    {
        title: 'Tor sa Mia er kjekk',
        options: [
            {
                sentence: 'Tor sa Mia er kjekk.',
                meaning: 'Tor sier til oss at Mia er kjekk.',
                emoji: '🗣️➡️💁‍♀️',
                vibe: 'safe',
            },
            {
                sentence: 'Tor, sa Mia, er kjekk.',
                meaning: 'Mia sier til oss at Tor er kjekk.',
                emoji: '💁‍♀️➡️🗣️',
                vibe: 'safe',
            },
        ],
        insight: 'To kommaer rundt «sa Mia» gjør dette til en innskutt bisetning. Da snur betydningen seg helt rundt.',
    },
    {
        title: 'Slutt mor sa pappa',
        options: [
            {
                sentence: 'Slutt mor, sa pappa.',
                meaning: 'Pappa ber noen slutte å være mor. Rart.',
                emoji: '🤔',
                vibe: 'odd',
            },
            {
                sentence: 'Slutt, mor, sa pappa.',
                meaning: 'Pappa snakker til mor og ber henne slutte.',
                emoji: '🙋‍♂️➡️🙋‍♀️',
                vibe: 'safe',
            },
        ],
        insight: 'Når du tiltaler noen midt i en setning, skal navnet ramme inn med komma på begge sider.',
    },
];

const vibeStyles: Record<KommaOption['vibe'], string> = {
    safe: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    danger: 'bg-rose-50 border-rose-300 text-rose-900',
    odd: 'bg-amber-50 border-amber-300 text-amber-900',
};

type Phase = 'idle' | 'active' | 'complete';

export function KommaRedder({ examples = DEFAULT_EXAMPLES }: KommaRedderProps) {
    const [index, setIndex] = useState(0);
    const [chosen, setChosen] = useState<Record<number, Set<number>>>({});
    const total = examples.length;
    const current = examples[index];

    const seenOptions = chosen[index] ?? new Set<number>();
    const exampleDone = seenOptions.size === 2;

    const phase: Phase = useMemo(() => {
        const anyChosen = Object.values(chosen).some((s) => s.size > 0);
        const allDone =
            Object.keys(chosen).length === total &&
            Object.values(chosen).every((s) => s.size === 2);
        if (allDone) return 'complete';
        if (anyChosen) return 'active';
        return 'idle';
    }, [chosen, total]);

    const [activeOption, setActiveOption] = useState<number | null>(null);

    const pickOption = (i: number) => {
        setActiveOption(i);
        setChosen((prev) => {
            const next = { ...prev };
            const set = new Set(next[index] ?? []);
            set.add(i);
            next[index] = set;
            return next;
        });
    };

    const goNext = () => {
        if (index < total - 1) {
            setIndex(index + 1);
            setActiveOption(null);
        }
    };

    const handleReset = () => {
        setIndex(0);
        setChosen({});
        setActiveOption(null);
    };

    const visible = activeOption !== null ? current.options[activeOption] : null;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-full">
                    <Heart className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800">Kommaet som redder bestemor</h3>
                    <p className="text-sm text-slate-500">
                        Klikk på begge alternativene og se hvordan ett komma endrer meningen.
                    </p>
                </div>
                <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
                    {index + 1} / {total}
                </div>
            </div>

            <div className="px-6 py-5">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                    Eksempel uten tegnsetting
                </p>
                <p className="text-lg text-slate-700 font-mono mb-5">{current.title}</p>

                <div className="grid sm:grid-cols-2 gap-3">
                    {current.options.map((opt, i) => {
                        const seen = seenOptions.has(i);
                        const isActive = activeOption === i;
                        return (
                            <motion.button
                                key={i}
                                onClick={() => pickOption(i)}
                                whileTap={{ scale: 0.98 }}
                                className={[
                                    'text-left rounded-lg border-2 px-4 py-3 transition-shadow',
                                    isActive
                                        ? 'shadow-md ring-2 ring-indigo-300 border-indigo-400 bg-indigo-50 text-indigo-900'
                                        : seen
                                          ? 'shadow-sm border-slate-200 bg-slate-50 text-slate-700'
                                          : 'border-slate-200 bg-white text-slate-700 hover:shadow-md hover:border-slate-300',
                                ].join(' ')}
                            >
                                <span className="block font-mono text-base">{opt.sentence}</span>
                                <span className="block text-xs text-slate-500 mt-1">
                                    {seen ? 'Sett' : 'Trykk for å se hva det betyr'}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <div className="px-6 pb-2 min-h-[6.5rem]">
                <AnimatePresence mode="wait">
                    {visible && (
                        <motion.div
                            key={`${index}-${activeOption}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className={`rounded-lg border px-4 py-3 ${vibeStyles[visible.vibe]}`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-3xl leading-none mt-0.5" aria-hidden>
                                    {visible.emoji}
                                </span>
                                <p className="text-sm leading-relaxed">{visible.meaning}</p>
                            </div>
                        </motion.div>
                    )}
                    {!visible && (
                        <motion.p
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-slate-400 italic"
                        >
                            Klikk på et alternativ for å se hva setningen egentlig betyr.
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {exampleDone && phase !== 'complete' && (
                    <motion.div
                        key={`insight-${index}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm"
                    >
                        <strong className="block mb-1">Regelen bak:</strong>
                        {current.insight}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {phase === 'complete' && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                        className="mx-6 mb-4 px-5 py-4 rounded-lg bg-gradient-to-br from-emerald-50 to-indigo-50 border border-emerald-200 text-emerald-800"
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                                <p className="font-semibold">Du har reddet bestemor fem ganger.</p>
                                <p className="text-sm text-emerald-700 mt-0.5">
                                    Ett komma kan flytte meningen helt. Bruk det med omhu — særlig
                                    når du tiltaler noen eller ramser opp ting.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between gap-3">
                <button
                    onClick={goNext}
                    disabled={!exampleDone || index === total - 1}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-full px-5 py-2 text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                    Neste eksempel
                    <ChevronRight className="w-4 h-4" />
                </button>
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors inline-flex items-center gap-1"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Start på nytt
                </button>
            </div>
        </div>
    );
}
