import React from 'react';
import { Link } from 'react-router-dom';
import type { LearningPathMetadata } from '../../types/LearningPath';
import { motion } from 'framer-motion';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

interface PathCardProps {
    path: LearningPathMetadata;
}

const subjectColors: Record<string, string> = {
    'historie': 'from-amber-500/20 to-orange-600/20 border-amber-500/30 hover:border-amber-500/50',
    'norsk': 'from-red-500/20 to-rose-600/20 border-red-500/30 hover:border-red-500/50',
    'krle': 'from-violet-500/20 to-purple-600/20 border-violet-500/30 hover:border-violet-500/50',
    'samfunnskunnskap': 'from-blue-500/20 to-cyan-600/20 border-blue-500/30 hover:border-blue-500/50',
    'musikk': 'from-pink-500/20 to-fuchsia-600/20 border-pink-500/30 hover:border-pink-500/50',
    'naturfag': 'from-green-500/20 to-emerald-600/20 border-green-500/30 hover:border-green-500/50',
    'annet': 'from-gray-500/20 to-slate-600/20 border-gray-500/30 hover:border-gray-500/50'
};

const subjectTextColors: Record<string, string> = {
    'historie': 'text-amber-700',
    'norsk': 'text-red-700',
    'krle': 'text-violet-700',
    'samfunnskunnskap': 'text-blue-700',
    'musikk': 'text-pink-700',
    'naturfag': 'text-green-700',
    'annet': 'text-gray-700'
};

export const PathCard: React.FC<PathCardProps> = ({ path }) => {
    // Fallback for constructing a valid link if the path in JSON is weird
    // Standard Route: /fag/:subject/tema/:topic/sti/:learningPathId
    // If topicId is undefined or generelt, maybe we route differently? 
    // For now assuming the structure works, but cleaning "undefined" string if present.
    const cleanTopicId = path.topicId === 'undefined' ? 'generelt' : path.topicId;
    const linkTo = `/fag/${path.subjectId}/tema/${cleanTopicId}/sti/${path.id}`;

    const colorClass = subjectColors[path.subjectId] || subjectColors['annet'];
    const textColorClass = subjectTextColors[path.subjectId] || subjectTextColors['annet'];

    return (
        <Link to={linkTo} className="block h-full">
            <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className={`
                    relative h-full flex flex-col p-6 rounded-2xl
                    backdrop-blur-md bg-white/40 
                    border ${colorClass} transition-colors duration-300
                    shadow-sm hover:shadow-md
                    overflow-hidden group
                `}
            >
                {/* Decorative background gradient blob */}
                <div className={`
                    absolute -top-10 -right-10 w-32 h-32 rounded-full 
                    bg-gradient-to-br ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}
                    opacity-20 blur-xl group-hover:scale-150 transition-transform duration-500
                `} />

                {/* Header: Subject & Year */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className={`text-xs font-bold uppercase tracking-wider ${textColorClass}`}>
                        {path.subjectName}
                    </span>
                    {path.year && (
                        <div className="flex items-center gap-1 text-xs text-text-muted bg-white/50 px-2 py-1 rounded-full">
                            <Calendar size={12} />
                            <span>{path.year}</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-display font-bold text-text-main mb-2 leading-tight group-hover:text-blue-700 transition-colors">
                    {path.title.replace('Læringssti: ', '')}
                </h3>

                {/* Description */}
                <p className="text-sm text-text-muted mb-6 flex-grow line-clamp-3">
                    {path.description}
                </p>

                {/* Footer: Meta & Action */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 relative z-10">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Clock size={14} />
                        <span>{path.readTime || '2-3 timer'}</span>
                    </div>

                    <span className="flex items-center gap-1 text-sm font-medium text-text-main opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Start
                        <ArrowRight size={16} />
                    </span>
                </div>
            </motion.div>
        </Link>
    );
};
