import { useState, useEffect, useTransition } from 'react';
import { useManifest } from './useManifest';
import { useUserHistory } from './useUserHistory';
import { textLibraryData } from '../data/textLibraryData';
import type { ManifestLesson } from '../types';

export interface ProcessedLesson extends ManifestLesson {
    subjectId: string;
    topicId: string;
    subTopicId?: string;
    topicTitle: string;
}

export const useManifestData = () => {
    const { data: manifest, isLoading: isManifestLoading } = useManifest();
    const { history } = useUserHistory();

    const [recentLessons, setRecentLessons] = useState<ProcessedLesson[]>([]);
    const [historyLessons, setHistoryLessons] = useState<ProcessedLesson[]>([]);
    const [, startTransition] = useTransition();

    useEffect(() => {
        if (!manifest) return;

        // Defer calculation to avoid blocking main thread on initial render
        const timer = setTimeout(() => {
            const lessons: ProcessedLesson[] = [];

            // Flatten manifest structure
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

                    const processTools = (toolList: any[], subTopicId?: string) => {
                        toolList.forEach(t => {
                            // Filter for learning paths
                            // We treat tools that are learning paths as "lessons" for history/listing purposes
                            if (t.id.includes('sti') || t.title.toLowerCase().includes('læringssti')) {
                                lessons.push({
                                    id: t.id,
                                    title: t.title,
                                    description: t.description || 'Læringssti',
                                    subjectId: subject.id,
                                    topicId: topic.id,
                                    subTopicId,
                                    topicTitle: topic.title,
                                    layout: 'learning-path',
                                    tags: ['Læringssti'],
                                    // Use topic image as fallback if tool doesn't have specific image
                                    image: t.image || t.icon || topic.image,
                                    createdDate: t.createdDate,
                                    lastUpdated: t.lastUpdated
                                });
                            }
                        });
                    };

                    if (topic.lessons) processLessons(topic.lessons);
                    if (topic.tools) processTools(topic.tools);

                    if (topic.subTopics) {
                        topic.subTopics.forEach((st: any) => {
                            if (st.lessons) processLessons(st.lessons, st.id);
                            if (st.tools) processTools(st.tools, st.id);
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
                    lastUpdated: text.lastUpdated,
                    image: undefined, // Will use fallback
                    tags: [text.genre, text.language].filter((t): t is string => !!t)
                });
            });

            // Calculate Recent Lessons — sort by createdDate only so trivial
            // changes (image format, config edits) don't resurface old articles
            const recent = [...lessons].sort((a, b) => {
                const dateA = a.createdDate || a.date;
                const dateB = b.createdDate || b.date;
                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            }).slice(0, 4);

            startTransition(() => {
                setRecentLessons(recent);
            });

            // Calculate History Lessons (slightly delayed to prioritize recent)
            setTimeout(() => {
                const hist = history
                    .map(h => lessons.find(l => l.id === h.id))
                    .filter((l): l is ProcessedLesson => !!l)
                    .slice(0, 4);

                startTransition(() => {
                    setHistoryLessons(hist);
                });
            }, 50);

        }, 50);

        return () => clearTimeout(timer);
    }, [manifest, history]);

    return {
        manifest,
        recentLessons,
        historyLessons,
        isLoading: isManifestLoading
    };
};
