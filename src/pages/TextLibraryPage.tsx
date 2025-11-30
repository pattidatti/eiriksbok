import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen, Tag, User } from 'lucide-react';
import { textLibraryData } from '../data/textLibraryData';
import { usePageTitle } from '../hooks/usePageTitle';

export const TextLibraryPage: React.FC = () => {
    usePageTitle('Tekstbibliotek');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

    const genres = useMemo(() => Array.from(new Set(textLibraryData.map(t => t.genre))), []);
    const themes = useMemo(() => Array.from(new Set(textLibraryData.map(t => t.theme).filter(Boolean) as string[])), []);

    const filteredTexts = useMemo(() => {
        return textLibraryData.filter(text => {
            const matchesSearch = text.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                text.author.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGenre = selectedGenre ? text.genre === selectedGenre : true;
            const matchesTheme = selectedTheme ? text.theme === selectedTheme : true;

            return matchesSearch && matchesGenre && matchesTheme;
        });
    }, [searchTerm, selectedGenre, selectedTheme]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="mb-12">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">Tekstbibliotek</h1>
                <p className="text-xl text-slate-600 max-w-3xl">
                    Utforsk et utvalg av noveller, romanutdrag og andre tekster til bruk i norskfaget.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
                            <Filter size={20} />
                            <h2>Filter</h2>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Søk etter tittel eller forfatter..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Genre Filter */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Sjanger</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedGenre(null)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedGenre ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    Alle sjangre
                                </button>
                                {genres.map(genre => (
                                    <button
                                        key={genre}
                                        onClick={() => setSelectedGenre(genre)}
                                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedGenre === genre ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme Filter */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Tema</h3>
                            <div className="flex flex-wrap gap-2">
                                {themes.map(theme => (
                                    <button
                                        key={theme}
                                        onClick={() => setSelectedTheme(selectedTheme === theme ? null : theme)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${selectedTheme === theme ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                    >
                                        {theme}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Content Grid */}
                <main className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredTexts.map((text) => (
                            <motion.div
                                key={text.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
                                        {text.genre}
                                    </span>
                                    {text.language && (
                                        <span className="text-xs text-slate-400 font-mono border border-slate-100 px-2 py-0.5 rounded">
                                            {text.language}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {text.title}
                                </h3>
                                <div className="flex items-center gap-2 text-slate-600 mb-4 text-sm">
                                    <User size={16} />
                                    <span>{text.author}</span>
                                </div>
                                {text.theme && (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm pt-4 border-t border-slate-50">
                                        <Tag size={14} />
                                        <span>Tema: {text.theme}</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {filteredTexts.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                            <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500 font-medium">Ingen tekster funnet med valgte filter.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedGenre(null); setSelectedTheme(null); }}
                                className="mt-4 text-indigo-600 hover:underline text-sm"
                            >
                                Nullstill filter
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
