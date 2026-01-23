import React, { useState } from 'react';
import { Check, RefreshCw, Eraser } from 'lucide-react';

import { renderInlineMarkdown } from '../../markdownUtils';

interface CorrectWord {
    word: string;
    category: string;
}

interface TextHighlighterProps {
    text: string;
    correctWords: (string | CorrectWord)[]; // List of words that are correct to click
    instruction?: string;
}

const CATEGORY_STYLES: Record<string, { label: string; color: string; bg: string; border: string; text: string }> = {
    subject: { label: 'Subjekt', color: 'bg-green-500', bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800' },
    verbal: { label: 'Verbal', color: 'bg-red-500', bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800' },
    object: { label: 'Objekt', color: 'bg-blue-500', bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800' },
    adverbial: { label: 'Adverbial', color: 'bg-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-800' },
    default: { label: 'Markering', color: 'bg-indigo-500', bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-800' }
};

export const TextHighlighter: React.FC<TextHighlighterProps> = ({ text, correctWords, instruction }) => {
    // Map word index to assigned category (or undefined if not selected)
    const [selections, setSelections] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    // Determine available categories from props
    const categories = Array.from(new Set(correctWords.map(cw =>
        typeof cw === 'string' ? 'default' : cw.category
    )));

    const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'default');

    // Parse correct answers into a map for easy lookup: index -> correctCategory
    const words = text.split(' ');

    const cleanWord = (w: string) => w.replace(/[.,!?]/g, '').toLowerCase();

    const getCorrectCategory = (index: number): string | null => {
        const word = cleanWord(words[index]);
        const match = correctWords.find(cw => {
            const w = typeof cw === 'string' ? cw : cw.word;
            return cleanWord(w) === word;
        });

        if (!match) return null;
        return typeof match === 'string' ? 'default' : match.category;
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
    };

    const reset = () => {
        setSelections({});
        setShowResults(false);
    };

    // Calculate score
    let score = 0;
    let maxScore = 0;

    words.forEach((_, i) => {
        const correctCat = getCorrectCategory(i);
        if (correctCat) {
            maxScore++;
            if (selections[i] === correctCat) {
                score++;
            }
        } else if (selections[i]) {
            // Penalize wrong highlights? For now, simple score.
        }
    });

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h4 className="font-bold text-slate-700">{instruction ? renderInlineMarkdown(instruction) : "Marker ordene"}</h4>
                {showResults && (
                    <span className={`text-sm font-bold ${score === maxScore ? 'text-green-600' : 'text-orange-600'}`}>
                        {score} / {maxScore} korrekte
                    </span>
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

            <div className="p-6">
                <div className="flex flex-wrap gap-x-1 gap-y-2.5 text-lg leading-loose font-medium text-slate-700">
                    {words.map((word, i) => {
                        const userCat = selections[i];
                        const correctCat = getCorrectCategory(i);

                        let className = "px-1 py-1 rounded cursor-pointer transition-all duration-200 border-b-2 ";

                        // Default state
                        if (!userCat && !showResults) {
                            className += "border-transparent hover:bg-slate-100";
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
                                    className += `bg-transparent border-dashed ${style.border} text-slate-400 decoration-wavy underline`;
                                }
                            } else if (userCat) {
                                // Wrongly highlighted (was not supposed to be highlighted)
                                className += "bg-red-50 border-red-200 text-red-300 line-through";
                            } else {
                                className += "border-transparent opacity-50";
                            }
                        }

                        return (
                            <span
                                key={i}
                                onClick={() => handleWordClick(i)}
                                className={className}
                            >
                                {word}
                            </span>
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
                            className="px-4 py-2 text-slate-500 rounded-lg font-medium hover:bg-slate-200 hover:text-slate-700 disabled:opacity-0 flex items-center gap-2 transition-opacity"
                        >
                            <Eraser className="w-4 h-4" /> Nullstill
                        </button>
                        <button
                            onClick={checkAnswers}
                            disabled={Object.keys(selections).length === 0}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                        >
                            <Check className="w-4 h-4" /> Sjekk svar
                        </button>
                    </>
                ) : (
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Prøv igjen
                    </button>
                )}
            </div>
        </div>
    );
};
