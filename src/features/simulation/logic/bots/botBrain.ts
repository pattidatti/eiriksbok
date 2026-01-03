
import type { SimulationPlayer, SimulationRoom } from '../../simulationTypes';
import { BOT_PERSONAS, type BotPersona } from './botPersonas';

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
        else if (persona.id === 'AMBITIOUS_CLIMBER' && bot.role !== 'BARON') gripe = "Hvorfor er det ingen valg? Jeg vil ha makt!";

        if (gripe) {
            return { actionType: 'REPORT_FEEDBACK', payload: gripe, reason: 'Feedback', weight: 1.0 };
        }
    }

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

    // 3. AMBITION (Upgrade & Status)
    if (persona.priorities.upgrade > 0.6 && gold > 100) {
        // Mock upgrade logic - in real game would need specific building IDs
        // For now, they express desire
        decisions.push({ actionType: 'REPORT_FEEDBACK', payload: "Jeg har gull men vet ikke hva jeg skal oppgradere. Mangler docs.", reason: 'Feature Gap', weight: 0.5 });
    }

    // 4. POLITICS (Tax & Revolt)
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
                reason: 'Political maneuvering',
                weight: persona.priorities.revolt * 0.9
            });
        }

        // Climber specific: Check for Coup opportunity
        // Mocking unrest check since property might be named differently (e.g. stability)
        if (persona.id === 'AMBITIOUS_CLIMBER') {
            decisions.push({
                actionType: 'REPORT_FEEDBACK',
                payload: "Jeg ser uro! Jeg burde kunne starte et kupp nå, men knappen mangler.",
                reason: 'Missing Feature',
                weight: 0.95
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
