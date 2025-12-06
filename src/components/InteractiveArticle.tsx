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
import { cleanTextForSpeech } from '../utils/speechUtils';
import { useGlobalTimeline } from '../hooks/useGlobalTimeline';
import { parseYearRange } from '../utils/dateUtils';
import { ImageWithFallback } from './ImageWithFallback';

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
    concepts?: any[];
};

interface InteractiveArticleProps {
    event: ArticleData;
    onClose: () => void;
    fallbackUrl?: string;
}


// Helper Components
const FactBox: React.FC<{ content: string }> = ({ content }) => (
    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
        <h3 className="font-bold text-indigo-900 mb-2 flex items-center">
            <Info className="w-5 h-5 mr-2 text-indigo-600" />
            Visste du at?
        </h3>
        <p className="text-indigo-800 leading-relaxed">
            {content}
        </p>
    </div>
);

const InteractiveMapPlaceholder: React.FC = () => (
    <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 aspect-video flex flex-col items-center justify-center text-slate-500 mb-8">
        <Map className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm font-medium">Interaktivt kart kommer</span>
    </div>
);

const ExpandableSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

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

export const InteractiveArticle: React.FC<InteractiveArticleProps> = ({ event, onClose, fallbackUrl }) => {
    const { events: globalEvents } = useGlobalTimeline();
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
    const contextEvents = React.useMemo(() => {
        const currentRange = parseYearRange(event.year);
        const buffer = 50;
        const contextStart = currentRange.start - buffer;
        const contextEnd = currentRange.end + buffer;

        return globalEvents
            .filter(e => e.id !== event.id.toString())
            .filter(e => {
                const eStart = e.startDate;
                const eEnd = e.endDate || e.startDate;
                return (eStart <= contextEnd && eEnd >= contextStart);
            })
            .map(e => ({
                year: e.displayDate,
                title: e.title,
                description: e.description || '',
                link: e.link
            }));
    }, [event, globalEvents]);
    const internalEvents = event.timeline || [];

    // Combine and sort by year
    const combinedTimeline = [...internalEvents, ...contextEvents].sort((a, b) => {
        const rangeA = parseYearRange(a.year);
        const rangeB = parseYearRange(b.year);
        return rangeA.start - rangeB.start;
    });

    return (
        <div className="min-h-screen pb-20 relative z-20">
            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 h-1 bg-indigo-600 z-50"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Navigation Bar */}
            <div className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-40 pointer-events-none">
                <button
                    onClick={onClose}
                    className="pointer-events-auto flex items-center px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-slate-900 font-bold hover:bg-white transition-all shadow-sm hover:shadow-md group border border-slate-200/50"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Tilbake
                </button>
            </div>

            {/* Header Section */}
            <div className="pt-24 pb-12 px-6 max-w-5xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex justify-center items-center gap-3 mb-6 flex-wrap">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full">
                            {event.category}
                        </span>
                        <span className="flex items-center text-slate-500 font-mono text-sm">
                            <Calendar className="w-3 h-3 mr-1.5" />
                            {event.year}
                        </span>
                        <span className="flex items-center text-slate-500 font-mono text-sm">
                            <Clock className="w-3 h-3 mr-1.5" />
                            {event.readTime}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6 leading-tight">
                        {event.title}
                    </h1>

                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
                        {event.description}
                    </p>

                    {/* TTS Button */}
                    {hasVoice && (
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={handleListenClick}
                                className={`flex items-center px-5 py-2.5 rounded-full font-bold transition-all shadow-sm ${isPlaying
                                    ? 'bg-indigo-600 text-white shadow-indigo-200'
                                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                                    }`}
                            >
                                {isPlaying ? (
                                    isPaused ? (
                                        <>
                                            <PlayCircle className="w-5 h-5 mr-2" /> Fortsett
                                        </>
                                    ) : (
                                        <>
                                            <PauseCircle className="w-5 h-5 mr-2" /> Pause
                                        </>
                                    )
                                ) : (
                                    <>
                                        <Volume2 className="w-5 h-5 mr-2" /> Lytt til artikkel
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Hero Image Banner */}
            <div className="max-w-6xl mx-auto px-6 mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl"
                >
                    <ImageWithFallback
                        src={event.heroImage}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        seed={event.title}
                    />
                </motion.div>
            </div>

            {/* Main Content Container */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-16">
                        {/* Left Column: Article Text */}
                        <div className="space-y-8">
                            <ArticleContent
                                content={event.content}
                                concepts={event.concepts}
                                activeBlockIndex={activeContentIndex}
                                onBlockClick={handleBlockClick}
                                fallbackUrl={fallbackUrl}
                            />

                            {event.fact && <FactBox content={event.fact} />}
                        </div>

                        {/* Right Column: Sidebar / Interactive Elements */}
                        <div className="space-y-8">
                            <div className="sticky top-8">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
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

                                    {combinedTimeline.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-slate-200">
                                            <TimelineComponent
                                                events={combinedTimeline}
                                                title="Tidslinje"
                                                compact={true}
                                            />
                                        </div>
                                    )}
                                </div>

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
        </div>
    );
};
