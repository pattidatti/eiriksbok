import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Trophy } from 'lucide-react';
import type { PhilosophyProfile } from '../../../../data/philosophy/types';
import { getLevelTitle, getNextQuest } from '../../../../data/philosophy/questRegistry';

interface HeroSectionProps {
    profile: PhilosophyProfile;
    progress: { completed: number; total: number; percent: number };
    onStartQuest: (questId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ profile, progress, onStartQuest }) => {
    const nextQuest = getNextQuest(profile);
    const allDone = !nextQuest;

    if (allDone) {
        return (
            <section className="relative rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 overflow-hidden shadow-xl">
                <div className="relative z-10 p-8 md:p-12 flex items-center gap-8">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Trophy className="text-white" size={40} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-black text-white mb-2">Odysseen er fullfort!</h2>
                        <p className="text-white/80 text-sm">Du har samtalet med alle filosofene. Niva {profile.level}: {getLevelTitle(profile.level)}.</p>
                    </div>
                </div>
            </section>
        );
    }

    const imagePath = `/images/filosofi/${nextQuest.philosopherId}_hero.png`;

    return (
        <section className="relative rounded-3xl bg-indigo-600 overflow-hidden shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-800" />
            <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden opacity-30 mix-blend-overlay group-hover:opacity-50 transition-opacity duration-700">
                <img src={imagePath} alt={nextQuest.philosopherId} className="object-cover h-full w-full object-top" />
            </div>

            <div className="relative z-10 p-8 md:p-10 max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest">
                        {progress.completed === 0 ? 'Start din reise' : 'Neste utfordring'}
                    </span>
                    <motion.div
                        className="w-2 h-2 rounded-full bg-white"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>

                <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-3 leading-tight">
                    {nextQuest.title}
                </h2>
                <p className="text-sm md:text-base text-white/70 mb-6 leading-relaxed">
                    {nextQuest.description}
                </p>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => onStartQuest(nextQuest.id)}
                        className="px-8 py-3 rounded-2xl bg-white text-indigo-600 font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2"
                    >
                        <Sparkles size={14} />
                        Start Dialog
                    </button>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-white/60 text-xs font-bold">
                        <ArrowRight size={14} />
                        {progress.completed}/{progress.total} fullfort
                    </div>
                </div>
            </div>
        </section>
    );
};
