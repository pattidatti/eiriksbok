import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import type { Manifest, ManifestTopic, ManifestLesson } from '../types';
import { motion } from 'framer-motion';
import { ImmersiveCard } from '../components/ImmersiveCard';
import { ContentRow } from '../components/ContentRow';
import { useUserHistory } from '../hooks/useUserHistory';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { usePageTitle } from '../hooks/usePageTitle';
import { Calendar, Clock } from 'lucide-react';
import { getTopicLink } from '../utils/navigationUtils';

export const LandingPage: React.FC = () => {
    const [manifest, setManifest] = useState<Manifest | null>(null);
    const { history } = useUserHistory();
    usePageTitle('Eiriks lærebok', true);

    useEffect(() => {
        fetchManifest().then(setManifest);
    }, []);

    if (!manifest) return <div className="p-8 text-center text-text-muted">Laster fag...</div>;

    // Helper to sort content: Topics first, then lessons (history + new)
    const getSortedContent = (subjectId: string, topics: ManifestTopic[]) => {
        const subjectHistory = history.filter(h => h.subjectId === subjectId);
        const historyIds = new Set(subjectHistory.map(h => h.id));

        // 1. Topics
        const historyTopics: ManifestTopic[] = [];
        const otherTopics: ManifestTopic[] = [];

        topics.forEach(topic => {
            if (historyIds.has(topic.id)) {
                historyTopics.push(topic);
            } else {
                otherTopics.push(topic);
            }
        });

        historyTopics.sort((a, b) => {
            const indexA = subjectHistory.findIndex(h => h.id === a.id);
            const indexB = subjectHistory.findIndex(h => h.id === b.id);
            return indexA - indexB;
        });

        const sortedTopics = [...historyTopics, ...otherTopics];

        // 2. Lessons
        let allLessons: (ManifestLesson & { topicId: string, subTopicId?: string, topicTitle: string, topicImage?: string })[] = [];
        topics.forEach(topic => {
            // Collect lessons from direct lessons
            if (topic.lessons) {
                topic.lessons.forEach(l => {
                    if (l && l.id) {
                        allLessons.push({ ...l, topicId: topic.id, topicTitle: topic.title, topicImage: topic.image });
                    }
                });
            }
            // Collect lessons from subtopics
            if (topic.subTopics) {
                topic.subTopics.forEach(st => {
                    if (st.lessons) {
                        st.lessons.forEach(l => {
                            if (l && l.id) {
                                allLessons.push({ ...l, topicId: topic.id, subTopicId: st.id, topicTitle: topic.title, topicImage: st.image || topic.image });
                            }
                        });
                    }
                });
            }
        });

        // Filter recently read lessons
        const historyLessons = allLessons.filter(l => historyIds.has(l.id));
        historyLessons.sort((a, b) => {
            const indexA = subjectHistory.findIndex(h => h.id === a.id);
            const indexB = subjectHistory.findIndex(h => h.id === b.id);
            return indexA - indexB;
        });

        // Filter recently created/updated lessons (exclude already in history)
        const otherLessons = allLessons.filter(l => !historyIds.has(l.id));

        // Sort by createdDate (newest first)
        otherLessons.sort((a, b) => {
            const dateA = a.createdDate || a.date || '0000';
            const dateB = b.createdDate || b.date || '0000';
            return dateB.localeCompare(dateA);
        });

        // Take top 5 new lessons
        const recentNewLessons = otherLessons.slice(0, 5);

        return {
            topics: sortedTopics,
            lessons: [...historyLessons, ...recentNewLessons]
        };
    };

    return (
        <div className="pb-20">
            <motion.div
                className="mb-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-text-main mb-6 tracking-tight">
                        Velkommen til <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Eiriks lærebok</span>
                    </h1>
                    <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
                        Utforsk interaktive artikler og lær noe nytt i dag.
                        <br />
                        Velg et fag, emne, eller søk oppe til høyre.
                    </p>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-30 -z-10 pointer-events-none" />
            </motion.div>

            <div className="space-y-16">
                {manifest.subjects.map((subject) => {
                    const { topics, lessons } = getSortedContent(subject.id, subject.topics);
                    if (topics.length === 0 && lessons.length === 0) return null;

                    return (
                        <ContentRow key={subject.id} title={subject.title} titleLink={`/${subject.id}`}>
                            {/* Topics */}
                            {topics.map((topic, index) => (
                                <motion.div
                                    key={`topic-${topic.id}`}
                                    className="min-w-[240px] md:min-w-[280px] snap-start"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >

                                    <Link to={getTopicLink(subject.id, topic)} className="block no-underline group h-full">
                                        <ImmersiveCard>
                                            <div className="h-48 overflow-hidden rounded-lg mb-4 relative">
                                                <ImageWithFallback
                                                    src={topic.image}
                                                    alt={topic.title}
                                                    seed={topic.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full border border-white/10">
                                                    Emne
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-display font-bold text-text-main mt-0 mb-2 group-hover:text-neon-accent transition-colors">
                                                {topic.title}
                                            </h3>
                                            <p className="text-base text-text-muted m-0">
                                                {topic.lessons?.length || 0} artikler
                                            </p>
                                        </ImmersiveCard>
                                    </Link>
                                </motion.div>
                            ))}

                            {/* Lessons */}
                            {lessons.map((lesson, index) => (
                                <motion.div
                                    key={`lesson-${lesson.id}`}
                                    className="min-w-[240px] md:min-w-[280px] snap-start"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (topics.length + index) * 0.05 }}
                                >
                                    <Link to={`/${subject.id}/${lesson.topicId}${lesson.subTopicId ? `/${lesson.subTopicId}` : ''}/${lesson.id}`} className="block no-underline group h-full">
                                        <ImmersiveCard>
                                            <div className="h-48 overflow-hidden rounded-lg mb-4 relative">
                                                <ImageWithFallback
                                                    src={lesson.image || lesson.topicImage}
                                                    alt={lesson.title}
                                                    seed={lesson.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute top-2 right-2 bg-indigo-600/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full border border-white/10">
                                                    Artikkel
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-display font-bold text-text-main mt-0 mb-2 group-hover:text-neon-accent transition-colors line-clamp-2">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-sm text-text-muted mb-3 line-clamp-2">
                                                {lesson.description}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-text-muted mt-auto pt-3 border-t border-white/5">
                                                {(lesson.createdDate || lesson.date) && (
                                                    <div className="flex items-center gap-1" title="Opprettet">
                                                        <Calendar size={12} />
                                                        <span>{lesson.createdDate || lesson.date}</span>
                                                    </div>
                                                )}
                                                {lesson.updatedDate && (
                                                    <div className="flex items-center gap-1" title="Sist oppdatert">
                                                        <Clock size={12} />
                                                        <span>{lesson.updatedDate}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </ImmersiveCard>
                                    </Link>
                                </motion.div>
                            ))}
                        </ContentRow>
                    );
                })}
            </div>
        </div>
    );
};
