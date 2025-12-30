import { GAME_BALANCE, REWARDS, SEASONS, WEATHER } from '../../constants';
import { calculateYield } from '../../utils/simulationUtils';
import { getActionSlots } from '../../utils/actionUtils';
import type { ActionContext } from '../actionTypes';

export const handleWork = (ctx: ActionContext) => {
    const { actor, room, action, localResult, trackXp, damageTool } = ctx;
    const activeLaws = room.world?.activeLaws || [];

    // Damage Tool (Check all relevant slots)
    getActionSlots(actor, 'WORK').forEach(slot => {
        damageTool(slot, GAME_BALANCE.DURABILITY.LOSS_WORK);
    });

    // Modifiers
    let lawYMod = 1.0;
    if (activeLaws.includes('conscription')) lawYMod = 0.8;
    const base = GAME_BALANCE.YIELD.WORK_GRAIN + (actor.upgrades?.includes('iron_plow') ? 5 : 0);

    const currentSeason = room.world?.season || 'Spring';
    const currentWeather = room.world?.weather || 'Clear';
    const seasonData = (SEASONS as any)[currentSeason];
    const weatherData = (WEATHER as any)[currentWeather];

    const performance = action.performance || 0.5;
    const yieldAmount = calculateYield(actor, base, 'FARMING', {
        season: seasonData?.yieldMod || 1.0,
        weather: weatherData?.yieldMod || 1.0,
        law: lawYMod,
        performance,
        actionType: 'WORK'
    });

    actor.resources.grain = (actor.resources.grain || 0) + yieldAmount;
    localResult.utbytte.push({ resource: 'grain', amount: yieldAmount });
    localResult.message = `Høstet ${yieldAmount} korn`;

    trackXp('FARMING', Math.ceil(REWARDS.WORK.xp * (1 + performance)));

    // Lucky Drop
    if (Math.random() < (GAME_BALANCE.LUCKY_DROP.CHANCE + (actor.equipment?.HEAD?.stats?.luckBonus || 0))) {
        const bonus = Math.ceil(yieldAmount * 0.5);
        actor.resources.grain += bonus;
        localResult.utbytte.push({ resource: 'grain', amount: bonus, bonus: true });
        localResult.message += ` + ${bonus} (FLAKS!)`;
    }
    return true;
};

export const handleChop = (ctx: ActionContext) => {
    const { actor, room, action, localResult, trackXp, damageTool } = ctx;
    const currentSeason = room.world?.season || 'Spring';

    getActionSlots(actor, 'CHOP').forEach(slot => {
        damageTool(slot, GAME_BALANCE.DURABILITY.LOSS_WORK);
    });

    let base = GAME_BALANCE.YIELD.CHOP_WOOD;
    if (currentSeason === 'Summer') base += GAME_BALANCE.YIELD.SUMMER_WOOD_BONUS;

    const performance = action.performance || 0.5;
    const yieldAmount = calculateYield(actor, base, 'WOODCUTTING', { performance, actionType: 'CHOP' });

    actor.resources.wood = (actor.resources.wood || 0) + yieldAmount;
    localResult.utbytte.push({ resource: 'wood', amount: yieldAmount });
    localResult.message = `Felte ${yieldAmount} ved`;

    trackXp('WOODCUTTING', Math.ceil(REWARDS.CHOP.xp * (1 + performance)));

    if (Math.random() < GAME_BALANCE.LUCKY_DROP.CHANCE) {
        const bonus = Math.ceil(yieldAmount * 0.5);
        actor.resources.wood += bonus;
        localResult.utbytte.push({ resource: 'wood', amount: bonus, bonus: true });
        localResult.message += ` + ${bonus} FLAKS!`;
    }
    return true;
};

export const handleMiningAction = (ctx: ActionContext) => {
    const { actor, action, localResult, trackXp, damageTool } = ctx;
    const actionType = typeof action === 'string' ? action : action.type;

    getActionSlots(actor, actionType).forEach(slot => {
        damageTool(slot, GAME_BALANCE.DURABILITY.LOSS_WORK);
    });

    const skill = 'MINING';
    const base = actionType === 'MINE' ? GAME_BALANCE.YIELD.MINE_ORE : GAME_BALANCE.YIELD.QUARRY_STONE;
    const resource = actionType === 'MINE' ? 'iron_ore' : 'stone';

    const performance = action.performance || 0.5;
    const yieldAmount = calculateYield(actor, base, skill, { performance, actionType });

    (actor.resources as any)[resource] = ((actor.resources as any)[resource] || 0) + yieldAmount;
    localResult.utbytte.push({ resource, amount: yieldAmount });
    localResult.message = actionType === 'MINE' ? `Utvant ${yieldAmount} jernmalm` : `Hogde ${yieldAmount} stein`;

    trackXp(skill, Math.ceil(REWARDS.WORK.xp * (1 + performance)));
    return true;
};

export const handleForage = (ctx: ActionContext) => {
    const { actor, action, localResult, trackXp, damageTool } = ctx;

    // Optional tool damage
    getActionSlots(actor, 'FORAGE').forEach(slot => {
        damageTool(slot, 1);
    });

    const base = GAME_BALANCE.YIELD.FORAGE_BREAD;
    const performance = action.performance || 0.5;
    const yieldAmount = calculateYield(actor, base, 'FARMING', { performance, actionType: 'FORAGE' });

    if (!actor.resources) (actor as any).resources = {};
    actor.resources.bread = (actor.resources.bread || 0) + yieldAmount;
    localResult.utbytte.push({ resource: 'bread', amount: yieldAmount });
    localResult.message = `Sanket ${yieldAmount} nødproviant (brød/bær)`;

    trackXp('FARMING', Math.ceil(REWARDS.FORAGE.xp * (1 + performance)));
    return true;
};

export const handleHunt = (ctx: ActionContext) => {
    const { actor, action, localResult, trackXp, damageTool } = ctx;

    getActionSlots(actor, 'HUNT').forEach(slot => {
        damageTool(slot, 2);
    });

    const base = 8; // Base meat yield (increased from 5)
    const performance = action.performance || 0.5;
    const yieldAmount = calculateYield(actor, base, 'COMBAT', { performance, actionType: 'HUNT' });

    actor.resources.meat = (actor.resources.meat || 0) + yieldAmount;
    localResult.utbytte.push({ resource: 'meat', amount: yieldAmount });
    localResult.message = `Felte bytte og fikk ${yieldAmount} kjøtt`;

    trackXp('COMBAT', Math.ceil(15 * (1 + performance)));
    return true;
};

export const handleGatherWool = (ctx: ActionContext) => {
    const { actor, action, localResult, trackXp } = ctx;
    const base = 6; // Base wool yield (increased from 3)
    const performance = action.performance || 0.5;
    const yieldAmount = calculateYield(actor, base, 'FARMING', { performance, actionType: 'GATHER_WOOL', requiresTool: true } as any);

    if (yieldAmount === 0) {
        localResult.message = `Du trenger en Saks for å klippe sauene!`;
        return false; // Return false so costs might not be deducted or just to indicate failure
    }

    actor.resources.wool = (actor.resources.wool || 0) + yieldAmount;
    localResult.utbytte.push({ resource: 'wool', amount: yieldAmount });
    localResult.message = `Klippet sauer og fikk ${yieldAmount} ull`;

    trackXp('FARMING', Math.ceil(10 * (1 + performance)));
    return true;
};

export const handleGatherHoney = (ctx: ActionContext) => {
    const { actor, action, localResult, trackXp } = ctx;
    const base = 4; // Base honey yield (increased from 2)
    const performance = action.performance || 0.5;
    const yieldAmount = calculateYield(actor, base, 'FARMING', { performance, actionType: 'GATHER_HONEY' });

    actor.resources.honey = (actor.resources.honey || 0) + yieldAmount;
    localResult.utbytte.push({ resource: 'honey', amount: yieldAmount });
    localResult.message = `Hentet ${yieldAmount} honning fra bikubene`;

    trackXp('FARMING', Math.ceil(12 * (1 + performance)));
    return true;
};
