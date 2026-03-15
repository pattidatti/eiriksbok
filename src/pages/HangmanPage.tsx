import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HangmanGame } from '../components/games/Hangman/HangmanGame';

// Types
type Manifest = {
    subjects: {
        id: string;
        title: string;
        topics?: { id: string; title: string }[];
    }[];
};

type Concept = {
    id?: string;
    term: string;
    definition: string;
    subject?: string;
    topic?: string;
};

export const HangmanPage = () => {
    const [manifest, setManifest] = useState<Manifest | null>(null);
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/content/manifest.json').then(res => res.json()),
            fetch('/data/glossary.json').then(res => res.json())
        ]).then(([manifestData, glossaryData]) => {
            setManifest(manifestData);
            const validWords: Concept[] = glossaryData
                .map((entry: Record<string, unknown>) => ({
                    ...entry,
                    definition: (entry.definition || entry.description || '') as string,
                }))
                .filter((entry: Concept) =>
                    entry.definition &&
                    /^[a-zA-ZæøåÆØÅ \-:,]+$/.test(entry.term)
                );
            setConcepts(validWords);
        }).catch(err => console.error("Failed to load game data:", err));
    }, []);

    const filteredWords = selectedSubject
        ? concepts.filter(c => c.subject === selectedSubject)
        : concepts;

    // Filter out subjects that have no concepts
    const availableSubjects = manifest?.subjects.filter(subject =>
        concepts.some(c => c.subject === subject.id)
    ) || [];

    if (!manifest) {
        return <div className="min-h-screen flex items-center justify-center">Laster spilldata...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Hengemann
                    </h1>
                    <p className="text-xl text-slate-600">
                        Gjett fagbegrepene før det er for sent!
                    </p>
                </header>

                {!isPlaying ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {/* Option to play with ALL words */}
                        <button
                            onClick={() => {
                                setSelectedSubject(null);
                                setIsPlaying(true);
                            }}
                            className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all text-left group"
                        >
                            <h3 className="text-2xl font-bold mb-2">Alle fag</h3>
                            <p className="opacity-90 group-hover:opacity-100">Blandede drops fra hele pensum. ({concepts.length} ord)</p>
                        </button>

                        {availableSubjects.map(subject => {
                            const count = concepts.filter(c => c.subject === subject.id).length;
                            return (
                                <button
                                    key={subject.id}
                                    onClick={() => {
                                        setSelectedSubject(subject.id);
                                        setIsPlaying(true);
                                    }}
                                    className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl border border-slate-200 transform hover:-translate-y-1 transition-all text-left"
                                >
                                    <h3 className="text-2xl font-bold mb-2 text-slate-800 capitalize">{subject.title}</h3>
                                    <p className="text-slate-500">{count} ord</p>
                                </button>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <HangmanGame
                            words={filteredWords}
                            onExit={() => setIsPlaying(false)}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HangmanPage;
