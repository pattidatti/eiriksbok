import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Lock, Check, RotateCcw, TrendingUp, Vote } from 'lucide-react';

interface Reform {
    id: string;
    navn: string;
    forklaring: string;
    vekst: number; // hvor mye befolkningen vokser når den slås på
}

const REFORMER: Reform[] = [
    {
        id: 'kapital',
        navn: 'Åpne for utenlandsk kapital',
        forklaring: 'Selskaper fra Hongkong, Japan og USA får investere og bygge fabrikker.',
        vekst: 4,
    },
    {
        id: 'overskudd',
        navn: 'La bønder selge overskudd',
        forklaring: 'Bønder får selge det de dyrker utover kvoten - på egne vilkår.',
        vekst: 3,
    },
    {
        id: 'naering',
        navn: 'Tillat privat næring',
        forklaring: 'Folk får starte egne bedrifter, ansette arbeidere og tjene penger.',
        vekst: 5,
    },
];

const START_BEF = 0.03; // millioner (30 000)
const MAKS_BEF = 12; // millioner

export function ShenzhenSonen({ title = 'Den spesielle sonen' }: { title?: string }) {
    const [på, setPå] = useState<Record<string, boolean>>({});

    const aktive = REFORMER.filter((r) => på[r.id]);
    const andel = aktive.reduce((sum, r) => sum + r.vekst, 0) / REFORMER.reduce((s, r) => s + r.vekst, 0);
    const befolkning = START_BEF + andel * (MAKS_BEF - START_BEF);
    const allePå = aktive.length === REFORMER.length;

    const toggle = (id: string) => setPå((p) => ({ ...p, [id]: !p[id] }));
    const reset = () => setPå({});

    const befTekst =
        befolkning < 0.1 ? `${Math.round(befolkning * 1000)} 000` : `${befolkning.toFixed(1)} mill.`;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-sky-50 to-emerald-50">
                <Building2 className="w-5 h-5 text-sky-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">Skru på Dengs reformer og se fiskerlandsbyen Shenzhen vokse.</p>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Skyline visualizer */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-end justify-center gap-1.5 h-28">
                        {[...Array(9)].map((_, i) => {
                            const terskel = (i + 1) / 9;
                            const synlig = andel >= terskel * 0.95;
                            const maksH = 30 + ((i % 3) * 30 + Math.floor(i / 3) * 14);
                            return (
                                <motion.div
                                    key={i}
                                    className="w-5 rounded-t bg-gradient-to-t from-sky-600 to-sky-400"
                                    initial={false}
                                    animate={{ height: synlig ? maksH : 6, opacity: synlig ? 1 : 0.25 }}
                                    transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                                />
                            );
                        })}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                            <TrendingUp className="w-4 h-4 text-emerald-600" /> Innbyggere i Shenzhen
                        </div>
                        <motion.div
                            key={befTekst}
                            initial={{ scale: 1.15 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                            className="text-xl font-bold text-slate-800 tabular-nums"
                        >
                            {befTekst}
                        </motion.div>
                    </div>
                </div>

                {/* Economic levers */}
                <div className="space-y-2">
                    {REFORMER.map((r) => {
                        const aktiv = !!på[r.id];
                        return (
                            <button
                                key={r.id}
                                onClick={() => toggle(r.id)}
                                className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-lg border transition-colors ${
                                    aktiv
                                        ? 'bg-emerald-50 border-emerald-300'
                                        : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30'
                                }`}
                            >
                                <div
                                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                                        aktiv ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'
                                    }`}
                                >
                                    {aktiv && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <div>
                                    <div className={`text-sm font-medium ${aktiv ? 'text-emerald-800' : 'text-slate-700'}`}>{r.navn}</div>
                                    <div className="text-xs text-slate-500">{r.forklaring}</div>
                                </div>
                            </button>
                        );
                    })}

                    {/* Locked political lever */}
                    <div className="w-full text-left flex items-start gap-3 px-4 py-3 rounded-lg border border-slate-200 bg-slate-100/70 cursor-not-allowed">
                        <div className="mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border border-slate-300 bg-slate-200 text-slate-400">
                            <Lock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <Vote className="w-4 h-4" /> Politisk frihet
                                <span className="text-[10px] uppercase tracking-wide bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Låst</span>
                            </div>
                            <div className="text-xs text-slate-400">Deng tillot aldri dette. Partiet beholdt all politisk makt.</div>
                        </div>
                    </div>
                </div>

                {allePå && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-4 py-4 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-sm flex items-start gap-2"
                    >
                        <Building2 className="w-5 h-5 mt-0.5 shrink-0 text-sky-600" />
                        <div>
                            <strong>Fra 30 000 til 12 millioner på ett tiår.</strong>
                            <p className="text-xs mt-1 text-sky-800">
                                Dette var Dengs modell: «sosialisme med kinesiske kjennetegn». Han åpnet økonomien helt,
                                men holdt den politiske spaken låst. Velstand ja, frihet til å kjøpe og selge ja - men
                                politisk opposisjon, aldri. Da studenter krevde demokrati i 1989, svarte han med militær.
                            </p>
                            <button
                                onClick={reset}
                                className="mt-3 inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 text-xs transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Nullstill
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
