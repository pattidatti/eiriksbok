import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useManifest } from '../hooks/useManifest';
import type { ManifestLesson } from '../types';
import { motion } from 'framer-motion';
import { Timeline } from '../components/Timeline';
import { TopicCard } from '../components/TopicCard';
import { LayoutGrid, List } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { getTopicLink } from '../utils/navigationUtils';
import { PageSkeleton } from '../components/Skeleton';

export const SubjectPage: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const { data: manifest, isLoading } = useManifest();
    const [viewMode, setViewMode] = useState<'hierarchical' | 'timeline'>('hierarchical');
    const navigate = useNavigate();

    const subjectData = manifest?.subjects.find((s: any) => s.id === subjectId);

    usePageTitle(subjectData?.title || 'Fag', !!subjectData);

    if (isLoading) return <PageSkeleton />;
    if (!subjectData) return <div className="p-8 text-center text-text-muted">Finner ikke faget...</div>;

    // Flatten lessons for timeline
    const allLessons: (ManifestLesson & { path: string; topicTitle: string; topicImage?: string })[] = [];
    subjectData.topics.forEach((topic: any) => {
        if (topic.subTopics) {
            topic.subTopics.forEach((subTopic: any) => {
                if (subTopic.lessons) {
                    subTopic.lessons.forEach((lesson: any) => {
                        allLessons.push({
                            ...lesson,
                            path: `/${subjectId}/${topic.id}/${subTopic.id}/${lesson.id}`,
                            topicTitle: subTopic.title,
                            topicImage: subTopic.image
                        });
                    });
                }
            });
        } else if (topic.lessons) {
            topic.lessons.forEach((lesson: any) => {
                allLessons.push({
                    ...lesson,
                    path: `/${subjectId}/${topic.id}/${lesson.id}`,
                    topicTitle: topic.title,
                    topicImage: topic.image
                });
            });
        }
    });

    // Sort lessons by date for timeline
    allLessons.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return (
        <div className="subject-page max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-5xl font-display font-bold text-text-main"
                >
                    {subjectData.title}
                </motion.h1>

                <div className="bg-white border border-slate-200 p-1 rounded-lg flex gap-1 shadow-sm self-start md:self-auto">
                    <button
                        onClick={() => setViewMode('hierarchical')}
                        className={`flex items-center px-4 py-2 rounded-md font-sans text-sm font-medium transition-all ${viewMode === 'hierarchical'
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Oversikt
                    </button>
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`flex items-center px-4 py-2 rounded-md font-sans text-sm font-medium transition-all ${viewMode === 'timeline'
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <List className="w-4 h-4 mr-2" />
                        Tidslinje
                    </button>
                </div>
            </div>

            {viewMode === 'timeline' ? (
                <Timeline lessons={allLessons} />
            ) : (
                <div className="space-y-12">
                    {/* Tools Section */}
                    {subjectData.tools && subjectData.tools.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subjectData.tools.map((tool: any) => (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => navigate(tool.link)}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                            {/* You might want to dynamically render icons here based on tool.icon */}
                                            <LayoutGrid size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                                {tool.title}
                                            </h3>
                                            <p className="text-sm text-slate-600">
                                                {tool.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Topics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subjectData.topics.map((topic: any, index: number) => {
                            // Calculate total lessons
                            let lessonCount = 0;
                            if (topic.subTopics) {
                                topic.subTopics.forEach((st: any) => lessonCount += st.lessons?.length || 0);
                            } else if (topic.lessons) {
                                lessonCount = topic.lessons.length;
                            }

                            return (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="h-full"
                                >

                                    <TopicCard
                                        title={topic.title}
                                        description={topic.description}
                                        image={topic.image}
                                        path={subjectId ? getTopicLink(subjectId, topic) : '#'}
                                        lessonCount={lessonCount}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {subjectData.topics.length === 0 && (
                <p className="text-text-muted text-center py-12">Ingen emner lagt til enda.</p>
            )}
        </div>
    );
};
