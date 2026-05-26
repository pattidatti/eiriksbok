import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

type Mode = 'barter' | 'money';

interface StepData {
    title: string;
    description: string;
    actor1: { emoji: string; name: string; gives: string; givesEmoji: string };
    actor2: { emoji: string; name: string; gives: string; givesEmoji: string };
    outcome: 'pending' | 'fail' | 'success' | 'final';
    finalStats?: { steps: number; parties: number };
}

const BARTER_STEPS: StepData[] = [
    {
        title: 'Situasjonen',
        description: 'Du er fisker og trenger brød. Bakeren har brød. Enkelt, ikke sant?',
        actor1: { emoji: '🎣', name: 'Du', gives: 'Fisk', givesEmoji: '🐟' },
        actor2: { emoji: '👩‍🍳', name: 'Bakeren', gives: 'Brød', givesEmoji: '🍞' },
        outcome: 'pending',
    },
    {
        title: 'Prøver å handle med bakeren...',
        description: 'Bakeren trenger ikke fisk akkurat nå - han vil ha sko! Handel avvist.',
        actor1: { emoji: '🎣', name: 'Du', gives: 'Fisk', givesEmoji: '🐟' },
        actor2: { emoji: '👩‍🍳', name: 'Bakeren', gives: 'Brød', givesEmoji: '🍞' },
        outcome: 'fail',
    },
    {
        title: 'Går via bonden...',
        description: 'Bonden vil ha fisk! Du gir fisk og får korn. Men du er fortsatt ikke nærmere brødet.',
        actor1: { emoji: '🎣', name: 'Du', gives: 'Fisk', givesEmoji: '🐟' },
        actor2: { emoji: '👨‍🌾', name: 'Bonden', gives: 'Korn', givesEmoji: '🌾' },
        outcome: 'success',
    },
    {
        title: 'Korn mot sko...',
        description: 'Skomaker vil ha korn. Du gir korn og får sko - nå har du noe bakeren vil ha.',
        actor1: { emoji: '🎣', name: 'Du (m/korn)', gives: 'Korn', givesEmoji: '🌾' },
        actor2: { emoji: '🪡', name: 'Skomaker', gives: 'Sko', givesEmoji: '👟' },
        outcome: 'success',
    },
    {
        title: 'Endelig! Sko mot brød',
        description: 'Bakeren tar imot sko og gir deg brød. Men det krevde 3 separate handler - og alle 4 måtte ha akkurat det de trengte i dag.',
        actor1: { emoji: '🎣', name: 'Du (m/sko)', gives: 'Sko', givesEmoji: '👟' },
        actor2: { emoji: '👩‍🍳', name: 'Bakeren', gives: 'Brød', givesEmoji: '🍞' },
        outcome: 'final',
        finalStats: { steps: 3, parties: 4 },
    },
];

const MONEY_STEPS: StepData[] = [
    {
        title: 'Situasjonen',
        description: 'Du er fisker og trenger brød. Med penger finnes det en mye kortere vei.',
        actor1: { emoji: '🎣', name: 'Du', gives: 'Fisk', givesEmoji: '🐟' },
        actor2: { emoji: '👩‍🍳', name: 'Bakeren', gives: 'Brød', givesEmoji: '🍞' },
        outcome: 'pending',
    },
    {
        title: 'Steg 1: Selg fisken',
        description: 'Du selger fisk til hvem som helst på markedet - alle vil ha penger. Du får 50 kr.',
        actor1: { emoji: '🎣', name: 'Du', gives: 'Fisk', givesEmoji: '🐟' },
        actor2: { emoji: '🛒', name: 'Markedet', gives: '50 kr', givesEmoji: '💵' },
        outcome: 'success',
    },
    {
        title: 'Steg 2: Kjøp brød',
        description: 'Med pengene går du rett til bakeren. Handel fullført! Bakeren tar imot pengene fordi han vet at han kan bruke dem til å kjøpe sko senere.',
        actor1: { emoji: '🎣', name: 'Du', gives: '50 kr', givesEmoji: '💵' },
        actor2: { emoji: '👩‍🍳', name: 'Bakeren', gives: 'Brød', givesEmoji: '🍞' },
        outcome: 'final',
        finalStats: { steps: 2, parties: 2 },
    },
];

export const TradeLoopComponent: React.FC = () => {
    const [mode, setMode] = useState<Mode>('barter');
    const [step, setStep] = useState(0);

    const steps = mode === 'barter' ? BARTER_STEPS : MONEY_STEPS;
    const current = steps[step];
    const isLast = step >= steps.length - 1;

    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        setStep(0);
    };

    const actor2Bg = mode === 'money' && step === 1 ? 'bg-yellow-100 border-yellow-200' : 'bg-amber-100 border-amber-200';

    return (
        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <RefreshCcw className="w-6 h-6 text-indigo-600" />
                Handels-simulator: Friksjons-maleren
            </h3>

            {/* Mode Toggle */}
            <div className="flex bg-slate-200 p-1 rounded-xl mb-6 w-fit mx-auto">
                <button
                    onClick={() => handleModeChange('barter')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        mode === 'barter' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Naturalhandel
                </button>
                <button
                    onClick={() => handleModeChange('money')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        mode === 'money' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Penger
                </button>
            </div>

            {/* Step dots */}
            <div className="flex justify-center gap-2 mb-6">
                {steps.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            i <= step
                                ? mode === 'barter' ? 'bg-red-400' : 'bg-green-400'
                                : 'bg-slate-200'
                        } ${i === step ? 'w-6' : 'w-3'}`}
                    />
                ))}
            </div>

            {/* Main step area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${mode}-${step}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                >
                    <p className="text-base font-bold text-slate-800 text-center mb-5">{current.title}</p>

                    {/* Actors */}
                    <div className="flex items-center justify-center gap-4 mb-5">
                        {/* Actor 1 */}
                        <div className="flex flex-col items-center min-w-[90px]">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl border-2 border-blue-200 mb-1">
                                {current.actor1.emoji}
                            </div>
                            <div className="text-xs font-bold text-slate-700 text-center">{current.actor1.name}</div>
                            <div className="text-xs bg-white border border-slate-200 rounded px-2 py-0.5 mt-1 text-center">
                                {current.actor1.givesEmoji} {current.actor1.gives}
                            </div>
                        </div>

                        {/* Outcome icon */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            {current.outcome === 'fail' && (
                                <>
                                    <div className="flex items-center gap-1">
                                        <ArrowRight className="w-4 h-4 text-red-400" />
                                        <XCircle className="w-8 h-8 text-red-500" />
                                        <ArrowRight className="w-4 h-4 text-red-400 rotate-180" />
                                    </div>
                                    <span className="text-xs text-red-600 font-bold">Avvist!</span>
                                </>
                            )}
                            {(current.outcome === 'success' || current.outcome === 'final') && (
                                <>
                                    <div className="flex items-center gap-1">
                                        <ArrowRight className="w-4 h-4 text-green-500" />
                                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                                        <ArrowRight className="w-4 h-4 text-green-500 rotate-180" />
                                    </div>
                                    <span className="text-xs text-green-600 font-bold">Byttet!</span>
                                </>
                            )}
                            {current.outcome === 'pending' && (
                                <div className="flex items-center gap-1">
                                    <ArrowRight className="w-4 h-4 text-slate-400" />
                                    <span className="text-2xl">🤝</span>
                                    <ArrowRight className="w-4 h-4 text-slate-400 rotate-180" />
                                </div>
                            )}
                        </div>

                        {/* Actor 2 */}
                        <div className="flex flex-col items-center min-w-[90px]">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 mb-1 ${actor2Bg}`}>
                                {current.actor2.emoji}
                            </div>
                            <div className="text-xs font-bold text-slate-700 text-center">{current.actor2.name}</div>
                            <div className="text-xs bg-white border border-slate-200 rounded px-2 py-0.5 mt-1 text-center">
                                {current.actor2.givesEmoji} {current.actor2.gives}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className={`text-sm text-center rounded-xl p-3 leading-relaxed ${
                        current.outcome === 'fail'
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : current.outcome === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-100'
                                : current.outcome === 'final'
                                    ? mode === 'barter'
                                        ? 'bg-orange-50 text-orange-800 border border-orange-100'
                                        : 'bg-green-50 text-green-700 border border-green-100'
                                    : 'bg-white text-slate-600 border border-slate-100'
                    }`}>
                        {current.description}
                    </div>

                    {/* Final stats */}
                    {current.outcome === 'final' && current.finalStats && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className={`text-center p-3 rounded-xl ${mode === 'barter' ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                                <div className={`text-3xl font-bold ${mode === 'barter' ? 'text-red-600' : 'text-green-600'}`}>
                                    {current.finalStats.steps}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">Mellomhandler</div>
                            </div>
                            <div className={`text-center p-3 rounded-xl ${mode === 'barter' ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                                <div className={`text-3xl font-bold ${mode === 'barter' ? 'text-red-600' : 'text-green-600'}`}>
                                    {current.finalStats.parties}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">Parter involvert</div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => setStep(0)}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                >
                    <RefreshCcw className="w-3 h-3" /> Start pa nytt
                </button>
                {!isLast ? (
                    <button
                        onClick={() => setStep((s) => s + 1)}
                        className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        Neste steg <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={() => handleModeChange(mode === 'barter' ? 'money' : 'barter')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${
                            mode === 'barter'
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-slate-700 text-white hover:bg-slate-900'
                        }`}
                    >
                        {mode === 'barter' ? 'Se med penger' : 'Se uten penger'}{' '}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Friction meter */}
            <div className="mt-6 p-4 bg-white rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Friksjon</span>
                    <span className={`text-xs font-bold ${mode === 'barter' ? 'text-red-600' : 'text-green-600'}`}>
                        {mode === 'barter' ? 'HOY - 3 mellomsteg nodvendig' : 'LAV - 2 steg, direkte handel'}
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${mode === 'barter' ? 'bg-red-400' : 'bg-green-400'}`}
                        animate={{ width: mode === 'barter' ? '85%' : '20%' }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </div>
    );
};
