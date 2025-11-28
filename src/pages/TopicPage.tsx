import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import type { ManifestSubject, ManifestTopic, ManifestSubTopic } from '../types';
import { motion } from 'framer-motion';
import { LessonCard } from '../components/LessonCard';
import { TopicCard } from '../components/TopicCard';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { HistoryLongLines } from '../components/HistoryLongLines';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { timelineData } from '../data/timelineData';
import { InteractiveArticle } from '../components/InteractiveArticle';
import { LessonPage } from './LessonPage';

export const TopicPage: React.FC = () => {
    const { subjectId, topicId, subTopicId } = useParams<{ subjectId: string; topicId: string; subTopicId?: string }>();
    const navigate = useNavigate();
    const [subjectData, setSubjectData] = useState<ManifestSubject | null>(null);
    const [currentTopic, setCurrentTopic] = useState<ManifestTopic | null>(null);
    const [currentSubTopic, setCurrentSubTopic] = useState<ManifestSubTopic | null>(null);

    useEffect(() => {
        fetchManifest().then(manifest => {
            if (manifest && subjectId) {
                const subject = manifest.subjects.find(s => s.id === subjectId);
                setSubjectData(subject || null);

                if (subject && topicId) {
                    const topic = subject.topics.find(t => t.id === topicId);
                    setCurrentTopic(topic || null);

                    if (topic && subTopicId && topic.subTopics) {
                        const sub = topic.subTopics.find(st => st.id === subTopicId);
                        setCurrentSubTopic(sub || null);
                    }
                }
            }
        });
    }, [subjectId, topicId, subTopicId]);

    if (!subjectData || !currentTopic) return <div className="p-8 text-center text-text-muted">Laster emne...</div>;

    // Special handling for History Timeline
    if (subTopicId === 'lange-linjer') {
        return (
            <ErrorBoundary>
                <HistoryLongLines />
            </ErrorBoundary>
        );
    }

    // Check if subTopicId corresponds to a timeline event (direct lesson under topic)
    const timelineEvent = subTopicId ? timelineData.find(e =>
        e.title.toLowerCase().replace(/\s+/g, '-') === subTopicId.toLowerCase() ||
        e.title.toLowerCase() === subTopicId.toLowerCase() ||
        e.id.toString() === subTopicId
    ) : null;

    if (timelineEvent) {
        return (
            <ErrorBoundary>
                <InteractiveArticle
                    event={timelineEvent}
                    onClose={() => navigate(`/${subjectId}/${topicId}`)}
                />
            </ErrorBoundary>
        );
    }

    // Check if subTopicId is actually a lesson in the current topic (e.g. demo-artikkel)
    const lessonInTopic = currentTopic?.lessons?.find(l => l.id === subTopicId);
    if (lessonInTopic) {
        return (
            <ErrorBoundary>
                <LessonPage lessonIdOverride={subTopicId} />
            </ErrorBoundary>
        );
    }

    const activeItem = currentSubTopic || currentTopic;
    const lessons = activeItem.lessons || [];
    const subTopics = !currentSubTopic && currentTopic.subTopics ? currentTopic.subTopics : [];
    const title = activeItem.title;
    const description = (activeItem as any).description;
    const image = (activeItem as any).image;

    return (
        <div className="topic-page max-w-7xl mx-auto px-6 py-12">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-text-muted mb-8">
                <Link to={`/${subjectId}`} className="hover:text-neon-accent transition-colors flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {subjectData.title}
                </Link>
                <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
                {currentSubTopic && (
                    <>
                        <Link to={`/${subjectId}/${topicId}`} className="hover:text-neon-accent transition-colors">
                            {currentTopic.title}
                        </Link>
                        <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
                    </>
                )}
                <span className="font-medium text-text-main">{title}</span>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h1 className="text-4xl font-display font-bold text-text-main mb-4">
                    {title}
                </h1>
                {description && (
                    <p className="text-xl text-text-muted max-w-3xl leading-relaxed">
                        {description}
                    </p>
                )}
            </motion.div>

            {subTopics.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-display font-bold text-text-main mb-6">Emner</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subTopics.map((subTopic, index) => (
                            <motion.div
                                key={subTopic.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <TopicCard
                                    title={subTopic.title}
                                    description={subTopic.description}
                                    image={subTopic.image}
                                    path={`/${subjectId}/${topicId}/${subTopic.id}`}
                                    lessonCount={subTopic.lessons?.length || 0}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {lessons.length > 0 && (
                <div>
                    {subTopics.length > 0 && <h2 className="text-2xl font-display font-bold text-text-main mb-6">Leksjoner</h2>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lessons.map((lesson, index) => (
                            <motion.div
                                key={lesson.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <LessonCard
                                    lesson={lesson}
                                    path={`/${subjectId}/${topicId}${currentSubTopic ? `/${currentSubTopic.id}` : ''}/${lesson.id}`}
                                    topicTitle={title}
                                    topicImage={image}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {subTopics.length === 0 && lessons.length === 0 && (
                <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-text-muted italic">Ingen leksjoner funnet i dette emnet.</p>
                </div>
            )}
        </div>
    );
};
