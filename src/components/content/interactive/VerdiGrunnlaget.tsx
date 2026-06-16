import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Church, Leaf, Users, Brain, Sparkles, RotateCcw } from 'lucide-react';

// Signaturkomponent for artikkelen "Nihilisme i etikk".
// Lyspaere: moralsk nihilisme river vekk grunnmuren under en moralsk paastand.
// Naar alle de fire vanlige grunnlagene (Gud, naturen, samfunnet, fornuften) er
// felt, "svever" paastanden uten stotte. Saa faar eleven selv reise en ny soyle
// (Nietzsche/Sartre/Camus): verdien forsvant ikke, den byttet kilde - fra verden
// til mennesket.

interface Foundation {
    id: string;
    name: string;
    reason: string;
    objection: string;
    Icon: typeof Church;
}

const FOUNDATIONS: Foundation[] = [
    {
        id: 'gud',
        name: 'Gud',
        reason: 'Det er galt fordi Gud har forbudt det.',
        objection:
            'Men hvis Gud er død - eller aldri fantes - faller budet bort. Og folk tror på ulike guder med ulike bud. Hvilken skal gjelde?',
        Icon: Church,
    },
    {
        id: 'naturen',
        name: 'Naturen',
        reason: 'Det er galt fordi det strider mot naturen.',
        objection:
            'Men naturen bare er. Løver dreper ungene sine. Du kan ikke lese "galt" ut av et faktum om hva som finnes i naturen.',
        Icon: Leaf,
    },
    {
        id: 'samfunnet',
        name: 'Samfunnet',
        reason: 'Det er galt fordi samfunnet har bestemt det.',
        objection:
            'Men samfunn er uenige, og de skifter mening. Da er "galt" bare det flertallet liker akkurat nå - ikke en sannhet.',
        Icon: Users,
    },
    {
        id: 'fornuften',
        name: 'Fornuften',
        reason: 'Det er galt fordi fornuften kan bevise det.',
        objection:
            'Men fornuften kan vise hva som følger av et mål. Den kan ikke bevise at selve målet er rett. Hvor er beviset?',
        Icon: Brain,
    },
];

interface RebuildOption {
    id: string;
    thinker: string;
    label: string;
    detail: string;
}

const REBUILD_OPTIONS: RebuildOption[] = [
    {
        id: 'nietzsche',
        thinker: 'Nietzsche',
        label: 'Jeg skaper mine egne verdier',
        detail: 'Jeg velger selv hva som skal bety noe, og står for det med hele meg.',
    },
    {
        id: 'sartre',
        thinker: 'Sartre',
        label: 'Jeg er fri, og derfor ansvarlig',
        detail: 'Ingenting tvinger valget mitt. Da er det helt mitt - og ansvaret også.',
    },
    {
        id: 'camus',
        thinker: 'Camus',
        label: 'Jeg sier ja til livet likevel',
        detail: 'Selv om verden er meningsløs, velger jeg å bry meg. Det er mitt opprør.',
    },
];

const CLAIM = 'Det er galt å plage noen bare for moro skyld.';

export function VerdiGrunnlaget() {
    const [toppled, setToppled] = useState<Set<string>>(new Set());
    const [active, setActive] = useState<string | null>(null);
    const [built, setBuilt] = useState<RebuildOption | null>(null);

    const allToppled = toppled.size === FOUNDATIONS.length;
    const activeFoundation = FOUNDATIONS.find((f) => f.id === active) ?? null;

    const handleTopple = (id: string) => {
        setActive(id);
        setToppled((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const handleReset = () => {
        setToppled(new Set());
        setActive(null);
        setBuilt(null);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">Hva holder moralen oppe?</h3>
                    <p className="text-sm text-slate-500">
                        Klikk hver søyle og hør nihilistens innvending.
                    </p>
                </div>
            </div>

            <div className="p-6">
                {/* Paastanden - hviler paa soylene, svever naar alt er felt */}
                <motion.div
                    animate={
                        allToppled && !built
                            ? { y: [-4, 6, -4] }
                            : { y: 0 }
                    }
                    transition={
                        allToppled && !built
                            ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.4 }
                    }
                    className={`mx-auto max-w-xl text-center rounded-xl border-2 px-5 py-4 mb-2 transition-colors ${
                        built
                            ? 'bg-emerald-50 border-emerald-300'
                            : allToppled
                              ? 'bg-rose-50 border-rose-200 border-dashed'
                              : 'bg-indigo-50 border-indigo-200'
                    }`}
                >
                    <p className="text-base font-semibold text-slate-800">{CLAIM}</p>
                    {allToppled && !built && (
                        <p className="mt-1 text-xs font-medium text-rose-600">
                            Ingen grunnmur igjen. Hva hviler dette på nå?
                        </p>
                    )}
                </motion.div>

                {/* Den nye, egenbygde soylen */}
                <AnimatePresence>
                    {built && (
                        <motion.div
                            initial={{ opacity: 0, scaleY: 0, y: -10 }}
                            animate={{ opacity: 1, scaleY: 1, y: 0 }}
                            style={{ transformOrigin: 'bottom' }}
                            className="mx-auto max-w-xs text-center rounded-lg bg-emerald-100 border border-emerald-300 px-4 py-3 mb-4"
                        >
                            <p className="text-xs uppercase tracking-wide text-emerald-700 font-bold">
                                Din søyle ({built.thinker})
                            </p>
                            <p className="text-sm text-emerald-800 mt-0.5">{built.label}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Soylene */}
                {!built && (
                    <div className="flex items-end justify-center gap-2 sm:gap-3 mt-2">
                        {FOUNDATIONS.map((f) => {
                            const down = toppled.has(f.id);
                            return (
                                <motion.button
                                    key={f.id}
                                    onClick={() => !down && handleTopple(f.id)}
                                    disabled={down}
                                    animate={
                                        down
                                            ? { rotateZ: -7, y: 18, opacity: 0.4 }
                                            : { rotateZ: 0, y: 0, opacity: 1 }
                                    }
                                    whileHover={down ? undefined : { y: -4 }}
                                    transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                                    style={{ transformOrigin: 'bottom' }}
                                    className={`flex-1 max-w-[120px] flex flex-col items-center justify-end gap-2 rounded-lg border px-2 py-4 ${
                                        down
                                            ? 'bg-slate-100 border-slate-200 cursor-default'
                                            : 'bg-slate-50 border-slate-300 hover:border-indigo-400 hover:shadow-md cursor-pointer'
                                    }`}
                                    title={down ? 'Felt' : 'Klikk for å høre innvendingen'}
                                >
                                    <f.Icon
                                        className={`w-6 h-6 ${down ? 'text-slate-400' : 'text-indigo-500'}`}
                                    />
                                    <span
                                        className={`text-sm font-semibold ${
                                            down
                                                ? 'text-slate-400 line-through'
                                                : 'text-slate-700'
                                        }`}
                                    >
                                        {f.name}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Feedback-sone - alltid til stede */}
            <div className="mx-6 mb-4">
                <AnimatePresence mode="wait">
                    {built ? (
                        <motion.div
                            key="built-feedback"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
                        >
                            Verdien forsvant ikke - den byttet kilde. Den kommer ikke lenger fra
                            verden, men fra deg. Det er nihilismens utfordring: hvis ingen
                            grunnmur finnes, må vi reise vår egen.
                        </motion.div>
                    ) : allToppled ? (
                        <motion.div
                            key="toppled-feedback"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm"
                        >
                            Alle grunnlagene er felt. Dette er den moralske nihilistens påstand:
                            ingen handling er objektivt rett eller gal. Men må det stoppe her?
                        </motion.div>
                    ) : activeFoundation ? (
                        <motion.div
                            key={activeFoundation.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm"
                        >
                            <span className="font-semibold">{activeFoundation.reason}</span>{' '}
                            {activeFoundation.objection}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="hint"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-sm"
                        >
                            Hver søyle er en grunn til at noe er galt. Klikk dem én for én, og se hva
                            nihilisten svarer.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Gjenreis-valg naar alt er felt */}
            <AnimatePresence>
                {allToppled && !built && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 overflow-hidden"
                    >
                        <p className="text-sm font-semibold text-slate-700 mb-2">
                            Reis din egen søyle - velg et svar på nihilismen:
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                            {REBUILD_OPTIONS.map((o) => (
                                <button
                                    key={o.id}
                                    onClick={() => setBuilt(o)}
                                    className="flex-1 text-left rounded-lg border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md px-3 py-2 transition-all"
                                >
                                    <span className="block text-xs font-bold text-emerald-600">
                                        {o.thinker}
                                    </span>
                                    <span className="block text-sm font-semibold text-slate-800">
                                        {o.label}
                                    </span>
                                    <span className="block text-xs text-slate-500 mt-0.5">
                                        {o.detail}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                    {built
                        ? 'Du reiste din egen grunnmur.'
                        : `${toppled.size} av ${FOUNDATIONS.length} søyler felt`}
                </span>
                <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
