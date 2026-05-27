import React from 'react';
import { QuizRunner } from './QuizRunner';
import type { StepRendererProps } from './types';

export const MiniQuizStep: React.FC<StepRendererProps> = ({ step, onComplete }) => {
    const questions = step.questions ?? [];
    const minScore = step.completion.minScore ?? 0.7;

    if (questions.length === 0) {
        return (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-900 text-sm">
                Konfigurasjonsfeil: mini-quiz-steg uten spørsmål.
            </div>
        );
    }

    return (
        <QuizRunner
            title={step.title}
            questions={questions}
            minScore={minScore}
            onPass={(score, answers) => onComplete({ score, answers, completed: true })}
        />
    );
};
