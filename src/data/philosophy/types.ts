export type PhilosophyAxis = 'rationalism' | 'empiricism' | 'stoicism' | 'epicureanism' | 'idealism' | 'materialism';

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
