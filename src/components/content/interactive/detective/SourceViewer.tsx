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
        <div className="group relative bg-slate-800/20 rounded-xl border border-slate-700/50 overflow-hidden">
            {/* Source Header */}
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/40">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        {source.type === 'textual' ? <Search className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-200">{source.title}</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">{source.metadata.origin}</p>
                    </div>
                </div>

                <div className="flex bg-slate-900 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('raw')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'raw' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        ORIGINAL
                    </button>
                    <button
                        onClick={() => setViewMode('interpreted')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'interpreted' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        TOLKNING
                    </button>
                </div>
            </div>

            {/* View Area */}
            <div className="relative min-h-[200px] p-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {viewMode === 'raw' ? (
                        <motion.div
                            key="raw"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full"
                        >
                            {source.type === 'textual' ? (
                                <div className="font-serif text-xl leading-relaxed text-slate-200 bg-parchment-texture p-8 rounded shadow-inner whitespace-pre-wrap border border-slate-700/50">
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
                            className="w-full space-y-6"
                        >
                            <div className="prose prose-invert max-w-none">
                                <p className="text-lg text-slate-200 leading-relaxed font-medium">
                                    {source.translation || source.interpretation}
                                </p>
                            </div>

                            {/* Clues Discovery */}
                            <div className="grid gap-3">
                                {source.clues.map(clue => {
                                    const isFound = foundClues.has(clue.id);
                                    return (
                                        <button
                                            key={clue.id}
                                            onClick={() => onClueFound(clue.id)}
                                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left group/clue ${isFound
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
                                                : 'bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/50 text-slate-400'
                                                }`}
                                        >
                                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isFound ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-500 group-hover/clue:bg-indigo-500 group-hover/clue:text-white'
                                                }`}>
                                                {isFound ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1 h-1 rounded-full bg-current" />}
                                            </div>
                                            <div>
                                                <p className="text-base font-semibold mb-2">"{clue.text}"</p>
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
                            {/* Clue collection indicator */}
                            <div className="mt-8 flex items-center justify-between p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileSearch className="w-5 h-5" />
                                    Finn bevis i teksten over
                                </span>
                                <div className="text-xs text-slate-500 italic">
                                    Klikk på uthevede fraser
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Lower Layer: Historical Criticism (Pedagogical Context) */}
            {(source.provenance || source.uncertainty) && (
                <div className="p-6 border-t border-slate-800 bg-slate-900/30 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {source.provenance && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold uppercase tracking-widest">
                                <FileSearch className="w-4 h-4" />
                                Proveniens (hvor kilden kommer fra)
                            </div>
                            <p className="text-slate-300 text-base leading-relaxed border-l-2 border-slate-700 pl-5">
                                {source.provenance}
                            </p>
                        </div>
                    )}
                    {source.uncertainty && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-amber-500 text-sm font-bold uppercase tracking-widest">
                                <AlertTriangle className="w-4 h-4" />
                                Historisk Usikkerhet
                            </div>
                            <p className="text-slate-300 text-base leading-relaxed border-l-2 border-slate-700 pl-5 italic">
                                {source.uncertainty}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
