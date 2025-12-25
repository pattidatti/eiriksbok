import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database,
    Shield,
    Zap,
    User,
    FileText,
    Target,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import type { DetectiveSuspect } from './types';

interface CaseFileProps {
    state: {
        trustScore: number;
        collectedClues: Set<string>;
    };
    suspects: DetectiveSuspect[];
    mission?: string;
    totalEvidence?: number;
}

export const CaseFile: React.FC<CaseFileProps> = ({ state, suspects, mission, totalEvidence }) => {
    const [activeTab, setActiveTab] = useState<'theories' | 'evidence'>('theories');
    const collectedEvidence = state.collectedClues.size;
    const isComplete = totalEvidence ? collectedEvidence >= totalEvidence : false;

    return (
        <aside className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-slate-800/50 bg-slate-900/50">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Database className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">Saksmappe</h2>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">Etterforskning</p>
                    </div>
                </div>

                {/* Integrated Mission Guide */}
                {mission && (
                    <div className="mb-8 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-900/20">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                            </div>
                            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Aktivt Oppdrag</h4>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed font-medium mb-4">
                            {mission}
                        </p>

                        {totalEvidence !== undefined && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                    <span className="text-slate-500">Progresjon</span>
                                    <span className={isComplete ? 'text-emerald-400' : 'text-indigo-400'}>
                                        {collectedEvidence} / {totalEvidence}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(collectedEvidence / totalEvidence) * 100}%` }}
                                        className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                    />
                                </div>
                                {isComplete && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-tight pt-1"
                                    >
                                        <AlertCircle className="w-3 h-3" />
                                        Klar for konklusjon
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            Tillit
                        </div>
                        <div className="text-2xl font-display font-bold text-emerald-400">
                            {state.trustScore}%
                        </div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" />
                            Bevis
                        </div>
                        <div className="text-2xl font-display font-bold text-indigo-400">
                            {state.collectedClues.size}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-900 rounded-xl mb-6 border border-white/5">
                    <button
                        onClick={() => setActiveTab('theories')}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wide ${activeTab === 'theories' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Teorier
                    </button>
                    <button
                        onClick={() => setActiveTab('evidence')}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wide ${activeTab === 'evidence' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Logg
                    </button>
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {activeTab === 'theories' ? (
                            <motion.div
                                key="theories"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-4"
                            >
                                {suspects.map(suspect => (
                                    <div key={suspect.id} className="p-4 bg-slate-800/30 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3 mb-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400">
                                                <User className="w-4.5 h-4.5" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-200">{suspect.name}</h3>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                            {suspect.description}
                                        </p>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="evidence"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-3"
                            >
                                {state.collectedClues.size === 0 ? (
                                    <div className="py-12 text-center">
                                        <FileText className="w-10 h-10 text-slate-800 mx-auto mb-3 opacity-50" />
                                        <p className="text-sm text-slate-600 italic">Ingen bevis samlet inn ennå...</p>
                                    </div>
                                ) : (
                                    Array.from(state.collectedClues).map(clueId => (
                                        <div key={clueId} className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex gap-3 group animate-in slide-in-from-right-2">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] flex-shrink-0" />
                                            <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
                                                Bevis sikret fra kildematerialet.
                                            </p>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </aside>
    );
};
