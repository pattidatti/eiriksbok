import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, ArrowRight, Star } from 'lucide-react';
import type { PhilosophyQuest } from '../../../../data/philosophy/types';
import { usePhilosophyProfile } from '../../../../hooks/usePhilosophyProfile';
import { getLevelTitle } from '../../../../data/philosophy/questRegistry';
import confetti from 'canvas-confetti';

interface QuestCompletionScreenProps {
    quest: PhilosophyQuest;
    onClose: () => void;
}

export const QuestCompletionScreen: React.FC<QuestCompletionScreenProps> = ({ quest, onClose }) => {
    const { profile, earnedAchievements } = usePhilosophyProfile();
    const [xpAnimated, setXpAnimated] = useState(0);

    useEffect(() => {
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#a855f7', '#fbbf24'],
        });

        const step = Math.max(10, Math.round(quest.rewardXp / 30));
        const interval = setInterval(() => {
            setXpAnimated(prev => {
                if (prev < quest.rewardXp) return Math.min(prev + step, quest.rewardXp);
                return prev;
            });
        }, 30);

        return () => clearInterval(interval);
    }, [quest.rewardXp]);

    const latestAchievement = earnedAchievements.length > 0
        ? earnedAchievements[earnedAchievements.length - 1]
        : null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/50 to-transparent pointer-events-none" />

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 rounded-full bg-indigo-500 text-white flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30 relative z-10"
            >
                <Trophy size={48} />
            </motion.div>

            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black mb-3 font-display"
            >
                Dialog fullfort!
            </motion.h2>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-500 text-sm mb-8 max-w-md"
            >
                Du har navigert gjennom &laquo;{quest.title}&raquo; med visdom.
            </motion.p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8 relative z-10">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-5 rounded-2xl border border-black/5 shadow-lg flex flex-col items-center"
                >
                    <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">XP opptjent</div>
                    <div className="text-3xl font-black flex items-center gap-1.5">
                        <Zap className="text-amber-400" fill="currentColor" size={20} />
                        {xpAnimated}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-5 rounded-2xl border border-black/5 shadow-lg flex flex-col items-center"
                >
                    <div className="text-[10px] font-bold uppercase tracking-widest text-purple-500 mb-1">Niva {profile.level}</div>
                    <div className="text-3xl font-black flex items-center gap-1.5">
                        <Star className="text-purple-400" fill="currentColor" size={20} />
                        {getLevelTitle(profile.level)}
                    </div>
                </motion.div>
            </div>

            {/* New achievement */}
            {latestAchievement && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mb-8 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold flex items-center gap-2"
                >
                    <Star size={16} className="text-amber-500" />
                    Nytt merke: {latestAchievement.title}
                </motion.div>
            )}

            <motion.button
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={onClose}
                className="px-10 py-3.5 rounded-2xl bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
            >
                <span>Fortsett Reisen</span>
                <ArrowRight size={16} />
            </motion.button>
        </div>
    );
};
