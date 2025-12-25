import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flag,
    ArrowLeft,
    Lightbulb,
    Info
} from 'lucide-react';

interface ConclusionScreenProps {
    conclusionData: {
        question: string;
        options: {
            id: string;
            text: string;
            feedback: string;
        }[];
    };
    onRestart: () => void;
    trustScore: number;
    evidenceCount: number;
}

export const ConclusionScreen: React.FC<ConclusionScreenProps> = ({
    conclusionData,
    onRestart,
    trustScore,
    evidenceCount
}) => {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    return (
        <div className="flex-1 flex flex-col p-8 max-w-3xl mx-auto w-full">
            <header className="text-center mb-12">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 mx-auto mb-6 border border-indigo-500/20">
                    <Flag className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Saken skal avsluttes</h2>
                <p className="text-slate-400">
                    Med en tillitsscore på {trustScore}% og {evidenceCount} bevis samlet inn – hva er din konklusjon?
                </p>
            </header>

            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8 mb-8 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    {conclusionData.question}
                </h3>

                <div className="space-y-4">
                    {conclusionData.options.map(option => (
                        <button
                            key={option.id}
                            onClick={() => setSelectedOptionId(option.id)}
                            className={`w-full p-4 rounded-xl border text-left transition-all ${selectedOptionId === option.id
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedOptionId === option.id ? 'border-white bg-white/20' : 'border-slate-600'
                                    }`}>
                                    {selectedOptionId === option.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className="font-medium">{option.text}</span>
                            </div>

                            <AnimatePresence>
                                {selectedOptionId === option.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 pt-4 border-t border-white/20 text-indigo-100 text-sm italic"
                                    >
                                        <div className="flex gap-3">
                                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <p>{option.feedback}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-8">
                <button
                    onClick={onRestart}
                    className="flex items-center gap-2 px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Gjennomgå bevis på nytt
                </button>

                <button
                    disabled={!selectedOptionId}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${selectedOptionId
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    Lever Sluttrapport
                </button>
            </div>
        </div>
    );
};
