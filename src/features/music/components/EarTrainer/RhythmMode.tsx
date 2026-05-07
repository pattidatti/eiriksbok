import React, { useCallback, useState } from 'react';
import { RHYTHM_LEVELS, type TimeSig } from './logic/levels';
import { generateRhythm, type Question } from './logic/questionGenerator';
import { playRhythm } from './logic/audio';
import { LevelSelector } from './components/LevelSelector';
import { SessionView } from './components/SessionView';

interface RhythmModeProps {
    initialLevel: number;
    onLevelChange: (level: number) => void;
}

export const RhythmMode: React.FC<RhythmModeProps> = ({ initialLevel, onLevelChange }) => {
    const [level, setLevel] = useState(initialLevel);

    const handleLevelChange = (id: number) => {
        setLevel(id);
        onLevelChange(id);
    };

    const generate = useCallback(
        (avoid?: string) => {
            const avoidTs = avoid as TimeSig | undefined;
            return generateRhythm(level, avoidTs);
        },
        [level]
    );

    const play = useCallback(async (q: Question) => {
        if (q.type !== 'rhythm') return;
        await playRhythm(q.pattern.hits, q.pattern.bpm);
    }, []);

    const replay = useCallback(async (q: Question) => {
        if (q.type !== 'rhythm') return;
        await playRhythm(q.pattern.hits, q.pattern.bpm);
    }, []);

    return (
        <div className="space-y-4">
            <LevelSelector levels={RHYTHM_LEVELS} current={level} onChange={handleLevelChange} />
            <SessionView
                mode="rhythm"
                level={level}
                title={`Rytme — ${RHYTHM_LEVELS.find((l) => l.id === level)?.name ?? ''}`}
                generate={generate}
                play={play}
                replay={replay}
            />
        </div>
    );
};
