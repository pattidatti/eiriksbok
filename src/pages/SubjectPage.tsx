import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import type { ManifestSubject } from '../types';
import { motion } from 'framer-motion';

export const SubjectPage: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const [subjectData, setSubjectData] = useState<ManifestSubject | null>(null);

    useEffect(() => {
        fetchManifest().then(manifest => {
            if (manifest && subjectId) {
                const subject = manifest.subjects.find(s => s.id === subjectId);
                setSubjectData(subject || null);
            }
        });
    }, [subjectId]);

    if (!subjectData) return <div className="p-8 text-center">Finner ikke faget...</div>;

    const hasSubTopics = subjectData.topics.some(topic => topic.subTopics && topic.subTopics.length > 0);

    return (
        <div className="subject-page">
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}
            >
                {subjectData.title}
            </motion.h1>

            <div style={{ display: 'grid', gridTemplateColumns: hasSubTopics ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                {subjectData.topics.map((topic, index) => (
                    <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: 'var(--border-radius)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                    >
                        <h2 style={{ marginTop: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                            {topic.title}
                        </h2>
                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            {topic.subTopics ? (
                                topic.subTopics.map(subTopic => (
                                    <div key={subTopic.id}>
                                        <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{subTopic.title}</h3>
                                        {subTopic.lessons.map(lesson => (
                                            <Link
                                                key={lesson.id}
                                                to={`/${subjectId}/${topic.id}/${subTopic.id}/${lesson.id}`}
                                                style={{
                                                    display: 'block',
                                                    padding: '1rem',
                                                    background: '#f8fafc',
                                                    borderRadius: '8px',
                                                    textDecoration: 'none',
                                                    color: 'var(--text-color)',
                                                    fontWeight: 500,
                                                    transition: 'background 0.2s',
                                                    marginBottom: '0.5rem'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            >
                                                {lesson.title}
                                            </Link>
                                        ))}
                                        {subTopic.lessons.length === 0 && (
                                            <p style={{ color: 'var(--secondary-color)', fontStyle: 'italic' }}>Ingen leksjoner enda.</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                topic.lessons && topic.lessons.map(lesson => (
                                    <Link
                                        key={lesson.id}
                                        to={`/${subjectId}/${topic.id}/${lesson.id}`}
                                        style={{
                                            display: 'block',
                                            padding: '1rem',
                                            background: '#f8fafc',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            color: 'var(--text-color)',
                                            fontWeight: 500,
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    >
                                        {lesson.title}
                                    </Link>
                                ))
                            )}
                             {(!topic.subTopics && (!topic.lessons || topic.lessons.length === 0)) && (
                                <p style={{ color: 'var(--secondary-color)', fontStyle: 'italic' }}>Ingen leksjoner enda.</p>
                            )}
                        </div>
                    </motion.div>
                ))}
                {subjectData.topics.length === 0 && (
                    <p>Ingen emner lagt til enda.</p>
                )}
            </div>
        </div>
    );
};
