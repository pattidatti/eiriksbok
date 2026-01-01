import { GAME_BALANCE, VILLAGE_BUILDINGS, UPGRADES_LIST, INITIAL_RESOURCES } from '../../constants';
import type { ActionContext } from '../actionTypes';
import type { Resources } from '../../simulationTypes';

export const handleTax = (ctx: ActionContext) => {
    const { actor, room, localResult } = ctx;
    if (actor.role !== 'BARON' && actor.role !== 'KING') {
        localResult.success = false;
        return false;
    }

    let taxTotal = 0;
    let taxGrain = 0;

    Object.values(room.players).forEach((p: any) => {
        if (p.role === 'PEASANT' && p.id !== actor.id) {
            const goldTax = Math.floor((p.resources.gold || 0) * GAME_BALANCE.TAX.PEASANT_RATE_DEFAULT);
            const grainTax = Math.floor((p.resources.grain || 0) * GAME_BALANCE.TAX.PEASANT_RATE_DEFAULT);

            if (goldTax > 0) {
                p.resources.gold -= goldTax;
                taxTotal += goldTax;
            }
            if (grainTax > 0) {
                p.resources.grain -= grainTax;
                taxGrain += grainTax;
            }
        }
    });

    actor.resources.gold = (actor.resources.gold || 0) + taxTotal;
    actor.resources.grain = (actor.resources.grain || 0) + taxGrain;

    if (taxTotal > 0 || taxGrain > 0) {
        localResult.utbytte.push({ resource: 'gold', amount: taxTotal });
        localResult.utbytte.push({ resource: 'grain', amount: taxGrain });
        localResult.message = `Krevde inn skatt: ${taxTotal}g og ${taxGrain} korn fra bøndene.`;
    } else {
        localResult.message = "Ingen skatt å kreve inn (bøndene er blakke).";
    }

    actor.status.legitimacy = Math.max(0, (actor.status.legitimacy || 100) - 5);
    return true;
};

export const handleDraft = (ctx: ActionContext) => {
    const { actor, localResult } = ctx;
    if (actor.role !== 'BARON' && actor.role !== 'KING') {
        localResult.success = false;
        return false;
    }

    const costGold = 5;
    const costGrain = 10;
    if ((actor.resources.gold || 0) >= costGold && (actor.resources.grain || 0) >= costGrain) {
        actor.resources.gold -= costGold;
        actor.resources.grain -= costGrain;
        actor.resources.manpower = (actor.resources.manpower || 0) + 10;
        localResult.utbytte.push({ resource: 'manpower', amount: 10 });
        localResult.message = `Mobiliserte tropper (+10 Manpower).`;
    } else {
        localResult.success = false;
        localResult.message = "Mangler ressurser for å mobilisere.";
        return false;
    }
    return true;
};

export const handleDecree = (ctx: ActionContext) => {
    const { actor, room, localResult } = ctx;
    if (actor.role !== 'KING') return false;
    localResult.message = "UTSTEDTE KONGELIG DEKRET: Ekstraskatt!";
    let taxTotal = 0;
    Object.values(room.players).forEach((p: any) => {
        if (p.role === 'BARON') {
            const tax = 20;
            if (p.resources.gold >= tax) {
                p.resources.gold -= tax;
                taxTotal += tax;
            }
        }
    });
    actor.resources.gold = (actor.resources.gold || 0) + taxTotal;
    localResult.utbytte.push({ resource: 'gold', amount: taxTotal });
    return true;
};

export const handleContribute = (ctx: ActionContext) => {
    const { actor, room, action, localResult } = ctx;
    const { buildingId, resource, amount } = action;
    const buildingDef = VILLAGE_BUILDINGS[buildingId];
    if (!buildingDef) {
        localResult.success = false;
        localResult.message = `Fant ikke bygning med ID: ${buildingId}`;
        return false;
    }

    const isPrivate = buildingId === 'farm_house';
    let buildingState: { level: number; progress: Partial<Resources>; contributions?: any };

    if (isPrivate) {
        if (!actor.buildings) actor.buildings = {};
        if (!actor.buildings[buildingId]) actor.buildings[buildingId] = { level: 1, progress: {} };
        buildingState = actor.buildings[buildingId];
    } else {
        // Ensure World Structure
        if (!room.world) room.world = { season: 'Spring', weather: 'Clear', year: 1066, gameTick: 0, lastTickAt: Date.now(), taxRateDetails: { kingTax: 0.1 }, settlement: { buildings: {} } };
        if (!room.world.settlement) room.world.settlement = { buildings: {} };
        if (!room.world.settlement.buildings) room.world.settlement.buildings = {};

        if (!room.world.settlement.buildings[buildingId]) {
            room.world.settlement.buildings[buildingId] = { id: buildingId, level: 1, progress: {}, contributions: {} };
        }
        buildingState = room.world.settlement.buildings[buildingId] as any;
    }

    if (!buildingState.progress) buildingState.progress = {};
    if (!actor.resources) actor.resources = JSON.parse(JSON.stringify(INITIAL_RESOURCES.PEASANT));
    if (!buildingState.level || buildingState.level < 1) buildingState.level = 1;

    const nextLevel = buildingState.level + 1;
    const nextLevelDef = buildingDef.levels[nextLevel];
    if (!nextLevelDef) {
        localResult.success = false;
        localResult.message = "Maksimalt nivå nådd.";
        return false;
    }

    const requirements = nextLevelDef.requirements || {};
    const reqAmount = (requirements as any)[resource] || 0;
    const currentProg = (buildingState.progress as any)[resource] || 0;
    const needed = reqAmount - currentProg;

    if (needed <= 0) {
        localResult.success = false;
        localResult.message = "Ressurskravet er allerede oppfylt.";
        return false;
    }

    const playerHas = (actor.resources as any)[resource] || 0;
    const giveAmount = Math.min(amount, needed, playerHas);

    if (giveAmount <= 0) {
        localResult.success = false;
        localResult.message = `Kan ikke bidra 0 (Har: ${playerHas}, Trenger: ${needed}, Bud: ${amount})`;
        return false;
    }

    // SAFE SUBTRACTION
    (actor.resources as any)[resource] = playerHas - giveAmount;
    (buildingState.progress as any)[resource] = currentProg + giveAmount;

    if (!isPrivate) {
        if (!buildingState.contributions) buildingState.contributions = {};
        if (!buildingState.contributions[actor.id]) {
            buildingState.contributions[actor.id] = { name: actor.name, resources: {} };
        }
        const pCont = buildingState.contributions[actor.id].resources;
        pCont[resource] = (pCont[resource] || 0) + giveAmount;
    }

    localResult.message = `Bidro med ${giveAmount} ${resource} til ${buildingDef.name}.`;
    localResult.utbytte.push({ resource, amount: -giveAmount });

    let finished = true;
    Object.entries(nextLevelDef.requirements).forEach(([res, amt]) => {
        if (((buildingState.progress as any)[res] || 0) < (amt as number)) finished = false;
    });

    if (finished) {
        buildingState.level = nextLevel;
        buildingState.progress = {};
        if (!isPrivate) buildingState.contributions = {};
        localResult.message += ` ⚒️ NYTT NIVÅ: ${buildingDef.name} nådde Nivå ${nextLevel}!`;
    }
    return true;
};

export const handleUpgradeBuilding = (ctx: ActionContext) => {
    const { actor, room, action, localResult } = ctx;
    const actionType = typeof action === 'string' ? action : action.type;
    const bId = action.buildingId || actionType.replace('UPGRADE_BUILDING_', '');
    const buildingDef = VILLAGE_BUILDINGS[bId];

    if (buildingDef) {
        if (!room.world.settlement) room.world.settlement = { buildings: {} };
        const currentLevel = room.world.settlement.buildings[bId]?.level || 1;
        const nextLevel = currentLevel + 1;
        const nextLevelDef = buildingDef.levels[nextLevel];

        if (nextLevelDef) {
            let canAfford = true;
            Object.entries(nextLevelDef.requirements || {}).forEach(([res, amt]) => {
                if (((actor.resources as any)[res] || 0) < (amt as number)) canAfford = false;
            });

            if (canAfford) {
                Object.entries(nextLevelDef.requirements || {}).forEach(([res, amt]) => {
                    (actor.resources as any)[res] -= (amt as number);
                });
                if (!room.world.settlement.buildings[bId]) {
                    room.world.settlement.buildings[bId] = { id: bId, level: 1, progress: {}, contributions: {} };
                }
                room.world.settlement.buildings[bId].level = nextLevel;
                localResult.message = `Oppgraderte ${buildingDef.name} til Nivå ${nextLevel}!`;
            } else {
                localResult.success = false;
                localResult.message = "Mangler ressurser for oppgradering.";
                return false;
            }
        }
    }
    return true;
};

export const handleUpgrade = (ctx: ActionContext) => {
    const { actor, action, localResult } = ctx;
    const upgradeId = action.upgradeId;
    const currRole = actor.role as keyof typeof UPGRADES_LIST;
    const upgradeList = UPGRADES_LIST[currRole];

    if (upgradeList) {
        const upgrade = upgradeList.find(u => u.id === upgradeId);
        if (upgrade && !actor.upgrades?.includes(upgradeId)) {
            let canAfford = true;
            Object.entries(upgrade.cost).forEach(([res, amt]) => {
                if ((actor.resources as any)[res] < (amt as number)) canAfford = false;
            });

            if (canAfford) {
                Object.entries(upgrade.cost).forEach(([res, amt]) => {
                    (actor.resources as any)[res] -= (amt as number);
                });
                if (!actor.upgrades) actor.upgrades = [];
                actor.upgrades.push(upgradeId);
                localResult.message = `Oppgradering fullført: ${upgrade.name}`;
            } else {
                localResult.success = false;
                localResult.message = "Har ikke råd til oppgradering.";
                return false;
            }
        }
    }
    return true;
};
