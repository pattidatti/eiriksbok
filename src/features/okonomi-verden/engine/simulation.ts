import type { SimState, GodControls } from '../types';
import {
    computeNaturalRate,
    applyCapitalDistortion,
    applyMalinvestmentDelta,
    applyCantillonInflation,
    applyPriceCeiling,
    reallocateLabor,
    shouldTriggerBust,
    triggerBust,
    updatePhase,
} from './austrianModel';
import { computeInflation, snapshotMetrics, pushHistory } from './metrics';

const TICKS_PER_YEAR = 60;

export function tick(state: SimState, controls: GodControls): SimState {
    state.tick++;

    const naturalRate = computeNaturalRate(state);
    state.loanMarket.clearingRate = naturalRate;

    const effectivePolicyRate = controls.freeMarket ? naturalRate : controls.policyRate;
    const effectiveMoneyGrowth = controls.freeMarket ? 0 : controls.moneyGrowth;

    const { stageWeights, malinvestmentDelta } = applyCapitalDistortion(
        state,
        effectivePolicyRate,
        naturalRate
    );

    applyMalinvestmentDelta(state, malinvestmentDelta);

    if (state.phase !== 'bust') {
        reallocateLabor(state, stageWeights);
    }

    state.stages.forEach((stage) => {
        const targetOutput = stage.laborers * 5 + stage.capital * 0.5;
        stage.output += (targetOutput - stage.output) * 0.1;
        if (state.phase === 'bust' && stage.order >= 4) {
            stage.output *= 0.985;
            stage.capital *= 0.99;
        }
    });

    const moneyGrowthPerTick = effectiveMoneyGrowth / TICKS_PER_YEAR;
    state.money.cpiPrev = state.money.cpi;
    applyCantillonInflation(state, moneyGrowthPerTick, effectivePolicyRate, naturalRate);
    applyPriceCeiling(state, controls);
    state.money.cpi = state.stages[0].price * 100;
    state.money.inflation = computeInflation(state.money.cpiPrev, state.money.cpi) * TICKS_PER_YEAR;

    updateAgents(state, controls, effectivePolicyRate);

    updatePhase(state);
    if (shouldTriggerBust(state)) {
        triggerBust(state);
    }

    const metrics = snapshotMetrics(state, naturalRate, effectivePolicyRate);
    pushHistory(state, metrics);

    state.loanMarket.supplied = sumSavings(state) * 0.3;
    state.loanMarket.demanded = state.stages.reduce((s, st) => s + st.capital * 0.1, 0);

    return state;
}

function updateAgents(state: SimState, controls: GodControls, effectivePolicyRate: number): void {
    const taxRate = controls.taxRate;
    for (const a of state.agents) {
        if (a.role === 'worker') {
            if (a.stageEmployer !== null) {
                const stage = state.stages[a.stageEmployer];
                a.wage = 100 * (1 + (stage.order - 3) * 0.05);
                if (controls.wageFloor.enabled) {
                    a.wage = Math.max(controls.wageFloor.level, a.wage);
                }
                const afterTax = a.wage * (1 - taxRate);
                const consumeShare = 1 - a.timePreference;
                a.consumption = afterTax * consumeShare;
                a.savings = Math.max(0, a.savings + afterTax * a.timePreference);
                a.mood = 'happy';
            } else {
                a.consumption = Math.min(40, a.savings * 0.05);
                a.savings = Math.max(0, a.savings - 20);
                a.mood = 'unemployed';
            }
        } else if (a.role === 'saver') {
            const interestGain = a.savings * (effectivePolicyRate / 100) / 60;
            a.savings += interestGain - a.consumption * (1 - a.timePreference);
            a.savings = Math.max(0, a.savings);
            a.mood = a.savings > 200 ? 'happy' : 'struggling';
        } else if (a.role === 'entrepreneur') {
            const profit = state.stages.reduce((s, st) => s + st.output * 0.05, 0) / 10;
            a.savings = Math.max(0, a.savings + profit - a.consumption);
            a.mood = state.phase === 'bust' ? 'struggling' : 'happy';
        } else {
            a.consumption = a.wage;
            a.savings = Math.max(0, a.savings + 5 - a.consumption * 0.1);
            a.mood = 'happy';
        }
    }
}

function sumSavings(state: SimState): number {
    let s = 0;
    for (const a of state.agents) s += a.savings;
    return s;
}

export const SIM_CONSTANTS = { TICKS_PER_YEAR };
