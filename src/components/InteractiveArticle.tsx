import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    Map,
    Info,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Share2,
    Bookmark,
    BookOpen,
    ArrowLeft
} from 'lucide-react';
import { ArticleContent } from './ArticleContent';
import { TimelineComponent } from './TimelineComponent';
import type { ContentBlock } from '../types';

// Generic Article Data Type
export type ArticleData = {
    id: string | number;
    year: string;
    title: string;
    description: string;
    content: ContentBlock[];
    details: string[];
    icon?: React.ReactNode;
    category: string;
    url?: string;
    readTime: string;
    heroImage?: string;
    timeline?: { year: string; title: string; description: string }[];
};

interface InteractiveArticleProps {
    event: ArticleData;
    onClose: () => void;
}

const InteractiveMapPlaceholder = () => (
    <div className="relative w-full h-64 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group cursor-pointer shadow-sm">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 flex items-center space-x-2 group-hover:scale-105 transition-transform shadow-md">
                <Map className="w-5 h-5 text-indigo-600" />
                <span className="text-slate-900 font-bold text-sm">Utforsk Kartet</span>
            </div>
        </div>
    </div>
);

const FactBox = ({ content }: { content: string }) => (
    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl my-8">
        <h4 className="text-indigo-700 font-bold text-sm uppercase mb-2 flex items-center tracking-wider">
            <Info className="w-4 h-4 mr-2" /> Visste du at?
        </h4>
        <p className="text-slate-700 text-base leading-relaxed italic">
            {content}
        </p>
    </div>
);

const ExpandableSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-4 shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
                <span className="font-bold text-slate-800">{title}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const InteractiveArticle: React.FC<InteractiveArticleProps> = ({ event, onClose }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);

    return (
        <div className="bg-white min-h-screen relative z-20">
            {/* ... (Header/Hero section remains unchanged) ... */}
            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 h-1 bg-indigo-600 z-50"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Header Image / Hero */}
            <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
                <div className="absolute inset-0 bg-slate-900">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                </div>

                {/* Navigation Bar */}
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-30">
                    <button
                        onClick={onClose}
                        className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-slate-900 font-bold hover:bg-white transition-all shadow-sm hover:shadow-md group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Tilbake til tidslinjen
                    </button>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => setIsBookmarked(!isBookmarked)}
                            className={`p-3 rounded-full backdrop-blur-md transition-all shadow-sm ${isBookmarked ? 'bg-indigo-600 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'}`}
                        >
                            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button className="p-3 bg-white/80 backdrop-blur-md rounded-full text-slate-700 hover:bg-white transition-all shadow-sm">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Title & Meta */}
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center space-x-4 mb-6">
                            <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-sm">
                                {event.category}
                            </span>
                            <span className="flex items-center text-slate-600 font-mono text-sm bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md">
                                <Calendar className="w-4 h-4 mr-2" />
                                {event.year}
                            </span>
                            <span className="flex items-center text-slate-600 font-mono text-sm bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md">
                                <Clock className="w-4 h-4 mr-2" />
                                {event.readTime}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-7xl font-display font-bold text-slate-900 mb-6 leading-tight drop-shadow-sm max-w-4xl">
                            {event.title}
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-700 max-w-3xl leading-relaxed font-light drop-shadow-sm">
                            {event.description}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-16">
                    {/* Left Column: Article Text */}
                    <div className="space-y-8">
                        <ArticleContent content={event.content} />

                        <FactBox content="Visste du at denne hendelsen fikk ringvirkninger som vi fortsatt merker i dag? Historikere mener at dette var et vendepunkt for hele regionen." />


                    </div>

                    {/* Right Column: Sidebar / Interactive Elements */}
                    <div className="space-y-8">
                        <div className="sticky top-8">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center uppercase tracking-wider text-sm">
                                    <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                                    Nøkkelpunkter
                                </h3>
                                <ul className="space-y-3">
                                    {event.details.map((detail, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-slate-600">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {event.timeline && (
                                <TimelineComponent
                                    events={event.timeline}
                                    title="Tidslinje"
                                    compact={true}
                                />
                            )}

                            <InteractiveMapPlaceholder />

                            <div className="mt-8">
                                <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Fordypning</h3>
                                <ExpandableSection title="Kilder og Litteratur">
                                    <ul className="list-disc pl-4 space-y-2">
                                        <li>Historisk Tidsskrift, 2023</li>
                                        <li>Norgeshistorie.no</li>
                                        <li>Store Norske Leksikon</li>
                                    </ul>
                                </ExpandableSection>
                                <ExpandableSection title="Relaterte Emner">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">Politikk</span>
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">Økonomi</span>
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">Kultur</span>
                                    </div>
                                </ExpandableSection>
                            </div>

                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-full p-4 mt-8 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl group"
                            >
                                <ExternalLink className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                Les mer på SNL
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
