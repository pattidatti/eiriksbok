import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Scroll, Brain, GraduationCap, Trophy, X } from 'lucide-react';
import type { Achievement } from '../../../../data/philosophy/types';
import confetti from 'canvas-confetti';

interface AchievementUnlockedModalProps {
    achievements: Achievement[];
    onDismiss: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    sparkles: Sparkles,
    scroll: Scroll,
    brain: Brain,
    'graduation-cap': GraduationCap,
    trophy: Trophy,
};

export const AchievementUnlockedModal: React.FC<AchievementUnlockedModalProps> = ({ achievements, onDismiss }) => {
    useEffect(() => {
        if (achievements.length === 0) return;
        const burst = () => {
            confetti({
                particleCount: 60,
                spread: 80,
                startVelocity: 35,
                origin: { y: 0.4 },
                colors: ['#fbbf24', '#f59e0b', '#fde68a', '#6366f1'],
            });
        };
        burst();
        const t = setTimeout(burst, 350);
        return () => clearTimeout(t);
    }, [achievements.length]);

    useEffect(() => {
        if (achievements.length === 0) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onDismiss();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [achievements.length, onDismiss]);

    if (achievements.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onDismiss}
            >
                <motion.div
                    initial={{ scale: 0.5, y: 40, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="achievement-modal-title"
                    className="relative bg-gradient-to-br from-amber-50 to-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-amber-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onDismiss}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-amber-100 text-slate-400 transition-colors"
                        aria-label="Lukk"
                    >
                        <X size={16} />
                    </button>

                    <div className="text-center">
                        <motion.div
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
                            className="inline-flex w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 items-center justify-center text-white shadow-xl shadow-amber-500/40 mb-4"
                        >
                            <Trophy size={36} fill="currentColor" />
                        </motion.div>

                        <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1"
                        >
                            {achievements.length > 1 ? `${achievements.length} nye merker` : 'Nytt merke'}
                        </motion.p>

                        <motion.h2
                            id="achievement-modal-title"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-2xl font-display font-black text-slate-900 mb-1"
                        >
                            Du har låst opp!
                        </motion.h2>
                    </div>

                    <div className="mt-6 space-y-3">
                        {achievements.map((a, i) => {
                            const Icon = ICON_MAP[a.icon] || Sparkles;
                            return (
                                <motion.div
                                    key={a.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="flex gap-3 items-start p-4 rounded-2xl bg-white border border-amber-100"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-base font-black text-slate-900 leading-tight">{a.title}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{a.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.button
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        onClick={onDismiss}
                        className="mt-6 w-full px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        Fortsett
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
