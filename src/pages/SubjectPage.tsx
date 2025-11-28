import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import type { ManifestSubject, ManifestLesson } from '../types';
import { motion } from 'framer-motion';
import { Timeline } from '../components/Timeline';
import { TopicCard } from '../components/TopicCard';
import { LayoutGrid, List } from 'lucide-react';

export const SubjectPage: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const [subjectData, setSubjectData] = useState<ManifestSubject | null>(null);
    const [viewMode, setViewMode] = useState<'hierarchical' | 'timeline'>('hierarchical');

    useEffect(() => {
        fetchManifest().then(manifest => {
            if (manifest && subjectId) {
                const subject = manifest.subjects.find(s => s.id === subjectId);
                setSubjectData(subject || null);
            }
        });
    }, [subjectId]);

    if (!subjectData) return <div className="p-8 text-center text-text-muted">Finner ikke faget...</div>;

    // Flatten lessons for timeline
    const allLessons: (ManifestLesson & { path: string; topicTitle: string; topicImage?: string })[] = [];
    subjectData.topics.forEach(topic => {
        if (topic.subTopics) {
            topic.subTopics.forEach(subTopic => {
                if (subTopic.lessons) {
                    subTopic.lessons.forEach(lesson => {
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
            topic.lessons.forEach(lesson => {
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subjectData.topics.map((topic, index) => {
                        // Calculate total lessons
                        let lessonCount = 0;
                        if (topic.subTopics) {
                            topic.subTopics.forEach(st => lessonCount += st.lessons?.length || 0);
                        } else if (topic.lessons) {
                            lessonCount = topic.lessons.length;
                        }

                        return (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <TopicCard
                                    title={topic.title}
                                    description={topic.description}
                                    image={topic.image}
                                    path={`/${subjectId}/${topic.id}`}
                                    lessonCount={lessonCount}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {subjectData.topics.length === 0 && (
                <p className="text-text-muted text-center py-12">Ingen emner lagt til enda.</p>
            )}
        </div>
    );
};
