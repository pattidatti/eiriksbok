import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Scale, Heart, TrendingUp, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

// Signaturkomponent for "Hvem har makta?".
// Lyspære: maktaktører begrunner standpunktene sine på tre måter - interesse,
// prinsipp eller konsekvens - men bak selv det edleste argumentet ligger det
// nesten alltid en interesse. Eleven klassifiserer ekte sitater og avslører så
// "hvem tjener på dette?". Det trener kjerneferdigheten i kompetansemålet:
// se koblingen mellom interesse og argument.

type ArgType = 'interesse' | 'prinsipp' | 'konsekvens';

interface Card {
    quote: string;
    actor: string;
    type: ArgType;
    why: string; // hvorfor det er denne typen
    lens: string; // "hvem tjener på dette?"
}

const TYPES: { id: ArgType; label: string; tell: string; icon: typeof Scale; color: string }[] = [
    { id: 'interesse', label: 'Interesse', tell: '"Dette gagner meg og mine"', icon: Heart, color: '#db2777' },
    { id: 'prinsipp', label: 'Prinsipp', tell: '"Dette er rett etter rettferd, frihet eller likhet"', icon: Scale, color: '#7c3aed' },
    { id: 'konsekvens', label: 'Konsekvens', tell: '"Dette gir best resultat for flest"', icon: TrendingUp, color: '#0891b2' },
];

const TYPE_BY_ID = Object.fromEntries(TYPES.map((t) => [t.id, t]));

const CARDS: Card[] = [
    {
        quote: 'Olja finansierer velferdsstaten. Uten inntektene fra Nordsjøen hadde ikke Norge råd til sykehus og skoler.',
        actor: 'Equinor og oljeselskapene',
        type: 'konsekvens',
        why: 'Argumentet peker på et resultat - velferd for alle. Det er en konsekvens-begrunnelse.',
        lens: 'Bak ligger oljeselskapenes egen interesse i fortsatt drift og inntekt.',
    },
    {
        quote: 'Vi taler på vegne av framtidige generasjoner som ikke kan stemme i dag.',
        actor: 'Natur og Ungdom',
        type: 'prinsipp',
        why: 'Å tale for dem som ikke kan tale selv bygger på et rettferds- og representasjonsideal. Det er en prinsipp-begrunnelse.',
        lens: 'Det tjener miljøsaken og de stemmeløse - men også bevegelsens egen gjennomslagskraft.',
    },
    {
        quote: 'Lønnsmottakere trenger sterkere velferd og høyere lønn.',
        actor: 'Fagforeningen',
        type: 'interesse',
        why: 'Argumentet gagner først og fremst medlemmene selv. Det er en åpen interesse-begrunnelse.',
        lens: 'Det tjener fagforeningens egne medlemmer direkte.',
    },
    {
        quote: 'Høyere skatt på de rikeste fører til kapitalflukt og færre arbeidsplasser.',
        actor: 'Næringslivstopp',
        type: 'konsekvens',
        why: 'Argumentet spår et resultat - kapitalflukt. Det er en konsekvens-begrunnelse.',
        lens: 'Det tjener de rikeste, som slipper å betale høyere skatt.',
    },
    {
        quote: 'Fri presse er demokratiets grunnmur og må aldri innskrenkes.',
        actor: 'Stor avis',
        type: 'prinsipp',
        why: 'Argumentet appellerer til et demokratisk prinsipp. Det er en prinsipp-begrunnelse.',
        lens: 'Det tjener også avisens egen frihet og makt.',
    },
    {
        quote: 'Uten skole flytter familiene. Det skader næringslivet og eiendomsverdiene i bygda.',
        actor: 'Lokal næringsforening',
        type: 'interesse',
        why: 'Argumentet peker på egen vinst - næringsliv og eiendomsverdier. Det er en interesse-begrunnelse.',
        lens: 'Det tjener de lokale bedriftseierne og huseierne.',
    },
];

export const Argumentlupen: React.FC = () => {
    const [idx, setIdx] = useState(0);
    const [picked, setPicked] = useState<ArgType | null>(null);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);

    const card = CARDS[idx];
    const correct = picked === card.type;

    const pick = (t: ArgType) => {
        if (picked) return;
        setPicked(t);
        if (t === card.type) setScore((s) => s + 1);
    };

    const next = () => {
        if (idx + 1 >= CARDS.length) {
            setDone(true);
        } else {
            setIdx((i) => i + 1);
            setPicked(null);
        }
    };

    const reset = () => {
        setIdx(0);
        setPicked(null);
        setScore(0);
        setDone(false);
    };

    return (
        <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-violet-50 to-cyan-50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-800">
                    <Search className="w-5 h-5 text-violet-600" />
                    <h3 className="font-display font-bold text-lg">Argumentlupen</h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                    Maktaktører begrunner seg på tre måter. Klassifiser sitatet - og se hvem som
                    egentlig tjener på det.
                </p>
            </div>

            <div className="p-5">
                <AnimatePresence mode="wait">
                    {!done ? (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Framdrift */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                    Sitat {idx + 1} av {CARDS.length}
                                </span>
                                <span className="text-xs font-bold text-violet-600">
                                    Riktig: {score}
                                </span>
                            </div>

                            {/* Sitatkort */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="font-display text-lg text-slate-800 leading-snug">
                                    {'“'}
                                    {card.quote}
                                    {'”'}
                                </p>
                                <p className="text-sm text-slate-500 mt-2">- {card.actor}</p>
                            </div>

                            {/* Tre typeknapper */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
                                {TYPES.map((t) => {
                                    const Icon = t.icon;
                                    const isPicked = picked === t.id;
                                    const isAnswer = card.type === t.id;
                                    const showState = picked !== null;
                                    let ring = 'border-slate-200 bg-white hover:border-slate-300';
                                    if (showState && isAnswer)
                                        ring = 'border-green-400 bg-green-50';
                                    else if (showState && isPicked && !isAnswer)
                                        ring = 'border-red-300 bg-red-50';
                                    else if (showState) ring = 'border-slate-200 bg-white opacity-60';
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => pick(t.id)}
                                            disabled={picked !== null}
                                            className={`relative text-left rounded-xl border p-3 transition ${ring} ${
                                                picked === null ? 'cursor-pointer' : 'cursor-default'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <Icon className="w-4 h-4" style={{ color: t.color }} />
                                                <span className="font-bold text-sm text-slate-800">
                                                    {t.label}
                                                </span>
                                                {showState && isAnswer && (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
                                                )}
                                                {showState && isPicked && !isAnswer && (
                                                    <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                                                {t.tell}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Avsløring */}
                            <AnimatePresence>
                                {picked && (
                                    <motion.div
                                        key="reveal"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 space-y-2.5">
                                            <div
                                                className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                                                    correct
                                                        ? 'bg-green-50 border border-green-200 text-green-900'
                                                        : 'bg-amber-50 border border-amber-200 text-amber-900'
                                                }`}
                                            >
                                                {correct ? (
                                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                                                )}
                                                <span>
                                                    {correct
                                                        ? 'Riktig. '
                                                        : `Dette er en ${TYPE_BY_ID[card.type].label.toLowerCase()}-begrunnelse. `}
                                                    {card.why}
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2 rounded-xl bg-violet-50 border border-violet-200 px-4 py-3 text-sm text-violet-900">
                                                <Search className="w-4 h-4 mt-0.5 flex-shrink-0 text-violet-600" />
                                                <span>
                                                    <span className="font-bold">
                                                        Hvem tjener på dette?
                                                    </span>{' '}
                                                    {card.lens}
                                                </span>
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={next}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-bold hover:bg-violet-700 transition"
                                                >
                                                    {idx + 1 >= CARDS.length ? 'Se oppsummering' : 'Neste sitat'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                        >
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-100 mb-3">
                                <Search className="w-7 h-7 text-violet-600" />
                            </div>
                            <p className="font-display font-bold text-xl text-slate-800">
                                {score} av {CARDS.length} riktig klassifisert
                            </p>
                            <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
                                Typen er ikke det viktigste. Det viktigste er lupen: bak ethvert
                                argument - også de som høres mest edle ut - ligger det en interesse.
                                Spør alltid: hvem tjener på dette?
                            </p>
                            <button
                                onClick={reset}
                                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Prøv igjen
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-start gap-2 bg-violet-50 border-t border-violet-100 px-5 py-3 text-sm text-violet-900">
                <Search className="w-4 h-4 mt-0.5 flex-shrink-0 text-violet-600" />
                <p>
                    Å reflektere over maktaktører betyr ikke å mistro alt. Det betyr å se
                    sammenhengen mellom interesser og argumenter - og spørre hvem som tjener, og hvem
                    som ikke får komme til orde.
                </p>
            </div>
        </div>
    );
};
