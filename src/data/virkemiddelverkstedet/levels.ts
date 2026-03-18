import type { Level, ApplyLevel } from './types';

export const LEVEL_INFO: { level: Level; title: string; description: string }[] = [
    { level: 1, title: 'Grunnleggende', description: 'Lær å kjenne igjen virkemiddelet.' },
    { level: 2, title: 'Utforsker', description: 'Finn virkemiddelet i korte tekster.' },
    { level: 3, title: 'Viderekommen', description: 'Forstå hva virkemiddelet betyr.' },
    { level: 4, title: 'Skribent', description: 'Skriv egne eksempler.' },
    { level: 5, title: 'Detektiv', description: 'Finn feil og mangler i analyser.' },
    { level: 6, title: 'Analytiker', description: 'Analyser lengre tekster.' },
    { level: 7, title: 'Kritiker', description: 'Vurder og sammenlign virkemidler.' },
    { level: 8, title: 'Sorteringsekspert', description: 'Skill mellom flere virkemidler.' },
    { level: 9, title: 'Mester', description: 'Kombiner alt du har lært.' },
    { level: 10, title: 'Magister', description: 'Den ultimate testen.' },
];

export const APPLY_LEVEL_INFO: { level: ApplyLevel; title: string; description: string }[] = [
    { level: 1, title: 'Lærling', description: 'Sett inn og velg riktig virkemiddel.' },
    { level: 2, title: 'Svenn', description: 'Skriv om og koble virkemidler til kontekst.' },
    { level: 3, title: 'Mester', description: 'Fiks, forbedre og anvend kreativt.' },
];

export const getLevelName = (level: Level): string => {
    return LEVEL_INFO.find((l) => l.level === level)?.title || `Nivå ${level}`;
};

export const getApplyLevelName = (level: ApplyLevel): string => {
    return APPLY_LEVEL_INFO.find((l) => l.level === level)?.title || `Nivå ${level}`;
};
