import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RefreshCcw, Coins, Fish, Cookie, AlertCircle } from 'lucide-react';

export const TradeLoopComponent: React.FC = () => {
    const [mode, setMode] = useState<'barter' | 'money'>('barter');
    const [step, setStep] = useState(0); // 0: Start, 1: Try Trade, 2: Result

    const reset = () => {
        setStep(0);
    };

    const toggleMode = (newMode: 'barter' | 'money') => {
        setMode(newMode);
        setStep(0);
    };

    return (
        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <RefreshCcw className="w-6 h-6 text-indigo-600" />
                Handels-simulator: Friksjon
            </h3>

            {/* Mode Toggle */}
            <div className="flex bg-slate-200 p-1 rounded-xl mb-8 w-fit mx-auto">
                <button
                    onClick={() => toggleMode('barter')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'barter'
                        ? 'bg-white shadow text-slate-800'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Naturalhandel (Bytte)
                </button>
                <button
                    onClick={() => toggleMode('money')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'money'
                        ? 'bg-white shadow text-indigo-700'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Penger
                </button>
            </div>

            {/* Simulation Area */}
            <div className="relative min-h-[300px] flex flex-col items-center justify-center">

                <div className="flex justify-between w-full max-w-lg mb-12 relative">
                    {/* Person A */}
                    <div className="flex flex-col items-center z-10">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-2 border-2 border-blue-200">
                            🧔
                        </div>
                        <div className="text-sm font-bold text-slate-700">Du</div>
                        <div className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 mt-1 flex items-center gap-1 shadow-sm">
                            Har: <Fish className="w-3 h-3 text-blue-500" /> Fisk
                        </div>
                        <div className="text-xs text-slate-500 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 mt-1 flex items-center gap-1 shadow-sm font-bold text-indigo-700">
                            Vil ha: <Cookie className="w-3 h-3 text-amber-600" /> Brød
                        </div>
                    </div>

                    {/* Arrow / Interaction */}
                    <div className="flex-1 flex items-center justify-center relative px-4">
                        <AnimatePresence mode="wait">
                            {step === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <button
                                        onClick={() => setStep(1)}
                                        className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-600 transition-colors shadow-lg hover:shadow-indigo-200 flex items-center gap-2"
                                    >
                                        Prøv å handle <ArrowRight className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}

                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center"
                                >
                                    {mode === 'barter' ? (
                                        <div className="bg-red-50 text-red-800 px-4 py-2 rounded-lg border border-red-200 flex flex-col items-center">
                                            <AlertCircle className="w-8 h-8 mb-2 text-red-500" />
                                            <span className="font-bold block">Handel avvist!</span>
                                            <span className="text-xs opacity-80">Bakeren vil ikke ha fisk.</span>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg border border-green-200 flex flex-col items-center">
                                            <Coins className="w-8 h-8 mb-2 text-yellow-500" />
                                            <span className="font-bold block">Handel godkjent!</span>
                                            <span className="text-xs opacity-80">Penger aksepteres av alle.</span>
                                        </div>
                                    )}
                                    <button onClick={reset} className="mt-4 text-xs underline text-slate-500 hover:text-slate-800">Prøv igjen</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Person B */}
                    <div className="flex flex-col items-center z-10">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-2xl mb-2 border-2 border-amber-200">
                            👩‍🍳
                        </div>
                        <div className="text-sm font-bold text-slate-700">Bakeren</div>
                        <div className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 mt-1 flex items-center gap-1 shadow-sm">
                            Har: <Cookie className="w-3 h-3 text-amber-600" /> Brød
                        </div>
                        <div className="text-xs text-slate-500 bg-amber-50 px-2 py-1 rounded border border-amber-100 mt-1 flex items-center gap-1 shadow-sm">
                            Vil ha: {mode === 'barter' ? '👞 Sko' : '💰 Penger'}
                        </div>
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 w-full text-sm text-slate-600 shadow-sm min-h-[80px]">
                    <span className="font-bold block mb-1 text-slate-800">Konklusjon:</span>
                    {mode === 'barter' ? (
                        <p>
                            Dette kalles <strong>den doble tilfeldigheten</strong>. Du må finne noen som har det du vil ha, OG som vil ha det du har. Dette skaper enorm friksjon og gjør handel vanskelig.
                        </p>
                    ) : (
                        <p>
                            Penger fungerer som et <strong>felles byttemiddel</strong>. Du selger fisken din til noen andre for penger, og bruker pengene til å kjøpe brød. Bakeren tar imot pengene fordi hun vet at hun kan bruke dem til å kjøpe sko senere.
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
};
