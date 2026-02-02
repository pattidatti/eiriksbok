import { useManifest } from './useManifest';
import type { ManifestLesson } from '../types';
import { useMemo } from 'react';

export interface RelatedLesson {
    id: string;
    title: string;
    url: string;
    image?: string;
    date?: string;
    score: number; // For debugging/ordering
    debugInfo?: string;
}

export const useRelatedContent = (
    subjectId: string,
    topicId: string,
    currentLessonId: string,
    tags: string[] = [] // New optional parameter
) => {
    const { data: manifest } = useManifest();

    return useMemo(() => {
        if (!manifest) return [];

        const subject = manifest.subjects.find(s => s.id.toLowerCase() === subjectId.toLowerCase());
        if (!subject) return [];

        // 1. Gather ALL lessons in this subject
        // We'll store them with context info: which topic/subtopic they came from
        type Candidate = {
            lesson: ManifestLesson;
            topicId: string;
            subTopicId?: string;
            isSameTopic: boolean;
            isSameSubTopic: boolean;
        };

        const candidates: Candidate[] = [];

        // Find current lesson's subtopic to identify "Same Subtopic"
        let currentSubTopicId: string | undefined;
        // Helper to find subtopic of current lesson
        if (topicId) {
            const currentTopic = subject.topics.find(t => t.id.toLowerCase() === topicId.toLowerCase());
            if (currentTopic && currentTopic.subTopics) {
                const found = currentTopic.subTopics.find(st => st.lessons.some(l => l.id === currentLessonId));
                if (found) currentSubTopicId = found.id;
            }
        }

        subject.topics.forEach(topic => {
            const isSameTopic = topic.id.toLowerCase() === topicId.toLowerCase();

            // Direct lessons
            if (topic.lessons) {
                topic.lessons.forEach(lesson => {
                    candidates.push({
                        lesson,
                        topicId: topic.id,
                        isSameTopic,
                        isSameSubTopic: false // Direct lessons don't belong to a subtopic
                    });
                });
            }

            // Subtopic lessons
            if (topic.subTopics) {
                topic.subTopics.forEach(subTopic => {
                    const isSameSubTopic = isSameTopic && (subTopic.id === currentSubTopicId);

                    if (subTopic.lessons) {
                        subTopic.lessons.forEach(lesson => {
                            candidates.push({
                                lesson,
                                topicId: topic.id,
                                subTopicId: subTopic.id,
                                isSameTopic,
                                isSameSubTopic
                            });
                        });
                    }
                });
            }
        });

        // 2. Score Candidates
        const scoredCandidates = candidates
            .filter(c => c.lesson.id !== currentLessonId) // Remove self
            .map(candidate => {
                let score = 0;
                const debugReasons: string[] = [];

                // Criterion A: Shared Tags (The most important factor)
                let sharedTagCount = 0;
                let hasImportantTagMatch = false;

                if (tags && tags.length > 0 && candidate.lesson.tags) {
                    // Filter out generic tags that "pollute" the matching
                    const ignoredTags = ['norsk', 'skrivehjelp', 'analyse', 'tekstsjangre', 'grammatikk'];

                    const intersection = candidate.lesson.tags.filter(t => {
                        // We match on ALL tags, but we only count non-ignored ones as "Important" matches
                        return tags.includes(t);
                    });

                    intersection.forEach(tag => {
                        const isIgnored = ignoredTags.includes(tag.toLowerCase());
                        if (!isIgnored) hasImportantTagMatch = true;

                        // Base score for any tag match
                        sharedTagCount++;
                    });

                    if (sharedTagCount > 0) {
                        const tagScore = sharedTagCount * 10;
                        score += tagScore;
                        debugReasons.push(`Tags: ${intersection.join(', ')} (+${tagScore})`);
                    }
                }

                // Criterion B: Cross-Topic Bonus (Breaking the Silo)
                // If we match on a tag AND it's a different topic, huge boost.
                // But only if it's an "Important" tag (e.g. "novelle", not "analyse")
                if (!candidate.isSameTopic && hasImportantTagMatch) {
                    score += 50;
                    debugReasons.push('Cross-Topic Bonus (+50)');
                }

                // Criterion C: Context (Minor adjustments)
                // We reduce these significantly to let cross-topic stuff win
                if (candidate.isSameSubTopic) {
                    score += 5; // Was 20
                    debugReasons.push('Same Subtopic (+5)');
                } else if (candidate.isSameTopic) {
                    score += 2; // Was 10
                    debugReasons.push('Same Topic (+2)');
                }

                // Criterion D: Detailed Title Match (+15)
                // If the candidate title contains one of our IMPORTANT tags
                // e.g. "Hvordan skrive dikt" contains "dikt".
                if (tags && tags.length > 0) {
                    const ignoredTags = ['norsk', 'skrivehjelp', 'analyse', 'tekstsjangre', 'grammatikk'];
                    const importantTags = tags.filter(t => !ignoredTags.includes(t.toLowerCase()));

                    const match = importantTags.some(tag => candidate.lesson.title.toLowerCase().includes(tag.toLowerCase()));
                    if (match) {
                        score += 15;
                        debugReasons.push('Title/Tag Match (+15)');
                    }
                }

                return {
                    candidate,
                    score,
                    debugInfo: debugReasons.join(', ')
                };
            });

        // 3. Filter, Sort and Map
        const result: RelatedLesson[] = scoredCandidates
            .filter(item => item.score > 0) // Only return items with SOME relevance
            .sort((a, b) => b.score - a.score)
            .slice(0, 5) // Limit to top 5
            .map(item => {
                const { candidate, score, debugInfo } = item;
                const url = `/${subjectId}/${candidate.topicId}${candidate.subTopicId ? `/${candidate.subTopicId}` : ''}/${candidate.lesson.id}`;

                return {
                    id: candidate.lesson.id,
                    title: candidate.lesson.title,
                    url,
                    image: candidate.lesson.image,
                    date: candidate.lesson.date,
                    score,
                    debugInfo
                };
            });

        return result;

    }, [manifest, subjectId, topicId, currentLessonId, tags]);
};
