import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Concept, Quote, GlobalTimelineEvent, SidebarConfig } from '../types';
import { ConceptCard } from './ConceptCard';

interface LessonSidebarProps {
    concepts?: Concept[];
    comparisonTags?: string[];
    quote?: Quote;
    relatedLessons?: { title: string; url: string }[];
    relatedTitle?: string;
    timelineEvents?: GlobalTimelineEvent[];
    config?: SidebarConfig;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
    concepts,
    comparisonTags,
    quote,
    relatedLessons,
    relatedTitle,
    timelineEvents,
    config
}) => {
    return (
        <div className="space-y-8">
            {/* Quote */}
            {quote && (
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                    <blockquote className="text-lg font-serif italic text-slate-900 mb-4">
                        "{quote.text}"
                    </blockquote>
                    {(quote.source || quote.reference) && (
                        <div className="text-sm text-slate-600 text-right">
                            {quote.source && <span className="font-bold block">{quote.source}</span>}
                            {quote.reference && <span>{quote.reference}</span>}
                        </div>
                    )}
                </div>
            )}

            {/* Concepts */}
            {config?.showConcepts !== false && concepts && concepts.length > 0 && (
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

            {/* Related Lessons */}
            {config?.showRelated !== false && relatedLessons && relatedLessons.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                        {relatedTitle || 'Mer i dette emnet'}
                    </h3>
                    <ul className="space-y-3">
                        {relatedLessons.map(lesson => (
                            <li key={lesson.url}>
                                <Link
                                    to={lesson.url}
                                    className="block p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                                >
                                    <span className="font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">
                                        {lesson.title}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Timeline Context - Moved to bottom */}
            {config?.showTimeline !== false && timelineEvents && timelineEvents.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
                    {/* Decorative line */}
                    <div className="absolute top-0 bottom-0 left-9 w-0.5 bg-slate-200" />

                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6 pl-1 relative z-10 bg-slate-50 w-full">
                        Tidslinje
                    </h3>

                    <div className="space-y-6 relative z-10">
                        {timelineEvents.map((event, i) => (
                            <div key={event.id} className="flex gap-4 group cursor-default">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500 mt-1 shadow-sm group-hover:border-indigo-400 group-hover:text-indigo-600 transition-colors">
                                    {i + 1}
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 block mb-0.5">{event.displayDate}</span>
                                    <h4 className="text-sm font-bold text-slate-700 leading-tight group-hover:text-indigo-700 transition-colors">
                                        {event.title}
                                    </h4>
                                    {event.link && (
                                        <Link to={event.link} className="text-[10px] text-indigo-500 flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Les mer <ArrowRight size={10} />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
