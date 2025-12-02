import React from 'react';
import { motion } from 'framer-motion';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import type { Religion } from '../../types';

interface DimensionGridProps {
    religion: Religion;
}

const DIMENSIONS = [
    { key: 'ritual', label: 'Ritualer og kult', colSpan: 'col-span-1 md:col-span-2' },
    { key: 'narrative', label: 'Fortellinger og myter', colSpan: 'col-span-1 md:col-span-2' },
    { key: 'experiential', label: 'Opplevelser og erfaringer', colSpan: 'col-span-1' },
    { key: 'social', label: 'Sosial organisering', colSpan: 'col-span-1' },
    { key: 'ethical', label: 'Etikk og moral', colSpan: 'col-span-1' },
    { key: 'doctrinal', label: 'Lære og filosofi', colSpan: 'col-span-1 md:col-span-2' },
    { key: 'material', label: 'Materielle uttrykk', colSpan: 'col-span-1 md:col-span-3' },
] as const;

export const DimensionGrid: React.FC<DimensionGridProps> = ({ religion }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DIMENSIONS.map((dim, index) => (
                <motion.div
                    key={dim.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 ${dim.colSpan}`}
                >
                    <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-8 rounded-full bg-indigo-500" style={{ backgroundColor: religion.color }}></span>
                        {dim.label}
                    </h3>
                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                        {religion.dimensions[dim.key] ? (
                            <TinaMarkdown content={religion.dimensions[dim.key]} />
                        ) : (
                            <p className="text-slate-400 italic">Ingen beskrivelse.</p>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
