import React from 'react';
import { motion } from 'framer-motion';
import { Info, HelpCircle, Target, Zap, ChevronRight } from 'lucide-react';
import type { DetectiveBriefing } from './types';

interface BriefingScreenProps {
    briefing: DetectiveBriefing;
    onStart: () => void;
}

export const BriefingScreen: React.FC<BriefingScreenProps> = ({ briefing, onStart }) => {
    return (
        <div className="flex-1 flex items-center justify-center p-8 bg-[#0a0c10]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
                {/* Visual / Icon Side */}
                <div className="md:w-1/3 p-12 bg-indigo-600 flex flex-col items-center justify-center text-white text-center">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-md">
                        <Zap className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-display font-bold mb-2">Topphemmelig</h2>
                    <p className="text-indigo-100 text-base opacity-90 font-medium">Kun for autorisert personell</p>
                </div>

                {/* Content Side */}
                <div className="md:w-2/3 p-10 md:p-14 space-y-8">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-sm mb-3">
                            <Info className="w-5 h-5" />
                            <span>Saksmappe: Aktivt Oppdrag</span>
                        </div>
                        <h1 className="text-5xl font-display font-bold text-white mb-8">
                            {briefing.title}
                        </h1>
                    </div>

                    <div className="grid gap-6">
                        <div className="flex gap-4">
                            <div className="mt-1 w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                                <Info className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-200 mb-1.5">Kontekst</h3>
                                <p className="text-slate-300 text-base leading-relaxed">{briefing.context}</p>
                            </div>
                        </div>

                        <div className="flex gap-5">
                            <div className="mt-1 w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-200 mb-1.5">Gåten</h3>
                                <p className="text-slate-300 text-base leading-relaxed">{briefing.mystery}</p>
                            </div>
                        </div>

                        <div className="flex gap-5">
                            <div className="mt-1 w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-200 mb-1.5">Ditt Oppdrag</h3>
                                <p className="text-slate-300 text-base leading-relaxed font-semibold">{briefing.mission}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="text-sm text-slate-400 max-w-[300px] leading-relaxed">
                            <span className="font-extrabold text-slate-200 block mb-1.5 uppercase tracking-widest text-xs">Viktig Merknad:</span>
                            {briefing.stakes}
                        </div>
                        <button
                            onClick={onStart}
                            className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-lg flex items-center gap-2 hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                        >
                            Aksepter oppdrag
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
