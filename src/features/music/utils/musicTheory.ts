
export const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const CHORD_QUALITIES = {
    'Major': { label: 'Major', intervals: [0, 4, 7] },
    'Minor': { label: 'Minor', intervals: [0, 3, 7] },
    '7': { label: 'Dominant 7', intervals: [0, 4, 7, 10] },
    'Maj7': { label: 'Major 7', intervals: [0, 4, 7, 11] },
    'Min7': { label: 'Minor 7', intervals: [0, 3, 7, 10] },
    'Sus4': { label: 'Sus4', intervals: [0, 5, 7] },
    'Dim': { label: 'Diminished', intervals: [0, 3, 6] },
};

export type Note = string; // e.g., "C", "F#"

// Helper for scale generation
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10]; // Natural Minor

// Diatonic Chords Map (Scale Degree -> Quality Key)
const MAJOR_DIATONIC = ['Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'Dim'];
const MINOR_DIATONIC = ['Minor', 'Dim', 'Major', 'Minor', 'Minor', 'Major', 'Major']; // Natural Minor Scale Degrees

export function getDiatonicChords(root: Note, scaleType: 'Major' | 'Minor'): { root: Note, quality: string, degree: number }[] {
    const rootIndex = NOTES_SHARP.indexOf(root);
    if (rootIndex === -1) return [];

    const scaleIntervals = scaleType === 'Major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
    const qualities = scaleType === 'Major' ? MAJOR_DIATONIC : MINOR_DIATONIC;

    return scaleIntervals.map((interval, index) => {
        const noteIndex = (rootIndex + interval) % 12;
        const noteName = NOTES_SHARP[noteIndex];
        return {
            root: noteName,
            quality: qualities[index],
            degree: index + 1
        };
    });
}

export function getChordNotes(root: Note, quality: keyof typeof CHORD_QUALITIES): Note[] {
    const rootIndex = NOTES_SHARP.indexOf(root);
    if (rootIndex === -1) return [];

    const intervals = CHORD_QUALITIES[quality].intervals;
    return intervals.map(interval => {
        return NOTES_SHARP[(rootIndex + interval) % 12];
    });
}

// "Cowboy Chords" / Open Chords Dictionary
// Format: [E, A, D, G, B, e] - -1 means mute, 0 means open
const OPEN_CHORDS: Record<string, Record<string, number[]>> = {
    'C': {
        'Major': [-1, 3, 2, 0, 1, 0], // x32010
        'Major7': [-1, 3, 2, 0, 0, 0], // x32000
    },
    'A': {
        'Major': [-1, 0, 2, 2, 2, 0], // x02220
        'Minor': [-1, 0, 2, 2, 1, 0], // x02210
        '7': [-1, 0, 2, 0, 2, 0],     // x02020
        'Sus4': [-1, 0, 2, 2, 3, 0],  // x02230
    },
    'G': {
        'Major': [3, 2, 0, 0, 0, 3],  // 320003
        '7': [3, 2, 0, 0, 0, 1],      // 320001
    },
    'E': {
        'Major': [0, 2, 2, 1, 0, 0],  // 022100
        'Minor': [0, 2, 2, 0, 0, 0],  // 022000
        '7': [0, 2, 0, 1, 0, 0],      // 020100
    },
    'D': {
        'Major': [-1, -1, 0, 2, 3, 2], // xx0232
        'Minor': [-1, -1, 0, 2, 3, 1], // xx0231
        '7': [-1, -1, 0, 2, 1, 2],     // xx0212
        'Sus4': [-1, -1, 0, 2, 3, 3],  // xx0233
    },
    'F': {
        'Major': [1, 3, 3, 2, 1, 1], // Barre is standard, but Fmaj7 open is x33210
        'Maj7': [-1, 3, 3, 2, 1, 0], // x33210 (Easy F)
    }
};

export function getGuitarVoicing(root: Note, quality: string, variant: number = 0): number[] {
    const rootIndex = NOTES_SHARP.indexOf(root);
    if (rootIndex === -1) return [];

    // Check for Open Chord matches first if variant is 0 (Open)
    if (variant === 0) {
        let openShape: number[] | null = null;

        if (OPEN_CHORDS[root] && OPEN_CHORDS[root][quality]) {
            openShape = OPEN_CHORDS[root][quality];
        }
        // Fallback or "Easy" mappings
        else if (root === 'A' && quality === 'Min7') openShape = [-1, 0, 2, 0, 1, 0];
        else if (root === 'E' && quality === 'Min7') openShape = [0, 2, 0, 0, 0, 0];
        else if (root === 'D' && quality === 'Maj7') openShape = [-1, -1, 0, 2, 2, 2];
        else if (root === 'C' && quality === 'Add9') openShape = [-1, 3, 2, 0, 3, 0];

        if (openShape) {
            return openShape;
        }
    }

    // Default Barre Chords Calculation (E-shape and A-shape)
    // E-Shape Root (String 6): E=0, F=1, F#=2, G=3...
    // A-Shape Root (String 5): A=0, A#=1...

    // Determine target fret for E-shape
    // E is 0. Root index of E is 4.
    // (RootIndex - 4 + 12) % 12
    const eShapeFret = (rootIndex - 4 + 12) % 12;

    // Determine target fret for A-shape
    // A is 9. Root index of A is 9.
    // (RootIndex - 9 + 12) % 12
    const aShapeFret = (rootIndex - 9 + 12) % 12;

    // Define base shapes (offsets from barre)
    // Format: relative frets. 0 = barre.
    let baseShape = [];
    let barreFret = 0;

    // Strategy: Prefer lower frets (closer to nut)
    // Unless specifically toggled to variant 1 (Barre)

    // Choose shape based on fret position to avoid super high frets
    const useEShape = eShapeFret <= 7;

    // If variant 1 is requested, and we defaulted to open (which failed), we force barre.
    // Logic: 
    // Variant 0: Prefer Open -> Then Lowest Barre
    // Variant 1: Force Alternative Barre (or higher inversion)

    if (useEShape) {
        barreFret = eShapeFret;
        // E-shape definitions
        if (quality === 'Major') baseShape = [0, 2, 2, 1, 0, 0];
        else if (quality === 'Minor') baseShape = [0, 2, 2, 0, 0, 0];
        else if (quality === '7') baseShape = [0, 2, 0, 1, 0, 0];
        else if (quality === 'Min7') baseShape = [0, 2, 0, 0, 0, 0]; // 020000 relative
        else if (quality === 'Maj7') baseShape = [0, 2, 1, 1, 0, 0]; // 021100 relative
        else baseShape = [0, 2, 2, 1, 0, 0]; // Fallback Major
    } else {
        barreFret = aShapeFret;
        // A-shape definitions (String 6 is mute usually)
        if (quality === 'Major') baseShape = [-1, 0, 2, 2, 2, 0];
        else if (quality === 'Minor') baseShape = [-1, 0, 2, 2, 1, 0];
        else if (quality === '7') baseShape = [-1, 0, 2, 0, 2, 0];
        else if (quality === 'Min7') baseShape = [-1, 0, 2, 0, 1, 0];
        else if (quality === 'Maj7') baseShape = [-1, 0, 2, 1, 2, 0];
        else baseShape = [-1, 0, 2, 2, 2, 0]; // Fallback Major
    }

    // Determine if we swap based on variant
    if (variant === 1) {
        // Find the "Other" shape. If we picked E, pick A (possibly higher up)
        if (useEShape) {
            barreFret = aShapeFret;
            // A-shape definitions
            if (quality === 'Major') baseShape = [-1, 0, 2, 2, 2, 0];
            else if (quality === 'Minor') baseShape = [-1, 0, 2, 2, 1, 0];
            else if (quality === '7') baseShape = [-1, 0, 2, 0, 2, 0];
            else if (quality === 'Min7') baseShape = [-1, 0, 2, 0, 1, 0];
            else if (quality === 'Maj7') baseShape = [-1, 0, 2, 1, 2, 0];
            else baseShape = [-1, 0, 2, 2, 2, 0];
        } else {
            barreFret = eShapeFret;
            // E-shape definitions
            if (quality === 'Major') baseShape = [0, 2, 2, 1, 0, 0];
            else if (quality === 'Minor') baseShape = [0, 2, 2, 0, 0, 0];
            else if (quality === '7') baseShape = [0, 2, 0, 1, 0, 0];
            else if (quality === 'Min7') baseShape = [0, 2, 0, 0, 0, 0];
            else if (quality === 'Maj7') baseShape = [0, 2, 1, 1, 0, 0];
            else baseShape = [0, 2, 2, 1, 0, 0];
        }
    }

    // Apply offset
    return baseShape.map(fret => fret === -1 ? -1 : fret + barreFret);
}
