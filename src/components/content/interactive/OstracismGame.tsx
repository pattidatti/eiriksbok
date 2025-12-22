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
        <div className="bg-slate-50 text-slate-900 p-4 md:p-6 rounded-xl border border-slate-200 my-6 shadow-lg overflow-hidden relative">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-200">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">
                            Ostrasismespillet
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">Beskytt demokratiet mot tyranniske ambisjoner</p>
                    </div>
                </div>

                <p className="text-slate-600 mb-6 max-w-3xl text-sm leading-relaxed">
                    I det antikke Aten kunne folket stemme på hvem de mente var en trussel mot demokratiet.
                    Den som fikk flest stemmer, ble sendt i eksil i 10 år. <strong>Hvem velger du å forvise?</strong>
                </p>

                <AnimatePresence mode="wait">
                    {gameState === 'selecting' ? (
                        <motion.div
                            key="selecting"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid gap-3"
                        >
                            {candidates.map((c) => (
                                <div
                                    key={c.id}
                                    onClick={() => setSelectedId(c.id)}
                                    className={`group cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 relative ${selectedId === c.id
                                        ? 'border-blue-600 bg-white ring-2 ring-blue-50 shadow-md'
                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex flex-col gap-2">
                                        {/* Header Row: Name, Role, Risk, Button */}
                                        <div className="flex flex-wrap justify-between items-center gap-3">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-none">
                                                        {c.name}
                                                    </h4>
                                                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                                                        {c.role}
                                                    </span>
                                                </div>
                                                {c.risk === 'high' && (
                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-100">
                                                        <AlertTriangle size={10} /> Høy Risiko
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOstracize(c); }}
                                                className={`px-4 py-1.5 rounded-lg font-bold uppercase tracking-widest text-xs transition-all whitespace-nowrap ${selectedId === c.id
                                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                                                    : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                                                    }`}
                                            >
                                                {selectedId === c.id ? 'FORVIS' : 'VELG'}
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2">
                                            <p className="text-slate-600 text-sm leading-relaxed">
                                                {c.bio}
                                            </p>
                                            <div className="flex items-start gap-2 pt-1 border-t border-slate-50">
                                                <Quote className="shrink-0 text-blue-200 mt-0.5" size={12} />
                                                <p className="text-slate-400 italic text-xs font-medium">
                                                    "{c.rumor}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border-2 border-blue-100 p-6 rounded-2xl text-center shadow-lg shadow-blue-100/50"
                        >
                            <div className="mb-4 inline-flex p-4 rounded-2xl bg-red-50 text-red-600">
                                <UserX size={48} />
                            </div>
                            <h4 className="text-2xl font-black text-slate-800 mb-4">{ostracized?.name} er forvist!</h4>

                            <div className="max-w-xl mx-auto p-5 bg-slate-50 rounded-xl border border-slate-100 mb-6 text-left">
                                {ostracized?.isTyrant ? (
                                    <div className="space-y-2">
                                        <p className="text-green-600 font-bold text-sm uppercase tracking-tight">Korrekt vurdert!</p>
                                        <p className="text-slate-700 text-sm leading-relaxed">
                                            Du har fjernet en potensiell tyran som kunne ha knust demokratiet.
                                            Men husk: ved å forvise ham, har du også fjernet en som mange fattige borgere stolte på.
                                            Kan maktvakuumet etter ham føre til enda mer uro?
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-amber-600 font-bold text-sm uppercase tracking-tight">En kontroversiell beslutning...</p>
                                        <p className="text-slate-700 text-sm leading-relaxed">
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
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-sm shadow-lg shadow-slate-200"
                            >
                                Gå tilbake til Pnyx
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="p-2 bg-white text-blue-600 rounded-lg shadow-sm">
                        <CheckCircle2 size={18} />
                    </div>
                    <div>
                        <h5 className="font-black text-slate-800 mb-0.5 text-sm uppercase tracking-tight">Pedagogisk refleksjon</h5>
                        <p className="text-slate-600 text-xs leading-relaxed">
                            Ostrasisme var ment som en sikkerhetsventil mot tyranni, men det ble ofte brukt
                            som et politisk våpen for å bli kvitt rivaler.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
