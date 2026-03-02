import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ManifestLesson } from '../types';

interface TimelineProps {
    lessons: (ManifestLesson & { path: string; topicTitle: string })[];
}

export const Timeline: React.FC<TimelineProps> = ({ lessons }) => {
    // Filter out lessons without date and sort by date descending (newest first)
    const sortedLessons = React.useMemo(() => {
        return lessons
            .filter(lesson => lesson.date)
            .sort((a, b) => {
                const getDateValue = (dateStr: string) => {
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                        return date.getTime();
                    }
                    // Handle ancient dates manually (e.g. -300000-01-01)
                    // Assuming format YYYY-MM-DD or -YYYYYY-MM-DD
                    const parts = dateStr.split('-');
                    if (parts.length >= 3) {
                        // If starts with -, the first part is empty string
                        const isNegative = dateStr.startsWith('-');
                        const yearIndex = isNegative ? 1 : 0;
                        const year = parseInt(parts[yearIndex]) * (isNegative ? -1 : 1);
                        // Return a timestamp-like value (year * approx ms in year)
                        // This is rough but enough for sorting against other dates
                        return year * 31536000000;
                    }
                    return 0;
                };
                return getDateValue(b.date!) - getDateValue(a.date!);
            });
    }, [lessons]);

    return (
        <div className="timeline-container relative max-w-4xl mx-auto py-8">
            {/* Vertical Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-slate-300 to-transparent -translate-x-1/2 opacity-50" />

            {sortedLessons.map((lesson, index) => (
                <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'} pb-16 relative`}
                >
                    {/* Node on the line */}
                    <div className="absolute left-1/2 w-3 h-3 bg-bg-main border-2 border-slate-400 rounded-full -translate-x-1/2 mt-6 z-10 shadow-[0_0_10px_rgba(148,163,184,0.5)]" />

                    {/* Content Card */}
                    <Link
                        to={lesson.path}
                        className={`w-[45%] no-underline text-inherit group`}
                    >
                        <div className={`
                            bg-white/80 backdrop-blur-md border border-slate-200 
                            p-6 rounded-2xl 
                            ${index % 2 === 0 ? 'text-right' : 'text-left'}
                            transition-all duration-300 ease-out
                            cursor-pointer relative overflow-hidden
                            group-hover:-translate-y-1 group-hover:bg-white group-hover:border-slate-300 group-hover:shadow-lg
                        `}>
                            {/* Topic Badge - Prominent */}
                            <div className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-slate-200">
                                {lesson.topicTitle}
                            </div>

                            <div className={`flex items-center ${index % 2 === 0 ? 'justify-end' : 'justify-start'} gap-2 mb-2 text-text-muted text-sm`}>
                                <span className="text-text-main font-medium">
                                    {(() => {
                                        const dateStr = lesson.date!;
                                        const isNegative = dateStr.startsWith('-');
                                        if (isNegative) {
                                            const parts = dateStr.split('-');
                                            const year = parts[1];
                                            return `ca. ${year} fvt.`;
                                        }
                                        const date = new Date(dateStr);
                                        if (!isNaN(date.getTime())) {
                                            return date.toLocaleDateString('no-NO', { year: 'numeric', month: 'long' });
                                        }
                                        return dateStr;
                                    })()}
                                </span>
                            </div>

                            <h3 className="m-0 text-2xl text-text-main mb-3 leading-tight font-display">{lesson.title}</h3>

                            {lesson.description && (
                                <p className="m-0 text-base text-text-muted leading-relaxed">
                                    {lesson.description}
                                </p>
                            )}

                            {lesson.tags && (
                                <div className={`mt-4 flex gap-2 ${index % 2 === 0 ? 'justify-end' : 'justify-start'} flex-wrap`}>
                                    {lesson.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full border border-slate-200">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Link>
                </motion.div>
            ))
            }
        </div >
    );
};

