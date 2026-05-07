import React, { useCallback, useState } from 'react';
import { INTERVAL_LEVELS, INTERVAL_NAMES } from './logic/levels';
import { generateInterval, type Question } from './logic/questionGenerator';
import { playInterval, playTwoIntervals } from './logic/audio';
import { LevelSelector } from './components/LevelSelector';
import { SessionView } from './components/SessionView';

interface IntervalModeProps {
    initialLevel: number;
    onLevelChange: (level: number) => void;
}

const LABEL_TO_SEMITONES: Record<string, number> = Object.fromEntries(
    Object.entries(INTERVAL_NAMES).map(([s, name]) => [name, Number(s)])
);

export const IntervalMode: React.FC<IntervalModeProps> = ({ initialLevel, onLevelChange }) => {
    const [level, setLevel] = useState(initialLevel);

    const handleLevelChange = (id: number) => {
        setLevel(id);
        onLevelChange(id);
    };

    const generate = useCallback(
        (avoid?: string) => {
            const avoidSemis = avoid !== undefined ? LABEL_TO_SEMITONES[avoid] : undefined;
            return generateInterval(level, avoidSemis);
        },
        [level]
    );

    const play = useCallback(async (q: Question) => {
        if (q.type !== 'interval') return;
        await playInterval(q.rootMidi, q.semitones, q.playMode);
    }, []);

    const replay = useCallback(async (q: Question, selected: string) => {
        if (q.type !== 'interval') return;
        const selectedSemis = LABEL_TO_SEMITONES[selected] ?? q.semitones;
        if (selectedSemis === q.semitones) {
            await playInterval(q.rootMidi, q.semitones, q.playMode);
        } else {
            await playTwoIntervals(q.rootMidi, selectedSemis, q.semitones, q.playMode);
        }
    }, []);

    return (
        <div className="space-y-4">
            <LevelSelector levels={INTERVAL_LEVELS} current={level} onChange={handleLevelChange} />
            <SessionView
                mode="interval"
                level={level}
                title={`Intervaller — ${INTERVAL_LEVELS.find((l) => l.id === level)?.name ?? ''}`}
                generate={generate}
                play={play}
                replay={replay}
            />
        </div>
    );
};
