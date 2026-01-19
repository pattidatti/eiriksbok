import React, { useState, useMemo } from 'react';
import { learningPathsData } from '../data/learningPathsHelper';
import { PathCard } from '../components/learning-paths/PathCard';
import { FilterBar } from '../components/learning-paths/FilterBar';
import { Search, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export const LearningPathsHub: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('Alle');

    // Counts Logic for Filter Bar
    const subjectCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        learningPathsData.paths.forEach(p => {
            const subj = p.subjectName; // Use Display Name for the filter bar
            counts[subj] = (counts[subj] || 0) + 1;
        });
        return counts;
    }, []);

    // Get unique subjects for the filter bar (sorted by count or custom order)
    const subjects = useMemo(() => {
        const priority = ['Historie', 'Norsk', 'KRLE', 'Samfunnskunnskap', 'Musikk', 'Naturfag'];
        const existing = Object.keys(subjectCounts);
        return [
            ...priority.filter(s => existing.includes(s)),
            ...existing.filter(s => !priority.includes(s))
        ];
    }, [subjectCounts]);

    // Grouping Logic
    const sections = useMemo(() => {
        const groups: Record<string, typeof learningPathsData.paths> = {};

        // 1. Filter first
        const filtered = learningPathsData.paths.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // 2. Group
        filtered.forEach(path => {
            // If specific subject selected, skip others
            if (selectedSubject !== 'Alle' && path.subjectName !== selectedSubject) return;

            const subj = path.subjectName;
            if (!groups[subj]) groups[subj] = [];
            groups[subj].push(path);
        });

        // 3. Order
        const priority = ['Historie', 'Norsk', 'KRLE', 'Samfunnskunnskap', 'Musikk', 'Naturfag'];
        const existing = Object.keys(groups);
        const sortedKeys = [
            ...priority.filter(s => existing.includes(s)),
            ...existing.filter(s => !priority.includes(s))
        ];

        return sortedKeys.map(key => ({
            name: key,
            paths: groups[key]
        }));
    }, [searchQuery, selectedSubject]);

    return (
        <div className="min-h-screen pb-20 bg-slate-50/30">
            {/* 1. COMPACT HEADER */}
            <div className="pt-24 pb-6 px-6 sm:px-8 max-w-[1920px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">

                {/* Title */}
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
                        <BookOpen className="text-indigo-600" size={32} />
                        Biblioteket
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm max-w-lg">
                        {learningPathsData.count} kuraterte læringsstier. Velg et fag eller søk fritt.
                    </p>
                </div>

                {/* Search (Compact, Right Aligned) */}
                <div className="relative w-full md:w-80 lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Søk i biblioteket..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-sm"
                    />
                </div>
            </div>

            {/* 2. STICKY FILTER BAR */}
            <FilterBar
                subjects={subjects}
                selectedSubject={selectedSubject}
                onSelectSubject={setSelectedSubject}
                counts={subjectCounts}
            />

            {/* 3. GROUPED SECTIONS GRID */}
            <div className="px-6 sm:px-8 py-8 max-w-[1920px] mx-auto space-y-12">
                {sections.map(section => (
                    <section key={section.name} id={`subject-${section.name}`}>
                        {/* Section Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-bold text-slate-800">
                                {section.name}
                            </h2>
                            <span className="bg-white border border-slate-200 text-slate-500 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                                {section.paths.length}
                            </span>
                        </div>

                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {section.paths.map(path => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    key={path.id}
                                >
                                    <PathCard path={path} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>
                ))}

                {/* Empty State */}
                {sections.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">Ingen resultater funnet.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedSubject('Alle'); }}
                            className="mt-4 text-indigo-600 hover:underline text-sm"
                        >
                            Nullstill filtre
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
