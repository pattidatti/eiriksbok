import { create } from 'zustand';
import type { SimState, GodControls, ViewKind, KeyMetrics } from '../types';
import { createInitialState, DEFAULT_GOD_CONTROLS, FREE_MARKET_CONTROLS } from '../engine/initialState';
import { tick as runTick } from '../engine/simulation';

export type Speed = 0 | 1 | 2 | 4;

export interface RunSnapshot {
    id: string;
    label: string;
    color: string;
    history: KeyMetrics[];
}

const SNAPSHOT_COLORS = ['#a855f7', '#ec4899', '#f59e0b', '#0ea5e9'];
const MAX_SNAPSHOTS = 3;

interface WorldStore {
    sim: SimState;
    controls: GodControls;
    activeView: ViewKind;
    speed: Speed;
    presetId: string | null;
    activeBeatIndex: number;
    quoteSeed: number;
    snapshots: RunSnapshot[];
    autoBaseline: KeyMetrics | null;
    lastFastForwardDelta: { before: KeyMetrics; after: KeyMetrics; ticks: number } | null;

    setActiveView: (v: ViewKind) => void;
    setSpeed: (s: Speed) => void;
    togglePlay: () => void;
    setPolicyRate: (n: number) => void;
    setMoneyGrowth: (n: number) => void;
    setTaxRate: (n: number) => void;
    setPublicSpend: (n: number) => void;
    setPriceCeiling: (enabled: boolean, level?: number) => void;
    setWageFloor: (enabled: boolean, level?: number) => void;
    setRegulation: (n: number) => void;
    setFreeMarket: (enabled: boolean) => void;
    liberateMarket: () => void;

    resetToEquilibrium: () => void;
    loadPreset: (id: string, initialControls: Partial<GodControls>, initialAvgTP?: number, initialM?: number) => void;
    clearPreset: () => void;
    advanceBeat: () => void;

    advanceTicks: (n: number) => void;
    rollQuoteSeed: () => void;

    captureBaseline: () => void;
    fastForward: (ticks: number) => void;
    dismissFastForwardDelta: () => void;

    saveSnapshot: (label?: string) => void;
    deleteSnapshot: (id: string) => void;
    clearSnapshots: () => void;
}

export const useWorldStore = create<WorldStore>((set, get) => ({
    sim: createInitialState(),
    controls: { ...DEFAULT_GOD_CONTROLS },
    activeView: 'live',
    speed: 0,
    presetId: null,
    activeBeatIndex: -1,
    quoteSeed: 0,
    snapshots: [],
    autoBaseline: null,
    lastFastForwardDelta: null,

    setActiveView: (v) => set({ activeView: v }),
    setSpeed: (s) => set({ speed: s }),
    togglePlay: () => set((state) => ({ speed: state.speed === 0 ? 1 : 0 })),

    setPolicyRate: (n) =>
        set((state) => ({
            controls: { ...state.controls, policyRate: clamp(n, 0, 15) },
            autoBaseline: state.autoBaseline ?? latestMetrics(state.sim),
        })),
    setMoneyGrowth: (n) =>
        set((state) => ({
            controls: { ...state.controls, moneyGrowth: clamp(n, -0.05, 0.5) },
            autoBaseline: state.autoBaseline ?? latestMetrics(state.sim),
        })),
    setTaxRate: (n) =>
        set((state) => ({
            controls: { ...state.controls, taxRate: clamp(n, 0, 0.7) },
            autoBaseline: state.autoBaseline ?? latestMetrics(state.sim),
        })),
    setPublicSpend: (n) =>
        set((state) => ({
            controls: { ...state.controls, publicSpend: clamp(n, 0, 0.7) },
            autoBaseline: state.autoBaseline ?? latestMetrics(state.sim),
        })),
    setPriceCeiling: (enabled, level) =>
        set((state) => ({
            controls: {
                ...state.controls,
                priceCeiling: {
                    enabled,
                    level: level ?? state.controls.priceCeiling.level,
                },
            },
            autoBaseline: state.autoBaseline ?? latestMetrics(state.sim),
        })),
    setWageFloor: (enabled, level) =>
        set((state) => ({
            controls: {
                ...state.controls,
                wageFloor: {
                    enabled,
                    level: level ?? state.controls.wageFloor.level,
                },
            },
            autoBaseline: state.autoBaseline ?? latestMetrics(state.sim),
        })),
    setRegulation: (n) =>
        set((state) => ({
            controls: { ...state.controls, regulation: clamp(n, 0, 10) },
            autoBaseline: state.autoBaseline ?? latestMetrics(state.sim),
        })),
    setFreeMarket: (enabled) =>
        set((state) => ({
            controls: { ...state.controls, freeMarket: enabled },
            autoBaseline: state.autoBaseline ?? latestMetrics(state.sim),
        })),
    liberateMarket: () =>
        set(() => ({
            sim: createInitialState(),
            controls: { ...FREE_MARKET_CONTROLS },
            presetId: null,
            activeBeatIndex: -1,
            speed: 0,
            autoBaseline: null,
            lastFastForwardDelta: null,
        })),

    resetToEquilibrium: () =>
        set(() => ({
            sim: createInitialState(),
            controls: { ...DEFAULT_GOD_CONTROLS },
            presetId: null,
            activeBeatIndex: -1,
            speed: 0,
            autoBaseline: null,
            lastFastForwardDelta: null,
        })),

    loadPreset: (id, initialControls, initialAvgTP, initialM) =>
        set(() => ({
            sim: createInitialState({ avgTimePreference: initialAvgTP, M: initialM }),
            controls: { ...DEFAULT_GOD_CONTROLS, ...initialControls },
            presetId: id,
            activeBeatIndex: 0,
            speed: 0,
            autoBaseline: null,
            lastFastForwardDelta: null,
        })),

    clearPreset: () => set({ presetId: null, activeBeatIndex: -1 }),

    advanceBeat: () => set((state) => ({ activeBeatIndex: state.activeBeatIndex + 1 })),

    advanceTicks: (n) => {
        const { sim, controls } = get();
        for (let i = 0; i < n; i++) {
            runTick(sim, controls);
        }
        set({
            sim: {
                ...sim,
                history: sim.history.slice(),
                stages: sim.stages.map((s) => ({ ...s })),
                money: { ...sim.money },
                loanMarket: { ...sim.loanMarket },
                agents: sim.agents.slice(),
            },
        });
    },

    rollQuoteSeed: () => set((s) => ({ quoteSeed: s.quoteSeed + 1 })),

    captureBaseline: () =>
        set((state) => ({ autoBaseline: latestMetrics(state.sim) })),

    fastForward: (ticks) => {
        const state = get();
        const before = latestMetrics(state.sim) ?? state.autoBaseline;
        const { sim, controls } = state;
        for (let i = 0; i < ticks; i++) {
            runTick(sim, controls);
        }
        const after = latestMetrics(sim);
        set({
            sim: {
                ...sim,
                history: sim.history.slice(),
                stages: sim.stages.map((s) => ({ ...s })),
                money: { ...sim.money },
                loanMarket: { ...sim.loanMarket },
                agents: sim.agents.slice(),
            },
            lastFastForwardDelta: before && after ? { before, after, ticks } : null,
        });
    },

    dismissFastForwardDelta: () => set({ lastFastForwardDelta: null }),

    saveSnapshot: (label) =>
        set((state) => {
            if (state.sim.history.length < 5) return state;
            const usedColors = new Set(state.snapshots.map((s) => s.color));
            const color = SNAPSHOT_COLORS.find((c) => !usedColors.has(c)) ?? SNAPSHOT_COLORS[0];
            const finalLabel = label?.trim() || `Kjøring ${state.snapshots.length + 1}`;
            const next: RunSnapshot = {
                id: `snap-${Date.now()}`,
                label: finalLabel,
                color,
                history: state.sim.history.map((h) => ({ ...h })),
            };
            const snapshots = [...state.snapshots, next].slice(-MAX_SNAPSHOTS);
            return { snapshots };
        }),

    deleteSnapshot: (id) =>
        set((state) => ({ snapshots: state.snapshots.filter((s) => s.id !== id) })),

    clearSnapshots: () => set({ snapshots: [] }),
}));

function clamp(n: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, n));
}

function latestMetrics(sim: SimState): KeyMetrics | null {
    return sim.history.length > 0 ? sim.history[sim.history.length - 1] : null;
}
