import type { SimulationPlayer, Role, EquipmentItem } from '../simulationTypes';
import { ACTION_COSTS, SEASONS, WEATHER, GAME_BALANCE } from '../constants';

interface ValidationResult {
    success: boolean;
    reason?: string;
}

export const checkActionRequirements = (
    player: SimulationPlayer,
    actionId: string,
    currentSeason: keyof typeof SEASONS = 'Spring',
    currentWeather: keyof typeof WEATHER = 'Clear'
): ValidationResult => {
    // 1. Role Check (Basic Validation already done in UI mostly, but good for safety)
    // Removed strict role check here as UI handles visibility usually.

    // 2. Durability Check
    // Map actions to equipment slots
    const actionEquipmentMap: Record<string, string> = {
        'CHOP': 'tools',
        'MINE': 'tools',
        'QUARRY': 'tools',
        'WORK': 'tools',
        'RAID': 'weapon', // Also armor on hit
        'DEFEND': 'weapon',
        'PATROL': 'weapon'
    };

    const requiredEquipment = actionEquipmentMap[actionId];
    if (requiredEquipment && player.equipment) {
        // Safe access in case equipment is partial
        const item = (player.equipment as any)[requiredEquipment] as EquipmentItem | undefined;
        if (item && item.durability <= 0) {
            return { success: false, reason: `Ødelagt ${requiredEquipment === 'tools' ? 'Verktøy' : 'Våpen'}` };
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
