import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ArrowRight, Brain, Award } from 'lucide-react';
import { ethicalSystems } from '../../../../data/ethics/ethicalSystems';

interface MasteryResultsProps {
    score: number;
    total: number;
    systemId: string;
    onReset: () => void;
}

export const MasteryResults: React.FC<MasteryResultsProps> = ({ score, total, systemId, onReset }) => {
    const system = ethicalSystems.find(s => s.id === systemId);
    const percentage = Math.round((score / total) * 100);

    const getFeedback = () => {
        if (percentage === 100) return "Perfekt! Du mestrer dette systemet til det fulle.";
        if (percentage >= 70) return "Godt jobbet! Du har god forståelse for systemets logikk.";
        if (percentage >= 40) return "Du er på vei, men systemet har nyanser du bør se nærmere på.";
        return "Dette var utfordrende. Prøv å lese mer om systemet og gjør et nytt forsøk.";
    };

    return (
        <div className="max-w-3xl mx-auto py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-50 text-indigo-600 mb-6 border border-indigo-100 shadow-sm">
                    <Award size={48} />
                </div>
                <h2 className="text-4xl font-display font-black mb-4 text-slate-900">Resultat: {system?.name}</h2>
                <div className="text-6xl font-black text-slate-900 mb-6">
                    {score} <span className="text-slate-400 text-3xl">/ {total}</span>
                </div>
                <p className="text-xl text-slate-600 max-w-xl mx-auto font-medium">
                    {getFeedback()}
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900">
                        <Brain size={20} className="text-indigo-600" />
                        Teoretisk kjerne
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {system?.description}
                    </p>
                    <a
                        href={system?.articleLink}
                        className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors py-2.5 px-5 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm text-sm"
                    >
                        Les full fordypning <ArrowRight size={16} />
                    </a>
                </div>

                <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-center items-center text-center">
                    <div className="relative w-32 h-32 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-slate-100"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={`${percentage * 2.82} 282`}
                                strokeLinecap="round"
                                className="text-indigo-600 -rotate-90 origin-center transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-slate-900">
                            {percentage}%
                        </div>
                    </div>
                    <span className="text-slate-500 uppercase tracking-widest text-[10px] font-black">Mestring Snitt</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={onReset}
                    className="px-8 py-4 rounded-xl bg-indigo-500 text-white font-black uppercase tracking-widest text-xs hover:bg-indigo-400 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw size={16} /> Prøv et annet system
                </button>
                <button
                    onClick={onReset}
                    className="px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-black uppercase tracking-widest text-xs hover:bg-slate-50 hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                    Hovedmeny
                </button>
            </div>
        </div>
    );
};
