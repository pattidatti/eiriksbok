import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, AlertCircle } from 'lucide-react';

interface MissionGuideProps {
    mission: string;
    totalEvidence: number;
    collectedEvidence: number;
}

export const MissionGuide: React.FC<MissionGuideProps> = ({ mission, totalEvidence, collectedEvidence }) => {
    const isComplete = collectedEvidence >= totalEvidence;

    return (
        <div className="absolute top-6 right-6 z-40 w-72">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                        {isComplete ? <CheckCircle2 className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Aktivt Oppdrag</h4>
                        <p className="text-xs text-slate-500 italic font-medium">Mål: Samle bevis</p>
                    </div>
                </div>

                <p className="text-sm text-white/90 leading-relaxed mb-5 font-medium">
                    {mission}
                </p>

                {/* Progress Bar */}
                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500 uppercase tracking-tighter">Progresjon</span>
                        <span className={`text-sm ${isComplete ? 'text-emerald-400' : 'text-indigo-400'}`}>
                            {collectedEvidence} / {totalEvidence}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(collectedEvidence / totalEvidence) * 100}%` }}
                            className={`h-full ${isComplete ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`}
                        />
                    </div>
                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-tight"
                        >
                            <AlertCircle className="w-4 h-4" />
                            Klar for konklusjon
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
