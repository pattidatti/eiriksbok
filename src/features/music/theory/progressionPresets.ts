import { NOTES_SHARP } from '../utils/musicTheory';

export interface PresetChord {
    root: string;
    quality: string;
}

interface ChordPattern {
    semitones: number;
    quality: string;
}

export interface ProgressionPattern {
    id: string;
    name: string;
    description: string;
    keyType: 'major' | 'minor' | 'any';
    genre: 'rock' | 'pop' | 'blues' | 'jazz' | 'classic';
    pattern: ChordPattern[];
}

export function transposePattern(pattern: ChordPattern[], rootNote: string): PresetChord[] {
    const rootIndex = NOTES_SHARP.indexOf(rootNote);
    if (rootIndex === -1) return [];
    return pattern.map(({ semitones, quality }) => ({
        root: NOTES_SHARP[(rootIndex + semitones) % 12],
        quality,
    }));
}

export const PROGRESSION_PATTERNS: ProgressionPattern[] = [
    // ── DUR ────────────────────────────────────────────────────────────────────
    {
        id: 'major-i-v-vi-iv',
        name: 'I–V–vi–IV',
        description: 'Den mest brukte pop-progresjonen. Brukt i tusenvis av låter.',
        keyType: 'major',
        genre: 'pop',
        pattern: [
            { semitones: 0, quality: 'Major' },
            { semitones: 7, quality: 'Major' },
            { semitones: 9, quality: 'Minor' },
            { semitones: 5, quality: 'Major' },
        ],
    },
    {
        id: 'major-i-vi-iv-v',
        name: 'I–vi–IV–V',
        description: '50-talls doo-wop. Høres kjent ut fra utallige klassikere.',
        keyType: 'major',
        genre: 'pop',
        pattern: [
            { semitones: 0, quality: 'Major' },
            { semitones: 9, quality: 'Minor' },
            { semitones: 5, quality: 'Major' },
            { semitones: 7, quality: 'Major' },
        ],
    },
    {
        id: 'major-i-iii-iv-v',
        name: 'I–iii–IV–V',
        description: 'Lyrisk og varm dur-progresjon.',
        keyType: 'major',
        genre: 'pop',
        pattern: [
            { semitones: 0, quality: 'Major' },
            { semitones: 4, quality: 'Minor' },
            { semitones: 5, quality: 'Major' },
            { semitones: 7, quality: 'Major' },
        ],
    },
    {
        id: 'major-i-iv-i-v',
        name: 'I–IV–I–V',
        description: 'Enkel vers-refreng. Grunnleggende og effektiv.',
        keyType: 'major',
        genre: 'classic',
        pattern: [
            { semitones: 0, quality: 'Major' },
            { semitones: 5, quality: 'Major' },
            { semitones: 0, quality: 'Major' },
            { semitones: 7, quality: 'Major' },
        ],
    },
    {
        id: 'major-i-iv-v',
        name: 'I–IV–V',
        description: 'Klassisk I-IV-V. Grunnlaget for blues, rock og country.',
        keyType: 'major',
        genre: 'rock',
        pattern: [
            { semitones: 0, quality: 'Major' },
            { semitones: 5, quality: 'Major' },
            { semitones: 7, quality: 'Major' },
            { semitones: 0, quality: 'Major' },
        ],
    },
    {
        id: 'major-i-bvii-iv',
        name: 'I–bVII–IV',
        description: 'Miksolydisk rock-hook. Kraftfull og åpen.',
        keyType: 'major',
        genre: 'rock',
        pattern: [
            { semitones: 0, quality: 'Major' },
            { semitones: 10, quality: 'Major' },
            { semitones: 5, quality: 'Major' },
            { semitones: 0, quality: 'Major' },
        ],
    },
    {
        id: 'major-i-iii-iv-iv-minor',
        name: 'I–III–IV–iv',
        description: 'Dramatisk effekt med det uventede moll-IV.',
        keyType: 'major',
        genre: 'rock',
        pattern: [
            { semitones: 0, quality: 'Major' },
            { semitones: 4, quality: 'Major' },
            { semitones: 5, quality: 'Major' },
            { semitones: 5, quality: 'Minor' },
        ],
    },
    {
        id: 'major-i-v-iv',
        name: 'I–V–IV',
        description: 'Retro rock. Enkel og driv.',
        keyType: 'major',
        genre: 'rock',
        pattern: [
            { semitones: 0, quality: 'Major' },
            { semitones: 7, quality: 'Major' },
            { semitones: 5, quality: 'Major' },
            { semitones: 0, quality: 'Major' },
        ],
    },
    {
        id: 'major-ii-v-i',
        name: 'ii–V–I',
        description: 'Jazz-kadensens fundament. Glatt og resolverende.',
        keyType: 'major',
        genre: 'jazz',
        pattern: [
            { semitones: 2, quality: 'Min7' },
            { semitones: 7, quality: '7' },
            { semitones: 0, quality: 'Maj7' },
            { semitones: 0, quality: 'Maj7' },
        ],
    },
    {
        id: 'major-i-vi-ii-v',
        name: 'I–vi–ii–V',
        description: 'Jazz-turnaround. Sirkulerer tilbake til tonika.',
        keyType: 'major',
        genre: 'jazz',
        pattern: [
            { semitones: 0, quality: 'Maj7' },
            { semitones: 9, quality: 'Min7' },
            { semitones: 2, quality: 'Min7' },
            { semitones: 7, quality: '7' },
        ],
    },
    {
        id: 'major-i-iv-ii-v',
        name: 'I–IV–ii–V',
        description: 'Variert dur-progresjon med bevegelse.',
        keyType: 'major',
        genre: 'classic',
        pattern: [
            { semitones: 0, quality: 'Major' },
            { semitones: 5, quality: 'Major' },
            { semitones: 2, quality: 'Minor' },
            { semitones: 7, quality: 'Major' },
        ],
    },
    // ── MOLL ───────────────────────────────────────────────────────────────────
    {
        id: 'minor-i-vi-iii-vii',
        name: 'i–VI–III–VII',
        description: 'Episk moll. Brukt i film, metal og pop-moll.',
        keyType: 'minor',
        genre: 'rock',
        pattern: [
            { semitones: 0, quality: 'Minor' },
            { semitones: 8, quality: 'Major' },
            { semitones: 3, quality: 'Major' },
            { semitones: 10, quality: 'Major' },
        ],
    },
    {
        id: 'minor-i-vii-vi-vii',
        name: 'i–VII–VI–VII',
        description: 'Naturlig moll-pendel. Rolig og melankolsk.',
        keyType: 'minor',
        genre: 'pop',
        pattern: [
            { semitones: 0, quality: 'Minor' },
            { semitones: 10, quality: 'Major' },
            { semitones: 8, quality: 'Major' },
            { semitones: 10, quality: 'Major' },
        ],
    },
    {
        id: 'minor-i-iv-v',
        name: 'i–iv–V',
        description: 'Harmonisk moll-kadens. Klassisk og resolverende.',
        keyType: 'minor',
        genre: 'classic',
        pattern: [
            { semitones: 0, quality: 'Minor' },
            { semitones: 5, quality: 'Minor' },
            { semitones: 7, quality: 'Major' },
            { semitones: 0, quality: 'Minor' },
        ],
    },
    {
        id: 'minor-i-vii-vi-v',
        name: 'i–VII–VI–V',
        description: 'Andalusisk nedgang. Flamenco og dramatisk rock.',
        keyType: 'minor',
        genre: 'classic',
        pattern: [
            { semitones: 0, quality: 'Minor' },
            { semitones: 10, quality: 'Major' },
            { semitones: 8, quality: 'Major' },
            { semitones: 7, quality: 'Major' },
        ],
    },
    {
        id: 'minor-i-vi-vii',
        name: 'i–VI–VII–i',
        description: 'Modern pop-moll. Enkel og kraftfull.',
        keyType: 'minor',
        genre: 'pop',
        pattern: [
            { semitones: 0, quality: 'Minor' },
            { semitones: 8, quality: 'Major' },
            { semitones: 10, quality: 'Major' },
            { semitones: 0, quality: 'Minor' },
        ],
    },
    {
        id: 'minor-i-iv-vii-iii',
        name: 'i–iv–VII–III',
        description: 'Sirkel-progresjon i moll. Beveger seg elegant.',
        keyType: 'minor',
        genre: 'classic',
        pattern: [
            { semitones: 0, quality: 'Minor' },
            { semitones: 5, quality: 'Minor' },
            { semitones: 10, quality: 'Major' },
            { semitones: 3, quality: 'Major' },
        ],
    },
    {
        id: 'minor-i-iv-i-v',
        name: 'i–iv–i–V',
        description: 'Klassisk moll med dominant-avslutning.',
        keyType: 'minor',
        genre: 'rock',
        pattern: [
            { semitones: 0, quality: 'Minor' },
            { semitones: 5, quality: 'Minor' },
            { semitones: 0, quality: 'Minor' },
            { semitones: 7, quality: 'Major' },
        ],
    },
    {
        id: 'minor-ii-dim-v-i',
        name: 'ii°–V–i',
        description: 'Jazz moll-kadens. Spent og resolverende.',
        keyType: 'minor',
        genre: 'jazz',
        pattern: [
            { semitones: 2, quality: 'Dim' },
            { semitones: 7, quality: '7' },
            { semitones: 0, quality: 'Minor' },
            { semitones: 0, quality: 'Minor' },
        ],
    },
    {
        id: 'minor-i-vi-iv-vii',
        name: 'i–VI–iv–VII',
        description: 'Mørkere moll med subdominant.',
        keyType: 'minor',
        genre: 'rock',
        pattern: [
            { semitones: 0, quality: 'Minor' },
            { semitones: 8, quality: 'Major' },
            { semitones: 5, quality: 'Minor' },
            { semitones: 10, quality: 'Major' },
        ],
    },
    // ── BLUES (fungerer i begge) ────────────────────────────────────────────────
    {
        id: 'blues-12-bar',
        name: '12-bar blues',
        description: 'Klassisk 12-takters blues. Grunnlaget for hele blues-sjangeren.',
        keyType: 'any',
        genre: 'blues',
        pattern: [
            { semitones: 0, quality: '7' },
            { semitones: 0, quality: '7' },
            { semitones: 0, quality: '7' },
            { semitones: 0, quality: '7' },
            { semitones: 5, quality: '7' },
            { semitones: 5, quality: '7' },
            { semitones: 0, quality: '7' },
            { semitones: 0, quality: '7' },
            { semitones: 7, quality: '7' },
            { semitones: 5, quality: '7' },
            { semitones: 0, quality: '7' },
            { semitones: 7, quality: '7' },
        ],
    },
    {
        id: 'blues-quick-change',
        name: '12-bar quick change',
        description: 'Blues med IV7 allerede i takt 2 for mer bevegelse.',
        keyType: 'any',
        genre: 'blues',
        pattern: [
            { semitones: 0, quality: '7' },
            { semitones: 5, quality: '7' },
            { semitones: 0, quality: '7' },
            { semitones: 0, quality: '7' },
            { semitones: 5, quality: '7' },
            { semitones: 5, quality: '7' },
            { semitones: 0, quality: '7' },
            { semitones: 0, quality: '7' },
            { semitones: 7, quality: '7' },
            { semitones: 5, quality: '7' },
            { semitones: 0, quality: '7' },
            { semitones: 7, quality: '7' },
        ],
    },
    {
        id: 'blues-minor',
        name: 'Moll-blues',
        description: 'Tung og mørk moll-blues.',
        keyType: 'any',
        genre: 'blues',
        pattern: [
            { semitones: 0, quality: 'Min7' },
            { semitones: 5, quality: 'Min7' },
            { semitones: 0, quality: 'Min7' },
            { semitones: 7, quality: '7' },
        ],
    },
    {
        id: 'blues-i-iv-v-simple',
        name: 'I7–IV7–V7',
        description: 'Enkel blues-kadens.',
        keyType: 'any',
        genre: 'blues',
        pattern: [
            { semitones: 0, quality: '7' },
            { semitones: 5, quality: '7' },
            { semitones: 7, quality: '7' },
            { semitones: 0, quality: '7' },
        ],
    },
];
