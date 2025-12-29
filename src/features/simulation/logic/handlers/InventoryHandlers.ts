import type { ActionContext } from '../actionTypes';
import type { EquipmentSlot } from '../../simulationTypes';

export const handleEquipItem = (ctx: ActionContext) => {
    const { actor, action, localResult } = ctx;
    const { itemId, slot } = action;
    const invIndex = actor.inventory?.findIndex((i: any) => i.id === itemId);

    if (invIndex !== undefined && invIndex !== -1 && actor.inventory) {
        const itemToEquip = actor.inventory[invIndex];
        const currentEquipped = actor.equipment[slot as EquipmentSlot];

        // Remove from inventory
        actor.inventory.splice(invIndex, 1);

        // Equip
        actor.equipment[slot as EquipmentSlot] = itemToEquip;

        // Put old back in inventory
        if (currentEquipped) {
            actor.inventory.push(currentEquipped);
        }

        localResult.message = `Utstyrte ${itemToEquip.name}`;
    }
    return true;
};

export const handleUnequipItem = (ctx: ActionContext) => {
    const { actor, action, localResult } = ctx;
    const { slot } = action;
    const item = actor.equipment[slot as EquipmentSlot];
    if (item) {
        actor.equipment[slot as EquipmentSlot] = null as any;
        if (!actor.inventory) actor.inventory = [];
        actor.inventory.push(item);
        localResult.message = `Tok av ${item.name}`;
    }
    return true;
};
