import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Droplet, Wheat, Stethoscope, CheckCircle2, RotateCcw, Landmark } from 'lucide-react';

interface StrukturtilpasningSimProps {
    title?: string;
}

interface Demand {
    id: string;
    icon: typeof Droplet;
    label: string;
    detail: string;
    approval: number; // hvor mye IMF liker dette
    welfare: number; // hvor mye folkets velferd faller
}

const DEMANDS: Demand[] = [
    {
        id: 'school',
        icon: GraduationCap,
        label: 'Kutt i skolen',
        detail: 'Færre lærere og høyere skolepenger. Mange barn må slutte på skolen.',
        approval: 25,
        welfare: 22,
    },
    {
        id: 'water',
        icon: Droplet,
        label: 'Selg vannet',
        detail: 'Vannforsyningen privatiseres. Et utenlandsk selskap overtar og setter opp prisen.',
        approval: 25,
        welfare: 24,
    },
    {
        id: 'food',
        icon: Wheat,
        label: 'Fjern matstøtten',
        detail: 'Staten slutter å holde brødprisen nede. Maten blir dyrere for de fattigste.',
        approval: 25,
        welfare: 26,
    },
    {
        id: 'health',
        icon: Stethoscope,
        label: 'Kutt i helse',
        detail: 'Sykehus får mindre penger, så landet kan bruke mer på å betale renter.',
        approval: 25,
        welfare: 20,
    },
];

const LOAN_NEEDED = 100;

export function StrukturtilpasningSim({
    title = 'Få lånet: godta IMFs krav',
}: StrukturtilpasningSimProps) {
    const [accepted, setAccepted] = useState<Set<string>>(new Set());

    const approval = DEMANDS.filter((d) => accepted.has(d.id)).reduce((s, d) => s + d.approval, 0);
    const welfare = 100 - DEMANDS.filter((d) => accepted.has(d.id)).reduce((s, d) => s + d.welfare, 0);
    const loanReleased = approval >= LOAN_NEEDED;

    const accept = (id: string) => {
        if (loanReleased) return;
        setAccepted((prev) => new Set(prev).add(id));
    };
    const reset = () => setAccepted(new Set());

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-1 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mb-5 text-sm text-slate-500">
                Du er finansminister i et fattig land. Du trenger et nytt lån fra IMF for å betale gammel
                gjeld. Men lånet kommer med krav. Godta dem for å låse opp pengene.
            </p>

            {/* Målere */}
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <Landmark className="h-3.5 w-3.5" /> Lånet frigjøres
                        </span>
                        <span className="text-sm font-bold text-indigo-600">{approval}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <motion.div
                            className="h-full rounded-full bg-indigo-500"
                            initial={false}
                            animate={{ width: `${Math.min(approval, 100)}%` }}
                            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                        />
                    </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Folkets velferd
                        </span>
                        <motion.span
                            key={welfare}
                            initial={{ scale: 1.25 }}
                            animate={{ scale: 1 }}
                            className={`text-sm font-bold ${
                                welfare > 60 ? 'text-emerald-600' : welfare > 30 ? 'text-amber-600' : 'text-rose-600'
                            }`}
                        >
                            {welfare}%
                        </motion.span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <motion.div
                            className={`h-full rounded-full ${
                                welfare > 60 ? 'bg-emerald-500' : welfare > 30 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            initial={false}
                            animate={{ width: `${Math.max(welfare, 0)}%` }}
                            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!loanReleased ? (
                    <motion.div
                        key="demands"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid gap-2.5 sm:grid-cols-2"
                    >
                        {DEMANDS.map((d) => {
                            const on = accepted.has(d.id);
                            const Icon = d.icon;
                            return (
                                <button
                                    key={d.id}
                                    onClick={() => accept(d.id)}
                                    disabled={on}
                                    className={`flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                                        on
                                            ? 'border-slate-300 bg-slate-100 opacity-70'
                                            : 'border-slate-200 bg-white hover:border-indigo-300'
                                    }`}
                                >
                                    <div
                                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                            on ? 'bg-slate-400 text-white' : 'bg-slate-100 text-slate-400'
                                        }`}
                                    >
                                        {on ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-slate-800">
                                            {on ? `${d.label} (godtatt)` : d.label}
                                        </span>
                                        <p className="mt-1 text-xs leading-snug text-slate-600">{d.detail}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="released"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 140, damping: 15 }}
                        className="rounded-lg bg-indigo-600 p-4 text-white"
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-base font-bold">Lånet er utbetalt</span>
                        </div>
                        <p className="text-sm leading-relaxed text-indigo-50">
                            Gratulerer, du fikk pengene. Men se på velferdsmåleren: for å betale gammel
                            gjeld måtte du kutte skole, helse, vann og mat for ditt eget folk. Dette kalles
                            strukturtilpasning. Landet betaler lånet - men folket betaler prisen.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-5 flex items-center justify-between">
                <button
                    onClick={reset}
                    className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-600"
                >
                    <RotateCcw className="h-4 w-4" /> Start på nytt
                </button>
                <span className="text-xs text-slate-400">
                    {loanReleased ? 'Lånet er låst opp.' : 'Godta nok krav til å nå 100 %.'}
                </span>
            </div>
        </div>
    );
}
