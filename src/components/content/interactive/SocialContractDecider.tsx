import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Scale, Info } from 'lucide-react';

type Contract = 'hobbes' | 'locke';

export const SocialContractDecider: React.FC = () => {
    const [contract, setContract] = useState<Contract | null>(null);

    return (
        <div className="bg-slate-100/50 p-8 md:p-12 rounded-3xl border-2 border-slate-200 my-10 shadow-xl relative overflow-hidden">
            <div className="relative z-10 text-center mb-12">
                <h3 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter uppercase italic">Hvilken pakt vil du signere?</h3>
                <p className="text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                    Du befinner deg i "naturtilstanden" – før staten finnes. To filosofer tilbyr deg en vei ut av usikkerheten.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Hobbes Side */}
                <div
                    onClick={() => setContract('hobbes')}
                    className={`group cursor-pointer p-8 rounded-2xl border-4 transition-all duration-500 relative overflow-hidden flex flex-col ${contract === 'hobbes'
                        ? 'border-red-600 bg-white ring-8 ring-red-50'
                        : 'border-slate-200 bg-white/80 hover:border-red-200 hover:bg-white'
                        }`}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-xl transition-colors ${contract === 'hobbes' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-500'}`}>
                            <Sword size={24} />
                        </div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Thomas Hobbes</h4>
                    </div>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium italic">
                        "Mennesket er et ulv mot mennesket. Uten en hersker vil livet være ensomt, fattig, stygt, dyrisk og kort."
                    </p>
                    <div className="space-y-4 mb-10 flex-grow">
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                            Gi all makt til en "Suveren" (Leviathan)
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                            Garantert absolutt sikkerhet
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-red-700">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                            Ingen rett til å gjøre opprør
                        </div>
                    </div>
                    <button className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-md ${contract === 'hobbes' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                        Velg Sikkerhet
                    </button>
                </div>

                {/* Locke Side */}
                <div
                    onClick={() => setContract('locke')}
                    className={`group cursor-pointer p-8 rounded-2xl border-4 transition-all duration-500 relative overflow-hidden flex flex-col ${contract === 'locke'
                        ? 'border-emerald-600 bg-white ring-8 ring-emerald-50'
                        : 'border-slate-200 bg-white/80 hover:border-emerald-200 hover:bg-white'
                        }`}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-xl transition-colors ${contract === 'locke' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                            <Scale size={24} />
                        </div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-800">John Locke</h4>
                    </div>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium italic">
                        "Mennesket har naturlige rettigheter. Vi lager en stat bare for å ha en upartisk dommer."
                    </p>
                    <div className="space-y-4 mb-10 flex-grow">
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                            Staten får begrenset makt
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                            Beskyttelse av liv, frihet og eiendom
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-emerald-700">
                            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                            Rett til opprør hvis staten svikter
                        </div>
                    </div>
                    <button className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-md ${contract === 'locke' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                        Velg Frihet
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {contract && (
                    <motion.div
                        key={contract}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-6 rounded-xl border-t-4 shadow-xl ${contract === 'hobbes' ? 'bg-red-950/10 border-red-800' : 'bg-emerald-950/10 border-emerald-800'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${contract === 'hobbes' ? 'bg-red-900/20 text-red-500' : 'bg-emerald-900/20 text-emerald-500'}`}>
                                <Info size={24} />
                            </div>
                            <div className="text-left">
                                <h5 className="text-xl font-bold mb-2">Konsekvens for ditt samfunn:</h5>
                                <p className="text-stone-300 leading-relaxed">
                                    {contract === 'hobbes' ? (
                                        "Du er nå trygg fra vold og kaos. Men prisen er høy: Du kan ikke lenger kritisere de som styrer. Staten er en fryktinngytende makt som krever absolutt lydighet i bytte mot fred. Dette er grunnlaget for enevelde og autoritære regimer."
                                    ) : (
                                        "Du har beholdt din frihet, og staten må svare for sine handlinger. Men det er en sjanse for konflikt: Siden alle har rett til å bedømme hvem som bryter kontrakten, kan samfunnet bli mindre stabilt enn under en enehersker. Dette er grunnlaget for liberalt demokrati."
                                    )}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
