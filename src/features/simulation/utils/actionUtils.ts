import type { SimulationPlayer, EquipmentItem, EquipmentSlot } from '../simulationTypes';
import { ACTION_COSTS, SEASONS, WEATHER } from '../constants';

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
    actionId: string,
    currentSeason: keyof typeof SEASONS = 'Spring',
    currentWeather: keyof typeof WEATHER = 'Clear'
): ValidationResult => {
    // 1. Role Check (Basic Validation already done in UI mostly, but good for safety)
    // Removed strict role check here as UI handles visibility usually.

    // 2. Durability Check
    const equipment = getActionEquipment(player, actionId);
    for (const item of equipment) {
        if (item.durability <= 0) {
            return { success: false, reason: `Ødelagt: ${item.name}` };
        }
    }

    // 3. Cost Check
    const costData = (ACTION_COSTS as any)[actionId];
    if (costData) {
        // Stamina calculation
        const seasonData = SEASONS[currentSeason];
        const weatherData = WEATHER[currentWeather];
        const baseStaminaMod = seasonData?.staminaMod || 1.0;
        const weatherStaminaMod = weatherData?.staminaMod || 1.0;

        const baseStaminaCost = costData.stamina || 0;
        const finalStaminaCost = Math.ceil(baseStaminaCost * baseStaminaMod * weatherStaminaMod);

        if ((player.status.stamina || 0) < finalStaminaCost) {
            return { success: false, reason: `${finalStaminaCost}⚡ (Stamina)` };
        }

        // Resource Check
        for (const [res, amt] of Object.entries(costData)) {
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
    actionId: string,
    currentSeason: keyof typeof SEASONS = 'Spring',
    currentWeather: keyof typeof WEATHER = 'Clear'
): string | null => {
    const costData = (ACTION_COSTS as any)[actionId];
    if (!costData) return null;

    const parts: string[] = [];

    // Stamina
    if (costData.stamina) {
        const seasonData = SEASONS[currentSeason];
        const weatherData = WEATHER[currentWeather];
        const mod = (seasonData?.staminaMod || 1.0) * (weatherData?.staminaMod || 1.0);
        const finalStamina = Math.ceil(costData.stamina * mod);

        let prefix = '-';
        if (costData.stamina < 0) prefix = '+'; // Negative cost = gain (sleep)

        parts.push(`${prefix}${Math.abs(finalStamina)}⚡`);
    }

    // Resources
    for (const [res, amt] of Object.entries(costData)) {
        if (res === 'stamina') continue;
        const amount = amt as number;
        let icon = '';
        if (res === 'bread') icon = '🍞';
        else if (res === 'gold') icon = '💰';
        else if (res === 'wood') icon = '🪵';

        // Handle gains vs costs in string? Usually costs are positive in this object.
        parts.push(`-${amount}${icon || res}`);
    }

    return parts.join(' ');
};
