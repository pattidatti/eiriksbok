import React, { useState, useMemo } from 'react';
import { learningPathsData } from '../data/learningPathsHelper';
import { SubjectSection } from '../components/learning-paths/SubjectSection';
import { Search, Hash, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

// Sticky Sidebar Item
const NavItem = ({ id, label, count, isActive, onClick }: any) => (
    <button
        onClick={onClick}
        className={`
            w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center group
            ${isActive ? 'bg-blue-50 text-blue-700' : 'text-text-muted hover:bg-black/5 hover:text-text-main'}
        `}
    >
        <span>{label}</span>
        <span className={`
            text-xs px-2 py-0.5 rounded-full 
            ${isActive ? 'bg-blue-100 text-blue-800' : 'bg-black/5 text-text-muted group-hover:bg-black/10'}
        `}>
            {count}
        </span>
    </button>
);

export const LearningPathsHub: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSubject, setActiveSubject] = useState<string | null>(null);

    // Grouping Logic
    const groupedPaths = useMemo(() => {
        const filtered = learningPathsData.paths.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const groups: Record<string, typeof filtered> = {};

        filtered.forEach(path => {
            const subj = path.subjectId;
            if (!groups[subj]) groups[subj] = [];
            groups[subj].push(path);
        });

        // Ensure specific order if exists, otherwise alphabetical
        const order = ['historie', 'norsk', 'krle', 'samfunnskunnskap', 'musikk', 'naturfag', 'annet'];

        return order
            .filter(subj => groups[subj]?.length > 0)
            .map(subj => ({
                id: subj,
                name: groups[subj][0].subjectName, // Take name from first item
                paths: groups[subj]
            }));
    }, [searchQuery]);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(`subject-${id}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setActiveSubject(id);
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative pt-20 pb-12 px-6 bg-gradient-to-b from-blue-50/50 to-transparent">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl"
                    >
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-text-main mb-4">
                            Biblioteket
                        </h1>
                        <p className="text-lg text-text-muted mb-8 leading-relaxed">
                            {learningPathsData.count} læringsstier samlet på ett sted.
                            Gå i dybden, utforsk sammenhenger og følg din egen nysgjerrighet.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-lg">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                            <input
                                type="text"
                                placeholder="Søk etter emner, tidsepoker eller personer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">

                {/* Desktop Sidebar (Sticky) */}
                <aside className="hidden lg:block lg:col-span-3">
                    <div className="sticky top-24 space-y-2">
                        <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-muted opacity-60">
                            <Hash size={14} />
                            <span>Fagområder</span>
                        </div>

                        {groupedPaths.map(group => (
                            <NavItem
                                key={group.id}
                                id={group.id}
                                label={group.name}
                                count={group.paths.length}
                                isActive={activeSubject === group.id}
                                onClick={() => scrollToSection(group.id)}
                            />
                        ))}

                        {groupedPaths.length === 0 && (
                            <div className="px-4 py-4 text-sm text-text-muted italic">
                                Ingen treff funnet.
                            </div>
                        )}
                    </div>
                </aside>

                {/* Mobile Navigation (Horizontal Scroll) */}
                <div className="lg:hidden col-span-1 overflow-x-auto pb-4 -mx-6 px-6 flex gap-2 sticky top-[64px] z-30 bg-bg-main/95 backdrop-blur border-b border-black/5">
                    {groupedPaths.map(group => (
                        <button
                            key={group.id}
                            onClick={() => scrollToSection(group.id)}
                            className="whitespace-nowrap px-4 py-2 bg-white border border-black/10 rounded-full text-sm font-medium shadow-sm active:scale-95 transition-transform"
                        >
                            {group.name} ({group.paths.length})
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <main className="lg:col-span-9 min-h-[50vh]">
                    {groupedPaths.map(group => (
                        <SubjectSection
                            key={group.id}
                            subjectId={group.id}
                            subjectName={group.name}
                            paths={group.paths}
                        />
                    ))}

                    {groupedPaths.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                            <BookOpen size={48} className="mb-4 opacity-20" />
                            <p className="text-lg">Ingen læringsstier passet til søket ditt.</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 text-blue-600 hover:underline"
                            >
                                Nullstill søk
                            </button>
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
};
