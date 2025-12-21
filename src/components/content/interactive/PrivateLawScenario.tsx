import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Gavel, User, ShieldCheck, AlertCircle, Info } from 'lucide-react';

interface Judge {
    id: string;
    name: string;
    description: string;
    ruling: string;
    reputation: number;
}

const judges: Judge[] = [
    {
        id: 'conservative',
        name: 'Tradisjons-domstolen',
        description: 'Fokuserer på nabofred og hevdvunne skikker.',
        ruling: 'Du må flytte gjerdet 20 cm tilbake. Tradisjonen sier at nabofred er viktigere enn streng eiendomsrett.',
        reputation: 4.8
    },
    {
        id: 'radical',
        name: 'NAP-Senteret (Rothbardisk)',
        description: 'Følger ikke-aggresjonsprinsippet slavisk.',
        ruling: 'Gjerdet står! Siden ingen fysisk aggresjon ble utøvd, har naboen ingen rett til å tvinge deg til å flytte det.',
        reputation: 4.2
    }
];

export const PrivateLawScenario: React.FC = () => {
    const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);

    return (
        <div className="bg-stone-50 p-8 md:p-12 rounded-3xl border border-stone-200 my-10 shadow-xl overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                <div className="max-w-xl">
                    <h3 className="text-3xl font-black text-stone-800 mb-4 tracking-tighter flex items-center gap-3">
                        <Gavel className="text-stone-700" /> PRIVAT DOMSTOL-SIMULATOR
                    </h3>
                    <p className="text-stone-600 text-lg leading-relaxed">
                        I et anarkokapitalistisk samfunn finnes ingen statlig høyesterett.
                        Du er i konflikt med naboen om et gjerde. Hvilket rettsfirma vil dere leie inn?
                    </p>
                </div>
                <div className="bg-white px-6 py-4 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-stone-100 rounded-lg text-stone-500">
                        <User size={24} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block">Ditt Rykte</span>
                        <span className="text-lg font-black text-stone-700">1450 (Middels)</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {judges.map((j) => (
                    <div
                        key={j.id}
                        onClick={() => setSelectedJudge(j)}
                        className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 relative group ${selectedJudge?.id === j.id
                                ? 'border-stone-800 bg-white ring-8 ring-stone-100'
                                : 'border-white bg-white/50 hover:border-stone-200 hover:bg-white'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xl font-bold text-stone-800">{j.name}</h4>
                            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                <ShieldCheck size={16} /> {j.reputation}
                            </div>
                        </div>
                        <p className="text-stone-500 text-sm mb-6 leading-relaxed">{j.description}</p>
                        <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${selectedJudge?.id === j.id ? 'bg-stone-800 text-white shadow-lg' : 'bg-stone-100 text-stone-400 group-hover:bg-stone-200 group-hover:text-stone-600'
                            }`}>
                            {selectedJudge?.id === j.id ? 'Valgt Domstol' : 'Velg denne'}
                        </button>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {selectedJudge && (
                    <motion.div
                        key={selectedJudge.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-stone-800 text-stone-100 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Scale size={120} />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                            <div className="p-4 bg-white/10 rounded-2xl">
                                <AlertCircle size={32} className="text-stone-400" />
                            </div>
                            <div className="flex-grow">
                                <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Dommens utfall:</h5>
                                <p className="text-2xl font-serif italic leading-relaxed text-stone-100 border-l-4 border-stone-500 pl-6 mb-8">
                                    "{selectedJudge.ruling}"
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-stone-500 block mb-1">Markedsverdi for dommeren</span>
                                        <span className="font-bold">+12 Poeng (Økt tillit)</span>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-stone-500 block mb-1">Kostnad</span>
                                        <span className="font-bold">0.02 BTC (Eienomssikret)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-6 bg-stone-200/50 rounded-2xl flex gap-4 items-start">
                <Info className="text-stone-500 shrink-0 mt-1" />
                <p className="text-sm text-stone-600 leading-relaxed font-medium">
                    Murray Rothbard og andre anarkokapitalister mener at jussen fungerer best som et
                    marked der ulike firmaer konkurrerer om å ha de mest rettferdige reglene.
                    Hvis et firma dømmer urettferdig, vil folk slutte å bruke dem, og ryktet deres ødelegges.
                </p>
            </div>
        </div>
    );
};
