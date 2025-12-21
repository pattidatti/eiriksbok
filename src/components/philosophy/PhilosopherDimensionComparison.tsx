import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Philosopher } from '../../types';

interface PhilosopherDimensionComparisonProps {
    philosophers: Philosopher[];
}

const DIMENSIONS = [
    { key: 'metafysikk', label: 'Metafysikk' },
    { key: 'epistemologi', label: 'Epistemologi' },
    { key: 'etikk', label: 'Etikk' },
    { key: 'menneskesyn', label: 'Menneskesyn' },
    { key: 'samfunnssyn', label: 'Samfunnssyn' },
] as const;

export const PhilosopherDimensionComparison: React.FC<PhilosopherDimensionComparisonProps> = ({ philosophers }) => {
    const [activeDim, setActiveDim] = useState<typeof DIMENSIONS[number]['key']>('metafysikk');

    return (
        <div className="space-y-8">
            {/* Dimension Selector */}
            <div className="flex flex-wrap gap-2 justify-center">
                {DIMENSIONS.map((dim) => (
                    <button
                        key={dim.key}
                        onClick={() => setActiveDim(dim.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeDim === dim.key
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                            : 'bg-bg-card border border-border-main text-text-muted hover:text-text-main hover:border-indigo-500/50'
                            }`}
                    >
                        {dim.label}
                    </button>
                ))}
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {philosophers.map((philosopher) => (
                    <motion.div
                        key={philosopher.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-bg-card border border-border-main rounded-2xl overflow-hidden flex flex-col shadow-sm"
                    >
                        <div
                            className="p-4 border-b border-border-main flex items-center gap-3"
                            style={{ borderTop: `4px solid ${philosopher.color || '#6366f1'}` }}
                        >
                            <h3 className="font-display font-bold text-lg text-text-main">
                                {philosopher.name}
                            </h3>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="text-sm text-text-muted leading-relaxed mb-6">
                                {philosopher.dimensions[activeDim] ? (
                                    <p>{philosopher.dimensions[activeDim]}</p>
                                ) : (
                                    <p className="italic">Ingen informasjon tilgjengelig.</p>
                                )}
                            </div>

                            <div className="mt-auto pt-4 border-t border-border-main">
                                <Link
                                    to={`/krle/filosofi/${philosopher.id}`}
                                    className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
                                >
                                    <span className="group-hover:underline">Les full artikkel om {philosopher.name}</span>
                                    <span>→</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
