import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Hand, Move, Flame } from 'lucide-react';
import { markTutorialSeen } from '../../../utils/chronoStats';

interface ChronoTutorialProps {
    onComplete: () => void;
}

const STEPS = [
    {
        title: 'Bygg en kronologisk tidslinje',
        body: 'Du får ett historisk kort om gangen. Plasser hvert kort i riktig posisjon i forhold til de andre. Det som skjedde først skal stå først.',
        icon: '🕰️',
    },
    {
        title: 'Dra eller trykk for å plassere',
        body: 'Dra kortet til en drop-sone mellom andre kort, eller trykk direkte på sonen der du tror kortet hører hjemme. Det fungerer både med mus og finger.',
        icon: <Hand className="w-12 h-12" />,
        secondaryIcon: <Move className="w-12 h-12" />,
    },
    {
        title: 'Streak gir bonuspoeng',
        body: 'Treff flere på rad og bygg en streak. Hvert treff over 3 gir bonuspoeng, og hver femte streak gir konfetti! Men pass på: du har bare 3 liv før spillet er slutt.',
        icon: <Flame className="w-12 h-12 text-orange-500" />,
    },
];

export const ChronoTutorial: React.FC<ChronoTutorialProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const isLast = step === STEPS.length - 1;

    const finish = () => {
        markTutorialSeen();
        onComplete();
    };

    const current = STEPS[step];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <motion.div
                key={step}
                initial={{ scale: 0.94, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
            >
                <div className="relative p-6 md:p-8">
                    <button
                        onClick={finish}
                        aria-label="Hopp over"
                        className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">
                            Steg {step + 1} av {STEPS.length}
                        </span>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`icon-${step}`}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="my-4 h-20 flex items-center justify-center gap-3 text-indigo-600"
                            >
                                {typeof current.icon === 'string' ? (
                                    <span className="text-6xl">{current.icon}</span>
                                ) : (
                                    current.icon
                                )}
                                {current.secondaryIcon && (
                                    <>
                                        <ArrowRight className="w-6 h-6 text-slate-300" />
                                        {current.secondaryIcon}
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <h2 className="text-2xl font-black text-slate-800 mb-2 leading-tight">
                            {current.title}
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                            {current.body}
                        </p>
                    </div>

                    {/* Step indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                        {STEPS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setStep(i)}
                                aria-label={`Gå til steg ${i + 1}`}
                                className={`h-2 rounded-full transition-all ${
                                    i === step ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-6 gap-2">
                        <button
                            onClick={finish}
                            className="text-sm font-bold text-slate-500 hover:text-slate-800 px-3 py-2 transition-colors"
                        >
                            Hopp over
                        </button>
                        <button
                            onClick={() => (isLast ? finish() : setStep(step + 1))}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isLast ? 'Start spillet!' : 'Neste'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
