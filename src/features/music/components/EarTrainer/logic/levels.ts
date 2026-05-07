export type ModeId = 'interval' | 'chord' | 'rhythm';

export const INTERVAL_NAMES: Record<number, string> = {
    0: 'Prima',
    1: 'Liten sekund',
    2: 'Stor sekund',
    3: 'Liten ters',
    4: 'Stor ters',
    5: 'Ren kvart',
    6: 'Tritonus',
    7: 'Ren kvint',
    8: 'Liten sekst',
    9: 'Stor sekst',
    10: 'Liten septim',
    11: 'Stor septim',
    12: 'Oktav',
};

export interface IntervalLevel {
    id: number;
    name: string;
    semitones: number[];
    playMode: 'melodic' | 'harmonic' | 'random';
}

export const INTERVAL_LEVELS: IntervalLevel[] = [
    { id: 1, name: 'Ankre', semitones: [0, 7, 12], playMode: 'melodic' },
    { id: 2, name: 'Store', semitones: [0, 2, 4, 5, 7, 12], playMode: 'melodic' },
    { id: 3, name: 'Alle rene', semitones: [0, 5, 7, 12], playMode: 'melodic' },
    { id: 4, name: 'Halvtoner', semitones: [1, 6, 11], playMode: 'melodic' },
    { id: 5, name: 'Alle', semitones: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], playMode: 'random' },
];

export type ChordQualityKey = 'Major' | 'Minor' | '7' | 'Min7' | 'Sus4' | 'Dim';

export const CHORD_LABELS: Record<ChordQualityKey, string> = {
    Major: 'Dur',
    Minor: 'Moll',
    '7': 'Dominant 7',
    Min7: 'Moll 7',
    Sus4: 'Sus4',
    Dim: 'Dim',
};

export const CHORD_INTERVALS: Record<ChordQualityKey, number[]> = {
    Major: [0, 4, 7],
    Minor: [0, 3, 7],
    '7': [0, 4, 7, 10],
    Min7: [0, 3, 7, 10],
    Sus4: [0, 5, 7],
    Dim: [0, 3, 6],
};

export interface ChordLevel {
    id: number;
    name: string;
    qualities: ChordQualityKey[];
}

export const CHORD_LEVELS: ChordLevel[] = [
    { id: 1, name: 'Dur og moll', qualities: ['Major', 'Minor'] },
    { id: 2, name: '+ Dominant 7', qualities: ['Major', 'Minor', '7'] },
    { id: 3, name: '+ Moll 7', qualities: ['Major', 'Minor', '7', 'Min7'] },
    { id: 4, name: 'Alle', qualities: ['Major', 'Minor', '7', 'Min7', 'Sus4', 'Dim'] },
];

export type TimeSig = '2/4' | '3/4' | '4/4';

export interface RhythmLevel {
    id: number;
    name: string;
    timeSigs: TimeSig[];
    syncopated: boolean;
}

export const RHYTHM_LEVELS: RhythmLevel[] = [
    { id: 1, name: 'Vals vs marsj', timeSigs: ['3/4', '4/4'], syncopated: false },
    { id: 2, name: '+ 2/4', timeSigs: ['2/4', '3/4', '4/4'], syncopated: false },
    { id: 3, name: 'Synkopert', timeSigs: ['2/4', '3/4', '4/4'], syncopated: true },
];

export const ROOT_MIDI_MIN = 48; // C3
export const ROOT_MIDI_MAX = 55; // G3

export function midiToNoteName(midi: number): string {
    const sharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const note = sharps[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${note}${octave}`;
}
