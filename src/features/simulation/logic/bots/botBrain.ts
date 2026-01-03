
import type { SimulationPlayer, SimulationRoom } from '../../simulationTypes';
import { BOT_PERSONAS, type BotPersona } from './botPersonas';
import { findPathToGoal } from './metaScanner';

// Define the shape of a decision
export interface BotDecision {
    actionType: string; // e.g., 'CHOP', 'EAT', 'PAY_TAX'
    payload?: any;      // e.g., { buildingId: 'bakery' }
    reason: string;     // For logging/debugging
    weight: number;     // How strong the desire is (0-1)
}

const getPersona = (bot: SimulationPlayer): BotPersona => {
    // We can store persona ID in the bot's metadata later if we want persistence.
    // For now, deterministic hash based on name or random assignment stored in memory could work,
    // but simpler: check if name contains tag, or default to Peasant.
    if (bot.name.includes('[AGIT]')) return BOT_PERSONAS.ANARCHIST;
    if (bot.name.includes('[MERCH]')) return BOT_PERSONAS.GREEDY_MERCHANT;
    if (bot.name.includes('[GUARD]')) return BOT_PERSONAS.LOYAL_SOLDIER;
    if (bot.name.includes('[CLIMBER]')) return BOT_PERSONAS.AMBITIOUS_CLIMBER;
    if (bot.name.includes('[PEASANT]')) return BOT_PERSONAS.SIMPLE_PEASANT;
    return BOT_PERSONAS.DILIGENT_PEASANT;
};



export const decideBotAction = (bot: SimulationPlayer, room: SimulationRoom): BotDecision | null => {
    if (!bot || !room) return null;

    const persona = getPersona(bot);
    const decisions: BotDecision[] = [];
    const stamina = bot.status.stamina || 0;
    const gold = bot.resources.gold || 0;

    // --- 0. META: ANALYSIS & FEEDBACK (The "Voice" of the Bot) ---
    // 5% chance to output a thought/complaint about game balance
    if (Math.random() < 0.05) {
        let gripe = "";
        if (gold < 10 && persona.priorities.upgrade > 0.5) gripe = "Jeg tjener gull for sakte! Hvordan skal jeg bli Baron?";
        else if (stamina < 20) gripe = "Stamina-systemet er for straffende. Jeg er utslitt.";
        else if (persona.id === 'AMBITIOUS_CLIMBER' && bot.role !== 'BARON' && gold > 100) gripe = "Jeg har samlet en formue. Når kommer valget?";

        if (gripe) {
            return { actionType: 'REPORT_FEEDBACK', payload: gripe, reason: 'Feedback', weight: 1.0 };
        }
    }

    // --- MODULAR DECISION ENGINE ---

    // 1. SURVIVAL
    const survivalDecision = evaluateSurvival(bot, stamina);
    if (survivalDecision) decisions.push(survivalDecision);

    // 2. AMBITION (The Ladder)
    const ambitionDecision = evaluateAmbition(bot, room, persona, gold, stamina);
    if (ambitionDecision) decisions.push(ambitionDecision);

    // 3. ECONOMY (The Engine)
    const economyDecision = evaluateEconomy(bot, room, persona, gold, stamina);
    if (economyDecision) decisions.push(economyDecision);

    // SORT & PICK
    decisions.sort((a, b) => b.weight - a.weight);

    if (decisions.length > 0 && decisions[0].weight > 0.1) {
        return decisions[0];
    }

    return null; // Idle
};

// --- SUB-SYSTEMS ---

const evaluateSurvival = (_bot: SimulationPlayer, stamina: number): BotDecision | null => {
    if (stamina < 20) {
        return { actionType: 'SLEEP', reason: 'Critical Stamina', weight: 1.0 }; // Force sleep
    }
    if (stamina < 40) {
        return { actionType: 'SLEEP', reason: 'Low Stamina', weight: 0.8 };
    }
    return null;
};

const evaluateAmbition = (bot: SimulationPlayer, room: SimulationRoom, persona: BotPersona, gold: number, _stamina: number): BotDecision | null => {
    // Only 'Climbers' or high-level peasants care about this deeply
    if (persona.priorities.upgrade < 0.5) return null;

    if (persona.id === 'SIMPLE_PEASANT') {
        return evaluatePeasantProsperity(bot, room, gold);
    }

    const regionId = bot.regionId === 'capital' ? 'region_ost' : (bot.regionId || 'region_ost');
    const isBaron = bot.role === 'BARON';

    if (!isBaron) {
        return evaluatePathToPower(bot, room, regionId, gold);
    } else {
        return evaluateRulerDuties(bot, room, regionId, gold);
    }
};

const evaluatePathToPower = (bot: SimulationPlayer, room: SimulationRoom, regionId: string, gold: number): BotDecision | null => {
    // A. TITLE REQUIREMENTS check

    const castleId = regionId === 'region_vest' ? 'manor_vest' : 'manor_ost';
    const castle = room.world?.settlement?.buildings?.[castleId];
    const hasCastle = castle && castle.level > 0;

    // A1. INFRASTRUCTURE (Castle must exist)
    if (!hasCastle) {
        // USE META-SCANNER to find what is needed
        const path = findPathToGoal(castleId, bot.resources);

        const hasMaterials = (bot.resources.stone || 0) > 10 || (bot.resources.plank || 0) > 10;
        if (hasMaterials) {
            const bestRes = (bot.resources.stone || 0) > (bot.resources.plank || 0) ? 'stone' : 'plank';
            return {
                actionType: 'CONTRIBUTE_BUILDING',
                payload: { buildingId: castleId, amount: 10, resource: bestRes },
                reason: `Building the Castle (${path?.message || 'Prerequisite'})`,
                weight: 0.95
            };
        } else {
            return {
                actionType: 'REPORT_FEEDBACK',
                payload: `Jeg vil bli Baron, men ${castleId} mangler! ${path?.message || 'Jeg må samle ressurser.'}`,
                reason: 'Goal Tracking',
                weight: 0.3
            };
        }
    }

    // A2. CONQUEST (Castle exists)
    const region = room.regions?.[regionId];
    const rulerName = region?.rulerName || 'Ingen';

    if (rulerName === 'Ingen') {
        if (gold >= 1000) { // Approx cost
            return { actionType: 'CLAIM_TITLE', payload: { regionId }, reason: 'Seizing Empty Throne', weight: 1.0 };
        } else {
            return {
                actionType: 'REPORT_FEEDBACK',
                payload: `Slottet er tomt! Jeg sparer gull (${gold}/1000) for å kreve tittelen.`,
                reason: 'Goal Tracking',
                weight: 0.5
            };
        }
    } else {
        // Occupied. Revolution.
        if (gold > 500) {
            return { actionType: 'BRIBE', payload: { regionId, amount: 50 }, reason: 'Destabilizing Rival', weight: 0.8 };
        }
    }

    return null;
};

const evaluateRulerDuties = (bot: SimulationPlayer, room: SimulationRoom, regionId: string, _gold: number): BotDecision | null => {
    // I am Baron. Maintain power.
    const region = room.regions?.[regionId];
    if (!region) return null;

    // 1. Repair Walls if damaged
    if (region.fortification && region.fortification.hp < region.fortification.maxHp) {
        if ((bot.resources.stone || 0) > 10) {
            return { actionType: 'REPAIR_WALLS', reason: 'Defending my Realm', weight: 0.9 };
        }
    }

    return null;
};

const evaluatePeasantProsperity = (bot: SimulationPlayer, room: SimulationRoom, gold: number): BotDecision | null => {
    // 1. REFINE resources if I have them (Value Add without market)
    if ((bot.resources.wood || 0) > 20) return { actionType: 'SAWMILL', reason: 'Foredler ved for å øke verdien på eiendommen', weight: 0.9 };
    if ((bot.resources.grain || 0) > 20) return { actionType: 'WINDMILL', reason: 'Maler korn for å sikre matforsyning', weight: 0.9 };
    if ((bot.resources.iron_ore || 0) > 10) return { actionType: 'SMELTERY', reason: 'Smelter jern for fremtidig verktøy', weight: 0.9 };

    // 2. INVEST in local infrastructure (Selfish benefit)
    const buildings = room.world?.settlement?.buildings || {};

    // Peasants love the bakery (food) and their farmhouse (stamina)
    if (gold > 100) {
        if (!buildings.farm_house || buildings.farm_house.level < 5) {
            return { actionType: 'CONTRIBUTE_BUILDING', payload: { buildingId: 'farm_house', amount: 20, resource: 'gold' }, reason: 'Oppgraderer gården for bedre livskvalitet', weight: 0.8 };
        }
        if (!buildings.bakery || buildings.bakery.level < 3) {
            return { actionType: 'CONTRIBUTE_BUILDING', payload: { buildingId: 'bakery', amount: 10, resource: 'gold' }, reason: 'Bidrar til felles bakeri for billigere brød', weight: 0.6 };
        }
    }

    return null;
};

const evaluateEconomy = (bot: SimulationPlayer, _room: SimulationRoom, persona: BotPersona, _gold: number, stamina: number): BotDecision | null => {
    // Refining Logic: Value Added?
    // If Wood price < Plank price - labor cost -> Refine.

    const workOptions = ['CHOP', 'MINE', 'FORAGE'];
    const randomBasic = workOptions[Math.floor(Math.random() * workOptions.length)];

    // If I have raw materials, huge desire to refine
    if ((bot.resources.wood || 0) > 10) {
        return { actionType: 'SAWMILL', reason: 'Refining Wood (Value Add)', weight: persona.priorities.work * 1.5 };
    }
    if ((bot.resources.grain || 0) > 10) {
        return { actionType: 'WINDMILL', reason: 'Milling Grain (Value Add)', weight: persona.priorities.work * 1.5 };
    }

    // Default Gather
    return {
        actionType: randomBasic,
        reason: 'Gathering resources',
        weight: persona.priorities.work * (stamina / 100)
    };
};


