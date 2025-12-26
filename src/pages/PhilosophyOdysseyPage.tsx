import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Compass,
    MessageCircle,
    Zap,
    Search,
    BrainCircuit,
    ArrowRight,
    Star,
    GraduationCap,
    Lightbulb
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchManifest } from '../utils/contentLoader';
import { PageSkeleton } from '../components/Skeleton';
import { usePhilosophyProfile } from '../hooks/usePhilosophyProfile';
import { PhilosophicalQuestEngine } from '../components/content/interactive/philosophy/PhilosophicalQuestEngine';
import type { PhilosophyQuest } from '../data/philosophy/types';
import { Stjernekart } from '../components/content/interactive/philosophy/Stjernekart';
import { QUEST_REGISTRY } from '../data/philosophy/questRegistry';
import { QuestList } from '../components/content/interactive/philosophy/QuestList';

export const PhilosophyOdysseyPage: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<'quest' | 'network' | 'profile'>('quest');
    const [scrolled, setScrolled] = useState(false);

    // VISUAL STATE: This triggers the full-screen quest UI
    const [activeQuest, setActiveQuest] = useState<PhilosophyQuest | null>(null);

    // DATA FETCHING STATE: This triggers react-query to go get the JSON
    const [activeQuestId, setActiveQuestId] = useState<string | null>(null);

    const { profile, isLoaded: profileLoaded } = usePhilosophyProfile();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const { data: manifest, isLoading: manifestLoading } = useQuery({
        queryKey: ['manifest'],
        queryFn: fetchManifest
    });

    // Dynamic Quest Loading
    const { data: fetchedQuest } = useQuery({
        queryKey: ['quest', activeQuestId],
        queryFn: async () => {
            if (!activeQuestId) return null;
            const config = Object.values(QUEST_REGISTRY).find((q: any) => q.id === activeQuestId);
            // Default to Sokrates if no specific quest found (FOR DEMO PURPOSE ONLY - should verify later)
            const path = config ? config.path : QUEST_REGISTRY['sokrates'].path;

            try {
                const res = await fetch(`/public${path}`); // Try with prefix
                if (!res.ok) {
                    // Fallback for dev environment path issues or direct access
                    const res2 = await fetch(path);
                    return res2.json() as Promise<PhilosophyQuest>;
                }
                return res.json() as Promise<PhilosophyQuest>;
            } catch (e) {
                console.error("Failed to load quest", e);
                return null;
            }
        },
        enabled: !!activeQuestId
    });

    // When quest data is received, mount the UI
    useEffect(() => {
        if (fetchedQuest) {
            setActiveQuest(fetchedQuest);
            setActiveQuestId(null);
        }
    }, [fetchedQuest]);

    if (manifestLoading || !profileLoaded) return <PageSkeleton />;

    const philosophyTopic = manifest?.subjects
        .find(s => s.id === 'krle')
        ?.topics.find(t => t.id === 'filosofi');

    const lessons = philosophyTopic?.lessons || [];

    return (
        <div className="min-h-screen bg-[#FDFDFC] text-[#1A1A1A] font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Organic Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 mix-blend-multiply opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

            {/* World-Class Header (Sticky Sub-nav) */}
            <header className={`sticky top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-3 bg-white/80 backdrop-blur-2xl border-b border-black/5 shadow-sm' : 'py-5 bg-[#FDFDFC]/90 backdrop-blur-md border-b border-black/[0.03]'
                }`}>
                <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-4 group cursor-pointer">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative w-12 h-12 rounded-[1.25rem] bg-[#1A1A1A] flex items-center justify-center overflow-hidden shadow-2xl">
                                <Compass className="text-white" size={24} />
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent"
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-display font-black tracking-tight leading-none mb-1 text-[#1A1A1A]">AKADEMIET</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Den Filosofiske Odysséen</p>
                            </div>
                        </div>
                    </Link>

                    <nav className="flex items-center bg-black/5 hover:bg-black-[0.08] backdrop-blur-md rounded-2xl p-1.5 transition-colors">
                        {(['quest', 'network', 'profile'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`relative px-8 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${selectedTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {selectedTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-[#1A1A1A] rounded-xl shadow-xl shadow-black/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{tab === 'quest' ? 'Reisen' : tab === 'network' ? 'Nettverket' : 'Profil'}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-6">
                        <button className="hidden lg:flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors">
                            <Search size={18} strokeWidth={3} />
                            <span>Utforsk</span>
                        </button>
                        <div className="w-11 h-11 rounded-2xl bg-white border border-black/5 shadow-sm flex items-center justify-center hover:scale-105 transition-transform cursor-pointer overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 text-xs font-black group-hover:text-white transition-colors">EA</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 pt-12 pb-24">
                <AnimatePresence mode="wait">
                    {activeQuest ? (
                        <motion.div
                            key="active-quest"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="py-12"
                        >
                            <PhilosophicalQuestEngine
                                quest={activeQuest}
                                mentorImage={lessons.find(l => l.id === activeQuest.id || l.title.includes(activeQuest.mentor))?.image}
                                onExit={() => setActiveQuest(null)}
                                onComplete={() => setActiveQuest(null)}
                            />
                        </motion.div>
                    ) : selectedTab === 'quest' && (
                        <motion.div
                            key="quest"
                            initial={{ opacity: 0, scale: 0.99, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.01, y: -10 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-8"
                        >
                            {/* World-Class Bento Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Hero Card: The Mentor */}
                                <section className="md:col-span-8 relative rounded-[3rem] bg-indigo-600 overflow-hidden shadow-[0_32px_64px_-16px_rgba(99,102,241,0.3)] group hover:-translate-y-1 transition-all duration-700">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-800" />
                                    <div className="absolute top-0 right-0 w-2/3 h-full overflow-hidden opacity-40 mix-blend-overlay group-hover:opacity-60 group-hover:scale-110 transition-all duration-1000">
                                        <img src="/images/filosofi/sokrates_hero.png" alt="Sokrates" className="object-cover h-full w-full object-top" />
                                    </div>
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.1),_transparent_70%)]" />

                                    <div className="relative z-10 p-12 md:p-20 h-full flex flex-col justify-center max-w-2xl">
                                        <div className="flex items-center gap-3 mb-8">
                                            <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black text-white uppercase tracking-[0.2em]">Neste Utfordring</span>
                                            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                                        </div>
                                        <h2 className="text-5xl md:text-7xl font-display font-black text-white mb-8 leading-[1] tracking-tight">
                                            Hva betyr det å <span className="italic font-serif opacity-80">leve</span> godt?
                                        </h2>
                                        <p className="text-lg md:text-xl text-white/70 mb-12 font-medium leading-relaxed max-w-lg">
                                            Sokrates har ankommet din agora. Han venter på din første tanke.
                                        </p>
                                        <div className="flex flex-wrap gap-5">
                                            <button
                                                onClick={() => setActiveQuestId('sokrates')}
                                                className="px-12 py-5 rounded-[2rem] bg-white text-indigo-600 font-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white hover:scale-105 active:scale-95 transition-all duration-500 shadow-2xl shadow-indigo-900/20"
                                            >
                                                Start Dialogen
                                            </button>
                                            <Link to="/krle/filosofi" className="group/btn px-10 py-5 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-all flex items-center gap-3">
                                                <MessageCircle size={18} strokeWidth={3} className="text-white/70 group-hover/btn:scale-110 transition-transform" />
                                                <span>Arkivet</span>
                                            </Link>
                                        </div>
                                    </div>
                                </section>

                                {/* Progress Module */}
                                <section className="md:col-span-4 rounded-[3rem] bg-white border border-black/[0.03] shadow-[0_24px_48px_rgba(0,0,0,0.02)] p-12 flex flex-col justify-between group hover:border-indigo-500/20 transition-all duration-700">
                                    <div>
                                        <div className="flex items-center justify-between mb-12">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <GraduationCap size={28} />
                                            </div>
                                            <div className="text-right font-display font-black italic text-4xl text-slate-200 group-hover:text-indigo-50 transition-colors">04</div>
                                        </div>
                                        <h3 className="text-2xl font-black mb-2">Din Framgang</h3>
                                        <p className="text-slate-400 text-sm font-medium mb-12">Du har utforsket 12% av filosofiens rike.</p>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-slate-400">Nivå {profile.level}: {profile.level < 5 ? 'Utforsker' : 'Tenker'}</span>
                                                <span className="text-indigo-600">{profile.xp % 1000} / 1000 XP</span>
                                            </div>
                                            <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(profile.xp % 1000) / 10}%` }}
                                                    transition={{ delay: 0.5, duration: 2, ease: "circOut" }}
                                                    className="absolute inset-0 bg-indigo-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTab('profile')}
                                        className="w-full mt-12 py-5 rounded-3xl bg-slate-50 border border-black/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-500 hover:text-white hover:border-transparent transition-all duration-500"
                                    >
                                        Se Full Oversikt
                                    </button>
                                </section>

                                {/* Secondary Row Bento - SOFTENED */}
                                <section
                                    onClick={() => setSelectedTab('network')}
                                    className="md:col-span-4 rounded-[3rem] bg-indigo-50 border border-indigo-100 p-12 text-[#1A1A1A] relative overflow-hidden group hover:bg-indigo-600 hover:text-white transition-all duration-700 shadow-xl shadow-indigo-100/20 cursor-pointer"
                                >
                                    <div className="absolute top-0 right-0 p-8 text-indigo-200/50 group-hover:text-white/20 group-hover:scale-125 transition-all duration-1000">
                                        <Lightbulb size={120} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-6 relative z-10">Idé-Galleriet</h3>
                                    <p className="text-slate-500 group-hover:text-white/70 text-sm font-medium leading-relaxed mb-10 relative z-10">
                                        Oppdag sammenhengene mellom tankene som har formet historien.
                                    </p>
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 group-hover:text-white transition-colors">
                                        Utforsk nettverket <ArrowRight size={16} />
                                    </div>
                                </section>

                                <section className="md:col-span-8 rounded-[3rem] bg-white border border-black/[0.03] shadow-[0_24px_48px_rgba(0,0,0,0.02)] p-12 lg:p-16">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                                        <div>
                                            <h3 className="text-3xl font-black tracking-tight">Dine Reiser</h3>
                                            <p className="text-slate-400 text-sm font-medium mt-1">Velg en vismann for å starte en dialog.</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Link to="/krle/filosofi" className="px-6 py-3 rounded-2xl border border-black/5 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                                                Biblioteket
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="-mx-6">
                                        <QuestList onSelectQuest={setActiveQuestId} />
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    )}

                    {selectedTab === 'network' && (
                        <motion.div
                            key="network"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-3xl font-black text-[#1A1A1A]">Den Store Samtalen</h3>
                                    <p className="text-slate-400 text-sm font-medium">Utforsk hvordan ideer har formet historien gjennom århundrene.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="px-5 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                                        Utforsk 10 Tenkere
                                    </div>
                                </div>
                            </div>
                            <Stjernekart onStartQuest={(id) => setActiveQuestId(id)} />
                        </motion.div>
                    )}

                    {selectedTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.6 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >
                            <div className="lg:col-span-4 space-y-8">
                                <section className="rounded-[4rem] bg-white border border-black/[0.03] p-16 shadow-[0_32px_64px_rgba(0,0,0,0.03)] text-center relative overflow-hidden group">
                                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-50 to-transparent opacity-50" />

                                    <div className="relative mb-12">
                                        <div className="w-48 h-48 rounded-full bg-slate-50 mx-auto p-1.5 border border-black/5 shadow-inner">
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center border border-indigo-100 shadow-sm relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/10" />
                                                <BrainCircuit size={80} className="text-indigo-500 relative z-10" strokeWidth={1.5} />
                                            </div>
                                        </div>
                                        <motion.div
                                            className="absolute bottom-2 right-1/4 w-12 h-12 rounded-2xl bg-indigo-500 border-4 border-white shadow-xl flex items-center justify-center text-white"
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <Star size={20} fill="currentColor" />
                                        </motion.div>
                                    </div>

                                    <h3 className="text-4xl font-display font-black mb-3">Utforskeren</h3>
                                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-50 border border-black/5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-16">
                                        <span>Medlemsnummer {Math.floor(profile.lastActive / 100000000)}</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6 pt-16 border-t border-black/5">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Quests</p>
                                            <p className="text-3xl font-display font-black">{profile.completedQuests.length}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Poeng</p>
                                            <p className="text-3xl font-display font-black">{(profile.xp / 1000).toFixed(1)}k</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Nivå</p>
                                            <p className="text-3xl font-display font-black">{profile.level}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="lg:col-span-8 space-y-8">
                                <section className="rounded-[4rem] bg-white border border-black/[0.03] p-16 shadow-[0_32px_64px_rgba(0,0,0,0.03)] relative overflow-hidden">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-8">
                                        <div>
                                            <h3 className="text-3xl font-black mb-2">Moralsk Kompass</h3>
                                            <p className="text-slate-400 text-sm font-medium">Beregnet ut fra dine svar i dilemma-øvelsene.</p>
                                        </div>
                                        <div className="px-6 py-3 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20">
                                            Stoisk Tendens
                                        </div>
                                    </div>

                                    <div className="aspect-[16/7] bg-slate-50/50 rounded-[3rem] border border-black/[0.03] flex items-center justify-center overflow-hidden relative group">
                                        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity flex items-center justify-around px-20">
                                            {/* Dynamic Alignment Visualization */}
                                            {Object.entries(profile.alignment).map(([axis, value]) => (
                                                <div key={axis} className="flex flex-col items-center gap-2">
                                                    <div className="w-1 bg-slate-200 h-32 rounded-full relative">
                                                        <motion.div
                                                            className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-full"
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${value}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase text-slate-400 rotate-90 mt-4">{axis}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-center relative z-10 max-w-sm px-8">
                                            <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl mx-auto mb-8 flex items-center justify-center text-indigo-500">
                                                <Zap size={32} />
                                            </div>
                                            <p className="text-slate-500 font-serif italic text-lg leading-relaxed mb-8">
                                                {profile.alignment.rationalism > profile.alignment.empiricism
                                                    ? '"Du søker harmoni gjennom fornuft snarere enn nytelse."'
                                                    : '"Du stoler på dine sanser og erfaringer som kilde til visdom."'
                                                }
                                            </p>
                                            <Link
                                                to="/krle/filosofi/sammenlign?target=platon"
                                                className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-black transition-colors"
                                            >
                                                Sammenlign med Platon
                                            </Link>
                                        </div>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section className="rounded-[3rem] bg-white border border-black/[0.03] p-10 shadow-xl shadow-black/5 border-l-8 border-l-indigo-500">
                                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Siste Utmerkelse</div>
                                        <h4 className="text-xl font-black mb-2 tracking-tight">Logikeren</h4>
                                        <p className="text-slate-400 text-xs font-medium leading-relaxed">Vunnet for feilfri gjennomføring av Aristoteles' kategorier.</p>
                                    </section>
                                    <section className="rounded-[3rem] bg-white border border-black/[0.03] p-10 shadow-xl shadow-black/5 border-l-8 border-l-purple-500">
                                        <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4">Mentor Tips</div>
                                        <h4 className="text-xl font-black mb-2 tracking-tight">Dypere Innsikt</h4>
                                        <p className="text-slate-400 text-xs font-medium leading-relaxed italic font-serif">"Se sammenhengen mellom Platons idélære og din egen stoisme."</p>
                                    </section>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Hidden Scrollbar Helper */}
            <style dangerouslySetInnerHTML={{
                __html: `
                ::-webkit-scrollbar { width: 0px; background: transparent; }
                body { overflow-x: hidden; }
            ` }} />
        </div>
    );
};
