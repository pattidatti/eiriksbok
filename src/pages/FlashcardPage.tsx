import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useConcepts } from '../hooks/useConcepts';
import type { ConceptItem } from '../hooks/useConcepts';
import { Link } from 'react-router-dom';
import { Filter, Search, RotateCw, ArrowRight } from 'lucide-react';

export const FlashcardPage: React.FC = () => {
    const concepts = useConcepts();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');
    const [selectedTopic, setSelectedTopic] = useState<string | 'all'>('all');

    // Get unique subjects for filter
    const subjects = useMemo(() => {
        const unique = new Set(concepts.map(c => c.subjectId).filter(Boolean));
        return Array.from(unique);
    }, [concepts]);

    // Get unique topics for selected subject
    const topics = useMemo(() => {
        const filteredBySubject = selectedSubject === 'all'
            ? concepts
            : concepts.filter(c => c.subjectId === selectedSubject);
        const unique = new Set(filteredBySubject.map(c => c.topicId).filter(Boolean));
        return Array.from(unique);
    }, [concepts, selectedSubject]);

    // Reset topic when subject changes
    useEffect(() => {
        setSelectedTopic('all');
    }, [selectedSubject]);

    const filteredConcepts = useMemo(() => {
        return concepts.filter(concept => {
            const matchesSearch = concept.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                concept.definition.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSubject = selectedSubject === 'all' || concept.subjectId === selectedSubject;
            const matchesTopic = selectedTopic === 'all' || concept.topicId === selectedTopic;
            return matchesSearch && matchesSubject && matchesTopic;
        });
    }, [concepts, searchTerm, selectedSubject, selectedTopic]);

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900">
                        Fagbegreper
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Øv på viktige begreper fra alle emnene dine.
                    </p>
                </div>

                {/* Controls */}
                <div className="mb-8 flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    {/* Search */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Søk i begreper..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Subject Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <Filter className="w-5 h-5 text-slate-400 shrink-0" />
                            <span className="text-sm text-slate-500 font-medium mr-2">Fag:</span>
                            <button
                                onClick={() => setSelectedSubject('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedSubject === 'all'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                Alle
                            </button>
                            {subjects.map(subject => (
                                <button
                                    key={subject}
                                    onClick={() => setSelectedSubject(subject as string)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${selectedSubject === subject
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {subject}
                                </button>
                            ))}
                        </div>

                        {/* Topic Filter (only show if subject selected or topics available) */}
                        {topics.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-4">
                                <span className="text-sm text-slate-500 font-medium mr-2">Emne:</span>
                                <button
                                    onClick={() => setSelectedTopic('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedTopic === 'all'
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    Alle
                                </button>
                                {topics.map(topic => (
                                    <button
                                        key={topic}
                                        onClick={() => setSelectedTopic(topic as string)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${selectedTopic === topic
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {filteredConcepts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredConcepts.map((concept) => (
                            <Flashcard key={concept.id} concept={concept} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-500">
                        Ingen begreper funnet. Prøv å endre søket eller filteret.
                    </div>
                )}
            </div>
        </div>
    );
};

const Flashcard: React.FC<{ concept: ConceptItem }> = ({ concept }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className="h-56 perspective-1000 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d]"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
            >
                {/* Front */}
                <div className="absolute inset-0 [backface-visibility:hidden]">
                    <div className="h-full w-full bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-4">
                            {concept.subjectId} • {concept.topicId}
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2 leading-tight">
                            {concept.term}
                        </h3>
                        <div className="mt-auto pt-2 flex items-center gap-1.5 text-slate-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                            <RotateCw className="w-3 h-3" />
                            <span>Klikk for definisjon</span>
                        </div>
                    </div>
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
                >
                    <div className="h-full w-full bg-indigo-900 border border-indigo-500/50 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>

                        <div className="relative z-10 flex flex-col h-full w-full">
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-sm text-white leading-relaxed font-medium line-clamp-4">
                                    {concept.definition}
                                </p>
                            </div>

                            {concept.lessonId && (
                                <Link
                                    to={`/${concept.subjectId}/${concept.topicId}/${concept.lessonId}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-indigo-500/25 transform hover:-translate-y-0.5"
                                >
                                    <span>Les mer om dette</span>
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
