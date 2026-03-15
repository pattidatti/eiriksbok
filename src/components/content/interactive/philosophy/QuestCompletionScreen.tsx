import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, ArrowRight, Star, Sparkles, MessageCircle } from 'lucide-react';
import type { PhilosophyQuest } from '../../../../data/philosophy/types';
import { usePhilosophyProfile } from '../../../../hooks/usePhilosophyProfile';
import { getLevelTitle, getNextQuest } from '../../../../data/philosophy/questRegistry';
import confetti from 'canvas-confetti';

interface QuestCompletionScreenProps {
    quest: PhilosophyQuest;
    onClose: () => void;
    onStartNextQuest?: (questId: string) => void;
}

export const QuestCompletionScreen: React.FC<QuestCompletionScreenProps> = ({ quest, onClose, onStartNextQuest }) => {
    const { profile, earnedAchievements } = usePhilosophyProfile();
    const [xpAnimated, setXpAnimated] = useState(0);

    const nextQuest = getNextQuest(profile);

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
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/50 to-transparent pointer-events-none" />

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-full bg-indigo-500 text-white flex items-center justify-center mb-5 shadow-xl shadow-indigo-500/30 relative z-10"
            >
                <Trophy size={40} />
            </motion.div>

            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black mb-2 font-display"
            >
                Dialog fullført!
            </motion.h2>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-500 text-sm mb-6 max-w-md"
            >
                Du har navigert gjennom &laquo;{quest.title}&raquo; med visdom.
            </motion.p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6 relative z-10">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-4 rounded-2xl border border-black/5 shadow-lg flex flex-col items-center"
                >
                    <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">XP opptjent</div>
                    <div className="text-2xl font-black flex items-center gap-1.5">
                        <Zap className="text-amber-400" fill="currentColor" size={18} />
                        {xpAnimated}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-4 rounded-2xl border border-black/5 shadow-lg flex flex-col items-center"
                >
                    <div className="text-[10px] font-bold uppercase tracking-widest text-purple-500 mb-1">Nivå {profile.level}</div>
                    <div className="text-2xl font-black flex items-center gap-1.5">
                        <Star className="text-purple-400" fill="currentColor" size={18} />
                        <span className="text-base">{getLevelTitle(profile.level)}</span>
                    </div>
                </motion.div>
            </div>

            {/* Achievement */}
            {latestAchievement && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mb-6 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold flex items-center gap-2"
                >
                    <Star size={14} className="text-amber-500" />
                    Nytt merke: {latestAchievement.title}
                </motion.div>
            )}

            {/* Reflection Questions */}
            {quest.reflectionQuestions && quest.reflectionQuestions.length > 0 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mb-6 w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <MessageCircle size={14} className="text-indigo-500" />
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Hva tenker du?</p>
                    </div>
                    <ul className="space-y-2">
                        {quest.reflectionQuestions.map((q, i) => (
                            <li key={i} className="text-sm text-slate-600 font-serif italic leading-relaxed">
                                {q}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col gap-3 w-full max-w-xs"
            >
                {nextQuest && onStartNextQuest && (
                    <button
                        onClick={() => onStartNextQuest(nextQuest.id)}
                        className="w-full px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <Sparkles size={14} />
                        Neste: {nextQuest.title}
                    </button>
                )}
                <button
                    onClick={onClose}
                    className={`w-full px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 ${
                        nextQuest && onStartNextQuest
                            ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            : 'bg-black text-white hover:bg-slate-800'
                    }`}
                >
                    <span>Tilbake til oversikt</span>
                    <ArrowRight size={14} />
                </button>
            </motion.div>
        </div>
    );
};
