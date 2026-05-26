import type { Agent, ProductionStage, SimState } from '../types';

export const STAGE_DEFINITIONS: Omit<ProductionStage, 'laborers' | 'capital' | 'output' | 'price'>[] = [
    { id: 0, name: 'Forbruksvarer', order: 1 },
    { id: 1, name: 'Handel og distribusjon', order: 2 },
    { id: 2, name: 'Maskiner og utstyr', order: 3 },
    { id: 3, name: 'Halvfabrikata', order: 4 },
    { id: 4, name: 'Råvarer og gruvedrift', order: 5 },
];

export const AGENT_COUNT = 80;
export const WORLD_WIDTH = 800;
export const WORLD_HEIGHT = 500;

function mulberry32(seed: number) {
    let s = seed >>> 0;
    return function () {
        s = (s + 0x6D2B79F5) | 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export interface InitialStateOptions {
    seed?: number;
    avgTimePreference?: number;
    M?: number;
}

export function createInitialState(opts: InitialStateOptions = {}): SimState {
    const seed = opts.seed ?? 1337;
    const rand = mulberry32(seed);
    const avgTP = opts.avgTimePreference ?? 0.5;

    const agents: Agent[] = [];
    const naturalDistribution = { worker: 0.55, saver: 0.15, entrepreneur: 0.1, consumer: 0.2 } as const;
    const roles = Object.entries(naturalDistribution).flatMap(([role, share]) =>
        Array.from({ length: Math.round(AGENT_COUNT * share) }, () => role as Agent['role'])
    );

    while (roles.length < AGENT_COUNT) roles.push('worker');
    while (roles.length > AGENT_COUNT) roles.pop();

    for (let i = 0; i < AGENT_COUNT; i++) {
        const role = roles[i];
        const tpNoise = (rand() - 0.5) * 0.4;
        const timePreference = Math.max(0.1, Math.min(0.9, avgTP + tpNoise));

        agents.push({
            id: i,
            x: rand() * WORLD_WIDTH,
            y: rand() * WORLD_HEIGHT,
            role,
            stageEmployer: role === 'worker' ? Math.floor(rand() * STAGE_DEFINITIONS.length) : null,
            timePreference,
            wage: 100,
            savings: role === 'saver' ? 500 : 100,
            consumption: 80,
            mood: 'happy',
        });
    }

    const baseLaborersPerStage = Math.floor(AGENT_COUNT * naturalDistribution.worker) / STAGE_DEFINITIONS.length;
    const stages: ProductionStage[] = STAGE_DEFINITIONS.map((s) => ({
        ...s,
        laborers: baseLaborersPerStage,
        capital: 100 * (1 + s.order * 0.2),
        output: 100,
        price: 1.0,
    }));

    return {
        tick: 0,
        agents,
        stages,
        loanMarket: { supplied: 0, demanded: 0, clearingRate: 5 },
        money: { M: opts.M ?? 10000, cpi: 100, cpiPrev: 100, inflation: 0 },
        phase: 'expansion',
        phaseTicksRemaining: 0,
        malinvestment: 0,
        history: [],
    };
}

export const DEFAULT_GOD_CONTROLS = {
    policyRate: 5,
    moneyGrowth: 0.02,
    taxRate: 0.25,
    publicSpend: 0.2,
    priceCeiling: { enabled: false, level: 1.0 },
    wageFloor: { enabled: false, level: 80 },
    regulation: 2,
    freeMarket: false,
};

export const FREE_MARKET_CONTROLS = {
    policyRate: 5,
    moneyGrowth: 0,
    taxRate: 0,
    publicSpend: 0,
    priceCeiling: { enabled: false, level: 1.0 },
    wageFloor: { enabled: false, level: 80 },
    regulation: 0,
    freeMarket: true,
};
