export type PhilosophyAxis =
    | 'rationalism' | 'empiricism'
    | 'stoicism' | 'epicureanism'
    | 'idealism' | 'materialism'
    | 'individualism' | 'collectivism'
    | 'existentialism' | 'essentialism'
    | 'skepticism' | 'dogmatism';

export const AXIS_PAIRS: [PhilosophyAxis, PhilosophyAxis][] = [
    ['rationalism', 'empiricism'],
    ['stoicism', 'epicureanism'],
    ['idealism', 'materialism'],
    ['individualism', 'collectivism'],
    ['existentialism', 'essentialism'],
    ['skepticism', 'dogmatism'],
];

export const AXIS_LABELS: Record<PhilosophyAxis, string> = {
    rationalism: 'Rasjonalisme',
    empiricism: 'Empirisme',
    stoicism: 'Stoisme',
    epicureanism: 'Epikureisme',
    idealism: 'Idealisme',
    materialism: 'Materialisme',
    individualism: 'Individualisme',
    collectivism: 'Kollektivisme',
    existentialism: 'Eksistensialisme',
    essentialism: 'Essensialisme',
    skepticism: 'Skeptisisme',
    dogmatism: 'Dogmatisme',
};

export type Era = 'antikken' | 'middelalder' | 'opplysning' | 'moderne';

export const ERA_LABELS: Record<Era, string> = {
    antikken: 'Antikken',
    middelalder: 'Middelalderen',
    opplysning: 'Opplysningstiden',
    moderne: 'Moderne tid',
};

export interface PhilosophyProfile {
    xp: number;
    level: number;
    completedQuests: string[];
    alignment: Record<PhilosophyAxis, number>;
    achievements: string[];
    lastActive: number;
}

export interface DialogueChoice {
    id: string;
    text: string;
    impact: Partial<Record<PhilosophyAxis, number>>;
    nextStepId?: string;
    feedback?: string;
}

export interface DialogueStep {
    id: string;
    speaker: string;
    text: string;
    choices: DialogueChoice[];
    image?: string;
}

export interface PhilosophyQuest {
    id: string;
    title: string;
    description: string;
    mentor: string;
    initialStepId: string;
    steps: DialogueStep[];
    rewardXp: number;
    reflectionQuestions?: string[];
}

export interface QuestProgress {
    questId: string;
    stepId: string;
    history: string[];
}

export const AXIS_DESCRIPTIONS: Record<PhilosophyAxis, string> = {
    rationalism: 'Du stoler på logikk og fornuft for å finne sannhet.',
    empiricism: 'Du stoler på erfaring og sanser for å finne sannhet.',
    stoicism: 'Du mener plikt og selvkontroll er viktigst.',
    epicureanism: 'Du mener lykke og nytelse er målet med livet.',
    idealism: 'Du tror på en høyere virkelighet bak det vi kan se.',
    materialism: 'Du tror bare det fysiske og målbare er virkelig.',
    individualism: 'Du setter individets frihet høyt.',
    collectivism: 'Du mener fellesskapet er viktigere enn enkeltpersonen.',
    existentialism: 'Du mener vi må skape vår egen mening i livet.',
    essentialism: 'Du tror ting har en fast natur eller hensikt.',
    skepticism: 'Du stiller spørsmål ved alt og tviler på sikker kunnskap.',
    dogmatism: 'Du stoler på faste regler og sannheter.',
};

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (profile: PhilosophyProfile) => boolean;
}
