import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Anchor,
    ScrollText,
    TrainFront,
    Globe2,
    Trophy,
    RotateCcw,
    Check,
    X,
} from 'lucide-react';

// Lyspære-øyeblikket: Japan ble ikke modernisert utenfra med tvang. Landet
// reiste selv ut i verden, så seg om, og handplukket det beste forbildet for
// hver del av samfunnet. Hæren fra Tyskland, marinen fra Storbritannia. Eleven
// skal kjenne at moderniseringen var et bevisst, aktivt valg - ikke noe som
// skjedde med Japan, men noe Japan gjorde.

interface Land {
    id: string;
    navn: string;
    farge: string; // tailwind bg for valgt
    kant: string; // tailwind border
}

const LAND: Land[] = [
    { id: 'storbritannia', navn: 'Storbritannia', farge: 'bg-blue-500', kant: 'border-blue-400' },
    { id: 'tyskland', navn: 'Tyskland', farge: 'bg-amber-600', kant: 'border-amber-400' },
    { id: 'frankrike', navn: 'Frankrike', farge: 'bg-indigo-500', kant: 'border-indigo-400' },
    { id: 'usa', navn: 'USA', farge: 'bg-rose-500', kant: 'border-rose-400' },
];

interface Sektor {
    id: string;
    navn: string;
    sporsmal: string;
    Icon: typeof Shield;
    riktig: string;
    fakta: string;
    feilHint: string;
}

const SEKTORER: Sektor[] = [
    {
        id: 'haer',
        navn: 'Hæren',
        sporsmal: 'Hvor skal Japan hente forbildet for en moderne hær?',
        Icon: Shield,
        riktig: 'tyskland',
        fakta: 'Preussen (Tyskland) hadde nettopp knust Frankrike i krig. Japan hentet hele hærsystemet og tyske offiserer som lærere.',
        feilHint: 'Tenk på hvem som nettopp hadde vunnet en stor krig i Europa.',
    },
    {
        id: 'marine',
        navn: 'Marinen',
        sporsmal: 'Hvem skal lære Japan å bygge moderne krigsskip?',
        Icon: Anchor,
        riktig: 'storbritannia',
        fakta: 'Storbritannia hadde verdens mektigste flåte. Britiske offiserer lærte japanerne å bygge og styre moderne stålskip.',
        feilHint: 'Hvilket land hersket på havet på 1800-tallet?',
    },
    {
        id: 'grunnlov',
        navn: 'Grunnloven',
        sporsmal: 'Hvilket land skal Japan kopiere når de skriver en grunnlov?',
        Icon: ScrollText,
        riktig: 'tyskland',
        fakta: 'Itō Hirobumi reiste til Tyskland og studerte grunnloven der. Japans nye grunnlov fra 1889 ga keiseren mye makt, akkurat som den tyske.',
        feilHint: 'Japan ville ha en sterk keiser på toppen. Hvor fant de en slik modell?',
    },
    {
        id: 'jernbane',
        navn: 'Jernbanen',
        sporsmal: 'Hvem skal bygge Japans aller første jernbane?',
        Icon: TrainFront,
        riktig: 'storbritannia',
        fakta: 'Japans første jernbane åpnet i 1872 mellom Tokyo og Yokohama. Den ble bygd av britiske ingeniører.',
        feilHint: 'Jernbanen ble oppfunnet og perfeksjonert i ett bestemt land. Hvilket?',
    },
];

type Phase = 'spiller' | 'complete';

export function MeijiModellvalg() {
    const [steg, setSteg] = useState(0);
    const [phase, setPhase] = useState<Phase>('spiller');
    const [valgt, setValgt] = useState<string | null>(null);
    const [feil, setFeil] = useState<string | null>(null);

    const sektor = SEKTORER[steg];
    const ferdig = phase === 'complete';

    const velg = (landId: string) => {
        if (valgt) return; // allerede løst dette steget
        if (landId === sektor.riktig) {
            setValgt(landId);
            setFeil(null);
        } else {
            setFeil(landId);
            // rist bort feilmarkering etter et øyeblikk
            setTimeout(() => setFeil((f) => (f === landId ? null : f)), 650);
        }
    };

    const neste = () => {
        if (steg + 1 >= SEKTORER.length) {
            setPhase('complete');
        } else {
            setSteg((s) => s + 1);
            setValgt(null);
            setFeil(null);
        }
    };

    const reset = () => {
        setSteg(0);
        setPhase('spiller');
        setValgt(null);
        setFeil(null);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Globe2 className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">Iwakura-oppdraget: hent det beste fra verden</h3>
                    <p className="text-sm text-slate-500">
                        Velg hvilket land Japan skal kopiere for hver del av samfunnet.
                    </p>
                </div>
            </div>

            {/* Hovedflate */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {!ferdig ? (
                        <motion.div
                            key={sektor.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Steg-teller */}
                            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                                Sektor {steg + 1} av {SEKTORER.length}
                            </p>

                            {/* Sektor-kort */}
                            <div className="flex items-center gap-3 mb-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                                <span className="flex-shrink-0 w-11 h-11 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                                    <sektor.Icon className="w-6 h-6" />
                                </span>
                                <div>
                                    <p className="font-bold text-slate-800 leading-tight">{sektor.navn}</p>
                                    <p className="text-sm text-slate-500 leading-snug">{sektor.sporsmal}</p>
                                </div>
                            </div>

                            {/* Land-valg */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {LAND.map((land) => {
                                    const erRiktig = valgt === land.id;
                                    const erFeil = feil === land.id;
                                    const laast = !!valgt && !erRiktig;
                                    return (
                                        <motion.button
                                            key={land.id}
                                            onClick={() => velg(land.id)}
                                            disabled={!!valgt}
                                            animate={erFeil ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                                            transition={{ duration: 0.45 }}
                                            className={`relative rounded-xl border-2 px-3 py-4 text-sm font-bold transition ${
                                                erRiktig
                                                    ? `${land.farge} ${land.kant} text-white shadow-md`
                                                    : erFeil
                                                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                                                      : laast
                                                        ? 'bg-slate-50 border-slate-200 text-slate-400'
                                                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'
                                            }`}
                                        >
                                            {land.navn}
                                            {erRiktig && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </motion.span>
                                            )}
                                            {erFeil && (
                                                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow">
                                                    <X className="w-4 h-4" />
                                                </span>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Feedback-sone (alltid i DOM) */}
                            <div className="mt-4 min-h-[64px]">
                                <AnimatePresence mode="wait">
                                    {valgt ? (
                                        <motion.div
                                            key="fakta"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3"
                                        >
                                            {sektor.fakta}
                                        </motion.div>
                                    ) : feil ? (
                                        <motion.div
                                            key="hint"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3"
                                        >
                                            Ikke helt. {sektor.feilHint}
                                        </motion.div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic px-1 py-3">
                                            Trykk på landet Japan bør lære av.
                                        </p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                            className="text-center py-4"
                        >
                            <motion.div
                                initial={{ rotate: -15, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }}
                                className="mx-auto mb-3 w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center"
                            >
                                <Trophy className="w-8 h-8 text-amber-500" />
                            </motion.div>
                            <h4 className="text-lg font-bold text-slate-800 mb-1">Japan hentet det beste fra hele verden</h4>
                            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                                Japan ble ikke modernisert med tvang utenfra. Landet reiste selv ut, så seg om, og
                                valgte med vilje det beste forbildet for hver del av samfunnet. Det er derfor Japan
                                klarte å bli en stormakt på bare noen tiår.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                {!ferdig ? (
                    <button
                        onClick={neste}
                        disabled={!valgt}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                            valgt
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {steg + 1 >= SEKTORER.length ? 'Se resultatet' : 'Neste sektor'}
                    </button>
                ) : (
                    <span className="text-sm font-medium text-emerald-700">Alle fire sektorene er valgt.</span>
                )}
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
