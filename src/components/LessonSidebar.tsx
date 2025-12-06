import React from 'react';
import { Link } from 'react-router-dom';
import type { Concept, Quote } from '../types';
import { ConceptCard } from './ConceptCard';

interface LessonSidebarProps {
    concepts?: Concept[];
    comparisonTags?: string[];
    quote?: Quote;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({ concepts, comparisonTags, quote }) => {
    return (
        <div className="space-y-8">
            {/* Quote */}
            {quote && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
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
                <section>
                    <h2 className="text-2xl font-display font-bold text-text-main mb-6 border-l-4 border-neon-accent pl-4">
                        Begreper
                    </h2>
                    <div className="space-y-4">
                        {concepts.map(concept => (
                            <ConceptCard key={concept.id} concept={concept} />
                        ))}
                    </div>
                </section>
            )}

            {/* Comparison Tags */}
            {comparisonTags && comparisonTags.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                        Se også
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {comparisonTags.map(tag => (
                            <Link
                                key={tag}
                                to={`/krle/sammenlign/tema/${tag}`}
                                className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
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
