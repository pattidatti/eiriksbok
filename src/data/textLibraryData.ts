export interface TextEntry {
    id: string;
    title: string;
    author: string;
    genre: string;
    theme?: string;
    language?: 'bm.' | 'nn.';
    url?: string;
}

export const textLibraryData: TextEntry[] = [
    {
        id: 'twitter-noveller',
        title: 'Twitter-noveller',
        author: 'Frode Grytten',
        genre: 'Novelle',
        language: 'nn.',
        theme: 'Moderne kommunikasjon'
    },
    {
        id: 'sma-nokler-store-rom',
        title: 'Små nøkler, store rom',
        author: 'Bjørg Vik',
        genre: 'Romanutdrag',
        language: 'bm.',
        theme: 'Oppvekst'
    },
    {
        id: 'barsakh',
        title: 'Barsakh',
        author: 'Simon Stranger',
        genre: 'Romanutdrag',
        language: 'bm.',
        theme: 'Flukt'
    },
    {
        id: 'hjorten-i-skogbrynet',
        title: 'Hjorten i skogbrynet',
        author: 'Gunnhild Øyehaug',
        genre: 'Novelle',
        language: 'nn.',
        theme: 'Natur'
    },
    {
        id: 'mennesker-pa-kafe',
        title: 'Mennesker på kafé',
        author: 'Kjell Askildsen',
        genre: 'Novelle',
        language: 'bm.',
        theme: 'Ensomhet'
    },
    {
        id: 'alt-blir-som-for',
        title: 'Alt blir som før',
        author: 'Ari Behn',
        genre: 'Novelle',
        language: 'bm.',
        theme: 'Relasjoner'
    },
    {
        id: 'ung-gutt-i-sno',
        title: 'Ung gutt i snø',
        author: 'Bjarte Breiteig',
        genre: 'Novelle',
        language: 'bm.',
        theme: 'Ungdom'
    },
    {
        id: 'a-drepe-et-barn',
        title: 'Å drepe et barn',
        author: 'Stig Dagermann',
        genre: 'Novelle',
        language: 'bm.',
        theme: 'Skjebne'
    },
    {
        id: 'dypfryst',
        title: 'Dypfryst',
        author: 'Roald Dahl',
        genre: 'Novelle',
        language: 'bm.',
        theme: 'Krim/Spenning'
    },
    {
        id: 'det-usynlige-barnet',
        title: 'Det usynlige barnet',
        author: 'Tove Jansson',
        genre: 'Novelle',
        language: 'bm.',
        theme: 'Identitet'
    }
];
