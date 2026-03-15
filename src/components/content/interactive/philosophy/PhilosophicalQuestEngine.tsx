import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhilosophyQuest, DialogueChoice } from '../../../../data/philosophy/types';
import { Sparkles, MessageSquare, ArrowRight, Brain, Zap, History, Lightbulb } from 'lucide-react';
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
    const [pendingFeedback, setPendingFeedback] = useState<{ text: string; nextStepId?: string } | null>(null);
    const { updateAlignment, completeQuest } = usePhilosophyProfile();

    if (isCompleted) {
        return <QuestCompletionScreen quest={quest} onClose={onExit || (() => {})} />;
    }

    const currentStep = quest.steps.find(s => s.id === currentStepId);
    const currentIndex = quest.steps.findIndex(s => s.id === currentStepId);
    const totalSteps = quest.steps.length;

    const navigateTo = (stepId?: string) => {
        if (!stepId || stepId === 'End') {
            completeQuest(quest.id, quest.rewardXp);
            setIsCompleted(true);
            onComplete?.();
        } else {
            setHistory(prev => [...prev, currentStepId]);
            setCurrentStepId(stepId);
        }
    };

    const handleChoice = (choice: DialogueChoice) => {
        if (choice.impact) {
            updateAlignment(choice.impact);
        }

        if (choice.feedback) {
            setPendingFeedback({ text: choice.feedback, nextStepId: choice.nextStepId });
        } else {
            navigateTo(choice.nextStepId);
        }
    };

    const dismissFeedback = () => {
        const next = pendingFeedback?.nextStepId;
        setPendingFeedback(null);
        navigateTo(next);
    };

    const goBack = () => {
        if (history.length > 0) {
            const previousStepId = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            setCurrentStepId(previousStepId);
            setPendingFeedback(null);
        }
    };

    if (!currentStep) return (
        <div className="flex flex-col items-center justify-center p-12 text-center text-red-500">
            <h3 className="font-bold text-xl mb-2">Feil: Steg ikke funnet</h3>
            <p className="font-mono bg-red-50 p-2 rounded">ID: &quot;{currentStepId}&quot;</p>
            <button onClick={onExit} className="mt-4 px-6 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">
                Tilbake
            </button>
        </div>
    );

    const stepImage = currentStep.image || mentorImage;

    return (
        <div className="max-w-5xl mx-auto min-h-[500px] flex flex-col">
            {/* Quest Header */}
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md overflow-hidden">
                        {mentorImage ? (
                            <img src={mentorImage} alt={quest.mentor} className="w-full h-full object-cover" />
                        ) : (
                            <Brain size={20} />
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight leading-tight">{quest.title}</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{quest.mentor}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {history.length > 0 && (
                        <button
                            onClick={goBack}
                            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Ga tilbake"
                        >
                            <History size={16} />
                        </button>
                    )}
                    <button
                        onClick={onExit}
                        className="px-5 py-2 rounded-xl bg-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                        Avslutt
                    </button>
                </div>
            </header>

            {/* Progress Dots */}
            <div className="flex items-center gap-1 mb-6">
                {quest.steps.map((step, i) => (
                    <div
                        key={step.id}
                        className={`h-1 rounded-full transition-all ${
                            i < currentIndex ? 'bg-indigo-500 flex-1' :
                            i === currentIndex ? 'bg-indigo-400 flex-[2]' :
                            'bg-slate-200 flex-1'
                        }`}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                {/* Visual Panel */}
                <div className="lg:col-span-5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStepId + '-image'}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl bg-slate-900 border border-black/5 group"
                        >
                            {stepImage && (
                                <img
                                    src={stepImage}
                                    alt={quest.mentor}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest mb-3">
                                    <Sparkles size={10} className="text-amber-400" />
                                    <span>Filosofisk Mentor</span>
                                </div>
                                <p className="text-xl font-display font-black text-white">{currentStep.speaker || quest.mentor}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Dialogue Panel */}
                <div className="lg:col-span-7 flex flex-col justify-center py-2">
                    <AnimatePresence mode="wait">
                        {pendingFeedback ? (
                            <motion.div
                                key="feedback"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="relative bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                                    <div className="flex items-start gap-3">
                                        <Lightbulb size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Innsikt</p>
                                            <p className="text-base text-slate-700 leading-relaxed font-serif italic">
                                                {pendingFeedback.text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={dismissFeedback}
                                    className="group w-full p-4 text-center rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all font-bold text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-2"
                                >
                                    Fortsett <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={currentStepId + '-text'}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="relative">
                                    <div className="absolute -left-3 -top-3 text-indigo-100 opacity-50">
                                        <MessageSquare size={48} fill="currentColor" />
                                    </div>
                                    <p className="relative z-10 text-xl md:text-2xl font-serif text-slate-800 leading-relaxed">
                                        &ldquo;{currentStep.text}&rdquo;
                                    </p>
                                </div>

                                <div className="space-y-3 pt-4">
                                    {currentStep.choices.map((choice, idx) => (
                                        <motion.button
                                            key={choice.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 + idx * 0.08 }}
                                            onClick={() => handleChoice(choice)}
                                            className="group w-full p-5 text-left rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all flex items-center justify-between"
                                        >
                                            <p className="font-bold text-sm text-slate-700 group-hover:text-indigo-600 transition-colors leading-snug flex-1">
                                                {choice.text}
                                            </p>
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all ml-3 shrink-0">
                                                <ArrowRight size={16} />
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm">
                        <Zap size={14} fill="currentColor" />
                        <span>+{quest.rewardXp} XP</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs text-slate-400 font-medium">
                        Steg {currentIndex + 1} av {totalSteps}
                    </span>
                </div>
            </footer>
        </div>
    );
};
