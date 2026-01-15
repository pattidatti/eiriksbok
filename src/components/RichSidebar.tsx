import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Map, ChevronDown, ChevronUp, Volume2, PauseCircle, PlayCircle } from 'lucide-react';
import { TimelineComponent } from './TimelineComponent';
import type { SidebarConfig } from '../types';

interface RichSidebarProps {
    details: string[];
    timelineEvents: any[];
    relatedArticles: any[];
    mapData?: any;
    tags?: string[];
    config?: SidebarConfig;
    learningPaths?: { id: string; title: string; url: string }[];
    audioState?: {
        isPlaying: boolean;
        isPaused: boolean;
        hasVoice: boolean;
        onToggle: () => void;
    };
    metadata?: {
        year: string;
        readTime: string;
        category: string;
    };
}

const InteractiveMapPlaceholder: React.FC = () => (
    <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 aspect-video flex flex-col items-center justify-center text-slate-500 mb-8">
        <Map className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm font-medium">Interaktivt kart kommer</span>
    </div>
);

const ExpandableSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-3 text-left group"
            >
                <span className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                    {title}
                </span>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 text-sm text-slate-600">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const RichSidebar: React.FC<RichSidebarProps> = React.memo(({ details, timelineEvents, relatedArticles, mapData, tags, config, learningPaths, audioState, metadata }) => {
    return (
        <div className="space-y-8">
            <div className="sticky top-8">
                {/* Desktop: Audio Player & Key Info */}
                <div className="hidden md:block space-y-4 mb-8">
                    {config?.showAudio !== false && audioState?.hasVoice && (
                        <button
                            onClick={audioState.onToggle}
                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all shadow-sm group border ${audioState.isPlaying
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-md'
                                }`}
                        >
                            <span className="font-bold text-sm flex items-center">
                                {audioState.isPlaying ? (
                                    audioState.isPaused ? (
                                        <>
                                            <PlayCircle className="w-5 h-5 mr-3" />
                                            Fortsett avspilling
                                        </>
                                    ) : (
                                        <>
                                            <PauseCircle className="w-5 h-5 mr-3" />
                                            Pause opplesning
                                        </>
                                    )
                                ) : (
                                    <>
                                        <Volume2 className={`w-5 h-5 mr-3 ${audioState.isPlaying ? 'text-white' : 'text-indigo-600'}`} />
                                        Lytt til artikkel
                                    </>
                                )}
                            </span>
                        </button>
                    )}

                    {metadata && (
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Periode</span>
                                <span className="font-mono text-sm font-bold text-slate-700">{metadata.year}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Lesetid</span>
                                <span className="font-mono text-sm font-bold text-slate-700">{metadata.readTime}</span>
                            </div>
                        </div>
                    )}
                </div>
                {learningPaths && learningPaths.length > 0 && (
                    <div className="space-y-3 mb-8">
                        {learningPaths.map(path => (
                            <Link
                                key={path.id}
                                to={path.url}
                                className="block bg-indigo-600 hover:bg-indigo-700 p-4 rounded-2xl text-white shadow-lg transition-all group overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all">
                                    <Map className="w-12 h-12" />
                                </div>
                                <div className="relative z-10">
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Denne artikkelen er en del av en læringssti</div>
                                    <div className="font-bold flex items-center gap-2">
                                        <Map className="w-4 h-4" />
                                        {path.title}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {(details.length > 0 || (config?.showTimeline !== false && timelineEvents.length > 0)) && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                        {details.length > 0 && (
                            <>
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center uppercase tracking-wider text-sm">
                                    <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                                    Nøkkelpunkter
                                </h3>
                                <ul className="space-y-3">
                                    {details.map((detail, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-slate-600">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {config?.showTimeline !== false && timelineEvents.length > 0 && (
                            <div className={`${details.length > 0 ? 'mt-6 pt-6 border-t border-slate-200' : ''}`}>
                                <TimelineComponent
                                    events={timelineEvents}
                                    title="Tidslinje"
                                    compact={true}
                                />
                            </div>
                        )}
                    </div>
                )}

                {mapData && <InteractiveMapPlaceholder />}

                <div className="mt-8">
                    <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Fordypning</h3>

                    {config?.showRelated !== false && relatedArticles.length > 0 && (
                        <ExpandableSection title="Les mer i samme emne" defaultOpen={true}>
                            <div className="space-y-2">
                                {relatedArticles.map(article => (
                                    <Link
                                        key={article.id}
                                        to={article.url}
                                        className="block p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm group"
                                    >
                                        <span className="block font-medium text-slate-700 group-hover:text-indigo-700">
                                            {article.title}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {article.date}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </ExpandableSection>
                    )}

                    {tags && tags.length > 0 && (
                        <ExpandableSection title="Relaterte Emner">
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <Link
                                        key={tag}
                                        to={`/sok?tag=${tag}`}
                                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                                    >
                                        {tag}
                                    </Link>
                                ))}
                            </div>
                        </ExpandableSection>
                    )}
                </div>
            </div>
        </div>
    );
});
