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

// 60 ticks = ett simulert år. Med 4x-hastighet går ett år unna på ~1,5 sekund -
// raskt nok til å se mønstre, sakte nok til å henge med.
const TICKS_PER_YEAR = 60;
// Andel av samlet sparing som plasseres som investering hver tick.
const INVESTMENT_RATE_PER_TICK = 0.005;
// Kapital slites ned med 0,2 % per tick (≈ 12 % per simulert år).
const CAPITAL_DEPRECIATION = 0.002;
// Tak på sparing relativt til lønn, så agentene ikke samler ubegrenset formue.
const SAVINGS_CAP_MULTIPLIER = 20;

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

    accumulateCapital(state, stageWeights, controls);

    state.stages.forEach((stage) => {
        const capitalContribution = Math.sqrt(Math.max(0, stage.capital)) * 4;
        const targetOutput = stage.laborers * 8 + capitalContribution;
        stage.output += (targetOutput - stage.output) * 0.1;
        if (state.phase === 'bust' && stage.order >= 4) {
            stage.output *= 0.985;
            stage.capital *= 0.985;
        }
        stage.capital *= 1 - CAPITAL_DEPRECIATION;
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

function accumulateCapital(
    state: SimState,
    stageWeights: number[],
    controls: GodControls
): void {
    const totalSavings = sumSavings(state);
    if (totalSavings <= 0) return;
    const investableFunds = totalSavings * INVESTMENT_RATE_PER_TICK * (1 - controls.regulation * 0.04);
    if (investableFunds <= 0) return;

    const totalWeight = stageWeights.reduce((s, w) => s + w, 0) || 1;
    state.stages.forEach((stage, i) => {
        stage.capital += investableFunds * (stageWeights[i] / totalWeight);
    });

    const ratio = investableFunds / totalSavings;
    for (const a of state.agents) {
        if (a.savings > 0) a.savings *= 1 - ratio;
    }
}

function updateAgents(state: SimState, controls: GodControls, effectivePolicyRate: number): void {
    const taxRate = controls.taxRate;
    for (const a of state.agents) {
        if (a.role === 'worker') {
            if (a.stageEmployer !== null) {
                const stage = state.stages[a.stageEmployer];
                const productivity = stage.laborers > 0
                    ? Math.log(1 + stage.capital / Math.max(1, stage.laborers)) * 8
                    : 0;
                const baseWage = 100 * (1 + (stage.order - 3) * 0.05);
                a.wage = baseWage + productivity;
                if (controls.wageFloor.enabled) {
                    a.wage = Math.max(controls.wageFloor.level, a.wage);
                }
                const afterTax = a.wage * (1 - taxRate);
                const savingsCap = a.wage * SAVINGS_CAP_MULTIPLIER;
                const consumeShare = 1 - a.timePreference;

                if (a.savings >= savingsCap) {
                    a.consumption = afterTax;
                    a.savings = savingsCap;
                } else {
                    a.consumption = afterTax * consumeShare;
                    a.savings = Math.max(0, a.savings + afterTax * a.timePreference);
                }
                a.mood = 'happy';
            } else {
                a.consumption = Math.min(40, a.savings * 0.05);
                a.savings = Math.max(0, a.savings - 20);
                a.mood = 'unemployed';
            }
        } else if (a.role === 'saver') {
            const interestGain = a.savings * (effectivePolicyRate / 100) / 60;
            const savingsCap = 5000;
            a.savings = Math.min(savingsCap, Math.max(0, a.savings + interestGain - a.consumption * (1 - a.timePreference)));
            a.mood = a.savings > 200 ? 'happy' : 'struggling';
        } else if (a.role === 'entrepreneur') {
            const profit = state.stages.reduce((s, st) => s + st.output * 0.03, 0) / 10;
            const savingsCap = 8000;
            a.savings = Math.min(savingsCap, Math.max(0, a.savings + profit - a.consumption));
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
