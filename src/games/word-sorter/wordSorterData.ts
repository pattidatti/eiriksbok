export type WordClassId = 'substantiv' | 'verb' | 'adjektiv' | 'pronomen' | 'preposisjon' | 'adverb' | 'konjunksjon';

export interface WordClass {
    id: WordClassId;
    label: string;
    emoji: string;
    description: string;
    descriptionLong: string;
    color: string;
}

export interface WordItem {
    id: string;
    text: string;
    classId: WordClassId;
}

export const wordClasses: WordClass[] = [
    {
        id: 'substantiv',
        label: 'Substantiv',
        emoji: '📦',
        description: 'Ting, navn, steder',
        descriptionLong: 'Navn på personer, steder, ting, ideer eller følelser. Kan settes "en", "ei" eller "et" foran.',
        color: 'bg-blue-500'
    },
    {
        id: 'verb',
        label: 'Verb',
        emoji: '🏃',
        description: 'Handlinger, å gjøre',
        descriptionLong: 'Ord som beskriver handlinger eller tilstander. Kan settes "å" foran (i infinitiv).',
        color: 'bg-red-500'
    },
    {
        id: 'adjektiv',
        label: 'Adjektiv',
        emoji: '🎨',
        description: 'Beskriver ting',
        descriptionLong: 'Ord som beskriver substantiver (hvordan noe ser ut, føles, er).',
        color: 'bg-green-500'
    },
    {
        id: 'pronomen',
        label: 'Pronomen',
        emoji: '👉',
        description: 'I stedet for navn',
        descriptionLong: 'Ord som står i stedet for et navn eller substantiv (jeg, du, han, den).',
        color: 'bg-yellow-500'
    },
    {
        id: 'preposisjon',
        label: 'Preposisjon',
        emoji: '📍',
        description: 'Sted og tid',
        descriptionLong: 'Små ord som forteller hvor noe er eller når det skjer (på, i, under, før).',
        color: 'bg-purple-500'
    },
    {
        id: 'adverb',
        label: 'Adverb',
        emoji: '🚀',
        description: 'Beskriver handlinger',
        descriptionLong: 'Ord som forklarer mer om verbet (når, hvor, hvordan noe gjøres).',
        color: 'bg-orange-500'
    },
    {
        id: 'konjunksjon',
        label: 'Konjunksjon',
        emoji: '🔗',
        description: 'Bindeord',
        descriptionLong: 'Ord som binder sammen setninger eller ord (og, men, eller, for).',
        color: 'bg-pink-500'
    }
];

export const words: WordItem[] = [
    // Substantiv
    { id: 's1', text: 'Bilen', classId: 'substantiv' },
    { id: 's2', text: 'Huset', classId: 'substantiv' },
    { id: 's3', text: 'Glede', classId: 'substantiv' },
    { id: 's4', text: 'Norge', classId: 'substantiv' },
    { id: 's5', text: 'Eplet', classId: 'substantiv' },
    { id: 's6', text: 'Datamaskin', classId: 'substantiv' },
    { id: 's7', text: 'Frihet', classId: 'substantiv' },

    // Verb
    { id: 'v1', text: 'Løper', classId: 'verb' },
    { id: 'v2', text: 'Spise', classId: 'verb' },
    { id: 'v3', text: 'Tenker', classId: 'verb' },
    { id: 'v4', text: 'Hoppet', classId: 'verb' },
    { id: 'v5', text: 'Sover', classId: 'verb' },
    { id: 'v6', text: 'Lese', classId: 'verb' },
    { id: 'v7', text: 'Er', classId: 'verb' },

    // Adjektiv
    { id: 'a1', text: 'Rød', classId: 'adjektiv' },
    { id: 'a2', text: 'Stor', classId: 'adjektiv' },
    { id: 'a3', text: 'Snill', classId: 'adjektiv' },
    { id: 'a4', text: 'Vakum', classId: 'adjektiv' }, // Kanskje litt rart ord, men ok
    { id: 'a5', text: 'Morsom', classId: 'adjektiv' },
    { id: 'a6', text: 'Tung', classId: 'adjektiv' },
    { id: 'a7', text: 'Gammel', classId: 'adjektiv' },

    // Pronomen
    { id: 'p1', text: 'Jeg', classId: 'pronomen' },
    { id: 'p2', text: 'Du', classId: 'pronomen' },
    { id: 'p3', text: 'Hun', classId: 'pronomen' },
    { id: 'p4', text: 'Vi', classId: 'pronomen' },
    { id: 'p5', text: 'De', classId: 'pronomen' },
    { id: 'p6', text: 'Meg', classId: 'pronomen' },

    // Preposisjon
    { id: 'pr1', text: 'På', classId: 'preposisjon' },
    { id: 'pr2', text: 'I', classId: 'preposisjon' },
    { id: 'pr3', text: 'Under', classId: 'preposisjon' },
    { id: 'pr4', text: 'Over', classId: 'preposisjon' },
    { id: 'pr5', text: 'Mellom', classId: 'preposisjon' },
    { id: 'pr6', text: 'Bak', classId: 'preposisjon' },

    // Adverb
    { id: 'ad1', text: 'Nå', classId: 'adverb' },
    { id: 'ad2', text: 'Aldri', classId: 'adverb' },
    { id: 'ad3', text: 'Hjemme', classId: 'adverb' },
    { id: 'ad4', text: 'Fort', classId: 'adverb' },
    { id: 'ad5', text: 'Pent', classId: 'adverb' },
    { id: 'ad6', text: 'Ikke', classId: 'adverb' },

    // Konjunksjon
    { id: 'k1', text: 'Og', classId: 'konjunksjon' },
    { id: 'k2', text: 'Men', classId: 'konjunksjon' },
    { id: 'k3', text: 'Eller', classId: 'konjunksjon' },
    { id: 'k4', text: 'For', classId: 'konjunksjon' }
];
