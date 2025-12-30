import { CRAFTING_RECIPES, ITEM_TEMPLATES, REFINERY_RECIPES, RESOURCE_DETAILS, GAME_BALANCE, REPAIR_CONFIG } from '../../constants';
import { calculateYield } from '../../utils/simulationUtils';
import type { ActionContext } from '../actionTypes';
import type { EquipmentItem, EquipmentSlot } from '../../simulationTypes';

export const handleCraft = (ctx: ActionContext) => {
    const { actor, room, action, localResult, trackXp } = ctx;
    const subType = action.subType;
    const recipe = CRAFTING_RECIPES[subType];

    if (recipe) {
        // Check building level
        const buildLevel = room.world?.settlement?.buildings?.[recipe.buildingId]?.level || 1;

        if (buildLevel < recipe.level) {
            localResult.success = false;
            localResult.message = `Mangler bygningsnivå ${recipe.level} for å lage dette.`;
            return false;
        }

        // Check resources (Double check in case frontend missed it)
        let canAfford = true;
        Object.entries(recipe.input).forEach(([res, amt]) => {
            if ((actor.resources as any)[res] < (amt as number)) canAfford = false;
        });

        if (canAfford) {
            // Consume
            Object.entries(recipe.input).forEach(([res, amt]) => {
                (actor.resources as any)[res] -= (amt as number);
            });

            // Create Item
            const template = ITEM_TEMPLATES[recipe.outputItemId];
            if (template) {
                const newItem: EquipmentItem = {
                    ...template,
                    id: `${template.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
                };
                if (!actor.inventory) actor.inventory = [];
                actor.inventory.push(newItem);
                localResult.utbytte.push({ resource: recipe.outputItemId, amount: 1 });
                localResult.message = `Smidde ${newItem.name}!`;
                trackXp('CRAFTING', 25 * recipe.level);
            }
        } else {
            localResult.success = false;
            localResult.message = "Mangler ressurser for å smi.";
            return false;
        }
    } else {
        // Legacy stackable crafting fallback
        const legacySubType = action.subType || 'SWORDS';
        const performance = action.performance || 0.5;
        let base = 1;
        if (legacySubType === 'SWORDS') base = 5;
        if (legacySubType === 'ARMOR') base = 2;

        const yieldAmount = calculateYield(actor, base, 'CRAFTING', { performance });

        let resName = 'swords';
        if (legacySubType === 'ARMOR') resName = 'armor';

        (actor.resources as any)[resName] = ((actor.resources as any)[resName] || 0) + yieldAmount;
        localResult.utbytte.push({ resource: resName, amount: yieldAmount });
        localResult.message = `Smidde ${yieldAmount} ${resName}`;
        trackXp('CRAFTING', Math.ceil(15 * (1 + performance)));
    }
    return true;
};

export const handleRefine = (ctx: ActionContext) => {
    const { actor, room, action, localResult, trackXp } = ctx;
    const recipeId = action.recipeId;
    const recipe = (REFINERY_RECIPES as any)[recipeId];

    if (recipe) {
        const buildLevel = room.world?.settlement?.buildings?.[recipe.buildingId]?.level || 1;

        if (recipe.requiredLevel && buildLevel < recipe.requiredLevel) {
            localResult.success = false;
            localResult.message = `Utvidelse kreves: ${recipe.buildingId} må være Nivå ${recipe.requiredLevel}.`;
            return false;
        }

        let canAfford = true;
        Object.entries(recipe.input).forEach(([res, amt]) => {
            if ((actor.resources as any)[res] < (amt as number)) canAfford = false;
        });

        if (canAfford) {
            Object.entries(recipe.input).forEach(([res, amt]) => {
                (actor.resources as any)[res] -= (amt as number);
            });

            const performance = action.performance || 0.5;
            const baseOutput = recipe.output?.amount || recipe.outputAmount || 1;

            const yieldAmount = calculateYield(actor, baseOutput, 'CRAFTING', {
                performance,
                isRefining: true
            });

            const currentAmount = (actor.resources as any)[recipe.outputResource] || 0;
            (actor.resources as any)[recipe.outputResource] = currentAmount + yieldAmount;

            const outputName = (RESOURCE_DETAILS as any)[recipe.outputResource]?.label || recipe.outputResource;
            localResult.utbytte.push({ resource: recipe.outputResource, amount: yieldAmount });
            localResult.message = `Produserte ${yieldAmount} ${outputName}`;
            trackXp('CRAFTING', GAME_BALANCE.SKILLS.REFINING_XP || 10);
        } else {
            localResult.success = false;
            localResult.message = "Mangler ressurser til raffinering.";
            return false;
        }
    }
    return true;
};

export const handleRepair = (ctx: ActionContext) => {
    const { actor, action, localResult } = ctx;
    const targetSlot = action.targetSlot as EquipmentSlot;
    const buildingId = action.buildingId;

    if (!buildingId || !REPAIR_CONFIG[buildingId]) {
        localResult.success = false;
        localResult.message = "Ugyldig reparasjonsstasjon.";
        return false;
    }

    const config = REPAIR_CONFIG[buildingId];
    if (!config.slots.includes(targetSlot)) {
        localResult.success = false;
        localResult.message = `Denne stasjonen kan ikke reparere ${targetSlot}.`;
        return false;
    }

    const item = actor.equipment[targetSlot];
    if (!item) {
        localResult.success = false;
        localResult.message = "Ingen gjenstand i dette sporet.";
        return false;
    }

    if (item.durability >= item.maxDurability) {
        localResult.success = false;
        localResult.message = `${item.name} er allerede i perfekt stand.`;
        return false;
    }

    const costGold = config.goldCost;
    const costAmt = 1; // 1 unit of material per repair action
    const material = config.material;

    const hasGold = (actor.resources.gold || 0) >= costGold;
    const hasMaterial = ((actor.resources as any)[material] || 0) >= costAmt;

    if (hasGold && hasMaterial) {
        actor.resources.gold -= costGold;
        (actor.resources as any)[material] -= costAmt;

        const repairAmount = GAME_BALANCE.DURABILITY.REPAIR_AMOUNT || 30;
        const oldDurability = item.durability;
        item.durability = Math.min(item.maxDurability, item.durability + repairAmount);
        const actualRepair = item.durability - oldDurability;

        localResult.durability.push({
            slot: targetSlot,
            item: item.name,
            amount: actualRepair
        });
        localResult.message = `Reparerte ${item.name} (+${actualRepair} holdbarhet).`;
    } else {
        localResult.success = false;
        const matName = (RESOURCE_DETAILS as any)[material]?.label || material;
        localResult.message = `Mangler ${!hasGold ? `${costGold} gull` : ''}${!hasGold && !hasMaterial ? ' og ' : ''}${!hasMaterial ? `${costAmt} ${matName}` : ''}.`;
        return false;
    }

    return true;
};

