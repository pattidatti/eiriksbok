import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import type { Manifest, ManifestTopic } from '../types';
import { motion } from 'framer-motion';
import { ImmersiveCard } from '../components/ImmersiveCard';
import { ContentRow } from '../components/ContentRow';
import { useUserHistory } from '../hooks/useUserHistory';
import { ImageWithFallback } from '../components/ImageWithFallback';

export const LandingPage: React.FC = () => {
    const [manifest, setManifest] = useState<Manifest | null>(null);
    const { history } = useUserHistory();

    useEffect(() => {
        fetchManifest().then(setManifest);
    }, []);

    if (!manifest) return <div className="p-8 text-center text-text-muted">Laster fag...</div>;

    // Helper to sort topics: History items first
    const getSortedTopics = (subjectId: string, topics: ManifestTopic[]) => {
        const subjectHistory = history.filter(h => h.subjectId === subjectId);
        const historyIds = new Set(subjectHistory.map(h => h.id));

        const historyTopics: ManifestTopic[] = [];
        const otherTopics: ManifestTopic[] = [];

        topics.forEach(topic => {
            if (historyIds.has(topic.id)) {
                historyTopics.push(topic);
            } else {
                otherTopics.push(topic);
            }
        });

        // Sort history topics by most recent timestamp (implicitly by order in history array)
        historyTopics.sort((a, b) => {
            const indexA = subjectHistory.findIndex(h => h.id === a.id);
            const indexB = subjectHistory.findIndex(h => h.id === b.id);
            return indexA - indexB;
        });

        return [...historyTopics, ...otherTopics];
    };

    return (
        <div className="pb-20">
            <motion.div
                className="mb-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl md:text-5xl font-display font-bold text-text-main mb-4">
                    Velkommen til Interactive Concept Hub
                </h1>
                <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto">
                    Velg et fag for å starte læringen.
                </p>
            </motion.div>

            <div className="space-y-16">
                {manifest.subjects.map((subject) => {
                    const sortedTopics = getSortedTopics(subject.id, subject.topics);
                    if (sortedTopics.length === 0) return null;

                    return (
                        <ContentRow key={subject.id} title={subject.title}>
                            {sortedTopics.map((topic, index) => (
                                <motion.div
                                    key={topic.id}
                                    className="min-w-[300px] md:min-w-[400px] snap-start"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link to={`/${subject.id}/${topic.id}`} className="block no-underline group">
                                        <ImmersiveCard>
                                            <div className="h-48 overflow-hidden rounded-lg mb-4 relative">
                                                <ImageWithFallback
                                                    src={topic.image}
                                                    alt={topic.title}
                                                    seed={topic.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                            <h3 className="text-2xl font-display font-bold text-text-main mt-0 mb-2 group-hover:text-neon-accent transition-colors">
                                                {topic.title}
                                            </h3>
                                            <p className="text-base text-text-muted m-0">
                                                {topic.lessons?.length || 0} artikler
                                            </p>
                                        </ImmersiveCard>
                                    </Link>
                                </motion.div>
                            ))}
                        </ContentRow>
                    );
                })}
            </div>
        </div>
    );
};
