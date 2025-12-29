import type { ActionRegistry } from './actionTypes';
import { handleWork, handleChop, handleMiningAction, handleForage } from './handlers/GatheringHandlers';
import { handleCraft, handleRefine, handleRepair } from './handlers/CraftingHandlers';
import { handleEquipItem, handleUnequipItem } from './handlers/InventoryHandlers';
import { handleTax, handleDraft, handleDecree, handleContribute, handleUpgradeBuilding, handleUpgrade } from './handlers/ManagementHandlers';
import { handleRaid, handlePatrol } from './handlers/CombatHandlers';
import { handleSleep, handleRest, handlePray, handleChat, handleGamble, handleBuyMeal, handleRetire, handleTradeRoute } from './handlers/SocialRestHandlers';

export const ACTION_REGISTRY: ActionRegistry = {
    // Gathering
    WORK: handleWork,
    CHOP: handleChop,
    MINE: handleMiningAction,
    QUARRY: handleMiningAction,
    FORAGE: handleForage,

    // Crafting
    CRAFT: handleCraft,
    REFINE: handleRefine,
    REPAIR: handleRepair,

    // Inventory
    EQUIP_ITEM: handleEquipItem,
    UNEQUIP_ITEM: handleUnequipItem,

    // Management
    TAX: handleTax,
    DRAFT: handleDraft,
    DECREE: handleDecree,
    CONTRIBUTE_TO_UPGRADE: handleContribute,
    UPGRADE_BUILDING: handleUpgradeBuilding,
    UPGRADE: handleUpgrade,

    // Combat
    RAID: handleRaid,
    PATROL: handlePatrol,

    // Social & Rest
    SLEEP: handleSleep,
    REST: handleRest,
    EAT: handleRest,
    FEAST: handleRest,
    PRAY: handlePray,
    CHAT_LOCAL: handleChat,
    GAMBLE_RESULT: handleGamble,
    BUY_MEAL: handleBuyMeal,
    RETIRE: handleRetire,
    TRADE_ROUTE: handleTradeRoute,

    // Market (minimal for now)
    BUY: (ctx) => { ctx.localResult.message = "Handel gjennomført"; return true; },
    SELL: (ctx) => { ctx.localResult.message = "Handel gjennomført"; return true; },
};
