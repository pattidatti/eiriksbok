import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReligion } from '../hooks/useReligion';
import { DimensionWheel } from '../components/religion/DimensionWheel';
import { DimensionGrid } from '../components/religion/DimensionGrid';
import { PageSkeleton } from '../components/Skeleton';

export const ReligionPage: React.FC = () => {
    const { religionId } = useParams<{ religionId: string }>();
    const { data: religion, isLoading } = useReligion(religionId || '');
    const [viewMode, setViewMode] = useState<'wheel' | 'grid'>('wheel');

    if (isLoading) return <PageSkeleton />;
    if (!religion) return <div className="p-12 text-center text-xl">Fant ikke religionen.</div>;

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
                <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white mb-6">
                    {religion.name}
                </h1>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setViewMode('wheel')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'wheel'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        Hjulet
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'grid'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        Oversikt
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
                {viewMode === 'wheel' ? (
                    <DimensionWheel religion={religion} />
                ) : (
                    <DimensionGrid religion={religion} />
                )}
            </motion.div>
        </div>
    );
};
