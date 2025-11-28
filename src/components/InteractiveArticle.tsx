import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    Clock,
    Map,
    Info,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Share2,
    Bookmark,
    PlayCircle,
    Layers
} from 'lucide-react';

// Re-using the type definition for now. In a real app, this should be in types.ts
type TimelineEvent = {
    id: number;
    year: string;
    title: string;
    description: string;
    content: string[];
    details: string[];
    icon: React.ReactNode;
    category: 'Verden' | 'Norge';
    url: string;
    readTime: string;
};

interface InteractiveArticleProps {
    event: TimelineEvent;
    onClose: () => void;
}

const InteractiveMapPlaceholder = () => (
    <div className="relative w-full h-64 bg-slate-800 rounded-xl overflow-hidden border border-white/10 group cursor-pointer">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 flex items-center space-x-2 group-hover:scale-105 transition-transform">
                <Map className="w-5 h-5 text-indigo-400" />
                <span className="text-white font-bold text-sm">Utforsk Kartet</span>
            </div>
        </div>
    </div>
);

const FactBox = ({ title, content }: { title: string, content: string }) => (
    <div className="bg-indigo-900/20 border-l-4 border-indigo-500 p-6 rounded-r-xl my-8">
        <h4 className="text-indigo-400 font-bold text-sm uppercase mb-2 flex items-center tracking-wider">
            <Info className="w-4 h-4 mr-2" />
            Visste du at?
        </h4>
        <p className="text-slate-300 text-base leading-relaxed">
            {content}
        </p>
    </div>
);

const ExpandableSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/30 mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <span className="font-bold text-slate-200">{title}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 text-slate-400 text-sm leading-relaxed border-t border-white/5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const InteractiveArticle: React.FC<InteractiveArticleProps> = ({ event, onClose }) => {
    // Mock data for demo purposes if not present in event
    const heroImage = event.id === 4 // Vikingtiden
        ? "https://images.unsplash.com/photo-1506422748879-887454f9cdff?auto=format&fit=crop&q=80" // Viking ship/sea
        : "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80"; // Generic history

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
                layoutId={`article-${event.id}`}
                className="relative w-full max-w-6xl h-full md:h-[95vh] bg-[#0f0f11] md:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden border border-white/10"
            >
                {/* Top Navigation Bar */}
                <div className="absolute top-0 left-0 w-full z-30 flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                    <div className="pointer-events-auto flex space-x-2">
                        <button className="p-2 bg-black/40 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md border border-white/5">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-black/40 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md border border-white/5">
                            <Bookmark className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="pointer-events-auto p-2 bg-black/40 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md border border-white/5"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f0f11]">

                    {/* Hero Section */}
                    <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${heroImage})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/50 to-transparent" />

                        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center space-x-3 mb-4"
                            >
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${event.category === 'Norge'
                                        ? 'bg-red-500/20 text-red-200 border-red-500/30'
                                        : 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                                    }`}>
                                    {event.category}
                                </span>
                                <span className="flex items-center text-indigo-300 font-mono text-sm bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                    <Calendar className="w-3 h-3 mr-2" />
                                    {event.year}
                                </span>
                                <span className="flex items-center text-slate-400 text-sm">
                                    <Clock className="w-3 h-3 mr-2" />
                                    {event.readTime}
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight"
                            >
                                {event.title}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-xl md:text-2xl text-slate-200 font-light leading-relaxed max-w-2xl"
                            >
                                {event.description}
                            </motion.p>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="max-w-6xl mx-auto p-8 md:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                            {/* Left Column: Main Text (8 cols) */}
                            <div className="lg:col-span-8">
                                <div className="prose prose-invert prose-lg max-w-none">
                                    {/* First paragraph with drop cap style */}
                                    <p className="text-slate-300 mb-6 leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-indigo-400 first-letter:mr-3 first-letter:float-left">
                                        {event.content[0]}
                                    </p>

                                    {/* Interactive Module: Map */}
                                    <div className="my-10">
                                        <InteractiveMapPlaceholder />
                                        <p className="text-center text-xs text-slate-500 mt-2 font-mono">FIGUR 1: UTBREDELSE OG REISERUTER</p>
                                    </div>

                                    {event.content.slice(1).map((paragraph, index) => (
                                        <React.Fragment key={index}>
                                            <p className="text-slate-300 mb-6 leading-relaxed">
                                                {paragraph}
                                            </p>
                                            {/* Insert FactBox after second paragraph */}
                                            {index === 0 && (
                                                <FactBox
                                                    title="Visste du at?"
                                                    content="Vikingene brukte solstein for å navigere på overskyede dager. Denne krystallen kunne polarisere lyset og vise hvor solen stod på himmelen."
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {/* Deep Dive Section */}
                                <div className="mt-12 pt-12 border-t border-white/5">
                                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                                        <Layers className="w-6 h-6 mr-3 text-indigo-400" />
                                        Fordypning
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ExpandableSection title="Samfunnsstruktur">
                                            Vikingtidens samfunn var hierarkisk oppbygd med treller, frie bønder, jarler og konger. Ætten stod sentralt i lov og rett.
                                        </ExpandableSection>
                                        <ExpandableSection title="Religion og Tro">
                                            Den norrøne mytologien med Odin, Tor og Frøya preget hverdagen før kristendommen gradvis overtok fra 1000-tallet.
                                        </ExpandableSection>
                                        <ExpandableSection title="Handel og Økonomi">
                                            Vikingene var dyktige handelsmenn som byttet pelsverk, hvalbein og slaver mot sølv, silke og krydder fra Østen.
                                        </ExpandableSection>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Sidebar (4 cols) */}
                            <div className="lg:col-span-4 space-y-8">

                                {/* Key Points Card */}
                                <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 sticky top-6">
                                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-6 flex items-center">
                                        <Info className="w-4 h-4 mr-2" />
                                        Nøkkelpunkter
                                    </h3>
                                    <ul className="space-y-4">
                                        {event.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-start text-sm text-slate-300 group">
                                                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-3 group-hover:scale-150 transition-transform" />
                                                <span className="leading-relaxed">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Media/Gallery Placeholder */}
                                <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                                        <PlayCircle className="w-4 h-4 mr-2" />
                                        Media
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="aspect-square bg-slate-800 rounded-lg border border-white/5 hover:border-indigo-500/50 transition-colors cursor-pointer relative group overflow-hidden">
                                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599619351208-3e6c839d6828?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="aspect-square bg-slate-800 rounded-lg border border-white/5 hover:border-indigo-500/50 transition-colors cursor-pointer relative group overflow-hidden">
                                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* External Link */}
                                <a
                                    href={event.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-6 bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-indigo-400 font-bold text-sm">Store Norske Leksikon</span>
                                        <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </div>
                                    <p className="text-slate-400 text-sm">
                                        Les den fullstendige, kvalitetssikrede artikkelen om {event.title}.
                                    </p>
                                </a>

                            </div>

                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
