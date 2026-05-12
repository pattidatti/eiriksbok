import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'detective-progress';

export interface CaseProgress {
    completed: boolean;
    stars: number;
    foundClues: string[];
    currentStepIndex: number | null;
    chosenOption?: string;
    chosenEvidence?: string[];
    lastPlayed: string;
}

export type ProgressMap = Record<string, CaseProgress>;

function readAll(): ProgressMap {
    if (typeof window === 'undefined') return {};
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as ProgressMap;
    } catch {
        // Ignorer korrupt data
    }
    return {};
}

function writeAll(map: ProgressMap) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
        // Quota eller deaktivert. Ikke kritisk.
    }
}

export function getCaseProgress(caseId: string): CaseProgress | undefined {
    return readAll()[caseId];
}

export function getAllProgress(): ProgressMap {
    return readAll();
}

export function saveCaseProgress(caseId: string, progress: Partial<CaseProgress>) {
    const all = readAll();
    const existing = all[caseId] ?? {
        completed: false,
        stars: 0,
        foundClues: [],
        currentStepIndex: null,
        lastPlayed: new Date().toISOString(),
    };
    all[caseId] = { ...existing, ...progress, lastPlayed: new Date().toISOString() };
    writeAll(all);
}

export function clearCaseProgress(caseId: string) {
    const all = readAll();
    delete all[caseId];
    writeAll(all);
}

/** React-hook som lytter på endringer i progress for én sak. */
export function useCaseProgress(caseId: string | undefined) {
    const initial = caseId ? getCaseProgress(caseId) : undefined;
    const [progress, setProgress] = useState<CaseProgress | undefined>(initial);
    const [trackedCaseId, setTrackedCaseId] = useState<string | undefined>(caseId);

    // Synk progress når caseId endres (uten setState-i-effect)
    if (caseId !== trackedCaseId) {
        setTrackedCaseId(caseId);
        setProgress(caseId ? getCaseProgress(caseId) : undefined);
    }

    useEffect(() => {
        if (!caseId) return;
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                setProgress(getCaseProgress(caseId));
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [caseId]);

    const save = useCallback(
        (next: Partial<CaseProgress>) => {
            if (!caseId) return;
            saveCaseProgress(caseId, next);
            setProgress(getCaseProgress(caseId));
        },
        [caseId]
    );

    const clear = useCallback(() => {
        if (!caseId) return;
        clearCaseProgress(caseId);
        setProgress(undefined);
    }, [caseId]);

    return { progress, save, clear };
}

/** Bruk i hub-siden for å vise fullføringsstatus per sak. */
export function useAllProgress() {
    const [progress, setProgress] = useState<ProgressMap>(() => readAll());

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) setProgress(readAll());
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    return progress;
}
