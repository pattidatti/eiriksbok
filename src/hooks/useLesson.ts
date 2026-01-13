import { useQuery } from '@tanstack/react-query';
import { fetchLesson } from '../utils/contentLoader';
import type { Lesson } from '../types';

export const useLesson = (subjectId: string, topicId: string, lessonId: string, subTopicId?: string) => {
    return useQuery<Lesson | null>({
        queryKey: ['lesson', subjectId, topicId, subTopicId, lessonId],
        queryFn: () => fetchLesson(subjectId, topicId, lessonId, subTopicId),
        enabled: !!subjectId && !!topicId && !!lessonId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });
};
