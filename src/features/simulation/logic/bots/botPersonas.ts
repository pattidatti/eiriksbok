
import type { Role } from '../../simulationTypes';

export interface BotPersona {
    id: string;
    name: string;
    description: string;
    priorities: {
        work: number;       // 0-1: Desire to gather resources
        eat: number;        // 0-1: Desire to keep stamina high
        upgrade: number;    // 0-1: Desire to buy upgrades
        tax: number;        // 0-1: Desire to pay taxes (Compliance)
        revolt: number;     // 0-1: Desire to cause chaos/bribe
        defend: number;     // 0-1: Desire to join siege defense
        attack: number;     // 0-1: Desire to join siege attack
    };
    preferredRoles: Role[];
}

export const BOT_PERSONAS: Record<string, BotPersona> = {
    'DILIGENT_PEASANT': {
        id: 'DILIGENT_PEASANT',
        name: 'Den Flittige Bonden',
        description: 'Fokuserer på arbeid, mat og skatt. En mønsterborger.',
        priorities: {
            work: 0.8,
            eat: 0.9,       // Always eats when hungry
            upgrade: 0.4,
            tax: 0.9,       // Pays tax promptly
            revolt: 0.05,
            defend: 0.6,
            attack: 0.1
        },
        preferredRoles: ['PEASANT']
    },
    'GREEDY_MERCHANT': {
        id: 'GREEDY_MERCHANT',
        name: 'Den Grådige Handelsmannen',
        description: 'Kjøper lavt, selger høyt. Unngår skatt.',
        priorities: {
            work: 0.3,
            eat: 0.8,
            upgrade: 0.9,   // Loves investing
            tax: 0.2,       // Hates tax
            revolt: 0.4,    // Will bribe if profitable
            defend: 0.2,
            attack: 0.1
        },
        preferredRoles: ['MERCHANT', 'PEASANT']
    },
    'ANARCHIST': {
        id: 'ANARCHIST',
        name: 'Opprøreren',
        description: 'Vil bare se verden brenne. Bruker gull på bestikkelser.',
        priorities: {
            work: 0.5,      // Works just enough to afford bribes
            eat: 0.6,
            upgrade: 0.1,
            tax: 0.0,       // Never pays tax
            revolt: 1.0,    // Primary goal
            defend: 0.0,
            attack: 0.9     // Loves attacking castles
        },
        preferredRoles: ['PEASANT', 'SOLDIER']
    },
    'LOYAL_SOLDIER': {
        id: 'LOYAL_SOLDIER',
        name: 'Den Lojale Vakten',
        description: 'Beskytter riket. Slår ned opprør.',
        priorities: {
            work: 0.4,
            eat: 0.8,
            upgrade: 0.5,
            tax: 0.7,
            revolt: 0.0,
            defend: 1.0,    // Primary goal
            attack: 0.2
        },
        preferredRoles: ['SOLDIER']
    },
    'AMBITIOUS_CLIMBER': {
        id: 'AMBITIOUS_CLIMBER',
        name: 'Klatreren',
        description: 'Vil bli Baron for enhver pris. Klagete.',
        priorities: {
            work: 0.6,      // Needs gold for bribes
            eat: 0.7,
            upgrade: 0.8,   // Needs status
            tax: 0.1,       // Hates weak rulers
            revolt: 0.9,    // Primary goal: Destabilize
            defend: 0.2,
            attack: 0.5
        },
        preferredRoles: ['PEASANT', 'MERCHANT', 'SOLDIER']
    }
};
