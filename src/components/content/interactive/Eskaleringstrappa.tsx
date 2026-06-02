import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ShieldCheck, MessageSquare, Hammer, Skull, RotateCcw, Play, Lightbulb } from 'lucide-react';

// Signaturkomponent for "Fra hat til folkemord".
// Lyspaere: folkemord bygges som en trapp. Nesten hele trappen er ord, lover og
// planlegging - bare det oeverste trinnet er selve volden. Derfor kan vi se den
// komme, og jo tidligere vi setter inn en motkraft, jo mer hindres.
// Eleven plasserer en motkraft paa et trinn og ser eskaleringen klatre nedenfra
// og stoppe der. Tidlig inngrep slukker alt over; sent inngrep redder lite.

type Kind = 'ord' | 'forberedelse' | 'vold';

interface Step {
    n: number; // 1 = nederst, 8 = oeverst
    title: string;
    kind: Kind;
    desc: string;
    motkraft: string;
}

// Gregory Stantons trapp, nederst (1) til oeverst (8).
const STEPS: Step[] = [
    { n: 1, title: 'Klassifisering', kind: 'ord', desc: 'Vi deler verden i "oss" og "dem".', motkraft: 'Snakk om et felles "vi" - vi er naboer og landsmenn.' },
    { n: 2, title: 'Symbolisering', kind: 'ord', desc: 'Gruppen far et merke eller et nedsettende navn.', motkraft: 'Avvis hatefulle kallenavn og merkelapper.' },
    { n: 3, title: 'Diskriminering', kind: 'ord', desc: 'Lover behandler gruppen darligere enn andre.', motkraft: 'Like rettigheter og uavhengige domstoler.' },
    { n: 4, title: 'Dehumanisering', kind: 'ord', desc: 'Gruppen kalles dyr, parasitter eller sykdom.', motkraft: 'Se enkeltmenneskene - ikke "gruppen".' },
    { n: 5, title: 'Organisering', kind: 'forberedelse', desc: 'Ekstreme grupper begynner a planlegge vold.', motkraft: 'Forby hatgrupper og varsle politiet tidlig.' },
    { n: 6, title: 'Polarisering', kind: 'ord', desc: 'Moderate stemmer ties og trues til taushet.', motkraft: 'Beskytt og loft fram de moderate stemmene.' },
    { n: 7, title: 'Forberedelse', kind: 'forberedelse', desc: 'Lister lages, vapen samles, ofre pekes ut.', motkraft: 'Tidlig varsling og internasjonalt press.' },
    { n: 8, title: 'Utryddelse', kind: 'vold', desc: 'Massedrapet begynner.', motkraft: 'Inngripen, beskyttelse og rettsforfolgelse.' },
];

const KIND_META: Record<Kind, { label: string; chip: string; bar: string; icon: React.ReactNode }> = {
    ord: {
        label: 'Ord, lover og propaganda',
        chip: 'bg-sky-100 text-sky-700 border-sky-200',
        bar: '#0ea5e9',
        icon: <MessageSquare className="w-3.5 h-3.5" />,
    },
    forberedelse: {
        label: 'Planlegging og forberedelse',
        chip: 'bg-amber-100 text-amber-800 border-amber-200',
        bar: '#d97706',
        icon: <Hammer className="w-3.5 h-3.5" />,
    },
    vold: {
        label: 'Selve volden',
        chip: 'bg-rose-100 text-rose-700 border-rose-200',
        bar: '#e11d48',
        icon: <Skull className="w-3.5 h-3.5" />,
    },
};

type Phase = 'setup' | 'playing' | 'done';

export const Eskaleringstrappa: React.FC = () => {
    // Trinnet der motkraften staar. null = ingen motkraft (trappen far loepe helt opp).
    const [guard, setGuard] = useState<number | null>(null);
    const [phase, setPhase] = useState<Phase>('setup');
    const [climb, setClimb] = useState(0); // hvor hoyt eskaleringen har klatret (0..8)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Eskaleringen stoppes RETT UNDER motkraften: trinn >= guard blir hindret.
    const topReached = guard === null ? 8 : guard - 1;

    useEffect(() => {
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, []);

    const play = () => {
        if (timer.current) clearTimeout(timer.current);
        setPhase('playing');
        setClimb(0);
        const step = (lvl: number) => {
            if (lvl > topReached) {
                setPhase('done');
                return;
            }
            setClimb(lvl);
            timer.current = setTimeout(() => step(lvl + 1), 420);
        };
        // liten forsinkelse foer foerste trinn
        timer.current = setTimeout(() => step(1), 250);
    };

    const reset = () => {
        if (timer.current) clearTimeout(timer.current);
        setPhase('setup');
        setClimb(0);
        setGuard(null);
    };

    const blocked = phase === 'done' && guard !== null;
    const ordCount = STEPS.filter((s) => s.kind === 'ord').length;

    // Resultattekst etter avspilling.
    const verdict = (() => {
        if (phase !== 'done') return null;
        if (guard === null) {
            return {
                tone: 'bad' as const,
                title: 'Trappen loep helt til topps',
                body: 'Ingen grep inn. Da klatret hatet steg for steg helt opp til utryddelsen. Hvert trinn gjorde det neste lettere. Sett inn en motkraft og spill av paa nytt - se hvor mye du kan hindre.',
            };
        }
        if (guard <= 4) {
            return {
                tone: 'good' as const,
                title: `Du grep inn mens det fortsatt bare var ord (steg ${guard})`,
                body: 'All volden ble hindret. Dette er den sterkeste forebyggingen: kildekritikk, inkludering og motstemmer som stopper trappen mens den enna er sprak, ikke handling.',
            };
        }
        if (guard <= 7) {
            return {
                tone: 'mid' as const,
                title: `Du stoppet det under planleggingen (steg ${guard})`,
                body: 'Massedrapet ble hindret rett for det startet. Men mye skade var alt skjedd: frykt, forfolgelse og trusler hadde allerede rammet folk. Forebygging virker best lenger ned i trappen.',
            };
        }
        return {
            tone: 'bad' as const,
            title: 'Du grep inn helt pa toppen (steg 8)',
            body: 'Da er det nesten for sent - volden er allerede i gang. A stanse et folkemord midt i handlingen koster enormt. Den virkelige forebyggingen ligger nede i trappen, lenge for vapnene.',
        };
    })();

    return (
        <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-800">
                    <Flame className="w-5 h-5 text-rose-600" />
                    <h3 className="font-display font-bold text-lg">Eskaleringstrappa</h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                    Folkemord skjer ikke plutselig - det klatrer en trapp. Klikk et trinn for a sette
                    inn en motkraft, og spill av for a se hvor hoyt hatet rekker.
                </p>
            </div>

            <div className="p-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
                {/* Venstre: trappen */}
                <div className="flex flex-col-reverse gap-1.5">
                    {STEPS.map((s) => {
                        const meta = KIND_META[s.kind];
                        const reached = climb >= s.n;
                        const isGuard = guard === s.n;
                        const ghosted = blocked && s.n >= (guard ?? 99);
                        const indent = (s.n - 1) * 16;
                        return (
                            <div key={s.n} className="relative" style={{ marginLeft: indent }}>
                                <motion.button
                                    type="button"
                                    onClick={() => phase === 'setup' && setGuard(isGuard ? null : s.n)}
                                    disabled={phase !== 'setup'}
                                    initial={false}
                                    animate={{
                                        scale: reached && phase === 'playing' && climb === s.n ? 1.04 : 1,
                                        opacity: ghosted ? 0.35 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className={`w-full text-left rounded-xl border px-3 py-2 flex items-center gap-2.5 transition ${
                                        phase === 'setup'
                                            ? 'cursor-pointer hover:border-rose-300 hover:shadow-sm'
                                            : 'cursor-default'
                                    } ${
                                        reached
                                            ? s.kind === 'vold'
                                                ? 'border-rose-300 bg-rose-50'
                                                : 'border-orange-300 bg-orange-50'
                                            : 'border-slate-200 bg-slate-50'
                                    }`}
                                >
                                    <span
                                        className="flex-shrink-0 w-7 h-7 rounded-lg grid place-items-center text-xs font-bold text-white"
                                        style={{ backgroundColor: reached ? meta.bar : '#cbd5e1' }}
                                    >
                                        {s.n}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-slate-800 text-sm">{s.title}</span>
                                            <span
                                                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${meta.chip}`}
                                            >
                                                {meta.icon}
                                                {s.kind === 'ord' ? 'ORD' : s.kind === 'forberedelse' ? 'FORBEREDELSE' : 'VOLD'}
                                            </span>
                                        </span>
                                        <span className="block text-xs text-slate-500 leading-snug mt-0.5">
                                            {s.desc}
                                        </span>
                                    </span>
                                    {/* Eskaleringsflamme paa det hoyest naadde trinnet */}
                                    <AnimatePresence>
                                        {phase !== 'setup' && climb === s.n && !blocked && (
                                            <motion.span
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                className="flex-shrink-0"
                                            >
                                                <Flame className="w-5 h-5 text-rose-500" />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>

                                {/* Motkraft-merke */}
                                <AnimatePresence>
                                    {isGuard && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -8 }}
                                            className="mt-1 ml-9 flex items-start gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5"
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                            <span>
                                                <strong>Motkraft her:</strong> {s.motkraft}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Hoyre: styring + telleverk + resultat */}
                <div className="flex flex-col gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                            Hva er trappen laget av?
                        </p>
                        <div className="space-y-1.5 text-sm">
                            {(['ord', 'forberedelse', 'vold'] as Kind[]).map((k) => {
                                const count = STEPS.filter((s) => s.kind === k).length;
                                return (
                                    <div key={k} className="flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: KIND_META[k].bar }}
                                        />
                                        <span className="text-slate-700">{KIND_META[k].label}</span>
                                        <span className="ml-auto font-bold text-slate-800">{count} steg</span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-slate-500 mt-2 leading-snug">
                            {ordCount} av 8 trinn er bare ord. Bare 1 er selve volden - men da er det
                            for sent. Volden vokser fram av alt som kom for.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={play}
                            disabled={phase === 'playing'}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition disabled:opacity-50"
                        >
                            <Play className="w-4 h-4" />
                            {guard === null ? 'Spill uten motkraft' : 'Spill av'}
                        </button>
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>

                    {phase === 'setup' && (
                        <p className="text-xs text-slate-500 leading-snug">
                            {guard === null
                                ? 'Tips: klikk et trinn for a sette inn en motkraft som bryter kjeden der.'
                                : `Motkraft satt pa steg ${guard}. Spill av for a se hva som hindres.`}
                        </p>
                    )}

                    <AnimatePresence mode="wait">
                        {verdict && (
                            <motion.div
                                key={verdict.title}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className={`rounded-xl border p-3 text-sm ${
                                    verdict.tone === 'good'
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                                        : verdict.tone === 'mid'
                                          ? 'border-amber-200 bg-amber-50 text-amber-900'
                                          : 'border-rose-200 bg-rose-50 text-rose-900'
                                }`}
                            >
                                <p className="font-bold mb-1">{verdict.title}</p>
                                <p className="leading-snug">{verdict.body}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex items-start gap-2 bg-rose-50 border-t border-rose-100 px-5 py-3 text-sm text-rose-900">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                <p>
                    Folkemord bygges med sprak lenge for det bygges med vapen. Nesten hele trappen er
                    ord, lover og propaganda - det er derfor vi kan se den komme. Og jo tidligere
                    motkraften settes inn, jo mer hindres.
                </p>
            </div>
        </div>
    );
};
