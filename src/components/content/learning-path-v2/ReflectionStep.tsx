import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Save, CheckCircle2 } from 'lucide-react';
import type { StepRendererProps } from './types';

export const ReflectionStep: React.FC<StepRendererProps> = ({
    step,
    onComplete,
    previousResponse,
    isAlreadyCompleted,
}) => {
    const [text, setText] = useState(previousResponse?.text ?? '');
    const [saved, setSaved] = useState(isAlreadyCompleted);
    const minLength = step.completion.minLength ?? 60;

    const handleSave = () => {
        if (text.trim().length < minLength) return;
        onComplete({ text: text.trim(), completed: true });
        setSaved(true);
    };

    const charsLeft = Math.max(0, minLength - text.trim().length);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    Refleksjon
                </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>

            {step.reflectionPrompt && (
                <p className="text-slate-700 leading-relaxed mb-5 text-lg">
                    {step.reflectionPrompt}
                </p>
            )}

            <textarea
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    if (saved) setSaved(false);
                }}
                placeholder={step.reflectionPlaceholder ?? 'Skriv tankene dine her...'}
                rows={8}
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-base text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none transition resize-y leading-relaxed"
            />

            <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-500 font-mono">
                    {charsLeft > 0
                        ? `${charsLeft} tegn igjen før du kan lagre (min ${minLength})`
                        : `${text.trim().length} tegn skrevet`}
                </span>

                <button
                    onClick={handleSave}
                    disabled={text.trim().length < minLength}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                    {saved ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            Lagret
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Lagre refleksjon
                        </>
                    )}
                </button>
            </div>

            <p className="text-xs text-slate-400 mt-4">
                Refleksjonen lagres lokalt på denne datamaskinen. Du kan komme tilbake og lese
                den senere.
            </p>
        </motion.div>
    );
};
