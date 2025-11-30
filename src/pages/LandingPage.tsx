import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import type { Manifest, ManifestLesson } from '../types';
import { motion } from 'framer-motion';
import { LessonCard } from '../components/LessonCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { useUserHistory } from '../hooks/useUserHistory';

import { textLibraryData } from '../data/textLibraryData';

export const LandingPage: React.FC = () => {
    const [manifest, setManifest] = useState<Manifest | null>(null);
    const { history } = useUserHistory();
    usePageTitle('Eiriks lærebok', true);

    useEffect(() => {
        fetchManifest().then(setManifest);
    }, []);

    if (!manifest) return <div className="p-8 text-center text-text-muted">Laster fag...</div>;

    // Get all lessons flattened with metadata
    const getAllLessons = () => {
        let allLessons: (ManifestLesson & { topicId: string, subTopicId?: string, subjectId: string, topicTitle: string })[] = [];
        manifest.subjects.forEach(subject => {
            subject.topics.forEach(topic => {
                const processLessons = (lessons: ManifestLesson[], subTopicId?: string) => {
                    lessons.forEach(l => {
                        if (l.id) {
                            allLessons.push({
                                ...l,
                                subjectId: subject.id,
                                topicId: topic.id,
                                subTopicId,
                                topicTitle: topic.title
                            });
                        }
                    });
                };

                if (topic.lessons) processLessons(topic.lessons);
                if (topic.subTopics) {
                    topic.subTopics.forEach(st => {
                        if (st.lessons) processLessons(st.lessons, st.id);
                    });
                }
            });
        });

        // Add library texts
        textLibraryData.forEach(text => {
            allLessons.push({
                id: text.id,
                title: text.title,
                description: `Av ${text.author}. ${text.genre}.`,
                subjectId: 'norsk',
                topicId: 'bibliotek',
                topicTitle: 'Bibliotek',
                createdDate: text.createdDate,
                image: undefined // Will use fallback
            });
        });

        return allLessons;
    };

    const allLessons = getAllLessons();

    // Get recent lessons (newest first)
    const recentLessons = [...allLessons].sort((a, b) => {
        const dateA = a.createdDate || a.date || '0000';
        const dateB = b.createdDate || b.date || '0000';
        return dateB.localeCompare(dateA);
    }).slice(0, 3);

    // Get history lessons
    const historyLessons = history
        .map(h => allLessons.find(l => l.id === h.id))
        .filter((l): l is NonNullable<typeof l> => !!l)
        .slice(0, 3);

    return (
        <div className="min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col gap-1">
                        {manifest.subjects.map((subject, index) => (
                            <motion.div
                                key={subject.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/${subject.id}`}
                                    className="group block"
                                >
                                    <h2 className="text-6xl md:text-8xl font-display font-bold text-text-main hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform origin-left hover:scale-105">
                                        {subject.title}
                                    </h2>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Recently Viewed Section */}
                {historyLessons.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-12"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-display font-bold text-text-main">
                                Nylig lest
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {historyLessons.map((lesson) => (
                                <div key={`history-${lesson.id}`} className="h-full">
                                    <LessonCard
                                        lesson={lesson}
                                        path={`/${lesson.subjectId}/${lesson.topicId}${lesson.subTopicId ? `/${lesson.subTopicId}` : ''}/${lesson.id}`}
                                        topicTitle={lesson.topicTitle}
                                        badgeText="Fortsett"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-display font-bold text-text-main">
                            Nytt innhold
                        </h3>
                        <Link to="/sok" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors">
                            Se alle
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recentLessons.map((lesson) => (
                            <div key={lesson.id} className="h-full">
                                <LessonCard
                                    lesson={lesson}
                                    path={`/${lesson.subjectId}/${lesson.topicId}${lesson.subTopicId ? `/${lesson.subTopicId}` : ''}/${lesson.id}`}
                                    topicTitle={lesson.topicTitle}
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
