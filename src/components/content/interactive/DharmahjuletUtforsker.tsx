import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, RotateCcw } from 'lucide-react';

interface Step {
    id: number;
    name: string;
    category: 'visdom' | 'etikk' | 'meditasjon';
    description: string;
    insight: string;
}

const STEPS: Step[] = [
    {
        id: 1,
        name: 'Rett forståelse',
        category: 'visdom',
        description:
            'Å forstå De fire edle sannheter - at lidelse finnes, hva som forårsaker den, og at det er mulig å frigjøre seg.',
        insight: 'Du kan ikke gå riktig vei uten å forstå hvor du er.',
    },
    {
        id: 2,
        name: 'Rett intensjon',
        category: 'visdom',
        description:
            'Å ha rene motiver: gi opp begjær, unngå ondsinnethet, og la medfølelse med alle vesener veilede deg.',
        insight: 'Handlinger som springer ut av kjærlighet skaper god karma.',
    },
    {
        id: 3,
        name: 'Rett tale',
        category: 'etikk',
        description:
            'Å snakke sant, unngå sladder og løgn, og la ordene bygge opp snarere enn å rive ned.',
        insight: 'Ord skaper virkelighet - de kan helbrede eller såre.',
    },
    {
        id: 4,
        name: 'Rett handling',
        category: 'etikk',
        description:
            'Å ikke drepe, stjele eller skade. De fem buddhistiske levereglene (Pansil) er kjernen her.',
        insight: 'Kroppen din skal gjøre godt i verden, ikke skade.',
    },
    {
        id: 5,
        name: 'Rett levemåte',
        category: 'etikk',
        description:
            'Å tjene til livets opphold på en måte som ikke skader andre - unngå yrker som handel med våpen, kjøtt eller gift.',
        insight: 'Også jobben din er en etisk handling.',
    },
    {
        id: 6,
        name: 'Rett innsats',
        category: 'meditasjon',
        description:
            'Å aktivt motarbeide negative tanker og dyrke positive. Frigjøring krever bevisst og vedvarende arbeid.',
        insight: 'Sinnet endres ikke av seg selv - det må trenes.',
    },
    {
        id: 7,
        name: 'Rett oppmerksomhet',
        category: 'meditasjon',
        description:
            'Å være til stede i øyeblikket - observere kropp, følelser og tanker uten å bli revet med. Dette er kjernen i mindfulness.',
        insight: 'Bevissthet om nå-øyeblikket er veien fri fra fortid og fremtid.',
    },
    {
        id: 8,
        name: 'Rett konsentrasjon',
        category: 'meditasjon',
        description:
            'Å utvikle dyp, stabil konsentrasjon gjennom meditasjon. Buddhisten trener seg til fire nivåer av dyp ro (jhana).',
        insight: 'Dyp ro åpner sinnet for erkjennelse som hverdagslig bevissthet ikke kan nå.',
    },
];

const CATEGORIES = {
    visdom: {
        label: 'Visdom',
        sanskrit: 'Prajna',
        header: 'bg-amber-50 border-amber-200',
        headerText: 'text-amber-700',
        card: 'border-amber-200 bg-amber-50/40 hover:bg-amber-50',
        cardRevealed: 'border-amber-300 bg-amber-50',
        iconClass: 'text-amber-500',
        insightClass: 'text-amber-600',
    },
    etikk: {
        label: 'Etikk',
        sanskrit: 'Sila',
        header: 'bg-blue-50 border-blue-200',
        headerText: 'text-blue-700',
        card: 'border-blue-200 bg-blue-50/40 hover:bg-blue-50',
        cardRevealed: 'border-blue-300 bg-blue-50',
        iconClass: 'text-blue-500',
        insightClass: 'text-blue-600',
    },
    meditasjon: {
        label: 'Meditasjon',
        sanskrit: 'Samadhi',
        header: 'bg-purple-50 border-purple-200',
        headerText: 'text-purple-700',
        card: 'border-purple-200 bg-purple-50/40 hover:bg-purple-50',
        cardRevealed: 'border-purple-300 bg-purple-50',
        iconClass: 'text-purple-500',
        insightClass: 'text-purple-600',
    },
} as const;

export function DharmahjuletUtforsker() {
    const [revealed, setRevealed] = useState<Set<number>>(new Set());
    const allRevealed = revealed.size === 8;

    const reveal = (id: number) => {
        if (!revealed.has(id)) setRevealed((prev) => new Set([...prev, id]));
    };

    const reset = () => setRevealed(new Set());

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <motion.span
                        className="text-2xl select-none leading-none"
                        animate={allRevealed ? { rotate: 360 } : { rotate: 0 }}
                        transition={
                            allRevealed
                                ? { duration: 1.2, ease: 'easeInOut', repeat: 1 }
                                : {}
                        }
                    >
                        ☸
                    </motion.span>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 leading-tight">
                            Den åttedelte veien
                        </h3>
                        <p className="text-xs text-slate-500">Klikk hvert steg for å avdekke det</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                        {revealed.size} / 8
                    </span>
                    <button
                        onClick={reset}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Start på nytt"
                    >
                        <RotateCcw size={13} />
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-blue-400 to-purple-400"
                    animate={{ width: `${(revealed.size / 8) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                />
            </div>

            {/* Three columns */}
            <div className="grid grid-cols-3 gap-3">
                {(
                    Object.entries(CATEGORIES) as [
                        keyof typeof CATEGORIES,
                        (typeof CATEGORIES)[keyof typeof CATEGORIES],
                    ][]
                ).map(([catKey, cat]) => (
                    <div key={catKey} className="space-y-2">
                        {/* Category header */}
                        <div className={`rounded-lg border px-3 py-2 ${cat.header}`}>
                            <div className={`text-xs font-bold ${cat.headerText}`}>{cat.label}</div>
                            <div className={`text-xs opacity-70 ${cat.headerText}`}>{cat.sanskrit}</div>
                        </div>

                        {/* Step cards */}
                        {STEPS.filter((s) => s.category === catKey).map((step) => {
                            const isRevealed = revealed.has(step.id);
                            return (
                                <motion.button
                                    key={step.id}
                                    onClick={() => reveal(step.id)}
                                    className={`w-full text-left rounded-lg border p-2.5 transition-colors cursor-pointer ${
                                        isRevealed ? cat.cardRevealed : cat.card
                                    }`}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 flex-shrink-0">
                                            {isRevealed ? (
                                                <CheckCircle2
                                                    size={14}
                                                    className={cat.iconClass}
                                                />
                                            ) : (
                                                <Lock size={14} className="text-slate-300" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div
                                                className={`text-xs font-semibold leading-tight ${
                                                    isRevealed ? cat.headerText : 'text-slate-500'
                                                }`}
                                            >
                                                {step.id}. {step.name}
                                            </div>
                                            <AnimatePresence>
                                                {isRevealed && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.28 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                                                            {step.description}
                                                        </p>
                                                        <p
                                                            className={`text-xs mt-1 italic leading-snug ${cat.insightClass}`}
                                                        >
                                                            {step.insight}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Victory */}
            <AnimatePresence>
                {allRevealed && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-3"
                    >
                        <span className="text-xl select-none">☸</span>
                        <div>
                            <p className="text-sm font-bold text-emerald-700">
                                Alle åtte steg avdekket!
                            </p>
                            <p className="text-xs text-emerald-600 mt-0.5">
                                Visdom, Etikk og Meditasjon vever seg sammen til en vei mot Nirvana.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
