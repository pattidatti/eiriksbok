import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ensureBackingAudio,
    startBacking,
    stopBacking,
    setBackingBpm,
} from '../audio/backingTrackEngine';
import type { PresetChord } from '../theory/progressionPresets';
import type { Genre } from '../audio/genrePresets';

interface UseBackingTrackArgs {
    chords: PresetChord[];
    bpm: number;
    genre: Genre;
}

export function useBackingTrack({ chords, bpm, genre }: UseBackingTrackArgs) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeChordIndex, setActiveChordIndex] = useState(-1);
    const [pulseTick, setPulseTick] = useState(0);
    const playingRef = useRef(false);

    useEffect(() => {
        if (playingRef.current) {
            setBackingBpm(bpm);
        }
    }, [bpm]);

    useEffect(() => {
        return () => {
            stopBacking();
        };
    }, []);

    const play = useCallback(async () => {
        if (playingRef.current || chords.length === 0) return;
        await ensureBackingAudio();
        playingRef.current = true;
        setIsPlaying(true);
        startBacking({
            bpm,
            genre,
            chords,
            onBeat: () => setPulseTick((t) => t + 1),
            onChordChange: (i) => setActiveChordIndex(i),
        });
    }, [chords, bpm, genre]);

    const stop = useCallback(() => {
        if (!playingRef.current) return;
        stopBacking();
        playingRef.current = false;
        setIsPlaying(false);
        setActiveChordIndex(-1);
        setPulseTick(0);
    }, []);

    const restart = useCallback(async () => {
        if (playingRef.current) {
            stopBacking();
            playingRef.current = false;
            setIsPlaying(false);
            setActiveChordIndex(-1);
            setPulseTick(0);
            await new Promise((r) => setTimeout(r, 30));
        }
        await play();
    }, [play]);

    return {
        isPlaying,
        activeChordIndex,
        pulseTick,
        play,
        stop,
        restart,
    };
}
