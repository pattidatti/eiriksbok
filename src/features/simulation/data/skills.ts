import type { Role, SkillType, SkillData } from '../simulationTypes';

export const INITIAL_SKILLS: Record<Role, Record<SkillType, SkillData>> = {
    PEASANT: {
        FARMING: { level: 1, xp: 0, maxXp: 100 },
        WOODCUTTING: { level: 1, xp: 0, maxXp: 100 },
        MINING: { level: 0, xp: 0, maxXp: 100 },
        CRAFTING: { level: 0, xp: 0, maxXp: 100 },
        STEWARDSHIP: { level: 0, xp: 0, maxXp: 100 },
        COMBAT: { level: 0, xp: 0, maxXp: 100 },
        TRADING: { level: 0, xp: 0, maxXp: 100 },
        THEOLOGY: { level: 0, xp: 0, maxXp: 100 }
    },
    BARON: {
        FARMING: { level: 3, xp: 0, maxXp: 300 },
        WOODCUTTING: { level: 3, xp: 0, maxXp: 300 },
        MINING: { level: 1, xp: 0, maxXp: 100 },
        CRAFTING: { level: 1, xp: 0, maxXp: 100 },
        STEWARDSHIP: { level: 5, xp: 0, maxXp: 1000 },
        COMBAT: { level: 3, xp: 0, maxXp: 300 },
        TRADING: { level: 3, xp: 0, maxXp: 300 },
        THEOLOGY: { level: 1, xp: 0, maxXp: 100 }
    },
    KING: {
        FARMING: { level: 1, xp: 0, maxXp: 100 },
        WOODCUTTING: { level: 1, xp: 0, maxXp: 100 },
        MINING: { level: 1, xp: 0, maxXp: 100 },
        CRAFTING: { level: 1, xp: 0, maxXp: 100 },
        STEWARDSHIP: { level: 10, xp: 0, maxXp: 5000 },
        COMBAT: { level: 5, xp: 0, maxXp: 1500 },
        TRADING: { level: 5, xp: 0, maxXp: 1500 },
        THEOLOGY: { level: 5, xp: 0, maxXp: 1500 }
    },
    SOLDIER: {
        FARMING: { level: 1, xp: 0, maxXp: 100 },
        WOODCUTTING: { level: 1, xp: 0, maxXp: 100 },
        MINING: { level: 0, xp: 0, maxXp: 100 },
        CRAFTING: { level: 1, xp: 0, maxXp: 100 },
        STEWARDSHIP: { level: 0, xp: 0, maxXp: 100 },
        COMBAT: { level: 5, xp: 0, maxXp: 1500 },
        TRADING: { level: 0, xp: 0, maxXp: 100 },
        THEOLOGY: { level: 0, xp: 0, maxXp: 100 }
    },
    MERCHANT: {
        FARMING: { level: 1, xp: 0, maxXp: 100 },
        WOODCUTTING: { level: 1, xp: 0, maxXp: 100 },
        MINING: { level: 0, xp: 0, maxXp: 100 },
        CRAFTING: { level: 2, xp: 0, maxXp: 200 },
        STEWARDSHIP: { level: 1, xp: 0, maxXp: 100 },
        COMBAT: { level: 0, xp: 0, maxXp: 100 },
        TRADING: { level: 5, xp: 0, maxXp: 1500 },
        THEOLOGY: { level: 0, xp: 0, maxXp: 100 }
    }
};
