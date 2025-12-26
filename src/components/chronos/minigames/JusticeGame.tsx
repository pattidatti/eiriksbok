import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Gavel, ThumbsUp } from 'lucide-react';

interface JusticeGameProps {
    config: {
        cases: {
            id: string;
            title: string;
            description: string;
            accused: string;
            crime: string;
            options: {
                mercy: {
                    label: string;
                    effects?: any;
                    feedback: string;
                };
                harsh: {
                    label: string;
                    effects?: any;
                    feedback: string;
                };
            };
        }[];
    };
    onComplete: (results: any) => void;
}

export const JusticeGame: React.FC<JusticeGameProps> = ({ config, onComplete }) => {
    const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [lastDecision, setLastDecision] = useState<'mercy' | 'harsh' | null>(null);

    const currentCase = config.cases[currentCaseIndex];

    const handleDecision = (type: 'mercy' | 'harsh') => {
        setLastDecision(type);
        setShowResult(true);

        // Wait for animation then proceed
        setTimeout(() => {
            setShowResult(false);
            if (currentCaseIndex < config.cases.length - 1) {
                setCurrentCaseIndex(prev => prev + 1);
            } else {
                onComplete({ completed: true });
            }
        }, 2000);
    };

    if (!currentCase) return null;

    return (
        <div className="w-full max-w-md mx-auto bg-stone-100 rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
            {/* Header */}
            <div className="bg-stone-800 text-stone-100 p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-50" />
                <Scale className="mx-auto mb-2 opacity-80" size={32} />
                <h2 className="text-2xl font-display font-medium tracking-wide">Kongelig Domstol</h2>
                <div className="text-xs uppercase tracking-widest text-stone-400 mt-1">Sak {currentCaseIndex + 1} av {config.cases.length}</div>
            </div>

            {/* Content */}
            <div className="p-8 relative min-h-[400px] flex flex-col justify-between">

                <AnimatePresence mode="wait">
                    {!showResult ? (
                        <motion.div
                            key="case"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="text-center"
                        >
                            <div className="mb-6">
                                <span className="inline-block px-3 py-1 bg-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wide rounded-full mb-3">
                                    {currentCase.crime}
                                </span>
                                <h3 className="text-xl font-bold text-stone-800 mb-2">{currentCase.title}</h3>
                                <p className="text-stone-600 italic">"{currentCase.description}"</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-stone-200 mb-8 shadow-sm">
                                <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">Tiltalte</div>
                                <div className="font-serif text-lg font-bold text-stone-800">{currentCase.accused}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleDecision('mercy')}
                                    className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-colors group"
                                >
                                    <ThumbsUp className="mx-auto mb-2 text-emerald-600 group-hover:scale-110 transition-transform" />
                                    <div className="text-sm font-bold text-emerald-800">{currentCase.options.mercy.label}</div>
                                </button>

                                <button
                                    onClick={() => handleDecision('harsh')}
                                    className="p-4 rounded-xl bg-red-50 border-2 border-red-100 hover:bg-red-100 hover:border-red-200 transition-colors group"
                                >
                                    <Gavel className="mx-auto mb-2 text-red-600 group-hover:scale-110 transition-transform" />
                                    <div className="text-sm font-bold text-red-800">{currentCase.options.harsh.label}</div>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white/90 backdrop-blur-sm z-10"
                        >
                            <div className={`p-4 rounded-full mb-4 ${lastDecision === 'mercy' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {lastDecision === 'mercy' ? <ThumbsUp size={48} /> : <Gavel size={48} />}
                            </div>
                            <h3 className="text-2xl font-bold text-stone-800 mb-2">
                                {lastDecision === 'mercy' ? 'Nåde vist' : 'Dom avsagt'}
                            </h3>
                            <p className="text-center text-stone-600">
                                {lastDecision === 'mercy' ? currentCase.options.mercy.feedback : currentCase.options.harsh.feedback}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
