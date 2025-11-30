import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchManifest } from '../utils/contentLoader';
import { textLibraryData } from '../data/textLibraryData';
import type { Manifest, ManifestLesson } from '../types';
import { Search, X } from 'lucide-react';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SearchResult {
    type: 'lesson' | 'topic' | 'concept' | 'library';
    title: string;
    path: string;
    description?: string;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [manifest, setManifest] = useState<Manifest | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchManifest().then(setManifest);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }

        // Keyboard shortcut to close
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!query.trim() || !manifest) {
            setResults([]);
            return;
        }

        const searchResults: SearchResult[] = [];
        const lowerQuery = query.toLowerCase();

        // Search Manifest (Subjects, Topics, Lessons)
        manifest.subjects.forEach(subject => {
            subject.topics.forEach(topic => {
                // Search Topics
                if (topic.title.toLowerCase().includes(lowerQuery)) {
                    searchResults.push({
                        type: 'topic',
                        title: topic.title,
                        path: `/${subject.id}`,
                        description: `Emne i ${subject.title}`
                    });
                }

                const processLesson = (lesson: ManifestLesson, path: string) => {
                    if (lesson.title.toLowerCase().includes(lowerQuery) ||
                        lesson.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
                        searchResults.push({
                            type: 'lesson',
                            title: lesson.title,
                            path: path,
                            description: `Leksjon i ${topic.title}`
                        });
                    }
                };

                if (topic.subTopics) {
                    topic.subTopics.forEach(subTopic => {
                        subTopic.lessons.forEach(lesson => {
                            processLesson(lesson, `/${subject.id}/${topic.id}/${subTopic.id}/${lesson.id}`);
                        });
                    });
                } else if (topic.lessons) {
                    topic.lessons.forEach(lesson => {
                        processLesson(lesson, `/${subject.id}/${topic.id}/${lesson.id}`);
                    });
                }
            });
        });

        // Search Text Library
        textLibraryData.forEach(text => {
            if (
                text.title.toLowerCase().includes(lowerQuery) ||
                text.author.toLowerCase().includes(lowerQuery) ||
                text.genre.toLowerCase().includes(lowerQuery) ||
                text.theme?.some(t => t.toLowerCase().includes(lowerQuery))
            ) {
                searchResults.push({
                    type: 'library',
                    title: text.title,
                    path: `/norsk/bibliotek/${text.id}`,
                    description: `Av ${text.author} • ${text.genre}`
                });
            }
        });

        setResults(searchResults);
    }, [query, manifest]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex flex-col items-center pt-[10vh]"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="w-full max-w-2xl px-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="relative mb-8">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Søk etter begreper, leksjoner, tekster..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className="w-full pl-14 pr-4 py-4 text-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-display"
                            />
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {results.map((result, index) => (
                                <Link
                                    key={index}
                                    to={result.path}
                                    onClick={onClose}
                                    className="block no-underline"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex justify-between items-center transition-all group"
                                    >
                                        <div>
                                            <div className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                                                {result.title}
                                            </div>
                                            <div className="text-sm text-slate-400">
                                                {result.description}
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/10 text-slate-300">
                                            {result.type === 'library' ? 'bibliotek' : result.type}
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                            {query && results.length === 0 && (
                                <div className="text-center text-slate-400 py-8">
                                    Ingen resultater funnet for "{query}"
                                </div>
                            )}
                            {!query && (
                                <div className="text-center text-slate-500 py-8 text-sm">
                                    Skriv for å søke...
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
