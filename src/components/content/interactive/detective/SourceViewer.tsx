import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    FileSearch,
    AlertTriangle,
    Search
} from 'lucide-react';
import type { DetectiveSource } from './types';

interface SourceViewerProps {
    source: DetectiveSource;
    onClueFound: (clueId: string) => void;
    foundClues: Set<string>;
}

export const SourceViewer: React.FC<SourceViewerProps> = ({ source, onClueFound, foundClues }) => {
    const [viewMode, setViewMode] = useState<'raw' | 'interpreted'>(source.type === 'textual' ? 'interpreted' : 'raw');

    return (
        <div className="group relative bg-slate-800/20 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col">
            {/* 1. Narrative Introduction (Zero Knowledge Support) */}
            {source.introduction && (
                <div className="p-8 bg-slate-900 border-b border-white/5">
                    <p className="text-xl text-slate-300 leading-relaxed font-serif italic italic">
                        {source.introduction}
                    </p>
                </div>
            )}

            {/* 2. Expert Briefing (Pedagogical Context) */}
            {source.guidance && (
                <div className="p-8 bg-indigo-500/10 border-b border-indigo-500/20">
                    <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                        <FileSearch className="w-4 h-4" />
                        Ekspertanalyse: Bakgrunn og Betydning
                    </div>
                    <p className="text-lg text-white leading-relaxed font-medium">
                        {source.guidance}
                    </p>
                </div>
            )}

            {/* Source Header */}
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Search className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-200">{source.title}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{source.metadata.origin}</p>
                    </div>
                </div>

                <div className="flex bg-slate-950 rounded-lg p-1 border border-white/5 shadow-inner">
                    <button
                        onClick={() => setViewMode('raw')}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === 'raw' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        ORIGINALFRAGMENT
                    </button>
                    <button
                        onClick={() => setViewMode('interpreted')}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === 'interpreted' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        OVERSATT TOLKNING
                    </button>
                </div>
            </div>

            {/* View Area */}
            <div className="relative min-h-[200px] p-8">
                <AnimatePresence mode="wait">
                    {viewMode === 'raw' ? (
                        <motion.div
                            key="raw"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full"
                        >
                            <div className="mb-4 flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                <span>Råmateriale fra kilden</span>
                            </div>
                            {source.type === 'textual' ? (
                                <div className="font-serif text-xl leading-relaxed text-slate-400 bg-slate-950/50 p-8 rounded border border-slate-800/50 italic">
                                    {source.original}
                                </div>
                            ) : (
                                <div className="relative group">
                                    <img
                                        src={source.original}
                                        alt={source.title}
                                        className="rounded-lg shadow-2xl max-h-[400px] object-contain mx-auto"
                                    />
                                    <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-all pointer-events-none" />
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="interpreted"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full space-y-8"
                        >
                            <div className="mb-4 flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                <span>Fullstendig norsk oversettelse</span>
                            </div>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-xl text-slate-100 leading-relaxed font-medium">
                                    {source.translation || source.interpretation}
                                </p>
                            </div>

                            {/* Clues Discovery */}
                            <div className="grid gap-4">
                                {source.clues.map(clue => {
                                    const isFound = foundClues.has(clue.id);
                                    return (
                                        <button
                                            key={clue.id}
                                            onClick={() => onClueFound(clue.id)}
                                            className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left group/clue ${isFound
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
                                                : 'bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/50 text-slate-400 hover:bg-indigo-500/10'
                                                }`}
                                        >
                                            <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isFound ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-500 group-hover/clue:bg-indigo-500 group-hover/clue:text-white'
                                                }`}>
                                                {isFound ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                            </div>
                                            <div>
                                                <p className="text-base font-bold mb-2">"{clue.text}"</p>
                                                {isFound && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="text-sm text-emerald-300 leading-relaxed font-serif italic"
                                                    >
                                                        {clue.insight}
                                                    </motion.p>
                                                )}
                                                {!isFound && (
                                                    <p className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">Høsting av bevis mulig</p>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Evidence prompt */}
                            <div className="flex items-center justify-between p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileSearch className="w-4 h-4" />
                                    Finn bevis i teksten over
                                </span>
                                <div className="text-[10px] text-slate-500 italic">
                                    Klikk på uthevede fraser
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Layer: Historical Criticism & Hints */}
            {(source.provenance || source.uncertainty || source.hint) && (
                <div className="p-8 border-t border-slate-800 bg-slate-900/50 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {source.provenance && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                    <FileSearch className="w-3.5 h-3.5" />
                                    Proveniens
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed border-l border-slate-700 pl-4">
                                    {source.provenance}
                                </p>
                            </div>
                        )}
                        {source.uncertainty && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-amber-500/50 text-[10px] font-bold uppercase tracking-widest">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Kritisk Blikk
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed border-l border-slate-700 pl-4 italic">
                                    {source.uncertainty}
                                </p>
                            </div>
                        )}
                    </div>

                    {source.hint && (
                        <div className="pt-6 border-t border-slate-800">
                            <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                                <Search className="w-3 h-3" />
                                Detektiv-hint
                            </div>
                            <p className="text-slate-500 text-xs italic">
                                {source.hint}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
