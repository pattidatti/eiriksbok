import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import type { ManifestSubject, ManifestLesson } from '../types';
import { motion } from 'framer-motion';
import { ImmersiveCard } from '../components/ImmersiveCard';
import { Timeline } from '../components/Timeline';

export const SubjectPage: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const [subjectData, setSubjectData] = useState<ManifestSubject | null>(null);
    const [viewMode, setViewMode] = useState<'hierarchical' | 'timeline'>('hierarchical');

    useEffect(() => {
        fetchManifest().then(manifest => {
            if (manifest && subjectId) {
                const subject = manifest.subjects.find(s => s.id === subjectId);
                setSubjectData(subject || null);
            }
        });
    }, [subjectId]);

    if (!subjectData) return <div className="p-8 text-center text-white">Finner ikke faget...</div>;

    const hasSubTopics = subjectData.topics.some(topic => topic.subTopics && topic.subTopics.length > 0);

    // Flatten lessons for timeline
    const allLessons: (ManifestLesson & { path: string; topicTitle: string })[] = [];
    subjectData.topics.forEach(topic => {
        if (topic.subTopics) {
            topic.subTopics.forEach(subTopic => {
                subTopic.lessons.forEach(lesson => {
                    allLessons.push({
                        ...lesson,
                        path: `/${subjectId}/${topic.id}/${subTopic.id}/${lesson.id}`,
                        topicTitle: subTopic.title
                    });
                });
            });
        } else if (topic.lessons) {
            topic.lessons.forEach(lesson => {
                allLessons.push({
                    ...lesson,
                    path: `/${subjectId}/${topic.id}/${lesson.id}`,
                    topicTitle: topic.title
                });
            });
        }
    });

    return (
        <div className="subject-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ margin: 0, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}
                >
                    {subjectData.title}
                </motion.h1>

                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                    <button
                        onClick={() => setViewMode('hierarchical')}
                        style={{
                            background: viewMode === 'hierarchical' ? 'var(--accent-primary)' : 'transparent',
                            color: viewMode === 'hierarchical' ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '0.9rem'
                        }}
                    >
                        Oversikt
                    </button>
                    <button
                        onClick={() => setViewMode('timeline')}
                        style={{
                            background: viewMode === 'timeline' ? 'var(--accent-primary)' : 'transparent',
                            color: viewMode === 'timeline' ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '0.9rem'
                        }}
                    >
                        Tidslinje
                    </button>
                </div>
            </div>

            {viewMode === 'timeline' ? (
                <Timeline lessons={allLessons} />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: hasSubTopics ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                    {subjectData.topics.map((topic, index) => (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ImmersiveCard>
                                <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>
                                    {topic.title}
                                </h2>
                                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                    {topic.subTopics ? (
                                        topic.subTopics.map(subTopic => (
                                            <div key={subTopic.id}>
                                                <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>{subTopic.title}</h3>
                                                {subTopic.lessons.map(lesson => (
                                                    <Link
                                                        key={lesson.id}
                                                        to={`/${subjectId}/${topic.id}/${subTopic.id}/${lesson.id}`}
                                                        className="lesson-link"
                                                        style={{
                                                            display: 'block',
                                                            padding: '0.75rem 1rem',
                                                            background: 'rgba(255,255,255,0.03)',
                                                            borderRadius: '8px',
                                                            textDecoration: 'none',
                                                            color: 'var(--text-muted)',
                                                            fontWeight: 400,
                                                            transition: 'all 0.2s',
                                                            marginBottom: '0.5rem',
                                                            border: '1px solid transparent'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                            e.currentTarget.style.color = 'var(--text-main)';
                                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                            e.currentTarget.style.color = 'var(--text-muted)';
                                                            e.currentTarget.style.borderColor = 'transparent';
                                                        }}
                                                    >
                                                        {lesson.title}
                                                    </Link>
                                                ))}
                                                {subTopic.lessons.length === 0 && (
                                                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>Ingen leksjoner enda.</p>
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
                                                    padding: '0.75rem 1rem',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    borderRadius: '8px',
                                                    textDecoration: 'none',
                                                    color: 'var(--text-muted)',
                                                    fontWeight: 400,
                                                    transition: 'all 0.2s',
                                                    border: '1px solid transparent'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                    e.currentTarget.style.color = 'var(--text-main)';
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                    e.currentTarget.style.color = 'var(--text-muted)';
                                                    e.currentTarget.style.borderColor = 'transparent';
                                                }}
                                            >
                                                {lesson.title}
                                            </Link>
                                        ))
                                    )}
                                    {(!topic.subTopics && (!topic.lessons || topic.lessons.length === 0)) && (
                                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Ingen leksjoner enda.</p>
                                    )}
                                </div>
                            </ImmersiveCard>
                        </motion.div>
                    ))}
                    {subjectData.topics.length === 0 && (
                        <p style={{ color: 'var(--text-muted)' }}>Ingen emner lagt til enda.</p>
                    )}
                </div>
            )}
        </div>
    );
};
