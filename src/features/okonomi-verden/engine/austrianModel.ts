import type { SimState, GodControls } from '../types';

// Konstanter valgt for at en 14-åring skal kjenne igjen sammenhengen innen 1-3 minutter spilletid,
// ikke for realisme. En tick svarer cirka til to ukers økonomisk tid (TICKS_PER_YEAR = 60).
const BASE_RATE = 5; // Grunnrente i prosent, omtrent som langsiktig snitt i moderne vestlige økonomier.
const TIME_PREF_TO_RATE = 20; // Hvor sterkt gjennomsnittlig tålmodighet (0..1) drar i naturlig rente.
const MALINVESTMENT_BUST_THRESHOLD = 60; // Når 'feilinvestering' krysser dette nivået utløses en krise.
const BUST_DURATION = 80; // Krisen varer cirka 80 ticks (~ 1,3 simulert år) - lenge nok til at eleven ser konsekvensene.
const RECOVERY_DURATION = 60; // Restitusjon før økonomien er tilbake i 'expansion'.

export function averageTimePreference(state: SimState): number {
    if (state.agents.length === 0) return 0.5;
    let sum = 0;
    for (const a of state.agents) sum += a.timePreference;
    return sum / state.agents.length;
}

export function computeNaturalRate(state: SimState): number {
    const avgTP = averageTimePreference(state);
    const employmentPressure = computeEmploymentPressure(state);
    const rate = BASE_RATE + (avgTP - 0.5) * TIME_PREF_TO_RATE + employmentPressure;
    return Math.max(0.1, Math.min(20, rate));
}

function computeEmploymentPressure(state: SimState): number {
    const workers = state.agents.filter((a) => a.role === 'worker');
    if (workers.length === 0) return 0;
    const employed = workers.filter((a) => a.stageEmployer !== null).length;
    const employmentShare = employed / workers.length;
    return (employmentShare - 1.0) * 4;
}

export function applyCapitalDistortion(
    state: SimState,
    policyRate: number,
    naturalRate: number
): { stageWeights: number[]; malinvestmentDelta: number } {
    const gap = naturalRate - policyRate;
    const stageWeights = state.stages.map((s) => {
        const orderFactor = (s.order - 3) / 2;
        return Math.max(0.1, 1 + gap * 0.08 * orderFactor);
    });

    const malinvestmentDelta = gap > 0 ? gap * 0.6 : -Math.abs(gap) * 0.2;

    return { stageWeights, malinvestmentDelta };
}

export function shouldTriggerBust(state: SimState): boolean {
    return state.phase !== 'bust' && state.phase !== 'recovery' && state.malinvestment > MALINVESTMENT_BUST_THRESHOLD;
}

export function triggerBust(state: SimState): void {
    state.phase = 'bust';
    state.phaseTicksRemaining = BUST_DURATION;
    const workers = state.agents.filter((a) => a.role === 'worker' && a.stageEmployer !== null);
    const layoffCount = Math.floor(workers.length * 0.25);
    const sortedByStage = [...workers].sort((a, b) => (b.stageEmployer ?? 0) - (a.stageEmployer ?? 0));
    for (let i = 0; i < layoffCount; i++) {
        sortedByStage[i].stageEmployer = null;
        sortedByStage[i].mood = 'unemployed';
    }
}

export function updatePhase(state: SimState): void {
    if (state.phaseTicksRemaining > 0) {
        state.phaseTicksRemaining--;
        if (state.phaseTicksRemaining === 0) {
            if (state.phase === 'bust') {
                state.phase = 'recovery';
                state.phaseTicksRemaining = RECOVERY_DURATION;
            } else if (state.phase === 'recovery') {
                state.phase = 'expansion';
            }
        }
        return;
    }

    if (state.malinvestment > MALINVESTMENT_BUST_THRESHOLD * 0.5) {
        state.phase = 'boom';
    } else if (state.phase === 'boom' && state.malinvestment < MALINVESTMENT_BUST_THRESHOLD * 0.3) {
        state.phase = 'expansion';
    }
}

export function applyCantillonInflation(
    state: SimState,
    moneyGrowthPerTick: number,
    policyRate: number,
    naturalRate: number
): void {
    state.money.M *= 1 + moneyGrowthPerTick;
    const gap = naturalRate - policyRate;
    const totalInflation = moneyGrowthPerTick * 100;

    state.stages.forEach((stage) => {
        const orderFactor = (stage.order - 3) / 2;
        const cantillonBoost = gap > 0 ? gap * 0.1 * orderFactor : 0;
        stage.price *= 1 + totalInflation / 100 + cantillonBoost / 100;
        stage.price = Math.max(0.1, stage.price);
    });
}

export function applyPriceCeiling(state: SimState, controls: GodControls): void {
    if (!controls.priceCeiling.enabled) return;
    const consumerStage = state.stages[0];
    if (consumerStage.price > controls.priceCeiling.level) {
        // Hvor mye over taket markedsprisen ligger - jo mer "spent" tak, jo verre vareknapphet.
        const overshoot = (consumerStage.price - controls.priceCeiling.level) / controls.priceCeiling.level;
        consumerStage.price = controls.priceCeiling.level;
        // Sterk output-reduksjon så elever ser tydelig vareknapphet og ledighet
        // når pristaket binder. Skalert med hvor mye taket bindes.
        const reductionFactor = Math.max(0.85, 0.92 - overshoot * 0.1);
        consumerStage.output *= reductionFactor;
        // Permitterer noen arbeidere i forbruksleddet for å gjøre effekten synlig i Village.
        if (overshoot > 0.05) {
            const workers = state.agents.filter(
                (a) => a.role === 'worker' && a.stageEmployer === consumerStage.id
            );
            const layoffs = Math.min(workers.length, Math.ceil(workers.length * overshoot * 0.4));
            for (let i = 0; i < layoffs; i++) {
                workers[i].stageEmployer = null;
                workers[i].mood = 'unemployed';
            }
        }
    }
}

export function reallocateLabor(state: SimState, stageWeights: number[]): void {
    const workers = state.agents.filter((a) => a.role === 'worker');
    const totalWeight = stageWeights.reduce((s, w) => s + w, 0);
    const targetPerStage = stageWeights.map((w) => Math.round((w / totalWeight) * workers.length));
    const currentPerStage = state.stages.map(
        (s) => workers.filter((w) => w.stageEmployer === s.id).length
    );

    state.stages.forEach((stage, i) => {
        const target = targetPerStage[i];
        const current = currentPerStage[i];
        const delta = target - current;

        if (delta > 0) {
            const candidates = workers.filter((w) => w.stageEmployer === null).slice(0, delta);
            candidates.forEach((c) => {
                c.stageEmployer = stage.id;
                c.mood = 'happy';
            });
            const remaining = delta - candidates.length;
            if (remaining > 0) {
                const otherStages = workers
                    .filter((w) => w.stageEmployer !== null && w.stageEmployer !== stage.id)
                    .slice(0, remaining);
                otherStages.forEach((c) => (c.stageEmployer = stage.id));
            }
        } else if (delta < 0) {
            const layoffs = workers.filter((w) => w.stageEmployer === stage.id).slice(0, -delta);
            layoffs.forEach((l) => {
                l.stageEmployer = null;
                l.mood = 'unemployed';
            });
        }

        stage.laborers = workers.filter((w) => w.stageEmployer === stage.id).length;
    });
}

export function applyMalinvestmentDelta(state: SimState, delta: number): void {
    state.malinvestment = Math.max(0, state.malinvestment + delta);
}

export const MODEL_CONSTANTS = {
    BASE_RATE,
    MALINVESTMENT_BUST_THRESHOLD,
    BUST_DURATION,
    RECOVERY_DURATION,
};
