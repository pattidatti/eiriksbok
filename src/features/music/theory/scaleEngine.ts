import { NOTES_SHARP } from '../utils/musicTheory';

export type ScaleFamily =
    | 'pentatonic-major'
    | 'pentatonic-minor'
    | 'blues'
    | 'major'
    | 'minor'
    | 'dorian'
    | 'phrygian'
    | 'lydian'
    | 'mixolydian'
    | 'locrian'
    | 'arpeggio';

export interface ScaleDefinition {
    id: ScaleFamily;
    label: string;
    intervals: number[];
    description: string;
}

export const SCALES: Record<ScaleFamily, ScaleDefinition> = {
    'pentatonic-minor': {
        id: 'pentatonic-minor',
        label: 'Pentaton (moll)',
        intervals: [0, 3, 5, 7, 10],
        description: 'Den vanligste solo-skalaen i rock og blues.',
    },
    'pentatonic-major': {
        id: 'pentatonic-major',
        label: 'Pentaton (dur)',
        intervals: [0, 2, 4, 7, 9],
        description: 'Lys og åpen pentaton, mye brukt i country og pop.',
    },
    blues: {
        id: 'blues',
        label: 'Blues-skala',
        intervals: [0, 3, 5, 6, 7, 10],
        description: 'Mollpentaton pluss blue note (b5).',
    },
    major: {
        id: 'major',
        label: 'Dur (ionisk)',
        intervals: [0, 2, 4, 5, 7, 9, 11],
        description: 'Standard dur-skala.',
    },
    minor: {
        id: 'minor',
        label: 'Naturlig moll (aeolisk)',
        intervals: [0, 2, 3, 5, 7, 8, 10],
        description: 'Standard moll-skala.',
    },
    dorian: {
        id: 'dorian',
        label: 'Dorisk',
        intervals: [0, 2, 3, 5, 7, 9, 10],
        description: 'Moll med stor sekst. Jazz, funk, folk.',
    },
    phrygian: {
        id: 'phrygian',
        label: 'Frygisk',
        intervals: [0, 1, 3, 5, 7, 8, 10],
        description: 'Moll med liten sekund. Flamenco, metal.',
    },
    lydian: {
        id: 'lydian',
        label: 'Lydisk',
        intervals: [0, 2, 4, 6, 7, 9, 11],
        description: 'Dur med forhøyet kvart. Drømmende, film.',
    },
    mixolydian: {
        id: 'mixolydian',
        label: 'Miksolydisk',
        intervals: [0, 2, 4, 5, 7, 9, 10],
        description: 'Dur med liten septim. Blues, rock, country.',
    },
    locrian: {
        id: 'locrian',
        label: 'Lokrisk',
        intervals: [0, 1, 3, 5, 6, 8, 10],
        description: 'Mørk modus med forminsket kvint.',
    },
    arpeggio: {
        id: 'arpeggio',
        label: 'Arpeggio (akkord-toner)',
        intervals: [0, 4, 7],
        description: 'Kun tonene i den aktive akkorden.',
    },
};

export const SCALE_ORDER: ScaleFamily[] = [
    'pentatonic-minor',
    'pentatonic-major',
    'blues',
    'major',
    'minor',
    'dorian',
    'phrygian',
    'lydian',
    'mixolydian',
    'locrian',
    'arpeggio',
];

export interface ScalePitchClass {
    pitchClass: number;
    note: string;
    interval: number;
    isRoot: boolean;
}

export function getScalePitchClasses(rootNote: string, family: ScaleFamily): ScalePitchClass[] {
    const rootIndex = NOTES_SHARP.indexOf(rootNote);
    if (rootIndex === -1) return [];
    const intervals = SCALES[family].intervals;
    return intervals.map((interval) => {
        const pitchClass = (rootIndex + interval) % 12;
        return {
            pitchClass,
            note: NOTES_SHARP[pitchClass],
            interval,
            isRoot: interval === 0,
        };
    });
}

const INTERVAL_NAMES: Record<number, string> = {
    0: 'R',
    1: 'b2',
    2: '2',
    3: 'b3',
    4: '3',
    5: '4',
    6: 'b5',
    7: '5',
    8: 'b6',
    9: '6',
    10: 'b7',
    11: '7',
};

export function intervalToDegree(interval: number): string {
    return INTERVAL_NAMES[interval] ?? '?';
}

export function detectKeyFromChord(chordRoot: string, quality: string): { root: string; family: ScaleFamily } {
    const isMinor = quality === 'Minor' || quality === 'Min7' || quality === 'Dim';
    return {
        root: chordRoot,
        family: isMinor ? 'pentatonic-minor' : 'pentatonic-major',
    };
}
