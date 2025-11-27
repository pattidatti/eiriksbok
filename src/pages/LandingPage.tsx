import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import type { Manifest } from '../types';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
    const [manifest, setManifest] = useState<Manifest | null>(null);

    useEffect(() => {
        fetchManifest().then(setManifest);
    }, []);

    if (!manifest) return <div className="p-8 text-center">Laster fag...</div>;

    return (
        <div className="landing-page">
            <motion.div
                className="hero-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                    Velkommen til Interactive Concept Hub
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--secondary-color)', marginBottom: '3rem' }}>
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
                        <Link
                            to={`/${subject.id}`}
                            style={{
                                display: 'block',
                                padding: '2rem',
                                background: 'white',
                                borderRadius: 'var(--border-radius)',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                textDecoration: 'none',
                                color: 'var(--text-color)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <h2 style={{ marginTop: 0 }}>{subject.title}</h2>
                            <p style={{ color: 'var(--secondary-color)' }}>
                                {subject.topics.length} emner tilgjengelig
                            </p>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
