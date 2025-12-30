import type { ActionRegistry } from './actionTypes';
import { handleWork, handleChop, handleMiningAction, handleForage } from './handlers/GatheringHandlers';
import { handleCraft, handleRefine, handleRepair } from './handlers/CraftingHandlers';
import { handleEquipItem, handleUnequipItem } from './handlers/InventoryHandlers';
import { handleTax, handleDraft, handleDecree, handleContribute, handleUpgradeBuilding, handleUpgrade } from './handlers/ManagementHandlers';
import { handleRaid, handlePatrol } from './handlers/CombatHandlers';
import { handleBuy, handleSell, handleTradeRoute } from './handlers/MarketHandlers';
import { handleSleep, handleRest, handlePray, handleChat, handleGamble, handleBuyMeal, handleRetire } from './handlers/SocialRestHandlers';

export const ACTION_REGISTRY: ActionRegistry = {
    // Gathering
    WORK: handleWork,
    CHOP: handleChop,
    MINE: handleMiningAction,
    QUARRY: handleMiningAction,
    FORAGE: handleForage,

    // Crafting & Refining
    CRAFT: handleCraft,
    REFINE: handleRefine,
    BAKE: handleRefine,
    MILL: handleRefine,
    SMELT: handleRefine,
    WEAVE: handleRefine,
    MIX: handleRefine,
    REPAIR: handleRepair,

    // Inventory
    EQUIP_ITEM: handleEquipItem,
    UNEQUIP_ITEM: handleUnequipItem,

    // Management
    TAX: handleTax,
    DRAFT: handleDraft,
    DECREE: handleDecree,
    CONSTRUCT: handleContribute,
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

    // Market
    BUY: handleBuy,
    SELL: handleSell
};
