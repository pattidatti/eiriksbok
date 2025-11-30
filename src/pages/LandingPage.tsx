import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import type { Manifest, ManifestLesson } from '../types';
import { motion } from 'framer-motion';
import { ImageWithFallback } from '../components/ImageWithFallback';
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
                                <Link
                                    key={`history-${lesson.id}`}
                                    to={`/${lesson.subjectId}/${lesson.topicId}${lesson.subTopicId ? `/${lesson.subTopicId}` : ''}/${lesson.id}`}
                                    className="group block"
                                >
                                    <div className="bg-surface-card rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors h-full flex flex-col">
                                        <div className="h-32 relative overflow-hidden">
                                            <ImageWithFallback
                                                src={lesson.image}
                                                alt={lesson.title}
                                                seed={lesson.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full border border-white/10">
                                                Fortsett
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col flex-grow">
                                            <div className="text-[10px] font-medium text-blue-400 mb-1 uppercase tracking-wide">
                                                {lesson.topicTitle}
                                            </div>
                                            <h4 className="text-base font-bold text-text-main mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
                                                {lesson.title}
                                            </h4>
                                            <p className="text-xs text-text-muted line-clamp-2 mb-0 flex-grow">
                                                {lesson.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
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
                            <Link
                                key={lesson.id}
                                to={`/${lesson.subjectId}/${lesson.topicId}${lesson.subTopicId ? `/${lesson.subTopicId}` : ''}/${lesson.id}`}
                                className="group block"
                            >
                                <div className="bg-surface-card rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors h-full flex flex-col">
                                    <div className="h-32 relative overflow-hidden">
                                        <ImageWithFallback
                                            src={lesson.image}
                                            alt={lesson.title}
                                            seed={lesson.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className="text-[10px] font-medium text-blue-400 mb-1 uppercase tracking-wide">
                                            {lesson.topicTitle}
                                        </div>
                                        <h4 className="text-base font-bold text-text-main mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
                                            {lesson.title}
                                        </h4>
                                        <p className="text-xs text-text-muted line-clamp-2 mb-2 flex-grow">
                                            {lesson.description}
                                        </p>
                                        <div className="text-[10px] text-text-muted pt-2 border-t border-white/5 flex items-center gap-2">
                                            <span>11 hours ago</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
