import { useState, useCallback, useMemo } from 'react';
import type { DetectiveCase, DetectiveClue } from './types';

export const useDetectiveState = (initialCase: DetectiveCase) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [collectedClues, setCollectedClues] = useState<Set<string>>(new Set());
    const [collectedClueDetails, setCollectedClueDetails] = useState<DetectiveClue[]>([]);
    const [isConclusionVisible, setIsConclusionVisible] = useState(false);
    const [isBriefingVisible, setIsBriefingVisible] = useState(!!initialCase.briefing);
    const [isCompleted, setIsCompleted] = useState(false);

    const currentStep = useMemo(
        () => initialCase.steps[currentStepIndex],
        [initialCase, currentStepIndex]
    );
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === initialCase.steps.length - 1;

    const collectClue = useCallback((clue: DetectiveClue) => {
        setCollectedClues((prev) => {
            if (prev.has(clue.id)) return prev;
            const next = new Set(prev);
            next.add(clue.id);
            return next;
        });
        setCollectedClueDetails((prev) => {
            if (prev.some((c) => c.id === clue.id)) return prev;
            return [...prev, clue];
        });
    }, []);

    const nextStep = useCallback(() => {
        if (!isLastStep) {
            setCurrentStepIndex((prev) => prev + 1);
        } else {
            setIsConclusionVisible(true);
        }
    }, [isLastStep]);

    const prevStep = useCallback(() => {
        if (!isFirstStep) {
            setCurrentStepIndex((prev) => prev - 1);
        }
    }, [isFirstStep]);

    return {
        currentStep,
        currentStepIndex,
        totalSteps: initialCase.steps.length,
        collectedClues,
        collectedClueDetails,
        isFirstStep,
        isLastStep,
        isConclusionVisible,
        collectClue,
        nextStep,
        prevStep,
        setIsConclusionVisible,
        isBriefingVisible,
        setIsBriefingVisible,
        isCompleted,
        setIsCompleted,
    };
};
