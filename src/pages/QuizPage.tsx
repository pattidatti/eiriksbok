import React, { useState, useMemo } from 'react';
import { useManifest } from '../hooks/useManifest';
import { fetchLesson } from '../utils/contentLoader';
import { Quiz } from '../components/Quiz';
import type { QuizQuestion } from '../types';
import { Loader2, ArrowLeft, Brain, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuizPage: React.FC = () => {
    const { data: manifest, isLoading: isManifestLoading } = useManifest();
    const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');
    const [selectedTopic, setSelectedTopic] = useState<string | 'all'>('all');
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extract subjects
    const subjects = useMemo(() => {
        if (!manifest) return [];
        return manifest.subjects.map(s => s.id);
    }, [manifest]);

    // Extract topics based on selected subject
    const topics = useMemo(() => {
        if (!manifest) return [];
        if (selectedSubject === 'all') {
            // Get all topics from all subjects
            return manifest.subjects.flatMap(s => s.topics.map(t => t.id));
        }
        const subject = manifest.subjects.find(s => s.id === selectedSubject);
        return subject ? subject.topics.map(t => t.id) : [];
    }, [manifest, selectedSubject]);

    const handleStartQuiz = async () => {
        if (!manifest) return;
        setIsLoading(true);
        setError(null);
        setQuizQuestions([]);

        try {
            const lessonsToFetch: { subjectId: string; topicId: string; subTopicId?: string; lessonId: string }[] = [];

            manifest.subjects.forEach(subject => {
                if (selectedSubject !== 'all' && subject.id !== selectedSubject) return;

                subject.topics.forEach(topic => {
                    if (selectedTopic !== 'all' && topic.id !== selectedTopic) return;

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

            // Randomly select up to 20 lessons to avoid fetching too much if "All" is selected
            // Or fetch all? Let's fetch all for now, but maybe limit if it's too slow.
            // There are only ~30 lessons total, so fetching all is fine.

            const results = await Promise.all(
                lessonsToFetch.map(async (l) => {
                    const lesson = await fetchLesson(l.subjectId, l.topicId, l.lessonId, l.subTopicId);
                    if (lesson) {
                        return { ...lesson, subject: l.subjectId, topic: l.topicId, subTopic: l.subTopicId };
                    }
                    return null;
                })
            );

            const allQuestions: QuizQuestion[] = [];
            results.forEach(lesson => {
                if (lesson && lesson.quiz) {
                    const lessonUrl = lesson.subTopic
                        ? `/${lesson.subject}/${lesson.topic}/${lesson.subTopic}/${lesson.id}`
                        : `/${lesson.subject}/${lesson.topic}/${lesson.id}`;
                    const enrichedQuestions = lesson.quiz.map(q => ({
                        ...q,
                        sourceUrl: lessonUrl,
                        sourceTitle: lesson.title
                    }));
                    allQuestions.push(...enrichedQuestions);
                }
            });

            if (allQuestions.length === 0) {
                setError('Fant ingen spørsmål for valgte filter.');
            } else {
                // Shuffle questions
                for (let i = allQuestions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
                }
                // Limit to 20 questions
                setQuizQuestions(allQuestions.slice(0, 20));
                setQuizStarted(true);
            }

        } catch (err) {
            console.error("Failed to generate quiz:", err);
            setError('Noe gikk galt under generering av quizen.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isManifestLoading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (quizStarted) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={() => setQuizStarted(false)}
                        className="mb-6 flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Tilbake til filter
                    </button>
                    <Quiz questions={quizQuestions} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <Link to="/oving" className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">
                            <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                            Tilbake til oversikt
                        </Link>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900">
                        Kunnskapstest
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Test deg selv i fagstoffet. Velg fag og emne, eller ta en utfordring med alt blandet!
                    </p>
                </div>

                <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                    <div className="space-y-6">
                        {/* Subject Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Velg fag</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedSubject('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSubject === 'all'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    Alle fag
                                </button>
                                {subjects.map(subject => (
                                    <button
                                        key={subject}
                                        onClick={() => setSelectedSubject(subject)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${selectedSubject === subject
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {subject}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Topic Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Velg emne</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedTopic('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTopic === 'all'
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    Alle emner
                                </button>
                                {topics.map(topic => (
                                    <button
                                        key={topic}
                                        onClick={() => setSelectedTopic(topic)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${selectedTopic === topic
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleStartQuiz}
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Lager quiz...
                                </>
                            ) : (
                                <>
                                    <Brain className="w-5 h-5" />
                                    Start Quiz
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
