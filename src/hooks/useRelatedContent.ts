import { useManifest } from './useManifest';
import type { ManifestLesson } from '../types';

export interface RelatedLesson {
    id: string;
    title: string;
    url: string;
    image?: string;
    date?: string;
}

export const useRelatedContent = (subjectId: string, topicId: string, currentLessonId: string) => {
    const { data: manifest } = useManifest();

    if (!manifest) return [];

    const subject = manifest.subjects.find(s => s.id.toLowerCase() === subjectId.toLowerCase());
    if (!subject) return [];

    const topic = subject.topics.find(t => t.id.toLowerCase() === topicId.toLowerCase());
    if (!topic) return [];

    // Collect all lessons from the topic (including subtopics if necessary, but starting with direct lessons)
    let allLessons: ManifestLesson[] = [];

    // Add direct lessons
    if (topic.lessons) {
        allLessons = [...topic.lessons];
    }

    // Add lessons from subtopics
    if (topic.subTopics) {
        topic.subTopics.forEach(subTopic => {
            if (subTopic.lessons) {
                allLessons = [...allLessons, ...subTopic.lessons];
            }
        });
    }

    // Filter out current lesson and map to return type
    const relatedLessons: RelatedLesson[] = allLessons
        .filter(lesson => lesson.id !== currentLessonId)
        .map(lesson => {
            // Determine URL. If it's inside a subtopic, we need to find which one.
            let subTopicId = undefined;
            if (topic.subTopics) {
                const foundSubTopic = topic.subTopics.find(st => st.lessons.some(l => l.id === lesson.id));
                if (foundSubTopic) {
                    subTopicId = foundSubTopic.id;
                }
            }

            const url = `/${subjectId}/${topicId}${subTopicId ? `/${subTopicId}` : ''}/${lesson.id}`;

            return {
                id: lesson.id,
                title: lesson.title,
                url,
                image: lesson.image,
                date: lesson.date
            };
        });

    return relatedLessons;
};
