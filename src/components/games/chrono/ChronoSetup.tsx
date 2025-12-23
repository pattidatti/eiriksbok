import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Play, Check, BookOpen, Layers } from 'lucide-react';

export interface ChronoFilterOptions {
    subjects: string[];
    topics: string[];
    yearRange: [number, number];
    difficulty: 'easy' | 'medium' | 'hard';
}

interface ChronoSetupProps {
    availableSubjects: string[];
    availableTopics: string[];
    minYear: number;
    maxYear: number;
    onStart: (options: ChronoFilterOptions) => void;
}

export const ChronoSetup: React.FC<ChronoSetupProps> = ({
    availableSubjects,
    availableTopics,
    minYear,
    maxYear,
    onStart
}) => {
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [yearRange] = useState<[number, number]>([minYear, maxYear]);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [highscore, setHighscore] = useState(0);

    // Load Highscore
    React.useEffect(() => {
        const saved = localStorage.getItem('chrono_highscore');
        if (saved) setHighscore(parseInt(saved, 10));
    }, []);

    const toggleSubject = (subject: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subject)
                ? prev.filter(s => s !== subject)
                : [...prev, subject]
        );
    };

    const toggleTopic = (topic: string) => {
        setSelectedTopics(prev =>
            prev.includes(topic)
                ? prev.filter(t => t !== topic)
                : [...prev, topic]
        );
    };

    const handleStart = () => {
        onStart({
            subjects: selectedSubjects,
            topics: selectedTopics,
            yearRange,
            difficulty
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-4 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
            >
                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black mb-1 flex items-center gap-3">
                            <Filter className="w-6 h-6" />
                            Gjør klar tidslinjen
                        </h2>
                        <p className="text-indigo-100 text-sm opacity-90">
                            Velg fag og vanskelighetsgrad for å starte.
                        </p>
                    </div>
                    {highscore > 0 && (
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-200">Din rekord</span>
                            <span className="text-2xl font-black">{highscore}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-8">
                    {/* Subjects */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            Velg fag
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {availableSubjects.map(subject => (
                                <button
                                    key={subject}
                                    onClick={() => toggleSubject(subject)}
                                    className={`
                                        px-4 py-2 rounded-full border-2 transition-all font-medium flex items-center gap-2
                                        ${selectedSubjects.includes(subject)
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'}
                                    `}
                                >
                                    {selectedSubjects.includes(subject) && <Check className="w-4 h-4" />}
                                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                                </button>
                            ))}
                            {availableSubjects.length === 0 && (
                                <p className="text-slate-400 italic">Ingen fag tilgjengelig</p>
                            )}
                        </div>
                    </section>

                    {/* Topics (Filtered by subjects optionally, but showing all for now if no subjects selected) */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-500" />
                            Velg emner (valgfritt)
                        </h3>
                        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 custom-scrollbar">
                            {availableTopics.map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => toggleTopic(topic)}
                                    className={`
                                        px-2.5 py-1 rounded-lg text-xs transition-all border
                                        ${selectedTopics.includes(topic)
                                            ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold'
                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}
                                    `}
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Difficulty */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-500" />
                            Vanskelighetsgrad
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {(['easy', 'medium', 'hard'] as const).map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => setDifficulty(lvl)}
                                    className={`
                                        p-3 rounded-xl border-2 transition-all text-center
                                        ${difficulty === lvl
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                            : 'border-slate-100 text-slate-500 hover:border-slate-200'}
                                    `}
                                >
                                    <span className="block font-black uppercase tracking-wider text-[10px]">
                                        {lvl === 'easy' ? 'Lett' : lvl === 'medium' ? 'Normal' : 'Ekspert'}
                                    </span>
                                    <span className="text-[9px] opacity-80 leading-tight">
                                        {lvl === 'easy' ? 'Full tekst' : lvl === 'medium' ? 'Noe tekst' : 'Kun tittel'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Start Button */}
                    <div className="pt-2">
                        <button
                            onClick={handleStart}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            START SPILLET
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
