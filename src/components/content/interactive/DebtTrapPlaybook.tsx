import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    TrendingUp,
    Banknote,
    Building2,
    AlertTriangle,
    Scale,
    Crosshair,
    LogOut,
    RotateCcw,
    ArrowRight,
} from 'lucide-react';

interface DebtTrapPlaybookProps {
    title?: string;
}

interface Move {
    icon: typeof Target;
    place: string;
    tool: string; // grepet leiemorderen bruker
    text: string;
    control: number; // 0-100, samlet kontroll etter dette steget
    debt: number; // Petrolias gjeld i milliarder dollar
}

// De fem grepene bygges opp ett etter ett. Steg 5 er valget.
const MOVES: Move[] = [
    {
        icon: Target,
        place: 'Du velger målet',
        tool: 'Finn et land med noe vesten vil ha',
        text: 'Petrolia er fattig, men har nettopp funnet olje. Det gjør landet perfekt. Du lander i hovedstaden med dress og stresskoffert, ikke uniform og gevær.',
        control: 8,
        debt: 0,
    },
    {
        icon: TrendingUp,
        place: 'Den gylne prognosen',
        tool: 'Lov en vekst som er for god til å være sann',
        text: 'Du lager en rapport som spår enorm vekst hvis landet bygger et gigantisk kraftverk. Tallene er blåst opp med vilje. Men de ser overbevisende ut, og presidenten vil gjerne tro på dem.',
        control: 22,
        debt: 0,
    },
    {
        icon: Banknote,
        place: 'Det store lånet',
        tool: 'Få landet til å låne mer enn det kan betale',
        text: 'Verdensbanken låner Petrolia 6 milliarder dollar til kraftverket. Presidenten skriver under. Han tror han har vunnet en gavepakke. Egentlig har han signert lenken sin.',
        control: 38,
        debt: 6,
    },
    {
        icon: Building2,
        place: 'Pengene forsvinner',
        tool: 'La lånet havne hos dine egne selskaper',
        text: 'Nesten alle pengene går rett tilbake til amerikanske selskaper som Bechtel og Halliburton. De bygger kraftverket og tar fortjenesten. I Petrolia blir bare gjelden igjen - og strømmen når mest de rike.',
        control: 52,
        debt: 6,
    },
    {
        icon: AlertTriangle,
        place: 'Gjeldsfellen klapper igjen',
        tool: 'Vent til landet ikke klarer å betale',
        text: 'Rentene vokser. Petrolia klarer ikke å betale tilbake. Nå kommer du tilbake - ikke for å kreve penger, men noe mye mer verdt: olje, en militærbase, og at landet stemmer med USA i FN.',
        control: 70,
        debt: 9,
    },
];

// Sluttilstander etter valget på steg 6.
const OUTCOMES = {
    jackals: {
        icon: Crosshair,
        title: 'Du sendte sjakalene',
        control: 100,
        debt: 11,
        verdict:
            'President Aguilar nektet. Da overtok "sjakalene": et kupp støttet i det skjulte. En ny, vennlig leder gir deg alt du ba om. Petrolia er fritt på papiret, men styrt utenfra. Dette er nøyaktig det som skjedde i Iran (1953) og Chile (1973).',
        tone: 'rose' as const,
    },
    withdraw: {
        icon: LogOut,
        title: 'Du trakk deg',
        control: 30,
        debt: 9,
        verdict:
            'Du lot Petrolia slippe unna. Det skjer nesten aldri. For når lånene og sjakalene ikke virker, er siste utvei militær invasjon - slik Perkins mener skjedde i Irak. Systemet gir sjelden opp.',
        tone: 'emerald' as const,
    },
};

export function DebtTrapPlaybook({
    title = 'Spill økonomisk leiemorder: erobre Petrolia',
}: DebtTrapPlaybookProps) {
    // step 0-4: grepene. step 5: valget. step 6: resultat.
    const [step, setStep] = useState(0);
    const [choice, setChoice] = useState<'jackals' | 'withdraw' | null>(null);

    const isMove = step <= 4;
    const isDecision = step === 5;
    const isResult = step === 6;

    const outcome = choice ? OUTCOMES[choice] : null;

    const control = isResult && outcome ? outcome.control : MOVES[Math.min(step, 4)].control;
    const debt = isResult && outcome ? outcome.debt : MOVES[Math.min(step, 4)].debt;

    const reset = () => {
        setStep(0);
        setChoice(null);
    };

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-1 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mb-5 text-sm text-slate-500">
                Du er leiemorderen. Mål: full kontroll uten å avfyre et eneste skudd.
            </p>

            {/* Målere */}
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Din kontroll over Petrolia
                        </span>
                        <motion.span
                            key={control}
                            initial={{ scale: 1.3, color: '#e11d48' }}
                            animate={{ scale: 1, color: '#0f172a' }}
                            className="text-sm font-bold"
                        >
                            {control}%
                        </motion.span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
                            initial={false}
                            animate={{ width: `${control}%` }}
                            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                        />
                    </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Petrolias gjeld
                        </span>
                        <motion.span
                            key={debt}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            className="text-sm font-bold text-slate-900"
                        >
                            {debt} mrd $
                        </motion.span>
                    </div>
                    <div className="flex h-3 items-center gap-1">
                        {Array.from({ length: 11 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className={`h-3 flex-1 rounded-sm ${
                                    i < debt ? 'bg-amber-500' : 'bg-slate-200'
                                }`}
                                initial={false}
                                animate={{ scaleY: i < debt ? 1 : 0.5 }}
                                transition={{ delay: i * 0.02 }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Stegprikker */}
            <div className="mb-5 flex items-center gap-2">
                {MOVES.map((m, i) => {
                    const StIcon = m.icon;
                    const done = i < step || isResult;
                    const active = i === step && isMove;
                    return (
                        <div key={i} className="flex flex-1 items-center">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                                    done || active
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-slate-100 text-slate-400'
                                } ${active ? 'ring-2 ring-rose-200' : ''}`}
                            >
                                <StIcon className="h-4 w-4" />
                            </div>
                            <div
                                className={`mx-1 h-1 flex-1 rounded ${
                                    i < step || isResult ? 'bg-rose-600' : 'bg-slate-100'
                                }`}
                            />
                        </div>
                    );
                })}
                {/* Siste prikk: valget/resultatet */}
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                        isDecision || isResult ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                >
                    <Scale className="h-4 w-4" />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* GREP-STEG */}
                {isMove && (
                    <motion.div
                        key={`move-${step}`}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="mb-2 flex items-center gap-2 text-rose-700">
                            {(() => {
                                const Icon = MOVES[step].icon;
                                return <Icon className="h-5 w-5" />;
                            })()}
                            <span className="text-base font-bold">
                                Grep {step + 1}: {MOVES[step].place}
                            </span>
                        </div>
                        <p className="mb-3 inline-block rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                            {MOVES[step].tool}
                        </p>
                        <p className="text-sm leading-relaxed text-slate-700">{MOVES[step].text}</p>
                    </motion.div>
                )}

                {/* VALGET */}
                {isDecision && (
                    <motion.div
                        key="decision"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="mb-2 flex items-center gap-2 text-slate-900">
                            <Scale className="h-5 w-5" />
                            <span className="text-base font-bold">Presidenten sier nei</span>
                        </div>
                        <p className="mb-4 text-sm leading-relaxed text-slate-700">
                            President Aguilar nekter å selge unna landet sitt. Han vil gi oljen til
                            sitt eget folk. Lånene dine virker ikke lenger. Hva gjør du?
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                onClick={() => {
                                    setChoice('jackals');
                                    setStep(6);
                                }}
                                className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-left transition-all hover:border-rose-400 hover:bg-rose-100"
                            >
                                <span className="flex items-center gap-2 font-semibold text-rose-700">
                                    <Crosshair className="h-4 w-4" /> Send sjakalene
                                </span>
                                <span className="mt-1 block text-xs text-slate-600">
                                    Et kupp i det skjulte. Bytt ut presidenten.
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    setChoice('withdraw');
                                    setStep(6);
                                }}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-left transition-all hover:border-emerald-400 hover:bg-emerald-100"
                            >
                                <span className="flex items-center gap-2 font-semibold text-emerald-700">
                                    <LogOut className="h-4 w-4" /> Trekk deg
                                </span>
                                <span className="mt-1 block text-xs text-slate-600">
                                    La Petrolia beholde oljen sin.
                                </span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* RESULTAT */}
                {isResult && outcome && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 140, damping: 16 }}
                    >
                        <div
                            className={`rounded-lg p-4 ${
                                outcome.tone === 'rose' ? 'bg-rose-50' : 'bg-emerald-50'
                            }`}
                        >
                            <div
                                className={`mb-2 flex items-center gap-2 ${
                                    outcome.tone === 'rose' ? 'text-rose-700' : 'text-emerald-700'
                                }`}
                            >
                                <outcome.icon className="h-5 w-5" />
                                <span className="text-base font-bold">{outcome.title}</span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-700">{outcome.verdict}</p>
                        </div>
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Poenget
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                                Du trengte aldri en hær. Et lån landet ikke kunne betale tilbake var nok
                                til å styre det. Slik fungerer en økonomisk leiemorder.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Knapperad */}
            <div className="mt-5 flex items-center justify-between">
                <button
                    onClick={reset}
                    className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-600"
                >
                    <RotateCcw className="h-4 w-4" /> Start på nytt
                </button>
                {isMove && (
                    <button
                        onClick={() => setStep((p) => p + 1)}
                        className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-rose-700"
                    >
                        {step < 4 ? 'Bruk grepet' : 'Krev betaling'} <ArrowRight className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
