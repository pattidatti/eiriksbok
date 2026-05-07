import React, { useCallback, useState } from 'react';
import { CHORD_LEVELS, CHORD_LABELS, CHORD_INTERVALS, type ChordQualityKey } from './logic/levels';
import { generateChord, type Question } from './logic/questionGenerator';
import { playChord, playTwoChords } from './logic/audio';
import { LevelSelector } from './components/LevelSelector';
import { SessionView } from './components/SessionView';

interface ChordModeProps {
    initialLevel: number;
    onLevelChange: (level: number) => void;
}

const LABEL_TO_QUALITY: Record<string, ChordQualityKey> = Object.fromEntries(
    Object.entries(CHORD_LABELS).map(([k, v]) => [v, k as ChordQualityKey])
) as Record<string, ChordQualityKey>;

export const ChordMode: React.FC<ChordModeProps> = ({ initialLevel, onLevelChange }) => {
    const [level, setLevel] = useState(initialLevel);

    const handleLevelChange = (id: number) => {
        setLevel(id);
        onLevelChange(id);
    };

    const generate = useCallback(
        (avoid?: string) => {
            const avoidQ = avoid !== undefined ? LABEL_TO_QUALITY[avoid] : undefined;
            return generateChord(level, avoidQ);
        },
        [level]
    );

    const play = useCallback(async (q: Question) => {
        if (q.type !== 'chord') return;
        await playChord(q.rootMidi, q.intervals);
    }, []);

    const replay = useCallback(async (q: Question, selected: string) => {
        if (q.type !== 'chord') return;
        const selectedQuality = LABEL_TO_QUALITY[selected];
        const selectedIntervals = selectedQuality ? CHORD_INTERVALS[selectedQuality] : q.intervals;
        if (selectedQuality === q.quality) {
            await playChord(q.rootMidi, q.intervals);
        } else {
            await playTwoChords(q.rootMidi, selectedIntervals, q.intervals);
        }
    }, []);

    return (
        <div className="space-y-4">
            <LevelSelector levels={CHORD_LEVELS} current={level} onChange={handleLevelChange} />
            <SessionView
                mode="chord"
                level={level}
                title={`Akkorder — ${CHORD_LEVELS.find((l) => l.id === level)?.name ?? ''}`}
                generate={generate}
                play={play}
                replay={replay}
            />
        </div>
    );
};
