import { GAME_BALANCE, SEASONS, WEATHER } from '../constants';
import type { SkillType } from '../simulationTypes';

/**
 * Calculates the yield for a production action, incorporating skills, equipment, 
 * seasonal/weather modifiers, and minigame performance.
 */
export const calculateYield = (
    actor: {
        skills?: Record<string, { level: number }>,
        equipment?: Partial<Record<string, { stats?: { yieldBonus?: number } }>>
    },
    baseYield: number,
    skillType: SkillType,
    modifiers: {
        season?: number,
        weather?: number,
        law?: number,
        performance?: number,
        upgrades?: number,
        isRefining?: boolean
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
    if (actor.equipment) {
        const items = Array.isArray(actor.equipment) ? actor.equipment : Object.values(actor.equipment);
        items.forEach(item => {
            if (item && item.stats?.yieldBonus) equipBonus += item.stats.yieldBonus;
        });
    }
    total += equipBonus;

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
