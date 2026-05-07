import {
    INTERVAL_LEVELS,
    INTERVAL_NAMES,
    CHORD_LEVELS,
    CHORD_LABELS,
    CHORD_INTERVALS,
    RHYTHM_LEVELS,
    ROOT_MIDI_MIN,
    ROOT_MIDI_MAX,
    type ChordQualityKey,
    type TimeSig,
} from './levels';
import { pickRhythmPattern, type RhythmPattern } from './rhythmPatterns';

export interface IntervalQuestion {
    type: 'interval';
    level: number;
    rootMidi: number;
    semitones: number;
    playMode: 'melodic' | 'harmonic';
    correctLabel: string;
    options: string[];
}

export interface ChordQuestion {
    type: 'chord';
    level: number;
    rootMidi: number;
    quality: ChordQualityKey;
    intervals: number[];
    correctLabel: string;
    options: string[];
}

export interface RhythmQuestion {
    type: 'rhythm';
    level: number;
    timeSig: TimeSig;
    pattern: RhythmPattern;
    correctLabel: string;
    options: string[];
}

export type Question = IntervalQuestion | ChordQuestion | RhythmQuestion;

function pickRoot(): number {
    const span = ROOT_MIDI_MAX - ROOT_MIDI_MIN + 1;
    return ROOT_MIDI_MIN + Math.floor(Math.random() * span);
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateInterval(levelId: number, avoidSemitones?: number): IntervalQuestion {
    const level = INTERVAL_LEVELS.find((l) => l.id === levelId) ?? INTERVAL_LEVELS[0];
    let pool = level.semitones;
    if (avoidSemitones !== undefined && pool.length > 1) {
        pool = pool.filter((s) => s !== avoidSemitones);
    }
    const semitones = pick(pool);
    const playMode: 'melodic' | 'harmonic' =
        level.playMode === 'random' ? (Math.random() < 0.5 ? 'melodic' : 'harmonic') : level.playMode;
    const options = level.semitones.map((s) => INTERVAL_NAMES[s]);
    return {
        type: 'interval',
        level: levelId,
        rootMidi: pickRoot(),
        semitones,
        playMode,
        correctLabel: INTERVAL_NAMES[semitones],
        options,
    };
}

export function generateChord(levelId: number, avoidQuality?: ChordQualityKey): ChordQuestion {
    const level = CHORD_LEVELS.find((l) => l.id === levelId) ?? CHORD_LEVELS[0];
    let pool = level.qualities;
    if (avoidQuality !== undefined && pool.length > 1) {
        pool = pool.filter((q) => q !== avoidQuality);
    }
    const quality = pick(pool);
    const options = level.qualities.map((q) => CHORD_LABELS[q]);
    return {
        type: 'chord',
        level: levelId,
        rootMidi: pickRoot(),
        quality,
        intervals: CHORD_INTERVALS[quality],
        correctLabel: CHORD_LABELS[quality],
        options,
    };
}

export function generateRhythm(levelId: number, avoidTimeSig?: TimeSig): RhythmQuestion {
    const level = RHYTHM_LEVELS.find((l) => l.id === levelId) ?? RHYTHM_LEVELS[0];
    let pool = level.timeSigs;
    if (avoidTimeSig !== undefined && pool.length > 1) {
        pool = pool.filter((t) => t !== avoidTimeSig);
    }
    const timeSig = pick(pool);
    const pattern = pickRhythmPattern(timeSig, level.syncopated);
    const options = level.timeSigs.map((t) => t);
    return {
        type: 'rhythm',
        level: levelId,
        timeSig,
        pattern,
        correctLabel: timeSig,
        options,
    };
}
