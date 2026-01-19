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
    const linkTo = path.path;

    const colorClass = subjectColors[path.subjectId] || subjectColors['annet'];
    const textColorClass = subjectTextColors[path.subjectId] || subjectTextColors['annet'];

    return (
        <Link to={linkTo} className="block h-full group">
            <motion.div
                whileHover={{ y: -2 }}
                className={`
                    relative h-full flex flex-col p-5 rounded-xl
                    bg-white/60 backdrop-blur-sm
                    border ${colorClass} transition-all duration-300
                    shadow-sm hover:shadow-md hover:bg-white/80
                    overflow-hidden
                `}
            >
                {/* Decorative background gradient blob - simpler and smaller */}
                <div className={`
                    absolute -top-12 -right-12 w-24 h-24 rounded-full 
                    bg-gradient-to-br ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}
                    opacity-10 group-hover:opacity-20 transition-opacity duration-300
                `} />

                {/* Header: Subject & Year */}
                <div className="flex justify-between items-start mb-3 relative z-10">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${textColorClass}`}>
                        {path.subjectName}
                    </span>
                    {path.year && (
                        <div className="flex items-center gap-1 text-[10px] text-text-muted bg-white/60 px-2 py-0.5 rounded-full border border-black/5">
                            <Calendar size={10} />
                            <span>{path.year}</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-display font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-700 transition-colors">
                    {path.title.replace('Læringssti: ', '')}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-600 mb-4 flex-grow line-clamp-3 leading-relaxed">
                    {path.description}
                </p>

                {/* Footer: Meta & Action */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/5 relative z-10">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock size={12} />
                        <span>{path.readTime || '2-3 timer'}</span>
                    </div>

                    <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
            </motion.div>
        </Link>
    );
};
