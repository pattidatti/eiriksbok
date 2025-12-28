import type { SimulationPlayer, EquipmentItem, EquipmentSlot } from '../simulationTypes';
import { ACTION_COSTS, SEASONS, WEATHER, REFINERY_RECIPES, CRAFTING_RECIPES } from '../constants';

interface ValidationResult {
    success: boolean;
    reason?: string;
}

export const ACTION_EQUIPMENT_MAP: Record<string, EquipmentSlot[]> = {
    'CHOP': ['MAIN_HAND'],
    'MINE': ['MAIN_HAND'],
    'QUARRY': ['MAIN_HAND'],
    'WORK': ['MAIN_HAND'],
    'RAID': ['MAIN_HAND', 'OFF_HAND', 'BODY', 'HEAD', 'FEET'], // Combat uses all
    'DEFEND': ['MAIN_HAND', 'OFF_HAND', 'BODY', 'HEAD', 'FEET'],
    'PATROL': ['MAIN_HAND', 'OFF_HAND', 'BODY'],
    // Crafting might use main hand tools if we define them, e.g. Hammer
    'CRAFT': ['MAIN_HAND']
};

export const getActionEquipment = (player: SimulationPlayer, actionId: string): EquipmentItem[] => {
    const slots = ACTION_EQUIPMENT_MAP[actionId];
    if (!slots || !player.equipment) return [];

    return slots
        .map(slot => player.equipment?.[slot])
        .filter((item): item is EquipmentItem => !!item);
};

export const checkActionRequirements = (
    player: SimulationPlayer,
    action: any, // Can be string (actionId) or payload object
    currentSeason: keyof typeof SEASONS = 'Spring',
    currentWeather: keyof typeof WEATHER = 'Clear'
): ValidationResult => {
    const actionId = typeof action === 'string' ? action : action.type;

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
        const payload = typeof action === 'object' ? action : {};
        let recipe;
        if (actionId === 'REFINE') recipe = REFINERY_RECIPES[payload.recipeId];
        if (actionId === 'CRAFT') recipe = CRAFTING_RECIPES[payload.subType];

        if (recipe && recipe.input) {
            Object.entries(recipe.input).forEach(([res, amt]) => {
                costs[res] = (costs[res] || 0) + (amt as number);
            });
            if (recipe.stamina) costs.stamina = (costs.stamina || 0) + recipe.stamina;
        }
    }

    if (Object.keys(costs).length > 0) {
        // Stamina calculation
        const seasonData = SEASONS[currentSeason];
        const weatherData = WEATHER[currentWeather];
        const baseStaminaMod = seasonData?.staminaMod || 1.0;
        const weatherStaminaMod = weatherData?.staminaMod || 1.0;

        const baseStaminaCost = costs.stamina || 0;
        const finalStaminaCost = Math.ceil(baseStaminaCost * baseStaminaMod * weatherStaminaMod);

        if ((player.status.stamina || 0) < finalStaminaCost) {
            return { success: false, reason: `${finalStaminaCost}⚡ (Stamina)` };
        }

        // Resource Check
        for (const [res, amt] of Object.entries(costs)) {
            if (res === 'stamina') continue;
            const playerRes = (player.resources as any)[res] || 0;
            if (playerRes < (amt as number)) {
                return { success: false, reason: `Mangler ${amt} ${res}` };
            }
        }
    }

    return { success: true };
};

export const getActionCostString = (
    action: any,
    currentSeason: keyof typeof SEASONS = 'Spring',
    currentWeather: keyof typeof WEATHER = 'Clear'
): string | null => {
    const actionId = typeof action === 'string' ? action : action.type;

    let costs: Record<string, number> = {};
    const baseCostData = (ACTION_COSTS as any)[actionId];
    if (baseCostData) costs = { ...baseCostData };

    if (actionId === 'REFINE' || actionId === 'CRAFT') {
        const payload = typeof action === 'object' ? action : {};
        let recipe;
        if (actionId === 'REFINE') recipe = REFINERY_RECIPES[payload.recipeId];
        if (actionId === 'CRAFT') recipe = CRAFTING_RECIPES[payload.subType];

        if (recipe && recipe.input) {
            Object.entries(recipe.input).forEach(([res, amt]) => {
                costs[res] = (costs[res] || 0) + (amt as number);
            });
            if (recipe.stamina) costs.stamina = (costs.stamina || 0) + recipe.stamina;
        }
    }

    if (Object.keys(costs).length === 0) return null;

    const parts: string[] = [];

    // Stamina
    if (costs.stamina) {
        const seasonData = SEASONS[currentSeason];
        const weatherData = WEATHER[currentWeather];
        const mod = (seasonData?.staminaMod || 1.0) * (weatherData?.staminaMod || 1.0);
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
        timber: '🪜',
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
