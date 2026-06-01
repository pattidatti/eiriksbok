import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Swords, Scale, GraduationCap, Users, Palette, Sparkles } from 'lucide-react';

// Lyspære: Hellas var ikke ett land, men mange selvstendige bystater. Athen og
// Sparta valgte stikk motsatte svar på spørsmålet "hvordan skal vi leve
// sammen?". Eleven utforsker fem livsområder og kjenner kontrasten direkte:
// samme greske verden, to helt ulike måter å bygge et samfunn på.

interface Area {
    id: string;
    label: string;
    icon: typeof Scale;
    athen: string;
    sparta: string;
}

const AREAS: Area[] = [
    {
        id: 'styre',
        label: 'Styre',
        icon: Scale,
        athen: 'Demokrati. Alle frie menn over 18 år kunne møte i folkeforsamlingen og stemme på lovene. Mange embeter ble trukket ut ved loddtrekning, så vanlige folk fikk makt.',
        sparta: 'Få styrte. To konger ledet hæren, men et råd av gamle menn og fem oppsynsmenn (eforer) bestemte. Vanlige borgere hadde lite de skulle ha sagt.',
    },
    {
        id: 'oppvekst',
        label: 'Oppvekst',
        icon: GraduationCap,
        athen: 'Guttene lærte å lese, skrive, regne, synge og drive idrett. Målet var en allsidig borger som kunne tenke selv og delta i bylivet.',
        sparta: 'Guttene ble sendt til en hard militærleir som sjuåringer. Lite mat, mye trening og full lydighet. Målet var én ting: en sterk soldat.',
    },
    {
        id: 'krig',
        label: 'Krig',
        icon: Swords,
        athen: 'Sterkest til sjøs. Athen bygde en stor flåte med raske rorskip og kontrollerte havet og handelen rundt seg.',
        sparta: 'Sterkest på land. Den spartanske hæren var fryktet i hele Hellas. Soldatene sto skulder ved skulder og ga aldri opp rekka.',
    },
    {
        id: 'kvinner',
        label: 'Kvinner',
        icon: Users,
        athen: 'Kvinnene styrte hjemmet, men kunne ikke stemme, eie mye eller bevege seg fritt ute. Livet deres foregikk for det meste innendørs.',
        sparta: 'Kvinnene fikk trene, eie jord og si sin mening høyt. De var friere enn kvinner i de fleste andre greske byer.',
    },
    {
        id: 'kultur',
        label: 'Kultur',
        icon: Palette,
        athen: 'Teater, filosofi, kunst og store byggverk som Parthenon. Her levde tenkere som Sokrates og Platon. Athen ble et midtpunkt for ideer.',
        sparta: 'Lite kunst og få bøker. Spartanerne var stolte av å snakke kort og treffende. Derfor kaller vi knappe svar «lakoniske» den dag i dag.',
    },
];

interface AthenSpartaProps {
    title?: string;
}

export function AthenSparta({ title = 'Athen og Sparta: to byer, to verdener' }: AthenSpartaProps) {
    const [active, setActive] = useState<string>(AREAS[0].id);
    const [explored, setExplored] = useState<Set<string>>(new Set([AREAS[0].id]));

    const current = AREAS.find((a) => a.id === active)!;
    const allDone = explored.size === AREAS.length;

    const pick = (id: string) => {
        setActive(id);
        setExplored((prev) => new Set(prev).add(id));
    };

    const reset = () => {
        setActive(AREAS[0].id);
        setExplored(new Set([AREAS[0].id]));
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Landmark className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg et livsområde og se hvor ulikt de to byene levde.
                    </p>
                </div>
            </div>

            {/* Kategori-velger */}
            <div className="px-6 pt-4 flex flex-wrap gap-2">
                {AREAS.map((a) => {
                    const Icon = a.icon;
                    const isActive = a.id === active;
                    const seen = explored.has(a.id);
                    return (
                        <button
                            key={a.id}
                            onClick={() => pick(a.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : seen
                                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {a.label}
                        </button>
                    );
                })}
            </div>

            {/* Side-ved-side-sammenligning */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`athen-${active}`}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl border border-sky-200 bg-sky-50 p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🏛️</span>
                            <span className="font-bold text-sky-800">Athen</span>
                        </div>
                        <p className="text-sm text-sky-900 leading-relaxed">{current.athen}</p>
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={`sparta-${active}`}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl border border-rose-200 bg-rose-50 p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🛡️</span>
                            <span className="font-bold text-rose-800">Sparta</span>
                        </div>
                        <p className="text-sm text-rose-900 leading-relaxed">{current.sparta}</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Feedback-sone */}
            <div className="mx-6 mb-4">
                <AnimatePresence mode="wait">
                    {allDone ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                            className="flex items-start gap-2 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
                        >
                            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                                Du har sett begge verdener. Samme greske språk og guder, men to
                                helt ulike svar på «hvordan skal vi leve sammen?». Athen satset på
                                frihet og ideer, Sparta på disiplin og hær.
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="hint"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm"
                        >
                            Du har utforsket {explored.size} av {AREAS.length} områder. Klikk de
                            grå knappene for å se resten.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={reset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
