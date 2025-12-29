import type { ActionContext } from '../actionTypes';

export const handleSleep = (ctx: ActionContext) => {
    const { actor, localResult } = ctx;
    const staminaGain = 60;
    actor.status.stamina = Math.min(100, (actor.status.stamina || 0) + staminaGain);
    actor.status.hp = Math.min(100, (actor.status.hp || 100) + 10);
    localResult.message = "Sov godt og fikk tilbake krefter.";
    localResult.yields.push({ resource: 'stamina', amount: staminaGain });
    return true;
};

export const handleRest = (ctx: ActionContext) => {
    const { actor, action, localResult } = ctx;
    const actionType = typeof action === 'string' ? action : action.type;

    let stam = 30;
    let hp = 0;
    let msg = "Hvilte.";

    if (actionType === 'EAT') { stam = 40; msg = "Spiste et måltid."; }
    if (actionType === 'FEAST') { stam = 100; hp = 20; msg = "Holdt gjestebud!"; }

    if (actor.upgrades?.includes('roof')) stam += 20;

    actor.status.stamina = Math.min(100, (actor.status.stamina || 0) + stam);
    if (hp > 0) actor.status.hp = Math.min(100, (actor.status.hp || 100) + hp);

    localResult.yields.push({ resource: 'stamina', amount: stam });
    localResult.message = msg;
    return true;
};

export const handlePray = (ctx: ActionContext) => {
    const { actor, localResult, trackXp } = ctx;
    const favor = Math.floor(Math.random() * 5) + 1;
    actor.resources.favor = (actor.resources.favor || 0) + favor;
    localResult.yields.push({ resource: 'favor', amount: favor });
    trackXp('THEOLOGY', 10);
    localResult.message = `Ba til gudene. (+${favor} velvilje)`;
    return true;
};

export const handleChat = (ctx: ActionContext) => {
    const { localResult } = ctx;
    const gossip = [
        "Baronen ser nervøs ut i dag.",
        "Hørte du ulvene i natt?",
        "Prisen på korn går opp.",
        "Kongens soldater er på vei."
    ];
    localResult.message = `Sladder: "${gossip[Math.floor(Math.random() * gossip.length)]}"`;
    return true;
};

export const handleGamble = (ctx: ActionContext) => {
    const { actor, action, localResult } = ctx;
    const { amount, isWin, playerRoll, houseRoll } = action;
    if (isWin) {
        actor.resources.gold = (actor.resources.gold || 0) + amount;
        localResult.yields.push({ resource: 'gold', amount });
        localResult.message = `Vant ${amount}g på terninger! (${playerRoll} mot ${houseRoll})`;
    } else {
        actor.resources.gold = Math.max(0, (actor.resources.gold || 0) - amount);
        localResult.message = `Tapte ${amount}g på terninger. (${playerRoll} mot ${houseRoll})`;
    }
    return true;
};

export const handleBuyMeal = (ctx: ActionContext) => {
    const { actor, localResult } = ctx;
    const cost = 5;
    if ((actor.resources.gold || 0) >= cost) {
        actor.resources.gold -= cost;
        const staminaGain = 10;
        actor.status.stamina = Math.min(100, (actor.status.stamina || 0) + staminaGain);
        localResult.yields.push({ resource: 'stamina', amount: staminaGain });
        localResult.message = "Kjøpte et måltid i baren. (+10 Stamina)";
    } else {
        localResult.success = false;
        localResult.message = "Har ikke råd til mat (koster 5g).";
        return false;
    }
    return true;
};

export const handleRetire = (ctx: ActionContext) => {
    const { actor, localResult } = ctx;
    if (actor.role !== 'PEASANT') {
        actor.role = 'PEASANT';
        actor.status.authority = 0;
        localResult.message = "Har pensjonert seg og blitt bonde.";
    }
    return true;
};

export const handleTradeRoute = (ctx: ActionContext) => {
    const { action, localResult, trackXp } = ctx;
    const { resource, action: direction } = action;
    localResult.message = `Handelsrute ${direction} ${resource} utført.`;
    trackXp('TRADING', 20);
    return true;
};
