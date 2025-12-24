import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Compass,
    BookOpen,
    MessageCircle,
    Network,
    Zap,
    ChevronRight,
    Search,
    BrainCircuit
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchManifest } from '../utils/contentLoader';
import { PageSkeleton } from '../components/Skeleton';

// Types for the Odyssey
interface OdysseyNode {
    id: string;
    title: string;
    description: string;
    image: string;
    type: 'lesson' | 'topic' | 'tool';
    status: 'unlocked' | 'locked' | 'completed';
}

export const PhilosophyOdysseyPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'quest' | 'network' | 'profile'>('quest');

    const { data: manifest, isLoading } = useQuery({
        queryKey: ['manifest'],
        queryFn: fetchManifest
    });

    if (isLoading) return <PageSkeleton />;

    const philosophyTopic = manifest?.subjects
        .find(s => s.id === 'krle')
        ?.topics.find(t => t.id === 'filosofi');

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200 selection:bg-indigo-500/30">
            {/* Immersive Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(99,102,241,0.1),_transparent_50%)]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Compass className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold text-white tracking-tight">Den Filosofiske Odysséen</h1>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Eiriksbok / KRLE</p>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
                        {['quest', 'network', 'profile'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab as any)}
                                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedTab === tab
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                            <Search size={20} />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-indigo-400">
                            EA
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    {selectedTab === 'quest' && (
                        <motion.div
                            key="quest"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            {/* Hero / Mentor Section */}
                            <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900 to-black p-8 md:p-12">
                                <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 overflow-hidden">
                                    <img src="/images/filosofi/sokrates_hero.png" alt="Sokrates" className="object-cover h-full" />
                                </div>
                                <div className="relative z-10 max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                                        <Zap size={12} />
                                        Neste steg i din reise
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                                        Hva er egentlig <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">sannhet</span>?
                                    </h2>
                                    <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                        "Det jeg vet, er at jeg intet vet." Sokrates venter på deg i Athen. Klarer du å utfordre hans logikk?
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <Link
                                            to="/krle/filosofi/sokrates"
                                            className="px-8 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                                        >
                                            Fortsett Reiser <ChevronRight size={18} />
                                        </Link>
                                        <button className="px-8 py-3 rounded-xl bg-white/5 text-white font-bold border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
                                            <MessageCircle size={18} /> Snakk med Sokrates
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Learning Path Grid */}
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-display font-bold text-white">Din Læringssti</h3>
                                    <Link to="/krle/filosofi" className="text-sm text-indigo-400 hover:underline">Se alle temaer</Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {philosophyTopic?.lessons.slice(0, 6).map((lesson, idx) => (
                                        <motion.div
                                            key={lesson.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group relative rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:bg-white/[0.05] transition-all duration-300"
                                        >
                                            <div className="aspect-video relative overflow-hidden">
                                                <img
                                                    src={lesson.image || `/images/filosofi/${lesson.id}_hero.png`}
                                                    alt={lesson.title}
                                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 opacity-60"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                                            </div>
                                            <div className="p-6">
                                                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                                                    {lesson.title}
                                                </h4>
                                                <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                                                    {lesson.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-2">
                                                        {lesson.tags?.slice(0, 2).map(tag => (
                                                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 capitalize">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <Link to={`/krle/filosofi/${lesson.id}`} className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ChevronRight size={18} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {selectedTab === 'network' && (
                        <motion.div
                            key="network"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-[600px] rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
                                <Network className="text-indigo-400" size={40} />
                            </div>
                            <h3 className="text-3xl font-display font-bold text-white mb-4">Den Store Samtalen</h3>
                            <p className="text-slate-400 max-w-lg mb-8">
                                Visualiser hvordan ideer har formet verden. Se koblingene mellom Platon, Kant og moderne eksistensialisme i et interaktivt stjernekart.
                            </p>
                            <button className="px-8 py-3 rounded-xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                                Åpne Idé-Nettverket
                            </button>
                        </motion.div>
                    )}

                    {selectedTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            <div className="lg:col-span-1 space-y-6">
                                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-6 p-1">
                                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                                            <BrainCircuit size={48} className="text-indigo-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-white mb-1">Utforskeren</h3>
                                    <p className="text-indigo-400 text-sm font-medium mb-6 uppercase tracking-widest">Nivå 4 / Stoisk Tendens</p>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-8">
                                        <div className="w-[65%] h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-1">Artikler</p>
                                            <p className="font-bold text-white">12</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-1">Dilemmaer</p>
                                            <p className="font-bold text-white">8/10</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-1">Medaljer</p>
                                            <p className="font-bold text-white">3</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-6">
                                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
                                    <h3 className="text-xl font-bold text-white mb-6">Din Moralske Kompass</h3>
                                    <div className="aspect-[2/1] bg-white/[0.02] rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-slate-500 italic">
                                        Fullfør dilemmaene i artiklene for å se din profil her.
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
