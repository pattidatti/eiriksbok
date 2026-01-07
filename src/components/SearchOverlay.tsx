import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useManifest } from '../hooks/useManifest';
import type { ManifestLesson } from '../types';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { textLibraryData } from '../data/textLibraryData';
import Fuse from 'fuse.js';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SearchResult {
    type: 'lesson' | 'topic' | 'concept' | 'library';
    title: string;
    path: string;
    description?: string;
    tags?: string[];
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const { data: manifest } = useManifest();

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!manifest) {
            setResults([]);
            return;
        }

        const allItems: SearchResult[] = [];

        // Collect all searchable items

        // 1. Manifest Content
        manifest.subjects.forEach((subject: any) => {
            subject.topics.forEach((topic: any) => {
                // Add Topic
                allItems.push({
                    type: 'topic',
                    title: topic.title,
                    path: `/${subject.id}`,
                    description: `Emne i ${subject.title}`,
                    tags: []
                });

                const processLesson = (lesson: ManifestLesson, path: string, contextTitle: string) => {
                    // List of generic titles that need context
                    const genericTitles = [
                        'Bønn', 'Sentrale trekk', 'Introduksjon', 'Overgangsriter',
                        'Gudsbilde', 'Frelse', 'Hellige tekster', 'Grunnleggere',
                        'Etikk', 'Arkitektur', 'Kunst', 'Bakgrunn'
                    ];

                    // Check if title is generic or contains generic terms like "Bønn" but isn't specific enough
                    // e.g. "Bønn (Puja)" is specific enough? Maybe not for a global search.
                    // Let's stick to the list for now, but also check for exact match of "Bønn"
                    const shouldAppendContext = genericTitles.includes(lesson.title) ||
                        (lesson.title.startsWith('Bønn') && lesson.title.length < 20);

                    const displayTitle = shouldAppendContext
                        ? `${lesson.title} - ${contextTitle}`
                        : lesson.title;

                    allItems.push({
                        type: 'lesson',
                        title: displayTitle,
                        path: path,
                        description: lesson.description || `Leksjon i ${contextTitle}`,
                        tags: lesson.tags || []
                    });
                };

                if (topic.subTopics) {
                    topic.subTopics.forEach((subTopic: any) => {
                        subTopic.lessons.forEach((lesson: any) => {
                            processLesson(lesson, `/${subject.id}/${topic.id}/${subTopic.id}/${lesson.id}`, subTopic.title);
                        });
                    });
                } else if (topic.lessons) {
                    topic.lessons.forEach((lesson: any) => {
                        processLesson(lesson, `/${subject.id}/${topic.id}/${lesson.id}`, topic.title);
                    });
                }
            });
        });

        // 2. Library Texts
        textLibraryData.forEach(text => {
            const tags = [text.genre, ...(text.theme || []), text.author];
            allItems.push({
                type: 'library',
                title: text.title,
                path: `/norsk/bibliotek/${text.id}`,
                description: `Av ${text.author}`,
                tags: tags.filter(Boolean) as string[]
            });
        });

        if (!query.trim()) {
            setResults([]);
            return;
        }

        // Configure Fuse
        const fuse = new Fuse(allItems, {
            keys: [
                { name: 'title', weight: 0.7 },
                { name: 'tags', weight: 0.5 },
                { name: 'description', weight: 0.3 }
            ],
            threshold: 0.3, // 0.0 = perfect match, 1.0 = match anything
            includeScore: true
        });

        const searchResults = fuse.search(query);
        setResults(searchResults.map(result => result.item).slice(0, 50)); // Limit to 50 results

        // Log search to Firebase (Debounced)
        const logTimer = setTimeout(() => {
            if (query.length > 2) { // Only log if length > 2
                import('../lib/firebase').then(({ db }) => {
                    import('firebase/database').then(({ ref, push, serverTimestamp }) => {
                        const searchRef = ref(db, 'analytics/searches');
                        push(searchRef, {
                            query: query,
                            type: 'text',
                            timestamp: serverTimestamp(),
                            resultsCount: searchResults.length
                        });
                    });
                });
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(logTimer);

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
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                                                {result.title}
                                            </div>
                                            <div className="text-sm text-slate-400 truncate">
                                                {result.description}
                                            </div>
                                            {result.tags && result.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {result.tags.slice(0, 3).map((tag, i) => (
                                                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {result.tags.length > 3 && (
                                                        <span className="text-xs px-2 py-0.5 text-slate-500">
                                                            +{result.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/10 text-slate-300 whitespace-nowrap">
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
                </motion.div >
            )}
        </AnimatePresence >
    );
};
