import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchLesson } from '../utils/contentLoader';
import type { Lesson } from '../types';
import { ConceptCard } from '../components/ConceptCard';
import { ContextBuilder } from '../components/ContextBuilder';
import { Quiz } from '../components/Quiz';
import { DemographyPage } from './DemographyPage';
import { motion } from 'framer-motion';
import { GovernmentExplorer } from '../components/government/GovernmentExplorer';

export const LessonPage: React.FC = () => {
    const { subjectId, topicId, subTopicId, lessonId } = useParams<{ subjectId: string; topicId: string; subTopicId?: string; lessonId: string }>();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (subjectId && topicId && lessonId) {
            setLoading(true);
            fetchLesson(subjectId, topicId, lessonId, subTopicId).then(data => {
                setLesson(data);
                setLoading(false);
            });
        }
    }, [subjectId, topicId, subTopicId, lessonId]);

    if (loading) return <div className="p-8 text-center">Laster leksjon...</div>;

    // Special handling for Demography module
    if (subTopicId === 'demografi-okonomi') {
        return <DemographyPage />;
    }

    if (subTopicId === 'styringsformer') {
        return <GovernmentExplorer />;
    }

    if (!lesson) return <div className="p-8 text-center">Fant ikke leksjonen.</div>;

    return (
        <div className="lesson-page">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '3rem', textAlign: 'center' }}
            >
                <span style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--secondary-color)',
                    fontSize: '0.875rem',
                    fontWeight: 600
                }}>
                    {lesson.subject} / {lesson.topic} {subTopicId && `/ ${subTopicId}`}
                </span>
                <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--primary-color)' }}>
                    {lesson.title}
                </h1>
            </motion.div>

            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary-color)', paddingLeft: '1rem' }}>
                    Begreper
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {lesson.concepts.map(concept => (
                        <ConceptCard key={concept.id} concept={concept} />
                    ))}
                </div>
            </section>

            {lesson.context && (
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary-color)', paddingLeft: '1rem' }}>
                        Kontekst
                    </h2>
                    <ContextBuilder context={lesson.context} concepts={lesson.concepts} />
                </section>
            )}

            {lesson.quiz && lesson.quiz.length > 0 && (
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary-color)', paddingLeft: '1rem' }}>
                        Test deg selv
                    </h2>
                    <Quiz questions={lesson.quiz} />
                </section>
            )}
        </div>
    );
};
