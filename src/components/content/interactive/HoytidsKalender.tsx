import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Church, Sparkles, Flag, RotateCcw } from 'lucide-react';

// Lyspaere-oyeblikket: etter denne interaksjonen skal eleven se at de fleste
// fridagene og merkedagene i den norske kalenderen har religiose rotter - og at
// et mer mangfoldig Norge legger til nye hoytider.

interface DayCard {
    id: string;
    label: string;
    sub: string;
    origin: 'kristendom' | 'annen' | 'verdslig';
}

interface Bucket {
    id: 'kristendom' | 'annen' | 'verdslig';
    label: string;
    icon: typeof Church;
    accent: string;
}

interface HoytidsKalenderProps {
    title?: string;
}

const DAYS: DayCard[] = [
    { id: 'jul', label: 'Jul', sub: 'feiring av at Jesus ble født', origin: 'kristendom' },
    { id: 'pinse', label: 'Pinse', sub: '50 dager etter påske', origin: 'kristendom' },
    {
        id: 'himmelfart',
        label: 'Kristi himmelfartsdag',
        sub: 'en torsdag i mai',
        origin: 'kristendom',
    },
    { id: 'eid', label: 'Id al-fitr', sub: 'slutten på ramadan', origin: 'annen' },
    { id: 'divali', label: 'Divali', sub: 'hinduenes lysfest', origin: 'annen' },
    { id: '17mai', label: '17. mai', sub: 'grunnlovsdagen', origin: 'verdslig' },
];

const BUCKETS: Bucket[] = [
    { id: 'kristendom', label: 'Kristendom', icon: Church, accent: 'violet' },
    { id: 'annen', label: 'Annen religion', icon: Sparkles, accent: 'amber' },
    { id: 'verdslig', label: 'Verdslig / politisk', icon: Flag, accent: 'sky' },
];

const ACCENT: Record<string, { soft: string; ring: string; text: string; dot: string }> = {
    violet: {
        soft: 'bg-violet-50 border-violet-200',
        ring: 'ring-violet-400',
        text: 'text-violet-700',
        dot: 'bg-violet-500',
    },
    amber: {
        soft: 'bg-amber-50 border-amber-200',
        ring: 'ring-amber-400',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
    },
    sky: {
        soft: 'bg-sky-50 border-sky-200',
        ring: 'ring-sky-400',
        text: 'text-sky-700',
        dot: 'bg-sky-500',
    },
};

export function HoytidsKalender({ title = 'Hvor kommer fri-dagen fra?' }: HoytidsKalenderProps) {
    const [placed, setPlaced] = useState<Record<string, Bucket['id']>>({});
    const [selected, setSelected] = useState<string | null>(null);
    const [wrong, setWrong] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string>('Trykk en merkedag, og trykk så ruten du tror den kommer fra.');

    const allPlaced = Object.keys(placed).length === DAYS.length;
    const religiousCount = useMemo(
        () => DAYS.filter((d) => d.origin !== 'verdslig').length,
        []
    );

    const selectDay = (id: string) => {
        if (placed[id]) return;
        setSelected((cur) => (cur === id ? null : id));
        setWrong(null);
        const d = DAYS.find((x) => x.id === id);
        if (d) setFeedback(`Hvor kommer ${d.label} fra? Trykk en av rutene under.`);
    };

    const dropInBucket = (bucketId: Bucket['id']) => {
        if (!selected) {
            setFeedback('Velg en merkedag først, så trykker du ruten.');
            return;
        }
        const day = DAYS.find((d) => d.id === selected);
        if (!day) return;
        if (day.origin === bucketId) {
            setPlaced((p) => ({ ...p, [day.id]: bucketId }));
            setSelected(null);
            setWrong(null);
            setFeedback(`Riktig! ${day.label} hører hjemme her.`);
        } else {
            setWrong(day.id);
            setFeedback(`Ikke helt. Tenk på hva ${day.label} egentlig feirer, og prøv igjen.`);
            setTimeout(() => setWrong((w) => (w === day.id ? null : w)), 600);
        }
    };

    const reset = () => {
        setPlaced({});
        setSelected(null);
        setWrong(null);
        setFeedback('Trykk en merkedag, og trykk så ruten du tror den kommer fra.');
    };

    const unplaced = DAYS.filter((d) => !placed[d.id]);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Sorter merkedagene etter hvor de kommer fra.
                    </p>
                </div>
            </div>

            {/* Merkedager som skal plasseres */}
            <div className="px-6 pt-5">
                <div className="min-h-[3.5rem] flex flex-wrap gap-2.5">
                    <AnimatePresence>
                        {unplaced.map((d) => {
                            const isSel = selected === d.id;
                            const isWrong = wrong === d.id;
                            return (
                                <motion.button
                                    key={d.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        x: isWrong ? [0, -7, 7, -5, 5, 0] : 0,
                                    }}
                                    exit={{ opacity: 0, scale: 0.6 }}
                                    transition={{ x: { duration: 0.4 } }}
                                    onClick={() => selectDay(d.id)}
                                    className={`text-left rounded-xl border px-3.5 py-2 transition-shadow ${
                                        isSel
                                            ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-300 shadow-md'
                                            : 'bg-slate-50 border-slate-200 hover:shadow-md'
                                    }`}
                                >
                                    <span className="block text-sm font-semibold text-slate-800">
                                        {d.label}
                                    </span>
                                    <span className="block text-[11px] text-slate-500">{d.sub}</span>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                    {unplaced.length === 0 && (
                        <span className="text-sm text-slate-400 py-3">
                            Alle merkedagene er plassert.
                        </span>
                    )}
                </div>
            </div>

            {/* Bøtter */}
            <div className="px-6 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUCKETS.map((b) => {
                    const a = ACCENT[b.accent];
                    const Icon = b.icon;
                    const inside = DAYS.filter((d) => placed[d.id] === b.id);
                    return (
                        <button
                            key={b.id}
                            onClick={() => dropInBucket(b.id)}
                            className={`rounded-xl border p-3 text-left transition ${a.soft} ${
                                selected ? `ring-2 ${a.ring} shadow-md` : 'hover:shadow-md'
                            }`}
                        >
                            <span className={`flex items-center gap-2 font-semibold ${a.text}`}>
                                <Icon className="w-4 h-4" /> {b.label}
                            </span>
                            <div className="mt-2 flex flex-wrap gap-1.5 min-h-[1.5rem]">
                                {inside.map((d) => (
                                    <motion.span
                                        key={d.id}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-white px-2 py-0.5 text-[11px] font-medium text-slate-600"
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
                                        {d.label}
                                    </motion.span>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Feedback-sone */}
            <div className="px-6 pt-4">
                <AnimatePresence mode="wait">
                    {allPlaced ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, y: 10, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3"
                        >
                            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                <Sparkles className="w-4 h-4" />
                                {religiousCount} av {DAYS.length} merkedager har religiøse røtter
                            </div>
                            <p className="mt-1 text-sm text-emerald-700/90">
                                De fleste fridagene i den norske kalenderen kommer fra kristendommen.
                                Når Norge blir mer mangfoldig, kommer det nye høytider til, som
                                Id al-fitr og Divali. Religion lever videre i kalenderen vår, også
                                for dem som ikke tror.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={feedback}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-2.5 text-sm text-blue-700"
                        >
                            {feedback}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 py-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    {Object.keys(placed).length} / {DAYS.length} plassert
                </span>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
