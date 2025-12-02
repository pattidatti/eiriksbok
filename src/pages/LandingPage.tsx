import React from 'react';
import { Link } from 'react-router-dom';
import { PrefetchLink } from '../components/PrefetchLink';
import { useManifest } from '../hooks/useManifest';
import type { ManifestLesson } from '../types';
import { motion } from 'framer-motion';
import { LessonCard } from '../components/LessonCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { useUserHistory } from '../hooks/useUserHistory';

import { textLibraryData } from '../data/textLibraryData';
import { PageSkeleton } from '../components/Skeleton';

export const LandingPage: React.FC = () => {
    const { data: manifest, isLoading } = useManifest();
    const { history } = useUserHistory();
    usePageTitle('Eiriks lærebok', true);

    const [recentLessons, setRecentLessons] = React.useState<any[]>([]);
    const [historyLessons, setHistoryLessons] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (!manifest) return;

        // Defer calculation to next tick to allow initial render
        const timer = setTimeout(() => {
            let lessons: (ManifestLesson & { topicId: string, subTopicId?: string, subjectId: string, topicTitle: string })[] = [];
            manifest.subjects?.forEach((subject: any) => {
                subject.topics?.forEach((topic: any) => {
                    const processLessons = (lessonList: ManifestLesson[], subTopicId?: string) => {
                        lessonList.forEach(l => {
                            if (l.id) {
                                lessons.push({
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
                        topic.subTopics.forEach((st: any) => {
                            if (st.lessons) processLessons(st.lessons, st.id);
                        });
                    }
                });
            });

            // Add library texts
            textLibraryData.forEach(text => {
                lessons.push({
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

            // Calculate derived state
            const recent = [...lessons].sort((a, b) => {
                const dateA = a.createdDate || a.date || '0000';
                const dateB = b.createdDate || b.date || '0000';
                return dateB.localeCompare(dateA);
            }).slice(0, 3);

            // Stage 1: Render Recent Lessons (non-urgent)
            React.startTransition(() => {
                setRecentLessons(recent);
            });

            // Stage 2: Render History Lessons (after a short delay)
            setTimeout(() => {
                const hist = history
                    .map(h => lessons.find(l => l.id === h.id))
                    .filter((l): l is NonNullable<typeof l> => !!l)
                    .slice(0, 3);

                React.startTransition(() => {
                    setHistoryLessons(hist);
                });
            }, 100);

        }, 50);

        return () => clearTimeout(timer);
    }, [manifest, history]);

    if (isLoading || !manifest) return <PageSkeleton />;

    return (
        <div className="min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col gap-1">
                        {manifest.subjects.map((subject: any) => (
                            <motion.div
                                key={subject.id}
                                className="mb-8"
                            >
                                <PrefetchLink
                                    to={`/${subject.id}`}
                                    prefetchTarget="SubjectPage"
                                    className="group block"
                                >
                                    <h2 className="text-6xl md:text-8xl font-display font-bold text-text-main hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform origin-left hover:scale-105">
                                        {subject.title}
                                    </h2>
                                </PrefetchLink>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Recently Viewed Section */}
                {historyLessons.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-12"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-display font-bold text-text-main">
                                Nylig lest
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {historyLessons.map((lesson, index) => (
                                <motion.div
                                    key={`history-${lesson.id}`}
                                    className="h-full"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <LessonCard
                                        lesson={lesson}
                                        path={`/${lesson.subjectId}/${lesson.topicId}${lesson.subTopicId ? `/${lesson.subTopicId}` : ''}/${lesson.id}`}
                                        topicTitle={lesson.topicTitle}
                                        badgeText="Fortsett"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {recentLessons.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
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
                            {recentLessons.map((lesson, index) => (
                                <motion.div
                                    key={lesson.id}
                                    className="h-full"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <LessonCard
                                        lesson={lesson}
                                        path={`/${lesson.subjectId}/${lesson.topicId}${lesson.subTopicId ? `/${lesson.subTopicId}` : ''}/${lesson.id}`}
                                        topicTitle={lesson.topicTitle}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
