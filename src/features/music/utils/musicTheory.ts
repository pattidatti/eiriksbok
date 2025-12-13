
export const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const CHORD_QUALITIES = {
    'Major': { label: 'Major (Dur)', intervals: [0, 4, 7] },
    'Minor': { label: 'Minor (Moll)', intervals: [0, 3, 7] },
    '7': { label: '7 (Dominant)', intervals: [0, 4, 7, 10] },
    'Maj7': { label: 'Major 7', intervals: [0, 4, 7, 11] },
    'Min7': { label: 'Minor 7', intervals: [0, 3, 7, 10] },
    'Sus4': { label: 'Sus4', intervals: [0, 5, 7] },
    'Dim': { label: 'Diminished', intervals: [0, 3, 6] },
};

export type Note = string; // e.g., "C", "F#"

export function getChordNotes(root: Note, quality: keyof typeof CHORD_QUALITIES): Note[] {
    const rootIndex = NOTES_SHARP.indexOf(root);
    if (rootIndex === -1) return [];

    const intervals = CHORD_QUALITIES[quality].intervals;
    return intervals.map(interval => {
        return NOTES_SHARP[(rootIndex + interval) % 12];
    });
}

// Guitar Logic
// Standard Tuning: E A D G B E (High to Low strings in array index 0-5? No, usually Low E is string 6)
// Let's stick to the visualizer's convention. 
// FretboardExplorer: ['E', 'B', 'G', 'D', 'A', 'E'] (Top/Index 0 is High E, Bottom/Index 5 is Low E)

interface GuitarVoicing {
    frets: number[]; // Array of 6 numbers. -1 for mute, 0 for open. Index 0 is High E.
}

// Base shapes (defined for specific roots)
// We will transpose these.
const BASE_SHAPES: Record<string, Record<string, GuitarVoicing>> = {
    'E': {
        'Major': { frets: [0, 0, 1, 2, 2, 0] }, // E Major: 022100 (Low to High) -> Vis: [0, 0, 1, 2, 2, 0] (High to Low)
        'Minor': { frets: [0, 0, 0, 2, 2, 0] }, // Em
        '7': { frets: [0, 3, 1, 2, 2, 0] },     // E7
    },
    'A': {
        'Major': { frets: [0, 2, 2, 2, 0, -1] }, // A Major: x02220 -> Vis: [0, 2, 2, 2, 0, -1]
        'Minor': { frets: [0, 1, 2, 2, 0, -1] }, // Am
    }
};

// Helper: Get distance between two notes
function getSemitones(from: Note, to: Note): number {
    const i1 = NOTES_SHARP.indexOf(from);
    const i2 = NOTES_SHARP.indexOf(to);
    let diff = i2 - i1;
    if (diff < 0) diff += 12;
    return diff;
}

export interface FretPosition {
    string: number; // 0-5 (High E to Low E)
    fret: number;
}

export function getGuitarVoicing(root: Note, quality: string): FretPosition[] {
    // Strategy: Try to find a barre chord shape based on E-shape or A-shape

    // 1. E-Shape (Root on Low E string - Index 5)
    // E is index 4 in NOTES_SHARP (C=0, C#=1, D=2, D#=3, E=4)
    // Wait, E is index 4? C C# D D# E. Yes.

    // Calculate offset from E
    const eIndex = NOTES_SHARP.indexOf('E');
    const rootIndex = NOTES_SHARP.indexOf(root);
    let shiftE = rootIndex - eIndex;
    if (shiftE < 0) shiftE += 12;

    // 2. A-Shape (Root on A string - Index 4)
    // A is index 9
    const aIndex = NOTES_SHARP.indexOf('A');
    let shiftA = rootIndex - aIndex;
    if (shiftA < 0) shiftA += 12;

    // Prefer lower voicings (closer to nut)
    // But open chords are best. 

    // Simplistic Logic:
    // Check if we have a hardcoded "Open" shape (offset 0)? 
    // Actually, let's just use the E-shape and A-shape and shift them.

    // If shift is 0, we can use open strings. If shift > 0, we treat open strings (0) as barre (0+shift).
    // EXCEPT mute (-1) stays mute.

    // Let's prefer the shape that puts the barre lower on the neck, but ideally < 12.

    let bestShape = null;
    let bestShift = 0;

    // Check E-Shape suitability
    // If quality exists in E-shape
    if (BASE_SHAPES['E'][quality as keyof typeof BASE_SHAPES['E']]) {
        bestShape = BASE_SHAPES['E'][quality];
        bestShift = shiftE;
    }

    // Check A-Shape suitability (might be better if shift is lower)
    if (BASE_SHAPES['A'][quality as keyof typeof BASE_SHAPES['A']]) {
        const shape = BASE_SHAPES['A'][quality];
        if (!bestShape || shiftA < bestShift) {
            // Prefer E-shape if shift is 0 (Open E) vs A-shape shifted high
            // But if A-shape shift is smaller, take it.
            bestShape = shape;
            bestShift = shiftA;
        }
    }

    if (!bestShape) return []; // Unknown quality/shape

    const positions: FretPosition[] = [];
    bestShape.frets.forEach((fret, stringIndex) => {
        if (fret !== -1) {
            positions.push({
                string: stringIndex,
                fret: fret + bestShift
            });
        }
    });

    return positions;
}
