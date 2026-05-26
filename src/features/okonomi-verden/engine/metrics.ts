import type { SimState, KeyMetrics } from '../types';

export function computeCPI(state: SimState): number {
    const consumerStage = state.stages[0];
    return consumerStage.price * 100;
}

export function computeInflation(prevCPI: number, currCPI: number): number {
    if (prevCPI === 0) return 0;
    return ((currCPI - prevCPI) / prevCPI) * 100;
}

export function computeBNP(state: SimState): number {
    return state.stages.reduce((sum, s) => sum + s.output * s.price, 0);
}

export function computeUnemployment(state: SimState): number {
    const workers = state.agents.filter((a) => a.role === 'worker');
    if (workers.length === 0) return 0;
    const unemployed = workers.filter((a) => a.stageEmployer === null).length;
    return (unemployed / workers.length) * 100;
}

export function computeGini(state: SimState): number {
    const wealth = state.agents.map((a) => a.savings).sort((x, y) => x - y);
    const n = wealth.length;
    if (n === 0) return 0;
    let cumulative = 0;
    let weighted = 0;
    for (let i = 0; i < n; i++) {
        cumulative += wealth[i];
        weighted += wealth[i] * (i + 1);
    }
    if (cumulative === 0) return 0;
    return (2 * weighted) / (n * cumulative) - (n + 1) / n;
}

export function snapshotMetrics(state: SimState, naturalRate: number, policyRate: number): KeyMetrics {
    const cpi = computeCPI(state);
    return {
        tick: state.tick,
        cpi,
        bnp: computeBNP(state),
        unemployment: computeUnemployment(state),
        policyRate,
        naturalRate,
        M: state.money.M,
        inflation: state.money.inflation,
        malinvestment: state.malinvestment,
        gini: computeGini(state),
    };
}

export const HISTORY_LIMIT = 300;

export function pushHistory(state: SimState, m: KeyMetrics): void {
    state.history.push(m);
    if (state.history.length > HISTORY_LIMIT) {
        state.history.splice(0, state.history.length - HISTORY_LIMIT);
    }
}
