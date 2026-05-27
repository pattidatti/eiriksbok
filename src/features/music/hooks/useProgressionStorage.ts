import { useCallback, useEffect, useState } from 'react';
import type { PresetChord } from '../theory/progressionPresets';

export interface SavedProgression {
    id: string;
    name: string;
    genre: string;
    chords: PresetChord[];
    savedAt: number;
}

const STORAGE_KEY = 'gitarstudio.savedProgressions.v1';

function read(): SavedProgression[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch {
        return [];
    }
}

function write(items: SavedProgression[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Quota exceeded or unavailable, silently fail.
    }
}

export function useProgressionStorage() {
    const [saved, setSaved] = useState<SavedProgression[]>(() => read());

    useEffect(() => {
        write(saved);
    }, [saved]);

    const save = useCallback((name: string, genre: string, chords: PresetChord[]) => {
        setSaved((prev) => {
            const id = `saved-${Date.now()}`;
            const entry: SavedProgression = {
                id,
                name: name.trim() || 'Uten navn',
                genre,
                chords,
                savedAt: Date.now(),
            };
            return [entry, ...prev].slice(0, 50);
        });
    }, []);

    const remove = useCallback((id: string) => {
        setSaved((prev) => prev.filter((p) => p.id !== id));
    }, []);

    return { saved, save, remove };
}
