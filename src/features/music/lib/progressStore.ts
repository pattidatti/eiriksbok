import type { CalibrationData, LevelProgress } from './rhythmTypes';

const KEY_CALIBRATION = 'rhythmTapper.calibration';
const KEY_PROGRESS = 'rhythmTapper.progress';

export function loadCalibration(): CalibrationData | null {
    try {
        const raw = localStorage.getItem(KEY_CALIBRATION);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CalibrationData;
        if (typeof parsed.latencyOffsetMs !== 'number') return null;
        return parsed;
    } catch {
        return null;
    }
}

export function saveCalibration(data: CalibrationData): void {
    try {
        localStorage.setItem(KEY_CALIBRATION, JSON.stringify(data));
    } catch {
        // localStorage full or disabled - graceful degradation
    }
}

export function clearCalibration(): void {
    try {
        localStorage.removeItem(KEY_CALIBRATION);
    } catch {
        // ignore
    }
}

const MAX_LEVEL = 5;
const UNLOCK_THRESHOLD = 80;

export function loadProgress(): Record<number, LevelProgress> {
    const defaults: Record<number, LevelProgress> = {};
    for (let i = 1; i <= MAX_LEVEL; i++) {
        defaults[i] = { level: i, bestScore: 0, attempts: 0, unlocked: i === 1 };
    }
    try {
        const raw = localStorage.getItem(KEY_PROGRESS);
        if (!raw) return defaults;
        const parsed = JSON.parse(raw) as Record<number, LevelProgress>;
        return { ...defaults, ...parsed };
    } catch {
        return defaults;
    }
}

export function recordAttempt(level: number, score: number): Record<number, LevelProgress> {
    const progress = loadProgress();
    const current = progress[level] ?? {
        level,
        bestScore: 0,
        attempts: 0,
        unlocked: level === 1,
    };
    current.attempts += 1;
    if (score > current.bestScore) current.bestScore = score;
    progress[level] = current;

    if (score >= UNLOCK_THRESHOLD && level + 1 <= MAX_LEVEL) {
        const next = progress[level + 1] ?? {
            level: level + 1,
            bestScore: 0,
            attempts: 0,
            unlocked: false,
        };
        next.unlocked = true;
        progress[level + 1] = next;
    }

    try {
        localStorage.setItem(KEY_PROGRESS, JSON.stringify(progress));
    } catch {
        // ignore
    }
    return progress;
}
