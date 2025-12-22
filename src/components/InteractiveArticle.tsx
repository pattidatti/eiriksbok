import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    Info,
    Volume2,
    PauseCircle,
    PlayCircle,
    ArrowLeft
} from 'lucide-react';
import { ArticleContent } from './ArticleContent';
import { RichSidebar } from './RichSidebar';
import { LearningPath } from './content/LearningPath';
import type { ContentBlock, LearningPathData } from '../types';
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
    mapData?: any;
    tags?: string[];
    concepts?: any[];
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
            .filter(e => e.id.toString() !== event.id.toString())
            .filter(e => {
                const eStart = e.startDate;
                const eEnd = e.endDate || e.startDate;
                return (eStart <= contextEnd && eEnd >= contextStart);
            })
            .map(e => ({
                year: e.displayDate || e.year || '',
                startDate: e.startDate,
                title: e.title,
                description: e.description || '',
                link: e.link
            }));
    }, [event, globalEvents]);

    // Combine and sort by year
    const combinedTimeline = React.useMemo(() => {
        return [...contextEvents].sort((a, b) => {
            const getStart = (item: any) => {
                if (typeof item.startDate === 'number') return item.startDate;
                return parseYearRange(item.year).start;
            };
            return getStart(a) - getStart(b);
        });
    }, [contextEvents]);

    // Find related articles using the shared hook
    // We use the event's subjectId and topicId if available, otherwise defaults or empty strings
    // Note: The hook handles empty strings gracefully by returning empty array
    const relatedArticles = useRelatedContent(
        event.subjectId || '',
        event.topicId || '',
        event.id.toString()
    ).slice(0, 5); // Limit to 5 related articles

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
            {event.layout !== 'tool' && (
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
            )}

            {/* Main Content Container */}
            <div className={`${(event.layout === 'tool' || event.layout === 'learning-path') ? 'w-full' : 'max-w-6xl mx-auto px-6'}`}>
                <div className={`${(event.layout === 'tool' || event.layout === 'learning-path') ? 'w-full' : 'bg-white rounded-3xl p-8 md:p-12'}`}>
                    {event.layout === 'learning-path' && event.learningPathData ? (
                        <LearningPath data={event.learningPathData} />
                    ) : (
                        <div className={`grid gap-16 ${event.layout === 'tool' ? 'grid-cols-1 w-full' : 'grid-cols-1 lg:grid-cols-[1fr_350px]'}`}>
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
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
