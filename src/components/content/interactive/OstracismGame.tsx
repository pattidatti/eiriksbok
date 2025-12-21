import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserX, Shield, AlertTriangle, CheckCircle2, Quote } from 'lucide-react';

interface Candidate {
    id: string;
    name: string;
    role: string;
    bio: string;
    rumor: string;
    risk: 'low' | 'medium' | 'high';
    isTyrant: boolean;
}

const candidates: Candidate[] = [
    {
        id: 'perikles',
        name: 'Perikles',
        role: 'Strategos (General)',
        bio: 'Har ledet Aten gjennom gullalderen. Han har enorm makt og støtte i folket, men noen mener han oppfører seg som en ukronet konge.',
        rumor: 'Det sies at han bruker bykassen på overdådige byggverk (som Parthenon) bare for å sikre sitt eget ettermæle.',
        risk: 'medium',
        isTyrant: false
    },
    {
        id: 'kleon',
        name: 'Kleon',
        role: 'Demagog',
        bio: 'En dyktig taler som fyrer opp massene. Han lover hevn mot fiender og mer pakt til de fattige.',
        rumor: 'Han kalles en pøbelleder. Noen frykter han vil bruke folkets vrede til å knuse all motstand og personlig vinning.',
        risk: 'high',
        isTyrant: true
    },
    {
        id: 'aristides',
        name: 'Aristides',
        role: 'Politiker',
        bio: 'Kjent som "den rettferdige". Han er konservativ og holder strengt på lovene.',
        rumor: 'Han er så rettferdig at folk begynner å bli lei av å høre om det. Er han for streng for vårt moderne demokrati?',
        risk: 'low',
        isTyrant: false
    }
];

export const OstracismGame: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [gameState, setGameState] = useState<'selecting' | 'result'>('selecting');
    const [ostracized, setOstracized] = useState<Candidate | null>(null);

    const handleOstracize = (candidate: Candidate) => {
        setOstracized(candidate);
        setGameState('result');
    };

    const reset = () => {
        setSelectedId(null);
        setGameState('selecting');
        setOstracized(null);
    };

    return (
        <div className="bg-slate-50 text-slate-900 p-6 md:p-10 rounded-2xl border border-slate-200 my-10 shadow-xl overflow-hidden relative">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                            Ostrasismespillet
                        </h3>
                        <p className="text-slate-500 font-medium">Beskytt demokratiet mot tyranniske ambisjoner</p>
                    </div>
                </div>

                <p className="text-slate-600 mb-10 max-w-3xl text-lg leading-relaxed">
                    I det antikke Aten kunne folket stemme på hvem de mente var en trussel mot demokratiet.
                    Den som fikk flest stemmer, ble sendt i eksil i 10 år. <strong>Hvem velger du å forvise?</strong>
                </p>

                <AnimatePresence mode="wait">
                    {gameState === 'selecting' ? (
                        <motion.div
                            key="selecting"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col gap-6"
                        >
                            {candidates.map((c) => (
                                <div
                                    key={c.id}
                                    onClick={() => setSelectedId(c.id)}
                                    className={`group cursor-pointer p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 relative ${selectedId === c.id
                                        ? 'border-blue-600 bg-white ring-4 ring-blue-50 shadow-xl'
                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

                                        {/* Avatar / Portrait Placeholder */}
                                        <div className={`w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full flex items-center justify-center text-3xl font-black uppercase tracking-tighter ${selectedId === c.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                                            }`}>
                                            {c.name.substring(0, 2)}
                                        </div>

                                        <div className="flex-grow space-y-3">
                                            <div className="flex flex-wrap justify-between items-start gap-4">
                                                <div>
                                                    <h4 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{c.name}</h4>
                                                    <p className="text-sm font-bold text-blue-500 uppercase tracking-widest">{c.role}</p>
                                                </div>
                                                {c.risk === 'high' && (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100">
                                                        <AlertTriangle size={14} /> Høy Risiko
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-slate-600 text-lg leading-relaxed">{c.bio}</p>

                                            <div className="flex items-start gap-3 pt-2">
                                                <Quote className="shrink-0 text-blue-200 mt-1" size={16} />
                                                <p className="text-slate-500 italic text-sm font-medium">
                                                    "{c.rumor}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-auto mt-4 md:mt-0 md:self-center shrink-0">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOstracize(c); }}
                                                className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all whitespace-nowrap ${selectedId === c.id
                                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-md transform scale-105'
                                                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                                                    }`}
                                            >
                                                {selectedId === c.id ? 'FORVIS' : 'VELG'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border-2 border-blue-100 p-10 rounded-3xl text-center shadow-2xl shadow-blue-100/50"
                        >
                            <div className="mb-6 inline-flex p-6 rounded-3xl bg-red-50 text-red-600">
                                <UserX size={64} />
                            </div>
                            <h4 className="text-4xl font-black text-slate-800 mb-6">{ostracized?.name} er forvist!</h4>

                            <div className="max-w-2xl mx-auto p-8 bg-slate-50 rounded-2xl border border-slate-100 mb-10">
                                {ostracized?.isTyrant ? (
                                    <div className="space-y-4">
                                        <p className="text-green-600 font-bold text-xl uppercase tracking-tight">Korrekt vurdert!</p>
                                        <p className="text-slate-700 text-lg leading-relaxed font-medium">
                                            Du har fjernet en potensiell tyran som kunne ha knust demokratiet.
                                            Men husk: ved å forvise ham, har du også fjernet en som mange fattige borgere stolte på.
                                            Kan maktvakuumet etter ham føre til enda mer uro?
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-amber-600 font-bold text-xl uppercase tracking-tight">En kontroversiell beslutning...</p>
                                        <p className="text-slate-700 text-lg leading-relaxed font-medium">
                                            {ostracized?.id === 'aristides' ? (
                                                "Du sendte bort 'den rettferdige'. Historien forteller at en borger stemte på ham bare fordi han var lei av å høre hvor rettferdig han var. Dette viser baksiden av direktedemokrati: Personlige følelser kan veie tyngre enn kompetanse."
                                            ) : (
                                                "Perikles er borte. Aten har mistet sin største strateg. Uten hans ledelse kan de neste krigene bli katastrofale. Var hans personlige makt virkelig farligere enn mangelen på lederskap?"
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={reset}
                                className="px-10 py-5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold text-lg shadow-xl shadow-slate-200"
                            >
                                Gå tilbake til Pnyx
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-12 flex items-start gap-4 bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h5 className="font-black text-slate-800 mb-1 uppercase tracking-tight">Pedagogisk refleksjon</h5>
                        <p className="text-slate-600 leading-relaxed">
                            Ostrasisme var ment som en sikkerhetsventil mot tyranni, men det ble ofte brukt
                            som et politisk våpen for å bli kvitt rivaler. Det illustrerer spenningen mellom
                            flertallets makt og rettssikkerhet for den enkelte borger.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
