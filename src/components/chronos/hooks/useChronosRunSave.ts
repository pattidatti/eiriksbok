import type { ChronosStat, ChronosEnvironment, ChronosEntry } from '../../../data/chronos/types';

export interface SavedRun {
    scenarioId: string;
    savedAt: number;
    currentNodeId: string;
    stats: ChronosStat[];
    inventory: string[];
    environment: Partial<ChronosEnvironment>;
    journal: ChronosEntry[];
    flags: string[];
    visitedHubs?: string[];
}

const key = (id: string) => `chronos_run_save_${id}_v1`;

export function useChronosRunSave(scenarioId: string) {
    const save = (state: Omit<SavedRun, 'scenarioId' | 'savedAt'>) =>
        localStorage.setItem(
            key(scenarioId),
            JSON.stringify({ scenarioId, savedAt: Date.now(), ...state })
        );

    const load = (): SavedRun | null => {
        const raw = localStorage.getItem(key(scenarioId));
        return raw ? (JSON.parse(raw) as SavedRun) : null;
    };

    const clear = () => localStorage.removeItem(key(scenarioId));

    return { save, load, clear };
}
