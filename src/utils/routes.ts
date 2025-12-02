/**
 * Centralized routing logic for the application.
 * Use these helpers instead of manual string concatenation.
 */

export const getSubjectUrl = (subjectId: string) => `/${subjectId}`;

export const getTopicUrl = (subjectId: string, topicId: string) => `/${subjectId}/${topicId}`;

export const getSubTopicUrl = (subjectId: string, topicId: string, subTopicId: string) => `/${subjectId}/${topicId}/${subTopicId}`;

export const getLessonUrl = (subjectId: string, topicId: string, lessonId: string, subTopicId?: string) => {
    if (subTopicId) {
        return `/${subjectId}/${topicId}/${subTopicId}/${lessonId}`;
    }
    return `/${subjectId}/${topicId}/${lessonId}`;
};

export const ROUTES = {
    HOME: '/',
    SEARCH: '/sok',
    LIBRARY: '/bibliotek',
};
