import { useMemo } from 'react';
import { useManifest } from './useManifest';
import { textLibraryData } from '../data/textLibraryData';
import { glossaryTerms } from '../data/glossary';

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

        // 2. Extract from Glossary (Global Terms)
        glossaryTerms.forEach((item, index) => {
            allConcepts.push({
                id: `glossary-${index}`,
                term: item.term,
                definition: item.definition,
                sourceType: 'library', // Treating glossary as library content for now
                subjectId: item.subjectId,
                topicId: item.topicId
            });
        });

        // 3. Extract from Text Library (if needed in future)
        textLibraryData.forEach(text => {
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
