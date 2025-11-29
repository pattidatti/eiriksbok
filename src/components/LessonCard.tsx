import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ManifestLesson } from '../types';
import { Clock } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface LessonCardProps {
    lesson: ManifestLesson;
    path: string;
    topicTitle: string;
    topicImage?: string;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, path, topicTitle, topicImage }) => {
    const displayImage = lesson.image || topicImage;

    return (
        <Link to={path} className="block group no-underline">
            <motion.div
                whileHover={{ y: -5 }}
                className="h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
                {/* Image Area */}
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                    <ImageWithFallback
                        src={displayImage}
                        alt={lesson.title}
                        seed={lesson.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Topic Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wider border border-slate-200 shadow-sm">
                        {topicTitle}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-display font-bold text-text-main mb-2 group-hover:text-neon-accent transition-colors">
                        {lesson.title}
                    </h3>

                    {lesson.description && (
                        <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                            {lesson.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <div className="flex items-center text-xs text-slate-500 font-medium">
                            {lesson.date && (
                                <span className="flex items-center mr-4">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {lesson.date}
                                </span>
                            )}
                        </div>

                        {lesson.tags && lesson.tags.length > 0 && (
                            <div className="flex gap-1">
                                {lesson.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] border border-slate-100">
                                        #{tag}
                                    </span>
                                ))}
                                {lesson.tags.length > 2 && (
                                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] border border-slate-100">
                                        +{lesson.tags.length - 2}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};
