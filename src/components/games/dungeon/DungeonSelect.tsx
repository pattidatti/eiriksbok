import React, { useMemo, useState } from 'react';
import { useManifest } from '../../../hooks/useManifest';
import { motion } from 'framer-motion';
import { Loader2, Sword, Book } from 'lucide-react';

interface DungeonSelectProps {
    onSelect: (subject: string, topic: string) => void;
}

export const DungeonSelect: React.FC<DungeonSelectProps> = ({ onSelect }) => {
    const { data: manifest, isLoading } = useManifest();
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    // Extract subjects
    const subjects = useMemo(() => {
        if (!manifest) return [];
        return manifest.subjects;
    }, [manifest]);

    // Extract topics for selected subject
    const topics = useMemo(() => {
        if (!selectedSubject || !manifest) return [];
        const subject = manifest.subjects.find(s => s.id === selectedSubject);
        if (!subject) return [];

        // Flatten structure: Topics + Subtopics
        // For simplicity in Game, we might just target Top-Level Topics for now, 
        // or allow drilling down. Let's stick to Top Level Topics to ensure enough questions.
        return subject.topics;

    }, [manifest, selectedSubject]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto w-full px-4 pt-24 pb-12 flex flex-col items-center">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="inline-block p-4 rounded-full bg-slate-800 mb-6 shadow-2xl shadow-indigo-500/20 border border-slate-700">
                    <Sword className="w-12 h-12 text-indigo-400" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 tracking-tight">
                    Dungeon Run
                </h1>
                <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Velg din arena. Bekjemp monstre med kunnskap.
                    <br />
                    <span className="text-indigo-400 font-bold">Overlev så lenge du kan.</span>
                </p>
            </motion.div>

            {!selectedSubject ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {subjects.map((subject, i) => (
                        <motion.button
                            key={subject.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setSelectedSubject(subject.id)}
                            className="group relative h-48 bg-slate-800 rounded-2xl border border-slate-700 p-8 flex flex-col items-center justify-center gap-4 hover:border-indigo-500 hover:bg-slate-750 transition-all hover:-translate-y-1 shadow-lg"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
                            <Book className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                            <span className="text-xl font-bold text-slate-200 group-hover:text-white capitalize">{subject.id}</span>
                        </motion.button>
                    ))}
                </div>
            ) : (
                <div className="w-full">
                    <button
                        onClick={() => setSelectedSubject(null)}
                        className="mb-8 text-sm text-slate-500 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        ← Velg et annet fag
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => onSelect(selectedSubject, 'all')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-6 rounded-xl font-bold text-left flex items-center justify-between group shadow-lg shadow-indigo-900/50"
                        >
                            <span>Blandede spørsmål (Alle emner)</span>
                            <Sword className="w-5 h-5 opacity-50 group-hover:rotate-45 transition-transform" />
                        </motion.button>

                        {topics.map((topic, i) => (
                            <motion.button
                                key={topic.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => onSelect(selectedSubject, topic.id)}
                                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-200 p-6 rounded-xl font-medium text-left transition-all"
                            >
                                {topic.title}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};
