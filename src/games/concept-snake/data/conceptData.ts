import type { ConceptLevel } from '../types';

export const levels: ConceptLevel[] = [
    {
        id: 'metafor',
        name: 'Metaforer',
        topic: 'Retorikk',
        description: 'Spis ordene som er metaforer. Unngå sammenligninger (ord med "som" eller "lik").',
        targetConcept: 'Metafor',
        correctExamples: [
            'Du er en stjerne',
            'Tiden flyr',
            'Livet er en reise',
            'Et hav av muligheter',
            'Hjertet av byen',
            'Han er en rev',
            'Hun er en engel',
            'Muren av taushet',
            'Ideene blomstret',
            'En kald skulder'
        ],
        wrongExamples: [
            'Du er som en sol',
            'Rask som en bil',
            'Kald som is',
            'Sulten som en ulv',
            'Fri som fuglen',
            'Lur som en rev',
            'Sinth som en tyr',
            'Kla som et egg',
            'Stille som en mus',
            'Hvit som snø'
        ]
    },
    {
        id: 'verb',
        name: 'Verb',
        topic: 'Grammatikk',
        description: 'Spis ordene som er VERB. Unngå substantiv og adjektiv.',
        targetConcept: 'Verb',
        correctExamples: [
            'Løpe', 'Hoppe', 'Spise', 'Sove', 'Tenke', 'Drømme', 'Kjøre', 'Finne', 'Være', 'Ha'
        ],
        wrongExamples: [
            'Bil', 'Hus', 'Rød', 'Stor', 'Glad', 'Hund', 'Katt', 'Fort', 'Sakte', 'Norge'
        ]
    }
];
