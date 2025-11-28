import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchLesson, fetchManifest } from '../utils/contentLoader';
import type { Lesson, ManifestLesson } from '../types';
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
import { timelineData } from '../data/timelineData';
import { useNavigate } from 'react-router-dom';

export const LessonPage: React.FC<{ lessonIdOverride?: string }> = ({ lessonIdOverride }) => {
    const params = useParams<{ subjectId: string; topicId: string; subTopicId?: string; lessonId: string }>();
    const subjectId = params.subjectId || '';
    const topicId = params.topicId || '';

    // If override is provided, it means we are being rendered from TopicPage where subTopicId param is actually the lessonId
    const lessonId = lessonIdOverride || params.lessonId || '';
    const subTopicId = lessonIdOverride ? undefined : params.subTopicId;

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [lessonImage, setLessonImage] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (subjectId && topicId && lessonId) {
            setLoading(true);

            // Load lesson content
            fetchLesson(subjectId, topicId, lessonId, subTopicId).then(data => {
                setLesson(data);
                setLoading(false);
            }).catch(err => {
                console.error('Error fetching lesson:', err);
                setLoading(false);
            });

            // Load manifest to get image
            fetchManifest().then(manifest => {
                if (manifest) {
                    const subject = manifest.subjects.find(s => s.id === subjectId);
                    const topic = subject?.topics.find(t => t.id === topicId);
                    let foundLesson: ManifestLesson | undefined;
                    let topicImg = topic?.image;

                    if (subTopicId && topic?.subTopics) {
                        const subTopic = topic.subTopics.find(st => st.id === subTopicId);
                        foundLesson = subTopic?.lessons.find(l => l.id === lessonId);
                        topicImg = subTopic?.image || topicImg;
                    } else if (topic?.lessons) {
                        foundLesson = topic.lessons.find(l => l.id === lessonId);
                    }

                    if (foundLesson?.image) {
                        setLessonImage(foundLesson.image);
                    } else if (topicImg) {
                        setLessonImage(topicImg);
                    }
                }
            });
        }
    }, [subjectId, topicId, subTopicId, lessonId]);

    if (loading) return <div className="p-8 text-center">Laster leksjon...</div>;

    // Special handling for Demography module
    if (subTopicId === 'demografi-okonomi') {
        return <DemographyPage />;
    }

    if (subTopicId === 'styringsformer') {
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

    // Check for rich layout in standard lesson
    if (lesson && lesson.layout === 'rich') {
        const articleData = {
            id: lesson.id,
            year: lesson.year || '',
            title: lesson.title,
            description: lesson.content?.find(c => c.type === 'text')?.content.substring(0, 150) + '...' || '',
            content: lesson.content || [],
            details: lesson.details || [],
            category: lesson.category || lesson.topic,
            readTime: lesson.readTime || '5 min lesning',
            heroImage: lesson.heroImage,
            url: lesson.externalUrl,
            timeline: lesson.timeline || []
        };

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

                {lessonImage && (
                    <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-lg mb-12 border border-slate-200">
                        <img
                            src={lessonImage}
                            alt={lesson.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
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
                            {lesson.concepts?.map(concept => (
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
