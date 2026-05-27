import { useMemo } from 'react';
import { create } from 'zustand';

export type PulseSource =
    | 'policyRate'
    | 'moneyGrowth'
    | 'taxRate'
    | 'publicSpend'
    | 'priceCeiling'
    | 'wageFloor'
    | 'regulation'
    | 'freeMarket';

export type PulseTarget =
    | 'phase'
    | 'inflation'
    | 'unemployment'
    | 'bnp'
    | 'malinvestment'
    | 'gini'
    | 'rate'
    | 'stages'
    | 'stage-consumer'
    | 'stage-distribution'
    | 'stage-machines'
    | 'stage-intermediate'
    | 'stage-raw';

export interface Pulse {
    id: number;
    source: PulseSource;
    targets: PulseTarget[];
    color: string;
    createdAt: number;
}

interface PulseStore {
    pulses: Pulse[];
    fire: (source: PulseSource) => void;
    consume: (id: number) => void;
}

const PULSE_LIFETIME_MS = 1100;

const PULSE_RECIPES: Record<PulseSource, { targets: PulseTarget[]; color: string }> = {
    policyRate: {
        targets: ['rate', 'malinvestment', 'stages', 'stage-machines', 'stage-intermediate', 'stage-raw'],
        color: '#6366f1',
    },
    moneyGrowth: {
        targets: ['inflation', 'stage-raw', 'stage-intermediate', 'malinvestment'],
        color: '#f59e0b',
    },
    taxRate: {
        targets: ['bnp', 'gini', 'stage-consumer'],
        color: '#0ea5e9',
    },
    publicSpend: {
        targets: ['bnp', 'gini', 'stages'],
        color: '#8b5cf6',
    },
    priceCeiling: {
        targets: ['inflation', 'unemployment', 'stage-consumer'],
        color: '#ef4444',
    },
    wageFloor: {
        targets: ['unemployment', 'gini', 'stage-consumer'],
        color: '#ec4899',
    },
    regulation: {
        targets: ['bnp', 'stages'],
        color: '#64748b',
    },
    freeMarket: {
        targets: ['rate', 'phase', 'stages'],
        color: '#10b981',
    },
};

let pulseIdCounter = 0;

export const usePulseStore = create<PulseStore>((set) => ({
    pulses: [],
    fire: (source) => {
        const recipe = PULSE_RECIPES[source];
        const id = ++pulseIdCounter;
        const pulse: Pulse = {
            id,
            source,
            targets: recipe.targets,
            color: recipe.color,
            createdAt: performance.now(),
        };
        set((state) => ({ pulses: [...state.pulses, pulse] }));
        setTimeout(() => {
            set((state) => ({ pulses: state.pulses.filter((p) => p.id !== id) }));
        }, PULSE_LIFETIME_MS);
    },
    consume: (id) => {
        set((state) => ({ pulses: state.pulses.filter((p) => p.id !== id) }));
    },
}));

export function usePulsesForTarget(target: PulseTarget): Pulse[] {
    const all = usePulseStore((s) => s.pulses);
    return useMemo(() => all.filter((p) => p.targets.includes(target)), [all, target]);
}
