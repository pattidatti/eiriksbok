import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface SignalOption {
    id: string;
    label: string;
    isCorrect: boolean;
}

interface SignalGameProps {
    config: {
        winNodeId: string;
        lossNodeId: string;
        situation: string;
        options: SignalOption[];
        correctFeedback: string;
        incorrectFeedback: string;
    };
    onComplete: (success: boolean) => void;
}

export const SignalGame: React.FC<SignalGameProps> = ({ config, onComplete }) => {
    const [chosen, setChosen] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleChoose = (option: SignalOption) => {
        if (submitted) return;
        setChosen(option.id);
        setSubmitted(true);
        setTimeout(() => {
            onComplete(option.isCorrect);
        }, 2200);
    };

    const chosenOption = config.options.find((o) => o.id === chosen);
    const isCorrect = chosenOption?.isCorrect ?? false;

    return (
        <div className="bg-stone-100 rounded-3xl border border-stone-200 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-stone-800 border-b border-stone-700/50">
                <Eye size={13} className="opacity-70 text-stone-300 flex-shrink-0" />
                <span className="text-xs font-display font-semibold text-stone-100 tracking-wide">Observasjonsrapport</span>
            </div>

            <div className="mx-3 mt-2 rounded-xl bg-stone-800 p-3 border border-stone-700/60">
                <p className="text-sm text-stone-300 leading-relaxed font-mono text-center">{config.situation}</p>
            </div>

            {/* Options */}
            <div className="p-3 space-y-1.5">
                {!submitted && (
                    <>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">
                            Rapporter til kommandoposten:
                        </p>
                        {config.options.map((option, i) => (
                            <motion.button
                                key={option.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                onClick={() => handleChoose(option)}
                                className="w-full py-2.5 px-3 text-left rounded-2xl bg-white border-2 border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all text-sm font-medium text-stone-700 active:scale-[0.98]"
                            >
                                {option.label}
                            </motion.button>
                        ))}
                    </>
                )}

                {submitted && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-3 rounded-2xl border-2 flex items-start gap-3 ${
                            isCorrect
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-rose-50 border-rose-200'
                        }`}
                    >
                        {isCorrect ? (
                            <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
                        ) : (
                            <XCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={20} />
                        )}
                        <div>
                            <p className="font-bold text-stone-800 text-sm mb-1">
                                {isCorrect ? 'Riktig rapport' : 'Feil rapport'}
                            </p>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                {isCorrect ? config.correctFeedback : config.incorrectFeedback}
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
