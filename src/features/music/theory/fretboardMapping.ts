import { NOTES_SHARP } from '../utils/musicTheory';

export const STANDARD_TUNING_LOW_TO_HIGH = ['E', 'A', 'D', 'G', 'B', 'E'];
export const STANDARD_TUNING_OPEN_MIDI = [40, 45, 50, 55, 59, 64];
export const TOTAL_FRETS = 22;

export interface FretPosition {
    stringIndex: number;
    fret: number;
    pitchClass: number;
    note: string;
    midi: number;
}

export function getPitchClassAt(stringIndex: number, fret: number): number {
    const openNote = STANDARD_TUNING_LOW_TO_HIGH[stringIndex];
    const openIndex = NOTES_SHARP.indexOf(openNote);
    return (openIndex + fret) % 12;
}

export function getNoteAt(stringIndex: number, fret: number): string {
    return NOTES_SHARP[getPitchClassAt(stringIndex, fret)];
}

export function getMidiAt(stringIndex: number, fret: number): number {
    return STANDARD_TUNING_OPEN_MIDI[stringIndex] + fret;
}

export function midiToToneName(midi: number): string {
    const pitchClass = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    return `${NOTES_SHARP[pitchClass]}${octave}`;
}

export interface ScaleFretPosition extends FretPosition {
    interval: number;
    isRoot: boolean;
    isChordTone: boolean;
}

export function mapScaleToFretboard(
    scalePitchClasses: { pitchClass: number; interval: number; isRoot: boolean }[],
    chordPitchClasses: Set<number> = new Set()
): ScaleFretPosition[] {
    const positions: ScaleFretPosition[] = [];
    const scaleMap = new Map<number, { interval: number; isRoot: boolean }>();
    scalePitchClasses.forEach((p) => scaleMap.set(p.pitchClass, { interval: p.interval, isRoot: p.isRoot }));

    for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
        for (let fret = 0; fret <= TOTAL_FRETS; fret++) {
            const pitchClass = getPitchClassAt(stringIndex, fret);
            const scaleInfo = scaleMap.get(pitchClass);
            if (!scaleInfo) continue;
            positions.push({
                stringIndex,
                fret,
                pitchClass,
                note: NOTES_SHARP[pitchClass],
                midi: getMidiAt(stringIndex, fret),
                interval: scaleInfo.interval,
                isRoot: scaleInfo.isRoot,
                isChordTone: chordPitchClasses.has(pitchClass),
            });
        }
    }
    return positions;
}

export function getChordPitchClasses(chordRoot: string, intervals: number[]): Set<number> {
    const rootIndex = NOTES_SHARP.indexOf(chordRoot);
    if (rootIndex === -1) return new Set();
    return new Set(intervals.map((i) => (rootIndex + i) % 12));
}

export function getAllFretsForPitchClass(pitchClass: number, fretCount: number): { stringIndex: number; fret: number; midi: number }[] {
    const list: { stringIndex: number; fret: number; midi: number }[] = [];
    for (let s = 0; s < 6; s++) {
        for (let f = 0; f <= fretCount; f++) {
            if (getPitchClassAt(s, f) === pitchClass) {
                list.push({ stringIndex: s, fret: f, midi: getMidiAt(s, f) });
            }
        }
    }
    return list;
}
