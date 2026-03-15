import React, { useState, useMemo } from 'react';
import { learningPathsData } from '../data/learningPathsHelper';
import { SubjectSection } from '../components/learning-paths/SubjectSection';
import { FilterBar } from '../components/learning-paths/FilterBar';
import { Search, BookOpen } from 'lucide-react';

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
        <div className="min-h-screen pb-20">
            {/* 1. COMPACT HEADER */}
            <div className="pt-6 pb-4 px-6 sm:px-8 max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2.5">
                        <BookOpen className="text-indigo-600" size={26} />
                        Biblioteket
                    </h1>
                    <p className="text-slate-500 mt-1.5 text-sm">
                        {learningPathsData.count} kuraterte læringsstier
                    </p>
                </div>

                <div className="relative w-full md:w-72 lg:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Søk i læringsstier..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-sm"
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

            {/* 3. ACCORDION SECTIONS */}
            <div className="px-6 sm:px-8 py-6 max-w-4xl mx-auto space-y-2">
                {sections.map((section) => (
                    <SubjectSection
                        key={section.name}
                        subjectId={section.paths[0]?.subjectId || 'annet'}
                        subjectName={section.name}
                        paths={section.paths}
                        defaultOpen={true}
                    />
                ))}

                {sections.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                        <Search size={40} className="mb-3 opacity-20" />
                        <p className="text-base font-medium">Ingen resultater funnet.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedSubject('Alle'); }}
                            className="mt-3 text-indigo-600 hover:underline text-sm"
                        >
                            Nullstill filtre
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
