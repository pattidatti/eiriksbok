import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Sparkles, RotateCcw } from 'lucide-react';

// Signaturkomponent til artikkelen "Japansk imperialisme: Da Japan slo en stormakt".
//
// Lyspaere-oyeblikket: Da Japan slo Russland i 1905, var det forste gang i moderne
// tid at et asiatisk land beseiret en europeisk stormakt. Nyheten spredte seg som
// en sjokkbolge, og ga koloniserte folk over hele verden hap om at de ogsaa kunne
// bli frie. Eleven klikker hvert land rundt sentrumet og foler bolgen rulle utover.

interface Reaction {
    id: string;
    place: string;
    flag: string;
    text: string;
}

const REACTIONS: Reaction[] = [
    {
        id: 'india',
        place: 'India',
        flag: '🇮🇳',
        text: 'Unge indere fikk nytt mot. Hvis Japan kunne slaa Russland, kunne India en dag kaste ut britene.',
    },
    {
        id: 'vietnam',
        place: 'Vietnam',
        flag: '🇻🇳',
        text: 'Nasjonalister sendte studenter til Japan for aa laere. De kalte det "Reis ostover".',
    },
    {
        id: 'tyrkia',
        place: 'Det osmanske riket',
        flag: '🇹🇷',
        text: 'Reformvennlige offiserer fikk vind i seilene. Faa aar senere tvang de fram store endringer.',
    },
    {
        id: 'kina',
        place: 'Kina',
        flag: '🇨🇳',
        text: 'Kinesiske nasjonalister saa at et asiatisk land kunne moderniseres og vinne. De ville det samme.',
    },
];

type Phase = 'idle' | 'active' | 'complete';

export function Sjokkbolgen1905({
    title = 'Sjokkbølgen fra 1905',
}: {
    title?: string;
}) {
    const [lit, setLit] = useState<Set<string>>(new Set());
    const [ripple, setRipple] = useState(0);
    const [active, setActive] = useState<string | null>(null);

    const phase: Phase = lit.size === 0 ? 'idle' : lit.size >= REACTIONS.length ? 'complete' : 'active';
    const activeReaction = useMemo(
        () => REACTIONS.find((r) => r.id === active) ?? null,
        [active]
    );

    const lightUp = (id: string) => {
        setActive(id);
        setRipple((n) => n + 1);
        setLit((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const reset = () => {
        setLit(new Set());
        setActive(null);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Waves className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk hvert land og se hvordan seieren over Russland ga håp.
                    </p>
                </div>
            </div>

            <div className="p-6">
                {/* Sentrum: selve seieren, med ringer som ruller utover ved hvert klikk */}
                <div className="relative flex justify-center mb-6">
                    <AnimatePresence>
                        {ripple > 0 && (
                            <motion.span
                                key={ripple}
                                initial={{ scale: 0.4, opacity: 0.55 }}
                                animate={{ scale: 3.2, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.1, ease: 'easeOut' }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full border-2 border-rose-400"
                            />
                        )}
                    </AnimatePresence>
                    <motion.div
                        animate={{ scale: phase === 'complete' ? [1, 1.08, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white px-6 py-4 text-center shadow-md"
                    >
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-100">
                            27. mai 1905
                        </p>
                        <p className="text-lg font-bold leading-tight">Japan slår Russland</p>
                        <p className="text-xs text-rose-100">Slaget i Tsushimastredet</p>
                    </motion.div>
                </div>

                {/* Landene som fanger opp bølgen */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {REACTIONS.map((r) => {
                        const isLit = lit.has(r.id);
                        return (
                            <motion.button
                                key={r.id}
                                onClick={() => lightUp(r.id)}
                                whileTap={{ scale: 0.96 }}
                                animate={isLit ? { scale: [1, 1.06, 1] } : {}}
                                transition={{ duration: 0.35 }}
                                className={`rounded-xl border p-3 text-center transition-colors ${
                                    isLit
                                        ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                                        : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                                }`}
                            >
                                <span className="text-2xl" aria-hidden>
                                    {r.flag}
                                </span>
                                <p
                                    className={`mt-1 text-sm font-semibold ${
                                        isLit ? 'text-emerald-700' : 'text-slate-600'
                                    }`}
                                >
                                    {r.place}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback-sone: alltid til stede */}
            <div className="mx-6 mb-4 min-h-[3.5rem] px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                <AnimatePresence mode="wait">
                    {phase === 'complete' ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-2 text-emerald-800"
                        >
                            <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                            <span>
                                Bølgen nådde hele verden. For første gang i moderne tid hadde et
                                asiatisk land slått en europeisk stormakt, og koloniserte folk fikk
                                håp om at de også kunne bli frie.
                            </span>
                        </motion.div>
                    ) : activeReaction ? (
                        <motion.div
                            key={activeReaction.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <span className="font-semibold">{activeReaction.place}: </span>
                            {activeReaction.text}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-slate-500"
                        >
                            Klikk et land for å se hvordan nyheten om seieren slo ned der.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                    Land som fikk håp: {lit.size} / {REACTIONS.length}
                </span>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
