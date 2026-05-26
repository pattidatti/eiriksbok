import { create } from 'zustand';
import type { SimState, GodControls, ViewKind } from '../types';
import { createInitialState, DEFAULT_GOD_CONTROLS, FREE_MARKET_CONTROLS } from '../engine/initialState';
import { tick as runTick } from '../engine/simulation';

export type Speed = 0 | 1 | 2 | 4;

interface WorldStore {
    sim: SimState;
    controls: GodControls;
    activeView: ViewKind;
    speed: Speed;
    presetId: string | null;
    activeBeatIndex: number;
    quoteSeed: number;

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
}

export const useWorldStore = create<WorldStore>((set, get) => ({
    sim: createInitialState(),
    controls: { ...DEFAULT_GOD_CONTROLS },
    activeView: 'cockpit',
    speed: 0,
    presetId: null,
    activeBeatIndex: -1,
    quoteSeed: 0,

    setActiveView: (v) => set({ activeView: v }),
    setSpeed: (s) => set({ speed: s }),
    togglePlay: () => set((state) => ({ speed: state.speed === 0 ? 1 : 0 })),

    setPolicyRate: (n) =>
        set((state) => ({ controls: { ...state.controls, policyRate: clamp(n, 0, 15) } })),
    setMoneyGrowth: (n) =>
        set((state) => ({ controls: { ...state.controls, moneyGrowth: clamp(n, -0.05, 0.5) } })),
    setTaxRate: (n) =>
        set((state) => ({ controls: { ...state.controls, taxRate: clamp(n, 0, 0.7) } })),
    setPublicSpend: (n) =>
        set((state) => ({ controls: { ...state.controls, publicSpend: clamp(n, 0, 0.7) } })),
    setPriceCeiling: (enabled, level) =>
        set((state) => ({
            controls: {
                ...state.controls,
                priceCeiling: {
                    enabled,
                    level: level ?? state.controls.priceCeiling.level,
                },
            },
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
        })),
    setRegulation: (n) =>
        set((state) => ({ controls: { ...state.controls, regulation: clamp(n, 0, 10) } })),
    setFreeMarket: (enabled) =>
        set((state) => ({ controls: { ...state.controls, freeMarket: enabled } })),
    liberateMarket: () =>
        set(() => ({
            sim: createInitialState(),
            controls: { ...FREE_MARKET_CONTROLS },
            presetId: null,
            activeBeatIndex: -1,
            speed: 0,
        })),

    resetToEquilibrium: () =>
        set(() => ({
            sim: createInitialState(),
            controls: { ...DEFAULT_GOD_CONTROLS },
            presetId: null,
            activeBeatIndex: -1,
            speed: 0,
        })),

    loadPreset: (id, initialControls, initialAvgTP, initialM) =>
        set(() => ({
            sim: createInitialState({ avgTimePreference: initialAvgTP, M: initialM }),
            controls: { ...DEFAULT_GOD_CONTROLS, ...initialControls },
            presetId: id,
            activeBeatIndex: 0,
            speed: 0,
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
}));

function clamp(n: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, n));
}
