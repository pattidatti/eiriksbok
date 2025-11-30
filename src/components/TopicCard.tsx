import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface TopicCardProps {
    title: string;
    description?: string;
    image?: string;
    path: string;
    lessonCount: number;
}

export const TopicCard: React.FC<TopicCardProps> = ({ title, description, image, path, lessonCount }) => {
    return (
        <Link to={path} className="block group no-underline h-full">
            <motion.div
                whileHover={{ y: -5 }}
                className="h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
                {/* Image Area */}
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                    <ImageWithFallback
                        src={image}
                        alt={title}
                        seed={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
                        {lessonCount} leksjoner
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-display font-bold text-text-main mb-2 group-hover:text-neon-accent transition-colors">
                        {title}
                    </h3>

                    {description && (
                        <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-3">
                            {description}
                        </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-neon-accent font-medium text-sm">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Gå til emne
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};
