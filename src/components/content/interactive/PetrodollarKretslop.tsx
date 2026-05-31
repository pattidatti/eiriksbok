import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Factory, Fuel, Landmark, Sprout, Coins, ArrowRight, RotateCcw } from 'lucide-react';

interface PetrodollarKretslopProps {
    title?: string;
}

const NODES = {
    vesten: { icon: Factory, label: 'Vesten', sub: 'kjøper olje', left: 6, top: 12 },
    opec: { icon: Fuel, label: 'Oljelandene', sub: 'OPEC', left: 70, top: 12 },
    bank: { icon: Landmark, label: 'Bankene', sub: 'i vesten', left: 70, top: 62 },
    poor: { icon: Sprout, label: 'Fattige land', sub: 'trenger penger', left: 6, top: 62 },
} as const;

type NodeKey = keyof typeof NODES;

// Hvor mynten er ved hvert steg (0 = start).
const COIN_AT: NodeKey[] = ['vesten', 'opec', 'bank', 'poor', 'bank'];

const LEGS = [
    'Vesten kjøper olje og betaler oljelandene i amerikanske dollar.',
    'Oljelandene har nå mer dollar enn de klarer å bruke. De parkerer dem i store vestlige banker.',
    'Bankene må tjene på pengene. De låner dem ut til fattige land som trenger penger.',
    'De fattige landene betaler renter tilbake til bankene, år etter år. Dollarene er hjemme igjen - men nå sitter gjelden fast i sør.',
];

export function PetrodollarKretslop({
    title = 'Følg pengene: petrodollarens kretsløp',
}: PetrodollarKretslopProps) {
    const [step, setStep] = useState(0); // 0..4
    const done = step >= 4;
    const coinKey = COIN_AT[step];
    const coin = NODES[coinKey];

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-1 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mb-4 text-sm text-slate-500">
                Oljepenger forsvinner ikke - de går i ring. Følg én dollar hele veien rundt.
            </p>

            {/* Kretsløpet */}
            <div className="relative mx-auto mb-4 h-52 w-full max-w-md">
                {(Object.keys(NODES) as NodeKey[]).map((key) => {
                    const n = NODES[key];
                    const Icon = n.icon;
                    const active = coinKey === key && step > 0;
                    const isDebt = key === 'poor' && step >= 3;
                    return (
                        <div
                            key={key}
                            className="absolute flex w-24 flex-col items-center"
                            style={{ left: `${n.left}%`, top: `${n.top}%` }}
                        >
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-colors ${
                                    active
                                        ? 'border-emerald-400 bg-emerald-50'
                                        : isDebt
                                          ? 'border-rose-300 bg-rose-50'
                                          : 'border-slate-200 bg-white'
                                }`}
                            >
                                <Icon
                                    className={`h-5 w-5 ${
                                        active ? 'text-emerald-600' : isDebt ? 'text-rose-500' : 'text-slate-400'
                                    }`}
                                />
                            </div>
                            <span className="mt-1 text-center text-xs font-bold leading-tight text-slate-700">
                                {n.label}
                            </span>
                            <span className="text-center text-[10px] leading-tight text-slate-400">
                                {isDebt ? 'gjeld!' : n.sub}
                            </span>
                        </div>
                    );
                })}

                {/* Mynten som flytter seg */}
                <motion.div
                    className="absolute z-10 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 shadow-lg ring-2 ring-white"
                    initial={false}
                    animate={{ left: `calc(${coin.left}% + 34px)`, top: `calc(${coin.top}% + 6px)` }}
                    transition={{ type: 'spring', stiffness: 90, damping: 16 }}
                >
                    <Coins className="h-4 w-4 text-amber-900" />
                </motion.div>
            </div>

            {/* Beskrivelse */}
            <div className="min-h-[76px]">
                <AnimatePresence mode="wait">
                    {step === 0 ? (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex h-[76px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-400"
                        >
                            Trykk på knappen for å sende dollaren av gårde.
                        </motion.div>
                    ) : (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`rounded-lg p-4 ${done ? 'bg-slate-900' : 'bg-amber-50'}`}
                        >
                            <p className={`text-sm leading-relaxed ${done ? 'text-slate-100' : 'text-slate-700'}`}>
                                {LEGS[step - 1]}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Knapperad */}
            <div className="mt-5 flex items-center justify-between">
                <button
                    onClick={() => setStep(0)}
                    className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-600"
                >
                    <RotateCcw className="h-4 w-4" /> Start på nytt
                </button>
                {!done ? (
                    <button
                        onClick={() => setStep((s) => s + 1)}
                        className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-amber-600"
                    >
                        Følg pengene <ArrowRight className="h-4 w-4" />
                    </button>
                ) : (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    >
                        Olje blir dollar, dollar blir lån, lån blir gjeld.
                    </motion.span>
                )}
            </div>
        </div>
    );
}
