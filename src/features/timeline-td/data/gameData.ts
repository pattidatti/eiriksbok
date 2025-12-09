import type { EnemyType, TowerType } from "../store/gameStore";

export type WaveEnemy = {
    type: EnemyType;
    count: number;
    interval: number; // ms between spawns
    hpMultiplier?: number;
    speedMultiplier?: number;
};

export type Wave = {
    id: number;
    name: string;
    description: string;
    enemies: WaveEnemy[];
    reward: number; // Gold for clearing wave
};

export const WAVES: Wave[] = [
    {
        id: 1,
        name: "Mørketiden",
        description: "En rolig start. Uvitenheten sprer seg.",
        reward: 100,
        enemies: [
            { type: 'IGNORANCE', count: 5, interval: 2000, speedMultiplier: 0.8 }
        ]
    },
    {
        id: 2,
        name: "Pesten Kommer",
        description: "Raskere fiender truer befolkningen.",
        reward: 150,
        enemies: [
            { type: 'IGNORANCE', count: 3, interval: 1500 },
            { type: 'BLACK_DEATH', count: 3, interval: 1000, speedMultiplier: 1.2 }
        ]
    },
    {
        id: 3,
        name: "Krig og Konflikt",
        description: "Sterkere fiender som tåler mer.",
        reward: 200,
        enemies: [
            { type: 'WAR', count: 2, interval: 3000, hpMultiplier: 1.5 },
            { type: 'IGNORANCE', count: 8, interval: 800 }
        ]
    },
    {
        id: 4,
        name: "Inflasjon",
        description: "Mange fiender på en gang!",
        reward: 250,
        enemies: [
            { type: 'INFLATION', count: 10, interval: 500, hpMultiplier: 0.5, speedMultiplier: 1.5 }
        ]
    },
    {
        id: 5,
        name: "Den Store Krisen",
        description: "Sjefsbølge! Alt på en gang.",
        reward: 500,
        enemies: [
            { type: 'WAR', count: 3, interval: 2000 },
            { type: 'BLACK_DEATH', count: 5, interval: 1000 },
            { type: 'IGNORANCE', count: 10, interval: 500 }
        ]
    }
];

export const TOWER_STATS: Record<TowerType, { name: string, cost: number, range: number, damage: number, cooldown: number, description: string }> = {
    'GUTENBERG': {
        name: 'Gutenberg',
        cost: 100,
        range: 120,
        damage: 15,
        cooldown: 0.8,
        description: 'Rask skyting, billig.'
    },
    'DA_VINCI': {
        name: 'Da Vinci',
        cost: 250,
        range: 150,
        damage: 40,
        cooldown: 2.0,
        description: 'Høy skade, langsom.'
    },
    'TESLA': {
        name: 'Tesla',
        cost: 400,
        range: 100,
        damage: 5,
        cooldown: 0.1,
        description: 'Lynrask stråle.'
    },
    'NEWTON': {
        name: 'Newton',
        cost: 150,
        range: 130,
        damage: 10,
        cooldown: 1.0,
        description: 'Balanseer.'
    }
};
