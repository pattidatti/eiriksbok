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
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!manifest) return;

        // Defer calculation to avoid blocking main thread on initial render
        const timer = setTimeout(() => {
            let lessons: ProcessedLesson[] = [];

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
                    image: undefined, // Will use fallback
                    tags: [text.genre, text.language]
                });
            });

            // Calculate Recent Lessons
            const recent = [...lessons].sort((a, b) => {
                const dateA = a.createdDate || a.date || '0000';
                const dateB = b.createdDate || b.date || '0000';
                return dateB.localeCompare(dateA);
            }).slice(0, 3);

            startTransition(() => {
                setRecentLessons(recent);
            });

            // Calculate History Lessons (slightly delayed to prioritize recent)
            setTimeout(() => {
                const hist = history
                    .map(h => lessons.find(l => l.id === h.id))
                    .filter((l): l is ProcessedLesson => !!l)
                    .slice(0, 3);

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
        isLoading: isManifestLoading || isPending
    };
};
