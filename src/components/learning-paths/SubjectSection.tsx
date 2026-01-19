import React from 'react';
import type { LearningPathMetadata } from '../../types/LearningPath';
import { PathCard } from './PathCard';
import { motion } from 'framer-motion';

interface SubjectSectionProps {
    subjectId: string;
    subjectName: string;
    paths: LearningPathMetadata[];
}

export const SubjectSection: React.FC<SubjectSectionProps> = ({ subjectId, subjectName, paths }) => {
    if (paths.length === 0) return null;

    return (
        <section id={`subject-${subjectId}`} className="scroll-mt-24 mb-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-baseline gap-4 mb-6 border-b border-black/5 pb-2">
                    <h2 className="text-3xl font-display font-bold text-text-main">
                        {subjectName}
                    </h2>
                    <span className="text-text-muted text-sm font-medium">
                        {paths.length} {paths.length === 1 ? 'læringssti' : 'læringsstier'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paths.map(path => (
                        <PathCard key={path.id} path={path} />
                    ))}
                </div>
            </motion.div>
        </section>
    );
};
