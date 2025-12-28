import { ref, runTransaction } from 'firebase/database';
import { db } from '../../lib/firebase';
import { ACTION_COSTS, UPGRADES_LIST, REWARDS, SEASONS, WEATHER, GAME_BALANCE, REFINERY_RECIPES, INITIAL_SKILLS, CRAFTING_RECIPES, ITEM_TEMPLATES, LEVEL_XP, VILLAGE_BUILDINGS } from './constants';


import type { SkillType, SimulationPlayer, EquipmentItem, EquipmentSlot } from './simulationTypes';


/* --- HELPERS --- */
const calculateYield = (
    actor: SimulationPlayer,
    baseYield: number,
    skillType: SkillType,
    modifiers: { season?: number, weather?: number, law?: number, performance?: number, upgrades?: number } = {}
) => {
    // 1. Base
    let total = baseYield;

    // 2. Skill Bonus (+10% per level)
    const skill = actor.skills?.[skillType] || { level: 0 };
    const skillMultiplier = 1 + (skill.level * 0.1);
    total *= skillMultiplier;

    // 3. Equipment Bonus (Flat + Yield)
    let equipBonus = 0;
    if (actor.equipment) {
        Object.values(actor.equipment).forEach(item => {
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

const addXp = (actor: SimulationPlayer, skillType: SkillType, amount: number, messages: string[]) => {
    // Ensure skills exist
    if (!actor.skills) actor.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS[actor.role as keyof typeof INITIAL_SKILLS] || INITIAL_SKILLS.PEASANT));

    const skill = actor.skills[skillType];
    if (!skill) return;

    // 1. Skill XP
    skill.xp += amount;
    if (skill.xp >= skill.maxXp) {
        skill.level += 1;
        skill.xp -= skill.maxXp;
        skill.maxXp = Math.floor(skill.maxXp * 1.5);
        messages.push(`⭐ ${actor.name} ble bedre i ${skillType}! (Nivå ${skill.level})`);
    }

    // 2. Character XP (Rank)
    actor.stats.xp = (actor.stats.xp || 0) + amount;

    // character level calculation (matches frontend)
    const getLevel = (xp: number) => {
        const index = LEVEL_XP.findIndex(req => xp < req);
        return index === -1 ? LEVEL_XP.length : index;
    };

    const newLevel = getLevel(actor.stats.xp);
    if (newLevel > (actor.stats.level || 1)) {
        actor.stats.level = newLevel;
        messages.push(`🏰 ${actor.name} har steget i rang til Nivå ${newLevel}!`);
    }
};






export const performAction = async (pin: string, playerId: string, action: any): Promise<{ success: boolean, data?: { success: boolean, timestamp: number, message: string, yields: any[], xp: any[], durability: any[] }, error?: any }> => {
    const roomRef = ref(db, `simulation_rooms/${pin}`);
    let result: { success: boolean, timestamp: number, message: string, yields: any[], xp: any[], durability: any[] } | null = null;

    try {
        await runTransaction(roomRef, (room: any) => {
            if (!room || !room.players || !room.players[playerId]) return;

            const actor = room.players[playerId];
            if (!actor.equipment) actor.equipment = { HEAD: null, BODY: null, MAIN_HAND: null, OFF_HAND: null, FEET: null, TRINKET: null };

            if (!room.messages) room.messages = [];
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Initialize Local Result
            const localResult = {
                success: true,
                timestamp: Date.now(),
                message: "",
                yields: [] as any[],
                xp: [] as any[],
                durability: [] as any[]
            };

            // Wrapped addXp to capture result
            const trackXp = (skill: SkillType, amount: number) => {
                const preLevel = actor.skills[skill]?.level || 0;
                addXp(actor, skill, amount, room.messages);
                const postLevel = actor.skills[skill]?.level || 0;
                localResult.xp.push({
                    skill,
                    amount,
                    levelUp: postLevel > preLevel
                });
            };

            // Wrapped helper to track durability loss
            const damageTool = (slot: 'MAIN_HAND' | 'OFF_HAND' | 'HEAD' | 'BODY' | 'FEET', amount: number) => {
                if (actor.equipment?.[slot]) {
                    actor.equipment[slot].durability = Math.max(0, actor.equipment[slot].durability - amount);
                    localResult.durability.push({
                        slot,
                        item: actor.equipment[slot].name || 'Item',
                        amount,
                        broken: actor.equipment[slot].durability <= 0
                    });
                    if (actor.equipment[slot].durability <= 0) {
                        localResult.message = `❌ ${actor.equipment[slot].name} ble ødelagt!`;
                        localResult.success = false;
                    }
                }
            };

            // 0. Passive Income & Regeneration (Legacy, keep silent for now or separate?)
            const now = Date.now();
            const elapsedMs = now - (actor.lastActive || now);
            const elapsedMinutes = Math.min(60, elapsedMs / 60000);

            if (elapsedMinutes > 0.1) {
                let passiveGold = 0;
                if (actor.upgrades?.includes('cow')) passiveGold += elapsedMinutes * 2;
                if (actor.upgrades?.includes('accounting_books')) passiveGold += elapsedMinutes * 5;
                if (actor.upgrades?.includes('caravan')) passiveGold += elapsedMinutes * 10;
                if (passiveGold > 0) {
                    actor.resources.gold = (actor.resources.gold || 0) + Math.floor(passiveGold);
                    // Can't show passive in active result overlay easily, skip for now
                }
                const staminaRegen = elapsedMinutes * 2;
                actor.status.stamina = Math.min(100, (actor.status.stamina || 0) + staminaRegen);
            }

            const actionType = typeof action === 'string' ? action : action.type;
            const currentSeason = room.world?.season || 'Spring';
            const seasonData = (SEASONS as any)[currentSeason];
            const currentWeather = room.world?.weather || 'Clear';
            const weatherData = (WEATHER as any)[currentWeather];
            const activeLaws = room.world?.activeLaws || [];

            // 0. Law Checks
            if (actionType === 'RAID' && activeLaws.includes('peace')) {
                localResult.success = false;
                localResult.message = `🕊️ RAID BLOKKERT: Fredsavtalen gjelder!`;
                // Commit result and return
                result = localResult;
                room.messages.push(`[${timestamp}] ${localResult.message}`);
                return room;
            }

            // 1. Handle Costs
            const cost = (ACTION_COSTS as any)[actionType];
            if (cost) {
                const baseStaminaMod = seasonData?.staminaMod || 1.0;
                const weatherStaminaMod = weatherData?.staminaMod || 1.0;
                const finalStaminaCost = Math.ceil((cost.stamina || 0) * baseStaminaMod * weatherStaminaMod);

                for (const [res, amt] of Object.entries(cost)) {
                    if (res === 'stamina') continue;
                    if ((actor.resources[res as keyof typeof actor.resources] || 0) < (amt as number)) {
                        localResult.success = false;
                        localResult.message = `❌ Mangler ${amt} ${res}!`;
                        result = localResult;
                        return room;
                    }
                }
                if ((actor.status.stamina || 0) < finalStaminaCost) {
                    localResult.success = false;
                    localResult.message = `💤 For sliten! (${finalStaminaCost}⚡ kreves)`;
                    result = localResult;
                    return room;
                }

                for (const [res, amt] of Object.entries(cost)) {
                    if (res === 'stamina') continue;
                    (actor.resources as any)[res] -= (amt as number);
                }
                actor.status.stamina -= finalStaminaCost;
            }

            // Ensure equipment exists
            if (!actor.equipment) {
                actor.equipment = {
                    HEAD: null, BODY: { id: 'tunic', name: 'Slitt Tunika', durability: 20, maxDurability: 20, level: 1, stats: { defense: 1 } },
                    MAIN_HAND: null, OFF_HAND: null, FEET: null, TRINKET: null
                };
            }

            // 2. Perform Action Logic
            if (actionType === 'WORK') {
                if (!actor.skills) actor.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS[actor.role as keyof typeof INITIAL_SKILLS] || INITIAL_SKILLS.PEASANT));

                damageTool('MAIN_HAND', GAME_BALANCE.DURABILITY.LOSS_WORK);
                if (localResult.success === false) { result = localResult; return room; } // Tool broke

                // Modifiers
                let lawYMod = 1.0;
                if (activeLaws.includes('conscription')) lawYMod = 0.8;
                const base = GAME_BALANCE.YIELD.WORK_GRAIN + (actor.upgrades?.includes('iron_plow') ? 5 : 0);

                const performance = action.performance || 0.5;
                const yieldAmount = calculateYield(actor, base, 'FARMING', {
                    season: seasonData?.yieldMod || 1.0,
                    weather: weatherData?.yieldMod || 1.0,
                    law: lawYMod,
                    performance
                });

                actor.resources.grain = (actor.resources.grain || 0) + yieldAmount;
                localResult.yields.push({ resource: 'grain', amount: yieldAmount });
                localResult.message = `Høstet ${yieldAmount} korn`;

                trackXp('FARMING', Math.ceil(REWARDS.WORK.xp * (1 + performance)));

                // Lucky Drop
                if (Math.random() < (GAME_BALANCE.LUCKY_DROP.CHANCE + (actor.equipment?.HEAD?.stats?.luckBonus || 0))) {
                    const bonus = Math.ceil(yieldAmount * 0.5);
                    actor.resources.grain += bonus;
                    localResult.yields.push({ resource: 'grain', amount: bonus, bonus: true });
                    localResult.message += ` + ${bonus} (FLAKS!)`;
                }

            } else if (actionType === 'CHOP') {
                if (!actor.skills) actor.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS[actor.role as keyof typeof INITIAL_SKILLS] || INITIAL_SKILLS.PEASANT));

                damageTool('MAIN_HAND', GAME_BALANCE.DURABILITY.LOSS_WORK);
                if (localResult.success === false) { result = localResult; return room; }

                let base = GAME_BALANCE.YIELD.CHOP_WOOD;
                if (currentSeason === 'Summer') base += GAME_BALANCE.YIELD.SUMMER_WOOD_BONUS;

                const performance = action.performance || 0.5;
                const yieldAmount = calculateYield(actor, base, 'WOODCUTTING', { performance });

                actor.resources.wood = (actor.resources.wood || 0) + yieldAmount;
                localResult.yields.push({ resource: 'wood', amount: yieldAmount });
                localResult.message = `Felte ${yieldAmount} ved`;

                trackXp('WOODCUTTING', Math.ceil(REWARDS.CHOP.xp * (1 + performance)));

                if (Math.random() < GAME_BALANCE.LUCKY_DROP.CHANCE) {
                    const bonus = Math.ceil(yieldAmount * 0.5);
                    actor.resources.wood += bonus;
                    localResult.yields.push({ resource: 'wood', amount: bonus, bonus: true });
                    localResult.message += ` + ${bonus} FLAKS!`;
                }

            } else if (actionType === 'MINE' || actionType === 'QUARRY') {
                if (!actor.skills) actor.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS[actor.role as keyof typeof INITIAL_SKILLS] || INITIAL_SKILLS.PEASANT));
                damageTool('MAIN_HAND', GAME_BALANCE.DURABILITY.LOSS_WORK);
                if (localResult.success === false) { result = localResult; return room; }

                const skill = actionType === 'MINE' ? 'MINING' : 'MINING'; // Both use mining skill for now
                const base = actionType === 'MINE' ? GAME_BALANCE.YIELD.MINE_ORE : GAME_BALANCE.YIELD.QUARRY_STONE;
                const resource = actionType === 'MINE' ? 'iron_ore' : 'stone';

                const performance = action.performance || 0.5;
                const yieldAmount = calculateYield(actor, base, skill, { performance });

                (actor.resources as any)[resource] = ((actor.resources as any)[resource] || 0) + yieldAmount;
                localResult.yields.push({ resource, amount: yieldAmount });
                localResult.message = actionType === 'MINE' ? `Utvant ${yieldAmount} jernmalm` : `Hogde ${yieldAmount} stein`;

                trackXp(skill, Math.ceil(REWARDS.WORK.xp * (1 + performance)));

            } else if (actionType === 'FORAGE') {
                if (!actor.skills) actor.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS[actor.role as keyof typeof INITIAL_SKILLS] || INITIAL_SKILLS.PEASANT));

                // Foraging is easier, maybe less durability loss or none? Let's say 2.
                damageTool('MAIN_HAND', 2);
                if (localResult.success === false) { result = localResult; return room; }

                const base = GAME_BALANCE.YIELD.FORAGE_BREAD;
                const performance = action.performance || 0.5;
                const yieldAmount = calculateYield(actor, base, 'FARMING', { performance }); // Use farming skill

                actor.resources.bread = (actor.resources.bread || 0) + yieldAmount;
                localResult.yields.push({ resource: 'bread', amount: yieldAmount });
                localResult.message = `Sanket ${yieldAmount} nødproviant (brød/bær)`;

                trackXp('FARMING', Math.ceil(REWARDS.FORAGE.xp * (1 + performance)));

            } else if (actionType === 'CRAFT') {
                const subType = action.subType; // e.g. 'stone_axe', 'iron_sword'
                const recipe = CRAFTING_RECIPES[subType];

                if (recipe) {
                    // Check building level
                    const settlement = room.world?.settlement || {};
                    const buildLevel = settlement.buildings?.[recipe.buildingId]?.level || 1;

                    if (buildLevel < recipe.level) {
                        localResult.success = false;
                        localResult.message = `Mangler bygningsnivå ${recipe.level} for å lage dette.`;
                        result = localResult; return room;
                    }

                    // Check resources
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

                            localResult.message = `Smidde ${newItem.name}!`;
                            trackXp('CRAFTING', 25 * recipe.level);
                        }
                    } else {
                        localResult.success = false;
                        localResult.message = "Mangler ressurser for å smi.";
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

            } else if (actionType === 'EQUIP_ITEM') {
                const { itemId, slot } = action;
                const invIndex = actor.inventory?.findIndex((i: any) => i.id === itemId);

                if (invIndex !== undefined && invIndex !== -1) {
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

            } else if (actionType === 'UNEQUIP_ITEM') {
                const { slot } = action;
                const item = actor.equipment[slot as EquipmentSlot];
                if (item) {
                    actor.equipment[slot as EquipmentSlot] = null as any;
                    if (!actor.inventory) actor.inventory = [];
                    actor.inventory.push(item);
                    localResult.message = `Tok av ${item.name}`;
                }


            } else if (actionType === 'BUY' || actionType === 'SELL') {
                // Keep minimal for market as the main feedback is the transaction log, but ideally we add visual too
                localResult.message = "Handel gjennomført";
            } else if (actionType === 'SLEEP') {
                const staminaGain = 60;
                actor.status.stamina = Math.min(100, (actor.status.stamina || 0) + staminaGain);
                actor.status.hp = Math.min(100, (actor.status.hp || 100) + 10);
                localResult.message = "Sov godt og fikk tilbake krefter.";
                localResult.yields.push({ resource: 'stamina', amount: staminaGain });
            } else if (actionType === 'REFINE') {
                const recipeId = action.recipeId;
                const recipe = (REFINERY_RECIPES as any)[recipeId];

                if (recipe) {
                    // Check building level
                    const settlement = room.world?.settlement || {};
                    const buildLevel = settlement.buildings?.[recipe.buildingId]?.level || 1;

                    // Some advanced recipes might require higher levels
                    if (recipe.requiredLevel && buildLevel < recipe.requiredLevel) {
                        localResult.success = false;
                        localResult.message = `Utvidelse kreves: ${recipe.buildingId} må være Nivå ${recipe.requiredLevel}.`;
                        return localResult;
                    }

                    let canAfford = true;


                    Object.entries(recipe.input).forEach(([res, amt]) => {
                        if ((actor.resources as any)[res] < (amt as number)) canAfford = false;
                    });

                    if (canAfford) {
                        // Consume Input
                        Object.entries(recipe.input).forEach(([res, amt]) => {
                            (actor.resources as any)[res] -= (amt as number);
                        });

                        // Yield Output
                        const performance = action.performance || 0.5;
                        const baseOutput = recipe.output?.amount || recipe.outputAmount || 1;



                        let yieldAmount = Math.floor(baseOutput * (1 + (performance * 0.5))); // Up to 50% bonus

                        // Skill Bonus? Refining might be crafting
                        if (!actor.skills) actor.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS[actor.role as keyof typeof INITIAL_SKILLS] || INITIAL_SKILLS.PEASANT));
                        const skillMult = 1 + ((actor.skills.CRAFTING?.level || 0) * 0.05);
                        yieldAmount = Math.floor(yieldAmount * skillMult);

                        (actor.resources as any)[recipe.outputResource] = ((actor.resources as any)[recipe.outputResource] || 0) + yieldAmount;

                        localResult.yields.push({ resource: recipe.outputResource, amount: yieldAmount });
                        localResult.message = `Raffinerte ${yieldAmount} ${recipe.outputResource}`;
                        trackXp('CRAFTING', 10);
                    } else {
                        localResult.success = false;
                        localResult.message = "Mangler ressurser til raffinering.";
                    }
                }

            } else if (actionType === 'TAX') {
                if (actor.role !== 'BARON' && actor.role !== 'KING') {
                    localResult.success = false;
                    return room;
                }

                let taxTotal = 0;
                let taxGrain = 0;

                // Collect from all peasants in region (simplified: iterate all players, check region)
                Object.values(room.players).forEach((p: any) => {
                    if (p.role === 'PEASANT' && p.id !== actor.id) { // && p.regionId === actor.regionId (if regions implemented)
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
                    localResult.yields.push({ resource: 'gold', amount: taxTotal });
                    localResult.yields.push({ resource: 'grain', amount: taxGrain });
                    localResult.message = `Krevde inn skatt: ${taxTotal}g og ${taxGrain} korn from bøndene.`;
                } else {
                    localResult.message = "Ingen skatt å kreve inn (bøndene er blakke).";
                }

                // Tax hurts legitimacy
                actor.status.legitimacy = Math.max(0, (actor.status.legitimacy || 100) - 5);

            } else if (actionType === 'DRAFT') {
                if (actor.role !== 'BARON' && actor.role !== 'KING') { localResult.success = false; return room; }

                const costGold = 5;
                const costGrain = 10;
                if ((actor.resources.gold || 0) >= costGold && (actor.resources.grain || 0) >= costGrain) {
                    actor.resources.gold -= costGold;
                    actor.resources.grain -= costGrain;
                    actor.resources.manpower = (actor.resources.manpower || 0) + 10;
                    localResult.yields.push({ resource: 'manpower', amount: 10 });
                    localResult.message = `Mobiliserte tropper (+10 Manpower).`;
                } else {
                    localResult.success = false;
                    localResult.message = "Mangler ressurser for å mobilisere.";
                }

            } else if (actionType === 'RAID') {
                if (actor.role !== 'BARON') { localResult.success = false; return room; }

                const targetBaron = Object.values(room.players).find((p: any) => p.role === 'BARON' && p.id !== actor.id) as any;
                if (targetBaron) {
                    const activeLaws = room.world?.activeLaws || [];
                    if (activeLaws.includes('peace')) {
                        localResult.success = false;
                        localResult.message = "Fredsavtale blokkerer raid!";
                        return room;
                    }

                    const myPower = actor.resources.manpower || 0;
                    let targetPower = targetBaron.resources.manpower || 0;
                    let roll = Math.random() * 0.5 + 0.75; // 0.75 - 1.25 varians

                    // Upgrade effects
                    if (targetBaron.upgrades?.includes('stone_keep')) targetPower += 30;
                    if (targetBaron.upgrades?.includes('fence')) targetPower += 10;
                    if (actor.upgrades?.includes('stables')) roll += 0.1;

                    // Combat Durability
                    if (actor.equipment?.MAIN_HAND) damageTool('MAIN_HAND', GAME_BALANCE.DURABILITY.LOSS_COMBAT_WEAPON || 5);
                    if (actor.equipment?.BODY) damageTool('BODY', GAME_BALANCE.DURABILITY.LOSS_COMBAT_ARMOR || 5);


                    if (myPower * roll > targetPower) {
                        // Success
                        const lootGold = Math.floor((targetBaron.resources.gold || 0) * GAME_BALANCE.COMBAT.RAID_LOOT_FACTOR);
                        const lootGrain = Math.floor((targetBaron.resources.grain || 0) * GAME_BALANCE.COMBAT.RAID_LOOT_FACTOR);

                        targetBaron.resources.gold = Math.max(0, (targetBaron.resources.gold || 0) - lootGold);
                        targetBaron.resources.grain = Math.max(0, (targetBaron.resources.grain || 0) - lootGrain);

                        actor.resources.gold = (actor.resources.gold || 0) + lootGold;
                        actor.resources.grain = (actor.resources.grain || 0) + lootGrain;

                        actor.resources.manpower = Math.max(0, actor.resources.manpower - 5);
                        targetBaron.resources.manpower = Math.max(0, targetBaron.resources.manpower - 8);

                        localResult.yields.push({ resource: 'gold', amount: lootGold });
                        localResult.yields.push({ resource: 'grain', amount: lootGrain });
                        localResult.message = `Plyndret ${targetBaron.name} for ${lootGold}g og ${lootGrain} korn!`;
                        trackXp('COMBAT', 50);

                    } else {
                        // Fail
                        actor.resources.manpower = Math.max(0, actor.resources.manpower - 10);
                        localResult.success = false;
                        localResult.message = `Angrepet på ${targetBaron.name} ble slått tilbake.`;
                        trackXp('COMBAT', 10);
                    }
                } else {
                    localResult.success = false;
                    localResult.message = "Fant ingen annen baron å raide.";
                }

            } else if (actionType === 'DECREE') {
                if (actor.role !== 'KING') return room;
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
                localResult.yields.push({ resource: 'gold', amount: taxTotal });

            } else if (actionType === 'UPGRADE') {
                const upgradeId = action.upgradeId;
                const currRole = actor.role as keyof typeof UPGRADES_LIST;
                const upgradeList = UPGRADES_LIST[currRole];

                if (upgradeList) {
                    const upgrade = upgradeList.find(u => u.id === upgradeId);
                    if (upgrade && !actor.upgrades?.includes(upgradeId)) {
                        // Check cost
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
                            // No yield, just state change
                        } else {
                            localResult.success = false;
                            localResult.message = "Har ikke råd til oppgradering.";
                        }
                    }
                }

            } else if (actionType === 'REPAIR') {
                const target = action.target || 'MAIN_HAND'; // SLOT name
                // Map old logic 'tools' to slot 'MAIN_HAND' if needed, but UI should send slot
                // Assuming target is slot name like 'MAIN_HAND'

                if (actor.equipment && actor.equipment[target]) {
                    const item = actor.equipment[target];
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
                        }
                    }
                }



            } else if (actionType === 'BUY_MEAL') {
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
                }

            } else if (actionType === 'REST' || actionType === 'EAT' || actionType === 'FEAST') {
                // Simplified restoration
                let stam = 30;
                let hp = 0;
                let msg = "Hvilte.";

                if (actionType === 'EAT') { stam = 40; msg = "Spiste et måltid."; }
                if (actionType === 'FEAST') { stam = 100; hp = 20; msg = "Holdt gjestebud!"; } // And loyalty effect logic handled elsewhere or generic

                if (actor.upgrades?.includes('roof')) stam += 20;

                actor.status.stamina = Math.min(100, (actor.status.stamina || 0) + stam);
                if (hp > 0) actor.status.hp = Math.min(100, (actor.status.hp || 100) + hp);

                localResult.yields.push({ resource: 'stamina', amount: stam });
                localResult.message = msg;

            } else if (actionType === 'PRAY') {
                const favor = Math.floor(Math.random() * 5) + 1;
                actor.resources.favor = (actor.resources.favor || 0) + favor;
                localResult.yields.push({ resource: 'favor', amount: favor });
                trackXp('THEOLOGY', 10); // Assuming THEOLOGY skill or generic
                localResult.message = `Ba til gudene. (+${favor} velvilje)`;

            } else if (actionType === 'PATROL') {
                // Soldier patrol
                const performance = action.performance || 0.5;
                const goldReward = Math.ceil(15 * performance);
                actor.resources.gold = (actor.resources.gold || 0) + goldReward;

                trackXp('COMBAT', 10);
                localResult.yields.push({ resource: 'gold', amount: goldReward });
                localResult.message = "Utførte patrulje.";

            } else if (actionType === 'CHAT_LOCAL') {
                const gossip = [
                    "Baronen ser nervøs ut i dag.",
                    "Hørte du ulvene i natt?",
                    "Prisen på korn går opp.",
                    "Kongens soldater er på vei."
                ];
                localResult.message = `Sladder: "${gossip[Math.floor(Math.random() * gossip.length)]}"`;
            } else if (actionType === 'RETIRE') {
                if (actor.role !== 'PEASANT') {
                    actor.role = 'PEASANT';
                    actor.status.authority = 0;
                    localResult.message = "Har pensjonert seg og blitt bonde.";
                }
            } else if (actionType === 'TRADE_ROUTE') {
                // Merchant logic
                const { resource, action: direction } = action;
                // (Simplified logic to match restoration need)
                localResult.message = `Handelsrute ${direction} ${resource} utført.`;
                trackXp('TRADING', 20); // Using new skill
            } else if (actionType === 'GAMBLE_RESULT') {
                const { amount, isWin, playerRoll, houseRoll } = action;
                if (isWin) {
                    actor.resources.gold = (actor.resources.gold || 0) + amount;
                    localResult.yields.push({ resource: 'gold', amount });
                    localResult.message = `Vant ${amount}g på terninger! (${playerRoll} mot ${houseRoll})`;
                } else {
                    actor.resources.gold = Math.max(0, (actor.resources.gold || 0) - amount);
                    localResult.message = `Tapte ${amount}g på terninger. (${playerRoll} mot ${houseRoll})`;
                }
            } else if (actionType === 'UPGRADE_BUILDING' || actionType === 'CONSTRUCT_BUILDING') {
                const bId = action.buildingId || actionType.replace('UPGRADE_BUILDING_', '');
                const buildingDef = VILLAGE_BUILDINGS[bId];

                if (buildingDef) {
                    if (!room.world) room.world = { settlement: { buildings: {} } };
                    if (!room.world.settlement) room.world.settlement = { buildings: {} };
                    if (!room.world.settlement.buildings) room.world.settlement.buildings = {};

                    const currentLevel = room.world.settlement.buildings[bId]?.level || 1;
                    const nextLevel = currentLevel + 1;
                    const nextLevelDef = buildingDef.levels[nextLevel];

                    if (nextLevelDef) {
                        // Check requirements
                        let canAfford = true;
                        Object.entries(nextLevelDef.requirements || {}).map(([res, amt]) => {
                            if (((actor.resources as any)[res] || 0) < (amt as number)) canAfford = false;
                        });

                        if (canAfford) {
                            // Deduct
                            Object.entries(nextLevelDef.requirements || {}).map(([res, amt]) => {
                                (actor.resources as any)[res] -= (amt as number);
                            });

                            // Level up
                            if (!room.world.settlement.buildings[bId]) room.world.settlement.buildings[bId] = { id: bId, level: 1 };
                            room.world.settlement.buildings[bId].level = nextLevel;

                            localResult.message = `⚒️ OPPGRADERING: ${buildingDef.name} har nådd Nivå ${nextLevel}!`;
                            room.messages.push(`[${timestamp}] ${localResult.message}`);
                        } else {
                            localResult.success = false;
                            localResult.message = "Mangler ressurser for oppgradering.";
                        }
                    } else {
                        localResult.success = false;
                        localResult.message = "Maksimum nivå nådd.";
                    }
                }
            }

            if (!localResult.message) localResult.message = "Handling utført.";
            if (localResult.success) {
                room.messages.push(`[${timestamp}] ${localResult.message}`);
            }

            actor.lastActive = Date.now();
            result = localResult;
            return room;
        });

        // Return Data
        return { success: !!(result as any)?.success, data: (result as any) || undefined };


    } catch (e) {
        console.error("Action failed", e);
        return { success: false, error: e };
    }
};
