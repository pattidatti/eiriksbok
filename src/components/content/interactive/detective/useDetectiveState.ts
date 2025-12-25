import { useState, useCallback, useMemo } from 'react';
import type { DetectiveCase } from './types';

export const useDetectiveState = (initialCase: DetectiveCase) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [collectedClues, setCollectedClues] = useState<Set<string>>(new Set());
    const [trustScore, setTrustScore] = useState(initialCase.status.trustLevel);
    const [isConclusionVisible, setIsConclusionVisible] = useState(false);
    const [isBriefingVisible, setIsBriefingVisible] = useState(!!initialCase.briefing);

    const currentStep = useMemo(() => initialCase.steps[currentStepIndex], [initialCase, currentStepIndex]);
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === initialCase.steps.length - 1;

    const collectClue = useCallback((clueId: string) => {
        setCollectedClues(prev => {
            const next = new Set(prev);
            next.add(clueId);
            return next;
        });
    }, []);

    const nextStep = useCallback(() => {
        if (!isLastStep) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            setIsConclusionVisible(true);
        }
    }, [isLastStep]);

    const prevStep = useCallback(() => {
        if (!isFirstStep) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [isFirstStep]);

    const adjustTrust = useCallback((amount: number) => {
        setTrustScore(prev => Math.min(100, Math.max(0, prev + amount)));
    }, []);

    return {
        currentStep,
        currentStepIndex,
        totalSteps: initialCase.steps.length,
        collectedClues,
        trustScore,
        isFirstStep,
        isLastStep,
        isConclusionVisible,
        collectClue,
        nextStep,
        prevStep,
        adjustTrust,
        setIsConclusionVisible,
        isBriefingVisible,
        setIsBriefingVisible
    };
};
