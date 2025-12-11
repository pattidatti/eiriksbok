import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useManifest } from '../hooks/useManifest';
import { useLesson } from '../hooks/useLesson';
import type { ManifestLesson, ContentBlock } from '../types';
import { ConceptCard } from '../components/ConceptCard';
import { ContextBuilder } from '../components/ContextBuilder';
import { Quiz } from '../components/Quiz';
import { DemographyPage } from './DemographyPage';
import { motion } from 'framer-motion';
import { GovernmentExplorer } from '../components/GovernmentExplorer';
import { HistoryLongLines } from '../components/HistoryLongLines';
import { ArticleContent } from '../components/ArticleContent';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { InteractiveArticle } from '../components/InteractiveArticle';
import { NorskArticleLayout } from '../components/NorskArticleLayout';

import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { useUserHistory } from '../hooks/useUserHistory';
import { usePageTitle } from '../hooks/usePageTitle';
import { useGlobalTimeline } from '../hooks/useGlobalTimeline';
import { useAnalytics } from '../hooks/useAnalytics';
import { useReadingTime } from '../hooks/useReadingTime';

import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { Volume2, PauseCircle, PlayCircle } from 'lucide-react';
import { cleanTextForSpeech } from '../utils/speechUtils';
import { LessonSidebar } from '../components/LessonSidebar';

const getFirstTextContent = (blocks: ContentBlock[]): string | undefined => {
    const block = blocks.find((b): b is Extract<ContentBlock, { type: 'text' }> => b.type === 'text' && !!(b.content || b.text));
    return block?.content || block?.text;
};

export const LessonPage: React.FC<{ lessonIdOverride?: string }> = ({ lessonIdOverride }) => {
    const params = useParams<{ subjectId: string; topicId: string; subTopicId?: string; lessonId: string }>();
    const subjectId = params.subjectId || '';
    const topicId = params.topicId || '';

    // If override is provided, it means we are being rendered from TopicPage where subTopicId param is actually the lessonId
    const lessonId = lessonIdOverride || params.lessonId || '';
    const subTopicId = lessonIdOverride ? undefined : params.subTopicId;

    const { data: manifest } = useManifest();
    const { data: lesson, isLoading: lessonLoading } = useLesson(subjectId, topicId, lessonId, subTopicId);

    const [lessonImage, setLessonImage] = useState<string | undefined>(undefined);
    const navigate = useNavigate();
    const { addToHistory } = useUserHistory();

    // TTS Hook
    const { speak, pause, resume, cancel, playBlock, isPlaying, isPaused, hasVoice, activeBlockIndex } = useTextToSpeech();

    usePageTitle(lesson?.title || 'Leksjon', !!lesson);

    // Global Timeline Hook
    const { events: globalTimelineEvents } = useGlobalTimeline();

    // Analytics: Track view
    const analyticsPath = `${subjectId}/${topicId}${subTopicId ? `/${subTopicId}` : ''}/${lessonId}`;
    useAnalytics(lessonId ? analyticsPath : undefined);
    useReadingTime();

    // Calculate speech blocks and mapping
    const speechData = React.useMemo(() => {
        if (!lesson?.content) return { blocks: [], mapSpeechToContent: [], mapContentToSpeech: {} };

        const blocks: string[] = [];
        const mapSpeechToContent: number[] = [];
        const mapContentToSpeech: Record<number, number> = {};

        // Add title as first block
        blocks.push(lesson.title);
        mapSpeechToContent.push(-1); // -1 indicates title

        lesson.content.forEach((block, index) => {
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
    }, [lesson]);

    useEffect(() => {
        if (lesson) {
            addToHistory({
                id: lesson.id,
                title: lesson.title,
                subjectId: (lesson.subject || subjectId).toLowerCase(),
                type: 'lesson'
            });
        }
    }, [lesson, subjectId, addToHistory]);

    // Stop speaking when leaving the page
    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    useEffect(() => {
        if (manifest && subjectId && topicId && lessonId) {
            const subject = manifest.subjects.find(s => s.id === subjectId);
            const topic = subject?.topics.find(t => t.id === topicId);
            let foundLesson: ManifestLesson | undefined;
            let topicImg = topic?.image;

            if (subTopicId && topic?.subTopics) {
                const subTopic = topic.subTopics.find(st => st.id === subTopicId);
                foundLesson = subTopic?.lessons.find((l: any) => l.id === lessonId);
                topicImg = subTopic?.image || topicImg;
            } else if (topic?.lessons) {
                foundLesson = topic.lessons.find((l: any) => l.id === lessonId);
            }

            if (foundLesson?.image) {
                setLessonImage(foundLesson.image);
            } else if (topicImg) {
                setLessonImage(topicImg);
            }
        }
    }, [manifest, subjectId, topicId, subTopicId, lessonId]);

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

    const loading = lessonLoading;

    if (loading) return <div className="p-8 text-center">Laster leksjon...</div>;

    // Special handling for Demography module
    if (topicId === 'demografi-okonomi' && lessonId === 'intro') {
        return <DemographyPage />;
    }

    if (topicId === 'styringsformer' && lessonId === 'utforsk' && lesson) {
        return <GovernmentExplorer lesson={lesson} />;
    }



    // Check if this is a timeline event (regardless of subtopic)
    const timelineEvent = lessonId ? globalTimelineEvents.find(e =>
        e.title?.toLowerCase().replace(/\s+/g, '-') === lessonId.toLowerCase() ||
        e.title?.toLowerCase() === lessonId.toLowerCase() ||
        e.id.toString() === lessonId
    ) : null;

    // Construct fallback URL for ArticleContent
    const fallbackUrl = `${window.location.origin}/content/${subjectId}/${topicId}${subTopicId ? `/${subTopicId}` : ''}/${lessonId}/artikkel.json`;

    if (timelineEvent && timelineEvent.type !== 'lesson') {
        return (
            <ErrorBoundary>
                <InteractiveArticle
                    event={{
                        ...timelineEvent,
                        year: timelineEvent.year || timelineEvent.displayDate || '',
                        content: timelineEvent.content || [],
                        details: timelineEvent.details || [],
                        category: timelineEvent.category || 'Historie',
                        readTime: timelineEvent.readTime || '3 min',
                    } as any}
                    onClose={() => navigate(`/${subjectId}/${topicId}${subTopicId ? `/${subTopicId}` : ''}`)}
                    fallbackUrl={fallbackUrl}
                />
            </ErrorBoundary>
        );
    }

    // Special handling for Norsk subject articles
    if (subjectId === 'norsk' && lesson && lesson.layout === 'rich') {
        const articleData = {
            title: lesson.title,
            description: getFirstTextContent(lesson.content || [])?.substring(0, 150) + '...' || '',
            heroImage: lesson.heroImage || lessonImage,
            content: lesson.content || [],
            tags: lesson.tags,
            relatedLink: lesson.relatedLink
        };

        return (
            <ErrorBoundary>
                <NorskArticleLayout
                    article={articleData}
                    relatedLessons={manifest?.subjects
                        .find(s => s.id === subjectId)
                        ?.topics.find(t => t.id === topicId)
                        ?.lessons?.filter((l: any) => l.id !== lessonId)
                        .map((l: any) => ({
                            title: l.title,
                            url: `/${subjectId}/${topicId}/${l.id}`
                        }))}
                    onClose={() => navigate(`/${subjectId}/${topicId}${subTopicId ? `/${subTopicId}` : ''}`)}
                    fallbackUrl={fallbackUrl}
                />
            </ErrorBoundary>
        );
    }

    // Check for rich layout in standard lesson
    if (lesson && lesson.layout === 'rich') {
        const articleData = {
            id: lesson.id,
            year: lesson.year || '',
            title: lesson.title,
            description: getFirstTextContent(lesson.content || [])?.substring(0, 150) + '...' || '',
            content: lesson.content || [],
            details: lesson.details || lesson.concepts?.map(c => `${c.term}: ${c.definition}`) || [],
            category: lesson.category || lesson.topic,
            readTime: lesson.readTime || '5 min lesning',
            heroImage: lesson.heroImage || lessonImage,
            url: lesson.externalUrl,

            fact: lesson.fact,
            mapData: lesson.mapData,
            tags: lesson.tags
        };



        return (
            <ErrorBoundary>
                <InteractiveArticle
                    event={articleData}
                    onClose={() => navigate(`/${subjectId}/${topicId}${subTopicId ? `/${subTopicId}` : ''}`)}
                    fallbackUrl={fallbackUrl}
                />
            </ErrorBoundary>
        );
    }

    if (subTopicId === 'lange-linjer') {
        return (
            <ErrorBoundary>
                <HistoryLongLines />
            </ErrorBoundary>
        );
    }

    if (!lesson) return <div className="p-8 text-center">Fant ikke leksjonen.</div>;

    return (
        <div className="lesson-page max-w-6xl mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <span className="text-sm font-bold uppercase tracking-wider text-neon-accent mb-2 block">
                    {lesson.subject} / {lesson.topic} {subTopicId && `/ ${subTopicId}`}
                </span>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-text-main mb-8">
                    {lesson.title}
                </h1>


                {/* TTS Button */}
                {hasVoice && (
                    <div className="flex justify-center mb-8">
                        <button
                            onClick={handleListenClick}
                            className={`flex items-center px-4 py-2 rounded-full font-bold transition-all shadow-sm ${isPlaying
                                ? 'bg-neon-accent text-slate-900 shadow-neon-glow'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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



                <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-lg mb-12 border border-slate-200">
                    <ImageWithFallback
                        src={lessonImage}
                        alt={lesson.title}
                        seed={lesson.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            </motion.div>

            {/* New Flexible Content Renderer */}
            {lesson.content ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                            <ArticleContent
                                content={lesson.content}
                                concepts={lesson.concepts}
                                activeBlockIndex={activeContentIndex}
                                onBlockClick={handleBlockClick}
                                fallbackUrl={fallbackUrl}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 hidden lg:block">
                        <LessonSidebar
                            concepts={lesson.concepts}
                            comparisonTags={lesson.comparison_tags}
                            quote={lesson.quote}
                            timelineEvents={globalTimelineEvents
                                .filter(e => {
                                    // Normalize topicId to handle case sensitivity in URLs
                                    const currentTopic = topicId?.toLowerCase();

                                    // Special override for Viking Age to show full context (500-1100)
                                    if (currentTopic === 'vikingtiden') {
                                        return (e.startDate >= 500 && e.startDate <= 1100) || e.tags?.includes('vikingtiden') || e.topicId === 'vikingtiden';
                                    }

                                    // Default filtering logic
                                    // Match by subject AND (same topic OR sharing tags)
                                    return e.subjectId === subjectId && (
                                        e.topicId === topicId ||
                                        (lesson.tags && e.tags?.some(t => lesson.tags?.includes(t)))
                                    );
                                })
                                .sort((a, b) => a.startDate - b.startDate)
                                .slice(0, 20) // Increased limit to show full eras
                            }
                            relatedLessons={manifest?.subjects
                                .find(s => s.id === subjectId)
                                ?.topics.find(t => t.id === topicId)
                                ?.lessons?.filter((l: any) => l.id !== lessonId)
                                .map((l: any) => ({
                                    title: l.title,
                                    url: `/${subjectId}/${topicId}/${l.id}`
                                }))}
                            relatedTitle={topicId === 'ordklasser' ? 'Andre ordklasser' : undefined}
                        />
                    </div>

                    {/* Mobile Sidebar Content (stacked below) */}
                    <div className="lg:hidden space-y-8 mt-12">
                        {lesson.concepts && lesson.concepts.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-display font-bold text-text-main mb-6 border-l-4 border-neon-accent pl-4">
                                    Begreper
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {lesson.concepts.map((concept: any) => (
                                        <ConceptCard key={concept.id} concept={concept} />
                                    ))}
                                </div>
                            </section>
                        )}
                        {lesson.quote && (
                            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                <blockquote className="text-lg font-serif italic text-slate-900 mb-4">
                                    "{lesson.quote.text}"
                                </blockquote>
                                {(lesson.quote.source || lesson.quote.reference) && (
                                    <div className="text-sm text-slate-600 text-right">
                                        {lesson.quote.source && <span className="font-bold block">{lesson.quote.source}</span>}
                                        {lesson.quote.reference && <span>{lesson.quote.reference}</span>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Related Lessons (Mobile) */}
                        {manifest?.subjects
                            .find(s => s.id === subjectId)
                            ?.topics.find(t => t.id === topicId)
                            ?.lessons && (
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                                        {topicId === 'ordklasser' ? 'Andre ordklasser' : 'Mer i dette emnet'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {manifest.subjects
                                            .find(s => s.id === subjectId)
                                            ?.topics.find(t => t.id === topicId)
                                            ?.lessons?.filter(l => l.id !== lessonId)
                                            .map((l: any) => (
                                                <Link
                                                    key={l.id}
                                                    to={`/${subjectId}/${topicId}/${l.id}`}
                                                    className="block p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                                                >
                                                    <span className="font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">
                                                        {l.title}
                                                    </span>
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            )}

                    </div>
                </div>
            ) : (
                /* Legacy Rendering Fallback */
                <>
                    <section className="mb-16">
                        <h2 className="text-2xl font-display font-bold text-text-main mb-6 border-l-4 border-neon-accent pl-4">
                            Begreper
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {lesson.concepts?.map((concept: any) => (
                                <ConceptCard key={concept.id} concept={concept} />
                            ))}
                        </div>
                    </section>

                    {lesson.context && (
                        <section className="mb-16">
                            <h2 className="text-2xl font-display font-bold text-text-main mb-6 border-l-4 border-neon-accent pl-4">
                                Kontekst
                            </h2>
                            <ContextBuilder context={lesson.context} concepts={lesson.concepts || []} />
                        </section>
                    )}

                    {lesson.quiz && lesson.quiz.length > 0 && (
                        <section className="mb-16">
                            <h2 className="text-2xl font-display font-bold text-text-main mb-6 border-l-4 border-neon-accent pl-4">
                                Test deg selv
                            </h2>
                            <Quiz questions={lesson.quiz} />
                        </section>
                    )}
                </>
            )
            }
        </div >
    );
};
