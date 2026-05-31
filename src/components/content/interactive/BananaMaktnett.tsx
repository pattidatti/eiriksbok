import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, TrainFront, Ship, Radio, Landmark, Building2, RotateCcw } from 'lucide-react';

interface BananaMaktnettProps {
    title?: string;
}

interface Node {
    id: string;
    icon: typeof Sprout;
    label: string;
    fact: string;
}

const NODES: Node[] = [
    {
        id: 'land',
        icon: Sprout,
        label: 'Jorda',
        fact: 'United Fruit eide enorme landområder i Guatemala - men lot det meste ligge brakk, uten å dyrke noe.',
    },
    {
        id: 'rail',
        icon: TrainFront,
        label: 'Jernbanen',
        fact: 'Selskapet eide nesten all jernbane i landet. Ingen kunne frakte varer uten å betale dem.',
    },
    {
        id: 'port',
        icon: Ship,
        label: 'Havna og skipene',
        fact: 'United Fruit kontrollerte den viktigste havna og hadde sin egen flåte av kjøleskip.',
    },
    {
        id: 'post',
        icon: Radio,
        label: 'Posten og telegrafen',
        fact: 'Selskapet styrte til og med posten og telegrafen. De kontrollerte hvordan landet kommuniserte.',
    },
    {
        id: 'politics',
        icon: Landmark,
        label: 'Politikerne',
        fact: 'Med så mye makt kunne selskapet presse og bestikke lokale ledere til å gjøre som de ville.',
    },
    {
        id: 'washington',
        icon: Building2,
        label: 'Vennene i Washington',
        fact: 'USAs utenriksminister og CIA-sjefen, brødrene Dulles, hadde begge tette bånd til selskapet.',
    },
];

export function BananaMaktnett({
    title = 'Hvem eier landet? Avdekk United Fruits grep',
}: BananaMaktnettProps) {
    const [revealed, setRevealed] = useState<Set<string>>(new Set());
    const [last, setLast] = useState<string | null>(null);

    const reveal = (id: string) => {
        setRevealed((prev) => new Set(prev).add(id));
        setLast(id);
    };
    const reset = () => {
        setRevealed(new Set());
        setLast(null);
    };

    const count = revealed.size;
    const all = count === NODES.length;
    const lastNode = NODES.find((n) => n.id === last) ?? null;

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-1 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mb-4 text-sm text-slate-500">
                I Guatemala på 1950-tallet eide ett amerikansk selskap nesten alt. Trykk på hver bit og
                se hvor langt grepet rakk.
            </p>

            {/* Grep-måler */}
            <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                        Selskapets grep
                    </span>
                    <span className="text-sm font-bold text-amber-700">
                        {count} / {NODES.length}
                    </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                        initial={false}
                        animate={{ width: `${(count / NODES.length) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                    />
                </div>
            </div>

            {/* Nodene */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {NODES.map((n) => {
                    const on = revealed.has(n.id);
                    const Icon = n.icon;
                    return (
                        <button
                            key={n.id}
                            onClick={() => reveal(n.id)}
                            className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all ${
                                on
                                    ? 'border-amber-400 bg-amber-50'
                                    : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/40'
                            } ${last === n.id ? 'ring-2 ring-amber-300' : ''}`}
                        >
                            <Icon className={`h-5 w-5 ${on ? 'text-amber-600' : 'text-slate-400'}`} />
                            <span
                                className={`text-center text-xs font-semibold ${
                                    on ? 'text-amber-800' : 'text-slate-500'
                                }`}
                            >
                                {n.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Detalj / konklusjon */}
            <div className="min-h-[92px]">
                <AnimatePresence mode="wait">
                    {all ? (
                        <motion.div
                            key="conclusion"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 140, damping: 15 }}
                            className="rounded-lg bg-slate-900 p-4 text-white"
                        >
                            <p className="text-sm leading-relaxed text-slate-100">
                                Da president Árbenz ga noe av den brakke jorda til fattige bønder, kalte
                                selskapet ham kommunist og fikk vennene sine i Washington til å handle. I
                                1954 organiserte CIA et kupp. Ett fruktselskap veltet en hel regjering.
                            </p>
                        </motion.div>
                    ) : lastNode ? (
                        <motion.div
                            key={lastNode.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                            className="rounded-lg bg-amber-50 p-4"
                        >
                            <p className="text-sm leading-relaxed text-slate-700">
                                <span className="font-bold text-amber-800">{lastNode.label}: </span>
                                {lastNode.fact}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex h-[92px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-400"
                        >
                            Trykk på en bit for å avdekke selskapets makt.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {count > 0 && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={reset}
                        className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-600"
                    >
                        <RotateCcw className="h-4 w-4" /> Start på nytt
                    </button>
                </div>
            )}
        </div>
    );
}
