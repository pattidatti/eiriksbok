import { useCallback, useEffect, useState } from 'react';
import type { ScaleFamily } from '../theory/scaleEngine';
import type { Genre } from '../audio/genrePresets';
import type { ToneLabel } from '../components/Gitarstudio/FullFretboard';

export type FretboardSize = 'small' | 'medium' | 'large';
export type FretCount = 12 | 15 | 22;
export type Handedness = 'right' | 'left';

export interface GitarstudioSettings {
    rootNote: string;
    scaleFamily: ScaleFamily;
    chordScale: ScaleFamily;
    scalesLinked: boolean;
    genre: Genre;
    bpm: number;
    toneLabel: ToneLabel;
    fretboardSize: FretboardSize;
    fretCount: FretCount;
    handedness: Handedness;
    highlightRoot: boolean;
    highlightChord: boolean;
}

export const DEFAULT_SETTINGS: GitarstudioSettings = {
    rootNote: 'A',
    scaleFamily: 'pentatonic-minor',
    chordScale: 'pentatonic-minor',
    scalesLinked: true,
    genre: 'rock',
    bpm: 110,
    toneLabel: 'note',
    fretboardSize: 'medium',
    fretCount: 22,
    handedness: 'right',
    highlightRoot: true,
    highlightChord: false,
};

export const FRETBOARD_SIZE_HEIGHTS: Record<FretboardSize, string> = {
    small: 'clamp(140px, 22vh, 220px)',
    medium: 'clamp(210px, 33vh, 330px)',
    large: 'clamp(280px, 48vh, 460px)',
};

const STORAGE_KEY = 'gitarstudio.settings.v2';

function read(): GitarstudioSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function write(settings: GitarstudioSettings): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        // Quota or unavailable, ignore.
    }
}

export function useGitarstudioSettings() {
    const [settings, setSettings] = useState<GitarstudioSettings>(() => read());

    useEffect(() => {
        write(settings);
    }, [settings]);

    const update = useCallback(<K extends keyof GitarstudioSettings>(key: K, value: GitarstudioSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }, []);

    const reset = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
    }, []);

    return { settings, update, reset };
}
