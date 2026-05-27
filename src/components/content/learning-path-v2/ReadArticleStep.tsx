import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuizRunner } from './QuizRunner';
import type { StepRendererProps } from './types';

// To-fase steg: les artikkel (eksternt) → kom tilbake og bekreft med komprehensjons-sjekk.
export const ReadArticleStep: React.FC<StepRendererProps> = ({ step, onComplete }) => {
    const [phase, setPhase] = useState<'read' | 'check'>('read');
    const questions = step.completion.comprehensionQuestions ?? [];
    const minScore = step.completion.minScore ?? 0.7;

    if (phase === 'check' && questions.length > 0) {
        return (
            <QuizRunner
                title="Kort forståelses-sjekk"
                questions={questions}
                minScore={minScore}
                onPass={(score, answers) =>
                    onComplete({ score, answers, completed: true })
                }
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    Les artikkelen
                </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {step.articleTitle ?? 'Les denne artikkelen'}
            </h3>

            <p className="text-slate-600 leading-relaxed mb-6">
                Når du har lest, kommer du tilbake hit og svarer på noen raske spørsmål for å
                vise at du har fått med deg det viktigste.
            </p>

            {step.articleUrl && (
                <Link
                    to={step.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow hover:bg-indigo-700 transition mr-3"
                >
                    Åpne artikkel i ny fane
                    <ArrowRight className="w-4 h-4" />
                </Link>
            )}

            {questions.length > 0 ? (
                <button
                    onClick={() => setPhase('check')}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow hover:bg-slate-800 transition"
                >
                    Jeg har lest - start sjekk
                    <ArrowRight className="w-4 h-4" />
                </button>
            ) : (
                <button
                    onClick={() =>
                        onComplete({ score: 1, completed: true })
                    }
                    className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow hover:bg-slate-800 transition"
                >
                    Jeg har lest - gå videre
                    <ArrowRight className="w-4 h-4" />
                </button>
            )}
        </motion.div>
    );
};
