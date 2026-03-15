import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, ArrowLeft, Lightbulb, Info } from 'lucide-react';

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
    onSubmit: (optionId: string) => void;
    evidenceCount: number;
}

export const ConclusionScreen: React.FC<ConclusionScreenProps> = ({
    conclusionData,
    onRestart,
    onSubmit,
    evidenceCount,
}) => {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    return (
        <div className="flex-1 flex flex-col bg-[#0a0c10] text-slate-200 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="flex-1 flex flex-col p-6 max-w-2xl mx-auto w-full">
                <header className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 mx-auto mb-4 border border-indigo-500/20">
                        <Flag className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Tid for konklusjon</h2>
                    <p className="text-sm text-slate-400">
                        Du har samlet {evidenceCount} bevis. Hva tror du?
                    </p>
                </header>

                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 mb-6 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        {conclusionData.question}
                    </h3>

                    <div className="space-y-3">
                        {conclusionData.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setSelectedOptionId(option.id)}
                                className={`w-full p-3 rounded-xl border text-left transition-all ${
                                    selectedOptionId === option.id
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            selectedOptionId === option.id
                                                ? 'border-white bg-white/20'
                                                : 'border-slate-600'
                                        }`}
                                    >
                                        {selectedOptionId === option.id && (
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                    </div>
                                    <span className="font-medium">{option.text}</span>
                                </div>

                                <AnimatePresence>
                                    {selectedOptionId === option.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-3 pt-3 border-t border-white/20 text-indigo-100 text-sm italic"
                                        >
                                            <div className="flex gap-2">
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

                <div className="flex items-center justify-between mt-auto pt-4">
                    <button
                        onClick={onRestart}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Se bevisene igjen
                    </button>

                    <button
                        disabled={!selectedOptionId}
                        onClick={() => selectedOptionId && onSubmit(selectedOptionId)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            selectedOptionId
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        Send inn svar
                    </button>
                </div>
            </div>
        </div>
    );
};
