import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TextAnalysisGameData, TextAnalysisSpan } from '../../../types';
import { TextHighlighter } from './TextHighlighter';

interface TextAnalysisGameProps {
    data: TextAnalysisGameData;
    onComplete?: (score: number) => void;
    onFound?: (item: TextAnalysisSpan) => void;
    transparent?: boolean;
}

export const TextAnalysisGame: React.FC<TextAnalysisGameProps> = ({ data, onComplete, onFound, transparent = false }) => {
    const [foundSpans, setFoundSpans] = useState<TextAnalysisSpan[]>([]);
    const [selection, setSelection] = useState<{ start: number; end: number; rect: DOMRect | null } | null>(null);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'neutral' } | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const handleSelectionChange = (start: number, end: number, rect: DOMRect | null) => {
        if (!rect || start === end) {
            setSelection(null);
            return;
        }
        setSelection({ start, end, rect });
    };

    const handleCategorySelect = (categoryId: string) => {
        if (!selection) return;

        // Validation Logic
        // We check if the current selection overlaps significantly with any solution of the given category
        // that hasn't been found yet.

        const candidateSpan = {
            start: selection.start,
            end: selection.end
        };

        const matchingSolution = data.solutions.find(sol => {
            // Must match category
            if (sol.categoryId !== categoryId) return false;
            // Must not be already found
            if (foundSpans.some(found => found.id === sol.id)) return false;

            // Check overlap
            // Overlap = Math.max(0, Math.min(end1, end2) - Math.max(start1, start2))
            const overlap = Math.max(0, Math.min(candidateSpan.end, sol.end) - Math.max(candidateSpan.start, sol.start));
            const solLength = sol.end - sol.start;
            const candLength = candidateSpan.end - candidateSpan.start;

            // Threshold: Overlap must be at least 50% of the solution OR the candidate
            // This allows for "fuzzy" matching
            return (overlap / solLength > 0.5) || (overlap / candLength > 0.5);
        });

        if (matchingSolution) {
            // Success!
            const newFound = [...foundSpans, matchingSolution];
            setFoundSpans(newFound);
            setScore(prev => prev + 100);
            setFeedback({ message: "Riktig! " + matchingSolution.explanation, type: 'success' });
            if (onFound) onFound(matchingSolution);
            setSelection(null); // Clear selection to hide menu

            // Check for completion
            if (newFound.length === data.solutions.length) {
                setShowConfetti(true);
                if (onComplete) onComplete(score + 100);
            }
        } else {
            // Failure
            setScore(prev => Math.max(0, prev - 10));
            setFeedback({ message: "Ikke helt... Prøv igjen eller velg et annet område.", type: 'error' });
            // Should we clear selection? Maybe keep it so they can try another category?
            // Let's keep it.
        }

        // Hide feedback after 3 seconds
        setTimeout(() => setFeedback(null), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 relative">
            {/* Header / Score */}
            <div className={`flex justify-between items-center mb-6 p-4 rounded-xl border ${transparent ? 'bg-slate-900/40 border-white/10 backdrop-blur-md' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                    <h2 className={`text-2xl font-bold ${transparent ? 'text-stone-200' : 'text-slate-800'}`}>{data.title}</h2>
                    <p className={`${transparent ? 'text-stone-400' : 'text-slate-600'} text-sm`}>Finn {data.solutions.length} retoriske virkemidler i teksten.</p>
                </div>
                <div className="text-right">
                    <div className={`text-sm font-bold ${transparent ? 'text-stone-500' : 'text-slate-500'} uppercase`}>Poeng</div>
                    <div className={`text-3xl font-bold ${transparent ? 'text-amber-400' : 'text-indigo-600'}`}>{score}</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
                <div
                    className="bg-green-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${(foundSpans.length / data.solutions.length) * 100}%` }}
                />
            </div>

            {/* The Text */}
            <TextHighlighter
                text={data.text}
                foundSpans={foundSpans}
                categories={data.categories}
                onSelectionChange={handleSelectionChange}
            />

            {/* Instructions specific to categories */}
            <div className="mt-8 flex gap-4 flex-wrap justify-center">
                {data.categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                        <div className={`w-3 h-3 rounded-full ${cat.color.replace('500', '400').replace('text-', 'bg-')}`}></div>
                        {/* Note: The color logic here needs to align with TextHighlighter helper or be more robust. 
                           For now assuming 'blue-500' -> 'bg-blue-400' roughly works if we use proper logic. 
                           Actually, TextHighlighter uses bg-blue-200 etc. 
                           Let's simplify: just show the label.
                       */}
                        <span className="font-medium">{cat.label}</span>
                    </div>
                ))}
            </div>

            {/* Floating Menu */}
            <AnimatePresence>
                {selection && selection.rect && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed z-50 bg-slate-900 text-white p-2 rounded-lg shadow-xl flex gap-2 items-center"
                        style={{
                            top: selection.rect.top - 60, // Position above
                            left: selection.rect.left + (selection.rect.width / 2) - 150, // Center horizontally-ish
                        }}
                    >
                        <span className="text-xs font-bold text-slate-400 px-2 border-r border-slate-700 mr-1">MARKER SOM:</span>
                        {data.categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat.id)}
                                className="px-3 py-1.5 rounded hover:bg-slate-700 text-sm font-medium transition-colors"
                            >
                                {cat.label}
                            </button>
                        ))}
                        <div className="w-3 h-3 bg-slate-900 absolute -bottom-1.5 left-1/2 -translate-x-1/2 rotate-45"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Toast */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg font-medium text-white ${feedback.type === 'success' ? 'bg-green-600' : 'bg-slate-800'
                            }`}
                    >
                        {feedback.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {showConfetti && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <button
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm w-full h-full border-none cursor-default"
                        onClick={() => setShowConfetti(false)}
                        aria-label="Lukk"
                        type="button"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col relative z-10"
                    >
                        {/* Header */}
                        <div className="bg-green-600 p-6 text-white text-center">
                            <h3 className="text-3xl font-bold mb-2">Gratulerer! 🎉</h3>
                            <p className="text-green-100">Du fant alle {data.solutions.length} virkemidlene.</p>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 overflow-y-auto space-y-4 bg-slate-50 flex-1">
                            {data.solutions.map((sol, i) => {
                                const category = data.categories.find(c => c.id === sol.categoryId);
                                const colorName = category?.color?.split('-')[0] || 'blue';
                                return (
                                    <motion.div
                                        key={sol.id}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span
                                                className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide bg-${colorName}-100 text-${colorName}-700`}
                                            >
                                                {category?.label || sol.categoryId}
                                            </span>
                                        </div>
                                        <p className="text-slate-800 font-serif italic mb-3 border-l-4 border-slate-200 pl-3">
                                            "{data.text.substring(sol.start, sol.end)}"
                                        </p>
                                        <p className="text-slate-600 text-sm">
                                            <span className="font-bold text-slate-800">Forklaring: </span>
                                            {sol.explanation}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-200 bg-white text-center">
                            <button
                                onClick={() => setShowConfetti(false)}
                                className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-transform hover:scale-105"
                            >
                                Se resultatet / Gå videre
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
