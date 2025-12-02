import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { timelineData } from '../data/timelineData';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { useUserHistory } from '../hooks/useUserHistory';
import { usePageTitle } from '../hooks/usePageTitle';

const getFirstTextContent = (blocks: ContentBlock[]): string | undefined => {
    const block = blocks.find((b): b is Extract<ContentBlock, { type: 'text' }> => b.type === 'text' && !!b.content);
    return block?.content;
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

    usePageTitle(lesson?.title || 'Leksjon', !!lesson);

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

    const loading = lessonLoading;

    if (loading) return <div className="p-8 text-center">Laster leksjon...</div>;

    // Special handling for Demography module
    if (topicId === 'demografi-okonomi') {
        return <DemographyPage />;
    }

    if (topicId === 'styringsformer' && lessonId === 'utforsk') {
        return <GovernmentExplorer />;
    }

    // Check if this is a timeline event (regardless of subtopic)
    const timelineEvent = lessonId ? timelineData.find(e =>
        e.title.toLowerCase().replace(/\s+/g, '-') === lessonId.toLowerCase() ||
        e.title.toLowerCase() === lessonId.toLowerCase() ||
        e.id.toString() === lessonId
    ) : null;

    if (timelineEvent) {
        return (
            <ErrorBoundary>
                <InteractiveArticle
                    event={timelineEvent}
                    onClose={() => navigate(`/${subjectId}/${topicId}${subTopicId ? `/${subTopicId}` : ''}`)}
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
                    onClose={() => navigate(`/${subjectId}/${topicId}${subTopicId ? `/${subTopicId}` : ''}`)}
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
            details: lesson.details || [],
            category: lesson.category || lesson.topic,
            readTime: lesson.readTime || '5 min lesning',
            heroImage: lesson.heroImage || lessonImage,
            url: lesson.externalUrl,
            timeline: lesson.timeline || [],
            fact: lesson.fact,
            mapData: lesson.mapData,
            tags: lesson.tags
        };

        // If no explicit timeline is provided, try to generate one from global timelineData
        if ((!articleData.timeline || articleData.timeline.length === 0) && articleData.year) {
            const parseYear = (y: string) => {
                // Remove spaces and handle fvt/f.kr
                const cleanY = y.toLowerCase().replace(/\s+/g, '');
                const isBCE = cleanY.includes('fvt') || cleanY.includes('f.kr');
                const match = cleanY.match(/(\d+)/);
                if (!match) return 0;

                let year = parseInt(match[1], 10);
                return isBCE ? -year : year;
            };

            const currentYear = parseYear(articleData.year);
            // Only generate timeline if we have a valid year (not 0, unless it's year 0 which is rare)
            if (currentYear !== 0) {
                // Find events within +/- 1000 years (increased range for ancient history)
                // For ancient history (e.g. 10000 BCE), a 100 year range is too small.
                // Let's make it dynamic: 10% of the year value or min 100 years.
                const range = Math.max(100, Math.abs(currentYear) * 0.2);

                const relatedEvents = timelineData
                    .filter(e => {
                        const eYear = parseYear(e.year);
                        return Math.abs(eYear - currentYear) < range && e.title !== articleData.title;
                    })
                    .map(e => ({
                        year: e.year,
                        title: e.title,
                        description: e.description
                    }))
                    .slice(0, 3); // Limit to 3 events

                if (relatedEvents.length > 0) {
                    articleData.timeline = relatedEvents;
                }
            }
        }

        return (
            <ErrorBoundary>
                <InteractiveArticle
                    event={articleData}
                    onClose={() => navigate(`/${subjectId}/${topicId}${subTopicId ? `/${subTopicId}` : ''}`)}
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
        <div className="lesson-page max-w-4xl mx-auto px-6 py-12">
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
                <ArticleContent content={lesson.content} />
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
            )}
        </div>
    );
};
