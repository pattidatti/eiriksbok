import React from 'react';
import { Link } from 'react-router-dom';
import { Quote, BookOpen, ArrowRightLeft } from 'lucide-react';
import type { Concept } from '../types';

interface LessonSidebarProps {
    concepts?: Concept[];
    comparisonTags?: string[];
    quote?: {
        text: string;
        source?: string;
        reference?: string;
    };
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({ concepts, comparisonTags, quote }) => {
    return (
        <div className="space-y-8 sticky top-24">
            {/* Quote */}
            {quote && quote.text && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                        <Quote size={20} />
                        <h3 className="font-bold uppercase tracking-wider text-xs">Sitat</h3>
                    </div>
                    <blockquote className="text-lg font-serif italic text-slate-800 dark:text-slate-200 mb-4">
                        "{quote.text}"
                    </blockquote>
                    {(quote.source || quote.reference) && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 text-right">
                            {quote.source && <span className="font-bold block">{quote.source}</span>}
                            {quote.reference && <span>{quote.reference}</span>}
                        </div>
                    )}
                </div>
            )}

            {/* Concepts */}
            {concepts && concepts.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400">
                        <BookOpen size={20} />
                        <h3 className="font-bold uppercase tracking-wider text-xs">Nøkkelbegreper</h3>
                    </div>
                    <ul className="space-y-4">
                        {concepts.slice(0, 5).map((concept, index) => (
                            <li key={index} className="group">
                                <span className="font-bold text-slate-900 dark:text-white block group-hover:text-indigo-600 transition-colors">
                                    {concept.term || concept.title}
                                </span>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">
                                    {concept.definition || concept.description}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Comparisons */}
            {comparisonTags && comparisonTags.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400">
                        <ArrowRightLeft size={20} />
                        <h3 className="font-bold uppercase tracking-wider text-xs">Se hva andre gjør</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {comparisonTags.map(tag => (
                            <Link
                                key={tag}
                                to={`/krle/sammenlign/tema/${tag}`}
                                className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
