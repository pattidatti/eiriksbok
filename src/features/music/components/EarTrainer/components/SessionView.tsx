import React, { useCallback, useEffect, useState } from 'react';
import type { Question } from '../logic/questionGenerator';
import type { ModeId } from '../logic/levels';
import { PlayButton } from './PlayButton';
import { AnswerButtons } from './AnswerButtons';
import { FeedbackOverlay } from './FeedbackOverlay';
import { StreakDisplay } from './StreakDisplay';
import {
    getBestStreak,
    incrementStat,
    loadState,
    saveBestStreak,
} from '../logic/storage';

type Phase = 'idle' | 'playing' | 'awaiting' | 'feedback';

interface SessionViewProps {
    mode: ModeId;
    level: number;
    title: string;
    generate: (avoidLabel?: string) => Question;
    play: (q: Question) => Promise<void>;
    replay: (q: Question, selectedLabel: string) => Promise<void>;
}

export const SessionView: React.FC<SessionViewProps> = ({
    mode,
    level,
    title,
    generate,
    play,
    replay,
}) => {
    const [question, setQuestion] = useState<Question>(() => generate());
    const [phase, setPhase] = useState<Phase>('idle');
    const [selected, setSelected] = useState<string | null>(null);
    const [streak, setStreak] = useState(0);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [bestStreak, setBestStreak] = useState(() => getBestStreak(loadState(), mode, level));

    useEffect(() => {
        setQuestion(generate());
        setPhase('idle');
        setSelected(null);
        setStreak(0);
        setBestStreak(getBestStreak(loadState(), mode, level));
    }, [mode, level, generate]);

    const handlePlay = useCallback(async () => {
        setPhase('playing');
        setIsLoadingAudio(true);
        try {
            await play(question);
        } finally {
            setIsLoadingAudio(false);
            setPhase((current) => (current === 'playing' ? 'awaiting' : current));
        }
    }, [play, question]);

    const handleSelect = useCallback(
        (label: string) => {
            if (phase !== 'awaiting') return;
            setSelected(label);
            const correct = label === question.correctLabel;
            incrementStat(mode, question.correctLabel, correct);
            if (correct) {
                const next = streak + 1;
                setStreak(next);
                if (next > bestStreak) {
                    saveBestStreak(mode, level, next);
                    setBestStreak(next);
                }
            } else {
                setStreak(0);
            }
            setPhase('feedback');
        },
        [phase, question.correctLabel, streak, bestStreak, mode, level]
    );

    const handleNext = useCallback(() => {
        const avoid = phase === 'feedback' ? question.correctLabel : undefined;
        const next = generate(avoid);
        setQuestion(next);
        setSelected(null);
        setPhase('idle');
    }, [generate, phase, question.correctLabel]);

    const handleReplayBoth = useCallback(async () => {
        if (selected === null) return;
        await replay(question, selected);
    }, [replay, question, selected]);

    const isCorrect = selected !== null && selected === question.correctLabel;

    return (
        <div className="flex flex-col items-center gap-6 py-4">
            <div className="flex w-full items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <StreakDisplay streak={streak} best={bestStreak} />
            </div>

            <PlayButton
                onClick={handlePlay}
                isPlaying={phase === 'playing'}
                isLoading={isLoadingAudio && phase === 'playing'}
                pulse={phase === 'idle'}
                forceDisabled={phase === 'feedback'}
                label={phase === 'idle' ? 'Spill av' : 'Hør igjen'}
            />

            <div className="w-full">
                <AnswerButtons
                    options={question.options}
                    correctLabel={question.correctLabel}
                    selected={selected}
                    disabled={phase !== 'awaiting'}
                    onSelect={handleSelect}
                />
            </div>

            {phase === 'feedback' && selected !== null && (
                <FeedbackOverlay
                    question={question}
                    selected={selected}
                    isCorrect={isCorrect}
                    onReplay={handleReplayBoth}
                    onNext={handleNext}
                />
            )}
        </div>
    );
};
