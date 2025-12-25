import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, ArrowRight, Star } from 'lucide-react';
import type { PhilosophyQuest } from '../../../../data/philosophy/types';
import { usePhilosophyProfile } from '../../../../hooks/usePhilosophyProfile';
import confetti from 'canvas-confetti';

interface QuestCompletionScreenProps {
    quest: PhilosophyQuest;
    onClose: () => void;
}

export const QuestCompletionScreen: React.FC<QuestCompletionScreenProps> = ({ quest, onClose }) => {
    const { profile } = usePhilosophyProfile();
    const [xpAnimated, setXpAnimated] = useState(0);

    useEffect(() => {
        // Trigger confetti on mount
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#a855f7', '#fbbf24']
        });

        // Animate XP counter
        const interval = setInterval(() => {
            setXpAnimated(prev => {
                if (prev < quest.rewardXp) return Math.min(prev + 10, quest.rewardXp);
                return prev;
            });
        }, 30);

        return () => clearInterval(interval);
    }, [quest.rewardXp]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/50 to-transparent pointer-events-none" />

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 rounded-full bg-indigo-500 text-white flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30 relative z-10"
            >
                <Trophy size={64} />
            </motion.div>

            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-black mb-4 font-display"
            >
                Quest Fullført!
            </motion.h2>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-500 text-lg mb-12 max-w-md"
            >
                Du har navigerte gjennom "{quest.title}" med visdom.
            </motion.p>

            <div className="grid grid-cols-2 gap-6 w-full max-w-lg mb-12 relative z-10">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-6 rounded-3xl border border-black/5 shadow-xl flex flex-col items-center"
                >
                    <div className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">XP Opptjent</div>
                    <div className="text-4xl font-black flex items-center gap-2">
                        <Zap className="text-amber-400" fill="currentColor" size={24} />
                        {xpAnimated}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-6 rounded-3xl border border-black/5 shadow-xl flex flex-col items-center"
                >
                    <div className="text-xs font-black uppercase tracking-widest text-purple-500 mb-2">Nytt Nivå</div>
                    <div className="text-4xl font-black flex items-center gap-2">
                        <Star className="text-purple-400" fill="currentColor" size={24} />
                        {profile.level}
                    </div>
                </motion.div>
            </div>

            <motion.button
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={onClose}
                className="px-12 py-4 rounded-2xl bg-black text-white font-black uppercase tracking-widest hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
            >
                <span>Fortsett Reisen</span>
                <ArrowRight size={20} />
            </motion.button>
        </div>
    );
};
