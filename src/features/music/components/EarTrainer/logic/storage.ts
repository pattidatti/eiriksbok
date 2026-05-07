import type { ModeId } from './levels';

const STORAGE_KEY = 'eartrainer_v1';

export interface StatEntry {
    correct: number;
    total: number;
}

export interface EarTrainerState {
    bestStreaks: Record<ModeId, Record<number, number>>;
    stats: Record<string, StatEntry>;
    lastSession: { mode: ModeId; level: number };
}

const DEFAULT_STATE: EarTrainerState = {
    bestStreaks: { interval: {}, chord: {}, rhythm: {} },
    stats: {},
    lastSession: { mode: 'interval', level: 1 },
};

export function loadState(): EarTrainerState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_STATE, bestStreaks: { interval: {}, chord: {}, rhythm: {} }, stats: {} };
        const parsed = JSON.parse(raw) as Partial<EarTrainerState>;
        return {
            bestStreaks: {
                interval: parsed.bestStreaks?.interval ?? {},
                chord: parsed.bestStreaks?.chord ?? {},
                rhythm: parsed.bestStreaks?.rhythm ?? {},
            },
            stats: parsed.stats ?? {},
            lastSession: parsed.lastSession ?? { mode: 'interval', level: 1 },
        };
    } catch {
        return { ...DEFAULT_STATE, bestStreaks: { interval: {}, chord: {}, rhythm: {} }, stats: {} };
    }
}

function save(state: EarTrainerState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore quota
    }
}

export function getBestStreak(state: EarTrainerState, mode: ModeId, level: number): number {
    return state.bestStreaks[mode][level] ?? 0;
}

export function saveBestStreak(mode: ModeId, level: number, streak: number): EarTrainerState {
    const state = loadState();
    const current = state.bestStreaks[mode][level] ?? 0;
    if (streak > current) {
        state.bestStreaks[mode][level] = streak;
        save(state);
    }
    return state;
}

export function statKey(mode: ModeId, label: string): string {
    return `${mode}:${label}`;
}

export function incrementStat(mode: ModeId, label: string, correct: boolean): EarTrainerState {
    const state = loadState();
    const key = statKey(mode, label);
    const entry = state.stats[key] ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (correct) entry.correct += 1;
    state.stats[key] = entry;
    save(state);
    return state;
}

export function saveLastSession(mode: ModeId, level: number): void {
    const state = loadState();
    state.lastSession = { mode, level };
    save(state);
}

export function resetState(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
}
