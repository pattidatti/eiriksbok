import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useManifest } from '../hooks/useManifest';
import type { ManifestLesson } from '../types';
import { motion } from 'framer-motion';
import { LessonCard } from '../components/LessonCard';
import { TopicCard } from '../components/TopicCard';
import { ChevronRight, Grid, List, ArrowDownAZ, Calendar, Clock, Map } from 'lucide-react';
import { HistoryLongLines } from '../components/HistoryLongLines';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { timelineData } from '../data/timelineData';
import { InteractiveArticle } from '../components/InteractiveArticle';
import { TopicInteractiveModel } from '../components/TopicInteractiveModel';
import { LessonPage } from './LessonPage';
import { useUserHistory } from '../hooks/useUserHistory';
import { usePageTitle } from '../hooks/usePageTitle';
import { PageSkeleton } from '../components/Skeleton';

type ViewMode = 'grid' | 'list';
type SortMode = 'alphabetical' | 'year' | 'newest';

export const TopicPage: React.FC = () => {
    const { subjectId, topicId, subTopicId } = useParams<{ subjectId: string; topicId: string; subTopicId?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: manifest, isLoading } = useManifest();
    const { addToHistory } = useUserHistory();

    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortMode, setSortMode] = useState<SortMode>('alphabetical');

    const subjectData = manifest?.subjects.find((s: any) => s.id === subjectId);
    const currentTopic = subjectData?.topics.find((t: any) => t.id === topicId);
    const currentSubTopic = currentTopic?.subTopics?.find((st: any) => st.id === subTopicId);

    usePageTitle(currentSubTopic?.title || currentTopic?.title || 'Emne', !!currentTopic);

    useEffect(() => {
        if (currentTopic && !subTopicId && subjectId) {
            addToHistory({
                id: currentTopic.id,
                title: currentTopic.title,
                subjectId: subjectId,
                type: 'topic'
            });
        }
    }, [currentTopic, subTopicId, subjectId]);

    if (isLoading) return <PageSkeleton />;
    if (!subjectData || !currentTopic) return <div className="p-8 text-center text-text-muted">Laster emne...</div>;

    if (subTopicId === 'lange-linjer') {
        return <ErrorBoundary><HistoryLongLines /></ErrorBoundary>;
    }

    const timelineEvent = subTopicId ? timelineData.find(e =>
        e.title.toLowerCase().replace(/\s+/g, '-') === subTopicId.toLowerCase() ||
        e.title.toLowerCase() === subTopicId.toLowerCase() ||
        e.id.toString() === subTopicId
    ) : null;

    if (timelineEvent) {
        // Construct fallback URL for ArticleContent
        const fallbackUrl = `http://localhost:5173/content/${subjectId}/${topicId}/${subTopicId}/artikkel.json`;
        return <ErrorBoundary><InteractiveArticle event={timelineEvent} onClose={() => navigate(`/${subjectId}/${topicId}`)} parentPath={`/${subjectId}/${topicId}`} fallbackUrl={fallbackUrl} /></ErrorBoundary>;
    }

    const lessonInTopic = currentTopic?.lessons?.find(l => l.id === subTopicId);
    if (lessonInTopic) {
        return <ErrorBoundary><LessonPage lessonIdOverride={subTopicId} /></ErrorBoundary>;
    }

    const activeItem = currentSubTopic || currentTopic;
    const rawLessons = activeItem.lessons || [];
    const subTopics = !currentSubTopic && currentTopic.subTopics ? currentTopic.subTopics : [];
    const title = activeItem.title;
    const description = (activeItem as any).description;
    const image = (activeItem as any).image;

    // Sorting Logic
    const sortLessons = (lessons: ManifestLesson[]) => {
        return [...lessons].sort((a: any, b: any) => {
            if (sortMode === 'alphabetical') return a.title.localeCompare(b.title);
            if (sortMode === 'year') {
                const dateA = a.date || '9999';
                const dateB = b.date || '9999';
                return dateA.localeCompare(dateB);
            }
            if (sortMode === 'newest') {
                // Assuming date field represents published/added date
                const dateA = a.date || '0000';
                const dateB = b.date || '0000';
                return dateB.localeCompare(dateA);
            }
            return 0;
        });
    };

    const sortedLessons = sortLessons(rawLessons);

    // Filter by tag if present in query params
    const queryParams = new URLSearchParams(location.search);
    const tagFilter = queryParams.get('tag');

    const filteredLessons = tagFilter
        ? sortedLessons.filter((l: any) => l.tags?.includes(tagFilter))
        : sortedLessons;

    return (
        <div className="topic-page max-w-7xl mx-auto px-6 py-12">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl font-display font-bold text-text-main mb-2">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-xl text-text-muted max-w-3xl leading-relaxed">
                            {description}
                        </p>
                    )}
                </motion.div>

                {/* Controls */}
                <div className="flex items-center gap-4 bg-surface-card p-2 rounded-lg border border-white/10">
                    <div className="flex gap-1 border-r border-white/10 pr-4">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-neon-accent/20 text-neon-accent' : 'text-text-muted hover:text-text-main'}`}
                            title="Grid View"
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-neon-accent/20 text-neon-accent' : 'text-text-muted hover:text-text-main'}`}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setSortMode('alphabetical')}
                            className={`p-2 rounded-md transition-colors ${sortMode === 'alphabetical' ? 'bg-neon-accent/20 text-neon-accent' : 'text-text-muted hover:text-text-main'}`}
                            title="Alfabetisk"
                        >
                            <ArrowDownAZ size={20} />
                        </button>
                        <button
                            onClick={() => setSortMode('year')}
                            className={`p-2 rounded-md transition-colors ${sortMode === 'year' ? 'bg-neon-accent/20 text-neon-accent' : 'text-text-muted hover:text-text-main'}`}
                            title="Kronologisk"
                        >
                            <Calendar size={20} />
                        </button>
                        <button
                            onClick={() => setSortMode('newest')}
                            className={`p-2 rounded-md transition-colors ${sortMode === 'newest' ? 'bg-neon-accent/20 text-neon-accent' : 'text-text-muted hover:text-text-main'}`}
                            title="Nyeste"
                        >
                            <Clock size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tools Section */}
            {activeItem.tools && activeItem.tools.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-display font-bold text-text-main mb-6">Verktøy & Ressurser</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeItem.tools.map((tool: any) => (
                            <Link
                                key={tool.id}
                                to={tool.link}
                                className="block bg-surface-card hover:bg-surface-card-hover border border-white/10 rounded-xl p-6 transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-neon-accent/10 rounded-lg text-neon-accent group-hover:bg-neon-accent/20 transition-colors">
                                        <Map className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-text-main group-hover:text-neon-accent transition-colors mb-2">
                                            {tool.title}
                                        </h3>
                                        {tool.description && (
                                            <p className="text-text-muted text-sm leading-relaxed">
                                                {tool.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Interactive Model Section */}
            {currentTopic && subjectId && (
                <TopicInteractiveModel topicId={currentTopic.id} subjectId={subjectId} />
            )}

            {subTopics.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-display font-bold text-text-main mb-6">Emner</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subTopics.map((subTopic: any, index: number) => (
                            <motion.div
                                key={subTopic.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="h-full"
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

            {tagFilter && (
                <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-indigo-900 font-medium mr-2">Viser resultater for emneknagg:</span>
                        <span className="px-3 py-1 bg-indigo-600 text-white text-sm font-bold rounded-lg">#{tagFilter}</span>
                    </div>
                    <button
                        onClick={() => navigate(location.pathname)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                    >
                        Fjern filter
                    </button>
                </div>
            )}

            {filteredLessons.length > 0 && (
                <div>
                    {subTopics.length > 0 && <h2 className="text-2xl font-display font-bold text-text-main mb-6">Leksjoner</h2>}
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {filteredLessons.map((lesson, index) => (
                            <motion.div
                                key={lesson.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="h-full"
                            >
                                {viewMode === 'grid' ? (
                                    <LessonCard
                                        lesson={lesson}
                                        path={`/${subjectId}/${topicId}${currentSubTopic ? `/${currentSubTopic.id}` : ''}/${lesson.id}`}
                                        topicTitle={title}
                                        topicImage={image}
                                    />
                                ) : (
                                    <Link
                                        to={`/${subjectId}/${topicId}${currentSubTopic ? `/${currentSubTopic.id}` : ''}/${lesson.id}`}
                                        className="block bg-surface-card hover:bg-surface-card-hover border border-white/10 rounded-lg p-4 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-text-main group-hover:text-neon-accent transition-colors mb-1">{lesson.title}</h3>
                                                {lesson.description && <p className="text-text-muted">{lesson.description}</p>}
                                                {lesson.tags && (
                                                    <div className="flex gap-2 mt-2">
                                                        {lesson.tags.map(tag => (
                                                            <span key={tag} className="text-xs px-2 py-1 bg-white/5 rounded-full text-text-muted">#{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <ChevronRight className="text-text-muted group-hover:text-neon-accent transition-colors" />
                                        </div>
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {subTopics.length === 0 && filteredLessons.length === 0 && (
                <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-text-muted italic">Ingen leksjoner funnet i dette emnet.</p>
                </div>
            )}
        </div>
    );
};
