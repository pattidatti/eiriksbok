import { useSyncExternalStore } from 'react';

export type ShadowQuality = 'off' | 'low' | 'high';
export type QualityTierSetting = 'auto' | 'low' | 'medium' | 'high';

export interface GameSettings {
    graphics: {
        postProcessing: boolean;
        shadowQuality: ShadowQuality;
        renderScale: number; // 0.5 - 1.0
        fov: number; // 60 - 100
        qualityTier: QualityTierSetting;
    };
}

export const DEFAULT_SETTINGS: GameSettings = {
    graphics: {
        postProcessing: true,
        shadowQuality: 'high',
        renderScale: 1.0,
        fov: 70,
        qualityTier: 'auto',
    },
};

const STORAGE_KEY = 'eiriksbok-game-settings';

function loadFromStorage(): GameSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        const parsed = JSON.parse(raw) as Partial<GameSettings>;
        return {
            graphics: { ...DEFAULT_SETTINGS.graphics, ...(parsed.graphics ?? {}) },
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function saveToStorage(settings: GameSettings): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        // Stille feile på full/blokkert storage - innstillinger gjelder for økten uansett
    }
}

let state: GameSettings = loadFromStorage();
const listeners = new Set<() => void>();

export function getGameSettings(): GameSettings {
    return state;
}

export function updateGraphicsSettings(patch: Partial<GameSettings['graphics']>): void {
    state = { ...state, graphics: { ...state.graphics, ...patch } };
    saveToStorage(state);
    listeners.forEach((l) => l());
}

export function resetGameSettings(): void {
    state = DEFAULT_SETTINGS;
    saveToStorage(state);
    listeners.forEach((l) => l());
}

export function subscribeGameSettings(cb: () => void): () => void {
    listeners.add(cb);
    return () => {
        listeners.delete(cb);
    };
}

export function useGameSettings(): GameSettings {
    return useSyncExternalStore(subscribeGameSettings, getGameSettings, getGameSettings);
}
