import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown } from 'lucide-react';
import { ImageWithFallback } from '../ImageWithFallback';
import type { ManifestLesson } from '../../types';

interface ExplorerViewProps {
    lessons: (ManifestLesson & { path: string; topicTitle: string })[];
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({ lessons }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [sortMode, setSortMode] = useState<'date' | 'alpha' | 'chronic'>('chronic');

    // Extract all unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        lessons.forEach(l => {
            l.tags?.forEach(t => tags.add(t));
        });
        return Array.from(tags).sort();
    }, [lessons]);

    // Filter and Sort
    const filteredLessons = useMemo(() => {
        let result = [...lessons];

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(l =>
                l.title.toLowerCase().includes(lowerQ) ||
                l.description?.toLowerCase().includes(lowerQ)
            );
        }

        if (selectedTag) {
            result = result.filter(l => l.tags?.includes(selectedTag));
        }

        if (sortMode === 'alpha') {
            result.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortMode === 'chronic') {
            // Oldest first
            result.sort((a, b) => {
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
        } else {
            // Default/Date: Newest first
            result.sort((a, b) => {
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
        }

        return result;
    }, [lessons, searchQuery, selectedTag, sortMode]);

    return (
        <div className="space-y-8">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Søk i artikler..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select
                        value={selectedTag || ''}
                        onChange={(e) => setSelectedTag(e.target.value || null)}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none cursor-pointer"
                    >
                        <option value="">Alle emneknagger</option>
                        {allTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => {
                            if (sortMode === 'date') setSortMode('chronic');
                            else if (sortMode === 'chronic') setSortMode('alpha');
                            else setSortMode('date');
                        }}
                        className="flex items-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors whitespace-nowrap"
                    >
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        {sortMode === 'date' ? 'Nyest først' : sortMode === 'chronic' ? 'Kronologisk' : 'A-Å'}
                    </button>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredLessons.map((lesson) => (
                    <Link to={lesson.path} key={lesson.path} className="group block">
                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all h-full flex flex-col"
                        >
                            <div className="h-40 bg-slate-100 overflow-hidden relative">
                                <ImageWithFallback
                                    src={lesson.image}
                                    alt={lesson.title}
                                    seed={lesson.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-1 rounded-sm">
                                        {lesson.topicTitle}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                                    {lesson.title}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                    {lesson.description}
                                </p>

                                <div className="mt-auto pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                                    {lesson.tags?.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {filteredLessons.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    Ingen artikler funnet.
                </div>
            )}
        </div>
    );
};
