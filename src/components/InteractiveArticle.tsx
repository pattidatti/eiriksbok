import React, { useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Info,
    Volume2,
    PauseCircle,
    PlayCircle,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArticleContent } from './ArticleContent';
import { RichSidebar } from './RichSidebar';
import { LearningPath } from './content/LearningPath';
import type { ContentBlock, LearningPathData, MapData, Concept } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { cleanTextForSpeech } from '../utils/speechUtils';
import { useGlobalTimeline } from '../hooks/useGlobalTimeline';
import { parseYearRange } from '../utils/dateUtils';
import { ImageWithFallback } from './ImageWithFallback';
import { useRelatedContent } from '../hooks/useRelatedContent';
import type { SidebarConfig } from '../types';

// Generic Article Data Type
export type ArticleData = {
    id: string | number;
    year: string;
    title: string;
    description: string;
    layout?: 'standard' | 'rich' | 'tool' | 'learning-path';
    content: ContentBlock[];
    details: string[];
    icon?: React.ReactNode;
    category: string;
    url?: string;
    readTime: string;
    heroImage?: string;

    fact?: string;
    mapData?: MapData;
    tags?: string[];
    concepts?: Concept[];
    topicId?: string;
    subjectId?: string;
    learningPathData?: LearningPathData;
    learningPaths?: { id: string; title: string; url: string }[];
};

interface InteractiveArticleProps {
    event: ArticleData;
    onClose: () => void;
    fallbackUrl?: string;
    sidebarConfig?: SidebarConfig;
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



export const InteractiveArticle: React.FC<InteractiveArticleProps> = ({ event, onClose, fallbackUrl, sidebarConfig }) => {
    const navigate = useNavigate();
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

    // Stabilize handlers with useCallback
    const handleListenClick = useCallback(() => {
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
    }, [isPlaying, isPaused, resume, pause, speak, speechData.blocks]);

    const handleBlockClick = useCallback((contentIndex: number) => {
        const speechIndex = speechData.mapContentToSpeech[contentIndex];
        if (speechIndex !== undefined) {
            playBlock(speechIndex);
        }
    }, [speechData.mapContentToSpeech, playBlock]);

    // Memoize sidebar props to prevent re-renders in RichSidebar
    const audioState = useMemo(() => ({
        isPlaying,
        isPaused,
        hasVoice,
        onToggle: handleListenClick
    }), [isPlaying, isPaused, hasVoice, handleListenClick]);

    const metadata = useMemo(() => ({
        year: event.year,
        readTime: event.readTime,
        category: event.category
    }), [event.year, event.readTime, event.category]);

    // Determine active content block for highlighting
    const activeContentIndex = activeBlockIndex !== -1 ? speechData.mapSpeechToContent[activeBlockIndex] : undefined;

    // Smart Context Logic for Timeline
    const combinedTimeline = React.useMemo(() => {
        const currentRange = parseYearRange(event.year);
        // If we can't parse a start year, return empty
        if (!currentRange.start) return [];

        const duration = currentRange.end - currentRange.start;
        // Dynamic buffer: 20% of duration, min 5 years, max 100 years
        // Example: 1929-1933 (4y) -> buffer 5y
        // Example: 800-1050 (250y) -> buffer 50y
        const buffer = Math.max(5, Math.min(100, Math.ceil(duration * 0.2)));

        const contextStart = currentRange.start - buffer;
        const contextEnd = currentRange.end + buffer;

        // Helper to judge relevance
        const getScore = (e: any) => {
            let score = 0;
            const eStart = e.startDate;
            const eEnd = e.endDate || e.startDate;

            // 1. Strict Overlap (+100)
            // Event must overlap with the core article range
            if (eStart <= currentRange.end && eEnd >= currentRange.start) {
                score += 100;
            }

            // 2. Topic Match (+50)
            if (e.topicId && event.topicId && e.topicId === event.topicId) {
                score += 50;
            }

            // 3. Subject Match (+20)
            if (e.subjectId && event.subjectId && e.subjectId === event.subjectId) {
                score += 20;
            }

            // 4. Distance Penalty (-0.5 per year from center)
            const eventCenter = (currentRange.start + currentRange.end) / 2;
            const eCenter = (eStart + eEnd) / 2;
            const distance = Math.abs(eventCenter - eCenter);
            score -= (distance * 0.5);

            return score;
        };

        const scoredEvents = globalEvents
            .filter(e => e.id?.toString() !== event.id?.toString())
            .map(e => ({ ...e, score: getScore(e) }))
            .filter(e => {
                const eStart = e.startDate;
                const eEnd = e.endDate || e.startDate;
                // Hard filter: Must physically fall within the buffered window
                return (eStart <= contextEnd && eEnd >= contextStart);
            });

        // Sort: High score first, then chronological
        scoredEvents.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.startDate - b.startDate;
        });

        // Density Control: Max 20 items
        const topEvents = scoredEvents.slice(0, 20);

        // Final Sort: Chronological for display
        return topEvents.sort((a, b) => a.startDate - b.startDate).map(e => ({
            year: e.displayDate || e.year || '',
            startDate: e.startDate,
            title: e.title,
            description: e.description || '',
            link: e.link
        }));
    }, [event, globalEvents]);

    // Find related articles using the shared hook
    // We use the event's subjectId and topicId if available, otherwise defaults or empty strings
    // Note: The hook handles empty strings gracefully by returning empty array
    const relatedArticles = useRelatedContent(
        event.subjectId || '',
        event.topicId || '',
        event.id?.toString() || '',
        event.tags || []
    ).slice(0, 5); // Limit to 5 related articles

    // Diagnostic logging
    console.log(`[InteractiveArticle] Rendering: title="${event.title}", layout="${event.layout}", hasContent=${!!event.content}, hasLPData=${!!event.learningPathData}, LPSteps=${event.learningPathData?.steps?.length}`);

    if (event.layout === 'learning-path' && !event.learningPathData) {
        console.warn(`[InteractiveArticle] WARNING: layout is learning-path but learningPathData is MISSING`);
    }

    return (
        <div className="min-h-screen pb-20 relative z-20" data-article-rendering="true">
            {/* Progress Bar */}
            <motion.div
                className="fixed top-16 left-0 h-1 bg-indigo-600 z-50"
                initial={{ width: "0%", opacity: 1 }}
                animate={{ width: "100%", opacity: 0 }}
                transition={{
                    width: { duration: 1.5, ease: "easeInOut" },
                    opacity: { duration: 0.3, delay: 1.5, ease: "easeIn" }
                }}
            />

            {/* Navigation Bar */}
            <div className="fixed top-32 left-0 w-full p-4 flex justify-between items-center z-40 pointer-events-none">
                <div className="pointer-events-auto flex gap-2">

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-slate-900 font-bold hover:bg-white transition-all shadow-sm hover:shadow-md group border border-slate-200/50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Tilbake
                    </button>
                </div>
            </div>

            {/* Header Section */}
            <div className="pt-16 pb-4 md:pt-32 md:pb-6 px-6 max-w-5xl mx-auto text-center">
                <div>
                    {/* Mobile-Only Meta Row */}
                    <div className="md:hidden flex flex-wrap justify-center items-center gap-3 text-xs font-bold text-slate-500 mb-3">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md uppercase tracking-wide">
                            {event.category}
                        </span>
                        <span>•</span>
                        <span>{event.year}</span>
                        <span>•</span>
                        <span>{event.readTime}</span>
                        {hasVoice && (
                            <>
                                <span>•</span>
                                <button
                                    onClick={handleListenClick}
                                    className={`flex items-center gap-1.5 transition-colors ${isPlaying ? 'text-indigo-600' : 'text-slate-500'}`}
                                >
                                    {isPlaying ? (
                                        isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4 animate-pulse" />
                                    ) : (
                                        <Volume2 className="w-4 h-4" />
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-2 leading-tight">
                        {event.title}
                    </h1>
                </div>
            </div>

            {/* Hero Image Banner */}
            {event.layout !== 'tool' && (
                <div className="max-w-6xl mx-auto px-6 mb-8 md:mb-12">
                    <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl">
                        <ImageWithFallback
                            src={event.heroImage}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            seed={event.title}
                        />
                    </div>
                </div>
            )}

            {/* Main Content Container */}
            <div className={`${(event.layout === 'tool' || event.layout === 'learning-path') ? 'w-full' : 'max-w-6xl mx-auto px-6'}`}>
                <div className={`${(event.layout === 'tool' || event.layout === 'learning-path') ? 'w-full' : 'bg-white rounded-3xl p-5 md:p-10'}`}>
                    {event.layout === 'learning-path' && event.learningPathData ? (
                        <LearningPath data={event.learningPathData} />
                    ) : (
                        <div className={`grid gap-8 md:gap-12 ${event.layout === 'tool' ? 'grid-cols-1 w-full' : 'grid-cols-1 lg:grid-cols-[1fr_350px]'}`}>
                            {/* Left Column: Article Text */}
                            <div className="space-y-8">
                                <ArticleContent
                                    content={event.content}
                                    concepts={event.concepts}
                                    activeBlockIndex={activeContentIndex}
                                    onBlockClick={handleBlockClick}
                                    fallbackUrl={fallbackUrl}
                                    isTool={event.layout === 'tool'}
                                />

                                {event.fact && <FactBox content={event.fact} />}
                            </div>

                            {/* Right Column: Sidebar / Interactive Elements */}
                            {event.layout !== 'tool' && (
                                <RichSidebar
                                    details={event.details}
                                    timelineEvents={combinedTimeline}
                                    relatedArticles={relatedArticles}
                                    mapData={event.mapData}
                                    tags={event.tags}
                                    config={sidebarConfig}
                                    learningPaths={event.learningPaths}
                                    audioState={audioState}
                                    metadata={metadata}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
