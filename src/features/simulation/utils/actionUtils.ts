import type { SimulationPlayer, EquipmentItem, EquipmentSlot } from '../simulationTypes';
import { ACTION_COSTS, SEASONS, WEATHER, REFINERY_RECIPES, CRAFTING_RECIPES, ITEM_TEMPLATES } from '../constants';
import { getDayPart } from './timeUtils';

interface ValidationResult {
    success: boolean;
    reason?: string;
}

export const ACTION_EQUIPMENT_MAP: Record<string, EquipmentSlot[]> = {
    'CHOP': ['AXE', 'OFF_HAND'],
    'MINE': ['PICKAXE', 'OFF_HAND'],
    'QUARRY': ['PICKAXE', 'OFF_HAND'],
    'WORK': ['SCYTHE', 'OFF_HAND'],
    'RAID': ['MAIN_HAND', 'OFF_HAND', 'BODY', 'HEAD', 'FEET'], // Combat uses all
    'DEFEND': ['MAIN_HAND', 'OFF_HAND', 'BODY', 'HEAD', 'FEET'],
    'PATROL': ['MAIN_HAND', 'OFF_HAND', 'BODY'],
    'EXPLORE': ['MAIN_HAND', 'OFF_HAND', 'BODY', 'HEAD', 'FEET'],
    // Crafting might use main hand tools if we define them, e.g. Hammer
    'CRAFT': ['MAIN_HAND', 'AXE', 'PICKAXE', 'SCYTHE', 'HAMMER'],
    'HUNT': ['MAIN_HAND']
};

export const getActionEquipment = (player: SimulationPlayer, actionId: string): EquipmentItem[] => {
    const slots = ACTION_EQUIPMENT_MAP[actionId];
    if (!slots || !player.equipment) return [];

    return slots
        .map(slot => player.equipment?.[slot])
        .filter((item): item is EquipmentItem => {
            if (!item) return false;

            // Check instance first
            if (item.relevantActions?.includes(actionId)) return true;

            // Fallback to template if relevantActions is missing on instance
            if (!item.relevantActions) {
                const tid = item.id.split('_').slice(0, 2).join('_'); // rough guess: stone_axe_123 -> stone_axe
                const template = (ITEM_TEMPLATES as any)[item.id] || (ITEM_TEMPLATES as any)[tid] || Object.values(ITEM_TEMPLATES).find(t => item.id.startsWith(t.id));

                if (template?.relevantActions?.includes(actionId)) return true;

                // If template search failed but it has NO relevantActions defined, treat as generic (true)
                return !template || !template.relevantActions;
            }

            return false;
        });
};

export const getActionSlots = (player: SimulationPlayer, actionId: string): EquipmentSlot[] => {
    const slots = ACTION_EQUIPMENT_MAP[actionId];
    if (!slots || !player.equipment) return [];

    return slots.filter(slot => {
        const item = player.equipment?.[slot];
        if (!item) return false;

        if (item.relevantActions?.includes(actionId)) return true;

        if (!item.relevantActions) {
            const tid = item.id.split('_').slice(0, 2).join('_');
            const template = (ITEM_TEMPLATES as any)[item.id] || (ITEM_TEMPLATES as any)[tid] || Object.values(ITEM_TEMPLATES).find(t => item.id.startsWith(t.id));
            if (template?.relevantActions?.includes(actionId)) return true;
            return !template || !template.relevantActions;
        }
        return false;
    });
};

export const checkActionRequirements = (
    player: SimulationPlayer,
    action: any, // Can be string (actionId) or payload object
    currentSeason: keyof typeof SEASONS = 'Spring',
    currentWeather: keyof typeof WEATHER = 'Clear',
    totalTicks: number = 0
): ValidationResult => {
    let actionId = typeof action === 'string' ? action : action.type;
    let payload = typeof action === 'object' ? { ...action } : {};

    // Handle prefixed actions from UI (e.g. REFINE_plank)
    if (actionId.startsWith('REFINE_') && !REFINERY_RECIPES[actionId]) {
        payload.recipeId = actionId.replace('REFINE_', '').toLowerCase();
        actionId = 'REFINE';
    } else if (actionId.startsWith('CRAFT_') && !CRAFTING_RECIPES[actionId]) {
        payload.subType = actionId.replace('CRAFT_', '').toLowerCase();
        actionId = 'CRAFT';
    } else if (CRAFTING_RECIPES[actionId]) {
        payload.subType = actionId;
        actionId = 'CRAFT';
    }

    // 1. Durability Check
    const equipment = getActionEquipment(player, actionId);
    for (const item of equipment) {
        if (item.durability <= 0) {
            return { success: false, reason: `Ødelagt: ${item.name}` };
        }
    }

    // 2. Cost Check
    let costs: Record<string, number> = {};
    const baseCostData = (ACTION_COSTS as any)[actionId];
    if (baseCostData) costs = { ...baseCostData };

    // Supplement with Recipe Costs for Production
    if (actionId === 'REFINE' || actionId === 'CRAFT') {
        let recipe;
        if (actionId === 'REFINE') recipe = REFINERY_RECIPES[payload.recipeId];
        if (actionId === 'CRAFT') recipe = CRAFTING_RECIPES[payload.subType];

        if (recipe) {
            // Recipe costs OVERRIDE base costs for stamina if present
            if (recipe.stamina !== undefined) {
                costs.stamina = recipe.stamina;
            }

            if (recipe.input) {
                Object.entries(recipe.input).forEach(([res, amt]) => {
                    costs[res] = (costs[res] || 0) + (amt as number);
                });
            }
        }
    }

    if (Object.keys(costs).length > 0) {
        const seasonData = SEASONS[currentSeason];
        const weatherData = WEATHER[currentWeather];
        const baseStaminaMod = seasonData?.staminaMod || 1.0;
        const weatherStaminaMod = weatherData?.staminaMod || 1.0;

        const isNight = getDayPart(totalTicks) === 'NIGHT';
        const nightStaminaMod = isNight ? 1.2 : 1.0;

        const baseStaminaCost = costs.stamina || 0;

        // NIGHT RESTRICTION FOR SLEEP
        if (actionId === 'SLEEP' && !isNight) {
            return { success: false, reason: "Du kan bare sove når det er natt" };
        }

        const finalStaminaCost = Math.ceil(baseStaminaCost * baseStaminaMod * weatherStaminaMod * nightStaminaMod);

        if ((player.status.stamina || 0) < finalStaminaCost) {
            const missing = Math.ceil(finalStaminaCost - (player.status.stamina || 0));
            return { success: false, reason: `Du mangler ${missing} energi` };
        }

        const RESOURCE_NAMES: Record<string, string> = {
            bread: 'brød',
            gold: 'gull',
            wood: 'tre',
            flour: 'mel',
            grain: 'korn',
            iron_ingot: 'jernbarrer',
            plank: 'planker',
            stone: 'stein',
            meat: 'kjøtt',
            honey: 'honning',
            wool: 'ull',
            iron_ore: 'jernmalm',
            cloth: 'stoff',
            stamina: 'energi'
        };

        // Resource Check
        for (const [res, amt] of Object.entries(costs)) {
            if (res === 'stamina') continue;
            const playerRes = (player.resources as any)[res] || 0;
            if (playerRes < (amt as number)) {
                const resName = RESOURCE_NAMES[res] || res;
                return { success: false, reason: `Du mangler ${amt - playerRes} ${resName}` };
            }
        }
    }

    return { success: true };
};

export const getActionCostString = (
    action: any,
    currentSeason: keyof typeof SEASONS = 'Spring',
    currentWeather: keyof typeof WEATHER = 'Clear',
    totalTicks: number = 0
): string | null => {
    let actionId = typeof action === 'string' ? action : action.type;
    let payload = typeof action === 'object' ? { ...action } : {};

    // Handle prefixed actions from UI (e.g. REFINE_plank)
    if (actionId.startsWith('REFINE_') && !REFINERY_RECIPES[actionId]) {
        payload.recipeId = actionId.replace('REFINE_', '').toLowerCase();
        actionId = 'REFINE';
    } else if (actionId.startsWith('CRAFT_') && !CRAFTING_RECIPES[actionId]) {
        payload.subType = actionId.replace('CRAFT_', '').toLowerCase();
        actionId = 'CRAFT';
    } else if (CRAFTING_RECIPES[actionId]) {
        payload.subType = actionId;
        actionId = 'CRAFT';
    }

    let costs: Record<string, number> = {};
    const baseCostData = (ACTION_COSTS as any)[actionId];
    if (baseCostData) costs = { ...baseCostData };

    if (actionId === 'REFINE' || actionId === 'CRAFT') {
        let recipe;
        if (actionId === 'REFINE') recipe = REFINERY_RECIPES[payload.recipeId];
        if (actionId === 'CRAFT') recipe = CRAFTING_RECIPES[payload.subType];

        if (recipe) {
            // Recipe costs OVERRIDE base costs for stamina if present
            if (recipe.stamina !== undefined) {
                costs.stamina = recipe.stamina;
            }

            if (recipe.input) {
                Object.entries(recipe.input).forEach(([res, amt]) => {
                    costs[res] = (costs[res] || 0) + (amt as number);
                });
            }
        }
    }

    if (Object.keys(costs).length === 0) return null;

    const parts: string[] = [];

    // Stamina
    if (costs.stamina) {
        const seasonData = SEASONS[currentSeason];
        const weatherData = WEATHER[currentWeather];
        const isNight = getDayPart(totalTicks) === 'NIGHT';
        const nightMod = isNight ? 1.2 : 1.0;
        const mod = (seasonData?.staminaMod || 1.0) * (weatherData?.staminaMod || 1.0) * nightMod;
        const finalStamina = Math.ceil(costs.stamina * mod);

        let prefix = '-';
        if (costs.stamina < 0) prefix = '+'; // Negative cost = gain (sleep)

        parts.push(`${prefix}${Math.abs(finalStamina)}⚡`);
    }

    // Resources
    const ICONS: Record<string, string> = {
        bread: '🍞',
        gold: '💰',
        wood: '🪵',
        flour: '🧂',
        grain: '🌾',
        iron_ingot: '🧱',
        plank: '🪵',
        stone: '🪨',
        meat: '🥩',
        honey: '🍯',
        wool: '🧶',
        iron_ore: '⛏️',
        cloth: '👕'
    };

    for (const [res, amt] of Object.entries(costs)) {
        if (res === 'stamina') continue;
        const amount = amt as number;
        const icon = ICONS[res] || res;
        parts.push(`-${amount}${icon}`);
    }

    return parts.join(' ');
};
