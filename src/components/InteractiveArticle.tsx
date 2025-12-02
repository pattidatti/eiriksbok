import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    Map,
    Info,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Volume2,
    PauseCircle,
    PlayCircle,
    BookOpen,
    ArrowLeft
} from 'lucide-react';
import { ArticleContent } from './ArticleContent';
import { TimelineComponent } from './TimelineComponent';
import type { ContentBlock } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

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
    timeline?: { year: string; title: string; description: string; link?: string }[];
    fact?: string;
    mapData?: any;
    tags?: string[];
};

interface InteractiveArticleProps {
    event: ArticleData;
    onClose: () => void;
    parentPath?: string;
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

const FactBox = ({ content }: { content: string }) => {
    if (!content) return null;

    return (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl my-8">
            <h4 className="text-indigo-700 font-bold text-sm uppercase mb-2 flex items-center tracking-wider">
                <Info className="w-4 h-4 mr-2" /> Visste du at?
            </h4>
            <p className="text-slate-700 text-base leading-relaxed italic">
                {content}
            </p>
        </div>
    );
};

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

import { timelineData } from '../data/timelineData';

// Helper to parse year strings into numeric range
const parseYearRange = (yearStr: string): { start: number, end: number } => {
    // Remove "ca." and spaces
    const cleanStr = yearStr.replace(/ca\.?/i, '').replace(/\s+/g, '');

    // Check for "fvt." (BC)
    const isBC = cleanStr.toLowerCase().includes('fvt');
    const multiplier = isBC ? -1 : 1;

    // Remove text suffix
    const numStr = cleanStr.replace(/fvt\.?|evt\.?/i, '');

    // Handle ranges "1400-1500"
    if (numStr.includes('–') || numStr.includes('-')) {
        const parts = numStr.split(/[–-]/);
        if (parts.length === 2) {
            let start = parseInt(parts[0]);
            let end = parseInt(parts[1]);

            if (isNaN(start)) start = 0;
            if (isNaN(end)) end = 0;

            // If BC, the larger number is actually smaller (older), but usually written "12000-4000 fvt"
            // So 12000 BC is start (-12000), 4000 BC is end (-4000)
            if (isBC) {
                return { start: start * multiplier, end: end * multiplier };
            }
            return { start, end };
        }
    }

    // Single year
    const year = parseInt(numStr);
    if (isNaN(year)) return { start: 0, end: 0 };
    return { start: year * multiplier, end: year * multiplier };
};

const getOverlappingEvents = (currentEventId: string | number, currentYearStr: string, parentPath?: string) => {
    const currentRange = parseYearRange(currentYearStr);
    // Add a buffer to context (e.g. +/- 50 years or 10% overlap?)
    // For now, let's just find events that overlap or are very close.
    // Let's say "context" means events that happened WITHIN the start/end of this event,
    // OR if this event is a point in time, events around it.

    // Actually, user said: "inkludere årstall og hendelser som ligger utenfor det artikkelen selv nevner, for å gi større kontekst."
    // So maybe we just grab everything from timelineData that is somewhat relevant?
    // Let's filter for events that overlap with the range [start - 50, end + 50] to give some context.

    const buffer = 50;
    const contextStart = currentRange.start - buffer;
    const contextEnd = currentRange.end + buffer;

    return timelineData
        .filter(e => e.id !== currentEventId)
        .filter(e => {
            const eRange = parseYearRange(e.year);
            // Check overlap
            return (eRange.start <= contextEnd && eRange.end >= contextStart);
        })
        .map(e => ({
            year: e.year,
            title: e.title,
            description: e.description, // Use short description
            link: parentPath ? `${parentPath}/${e.id}` : `../${e.id}` // Use absolute path if available, else relative
        }));
};

// Helper to strip markdown/html for speech
const cleanTextForSpeech = (blocks: ContentBlock[]): string => {
    return blocks
        .filter(b => b.type === 'text' && b.content)
        .map(b => {
            // Basic markdown stripping
            let text = (b as any).content || '';
            text = text.replace(/#{1,6}\s?/g, ''); // Headers
            text = text.replace(/(\*\*|__)(.*?)\1/g, '$2'); // Bold
            text = text.replace(/(\*|_)(.*?)\1/g, '$2'); // Italic
            text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links
            return text;
        })
        .join('. ');
};

export const InteractiveArticle: React.FC<InteractiveArticleProps> = ({ event, onClose, parentPath }) => {
    const { speak, pause, resume, cancel, playBlock, isPlaying, isPaused, hasVoice, activeBlockIndex } = useTextToSpeech();

    // Calculate speech blocks and mapping
    const speechData = React.useMemo(() => {
        if (!event?.content) return { blocks: [], mapSpeechToContent: [], mapContentToSpeech: {} };

        const blocks: string[] = [];
        const mapSpeechToContent: number[] = [];
        const mapContentToSpeech: Record<number, number> = {};

        // Add title as first block
        blocks.push(event.title);
        mapSpeechToContent.push(-1); // -1 indicates title

        event.content.forEach((block, index) => {
            if (block.type === 'text' && block.content) {
                const cleanText = cleanTextForSpeech([block]);
                if (cleanText) {
                    blocks.push(cleanText);
                    const speechIndex = blocks.length - 1;
                    mapSpeechToContent.push(index);
                    mapContentToSpeech[index] = speechIndex;
                }
            }
        });

        return { blocks, mapSpeechToContent, mapContentToSpeech };
    }, [event]);

    // Stop speaking when leaving the component
    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    const handleListenClick = () => {
        if (isPlaying) {
            if (isPaused) {
                resume();
            } else {
                pause();
            }
        } else {
            if (speechData.blocks.length > 0) {
                speak(speechData.blocks);
            }
        }
    };

    const handleBlockClick = (contentIndex: number) => {
        const speechIndex = speechData.mapContentToSpeech[contentIndex];
        if (speechIndex !== undefined) {
            playBlock(speechIndex);
        }
    };

    // Determine active content block for highlighting
    const activeContentIndex = activeBlockIndex !== -1 ? speechData.mapSpeechToContent[activeBlockIndex] : undefined;

    // Merge internal timeline events with external context events
    const contextEvents = getOverlappingEvents(event.id, event.year, parentPath);
    const internalEvents = event.timeline || [];

    // Combine and sort by year
    const combinedTimeline = [...internalEvents, ...contextEvents].sort((a, b) => {
        const rangeA = parseYearRange(a.year);
        const rangeB = parseYearRange(b.year);
        return rangeA.start - rangeB.start;
    });

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
                    <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('${event.heroImage || 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80'}')` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 via-22% to-transparent" />
                </div>

                {/* Navigation Bar */}
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-30">
                    <button
                        onClick={onClose}
                        className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-slate-900 font-bold hover:bg-white transition-all shadow-sm hover:shadow-md group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Tilbake
                    </button>

                    <div className="flex space-x-3">
                        {/* TTS Button in Header */}
                        {hasVoice && (
                            <button
                                onClick={handleListenClick}
                                className={`flex items-center px-4 py-2 rounded-full font-bold transition-all shadow-sm backdrop-blur-md ${isPlaying
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-white/80 text-slate-900 hover:bg-white'
                                    }`}
                            >
                                {isPlaying ? (
                                    isPaused ? (
                                        <>
                                            <PlayCircle className="w-4 h-4 mr-2" /> Fortsett
                                        </>
                                    ) : (
                                        <>
                                            <PauseCircle className="w-4 h-4 mr-2" /> Pause
                                        </>
                                    )
                                ) : (
                                    <>
                                        <Volume2 className="w-4 h-4 mr-2" /> Lytt
                                    </>
                                )}
                            </button>
                        )}
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
                        <ArticleContent
                            content={event.content}
                            activeBlockIndex={activeContentIndex}
                            onBlockClick={handleBlockClick}
                        />

                        {event.fact && <FactBox content={event.fact} />}


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

                            {combinedTimeline.length > 0 && (
                                <TimelineComponent
                                    events={combinedTimeline}
                                    title="Tidslinje"
                                    compact={true}
                                />
                            )}

                            {event.mapData && <InteractiveMapPlaceholder />}

                            <div className="mt-8">
                                <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Fordypning</h3>
                                <ExpandableSection title="Kilder og Litteratur">
                                    <ul className="list-disc pl-4 space-y-2">
                                        <li>Historisk Tidsskrift, 2023</li>
                                        <li>Norgeshistorie.no</li>
                                        <li>Store Norske Leksikon</li>
                                    </ul>
                                </ExpandableSection>
                                {event.tags && event.tags.length > 0 && (
                                    <ExpandableSection title="Relaterte Emner">
                                        <div className="flex flex-wrap gap-2">
                                            {event.tags.map(tag => (
                                                <Link
                                                    key={tag}
                                                    to={`/sok?tag=${tag}`} // Using search/filter route for now, or could be topic page with filter
                                                    className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                                                >
                                                    {tag}
                                                </Link>
                                            ))}
                                        </div>
                                    </ExpandableSection>
                                )}
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
