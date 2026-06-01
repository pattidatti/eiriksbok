import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ArrowRight, Coins, Leaf, Ship, TriangleAlert } from 'lucide-react';

interface Fase {
    tittel: string;
    fortelling: string;
    // piler som er aktive i denne fasen
    teToBritain: boolean;
    silverToChina: boolean;
    opiumToChina: boolean;
    silverToBritain: boolean;
    sølvBritain: number; // 0-100, britisk sølvbeholdning
    avhengighet: number; // 0-100, avhengighet i Kina
}

const FASER: Fase[] = [
    {
        tittel: '1. Britene elsker te',
        fortelling:
            'På 1700-tallet drikker hele Storbritannia te - og all teen kommer fra Kina. Sammen med silke og porselen koster det enorme summer. Kina vil ikke ha britiske varer tilbake, så britene betaler alt i sølv.',
        teToBritain: true,
        silverToChina: true,
        opiumToChina: false,
        silverToBritain: false,
        sølvBritain: 35,
        avhengighet: 0,
    },
    {
        tittel: '2. Sølvet renner ut',
        fortelling:
            "Sølvet forsvinner ut av Storbritannia i en jevn strøm. East India Company trenger en løsning: noe kineserne vil kjøpe. De finner svaret i India - opium. De dyrker valmuer, lager narkotika og selger det ulovlig i Kina.",
        teToBritain: true,
        silverToChina: false,
        opiumToChina: true,
        silverToBritain: false,
        sølvBritain: 20,
        avhengighet: 35,
    },
    {
        tittel: '3. Sølvet snur',
        fortelling:
            'Nå strømmer sølvet motsatt vei - fra Kina til Storbritannia - som betaling for opium. Britene tjener på begge ender: de får sølv til teen, og kineserne blir avhengige. Millioner av kinesere ødelegges, og Kinas sølvreserver tømmes.',
        teToBritain: true,
        silverToChina: false,
        opiumToChina: true,
        silverToBritain: true,
        sølvBritain: 80,
        avhengighet: 85,
    },
];

function Flow({ label, color, Icon }: { label: string; color: string; Icon: typeof Coins }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${color}`}
        >
            <Icon className="w-3 h-3" /> {label}
        </motion.div>
    );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{label}</span>
                <span className="tabular-nums">{value}%</span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${color}`}
                    initial={false}
                    animate={{ width: `${value}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                />
            </div>
        </div>
    );
}

export function OpiumTrekanten({ title = 'Trekanthandelen' }: { title?: string }) {
    const [faseIndex, setFaseIndex] = useState(0);
    const fase = FASER[faseIndex];
    const sisteFase = faseIndex === FASER.length - 1;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-rose-50">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">Følg hvordan britene løste sølvproblemet - med opium.</p>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Triangle diagram */}
                <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[180px]">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
                            <div className="text-xs font-semibold text-slate-700">🇬🇧 Storbritannia</div>
                            <div className="mt-1 flex flex-wrap gap-1">
                                <AnimatePresence>
                                    {fase.silverToChina && <Flow key="s2c" label="sølv ut" color="bg-slate-200 text-slate-700" Icon={Coins} />}
                                    {fase.silverToBritain && <Flow key="s2b" label="sølv inn" color="bg-emerald-100 text-emerald-700" Icon={Coins} />}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
                            <div className="text-xs font-semibold text-slate-700">🇮🇳 India (britisk koloni)</div>
                            <div className="mt-1 flex flex-wrap gap-1">
                                <AnimatePresence>
                                    {fase.opiumToChina && <Flow key="o2c" label="opium" color="bg-rose-100 text-rose-700" Icon={Leaf} />}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="col-span-2 rounded-lg bg-white border border-slate-200 px-3 py-2">
                            <div className="text-xs font-semibold text-slate-700">🇨🇳 Kina</div>
                            <div className="mt-1 flex flex-wrap gap-1">
                                <AnimatePresence>
                                    {fase.teToBritain && <Flow key="t2b" label="te, silke, porselen" color="bg-amber-100 text-amber-700" Icon={Ship} />}
                                    {fase.opiumToChina && <Flow key="oin" label="mottar opium" color="bg-rose-100 text-rose-700" Icon={Leaf} />}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Meter label="Britisk sølvbeholdning" value={fase.sølvBritain} color="bg-emerald-500" />
                    <Meter label="Avhengighet i Kina" value={fase.avhengighet} color="bg-rose-500" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={faseIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm"
                    >
                        <div className="font-semibold text-slate-800 mb-1">{fase.tittel}</div>
                        {fase.fortelling}
                    </motion.div>
                </AnimatePresence>

                {!sisteFase ? (
                    <button
                        onClick={() => setFaseIndex(faseIndex + 1)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                    >
                        Neste fase <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2"
                    >
                        <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                            <strong>Dette var trekanthandelen.</strong> Britene snudde et tap til en gevinst ved å skape en
                            avhengighetskrise i Kina. Da Kina prøvde å stoppe den i 1839, svarte Storbritannia med krig.
                            <button
                                onClick={() => setFaseIndex(0)}
                                className="mt-3 inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 text-xs transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Se på nytt
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
