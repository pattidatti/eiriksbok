import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import type { Manifest, ManifestLesson } from '../types';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SearchResult {
    type: 'lesson' | 'topic' | 'concept';
    title: string;
    path: string;
    description?: string;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [manifest, setManifest] = useState<Manifest | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchManifest().then(setManifest);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim() || !manifest) {
            setResults([]);
            return;
        }

        const searchResults: SearchResult[] = [];
        const lowerQuery = query.toLowerCase();

        manifest.subjects.forEach(subject => {
            subject.topics.forEach(topic => {
                // Search Topics
                if (topic.title.toLowerCase().includes(lowerQuery)) {
                    searchResults.push({
                        type: 'topic',
                        title: topic.title,
                        path: `/${subject.id}`, // Navigate to subject for now, could be specific topic anchor
                        description: `Emne i ${subject.title}`
                    });
                }

                const processLesson = (lesson: ManifestLesson, path: string) => {
                    if (lesson.title.toLowerCase().includes(lowerQuery) ||
                        lesson.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
                        searchResults.push({
                            type: 'lesson',
                            title: lesson.title,
                            path: path,
                            description: `Leksjon i ${topic.title}`
                        });
                    }
                };

                if (topic.subTopics) {
                    topic.subTopics.forEach(subTopic => {
                        subTopic.lessons.forEach(lesson => {
                            processLesson(lesson, `/${subject.id}/${topic.id}/${subTopic.id}/${lesson.id}`);
                        });
                    });
                } else if (topic.lessons) {
                    topic.lessons.forEach(lesson => {
                        processLesson(lesson, `/${subject.id}/${topic.id}/${lesson.id}`);
                    });
                }
            });
        });

        setResults(searchResults);
    }, [query, manifest]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        paddingTop: '10vh'
                    }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        style={{ width: '100%', maxWidth: '600px', padding: '0 20px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Søk etter begreper, leksjoner..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1.5rem',
                                fontSize: '1.5rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '16px',
                                color: 'white',
                                outline: 'none',
                                fontFamily: 'Outfit, sans-serif'
                            }}
                        />

                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {results.map((result, index) => (
                                <Link
                                    key={index}
                                    to={result.path}
                                    onClick={onClose}
                                    style={{
                                        textDecoration: 'none',
                                        color: 'inherit'
                                    }}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            padding: '1rem 1.5rem',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        whileHover={{ background: 'rgba(255, 255, 255, 0.1)', scale: 1.02 }}
                                    >
                                        <div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{result.title}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{result.description}</div>
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: 'rgba(255,255,255,0.1)',
                                            textTransform: 'uppercase'
                                        }}>
                                            {result.type}
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                            {query && results.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Ingen resultater funnet.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
