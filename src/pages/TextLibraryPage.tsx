import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen, Tag } from 'lucide-react';
import { textLibraryData } from '../data/textLibraryData';
import { usePageTitle } from '../hooks/usePageTitle';

export const TextLibraryPage: React.FC = () => {
    usePageTitle('Bibliotek');

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const searchTerm = searchParams.get('search') || '';
    const selectedGenre = searchParams.get('genre');
    const selectedTheme = searchParams.get('theme');
    const selectedPeriod = searchParams.get('period');

    const updateFilter = (key: string, value: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    const genres = useMemo(() => Array.from(new Set(textLibraryData.map(t => t.genre))), []);
    const themes = useMemo(() => Array.from(new Set(textLibraryData.flatMap(t => t.theme || []))), []);

    const periods = [
        { label: 'Før 1900', filter: (year: number) => year < 1900 },
        { label: '1900 - 1950', filter: (year: number) => year >= 1900 && year <= 1950 },
        { label: '1950 - 2000', filter: (year: number) => year > 1950 && year <= 2000 },
        { label: 'Etter 2000', filter: (year: number) => year > 2000 }
    ];

    const filteredTexts = useMemo(() => {
        return textLibraryData.filter(text => {
            const matchesSearch = text.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                text.author.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGenre = selectedGenre ? text.genre === selectedGenre : true;
            const matchesTheme = selectedTheme ? text.theme?.includes(selectedTheme) : true;

            let matchesPeriod = true;
            if (selectedPeriod) {
                const period = periods.find(p => p.label === selectedPeriod);
                if (period && text.publishedYear) {
                    matchesPeriod = period.filter(text.publishedYear);
                } else if (period && !text.publishedYear) {
                    matchesPeriod = false;
                }
            }

            return matchesSearch && matchesGenre && matchesTheme && matchesPeriod;
        });
    }, [searchTerm, selectedGenre, selectedTheme, selectedPeriod]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="mb-12">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">Bibliotek</h1>
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
                                    onChange={(e) => updateFilter('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Genre Filter */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Sjanger</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => updateFilter('genre', null)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedGenre ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    Alle sjangre
                                </button>
                                {genres.map(genre => (
                                    <button
                                        key={genre}
                                        onClick={() => updateFilter('genre', genre)}
                                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedGenre === genre ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Period Filter */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Periode</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => updateFilter('period', null)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedPeriod ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    Alle perioder
                                </button>
                                {periods.map(period => (
                                    <button
                                        key={period.label}
                                        onClick={() => updateFilter('period', period.label)}
                                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedPeriod === period.label ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {period.label}
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
                                        onClick={() => updateFilter('theme', selectedTheme === theme ? null : theme)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${selectedTheme === theme ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                    >
                                        {theme}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-3">
                    {filteredTexts.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                            <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500 font-medium">Ingen tekster funnet med valgte filter.</p>
                            <button
                                onClick={() => setSearchParams({})}
                                className="mt-4 text-indigo-600 hover:underline text-sm"
                            >
                                Nullstill filter
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredTexts.map(text => (
                            <motion.div
                                key={text.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                            >
                                <div className="p-6 flex-grow">
                                    <h3
                                        onClick={() => navigate(`/norsk/bibliotek/${text.id}`)}
                                        className="text-xl font-semibold text-slate-900 mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                                    >
                                        {text.title}
                                    </h3>
                                    <p
                                        onClick={() => updateFilter('search', text.author)}
                                        className="text-slate-600 text-sm mb-4 cursor-pointer hover:text-indigo-600 transition-colors inline-block"
                                    >
                                        Av {text.author}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateFilter('genre', text.genre); }}
                                            className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                                        >
                                            <Tag className="mr-1" size={12} /> {text.genre}
                                        </button>
                                        {text.theme && text.theme.map(t => (
                                            <button
                                                key={t}
                                                onClick={(e) => { e.stopPropagation(); updateFilter('theme', t); }}
                                                className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                                            >
                                                <BookOpen className="mr-1" size={12} /> {t}
                                            </button>
                                        ))}
                                        {text.publishedYear && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const period = periods.find(p => p.filter(text.publishedYear!));
                                                    if (period) updateFilter('period', period.label);
                                                }}
                                                className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                                            >
                                                {text.publishedYear}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};
