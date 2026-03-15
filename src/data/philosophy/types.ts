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
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (profile: PhilosophyProfile) => boolean;
}
