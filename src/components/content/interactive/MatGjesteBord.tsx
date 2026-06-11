import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Check, X, RotateCcw, PartyPopper } from 'lucide-react';

// Lyspære-øyeblikk: Når jeg lager mat til andre, må jeg tenke på hva de kan og
// ikke kan spise. Religiøse matregler er ekte hensyn i et fellesmåltid.

interface Guest {
    id: string;
    name: string;
    emoji: string;
    tro: string;
    forbudt: string[];
    chips: string[];
}

interface Dish {
    id: string;
    name: string;
    emoji: string;
    tags: string[];
}

interface MatGjesteBordProps {
    title?: string;
}

const GUESTS: Guest[] = [
    {
        id: 'amir',
        name: 'Amir',
        emoji: '🧑🏽',
        tro: 'muslim',
        forbudt: ['svin', 'alkohol'],
        chips: ['ikke svin', 'ikke alkohol'],
    },
    {
        id: 'sara',
        name: 'Sara',
        emoji: '👧🏼',
        tro: 'jødisk',
        forbudt: ['svin', 'skalldyr'],
        chips: ['ikke svin', 'ikke skalldyr'],
    },
    {
        id: 'priya',
        name: 'Priya',
        emoji: '🧕🏽',
        tro: 'hindu, vegetarianer',
        forbudt: ['kjott', 'sjomat'],
        chips: ['ikke kjøtt', 'ikke fisk'],
    },
];

const DISHES: Dish[] = [
    { id: 'curry', name: 'Grønnsakscurry', emoji: '🍛', tags: ['vegetar'] },
    { id: 'kylling', name: 'Kyllingwrap', emoji: '🌯', tags: ['kjott'] },
    { id: 'svin', name: 'Svinekoteletter', emoji: '🥩', tags: ['svin', 'kjott'] },
    { id: 'reker', name: 'Rekesalat', emoji: '🦐', tags: ['skalldyr', 'sjomat'] },
    { id: 'okse', name: 'Oksegryte', emoji: '🍲', tags: ['kjott'] },
    { id: 'linser', name: 'Linsesuppe', emoji: '🥣', tags: ['vegetar'] },
];

const REASON: Record<string, (n: string) => string> = {
    svin: (n) => `${n} spiser ikke svinekjøtt.`,
    skalldyr: (n) => `${n} spiser ikke skalldyr. Det er ikke kosher.`,
    alkohol: (n) => `${n} drikker ikke alkohol.`,
    kjott: (n) => `${n} er vegetarianer og spiser ikke kjøtt.`,
    sjomat: (n) => `${n} er vegetarianer og spiser ikke fisk eller sjømat.`,
};

function brutt(guest: Guest, dish: Dish): string | null {
    for (const tag of dish.tags) {
        if (guest.forbudt.includes(tag)) return tag;
    }
    return null;
}

export function MatGjesteBord({ title = 'Dekk bordet for gjestene' }: MatGjesteBordProps) {
    const [held, setHeld] = useState<string | null>(null);
    const [served, setServed] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
    const [shakeGuest, setShakeGuest] = useState<string | null>(null);

    const done = GUESTS.every((g) => served[g.id]);

    const reset = () => {
        setHeld(null);
        setServed({});
        setFeedback(null);
        setShakeGuest(null);
    };

    const pickDish = (id: string) => {
        if (done) return;
        setHeld((cur) => (cur === id ? null : id));
        setFeedback(null);
    };

    const serve = (guest: Guest) => {
        if (done) return;
        if (!held) {
            setFeedback({ ok: false, text: 'Velg en rett først, så klikk på en gjest.' });
            return;
        }
        const dish = DISHES.find((d) => d.id === held)!;
        const tag = brutt(guest, dish);
        if (tag) {
            setShakeGuest(guest.id);
            setTimeout(() => setShakeGuest(null), 500);
            setFeedback({ ok: false, text: REASON[tag](guest.name) });
            return;
        }
        setServed((s) => ({ ...s, [guest.id]: dish.id }));
        setHeld(null);
        setFeedback({ ok: true, text: `${guest.name} kan spise ${dish.name.toLowerCase()}. Bra valg!` });
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Utensils className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg en rett, og klikk på en gjest som kan spise den.
                    </p>
                </div>
            </div>

            {/* Gjester */}
            <div className="px-6 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {GUESTS.map((g) => {
                    const dishId = served[g.id];
                    const dish = dishId ? DISHES.find((d) => d.id === dishId) : null;
                    return (
                        <motion.button
                            key={g.id}
                            onClick={() => serve(g)}
                            animate={shakeGuest === g.id ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                            transition={{ duration: 0.45 }}
                            className={`text-left rounded-xl border-2 p-3 transition ${
                                dish
                                    ? 'bg-emerald-50 border-emerald-300'
                                    : held
                                      ? 'bg-blue-50 border-blue-300 hover:border-blue-400 cursor-pointer'
                                      : 'bg-slate-50 border-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{g.emoji}</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 leading-tight">
                                        {g.name}
                                    </p>
                                    <p className="text-xs text-slate-500 leading-tight">{g.tro}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {g.chips.map((c) => (
                                    <span
                                        key={c}
                                        className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600"
                                    >
                                        {c}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-2 h-9 rounded-lg border border-dashed border-slate-300 flex items-center justify-center bg-white/60">
                                <AnimatePresence mode="wait">
                                    {dish ? (
                                        <motion.span
                                            key={dish.id}
                                            initial={{ scale: 0.4, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                                            className="flex items-center gap-1.5 text-sm font-medium text-emerald-700"
                                        >
                                            <span className="text-lg">{dish.emoji}</span>
                                            {dish.name}
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="tom"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-xs text-slate-400"
                                        >
                                            tom tallerken
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Retter å velge mellom */}
            <div className="px-6 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Retter på kjøkkenet
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {DISHES.map((d) => {
                        const isHeld = held === d.id;
                        const usedUp = Object.values(served).includes(d.id);
                        return (
                            <motion.button
                                key={d.id}
                                onClick={() => pickDish(d.id)}
                                disabled={done}
                                whileTap={{ scale: 0.92 }}
                                animate={isHeld ? { y: -6 } : { y: 0 }}
                                className={`rounded-xl border-2 p-2 flex flex-col items-center gap-1 transition ${
                                    isHeld
                                        ? 'bg-indigo-50 border-indigo-400 shadow-md'
                                        : usedUp
                                          ? 'bg-emerald-50 border-emerald-200'
                                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                                }`}
                            >
                                <span className="text-2xl">{d.emoji}</span>
                                <span className="text-[11px] text-center leading-tight text-slate-600">
                                    {d.name}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback-sone */}
            <div className="px-6 pt-4">
                <AnimatePresence mode="wait">
                    {done ? (
                        <motion.div
                            key="ferdig"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium"
                        >
                            <PartyPopper className="w-5 h-5 flex-shrink-0" />
                            Alle gjestene fikk noe de kan spise! Du tok hensyn til hver enkelt sin tro.
                        </motion.div>
                    ) : feedback ? (
                        <motion.div
                            key={feedback.text}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
                                feedback.ok
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                    : 'bg-rose-50 border border-rose-200 text-rose-700'
                            }`}
                        >
                            {feedback.ok ? (
                                <Check className="w-4 h-4 flex-shrink-0" />
                            ) : (
                                <X className="w-4 h-4 flex-shrink-0" />
                            )}
                            {feedback.text}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-sm"
                        >
                            {held
                                ? 'Klikk på gjesten du vil servere denne retten.'
                                : 'Velg en rett for å begynne.'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 py-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    {Object.keys(served).length} av {GUESTS.length} gjester servert
                </span>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
