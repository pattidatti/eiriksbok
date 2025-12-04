import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReligion } from '../hooks/useReligion';
import { useManifest } from '../hooks/useManifest';
import { DimensionWheel } from '../components/religion/DimensionWheel';
import { DimensionGrid } from '../components/religion/DimensionGrid';
import { LessonCard } from '../components/LessonCard';
import { PageSkeleton } from '../components/Skeleton';
import { Grid, List, Disc } from 'lucide-react';

export const ReligionPage: React.FC = () => {
    const { religionId } = useParams<{ religionId: string }>();
    const { data: religion, isLoading: religionLoading } = useReligion(religionId || '');
    const { data: manifest, isLoading: manifestLoading } = useManifest();
    const [viewMode, setViewMode] = useState<'lessons' | 'wheel' | 'grid'>('lessons');

    if (religionLoading || manifestLoading) return <PageSkeleton />;
    if (!religion) return <div className="p-12 text-center text-xl">Fant ikke religionen.</div>;

    // Find lessons for this religion from manifest
    // KRLE -> religion -> [religionId]
    const krleSubject = manifest?.subjects.find(s => s.id === 'krle');
    const religionTopic = krleSubject?.topics.find(t => t.id === 'religion');
    const religionSubTopic = religionTopic?.subTopics?.find(st => st.id === religionId);
    const lessons = religionSubTopic?.lessons || [];

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <Link to="/krle" className="text-sm text-slate-500 hover:text-indigo-500 mb-4 inline-block">
                    ← Tilbake til oversikt
                </Link>
                <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 mb-6">
                    {religion.name}
                </h1>

                <div className="flex justify-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-full inline-flex mx-auto shadow-sm border border-slate-200">
                    <button
                        onClick={() => setViewMode('lessons')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'lessons'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                            }`}
                    >
                        <List size={18} />
                        Leksjoner
                    </button>
                    <button
                        onClick={() => setViewMode('wheel')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'wheel'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                            }`}
                    >
                        <Disc size={18} />
                        Hjulet
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'grid'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                            }`}
                    >
                        <Grid size={18} />
                        Dimensjoner
                    </button>
                </div>
            </motion.div>

            {/* Content */}
            <motion.div
                key={viewMode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {viewMode === 'lessons' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lessons.map((lesson, index) => (
                            <motion.div
                                key={lesson.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="h-full"
                            >
                                <LessonCard
                                    lesson={lesson}
                                    path={`/krle/religion/${religionId}/${lesson.id}`}
                                    topicTitle={religion.name}
                                />
                            </motion.div>
                        ))}
                        {lessons.length === 0 && (
                            <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <p className="text-slate-500 dark:text-slate-400 italic">Ingen leksjoner funnet.</p>
                            </div>
                        )}
                    </div>
                )}

                {viewMode === 'wheel' && (
                    <DimensionWheel religion={religion} />
                )}

                {viewMode === 'grid' && (
                    <DimensionGrid religion={religion} />
                )}
            </motion.div>
        </div>
    );
};
