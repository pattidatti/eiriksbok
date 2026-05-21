import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cross, Coins, Shield, Heart, Sparkles, Users, RotateCcw } from 'lucide-react';

type MotiveKey = 'tro' | 'penger' | 'aere' | 'skyld';

interface Motive {
    key: MotiveKey;
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: typeof Cross;
}

const MOTIVES: Record<MotiveKey, Motive> = {
    tro: {
        key: 'tro',
        label: 'Tro',
        color: 'text-violet-700',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        icon: Cross,
    },
    penger: {
        key: 'penger',
        label: 'Penger og jord',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: Coins,
    },
    aere: {
        key: 'aere',
        label: 'Ære og arv',
        color: 'text-sky-700',
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        icon: Shield,
    },
    skyld: {
        key: 'skyld',
        label: 'Skyld og soning',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: Heart,
    },
};

interface Person {
    id: string;
    avatar: string;
    name: string;
    age: number;
    role: string;
    quote: string;
    truth: string;
    motive: MotiveKey;
}

const PEOPLE: Person[] = [
    {
        id: 'marguerite',
        avatar: '🧕',
        name: 'Marguerite',
        age: 52,
        role: 'Enke fra Reims',
        quote: 'Jeg vil gå til Jerusalem for å vaske bort syndene mine før jeg dør.',
        truth:
            'Marguerite tror at hvis hun dør på korstog, kommer hun rett til paradis. Paven har lovet syndsforlatelse til alle som drar.',
        motive: 'tro',
    },
    {
        id: 'hugh',
        avatar: '🧑‍⚔️',
        name: 'Ridder Hugh',
        age: 34,
        role: 'Ridder fra Provence',
        quote: 'Gud kaller. Jeg svarer.',
        truth:
            'Hugh er dypt religiøs og ser korstoget som sin plikt overfor Kristus. Han har solgt halve eiendommen for å betale reisen.',
        motive: 'tro',
    },
    {
        id: 'joscelin',
        avatar: '🧑‍🌾',
        name: 'Joscelin',
        age: 38,
        role: 'Livegen bonde',
        quote: 'Hvis jeg drar, slipper jeg gjelden min.',
        truth:
            'Paven har sagt at korstogfarernes gjeld blir slettet, og at livegne blir frie. For Joscelin er det første gangen han kan eie noe selv.',
        motive: 'penger',
    },
    {
        id: 'giuseppe',
        avatar: '🧑‍💼',
        name: 'Giuseppe',
        age: 41,
        role: 'Kjøpmann fra Genova',
        quote: 'Krydder, silke, sukker. Det venter rikdom der borte.',
        truth:
            'Giuseppe leier ut skip til korstogfarerne og planlegger å åpne handelshus i havnebyene som blir erobret. Krigen er bra for forretningen.',
        motive: 'penger',
    },
    {
        id: 'tankred',
        avatar: '🧑‍🎓',
        name: 'Tankred',
        age: 23,
        role: 'Adelsmann uten arv',
        quote: 'Jeg er andresønn. Slottet går til broren min. Men der borte ligger et helt rike å erobre.',
        truth:
            'Tankred får ingen arv hjemme. På korstoget kan en yngresønn vinne land, slott og adelsk tittel. Mange korstogsstater ble grunnlagt akkurat slik.',
        motive: 'aere',
    },
    {
        id: 'bertrand',
        avatar: '🧑',
        name: 'Bertrand',
        age: 27,
        role: 'Soner et drap',
        quote: 'Jeg drepte naboens bror i en krangel. Presten sa korstoget renser meg.',
        truth:
            'Kirken brukte korstog som straff for alvorlige forbrytelser. Bertrand drar fordi han må – men også fordi han håper Gud tilgir ham hvis han kjemper for Jerusalem.',
        motive: 'skyld',
    },
];

type Phase = 'idle' | 'exploring' | 'complete';

export function KorstogMotiver() {
    const [visited, setVisited] = useState<Set<string>>(new Set());
    const [active, setActive] = useState<Person | null>(null);

    const phase: Phase = visited.size === 0 ? 'idle' : visited.size >= PEOPLE.length ? 'complete' : 'exploring';

    const counts = useMemo(() => {
        const c: Record<MotiveKey, number> = { tro: 0, penger: 0, aere: 0, skyld: 0 };
        for (const id of visited) {
            const p = PEOPLE.find((x) => x.id === id);
            if (p) c[p.motive]++;
        }
        return c;
    }, [visited]);

    const handleClick = (p: Person) => {
        setActive(p);
        setVisited((prev) => {
            if (prev.has(p.id)) return prev;
            const next = new Set(prev);
            next.add(p.id);
            return next;
        });
    };

    const handleReset = () => {
        setVisited(new Set());
        setActive(null);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">
                        Hvem dro på korstog?
                    </h3>
                    <p className="text-sm text-slate-500">
                        Klikk på personene i mengden for å høre hvorfor de tok korset.
                    </p>
                </div>
                <div className="ml-auto text-xs text-slate-500">
                    {visited.size} / {PEOPLE.length} avdekket
                </div>
            </div>

            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PEOPLE.map((p) => {
                    const isVisited = visited.has(p.id);
                    const isActive = active?.id === p.id;
                    const m = MOTIVES[p.motive];
                    return (
                        <motion.button
                            key={p.id}
                            onClick={() => handleClick(p)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`relative text-left rounded-xl border p-3 transition-colors ${
                                isActive
                                    ? `${m.bg} ${m.border} shadow-md`
                                    : isVisited
                                      ? 'bg-slate-50 border-slate-200'
                                      : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-3xl leading-none" aria-hidden>
                                    {p.avatar}
                                </span>
                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-800 truncate">
                                        {p.name}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate">
                                        {p.role}, {p.age} år
                                    </div>
                                </div>
                            </div>
                            {isVisited && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${m.color}`}
                                >
                                    <m.icon className="w-3 h-3" />
                                    {m.label}
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {active && (
                    <motion.div
                        key={active.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700"
                    >
                        <div className="italic text-slate-600 mb-2">"{active.quote}"</div>
                        <div className="flex items-start gap-2">
                            <div
                                className={`mt-0.5 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${MOTIVES[active.motive].bg} ${MOTIVES[active.motive].color}`}
                            >
                                {(() => {
                                    const Icon = MOTIVES[active.motive].icon;
                                    return <Icon className="w-3 h-3" />;
                                })()}
                                {MOTIVES[active.motive].label}
                            </div>
                        </div>
                        <p className="mt-2">{active.truth}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {phase === 'complete' && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-5 px-4 py-4 rounded-lg bg-indigo-50 border border-indigo-200"
                    >
                        <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-3">
                            <Sparkles className="w-4 h-4" />
                            Slik fordelte motivene seg
                        </div>
                        <div className="space-y-2">
                            {(Object.keys(MOTIVES) as MotiveKey[]).map((key) => {
                                const m = MOTIVES[key];
                                const Icon = m.icon;
                                const n = counts[key];
                                const pct = (n / PEOPLE.length) * 100;
                                return (
                                    <div key={key} className="flex items-center gap-3">
                                        <div
                                            className={`flex items-center gap-1 w-36 text-sm ${m.color}`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {m.label}
                                        </div>
                                        <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.6, delay: 0.1 }}
                                                className={`h-full ${m.bg.replace('bg-', 'bg-').replace('-50', '-300')}`}
                                            />
                                        </div>
                                        <div className="w-10 text-right text-sm text-slate-600">
                                            {n}/{PEOPLE.length}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-sm text-slate-700 mt-3">
                            Bare {counts.tro} av {PEOPLE.length} dro hovedsakelig for troen.
                            Resten dro for penger, ære eller for å sone en synd. Korstogene var
                            religiøs krig på overflaten – men under flagget gjemte mange andre
                            grunner seg.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3 h-3" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
