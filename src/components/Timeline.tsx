import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ManifestLesson } from '../types';

interface TimelineProps {
    lessons: (ManifestLesson & { path: string; topicTitle: string })[];
}

export const Timeline: React.FC<TimelineProps> = ({ lessons }) => {
    // Filter out lessons without date and sort by date descending (newest first)
    const sortedLessons = lessons
        .filter(lesson => lesson.date)
        .sort((a, b) => {
            return new Date(b.date!).getTime() - new Date(a.date!).getTime();
        });

    return (
        <div className="timeline-container" style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
            {/* Vertical Line */}
            <div style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'linear-gradient(to bottom, transparent, var(--neon-accent), transparent)',
                transform: 'translateX(-50%)',
                opacity: 0.5
            }} />

            {sortedLessons.map((lesson, index) => (
                <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                        display: 'flex',
                        justifyContent: index % 2 === 0 ? 'flex-end' : 'flex-start',
                        paddingBottom: '4rem',
                        position: 'relative'
                    }}
                >
                    {/* Node on the line */}
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        width: '12px',
                        height: '12px',
                        background: 'var(--bg-dark)',
                        border: '2px solid var(--neon-accent)',
                        borderRadius: '50%',
                        transform: 'translate(-50%, 0)',
                        boxShadow: '0 0 15px var(--neon-accent)',
                        zIndex: 10,
                        marginTop: '1.5rem'
                    }} />

                    {/* Content Card */}
                    <Link
                        to={lesson.path}
                        style={{
                            width: '45%',
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                    >
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--glass-border)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            textAlign: index % 2 === 0 ? 'right' : 'left',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.currentTarget.style.borderColor = 'var(--neon-accent)';
                                e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Topic Badge - Prominent */}
                            <div style={{
                                display: 'inline-block',
                                background: 'rgba(96, 165, 250, 0.15)',
                                color: 'var(--neon-accent)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '1rem',
                                border: '1px solid rgba(96, 165, 250, 0.3)'
                            }}>
                                {lesson.topicTitle}
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: index % 2 === 0 ? 'flex-end' : 'flex-start',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem'
                            }}>
                                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                                    {new Date(lesson.date!).toLocaleDateString('no-NO', { year: 'numeric', month: 'long' })}
                                </span>
                            </div>

                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.75rem', lineHeight: 1.2 }}>{lesson.title}</h3>

                            {lesson.description && (
                                <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                    {lesson.description}
                                </p>
                            )}

                            {lesson.tags && (
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: index % 2 === 0 ? 'flex-end' : 'flex-start', flexWrap: 'wrap' }}>
                                    {lesson.tags.map(tag => (
                                        <span key={tag} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
};
