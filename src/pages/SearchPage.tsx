import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import { LessonCard } from '../components/LessonCard';
import type { Manifest, ManifestLesson } from '../types';
import { motion } from 'framer-motion';

interface SearchResult {
    lesson: ManifestLesson;
    path: string;
    topicTitle: string;
    topicImage?: string;
    subjectId: string;
}

export const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const tag = searchParams.get('tag');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResults = async () => {
            setLoading(true);
            const manifest = await fetchManifest();
            if (!manifest) {
                setLoading(false);
                return;
            }

            const found: SearchResult[] = [];
            const searchTag = tag?.toLowerCase();

            if (searchTag) {
                manifest.subjects.forEach(subject => {
                    subject.topics.forEach(topic => {
                        // Check direct lessons
                        if (topic.lessons) {
                            topic.lessons.forEach(lesson => {
                                if (lesson.tags?.some(t => t.toLowerCase() === searchTag)) {
                                    found.push({
                                        lesson,
                                        path: `/${subject.id}/${topic.id}/${lesson.id}`,
                                        topicTitle: topic.title,
                                        topicImage: topic.image,
                                        subjectId: subject.id
                                    });
                                }
                            });
                        }

                        // Check subtopics
                        if (topic.subTopics) {
                            topic.subTopics.forEach(subTopic => {
                                subTopic.lessons.forEach(lesson => {
                                    if (lesson.tags?.some(t => t.toLowerCase() === searchTag)) {
                                        found.push({
                                            lesson,
                                            path: `/${subject.id}/${topic.id}/${subTopic.id}/${lesson.id}`,
                                            topicTitle: subTopic.title, // Or `${topic.title} - ${subTopic.title}`
                                            topicImage: subTopic.image || topic.image,
                                            subjectId: subject.id
                                        });
                                    }
                                });
                            });
                        }
                    });
                });
            }

            setResults(found);
            setLoading(false);
        };

        loadResults();
    }, [tag]);

    if (loading) {
        return <div className="p-8 text-center">Laster søkeresultater...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h1 className="text-4xl font-display font-bold text-text-main mb-4">
                    Emne: <span className="text-neon-accent capitalize">{tag}</span>
                </h1>
                <p className="text-text-muted text-lg">
                    Fant {results.length} {results.length === 1 ? 'artikkel' : 'artikler'} merket med "{tag}"
                </p>
            </motion.div>

            {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {results.map((result, index) => (
                        <motion.div
                            key={`${result.subjectId}-${result.lesson.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <LessonCard
                                lesson={result.lesson}
                                path={result.path}
                                topicTitle={result.topicTitle}
                                topicImage={result.topicImage}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200">
                    <p className="text-xl text-slate-500">
                        Ingen artikler funnet med dette emneknaggen.
                    </p>
                </div>
            )}
        </div>
    );
};
