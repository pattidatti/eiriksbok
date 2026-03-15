import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Search } from 'lucide-react';
import type { DetectiveSource, DetectiveClue } from './types';

interface SourceViewerProps {
    source: DetectiveSource;
    onClueFound: (clue: DetectiveClue) => void;
    foundClues: Set<string>;
}

/** Try to highlight clue phrases inline in the text. Returns JSX fragments. */
function renderTextWithClues(
    text: string,
    clues: DetectiveClue[],
    foundClues: Set<string>,
    onClueFound: (clue: DetectiveClue) => void
): { rendered: React.ReactNode; unmatchedClues: DetectiveClue[] } {
    const unmatched: DetectiveClue[] = [];

    // Find which clues appear as substrings (case-insensitive match)
    const matchedClues: { clue: DetectiveClue; startIndex: number }[] = [];
    for (const clue of clues) {
        const idx = text.toLowerCase().indexOf(clue.text.toLowerCase());
        if (idx >= 0) {
            matchedClues.push({ clue, startIndex: idx });
        } else {
            unmatched.push(clue);
        }
    }

    if (matchedClues.length === 0) {
        return { rendered: text, unmatchedClues: clues };
    }

    // Sort by position in text
    matchedClues.sort((a, b) => a.startIndex - b.startIndex);

    const parts: React.ReactNode[] = [];
    let cursor = 0;

    for (const { clue, startIndex } of matchedClues) {
        // Don't overlap with previous match
        if (startIndex < cursor) {
            unmatched.push(clue);
            continue;
        }

        // Text before this clue
        if (startIndex > cursor) {
            parts.push(text.slice(cursor, startIndex));
        }

        const matchedText = text.slice(startIndex, startIndex + clue.text.length);
        const isFound = foundClues.has(clue.id);

        parts.push(
            <InlineClue
                key={clue.id}
                clue={clue}
                displayText={matchedText}
                isFound={isFound}
                onCollect={() => onClueFound(clue)}
            />
        );

        cursor = startIndex + clue.text.length;
    }

    // Remaining text after last match
    if (cursor < text.length) {
        parts.push(text.slice(cursor));
    }

    return { rendered: <>{parts}</>, unmatchedClues: unmatched };
}

/** A clickable highlighted phrase within the source text */
function InlineClue({
    clue,
    displayText,
    isFound,
    onCollect,
}: {
    clue: DetectiveClue;
    displayText: string;
    isFound: boolean;
    onCollect: () => void;
}) {
    const [showInsight, setShowInsight] = useState(false);

    const handleClick = () => {
        if (!isFound) onCollect();
        setShowInsight(!showInsight);
    };

    return (
        <span className="relative inline">
            <button
                onClick={handleClick}
                className={`inline rounded px-0.5 -mx-0.5 transition-colors cursor-pointer ${
                    isFound
                        ? 'bg-emerald-500/20 text-emerald-200 underline decoration-emerald-500/40'
                        : 'bg-indigo-500/15 text-indigo-200 underline decoration-indigo-500/40 hover:bg-indigo-500/25'
                }`}
            >
                {displayText}
                {isFound && <CheckCircle2 className="inline w-3.5 h-3.5 ml-1 -mt-0.5 text-emerald-400" />}
            </button>
            <AnimatePresence>
                {showInsight && isFound && (
                    <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="block mt-1 mb-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-200 italic leading-relaxed"
                    >
                        {clue.insight}
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    );
}

/** Fallback chip for clues that don't match the source text */
function ClueChip({
    clue,
    isFound,
    onCollect,
}: {
    clue: DetectiveClue;
    isFound: boolean;
    onCollect: () => void;
}) {
    return (
        <button
            onClick={() => !isFound && onCollect()}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-all ${
                isFound
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                    : 'bg-indigo-500/5 border-indigo-500/20 text-slate-300 hover:bg-indigo-500/10 hover:border-indigo-500/40'
            }`}
        >
            <span
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isFound ? 'bg-emerald-500 text-white' : 'bg-slate-700'
                }`}
            >
                {isFound ? (
                    <CheckCircle2 className="w-3 h-3" />
                ) : (
                    <div className="w-1 h-1 rounded-full bg-slate-500" />
                )}
            </span>
            <span className="font-medium">"{clue.text}"</span>
            {isFound && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-emerald-300 italic ml-1"
                >
                    - {clue.insight}
                </motion.span>
            )}
        </button>
    );
}

export const SourceViewer: React.FC<SourceViewerProps> = ({
    source,
    onClueFound,
    foundClues,
}) => {
    const [viewMode, setViewMode] = useState<'raw' | 'interpreted'>('interpreted');
    const [contextTab, setContextTab] = useState<'background' | 'criticism'>('background');

    const translationText = source.translation || source.interpretation || '';

    const { rendered: highlightedText, unmatchedClues } = useMemo(
        () => renderTextWithClues(translationText, source.clues, foundClues, onClueFound),
        [translationText, source.clues, foundClues, onClueFound]
    );

    const hasBackground = !!(source.introduction || source.guidance);
    const hasCriticism = !!(source.provenance || source.uncertainty || source.hint);
    const hasContext = hasBackground || hasCriticism;

    return (
        <div className="flex flex-col bg-slate-800/20 rounded-xl border border-slate-700/50 overflow-hidden">
            {/* Zone 1: Source Document */}
            <div className="flex-shrink-0">
                {/* Compact source header */}
                <div className="px-4 py-3 flex items-center justify-between bg-slate-900/60 border-b border-slate-700/50">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                            <Search className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-200 truncate">
                                {source.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                                {source.metadata.origin}
                            </p>
                        </div>
                    </div>

                    {/* View toggle */}
                    {source.original && (
                        <div className="flex bg-slate-950 rounded-lg p-0.5 border border-white/5 ml-3 flex-shrink-0">
                            <button
                                onClick={() => setViewMode('raw')}
                                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                    viewMode === 'raw'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                Original
                            </button>
                            <button
                                onClick={() => setViewMode('interpreted')}
                                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                    viewMode === 'interpreted'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {source.type === 'textual' ? 'Norsk oversettelse' : 'Tolkning'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Document content */}
                <div className="p-4">
                    <AnimatePresence mode="wait">
                        {viewMode === 'raw' ? (
                            <motion.div
                                key="raw"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {source.type === 'textual' || source.type === 'scientific' ? (
                                    <div className="font-serif text-base leading-relaxed text-slate-400 bg-slate-950/50 p-4 rounded border border-slate-800/50 italic">
                                        {source.original}
                                    </div>
                                ) : (
                                    <img
                                        src={source.original}
                                        alt={source.title}
                                        className="rounded-lg shadow-xl max-h-[200px] object-contain mx-auto"
                                    />
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="interpreted"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* Zone 2: Inline clue discovery within translation text */}
                                <p className="text-base text-slate-100 leading-relaxed">
                                    {highlightedText}
                                </p>

                                {/* Fallback chips for clues that didn't match inline */}
                                {unmatchedClues.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {unmatchedClues.map((clue) => (
                                            <ClueChip
                                                key={clue.id}
                                                clue={clue}
                                                isFound={foundClues.has(clue.id)}
                                                onCollect={() => onClueFound(clue)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Zone 3: Context Panel (tabbed) */}
            {hasContext && (
                <div className="border-t border-slate-700/50">
                    {/* Tab headers */}
                    {hasBackground && hasCriticism ? (
                        <div className="flex border-b border-slate-700/30">
                            <button
                                onClick={() => setContextTab('background')}
                                className={`flex-1 px-4 py-2 text-xs font-semibold transition-colors ${
                                    contextTab === 'background'
                                        ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                Bakgrunn
                            </button>
                            <button
                                onClick={() => setContextTab('criticism')}
                                className={`flex-1 px-4 py-2 text-xs font-semibold transition-colors ${
                                    contextTab === 'criticism'
                                        ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                Kildekritikk
                            </button>
                        </div>
                    ) : (
                        <div className="px-4 py-2 border-b border-slate-700/30">
                            <span className="text-xs font-semibold text-slate-500">
                                {hasBackground ? 'Bakgrunn' : 'Kildekritikk'}
                            </span>
                        </div>
                    )}

                    {/* Tab content */}
                    <div className="p-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {(contextTab === 'background' && hasBackground) || !hasCriticism ? (
                                <motion.div
                                    key="bg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-3"
                                >
                                    {source.introduction && (
                                        <p className="text-sm text-slate-300 leading-relaxed italic">
                                            {source.introduction}
                                        </p>
                                    )}
                                    {source.guidance && (
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            {source.guidance}
                                        </p>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="crit"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-3"
                                >
                                    {source.provenance && (
                                        <div>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Opphav:{' '}
                                            </span>
                                            <span className="text-sm text-slate-400 leading-relaxed">
                                                {source.provenance}
                                            </span>
                                        </div>
                                    )}
                                    {source.uncertainty && (
                                        <div>
                                            <span className="text-xs font-bold text-amber-500/60 uppercase tracking-wider">
                                                Usikkerhet:{' '}
                                            </span>
                                            <span className="text-sm text-slate-400 leading-relaxed italic">
                                                {source.uncertainty}
                                            </span>
                                        </div>
                                    )}
                                    {source.hint && (
                                        <div>
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Hint:{' '}
                                            </span>
                                            <span className="text-sm text-slate-500 italic">
                                                {source.hint}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};
