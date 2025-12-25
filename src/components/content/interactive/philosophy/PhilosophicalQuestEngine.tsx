import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhilosophyQuest, DialogueChoice } from '../../../../data/philosophy/types';
import { Sparkles, MessageSquare, ArrowRight, Brain, Zap, History } from 'lucide-react';
import { usePhilosophyProfile } from '../../../../hooks/usePhilosophyProfile';

import { QuestCompletionScreen } from './QuestCompletionScreen';

interface PhilosophicalQuestEngineProps {
    quest: PhilosophyQuest;
    mentorImage?: string;
    onComplete?: () => void;
    onExit?: () => void;
}

export const PhilosophicalQuestEngine: React.FC<PhilosophicalQuestEngineProps> = ({
    quest,
    mentorImage,
    onComplete,
    onExit
}) => {
    const [currentStepId, setCurrentStepId] = useState(quest.initialStepId);
    const [history, setHistory] = useState<string[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const { updateAlignment, completeQuest } = usePhilosophyProfile();

    if (isCompleted) {
        return <QuestCompletionScreen quest={quest} onClose={onExit || (() => { })} />;
    }

    const currentStep = quest.steps.find(s => s.id === currentStepId);

    const handleChoice = (choice: DialogueChoice) => {
        // Apply alignment impacts
        if (choice.impact) {
            updateAlignment(choice.impact);
        }

        // Navigate
        if (choice.nextStepId && choice.nextStepId !== 'End') {
            setHistory(prev => [...prev, currentStepId]);
            setCurrentStepId(choice.nextStepId);
        } else {
            // End of quest
            completeQuest(quest.id, quest.rewardXp);
            setIsCompleted(true);
        }
    };

    const goBack = () => {
        if (history.length > 0) {
            const previousStepId = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            setCurrentStepId(previousStepId);
        }
    };

    if (!currentStep) return (
        <div className="flex flex-col items-center justify-center p-12 text-center text-red-500">
            <h3 className="font-bold text-xl mb-2">Feil: Steg ikke funnet</h3>
            <p className="font-mono bg-red-50 p-2 rounded">ID: "{currentStepId}"</p>
            <p className="text-sm mt-4 text-slate-400">Vennligst kontakt administrator.</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto min-h-[600px] flex flex-col">
            {/* Quest Header */}
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 overflow-hidden">
                        {mentorImage ? (
                            <img src={mentorImage} alt={quest.mentor} className="w-full h-full object-cover" />
                        ) : (
                            <Brain size={24} />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">{quest.title}</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{quest.mentor}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {history.length > 0 && (
                        <button
                            onClick={goBack}
                            className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            <History size={18} />
                        </button>
                    )}
                    <button
                        onClick={onExit}
                        className="px-6 py-2 rounded-xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                        Avslutt
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
                {/* Visual/Image Panel */}
                <div className="lg:col-span-5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStepId + "-image"}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900 border border-black/5 group"
                        >
                            {/* Background Image */}
                            {mentorImage && (
                                <img
                                    src={mentorImage}
                                    alt={quest.mentor}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                                />
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest mb-4">
                                    <Sparkles size={12} className="text-amber-400" />
                                    <span>Filosofisk Mentor</span>
                                </div>
                                <p className="text-2xl font-display font-black text-white">{currentStep.speaker || quest.mentor}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Dialogue Panel */}
                <div className="lg:col-span-7 flex flex-col justify-center py-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStepId + "-text"}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="relative">
                                <div className="absolute -left-4 -top-4 text-indigo-100 opacity-50">
                                    <MessageSquare size={64} fill="currentColor" />
                                </div>
                                <p className="relative z-10 text-2xl md:text-3xl font-serif text-slate-800 leading-relaxed">
                                    "{currentStep.text}"
                                </p>
                            </div>

                            <div className="space-y-4 pt-8">
                                {currentStep.choices.map((choice, idx) => (
                                    <motion.button
                                        key={choice.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                        onClick={() => handleChoice(choice)}
                                        className="group w-full p-6 text-left rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors leading-snug">
                                                {choice.text}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all ml-4">
                                            <ArrowRight size={20} />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Progress Footer */}
            <footer className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">XP Belønning</span>
                        <div className="flex items-center gap-2 text-indigo-600 font-bold">
                            <Zap size={14} fill="currentColor" />
                            <span>+{quest.rewardXp} XP</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Mentor</span>
                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                            <Sparkles size={14} className="text-amber-500" />
                            <span>{quest.mentor}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">"Tenk grundig før du svarer..."</p>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
                .font-serif { font-family: 'Playfair Display', serif; }
            ` }} />
        </div>
    );
};
