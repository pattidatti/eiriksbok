import { useState, useEffect } from 'react';
import { useManifest } from '../../../hooks/useManifest';
import { fetchLesson } from '../../../utils/contentLoader';
import type { QuizQuestion } from '../../../types';

export const useDungeonQuestions = (subjectId: string, topicId: string) => {
    const { data: manifest } = useManifest();
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadQuestions = async () => {
            if (!manifest) {
                return;
            }
            setLoading(true);

            try {
                // Strategy:
                // 1. Fetch SPECIFIC topic questions
                // 2. If < MIN_THRESHOLD, fetch SUBJECT questions
                // 3. If still < MIN_THRESHOLD, fetch GLOBAL questions

                const MIN_THRESHOLD = 10;
                let currentQuestions: QuizQuestion[] = [];

                // Helper to fetch lessons
                const fetchLessonsForScope = async (scope: 'TOPIC' | 'SUBJECT' | 'GLOBAL') => {
                    const lessonsToFetch: { subjectId: string; topicId: string; subTopicId?: string; lessonId: string }[] = [];

                    manifest.subjects.forEach(subject => {
                        // Filter Subject
                        if (scope === 'TOPIC' || scope === 'SUBJECT') {
                            if (subjectId !== 'all' && subject.id !== subjectId) return;
                        }

                        subject.topics.forEach(topic => {
                            // Filter Topic
                            if (scope === 'TOPIC') {
                                if (topicId !== 'all' && topic.id !== topicId) return;
                            }

                            // Direct lessons
                            topic.lessons?.forEach(lesson => {
                                lessonsToFetch.push({
                                    subjectId: subject.id,
                                    topicId: topic.id,
                                    lessonId: lesson.id
                                });
                            });

                            // Subtopic lessons
                            topic.subTopics?.forEach(subTopic => {
                                subTopic.lessons.forEach(lesson => {
                                    lessonsToFetch.push({
                                        subjectId: subject.id,
                                        topicId: topic.id,
                                        subTopicId: subTopic.id,
                                        lessonId: lesson.id
                                    });
                                });
                            });
                        });
                    });

                    const results = await Promise.all(
                        lessonsToFetch.map(async (l) => {
                            const lesson = await fetchLesson(l.subjectId, l.topicId, l.lessonId, l.subTopicId);
                            if (lesson) return lesson;
                            return null;
                        })
                    );

                    const newQuestions: QuizQuestion[] = [];
                    results.forEach(lesson => {
                        if (lesson && lesson.quiz) {
                            newQuestions.push(...lesson.quiz);
                        }
                    });

                    return newQuestions;
                };

                // 1. Attempt Topic
                currentQuestions = await fetchLessonsForScope('TOPIC');
                console.log(`[Dungeon] Topic Scope: Found ${currentQuestions.length} questions`);

                // 2. Fallback to Subject
                if (currentQuestions.length < MIN_THRESHOLD && subjectId !== 'all') {
                    console.log(`[Dungeon] Below threshold (${MIN_THRESHOLD}), fetching SUBJECT scope...`);
                    const subjectQuestions = await fetchLessonsForScope('SUBJECT');
                    // Merge unique
                    const existing = new Set(currentQuestions.map(q => q.question));
                    subjectQuestions.forEach(q => {
                        if (!existing.has(q.question)) {
                            currentQuestions.push(q);
                            existing.add(q.question);
                        }
                    });
                }

                // 3. Fallback to Global
                if (currentQuestions.length < MIN_THRESHOLD) {
                    console.log(`[Dungeon] Still below threshold, fetching GLOBAL scope...`);
                    const globalQuestions = await fetchLessonsForScope('GLOBAL');
                    const existing = new Set(currentQuestions.map(q => q.question));
                    globalQuestions.forEach(q => {
                        if (!existing.has(q.question)) {
                            currentQuestions.push(q);
                            existing.add(q.question);
                        }
                    });
                }

                console.log(`[Dungeon] Final Question Count: ${currentQuestions.length}`);

                if (currentQuestions.length === 0) {
                    // INJECT DEBUG QUESTION
                    currentQuestions.push({
                        question: `DEBUG: Fant ingen spørsmål. Scannet ${manifest.subjects.length} fag.`,
                        options: ["Prøver Globalt..", "Sjekk Konsollen", "Ingen Quiz i filer?", "Manifest Feil?"],
                        correctAnswer: 0,
                        answer: "Sjekk Konsollen"
                    });
                }

                // Shuffle
                for (let i = currentQuestions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [currentQuestions[i], currentQuestions[j]] = [currentQuestions[j], currentQuestions[i]];
                }

                setQuestions(currentQuestions);

            } catch (err) {
                console.error("Error loading dungeon questions", err);
                setQuestions([{
                    question: `ERROR: ${err}`,
                    options: ["Ok"],
                    correctAnswer: 0
                }]);
            } finally {
                setLoading(false);
            }
        };

        loadQuestions();
    }, [manifest, subjectId, topicId]);

    return { questions, loading };
};
