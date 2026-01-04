
import type { SimulationPlayer, SimulationRoom } from '../../simulationTypes';
import { BOT_PERSONAS, type BotPersona } from './botPersonas';
import { findPathToGoal } from './metaScanner';

import { getDayPart } from '../../utils/timeUtils';

// Define the shape of a decision
export interface BotDecision {
    actionType: string; // e.g., 'CHOP', 'EAT', 'PAY_TAX'
    subType?: string;   // e.g., 'ATTACK_GATE' for Siege
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
    // 1. SURVIVAL
    const survivalDecision = evaluateSurvival(bot, room, stamina);
    if (survivalDecision) decisions.push(survivalDecision);

    // 2. CONSUMPTION (Food & Buffs)
    const consumptionDecision = evaluateConsumption(bot);
    if (consumptionDecision) decisions.push(consumptionDecision);

    // 2. AMBITION (The Ladder)
    const ambitionDecision = evaluateAmbition(bot, room, persona, gold, stamina);
    if (ambitionDecision) decisions.push(ambitionDecision);

    // 3. ECONOMY (The Engine)
    const economyDecision = evaluateEconomy(bot, room, persona, gold, stamina);
    if (economyDecision) decisions.push(economyDecision);

    // 4. MARKET (The Invisible Hand)
    // Only check market if we have some gold or desperate need
    if (gold > 0 || stamina < 10) {
        const marketDecision = evaluateMarket(bot, room, persona, gold, stamina);
        if (marketDecision) decisions.push(marketDecision);
    }

    // 5. WARFARE (The Iron Fist)
    const warfareDecision = evaluateSiegeWarfare(bot, room, persona, gold, stamina);
    if (warfareDecision) decisions.push(warfareDecision);

    // 6. CRAFTING (The Goal-Oriented Maker)
    const craftingDecision = evaluateCrafting(bot, room, persona, gold, stamina);
    if (craftingDecision) decisions.push(craftingDecision);

    // SORT & PICK
    decisions.sort((a, b) => b.weight - a.weight);

    if (decisions.length > 0 && decisions[0].weight > 0.1) {
        return decisions[0];
    }

    return null; // Idle
};

// --- SUB-SYSTEMS ---

const evaluateSurvival = (_bot: SimulationPlayer, room: SimulationRoom, stamina: number): BotDecision | null => {
    // Check global time
    const gameTick = room.world?.gameTick || 0;
    const isNight = getDayPart(gameTick) === 'NIGHT';

    if (stamina < 20) {
        if (isNight) {
            return { actionType: 'SLEEP', reason: 'Critical Stamina (Night)', weight: 1.0 }; // Force sleep
        } else {
            // If day, take a nap in the square/tavern/home
            return { actionType: 'REST', payload: { locationId: 'village_square' }, reason: 'Nap (Waiting for night)', weight: 0.9 };
        }
    }
    if (stamina < 40) {
        if (isNight) {
            return { actionType: 'SLEEP', reason: 'Low Stamina (Night)', weight: 0.8 };
        }
        // During day with < 40, we might just keep working unless lazy
    }
    return null;
};

const evaluateConsumption = (bot: SimulationPlayer): BotDecision | null => {
    // 1. Eat Bread for Stamina
    const stamina = bot.status.stamina || 0;

    // Bread restores 20. Don't waste it if > 80.
    if (stamina < 60) {
        if ((bot.resources.bread || 0) > 0) {
            return { actionType: 'CONSUME', payload: { itemId: 'bread', isResource: true }, reason: 'Eating Bread for Stamina', weight: 0.85 };
        }
        // Check inventory for unique bread items (legacy support)
        const breadItem = bot.inventory?.find(i => i.id.startsWith('bread'));
        if (breadItem) {
            return { actionType: 'CONSUME', payload: { itemId: breadItem.id, isResource: false }, reason: 'Eating Bread (Item)', weight: 0.85 };
        }
    }

    // 2. Eat Omelette for Buff
    // Omelette gives "Lett til beins" (reduced stamina cost). Good before work.
    const hasBuff = bot.activeBuffs?.some(b => b.type === 'STAMINA_SAVE');
    if (!hasBuff && stamina > 50) { // Only buff up if we are healthy enough to work
        if ((bot.resources as any)['omelette'] > 0) { // Omelette might be resource or item
            return { actionType: 'CONSUME', payload: { itemId: 'omelette', isResource: true }, reason: 'Eating Omelette for Buff', weight: 0.7 };
        }
        const omeletteItem = bot.inventory?.find(i => i.id.startsWith('omelette'));
        if (omeletteItem) {
            return { actionType: 'CONSUME', payload: { itemId: omeletteItem.id, isResource: false }, reason: 'Eating Omelette (Item)', weight: 0.7 };
        }
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
    if ((bot.resources.wood || 0) > 20) return { actionType: 'REFINE', payload: { recipeId: 'plank' }, reason: 'Foredler ved for å øke verdien på eiendommen', weight: 0.9 };
    if ((bot.resources.grain || 0) > 20) return { actionType: 'REFINE', payload: { recipeId: 'flour' }, reason: 'Maler korn for å sikre matforsyning', weight: 0.9 };
    if ((bot.resources.iron_ore || 0) > 10) return { actionType: 'REFINE', payload: { recipeId: 'iron_ingot' }, reason: 'Smelter jern for fremtidig verktøy', weight: 0.9 };

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
        return { actionType: 'REFINE', payload: { recipeId: 'plank' }, reason: 'Refining Wood (Value Add)', weight: persona.priorities.work * 1.5 };
    }
    if ((bot.resources.grain || 0) > 10) {
        return { actionType: 'REFINE', payload: { recipeId: 'flour' }, reason: 'Milling Grain (Value Add)', weight: persona.priorities.work * 1.5 };
    }

    // Default Gather
    return {
        actionType: randomBasic,
        reason: 'Gathering resources',
        weight: persona.priorities.work * (stamina / 100)
    };
};

const evaluateMarket = (bot: SimulationPlayer, room: SimulationRoom, persona: BotPersona, gold: number, stamina: number): BotDecision | null => {
    // Market Logic: Buy Low, Sell High, or Panic Buy Food

    const marketKey = bot.regionId || 'capital';
    const market = room.markets?.[marketKey] || room.market;
    if (!market) return null;

    // 1. PANIC: Starvation (Buy Food)
    if (stamina < 20) {
        // Find cheapest food
        const foods = ['bread', 'pie', 'meat', 'apple']; // Add all food types
        let bestFood: string | null = null;
        let lowestPrice = 9999;

        for (const f of foods) {
            const item = (market as any)[f];
            if (item && item.stock > 0 && item.price < lowestPrice && item.price <= gold) {
                lowestPrice = item.price;
                bestFood = f;
            }
        }

        if (bestFood) {
            return { actionType: 'BUY', payload: { resource: bestFood }, reason: 'Starving! Buying food.', weight: 0.95 };
        }
    }

    // 2. SELLING EXCESS (Generic Logic)
    // If I have > 20 of something, sell 1.
    const sellables = ['wood', 'stone', 'grain', 'plank', 'flour', 'iron_ingot'];

    // Merchant logic: Sell aggressively
    const sellThreshold = persona.id === 'GREEDY_MERCHANT' ? 5 : 20;

    for (const res of sellables) {
        const amt = (bot.resources as any)[res] || 0;
        if (amt > sellThreshold) {
            // Check if market accepts it? (For now assume yes)
            return { actionType: 'SELL', payload: { resource: res }, reason: `Selling excess ${res}`, weight: 0.6 };
        }
    }

    return null;
};



const evaluateSiegeWarfare = (bot: SimulationPlayer, room: SimulationRoom, persona: BotPersona, gold: number, stamina: number): BotDecision | null => {
    // Siege Logic: Do I want to start a war? Do I want to fight in one?

    const regionId = bot.regionId || 'capital';
    if (regionId === 'capital') return null; // Can't siege capital? Or maybe global logic differs.

    const region = room.regions?.[regionId];
    if (!region) return null;

    const activeSiege = region.activeSiege;

    // 1. JOINING / STARTING
    if (!activeSiege) {
        // Only Aggressive/Anarchist/Climber bots start sieges
        if (persona.priorities.revolt > 0.8 && stamina > 50 && gold > 200) {
            // Check if ruler is NOT me
            if (region.rulerId !== bot.id && region.rulerName !== bot.name && region.rulerName !== 'Ingen') {
                return { actionType: 'START_SIEGE', payload: { targetRegionId: regionId }, reason: 'REVOLUTION!', weight: 0.9 };
            }
        }
        return null; // Peace time
    }

    // 2. FIGHTING (Active Siege)

    // Check if I am participant
    const attackers = activeSiege.attackers || {};
    const defenders = activeSiege.defenders || {};
    const isParticipant = attackers[bot.id] || defenders[bot.id];

    if (!isParticipant) {
        // Should I join?
        if (persona.priorities.attack > 0.5 || persona.priorities.defend > 0.5) {
            return { actionType: 'JOIN_SIEGE', payload: { targetRegionId: regionId }, reason: 'Joining the fray!', weight: 1.0 };
        }
        return null;
    }

    // 3. TACTICAL DECISIONS (I am in!)
    const siegePhase = activeSiege.phase;

    if (siegePhase === 'BREACH') {
        // Check if gate is destroyed first? No, server handles it. Just attack.
        return { actionType: 'SIEGE_ACTION', payload: { targetRegionId: regionId }, subType: 'ATTACK_GATE', reason: 'Smash the gate!', weight: 0.9 };
    }

    if (siegePhase === 'COURTYARD') {
        const myData = (attackers[bot.id] || defenders[bot.id]) as any;
        // Dodge Boss?
        if (activeSiege.bossTargetLane === myData.lane) {
            // Move to safe lane
            const safeLane = (myData.lane + 1) % 3;
            return { actionType: 'SIEGE_ACTION', payload: { targetRegionId: regionId, lane: safeLane }, subType: 'MOVE_LANE', reason: 'Dodging Boss Attack', weight: 1.0 };
        }
        // Attack Boss
        return { actionType: 'SIEGE_ACTION', payload: { targetRegionId: regionId }, subType: 'ATTACK_BOSS', reason: 'Fighting Garrison Commander', weight: 0.9 };
    }

    if (siegePhase === 'THRONE_ROOM') {
        // Do I have armor to claim throne?
        const myArmor = bot.resources.armor || 0;

        // Am I already on throne?
        const occupiers = activeSiege.throne?.occupiers || {};
        if (occupiers[bot.id]) return null; // I am winning, just wait.

        if (myArmor > 10) {
            return { actionType: 'SIEGE_ACTION', payload: { targetRegionId: regionId }, subType: 'CLAIM_THRONE', reason: 'I CLAIM THIS THRONE!', weight: 1.0 };
        }

        // Just attack whoever is on throne (Sunder)
        const targets = Object.keys(occupiers);
        if (targets.length > 0) {
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            return { actionType: 'SIEGE_ACTION', payload: { targetRegionId: regionId, targetId: randomTarget }, subType: 'SUNDER_ARMOR', reason: 'Drag them down!', weight: 0.9 };
        }
    }

    return null;
}
const evaluateCrafting = (bot: SimulationPlayer, _room: SimulationRoom, persona: BotPersona, _gold: number, _stamina: number): BotDecision | null => {
    // 1. Determine Goal
    let goalItem = '';

    // Role based desire
    if (persona.id === 'LOYAL_SOLDIER' || persona.id === 'ANARCHIST') {
        if (!bot.inventory?.find(i => i.id.includes('sword'))) goalItem = 'iron_sword';
        else if (!bot.inventory?.find(i => i.id.includes('armor'))) goalItem = 'leather_armor';
    } else if (persona.id === 'SIMPLE_PEASANT') {
        if (!bot.inventory?.find(i => i.id.includes('axe'))) goalItem = 'stone_axe';
    }

    if (!goalItem) return null;

    // 2. Find Path
    const path = findPathToGoal(goalItem, bot.resources);
    if (!path) return null;

    // 3. Execute Step
    // message format: "Jeg trenger X..." or "Jeg vil ha..."
    // action format: could be 'REFINE_PLANK' or 'CRAFT:iron_sword'

    const actionKey = path.action;

    if (actionKey.startsWith('CRAFT:')) {
        const recipeId = actionKey.split(':')[1];
        // Check ingredients (Simplified: findPathToGoal usually means we have prerequisites or it points to prerequisites)
        // Actually findPathToGoal checks "resourceOrigins". It returns the ACTION that produces the target.
        // It does NOT check if we have ingredients for that action yet.

        // So we must check ingredients here.
        // We'd need to look up recipe again. 
        // Hack: Just try to craft. If it fails, next tick we might try to buy ingredients if we add logic here.

        // Let's add "Buy Ingredient" logic here.
        // We need the recipe. Hard to get efficiently without importing CRAFTING_RECIPES here again.
        // For now, simple TRY CRAFT.
        return { actionType: 'CRAFT', subType: recipeId, reason: `Crafting my goal: ${goalItem}`, weight: 0.8 };
    }

    // If it's a basic gathering action (CHOP, MINE, PLANT)
    if (['CHOP', 'MINE', 'QUARRY', 'PLANT', 'GATHER_HONEY', 'GATHER_WOOL'].includes(actionKey)) {
        return { actionType: actionKey, reason: `Gathering for goal: ${goalItem}`, weight: 0.85 };
    }

    return null;
};
