import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Search, Filter, BookOpen, ArrowRight } from 'lucide-react';
import { useGlossary } from '../context/GlossaryContext';

export const PersonGallery: React.FC = () => {
    const { entries, isLoading } = useGlossary();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string>('all');

    const people = useMemo(() => {
        return entries.filter(e => e.type === 'person');
    }, [entries]);

    const subjects = useMemo(() => {
        const set = new Set(people.map(p => p.subject).filter(Boolean));
        return ['all', ...Array.from(set)];
    }, [people]);

    const filteredPeople = useMemo(() => {
        return people.filter(p => {
            const matchesSearch = p.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.definition.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSubject = selectedSubject === 'all' || p.subject === selectedSubject;
            return matchesSearch && matchesSubject;
        });
    }, [people, searchQuery, selectedSubject]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
                <div className="h-12 w-64 bg-slate-200 rounded-lg mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-slate-100 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                        <User size={32} />
                    </div>
                    Persongalleri
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl">
                    Her kan du lære mer om de mest sentrale historiske personene og tenkerne i Eiriksbok.
                </p>
            </header>

            <div className="flex flex-col md:flex-row gap-4 mb-12">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Søk etter navn eller beskrivelse..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
                    <Filter className="ml-2 text-slate-400" size={18} />
                    <select
                        className="bg-transparent border-none outline-none pr-8 py-2 text-slate-700 font-medium"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        {subjects.map(s => (
                            <option key={s || 'unknown'} value={s || 'all'}>
                                {s === 'all' ? 'Alle fag' : (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Ukjent')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredPeople.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <User className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 text-lg">Ingen personer matchet søket ditt.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredPeople.map((person) => (
                            <motion.div
                                key={person.term}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200 hover:border-orange-200 transition-all flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                                        <User size={24} strokeWidth={2.5} />
                                    </div>
                                    {person.subject && (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-full">
                                            {person.subject}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                    {person.term}
                                </h3>
                                {person.lifespan && (
                                    <div className="text-sm font-semibold text-slate-400 mb-3 bg-slate-50 inline-block py-0.5 px-2 rounded-lg">
                                        {person.lifespan}
                                    </div>
                                )}
                                <p className="text-slate-600 leading-relaxed mb-6 flex-1">
                                    {person.definition}
                                </p>

                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex flex-wrap gap-2">
                                        {person.tags?.map(tag => (
                                            <span key={tag} className="text-[10px] font-bold text-slate-400 uppercase">#{tag}</span>
                                        ))}
                                    </div>
                                    {person.link ? (
                                        <Link
                                            to={person.link}
                                            className="text-orange-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                                        >
                                            Lær mer <ArrowRight size={16} />
                                        </Link>
                                    ) : (
                                        <div className="text-slate-300 font-bold text-sm flex items-center gap-1 cursor-default">
                                            Lær mer <ArrowRight size={16} />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <footer className="mt-24 py-12 border-t border-slate-200 text-center">
                <Link
                    to="/oving/flashcards"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-full font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                    <BookOpen size={20} />
                    <span>Se alle fagbegreper</span>
                </Link>
            </footer>
        </div>
    );
};
