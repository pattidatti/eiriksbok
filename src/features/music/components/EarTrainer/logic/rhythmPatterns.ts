import type { TimeSig } from './levels';
import type { RhythmHit } from './audio';

export interface RhythmPattern {
    timeSig: TimeSig;
    bpm: number;
    bars: number;
    hits: RhythmHit[];
}

export const SIMPLE_PATTERNS: Record<TimeSig, RhythmPattern[]> = {
    '2/4': [
        {
            timeSig: '2/4',
            bpm: 100,
            bars: 2,
            hits: [
                { beat: 0, duration: 1 },
                { beat: 1, duration: 1 },
                { beat: 2, duration: 1 },
                { beat: 3, duration: 1 },
            ],
        },
        {
            timeSig: '2/4',
            bpm: 110,
            bars: 2,
            hits: [
                { beat: 0, duration: 0.5 },
                { beat: 0.5, duration: 0.5 },
                { beat: 1, duration: 1 },
                { beat: 2, duration: 0.5 },
                { beat: 2.5, duration: 0.5 },
                { beat: 3, duration: 1 },
            ],
        },
    ],
    '3/4': [
        {
            timeSig: '3/4',
            bpm: 100,
            bars: 2,
            hits: [
                { beat: 0, duration: 1 },
                { beat: 1, duration: 1 },
                { beat: 2, duration: 1 },
                { beat: 3, duration: 1 },
                { beat: 4, duration: 1 },
                { beat: 5, duration: 1 },
            ],
        },
        {
            timeSig: '3/4',
            bpm: 120,
            bars: 2,
            hits: [
                { beat: 0, duration: 1 },
                { beat: 1, duration: 0.5 },
                { beat: 1.5, duration: 0.5 },
                { beat: 2, duration: 1 },
                { beat: 3, duration: 1 },
                { beat: 4, duration: 0.5 },
                { beat: 4.5, duration: 0.5 },
                { beat: 5, duration: 1 },
            ],
        },
    ],
    '4/4': [
        {
            timeSig: '4/4',
            bpm: 100,
            bars: 2,
            hits: [
                { beat: 0, duration: 1 },
                { beat: 1, duration: 1 },
                { beat: 2, duration: 1 },
                { beat: 3, duration: 1 },
                { beat: 4, duration: 1 },
                { beat: 5, duration: 1 },
                { beat: 6, duration: 1 },
                { beat: 7, duration: 1 },
            ],
        },
        {
            timeSig: '4/4',
            bpm: 110,
            bars: 2,
            hits: [
                { beat: 0, duration: 1 },
                { beat: 1, duration: 0.5 },
                { beat: 1.5, duration: 0.5 },
                { beat: 2, duration: 1 },
                { beat: 3, duration: 1 },
                { beat: 4, duration: 1 },
                { beat: 5, duration: 0.5 },
                { beat: 5.5, duration: 0.5 },
                { beat: 6, duration: 1 },
                { beat: 7, duration: 1 },
            ],
        },
    ],
};

export const SYNCOPATED_PATTERNS: Record<TimeSig, RhythmPattern[]> = {
    '2/4': [
        {
            timeSig: '2/4',
            bpm: 110,
            bars: 2,
            hits: [
                { beat: 0, duration: 0.5 },
                { beat: 0.75, duration: 0.75 },
                { beat: 1.5, duration: 0.5 },
                { beat: 2, duration: 0.5 },
                { beat: 2.75, duration: 0.75 },
                { beat: 3.5, duration: 0.5 },
            ],
        },
    ],
    '3/4': [
        {
            timeSig: '3/4',
            bpm: 120,
            bars: 2,
            hits: [
                { beat: 0, duration: 0.5 },
                { beat: 0.75, duration: 0.75 },
                { beat: 1.5, duration: 0.5 },
                { beat: 2, duration: 1 },
                { beat: 3, duration: 0.5 },
                { beat: 3.75, duration: 0.75 },
                { beat: 4.5, duration: 0.5 },
                { beat: 5, duration: 1 },
            ],
        },
    ],
    '4/4': [
        {
            timeSig: '4/4',
            bpm: 100,
            bars: 2,
            hits: [
                { beat: 0, duration: 0.5 },
                { beat: 0.5, duration: 1 },
                { beat: 1.5, duration: 0.5 },
                { beat: 2, duration: 0.5 },
                { beat: 2.75, duration: 0.75 },
                { beat: 3.5, duration: 0.5 },
                { beat: 4, duration: 0.5 },
                { beat: 4.5, duration: 1 },
                { beat: 5.5, duration: 0.5 },
                { beat: 6, duration: 1 },
                { beat: 7, duration: 1 },
            ],
        },
    ],
};

export function pickRhythmPattern(timeSig: TimeSig, syncopated: boolean): RhythmPattern {
    const pool = syncopated ? SYNCOPATED_PATTERNS[timeSig] : SIMPLE_PATTERNS[timeSig];
    return pool[Math.floor(Math.random() * pool.length)];
}
