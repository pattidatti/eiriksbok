
import { SimulationPlayer, SimulationRoom, ActionCost } from '../../simulationTypes';
import { BOT_PERSONAS, BotPersona } from './botPersonas';
import { ACTION_COSTS, INITIAL_RESOURCES, GAME_BALANCE } from '../../constants';

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
    return BOT_PERSONAS.DILIGENT_PEASANT;
};

const hasResources = (bot: SimulationPlayer, cost: Partial<typeof INITIAL_RESOURCES.PEASANT>): boolean => {
    for (const [key, amount] of Object.entries(cost)) {
        if (key === 'stamina') continue; // Handled separately
        const current = (bot.resources as any)[key] || 0;
        if (current < (amount as number)) return false;
    }
    return true;
};

export const decideBotAction = (bot: SimulationPlayer, room: SimulationRoom): BotDecision | null => {
    if (!bot || !room) return null;

    const persona = getPersona(bot);
    const decisions: BotDecision[] = [];
    const stamina = bot.status.stamina || 0;
    const gold = bot.resources.gold || 0;

    // 1. SURVIVAL (Eat)
    if (stamina < 30) {
        // Evaluate EAT (Needs food)
        // Check inventory for food? Simplified: Assume generic 'EAT' action costs money/food logic handled in action.
        // Actually, 'EAT' usually costs nothing but has cooldown or requires items.
        // Let's assume standard 'SLEEP' or 'EAT' if available. 
        // SLEEP is free stamina regen. EAT uses food.
        if (stamina < 10) {
            decisions.push({ actionType: 'SLEEP', reason: 'Critical Stamina', weight: 1.0 });
        } else {
            decisions.push({ actionType: 'SLEEP', reason: 'Low Stamina', weight: persona.priorities.eat });
        }
    }

    // 2. ECONOMY (Work)
    if (stamina > 20) {
        // Basic gathering
        // TODO: choose resource based on market price? That would be cool behavior.
        // For now, random basic resource.
        const workOptions = ['CHOP', 'MINE', 'FORAGE'];
        const randomBasic = workOptions[Math.floor(Math.random() * workOptions.length)];

        decisions.push({
            actionType: randomBasic,
            reason: 'Gathering resources',
            weight: persona.priorities.work * (stamina / 100)
        });

        // Refining (If has raw materials)
        if ((bot.resources.wood || 0) > 5) {
            decisions.push({ actionType: 'SAWMILL', reason: 'Refining Wood', weight: persona.priorities.work * 1.2 });
        }
    }

    // 3. POLITICS (Tax & Revolt)
    // Check if tax is due? Bot doesn't know "due", but can pay if asked.
    // For manual global actions like revolt:
    if (persona.priorities.revolt > 0.5 && gold > 50) {
        // Check Bribe logic
        const regionId = bot.regionId || 'capital';
        const region = room.regions[regionId];

        // Don't bribe if already chaotic or if we are the ruler
        if (region && region.rulerId !== bot.id) {
            decisions.push({
                actionType: 'BRIBE',
                payload: { regionId, amount: 10 },
                reason: 'Sowing chaos',
                weight: persona.priorities.revolt * 0.8
            });
        }
    }

    // 4. WAR (Siege)
    // If a siege is active, consider joining
    // Iterate regions to find active siege?
    /*
    const sieges = Object.values(room.regions).filter(r => r.activeSiege);
    if (sieges.length > 0) {
         // Join Attack or Defend based on persona
    }
    */

    // SORT & PICK
    decisions.sort((a, b) => b.weight - a.weight);

    if (decisions.length > 0 && decisions[0].weight > 0.2) {
        return decisions[0];
    }

    return null; // Idle
};
