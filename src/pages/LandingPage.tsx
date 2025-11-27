import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import type { Manifest } from '../types';
import { motion } from 'framer-motion';
import { ImmersiveCard } from '../components/ImmersiveCard';

export const LandingPage: React.FC = () => {
    const [manifest, setManifest] = useState<Manifest | null>(null);

    useEffect(() => {
        fetchManifest().then(setManifest);
    }, []);

    if (!manifest) return <div className="p-8 text-center text-white">Laster fag...</div>;

    return (
        <div className="landing-page">
            <motion.div
                className="hero-section"
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                {manifest.subjects.map((subject, index) => (
                    <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link to={`/${subject.id}`} style={{ textDecoration: 'none' }}>
                            <ImmersiveCard>
                                <h2 style={{ marginTop: 0, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>{subject.title}</h2>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    {subject.topics.length} emner tilgjengelig
                                </p>
                            </ImmersiveCard>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
