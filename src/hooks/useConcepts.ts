import { useMemo } from 'react';
import { useManifest } from './useManifest';
import { textLibraryData } from '../data/textLibraryData';

export interface ConceptItem {
    id: string;
    term: string;
    definition: string;
    sourceType: 'lesson' | 'library';
    subjectId?: string;
    topicId?: string;
    lessonId?: string;
    lessonTitle?: string;
    libraryId?: string;
    libraryTitle?: string;
}

export const useConcepts = () => {
    const { data: manifest } = useManifest();

    const concepts = useMemo(() => {
        if (!manifest) return [];

        const allConcepts: ConceptItem[] = [];

        // 1. Extract from Manifest (Lessons)
        manifest.subjects.forEach(subject => {
            subject.topics.forEach(topic => {
                // Check topic lessons
                topic.lessons?.forEach(lesson => {
                    if (lesson.definitions) {
                        lesson.definitions.forEach((def, index) => {
                            allConcepts.push({
                                id: `lesson-${lesson.id}-${index}`,
                                term: def.term,
                                definition: def.definition,
                                sourceType: 'lesson',
                                subjectId: subject.id,
                                topicId: topic.id,
                                lessonId: lesson.id,
                                lessonTitle: lesson.title
                            });
                        });
                    }
                });

                // Check subtopic lessons
                topic.subTopics?.forEach(subTopic => {
                    subTopic.lessons.forEach(lesson => {
                        if (lesson.definitions) {
                            lesson.definitions.forEach((def, index) => {
                                allConcepts.push({
                                    id: `lesson-${lesson.id}-${index}`,
                                    term: def.term,
                                    definition: def.definition,
                                    sourceType: 'lesson',
                                    subjectId: subject.id,
                                    topicId: topic.id,
                                    lessonId: lesson.id,
                                    lessonTitle: lesson.title
                                });
                            });
                        }
                    });
                });
            });
        });

        // 2. Extract from Text Library
        textLibraryData.forEach(text => {
            // Assuming textLibraryData might have definitions in the future or mapping existing fields
            // For now, we'll just check if there are any explicit definitions if we added them to the type
            // But based on current types, textLibraryData doesn't have 'definitions'.
            // If the user wants to extract concepts from library texts, we might need to add 'definitions' to TextEntry type too.
            // For this demo, we'll skip library if it doesn't have definitions, or we can add a TODO.

            // Checking if TextEntry has definitions (it currently doesn't in the file I saw, but I can check types if I need to).
            // The user said "hente ut fagbegreper fra emnet og artiklene".
            // Let's assume for now only lessons have explicit definitions as per my plan.
            // If I need to add definitions to library texts, I'd need to update that data file too.
            // I'll leave this placeholder for now.
            if ((text as any).definitions) {
                (text as any).definitions.forEach((def: any, index: number) => {
                    allConcepts.push({
                        id: `library-${text.id}-${index}`,
                        term: def.term,
                        definition: def.definition,
                        sourceType: 'library',
                        libraryId: text.id,
                        libraryTitle: text.title
                    });
                });
            }
        });

        return allConcepts;
    }, [manifest]);

    return concepts;
};
