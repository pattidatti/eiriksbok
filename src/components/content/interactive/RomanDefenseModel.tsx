import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sword, AlertCircle } from 'lucide-react';

export const RomanDefenseModel: React.FC = () => {
    const [step, setStep] = useState<'idle' | 'invasion' | 'limitanei' | 'comitatenses'>('idle');

    return (
        <div className="w-full max-w-3xl mx-auto my-12 p-8 bg-slate-100 rounded-3xl shadow-xl border border-slate-200">
            <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-slate-900">Diokletians "Forsvar i dybden"</h3>
                <p className="text-slate-600">Simuler hvordan det nye romerske forsvaret stoppet en invasjon.</p>
            </div>

            <div className="relative aspect-video bg-white rounded-2xl border-4 border-slate-200 overflow-hidden mb-8">
                {/* The Border (Limes) */}
                <div className="absolute top-0 right-0 w-8 h-full bg-slate-300 border-l-2 border-slate-400 flex flex-col justify-around items-center">
                    <div className="w-4 h-4 bg-slate-500 rounded-sm"></div>
                    <div className="w-4 h-4 bg-slate-500 rounded-sm"></div>
                    <div className="w-4 h-4 bg-slate-500 rounded-sm"></div>
                    <div className="w-4 h-4 bg-slate-500 rounded-sm"></div>
                </div>
                <div className="absolute top-0 right-10 h-full flex flex-col justify-around items-center">
                    <div className="text-[10px] font-bold text-slate-400 -rotate-90 origin-center">LIMES (GRENSEN)</div>
                </div>

                {/* Limitanei (Border Troops) */}
                <div className="absolute top-0 right-2 w-12 h-full flex flex-col justify-around items-center py-4">
                    <motion.div
                        initial={{ opacity: 0.5 }}
                        animate={{
                            opacity: step === 'limitanei' || step === 'invasion' ? 1 : 0.5,
                            scale: step === 'limitanei' ? 1.2 : 1,
                            x: step === 'limitanei' ? -10 : 0
                        }}
                        className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"
                    ></motion.div>
                    <motion.div
                        animate={{
                            opacity: step === 'limitanei' || step === 'invasion' ? 1 : 0.5,
                            scale: step === 'limitanei' ? 1.2 : 1,
                            x: step === 'limitanei' ? -10 : 0
                        }}
                        className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"
                    ></motion.div>
                    <motion.div
                        animate={{
                            opacity: step === 'limitanei' || step === 'invasion' ? 1 : 0.5,
                            scale: step === 'limitanei' ? 1.2 : 1,
                            x: step === 'limitanei' ? -10 : 0
                        }}
                        className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"
                    ></motion.div>
                </div>

                {/* Comitatenses (Mobile Reserve) */}
                <motion.div
                    initial={{ x: -100, y: 100 }}
                    animate={{
                        x: step === 'comitatenses' ? 180 : 20,
                        y: step === 'comitatenses' ? 70 : 100,
                        scale: step === 'comitatenses' ? 1.3 : 1
                    }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="absolute left-10 top-1/2 -translate-y-1/2"
                >
                    <div className="relative">
                        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white">
                            <Sword className="w-6 h-6" />
                        </div>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-red-600 bg-white/80 px-1 rounded">COMITATENSES</div>
                    </div>
                </motion.div>

                {/* Barbarian Invasjon */}
                <AnimatePresence>
                    {(step === 'invasion' || step === 'limitanei' || step === 'comitatenses') && (
                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{
                                x: step === 'invasion' ? -20 : step === 'comitatenses' ? 200 : -60,
                                opacity: step === 'comitatenses' ? 0.3 : 1
                            }}
                            transition={{ duration: 2 }}
                            className="absolute right-0 top-1/3"
                        >
                            <div className="flex gap-2">
                                <div className="w-6 h-6 bg-slate-800 rounded-full border-2 border-white shadow-sm"></div>
                                <div className="w-6 h-6 bg-slate-800 rounded-full border-2 border-white shadow-sm"></div>
                                <div className="w-6 h-6 bg-slate-800 rounded-full border-2 border-white shadow-sm"></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Feedback Text overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <AnimatePresence>
                        {step === 'limitanei' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" /> ALARM SENDT!
                            </motion.div>
                        )}
                        {step === 'comitatenses' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                                <Shield className="w-5 h-5" /> FIENDEN SLÅTT TILBAKE!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => setStep('invasion')}
                    className={`p-4 rounded-xl border-2 transition-all ${step === 'invasion' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:border-slate-400'}`}
                >
                    <div className="text-xl mb-1">🔥</div>
                    <div className="font-bold text-sm">Invasjon</div>
                    <div className="text-[10px] opacity-70">Barbarer bryter Limes</div>
                </button>
                <button
                    disabled={step === 'idle'}
                    onClick={() => setStep('limitanei')}
                    className={`p-4 rounded-xl border-2 transition-all ${step === 'limitanei' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 hover:border-slate-400 disabled:opacity-50'}`}
                >
                    <div className="text-xl mb-1">🛡️</div>
                    <div className="font-bold text-sm">Limitanei</div>
                    <div className="text-[10px] opacity-70">Grensetropper sinker fienden</div>
                </button>
                <button
                    disabled={step !== 'limitanei'}
                    onClick={() => setStep('comitatenses')}
                    className={`p-4 rounded-xl border-2 transition-all ${step === 'comitatenses' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-slate-200 hover:border-slate-400 disabled:opacity-50'}`}
                >
                    <div className="text-xl mb-1">⚡</div>
                    <div className="font-bold text-sm">Reserver</div>
                    <div className="text-[10px] opacity-70">Mobil hær rykker ut</div>
                </button>
            </div>

            <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 text-sm italic text-slate-600">
                {step === 'idle' && "Start simueringen ved å klikke på 'Invasjon'."}
                {step === 'invasion' && "Fienden har krysset grensen! Nå må varslingssystemet fungere."}
                {step === 'limitanei' && "De lokale grensetroppene (Limitanei) kan ikke vinne alene, men de holder fienden i sjakk og sender bud etter den mobile feltstyrken."}
                {step === 'comitatenses' && "Suksess! Den mobile elitehæren (Comitatenses) ankommer og knuser invasjonen. Dette var Diokletians dybdeforsvar."}
            </div>
        </div>
    );
};
