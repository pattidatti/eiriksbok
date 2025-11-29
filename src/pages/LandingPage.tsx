import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import type { Manifest, ManifestTopic } from '../types';
import { motion } from 'framer-motion';
import { ImmersiveCard } from '../components/ImmersiveCard';
import { ContentRow } from '../components/ContentRow';
import { useUserHistory } from '../hooks/useUserHistory';

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
        <div className="landing-page pb-20">
            <motion.div
                className="hero-section mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>
                    Velkommen til Interactive Concept Hub
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
                    Velg et fag for å starte læringen.
                </p>
            </motion.div>

            <div className="space-y-12">
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
                                    <Link to={`/${subject.id}/${topic.id}`} style={{ textDecoration: 'none' }}>
                                        <ImmersiveCard>
                                            <div style={{ height: '200px', overflow: 'hidden', borderRadius: '8px', marginBottom: '1rem' }}>
                                                <img
                                                    src={topic.image || `https://placehold.co/800x500?text=${encodeURIComponent(topic.title)}`}
                                                    alt={topic.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <h3 style={{ marginTop: 0, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>{topic.title}</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
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
