export type Genre = 'rock' | 'blues';

export interface GenreDefinition {
    id: Genre;
    label: string;
    feel: 'straight' | 'shuffle';
    defaultBpm: number;
    description: string;
}

export const GENRES: Record<Genre, GenreDefinition> = {
    rock: {
        id: 'rock',
        label: 'Rock',
        feel: 'straight',
        defaultBpm: 110,
        description: '8th-note groove, kick på 1+3, snare på 2+4.',
    },
    blues: {
        id: 'blues',
        label: 'Blues',
        feel: 'shuffle',
        defaultBpm: 90,
        description: '12-takters shuffle med walking bass.',
    },
};

export const GENRE_ORDER: Genre[] = ['rock', 'blues'];
