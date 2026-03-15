import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';
import type { DetectiveBriefing } from './types';

interface BriefingScreenProps {
    briefing: DetectiveBriefing;
    onStart: () => void;
}

export const BriefingScreen: React.FC<BriefingScreenProps> = ({ briefing, onStart }) => {
    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 bg-[#0a0c10]">
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
                {/* Visual side */}
                <div className="md:w-1/3 relative bg-indigo-600 flex flex-col items-center justify-center text-white text-center py-8 md:py-0 overflow-hidden min-h-[120px] md:min-h-0">
                    {briefing.image ? (
                        <>
                            <img
                                src={briefing.image}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-transparent to-indigo-900/50" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-indigo-600" />
                    )}

                    <div className="relative z-10 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-xl">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Content side */}
                <div className="md:w-2/3 p-6 md:p-8 space-y-5">
                    <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                            Nytt oppdrag
                        </span>
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mt-1">
                            {briefing.title}
                        </h1>
                    </div>

                    {/* Combined narrative - context, mystery, mission as flowing prose */}
                    <div className="space-y-3 text-sm leading-relaxed">
                        <p className="text-slate-300">{briefing.context}</p>
                        <p className="text-amber-200/90 font-medium">{briefing.mystery}</p>
                        <p className="text-emerald-200/90 font-semibold">{briefing.mission}</p>
                        {briefing.stakes && (
                            <p className="text-slate-500 text-xs italic">{briefing.stakes}</p>
                        )}
                    </div>

                    <button
                        onClick={onStart}
                        className="w-full md:w-auto px-8 py-3 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5"
                    >
                        Start etterforskningen
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
