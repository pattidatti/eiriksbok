import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useConcepts } from '../hooks/useConcepts';
import type { ConceptItem } from '../hooks/useConcepts';
import { Link } from 'react-router-dom';
import { Filter, Search, RotateCw, ArrowRight } from 'lucide-react';

export const FlashcardPage: React.FC = () => {
    const concepts = useConcepts();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');

    // Get unique subjects for filter
    const subjects = useMemo(() => {
        const unique = new Set(concepts.map(c => c.subjectId).filter(Boolean));
        return Array.from(unique);
    }, [concepts]);

    const filteredConcepts = useMemo(() => {
        return concepts.filter(concept => {
            const matchesSearch = concept.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                concept.definition.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSubject = selectedSubject === 'all' || concept.subjectId === selectedSubject;
            return matchesSearch && matchesSubject;
        });
    }, [concepts, searchTerm, selectedSubject]);

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">
                        Fagbegreper
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Øv på viktige begreper fra alle emnene dine.
                    </p>
                </div>

                {/* Controls */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Søk i begreper..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Filter className="w-5 h-5 text-slate-400 shrink-0" />
                        <button
                            onClick={() => setSelectedSubject('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedSubject === 'all'
                                ? 'bg-white/20 text-white'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            Alle fag
                        </button>
                        {subjects.map(subject => (
                            <button
                                key={subject}
                                onClick={() => setSelectedSubject(subject as string)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${selectedSubject === subject
                                    ? 'bg-white/20 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                {subject}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {filteredConcepts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            className="h-48 perspective-1000 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d]"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
            >
                {/* Front */}
                <div className="absolute inset-0 [backface-visibility:hidden]">
                    <div className="h-full w-full bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
                        <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">
                            {concept.subjectId}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {concept.term}
                        </h3>
                        <div className="mt-auto pt-2 flex items-center gap-2 text-slate-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            <RotateCw className="w-3 h-3" />
                            <span>Klikk for definisjon</span>
                        </div>
                    </div>
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
                >
                    <div className="h-full w-full bg-indigo-900 border border-indigo-500/50 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
                        <p className="text-base text-white mb-4 leading-relaxed line-clamp-4 font-medium">
                            {concept.definition}
                        </p>

                        {concept.lessonId && (
                            <Link
                                to={`/${concept.subjectId}/${concept.topicId}/${concept.lessonId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors mt-auto shadow-sm"
                            >
                                <span>Gå til leksjon</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
