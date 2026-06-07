import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Heart, Skull, RotateCcw, Lightbulb } from 'lucide-react';

// ByzantineSurvival — signaturkomponent for artikkelen om Det bysantinske riket.
//
// Lyspære-øyeblikket: "Etter denne interaksjonen skal eleven forstå at Roma ikke
// forsvant i 476 - den østlige halvdelen levde videre i nesten tusen år, helt
// til 1453."
//
// Eleven drar en tidslinje fra 330 til 1453. Et stort "I LIVE"-merke blir
// liggende grønt i over tusen år - også når Vest-Roma faller i 476 - helt til
// Konstantinopel faller i 1453 og merket endelig blir rødt.

interface Milestone {
    year: number;
    territory: number; // 0-100, hvor stort riket er
    label: string;
    fact: string;
}

const MILESTONES: Milestone[] = [
    {
        year: 330,
        territory: 100,
        label: 'Konstantinopel grunnlegges',
        fact: 'Keiser Konstantin flytter hovedstaden østover til den nye byen Konstantinopel. Den blir hjertet i riket.',
    },
    {
        year: 395,
        territory: 92,
        label: 'Riket deles i øst og vest',
        fact: 'Riket blir for stort til å styre fra ett sted. Det deles i en vestlig og en østlig halvdel, hver med sin keiser.',
    },
    {
        year: 476,
        territory: 62,
        label: 'Vest-Roma faller',
        fact: 'Den vestlige halvdelen bryter sammen. Mange tror dette er slutten for Roma. Men i øst styrer keiseren videre som om ingenting har skjedd.',
    },
    {
        year: 555,
        territory: 82,
        label: 'Justinian gjenerobrer',
        fact: 'Keiser Justinian tar tilbake store deler av Vest-Roma og samler alle lovene i én lovbok. Riket er på sitt sterkeste.',
    },
    {
        year: 800,
        territory: 46,
        label: 'Araberne tar land',
        fact: 'Den nye islamske staten erobrer rike provinser som Egypt og Syria. Riket krymper, men holder stand rundt Konstantinopel.',
    },
    {
        year: 1054,
        territory: 40,
        label: 'Kirken splittes',
        fact: 'Det store skismaet deler kristendommen i en katolsk kirke i vest og en ortodoks kirke i øst, med Konstantinopel som sentrum.',
    },
    {
        year: 1204,
        territory: 18,
        label: 'Korsfarerne plyndrer byen',
        fact: 'Soldater fra Vest-Europa angriper og plyndrer Konstantinopel. Riket blir aldri helt det samme igjen.',
    },
    {
        year: 1453,
        territory: 0,
        label: 'Konstantinopel faller',
        fact: 'Sultan Mehmet 2. og osmanene erobrer byen. Nå er Roma virkelig borte - 1123 år etter at den vestlige halvdelen falt.',
    },
];

const START = 330;
const END = 1453;

function activeIndex(year: number): number {
    let idx = 0;
    for (let i = 0; i < MILESTONES.length; i++) {
        if (year >= MILESTONES[i].year) idx = i;
    }
    return idx;
}

export function ByzantineSurvival({ title = 'Falt Roma i 476?' }: { title?: string }) {
    const [year, setYear] = useState(START);
    const [reachedEnd, setReachedEnd] = useState(false);

    const idx = useMemo(() => activeIndex(year), [year]);
    const current = MILESTONES[idx];
    const fallen = year >= END;

    const handleChange = (v: number) => {
        setYear(v);
        if (v >= END) setReachedEnd(true);
    };

    const reset = () => {
        setYear(START);
        setReachedEnd(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Landmark className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Dra tidslinjen og se hvor lenge Roma faktisk levde
                    </p>
                </div>
            </div>

            {/* Interaksjonsflate */}
            <div className="p-6">
                {/* Status-merke + årstall */}
                <div className="flex items-center justify-between gap-4 mb-5">
                    <AnimatePresence mode="wait">
                        {fallen ? (
                            <motion.div
                                key="fallen"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm"
                            >
                                <Skull className="w-4 h-4" />
                                Det romerske riket: FALT
                            </motion.div>
                        ) : (
                            <motion.div
                                key="alive"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm"
                            >
                                <motion.span
                                    animate={{ scale: [1, 1.25, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.4 }}
                                    className="inline-flex"
                                >
                                    <Heart className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                                </motion.span>
                                Det romerske riket: I LIVE
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800 tabular-nums">
                            {year === END ? '1453' : `${year}`}
                        </div>
                        <div className="text-[11px] uppercase tracking-wider text-slate-400">e.Kr.</div>
                    </div>
                </div>

                {/* Territorie-stolpe */}
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Størrelsen på riket</span>
                    <span className="tabular-nums">{current.territory}%</span>
                </div>
                <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden mb-6">
                    <motion.div
                        className={`h-full rounded-full ${fallen ? 'bg-rose-400' : 'bg-indigo-500'}`}
                        animate={{ width: `${current.territory}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                </div>

                {/* Selve tidslinje-slideren */}
                <input
                    type="range"
                    min={START}
                    max={END}
                    value={year}
                    onChange={(e) => handleChange(Number(e.target.value))}
                    aria-label="Dra for å flytte deg gjennom årene fra 330 til 1453"
                    className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>330</span>
                    <span className="text-amber-600 font-semibold">476 · Vest-Roma faller</span>
                    <span>1453</span>
                </div>
            </div>

            {/* Feedback-sone — alltid synlig */}
            <div className="mx-6 mb-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.year}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`px-4 py-3 rounded-lg border text-sm ${
                            fallen
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-blue-50 border-blue-200 text-blue-800'
                        }`}
                    >
                        <span className="font-semibold">
                            {current.year} · {current.label}.{' '}
                        </span>
                        {current.fact}
                        {current.year === 476 && (
                            <span className="block mt-1 font-semibold text-emerald-700">
                                Legg merke til: merket er fortsatt grønt. Øst-Roma lever videre!
                            </span>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Lyspære-innsikt når eleven har dratt helt til 1453 */}
            <AnimatePresence>
                {reachedEnd && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex gap-2"
                    >
                        <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p>
                            Roma falt ikke i 476. Den østlige halvdelen - Det bysantinske riket -
                            levde videre i nesten tusen år til. Folk der kalte seg fortsatt
                            romere helt til slutten.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                    {reachedEnd ? 'Du nådde året 1453.' : 'Dra helt til enden for å se hva som skjer.'}
                </p>
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
