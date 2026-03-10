import React, { useState, useMemo } from 'react';
import { Check, RefreshCw, Eraser } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

import { renderInlineMarkdown } from '../../markdownUtils';

interface CorrectWord {
    word: string;
    category: string;
}

interface TextHighlighterProps {
    text: string;
    correctWords: (string | CorrectWord)[]; // List of words/phrases that are correct
    instruction?: string;
}

const CATEGORY_STYLES: Record<string, { label: string; color: string; bg: string; border: string; text: string }> = {
    subject: { label: 'Subjekt', color: 'bg-green-500', bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800' },
    verbal: { label: 'Verbal', color: 'bg-red-500', bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800' },
    object: { label: 'Objekt', color: 'bg-blue-500', bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800' },
    adverbial: { label: 'Adverbial', color: 'bg-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-800' },
    default: { label: 'Markering', color: 'bg-indigo-500', bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-800' },
    // Literary device categories
    metafor: { label: 'Metafor', color: 'bg-violet-500', bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-800' },
    sammenligning: { label: 'Sammenligning', color: 'bg-sky-500', bg: 'bg-sky-100', border: 'border-sky-400', text: 'text-sky-800' },
    besjeling: { label: 'Besjeling', color: 'bg-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-800' },
    kontrast: { label: 'Kontrast', color: 'bg-orange-500', bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800' },
    symbol: { label: 'Symbol', color: 'bg-amber-500', bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800' },
    gjentakelse: { label: 'Gjentakelse', color: 'bg-rose-500', bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-800' },
    // Analysis depth categories
    overflate: { label: 'Overflate', color: 'bg-blue-500', bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800' },
    dyp: { label: 'Dyp', color: 'bg-purple-500', bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-800' },
};

export const TextHighlighter: React.FC<TextHighlighterProps> = ({ text, correctWords, instruction }) => {
    // Map word index to assigned category (or undefined if not selected)
    const [selections, setSelections] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    // Determine available categories from props
    const categories = useMemo(() => Array.from(new Set(correctWords.map(cw =>
        typeof cw === 'string' ? 'default' : cw.category
    ))), [correctWords]);

    const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'default');

    const words = useMemo(() => text.split(' '), [text]);

    const cleanWord = (w: string) => w.replace(/[.,!?]/g, '').toLowerCase();

    // Map each word index to its correct category (if any)
    const correctCategoryMap = useMemo(() => {
        const map = new Map<number, string>();

        // Helper to check if a sequence matches
        const matchesPhrase = (startIndex: number, phraseWords: string[]) => {
            if (startIndex + phraseWords.length > words.length) return false;
            for (let i = 0; i < phraseWords.length; i++) {
                if (cleanWord(words[startIndex + i]) !== cleanWord(phraseWords[i])) {
                    return false;
                }
            }
            return true;
        };

        correctWords.forEach(cw => {
            const phrase = typeof cw === 'string' ? cw : cw.word;
            const category = typeof cw === 'string' ? 'default' : cw.category;
            const phraseWords = phrase.split(' ');

            for (let i = 0; i < words.length; i++) {
                if (matchesPhrase(i, phraseWords)) {
                    // Mark all words in this occurrence
                    for (let j = 0; j < phraseWords.length; j++) {
                        map.set(i + j, category);
                    }
                }
            }
        });

        return map;
    }, [words, correctWords]);

    const getCorrectCategory = (index: number): string | undefined => {
        return correctCategoryMap.get(index);
    };

    const handleWordClick = (index: number) => {
        if (showResults) return;

        setSelections(prev => {
            const current = prev[index];
            if (current === activeCategory) {
                // Toggle off
                const next = { ...prev };
                delete next[index];
                return next;
            }
            // Set new category
            return {
                ...prev,
                [index]: activeCategory
            };
        });
    };

    const checkAnswers = () => {
        setShowResults(true);
        if (score === maxScore && maxScore > 0) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    const reset = () => {
        setSelections({});
        setShowResults(false);
    };

    // Calculate score
    let score = 0;
    let maxScore = 0;

    // We calculate max score based on the number of correct indices found
    // This allows for partial credit if multiple correct phrases exist
    maxScore = correctCategoryMap.size;

    words.forEach((_, i) => {
        const correctCat = correctCategoryMap.get(i);
        if (correctCat) {
            if (selections[i] === correctCat) {
                score++;
            }
        }
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden my-8"
        >
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h4 className="font-bold text-slate-700">{instruction ? renderInlineMarkdown(instruction) : "Marker ordene"}</h4>
                {showResults && (
                    <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className={`text-sm font-bold px-3 py-1 rounded-full ${score === maxScore ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                    >
                        {score} / {maxScore} korrekte
                    </motion.span>
                )}
            </div>

            {/* Toolbar for Multi-Category Mode */}
            {!showResults && categories.length > 1 && (
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50/50 border-b border-slate-100 justify-center">
                    {categories.map(cat => {
                        const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.default;
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${isActive ? 'ring-2 ring-offset-2 ring-slate-400 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                                style={{ backgroundColor: isActive ? 'white' : undefined }}
                            >
                                <div className={`w-3 h-3 rounded-full ${style.color}`}></div>
                                {style.label}
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="p-8">
                <div className="flex flex-wrap gap-x-1.5 gap-y-3 text-lg leading-loose font-medium text-slate-700">
                    {words.map((word, i) => {
                        const userCat = selections[i];
                        const correctCat = getCorrectCategory(i);

                        let className = "px-1.5 py-0.5 rounded cursor-pointer border-b-2 ";


                        // Default state
                        if (!userCat && !showResults) {
                            className += "border-transparent hover:bg-slate-100 hover:scale-105";
                        }

                        // User Selection
                        if (userCat && !showResults) {
                            const style = CATEGORY_STYLES[userCat] || CATEGORY_STYLES.default;
                            className += `${style.bg} ${style.border} ${style.text}`;
                        }

                        // Results Mode
                        if (showResults) {
                            if (correctCat) {
                                // Needs highlighting
                                if (userCat === correctCat) {
                                    // Correct!
                                    const style = CATEGORY_STYLES[correctCat] || CATEGORY_STYLES.default;
                                    className += `${style.bg} ${style.border} ${style.text} ring-2 ring-green-400/50`;
                                } else {
                                    // Missed it or wrong cat
                                    const style = CATEGORY_STYLES[correctCat] || CATEGORY_STYLES.default;
                                    className += `bg-transparent border-dashed ${style.border} text-slate-400 decoration-wavy underline opacity-60`;
                                }
                            } else if (userCat) {
                                // Wrongly highlighted (was not supposed to be highlighted)
                                className += "bg-red-50 border-red-200 text-red-300 line-through decoration-red-400";
                            } else {
                                className += "border-transparent opacity-40 blur-[0.5px]";
                            }
                        }

                        return (
                            <motion.span
                                key={i}
                                layout
                                onClick={() => handleWordClick(i)}
                                className={className}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                {word}
                            </motion.span>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                {!showResults ? (
                    <>
                        <button
                            onClick={() => setSelections({})}
                            disabled={Object.keys(selections).length === 0}
                            className="px-4 py-2 text-slate-500 rounded-lg font-medium hover:bg-slate-200 hover:text-slate-700 disabled:opacity-0 flex items-center gap-2 transition-all duration-300"
                        >
                            <Eraser className="w-4 h-4" /> Nullstill
                        </button>
                        <button
                            onClick={checkAnswers}
                            disabled={Object.keys(selections).length === 0}
                            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 shadow-sm transition-all duration-300"
                        >
                            <Check className="w-4 h-4" /> Sjekk svar
                        </button>
                    </>
                ) : (
                    <button
                        onClick={reset}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 hover:shadow-md flex items-center gap-2 transition-all duration-300"
                    >
                        <RefreshCw className="w-4 h-4" /> Prøv igjen
                    </button>
                )}
            </div>
        </motion.div>
    );
};

