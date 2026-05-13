export type SectionType = 'intro' | 'verse' | 'preChorus' | 'chorus' | 'bridge' | 'interlude' | 'solo' | 'outro';

export type NoteDuration = '1n' | '2n' | '4n' | '8n'; // Whole, Half, Quarter, Eighth

export type NoteType = 'note' | 'rest';

export interface RhythmNode {
    id: string;
    type: NoteType;
    duration: NoteDuration;
    // For future expansion (pitch, velocity)
    pitch?: string;
}

export interface Bar {
    id: string;
    timeSignature: [number, number]; // e.g., [4, 4]
    nodes: RhythmNode[];
    chords: {
        beatPosition: number; // 0-based beat index (e.g. 0, 1, 2.5)
        chord: string;
    }[];
    lyrics?: string;
}

export type InstrumentType = 'Vokal' | 'Trommer' | 'Bass' | 'Gitar' | 'Piano';

export type ScaleType = 'Major' | 'Minor';

export interface SongKey {
    root: string; // 'C', 'C#', 'D', ... 'B' (NOTES_SHARP-format)
    scale: ScaleType;
}

export interface Section {
    id: string;
    type: SectionType;
    name: string;
    bars: Bar[];
    color: string; // Hex or Tailwind class
    repeatCount: number;
    instruments: InstrumentType[];
}

export interface Composition {
    id: string; // This will be our short alphanumeric ID / PIN
    title: string;
    tempo: number;
    sections: Section[];
    key?: SongKey; // valgfri tonart for hele sangen
    creatorId?: string; // Randomly generated ID stored in LocalStorage
    createdAt?: number;
    lastModified?: number;
}

export const DEFAULT_BAR: Bar = {
    id: 'default',
    timeSignature: [4, 4],
    nodes: [
        { id: 'n1', type: 'rest', duration: '1n' }
    ],
    chords: []
};
