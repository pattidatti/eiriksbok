export type NoteValue = '2n' | '4n' | '4n.' | '8n' | '8n.' | '16n';
export type RestValue = '2r' | '4r' | '8r';
export type RhythmEvent =
    | { kind: 'note'; value: NoteValue; beat: number }
    | { kind: 'rest'; value: RestValue; beat: number };

export interface RhythmPattern {
    id: string;
    level: number;
    timeSignature: [number, number];
    bars: number;
    bpm: number;
    events: RhythmEvent[];
}

export interface TapResult {
    expectedBeat: number;
    expectedTime: number;
    actualTime: number | null;
    deviationMs: number | null;
    rating: 'perfect' | 'good' | 'miss';
}

export interface AccuracyResult {
    perBeat: TapResult[];
    hitRate: number;
    averageDeviationMs: number;
    score: number;
}

export interface CalibrationData {
    latencyOffsetMs: number;
    calibratedAt: number;
    sampleCount: number;
}

export interface LevelProgress {
    level: number;
    bestScore: number;
    attempts: number;
    unlocked: boolean;
}

export const HIT_WINDOWS = {
    perfect: 60,
    good: 120,
    miss: 200,
} as const;

export const QUARTER_NOTE_BEATS: Record<NoteValue | RestValue, number> = {
    '2n': 2,
    '4n': 1,
    '4n.': 1.5,
    '8n': 0.5,
    '8n.': 0.75,
    '16n': 0.25,
    '2r': 2,
    '4r': 1,
    '8r': 0.5,
};
