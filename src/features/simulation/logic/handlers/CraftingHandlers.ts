import { CRAFTING_RECIPES, ITEM_TEMPLATES, REFINERY_RECIPES, RESOURCE_DETAILS, GAME_BALANCE } from '../../constants';
import { calculateYield } from '../../utils/simulationUtils';
import type { ActionContext } from '../actionTypes';
import type { EquipmentItem } from '../../simulationTypes';

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
                localResult.yields.push({ resource: recipe.outputItemId, amount: 1 });
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
        if (legacySubType === 'SWORDS' || legacySubType === 'TOOLS') base = 5;
        if (legacySubType === 'ARMOR') base = 2;

        const yieldAmount = calculateYield(actor, base, 'CRAFTING', { performance });

        let resName = 'swords';
        if (legacySubType === 'ARMOR') resName = 'armor';
        if (legacySubType === 'TOOLS') resName = 'tools';

        (actor.resources as any)[resName] = ((actor.resources as any)[resName] || 0) + yieldAmount;
        localResult.yields.push({ resource: resName, amount: yieldAmount });
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

            (actor.resources as any)[recipe.outputResource] = ((actor.resources[recipe.outputResource as keyof typeof actor.resources] || 0) + yieldAmount);

            const outputName = (RESOURCE_DETAILS as any)[recipe.outputResource]?.label || recipe.outputResource;
            localResult.yields.push({ resource: recipe.outputResource, amount: yieldAmount });
            localResult.message = `Produserte ${yieldAmount} ${outputName}`;
            trackXp('CRAFTING', GAME_BALANCE.SKILLS.REFINING_XP);
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
    const target = action.target || 'MAIN_HAND';

    if (actor.equipment && actor.equipment[target as keyof typeof actor.equipment]) {
        const item = actor.equipment[target as keyof typeof actor.equipment] as EquipmentItem;
        if (item) {
            const costGold = 5;
            const costIron = 10;
            if ((actor.resources.gold || 0) >= costGold && ((actor.resources.iron_ingot || 0) >= costIron || (actor.resources.iron || 0) >= costIron)) {
                actor.resources.gold -= costGold;
                if ((actor.resources.iron_ingot || 0) >= costIron) actor.resources.iron_ingot -= costIron;
                else actor.resources.iron -= costIron;

                const repairAmount = GAME_BALANCE.DURABILITY.REPAIR_AMOUNT || 50;
                item.durability = Math.min(item.maxDurability, item.durability + repairAmount);
                localResult.durability.push({ slot: target, item: item.name, amount: -repairAmount });
                localResult.message = `Reparerte ${item.name} for ${costGold}g og ${costIron} jern.`;
            } else {
                localResult.success = false;
                localResult.message = `Mangler gull (${costGold}) eller jern (${costIron}) for å reparere.`;
                return false;
            }
        }
    }
    return true;
};
