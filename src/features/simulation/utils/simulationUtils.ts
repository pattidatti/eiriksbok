import { ref, runTransaction } from 'firebase/database';
import { simulationDb as db } from '../simulationFirebase';
import { GAME_BALANCE, SEASONS, WEATHER } from '../constants';
import { ITEM_TEMPLATES } from '../data/items';
import type { SkillType } from '../simulationTypes';

/**
 * Logs a message to the simulation room, ensuring the message list is capped at 50 items.
 * Uses a transaction to prevent race conditions.
 */
export const logSimulationMessage = async (pin: string, message: string) => {
    const messagesRef = ref(db, `simulation_rooms/${pin}/messages`);

    await runTransaction(messagesRef, (currentMessages) => {
        let newMessages: string[] = [];

        if (Array.isArray(currentMessages)) {
            newMessages = currentMessages;
        } else if (currentMessages && typeof currentMessages === 'object') {
            newMessages = Object.values(currentMessages);
        }

        newMessages.push(message);

        // Cap at 50 messages
        if (newMessages.length > 50) {
            newMessages = newMessages.slice(newMessages.length - 50);
        }

        return newMessages;
    });
};

/**
 * Calculates the yield for a production action, incorporating skills, equipment, 
 * seasonal/weather modifiers, and minigame performance.
 */
export const calculateYield = (
    actor: {
        skills?: Record<string, { level: number }>,
        equipment?: Partial<Record<string, { stats?: { yieldBonus?: number }, relevantActions?: string[], id: string }>>
    },
    baseYield: number,
    skillType: SkillType,
    modifiers: {
        season?: number,
        weather?: number,
        law?: number,
        performance?: number,
        upgrades?: number,
        isRefining?: boolean,
        actionType?: string
    } = {}
) => {
    // 1. Base
    let total = baseYield;

    // 2. Skill Bonus
    const skill = actor.skills?.[skillType] || { level: 0 };
    const bonusPerLevel = modifiers.isRefining
        ? GAME_BALANCE.SKILLS.REFINING_BONUS
        : GAME_BALANCE.SKILLS.GATHERING_BONUS;

    const skillMultiplier = 1 + (skill.level * bonusPerLevel);
    total *= skillMultiplier;

    // 3. Equipment Bonus (Flat + Yield)
    let equipBonus = 0;
    let hasRelevantTool = false;

    if (actor.equipment) {
        const slots = Object.keys(actor.equipment);
        slots.forEach(slot => {
            const item = (actor.equipment as any)[slot];
            if (!item) return;

            // Lookup template if relevantActions is missing on instance
            let relevantActions = item.relevantActions;
            if (!relevantActions && item.id) {
                // Handle instance IDs like 'pickaxe_123' by stripping suffix if needed, 
                // but usually templates are keyed by base ID.
                const tid = Object.keys(ITEM_TEMPLATES).find(k => item.id === k || item.id.startsWith(k + '_') || item.id.startsWith(k + '-'));
                if (tid) {
                    relevantActions = (ITEM_TEMPLATES as any)[tid]?.relevantActions;
                }
            }

            // Check if this item is relevant for the action
            const isRelevant = !modifiers.actionType || relevantActions?.includes(modifiers.actionType);

            if (isRelevant) {
                // Check stats on item instance, fallback to template? 
                // Usually stats should be on instance, but if not, check template
                const stats = item.stats || (ITEM_TEMPLATES as any)[item.id]?.stats;

                if (stats?.yieldBonus) equipBonus += stats.yieldBonus;

                if (slot === 'AXE' || slot === 'PICKAXE' || slot === 'SCYTHE' || slot === 'MAIN_HAND' || slot === 'OFF_HAND') {
                    hasRelevantTool = true;
                }
            }
        });
    }

    total += equipBonus;

    // 3.5 No-tool Penalty (Utbytte-straff)
    // If it's a gathering task and we have no relevant tool, apply a massive penalty
    const isExempt = modifiers.actionType === 'FORAGE' || modifiers.actionType === 'GATHER_HONEY';

    if (!modifiers.isRefining && !hasRelevantTool && !isExempt) {
        // Strict requirement check
        if ((modifiers as any).requiresTool) return 0;

        const penalty = GAME_BALANCE.GATHERING?.NO_TOOL_PENALTY || 0.8; // 80% reduction default
        total *= (1 - penalty);
    }

    // 4. Multipliers (Season, Weather, Law, Upgrade)
    const multiplier = (modifiers.season || 1) * (modifiers.weather || 1) * (modifiers.law || 1) * (modifiers.upgrades || 1);
    total = Math.floor(total * multiplier);

    // 5. Minigame Performance
    if (modifiers.performance !== undefined) {
        const perfMult = GAME_BALANCE.MINIGAME.BASE_MULTIPLIER + (modifiers.performance * GAME_BALANCE.MINIGAME.PERFORMANCE_WEIGHT);
        total = Math.ceil(total * perfMult);
    }

    return Math.max(0, total);
};

/**
 * Calculates the final stamina cost for an action based on base costs and world modifiers.
 */
export const calculateStaminaCost = (
    baseCost: number,
    season: keyof typeof SEASONS,
    weather: keyof typeof WEATHER
) => {
    const seasonData = (SEASONS as any)[season];
    const weatherData = (WEATHER as any)[weather];

    const baseStaminaMod = seasonData?.staminaMod || 1.0;
    const weatherStaminaMod = weatherData?.staminaMod || 1.0;

    return Math.ceil(baseCost * baseStaminaMod * weatherStaminaMod);
};
