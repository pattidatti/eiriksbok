import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ArrowRight, CheckCircle2, AlertTriangle, MinusCircle } from 'lucide-react';
import { useStepSounds } from '../../../hooks/useStepSounds';
import type { DialogChoice } from '../../../types';
import type { StepRendererProps } from './types';

interface VisitedTurn {
    nodeId: string;
    choice?: DialogChoice;
}

export const DialogTreeStep: React.FC<StepRendererProps> = ({
    step,
    onComplete,
    isAlreadyCompleted,
}) => {
    const tree = step.dialogTree;
    const sounds = useStepSounds();
    const [currentNodeId, setCurrentNodeId] = useState<string>(
        tree?.startNodeId ?? ''
    );
    const [visited, setVisited] = useState<VisitedTurn[]>([]);
    const [showFeedback, setShowFeedback] = useState<DialogChoice | null>(null);
    const [done, setDone] = useState(isAlreadyCompleted);

    if (!tree) {
        return (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 text-rose-900">
                Dialogen mangler. Sjekk steg-data.
            </div>
        );
    }

    const currentNode = tree.nodes[currentNodeId];

    if (!currentNode) {
        return (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 text-rose-900">
                Fant ikke dialog-noden "{currentNodeId}".
            </div>
        );
    }

    const handleChoice = (choice: DialogChoice) => {
        sounds.play('select');
        setVisited((v) => [...v, { nodeId: currentNodeId, choice }]);
        if (choice.feedback) {
            setShowFeedback(choice);
        } else {
            advanceTo(choice);
        }
    };

    const advanceTo = (choice: DialogChoice) => {
        setShowFeedback(null);
        if (choice.nextNodeId && tree.nodes[choice.nextNodeId]) {
            sounds.play('advance');
            setCurrentNodeId(choice.nextNodeId);
        } else {
            // valg uten neste-node = slutt på dialog
            handleFinish(choice.score ?? 0.7);
        }
    };

    const handleFinish = (score: number) => {
        sounds.play('complete');
        setDone(true);
        onComplete({
            score,
            completed: true,
            artifact: {
                path: visited.map((v) => ({ nodeId: v.nodeId, choiceId: v.choice?.id })),
                endingNodeId: currentNodeId,
            },
        });
    };

    if (done) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 md:p-6"
            >
                <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <h3 className="font-bold text-slate-900">Dialogen er ferdig</h3>
                </div>
                <p className="text-sm text-emerald-900 mb-4">
                    Du tok {visited.length} valg gjennom samtalen. Gå videre eller spill om
                    igjen fra forrige steg for å prøve en annen vei.
                </p>
            </motion.div>
        );
    }

    const endingTone = currentNode.isEnding ? currentNode.endingTone ?? 'neutral' : null;
    const endingIcon =
        endingTone === 'good' ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        ) : endingTone === 'bad' ? (
            <AlertTriangle className="w-8 h-8 text-rose-500" />
        ) : endingTone === 'neutral' ? (
            <MinusCircle className="w-8 h-8 text-slate-400" />
        ) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                    Dialog
                </span>
                <span className="ml-auto text-[10px] font-mono text-slate-400">
                    {visited.length + 1} replikker
                </span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentNodeId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="p-5 md:p-6"
                >
                    {/* Speaker bobble */}
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center text-2xl flex-shrink-0">
                            {currentNode.portrait ?? '👤'}
                        </div>
                        <div className="flex-1 min-w-0">
                            {currentNode.speaker && (
                                <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
                                    {currentNode.speaker}
                                </p>
                            )}
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
                                <p className="text-slate-800 leading-relaxed text-sm md:text-base whitespace-pre-line">
                                    {currentNode.text}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ending */}
                    {currentNode.isEnding && (
                        <div className="text-center py-4 border-t border-slate-100 mt-5">
                            {endingIcon && <div className="flex justify-center mb-2">{endingIcon}</div>}
                            <button
                                onClick={() => {
                                    const score =
                                        endingTone === 'good'
                                            ? 1
                                            : endingTone === 'bad'
                                              ? 0.4
                                              : 0.7;
                                    handleFinish(score);
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow hover:bg-slate-800 transition"
                            >
                                Avslutt dialogen
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Valg */}
                    {!currentNode.isEnding && currentNode.choices && currentNode.choices.length > 0 && (
                        <div className="space-y-2 mt-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                Ditt svar:
                            </p>
                            {currentNode.choices.map((c) => (
                                <motion.button
                                    key={c.id}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleChoice(c)}
                                    className="w-full text-left px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 transition group"
                                >
                                    <span className="text-sm font-semibold text-slate-800 group-hover:text-amber-900 leading-relaxed">
                                        {c.text}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Feedback overlay */}
            <AnimatePresence>
                {showFeedback && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => advanceTo(showFeedback)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <p className="text-sm font-bold uppercase tracking-widest text-amber-700 mb-3">
                                Ettertanke
                            </p>
                            <p className="text-slate-800 leading-relaxed mb-5">
                                {showFeedback.feedback}
                            </p>
                            <button
                                onClick={() => advanceTo(showFeedback)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold shadow hover:bg-amber-700 transition"
                            >
                                Forstått
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
