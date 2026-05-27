import type { SimState, GodControls, Phase } from '../types';

export type NarrativeTone = 'info' | 'warn' | 'danger' | 'good';

export interface NarrativeItem {
    id: string;
    tone: NarrativeTone;
    icon: string;
    title: string;
    body: string;
}

export interface PhaseConsequence {
    phase: Phase;
    headline: string;
    bullets: string[];
}

export function buildNarrative(sim: SimState, controls: GodControls): NarrativeItem[] {
    const latest = sim.history[sim.history.length - 1] ?? null;
    const naturalRate = sim.loanMarket.clearingRate;
    const effectivePolicyRate = controls.freeMarket ? naturalRate : controls.policyRate;
    const rateGap = naturalRate - effectivePolicyRate;

    const items: NarrativeItem[] = [];

    // Phase signals first (highest priority)
    if (sim.phase === 'bust') {
        items.push({
            id: 'phase-bust',
            tone: 'danger',
            icon: '⚡',
            title: 'Krisen rammer',
            body: 'Feilinvesteringer fra forrige fase rives ned. Arbeidsledigheten stiger og kapitalverdier faller.',
        });
    } else if (sim.phase === 'boom') {
        items.push({
            id: 'phase-boom',
            tone: 'warn',
            icon: '🔥',
            title: 'Kunstig oppgang',
            body: 'Lav rente lokker entreprenører til å bygge mer enn folk faktisk vil betale for. Boblen vokser.',
        });
    } else if (sim.phase === 'recovery') {
        items.push({
            id: 'phase-recovery',
            tone: 'info',
            icon: '🛠️',
            title: 'Sakte restitusjon',
            body: 'Økonomien rydder opp etter krisen. Arbeid og kapital flytter seg dit folk faktisk vil ha det.',
        });
    } else {
        items.push({
            id: 'phase-expansion',
            tone: 'good',
            icon: '🌱',
            title: 'Stabil ekspansjon',
            body: 'Renten og sparingen er i takt. Produksjonen vokser jevnt.',
        });
    }

    // Rate gap
    if (!controls.freeMarket) {
        if (rateGap > 2) {
            items.push({
                id: 'rate-too-low',
                tone: 'warn',
                icon: '🔻',
                title: `Renten er ${rateGap.toFixed(1)} % under naturlig nivå`,
                body: 'Entreprenører tar opp lån de ikke burde. Maskin- og råvareleddene vokser raskere enn folk har spart for.',
            });
        } else if (rateGap < -2) {
            items.push({
                id: 'rate-too-high',
                tone: 'info',
                icon: '🔺',
                title: `Renten er ${Math.abs(rateGap).toFixed(1)} % over naturlig nivå`,
                body: 'Lite lyst til å låne. Lange investeringer utsettes; veksten bremses.',
            });
        }
    }

    // Money growth / inflation
    const yearlyMoneyGrowthPct = controls.moneyGrowth * 100;
    if (!controls.freeMarket && yearlyMoneyGrowthPct > 8) {
        items.push({
            id: 'money-fast',
            tone: 'warn',
            icon: '💸',
            title: `Pengemengden vokser ${yearlyMoneyGrowthPct.toFixed(0)} % i året`,
            body: 'Råvareleddet får pengene først (Cantillon-effekten). Forbrukerne merker prisøkningen sist.',
        });
    }
    if (latest && latest.inflation > 6) {
        items.push({
            id: 'inflation-high',
            tone: 'danger',
            icon: '📈',
            title: `Inflasjonen er ${latest.inflation.toFixed(1)} %`,
            body: 'Folk mister tillit til at pengene holder verdien. Sparing blir straffet.',
        });
    } else if (latest && latest.inflation < -1) {
        items.push({
            id: 'deflation',
            tone: 'info',
            icon: '🧊',
            title: `Prisene faller (${latest.inflation.toFixed(1)} %)`,
            body: 'Deflasjon. Folk venter med å bruke penger, og det bremser økonomien.',
        });
    }

    // Price ceiling
    if (controls.priceCeiling.enabled) {
        const consumer = sim.stages[0];
        if (consumer && consumer.price >= controls.priceCeiling.level - 0.01) {
            items.push({
                id: 'price-ceiling-binding',
                tone: 'warn',
                icon: '🧱',
                title: 'Pristaket binder',
                body: 'Markedet vil ta mer, men loven sier nei. Resultat: varer forsvinner fra hyllene og noen i forbruksleddet mister jobben.',
            });
        }
    }

    // Wage floor
    if (controls.wageFloor.enabled && latest && latest.unemployment > 8) {
        items.push({
            id: 'wage-floor-bites',
            tone: 'warn',
            icon: '⚖️',
            title: 'Lønnsgulvet biter',
            body: 'Minimumslønnen er høyere enn det de minst produktive er verdt for arbeidsgiver. Resultatet: arbeidsledighet for de samme.',
        });
    }

    // Regulation
    if (controls.regulation > 6) {
        items.push({
            id: 'regulation-heavy',
            tone: 'info',
            icon: '📋',
            title: 'Tung reguleringsbyrde',
            body: 'Nyetableringer bremser opp. Kapital som kunne blitt nye fabrikker, går til papirarbeid.',
        });
    }

    // Tax + public spend
    if (controls.taxRate > 0.45) {
        items.push({
            id: 'tax-heavy',
            tone: 'info',
            icon: '🧾',
            title: `Skatten er ${(controls.taxRate * 100).toFixed(0)} %`,
            body: 'Lite igjen til å spare og bruke privat. Mer av økonomien bestemmes politisk.',
        });
    }

    // Unemployment
    if (latest && latest.unemployment > 12) {
        items.push({
            id: 'unemployment-high',
            tone: 'danger',
            icon: '😔',
            title: `${latest.unemployment.toFixed(0)} % er uten jobb`,
            body: 'Mange agenter står uten arbeid. Sparing tæres, forbruket synker.',
        });
    }

    // Gini
    if (latest && latest.gini > 0.55) {
        items.push({
            id: 'gini-high',
            tone: 'info',
            icon: '⚖️',
            title: `Ulikheten øker (Gini ${latest.gini.toFixed(2)})`,
            body: 'Få samler stadig mer. Ofte en konsekvens av Cantillon: de som er nær pengekranen vinner.',
        });
    }

    // Free market
    if (controls.freeMarket) {
        items.push({
            id: 'free-market',
            tone: 'good',
            icon: '🍃',
            title: 'Markedet styrer alene',
            body: 'Renten følger sparing og lån. Andre skoler ville advart mot dette, men i denne modellen finner økonomien sin balanse.',
        });
    }

    return items;
}

export function describePhaseConsequence(sim: SimState, prevPhase: Phase): PhaseConsequence | null {
    const phase = sim.phase;
    if (phase === prevPhase) return null;

    const stages = sim.stages;
    const totalWorkers = sim.agents.filter((a) => a.role === 'worker').length;
    const unemployed = sim.agents.filter((a) => a.role === 'worker' && a.stageEmployer === null).length;
    const unemploymentPct = totalWorkers > 0 ? (unemployed / totalWorkers) * 100 : 0;
    const lateStageLaborers = stages
        .filter((s) => s.order >= 4)
        .reduce((sum, s) => sum + s.laborers, 0);

    if (phase === 'boom') {
        return {
            phase,
            headline: 'Boom: lånekranen åpnes',
            bullets: [
                `Maskin- og råvareleddet vokser raskt — ${lateStageLaborers} arbeidere der nå.`,
                'Entreprenører planlegger som om sparingen er mye større enn den faktisk er.',
                'Det føles bra. Det er ikke det.',
            ],
        };
    }
    if (phase === 'bust') {
        return {
            phase,
            headline: 'Krisen er her',
            bullets: [
                `${unemployed} arbeidere har mistet jobben (${unemploymentPct.toFixed(0)} %).`,
                'Kapital og output i de lengste produksjonsleddene rives ned med 1,5 % per tick.',
                'Feilinvesteringene fra boom-fasen rettes opp — men det gjør vondt.',
            ],
        };
    }
    if (phase === 'recovery') {
        return {
            phase,
            headline: 'Restitusjon begynner',
            bullets: [
                'Det verste er over. Kapital og arbeid flytter seg dit folk faktisk vil ha det.',
                `Arbeidsledigheten ligger på ${unemploymentPct.toFixed(0)} % — den vil synke gradvis.`,
                'Vekst kommer tilbake, men forsiktig.',
            ],
        };
    }
    if (phase === 'expansion') {
        return {
            phase,
            headline: 'Stabil ekspansjon',
            bullets: [
                'Økonomien vokser i takt med folks faktiske sparing.',
                `${totalWorkers - unemployed} arbeidere er i jobb.`,
                'Renten gjenspeiler tålmodigheten i samfunnet.',
            ],
        };
    }
    return null;
}
