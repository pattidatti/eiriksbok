import type { ManifestTopic } from '../types';

/**
 * Returns the link for a topic.
 * If the topic has exactly one lesson (including subtopics), it returns the link to that lesson.
 * Otherwise, it returns the link to the topic page.
 */
export const getTopicLink = (subjectId: string, topic: ManifestTopic): string => {
    let allLessons: { id: string; subTopicId?: string }[] = [];

    // Collect lessons from direct lessons
    if (topic.lessons) {
        topic.lessons.forEach(l => {
            allLessons.push({ id: l.id });
        });
    }

    // Collect lessons from subtopics
    if (topic.subTopics) {
        topic.subTopics.forEach(st => {
            if (st.lessons) {
                st.lessons.forEach(l => {
                    allLessons.push({ id: l.id, subTopicId: st.id });
                });
            }
        });
    }

    // Smart navigation logic
    if (allLessons.length === 1) {
        const lesson = allLessons[0];
        return `/${subjectId}/${topic.id}${lesson.subTopicId ? `/${lesson.subTopicId}` : ''}/${lesson.id}`;
    }

    // Default to topic page
    return `/${subjectId}/${topic.id}`;
};
