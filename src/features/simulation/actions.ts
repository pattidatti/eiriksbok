import { ref, runTransaction } from 'firebase/database';
import { db } from '../../lib/firebase';
import { ACTION_COSTS, UPGRADES_LIST, REWARDS, SEASONS, LEVEL_XP, WEATHER, GAME_BALANCE, REFINERY_RECIPES, RESOURCE_DETAILS } from './constants';
import type { SimulationMarket } from './types';




export const performAction = async (pin: string, playerId: string, action: any) => {
    const roomRef = ref(db, `simulation_rooms/${pin}`);

    try {
        await runTransaction(roomRef, (room: any) => {
            if (!room || !room.players || !room.players[playerId]) return;

            const actor = room.players[playerId];
            if (!actor.equipment) actor.equipment = {
                tools: { id: 'tools', durability: 100, maxDurability: 100 },
                weapon: { id: 'swords', durability: 100, maxDurability: 100 },
                armor: { id: 'armor', durability: 100, maxDurability: 100 }
            };

            if (!room.messages) room.messages = [];
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // 0. Passive Income & Regeneration
            const now = Date.now();
            const elapsedMs = now - (actor.lastActive || now);
            const elapsedMinutes = Math.min(60, elapsedMs / 60000); // Cap at 60 mins of offline progress

            if (elapsedMinutes > 0.1) {
                let passiveGold = 0;
                if (actor.upgrades?.includes('cow')) passiveGold += elapsedMinutes * 2;
                if (actor.upgrades?.includes('accounting_books')) passiveGold += elapsedMinutes * 5;
                if (actor.upgrades?.includes('caravan')) passiveGold += elapsedMinutes * 10;

                actor.resources.gold = (actor.resources.gold || 0) + Math.floor(passiveGold);

                // Slow stamina regen
                const staminaRegen = elapsedMinutes * 2; // 2 stamina per minute
                actor.status.stamina = Math.min(100, (actor.status.stamina || 0) + staminaRegen);
            }

            const actionType = typeof action === 'string' ? action : action.type;
            const currentSeason = room.world?.season || 'Spring';
            const seasonData = (SEASONS as any)[currentSeason];

            const currentWeather = room.world?.weather || 'Clear';
            const weatherData = (WEATHER as any)[currentWeather];
            const activeLaws = room.world?.activeLaws || [];

            // 0. Law Checks (Interrupts)
            if (actionType === 'RAID' && activeLaws.includes('peace')) {
                room.messages.push(`[${timestamp}] 🕊️ RAID BLOKKERT: Fredsavtalen gjelder!`);
                return;
            }

            // 1. Handle Costs (Resources & Stamina)
            const cost = (ACTION_COSTS as any)[actionType];
            if (cost) {
                // Season & Weather modifiers
                const baseStaminaMod = seasonData?.staminaMod || 1.0;
                const weatherStaminaMod = weatherData?.staminaMod || 1.0;
                const finalStaminaCost = Math.ceil((cost.stamina || 0) * baseStaminaMod * weatherStaminaMod);

                // Resource check
                for (const [res, amt] of Object.entries(cost)) {
                    if (res === 'stamina') continue;
                    if ((actor.resources[res as keyof typeof actor.resources] || 0) < (amt as number)) {
                        const resLabel = (RESOURCE_DETAILS as any)[res]?.label || res;
                        room.messages.push(`[${timestamp}] ❌ Du mangler ${amt} ${resLabel} for å gjøre dette!`);
                        return;
                    }
                }
                if ((actor.status.stamina || 0) < finalStaminaCost) {
                    room.messages.push(`[${timestamp}] 💤 Du er for sliten! (${finalStaminaCost}⚡ kreves)`);
                    return;
                }

                // Deduct resources
                for (const [res, amt] of Object.entries(cost)) {
                    if (res === 'stamina') continue;
                    (actor.resources as any)[res] -= (amt as number);
                }
                actor.status.stamina -= finalStaminaCost;
            }


            // Ensure equipment exists (defensive)
            if (!actor.equipment) {
                actor.equipment = {
                    tools: { id: 'tools', durability: 100, maxDurability: 100 },
                    weapon: { id: 'weapon', durability: 100, maxDurability: 100 },
                    armor: { id: 'armor', durability: 100, maxDurability: 100 }
                };
            }

            // 2. Perform Action Logic
            if (actionType === 'WORK') {
                // Durability check
                if (actor.equipment.tools.durability <= 0) {
                    room.messages.push(`[${timestamp}] ❌ ${actor.name}s verktøy er ødelagt! Må repareres.`);
                    return;
                }
                actor.equipment.tools.durability = Math.max(0, actor.equipment.tools.durability - GAME_BALANCE.DURABILITY.LOSS_WORK);

                let yieldAmount = GAME_BALANCE.YIELD.WORK_GRAIN;
                if (actor.upgrades?.includes('iron_plow')) yieldAmount += GAME_BALANCE.YIELD.PLOW_BONUS;


                // Season & Weather modifier
                const seasonYMod = seasonData?.yieldMod || 1.0;
                const weatherYMod = weatherData?.yieldMod || 1.0;
                let lawYMod = 1.0;
                if (activeLaws.includes('conscription')) lawYMod = 0.8;

                yieldAmount = Math.floor(yieldAmount * seasonYMod * weatherYMod * lawYMod);


                // PERFORMANCE MULTIPLIER (from minigame)
                const performance = action.performance || 1.0; // 0-1.0 from minigame
                const finalMultiplier = GAME_BALANCE.MINIGAME.BASE_MULTIPLIER + (performance * GAME_BALANCE.MINIGAME.PERFORMANCE_WEIGHT);
                yieldAmount = Math.ceil(yieldAmount * finalMultiplier);


                actor.resources.grain = (actor.resources.grain || 0) + yieldAmount;
                actor.stats.xp = (actor.stats.xp || 0) + Math.ceil(REWARDS.WORK.xp * finalMultiplier);

                if (yieldAmount === 0 && currentSeason === 'Winter') {
                    room.messages.push(`[${timestamp}] ❄️ ${actor.name} prøvde å så korn, men jorda er frossen!`);
                } else if (performance > 0.8) {
                    room.messages.push(`[${timestamp}] 🌾 ${actor.name} viste eminente ferdigheter og høstet ${yieldAmount} korn!`);
                }
            } else if (actionType === 'CHOP') {
                // Durability check
                if (actor.equipment.tools.durability <= 0) {
                    room.messages.push(`[${timestamp}] ❌ ${actor.name}s øks er sløv og ødelagt!`);
                    return;
                }
                actor.equipment.tools.durability = Math.max(0, actor.equipment.tools.durability - GAME_BALANCE.DURABILITY.LOSS_WORK);

                let yieldAmount = GAME_BALANCE.YIELD.CHOP_WOOD;
                if (currentSeason === 'Summer') yieldAmount += GAME_BALANCE.YIELD.SUMMER_WOOD_BONUS; // Summer bonus


                // PERFORMANCE MULTIPLIER (from minigame)
                const performance = action.performance || 1.0;
                const finalMultiplier = GAME_BALANCE.MINIGAME.BASE_MULTIPLIER + (performance * GAME_BALANCE.MINIGAME.PERFORMANCE_WEIGHT);
                yieldAmount = Math.ceil(yieldAmount * finalMultiplier);

                actor.resources.wood = (actor.resources.wood || 0) + yieldAmount;
                actor.stats.xp = (actor.stats.xp || 0) + Math.ceil(REWARDS.CHOP.xp * finalMultiplier);

                if (performance > 0.8) {
                    room.messages.push(`[${timestamp}] 🪵 ${actor.name} hogg ved som en kjempe! +${yieldAmount} trevirke.`);
                }

            } else if (actionType === 'FORAGE') {
                // Emergency action: Gathering scraps of food
                // Must do at least okay (performance > 0.5) to find something
                const performance = action.performance || 0;
                const forageYield = performance > 0.5 ? 1 : 0;

                if (forageYield > 0) {
                    actor.resources.bread = (actor.resources.bread || 0) + forageYield;
                    room.messages.push(`[${timestamp}] 🍓 ${actor.name} fant mat i skogen! (+${forageYield} Brød)`);
                } else {
                    room.messages.push(`[${timestamp}] 🍂 ${actor.name} fant ingenting spiselig i skogen...`);
                }
                actor.stats.xp = (actor.stats.xp || 0) + (REWARDS.FORAGE?.xp || 2);

            } else if (actionType === 'MINE') {
                // Durability check
                if (actor.equipment.tools.durability <= 0) {
                    room.messages.push(`[${timestamp}] ❌ Hakken din er knekt!`);
                    return;
                }
                actor.equipment.tools.durability = Math.max(0, actor.equipment.tools.durability - GAME_BALANCE.DURABILITY.LOSS_WORK);

                let yieldAmount = GAME_BALANCE.YIELD.MINE_ORE;

                const performance = action.performance || 1.0;
                const finalMultiplier = GAME_BALANCE.MINIGAME.BASE_MULTIPLIER + (performance * GAME_BALANCE.MINIGAME.PERFORMANCE_WEIGHT);
                yieldAmount = Math.ceil(yieldAmount * finalMultiplier);

                console.log(`[MINE_DEBUG] Yield: ${yieldAmount}, Before: ${actor.resources.iron_ore}`);
                actor.resources.iron_ore = (actor.resources.iron_ore || 0) + yieldAmount;
                console.log(`[MINE_DEBUG] After: ${actor.resources.iron_ore}`);
                actor.stats.xp = (actor.stats.xp || 0) + Math.ceil(REWARDS.WORK.xp * finalMultiplier);

                room.messages.push(`[${timestamp}] ⚒️ ${actor.name} fant ${yieldAmount} jernmalm i gruva.`);

            } else if (actionType === 'QUARRY') {
                let yieldAmount = GAME_BALANCE.YIELD.QUARRY_STONE;

                const performance = action.performance || 1.0;
                const finalMultiplier = GAME_BALANCE.MINIGAME.BASE_MULTIPLIER + (performance * GAME_BALANCE.MINIGAME.PERFORMANCE_WEIGHT);
                yieldAmount = Math.ceil(yieldAmount * finalMultiplier);

                actor.resources.stone = (actor.resources.stone || 0) + yieldAmount;
                actor.stats.xp = (actor.stats.xp || 0) + Math.ceil(REWARDS.WORK.xp * finalMultiplier);
                room.messages.push(`[${timestamp}] 🪨 ${actor.name} hogg ut ${yieldAmount} stein fra fjellet.`);

            } else if (actionType === 'MILL') {
                const performance = action.performance || 1.0;
                const finalMultiplier = GAME_BALANCE.MINIGAME.BASE_MULTIPLIER + (performance * GAME_BALANCE.MINIGAME.CRAFTING_WEIGHT);
                const yieldAmount = 10; // Base flour yield


                actor.resources.flour = (actor.resources.flour || 0) + yieldAmount;
                actor.stats.xp = (actor.stats.xp || 0) + Math.ceil(10 * finalMultiplier);

                if (performance > 0.8) {
                    room.messages.push(`[${timestamp}] 🥖 ${actor.name} er en mestermøller! +${yieldAmount} mel.`);
                } else {
                    room.messages.push(`[${timestamp}] 🥖 ${actor.name} malte korn til mel.`);
                }
            } else if (actionType === 'CRAFT') {
                const subType = action.subType || 'SWORDS';
                const performance = action.performance || 1.0;
                const finalMultiplier = GAME_BALANCE.MINIGAME.BASE_MULTIPLIER + (performance * GAME_BALANCE.MINIGAME.CRAFTING_WEIGHT);

                if (subType === 'SWORDS') {
                    const yieldAmount = 5; // Base
                    actor.resources.swords = (actor.resources.swords || 0) + yieldAmount;
                    room.messages.push(`[${timestamp}] ⚔️ ${actor.name} smidde ${yieldAmount} sverd.`);
                } else if (subType === 'ARMOR') {
                    const yieldAmount = 2; // Base
                    actor.resources.armor = (actor.resources.armor || 0) + yieldAmount;
                    room.messages.push(`[${timestamp}] 🛡️ ${actor.name} banket ut ${yieldAmount} rustninger.`);
                } else if (subType === 'TOOLS') {
                    const yieldAmount = 5; // Base
                    actor.resources.tools = (actor.resources.tools || 0) + yieldAmount;
                    room.messages.push(`[${timestamp}] 🔨 ${actor.name} laget ${yieldAmount} solide verktøy.`);
                }

                actor.stats.xp = (actor.stats.xp || 0) + Math.ceil(15 * finalMultiplier);

            } else if (actionType === 'TAX_PEASANTS') {

                if (actor.role !== 'BARON') return;
                let count = 0;
                let totalGold = 0;
                Object.values(room.players).forEach((p: any) => {
                    const baronRegion = actor.regionId || 'unassigned';
                    const peasantRegion = p.regionId || 'unassigned';

                    if (p.role === 'PEASANT' && (peasantRegion === baronRegion || (room.pin === 'TEST' && peasantRegion === 'test_region'))) {
                        let taxRate = GAME_BALANCE.TAX.PEASANT_RATE_DEFAULT;
                        if (activeLaws.includes('tax_cut')) taxRate = GAME_BALANCE.TAX.PEASANT_RATE_CUT;


                        const grainTax = Math.ceil((p.resources.grain || 0) * taxRate);
                        const goldTax = Math.ceil((p.resources.gold || 0) * taxRate);

                        p.resources.grain = Math.max(0, p.resources.grain - grainTax);
                        p.resources.gold = Math.max(0, p.resources.gold - goldTax);
                        actor.resources.grain += grainTax;
                        actor.resources.gold += goldTax;
                        totalGold += goldTax;
                        count++;

                        // Loyalty Penalty
                        p.status.loyalty = Math.max(0, (p.status.loyalty || 100) - GAME_BALANCE.TAX.LOYALTY_PENALTY_PEASANT);

                    }
                });

                room.messages.push(`[${timestamp}] 🏰 Baron ${actor.name} krevde inn ${totalGold} gull fra ${count} bønder.`);
                actor.stats.xp += 10;
                // Legitimacy penalty for taxing
                actor.status.legitimacy = Math.max(0, (actor.status.legitimacy || 100) - 5);
            } else if (actionType === 'TAX_ROYAL') {

                if (actor.role !== 'KING') return;
                let totalGold = 0;
                let count = 0;
                Object.values(room.players).forEach((p: any) => {
                    if (p.role === 'BARON') {
                        const grainTax = Math.ceil((p.resources.grain || 0) * GAME_BALANCE.TAX.ROYAL_RATE);
                        const goldTax = Math.ceil((p.resources.gold || 0) * GAME_BALANCE.TAX.ROYAL_RATE);
                        p.resources.grain = Math.max(0, p.resources.grain - grainTax);
                        p.resources.gold = Math.max(0, p.resources.gold - goldTax);
                        actor.resources.grain += grainTax;
                        actor.resources.gold += goldTax;
                        totalGold += goldTax;
                        count++;

                        // Loyalty Penalty (Barons also lose loyalty to King)
                        p.status.loyalty = Math.max(0, (p.status.loyalty || 100) - GAME_BALANCE.TAX.LOYALTY_PENALTY_BARON);

                    }
                });

                room.messages.push(`[${timestamp}] 👑 Kong ${actor.name} krevde inn ${totalGold} gull i kongelig skatt.`);
                actor.stats.xp += 20;
            } else if (actionType === 'BUY' || actionType === 'SELL') {
                const res = action.resource as keyof SimulationMarket;
                // Use Local Market based on Region
                const marketId = actor.regionId || 'capital';
                const market = room.markets?.[marketId] || room.market; // Fallback to global
                const item = market[res];
                if (!item) return;

                const isMerchant = actor.role === 'MERCHANT';
                let sellRatio = GAME_BALANCE.MARKET.SELL_RATIO;
                if (isMerchant || actor.upgrades?.includes('trade_license')) sellRatio = 0.9;

                if (actionType === 'BUY') {
                    const amount = res === 'wood' ? 5 : 1;
                    const totalCost = item.price * amount;
                    if (actor.resources.gold >= totalCost && item.stock >= amount) {
                        actor.resources.gold -= totalCost;
                        (actor.resources as any)[res] += amount;
                        item.stock -= amount;
                        // Dynamic price increase (scaled)
                        item.price += (item.price * 0.05 * item.demand);
                        room.messages.push(`[${timestamp}] ⚖️ ${actor.name} kjøpte ${amount} ${String(res)}.`);
                    }
                } else {
                    const amount = res === 'wood' ? 5 : 1;
                    if ((actor.resources as any)[res] >= amount) {
                        (actor.resources as any)[res] -= amount;
                        item.stock += amount;
                        const payout = Math.floor(item.price * sellRatio * amount);
                        actor.resources.gold += payout;
                        // Dynamic price decrease
                        item.price = Math.max(1, item.price - (item.price * 0.03));
                        room.messages.push(`[${timestamp}] ⚖️ ${actor.name} solgte ${amount} ${String(res)} for ${payout}g.`);
                    }
                }
            } else if (actionType === 'DRAFT') {
                if (actor.role !== 'BARON' && actor.role !== 'KING') return;
                const costGold = 5;
                const costGrain = 10;
                if (actor.resources.gold >= costGold && actor.resources.grain >= costGrain) {
                    actor.resources.gold -= costGold;
                    actor.resources.grain -= costGrain;
                    actor.resources.manpower = (actor.resources.manpower || 0) + 10;
                    room.messages.push(`[${timestamp}] ⚔️ ${actor.name} har mobilisert tropper.`);
                }
            } else if (actionType === 'RAID') {
                if (actor.role !== 'BARON') return;
                const targetBaron = Object.values(room.players).find((p: any) => p.role === 'BARON' && p.id !== actor.id) as any;
                if (targetBaron) {
                    const myPower = actor.resources.manpower || 0;
                    let targetPower = targetBaron.resources.manpower || 0;
                    let roll = Math.random() * 0.5 + 0.75;

                    // Upgrade effects
                    if (targetBaron.upgrades?.includes('stone_keep')) targetPower += 30;
                    if (targetBaron.upgrades?.includes('fence')) targetPower += 10;
                    if (actor.upgrades?.includes('stables')) roll += 0.1;

                    // Durability checks for combat
                    actor.equipment.weapon.durability = Math.max(0, actor.equipment.weapon.durability - GAME_BALANCE.DURABILITY.LOSS_COMBAT_WEAPON);
                    actor.equipment.armor.durability = Math.max(0, actor.equipment.armor.durability - GAME_BALANCE.DURABILITY.LOSS_COMBAT_ARMOR);

                    if (myPower * roll > targetPower) {
                        const lootGold = Math.floor(targetBaron.resources.gold * GAME_BALANCE.COMBAT.RAID_LOOT_FACTOR);
                        const lootGrain = Math.floor(targetBaron.resources.grain * GAME_BALANCE.COMBAT.RAID_LOOT_FACTOR);
                        targetBaron.resources.gold -= lootGold;
                        targetBaron.resources.grain -= lootGrain;

                        actor.resources.gold += lootGold;
                        actor.resources.grain += lootGrain;
                        actor.resources.manpower = Math.max(0, actor.resources.manpower - 5);
                        targetBaron.resources.manpower = Math.max(0, targetBaron.resources.manpower - 8);
                        room.messages.push(`[${timestamp}] ⚔️ ${actor.name} plyndret ${targetBaron.name} for ${lootGold} gull!`);
                    } else {
                        actor.resources.manpower = Math.max(0, actor.resources.manpower - 10);
                        room.messages.push(`[${timestamp}] 🛡️ ${targetBaron.name} forsvarte seg mot angrepet fra ${actor.name}!`);
                    }
                }
            } else if (actionType === 'DECREE') {
                if (actor.role !== 'KING') return;
                room.messages.push(`[${timestamp}] 👑 KONGELIG DEKRET: Alle baroner må yte ekstra bidrag til kronen!`);
                Object.values(room.players).forEach((p: any) => {
                    if (p.role === 'BARON') {
                        p.resources.gold = Math.max(0, p.resources.gold - 20);
                        actor.resources.gold += 20;
                    }
                });
            } else if (actionType === 'UPGRADE') {
                const upgradeId = action.upgradeId;
                const upgrade = UPGRADES_LIST[actor.role as keyof typeof UPGRADES_LIST].find(u => u.id === upgradeId);

                if (upgrade && !actor.upgrades?.includes(upgradeId)) {
                    // Check resources
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
                        room.messages.push(`[${timestamp}] ✨ ${actor.name} har oppgradert: ${upgrade.name}!`);
                    }
                }
            } else if (actionType === 'REPAIR') {
                const target = action.target || 'tools';
                if (actor.equipment[target]) {
                    actor.equipment[target].durability = Math.min(actor.equipment[target].maxDurability, actor.equipment[target].durability + GAME_BALANCE.DURABILITY.REPAIR_AMOUNT);
                    room.messages.push(`[${timestamp}] ⚒️ ${actor.name} reparerte ${target}. Durability: ${actor.equipment[target].durability}%`);
                }
            } else if (actionType === 'REST') {
                let staminaGain = 30;
                if (actor.upgrades?.includes('roof')) staminaGain = 50;

                actor.status.stamina = Math.min(100, (actor.status.stamina || 0) + staminaGain);
                actor.resources.bread = Math.max(0, (actor.resources.bread || 0) - 1);
                actor.status.legitimacy = Math.min(100, (actor.status.legitimacy || 100) + 2);
                room.messages.push(`[${timestamp}] 💤 ${actor.name} hviler og spiser.`);
            } else if (actionType === 'PRAY') {
                const max = GAME_BALANCE.RELIGION.PRAY_MAX;
                const min = GAME_BALANCE.RELIGION.PRAY_MIN;
                const favorGained = Math.floor(Math.random() * (max - min + 1)) + min;
                actor.resources.favor = (actor.resources.favor || 0) + favorGained;
                actor.stats.xp += GAME_BALANCE.RELIGION.XP_PRAY;
                room.messages.push(`[${timestamp}] ⛪ ${actor.name} ba en bønn ved klosteret. +${favorGained} velvilje.`);
            } else if (actionType === 'FEAST') {

                // Rulers can host feasts to reset regional loyalty
                const regionId = actor.regionId;
                Object.values(room.players).forEach((p: any) => {
                    if (p.regionId === regionId) {
                        p.status.loyalty = 100;
                    }
                });
                room.messages.push(`[${timestamp}] 🍻 ${actor.name} arrangerte et storslått gjestebud! Lojaliteten i regionen er gjenopprettet.`);
                actor.stats.xp += 25;
            }
            else if (actionType === 'DEFEND') {
                // Durability loss in defense
                actor.equipment.weapon.durability = Math.max(0, actor.equipment.weapon.durability - GAME_BALANCE.DURABILITY.LOSS_COMBAT_WEAPON);
                actor.equipment.armor.durability = Math.max(0, actor.equipment.armor.durability - GAME_BALANCE.DURABILITY.LOSS_COMBAT_ARMOR);

                const performance = action.performance || 0;
                const goldGained = Math.ceil(GAME_BALANCE.COMBAT.DEFEND_GOLD_BASE * performance);
                actor.resources.gold = (actor.resources.gold || 0) + goldGained;
                actor.stats.xp = (actor.stats.xp || 0) + GAME_BALANCE.COMBAT.XP_WIN;

                room.messages.push(`[${timestamp}] 🛡️ ${actor.name} forsvarte seg mot et raid! +${goldGained}g.`);


                // Remove event after interaction
                if (action.eventId && room.worldEvents) {
                    delete room.worldEvents[action.eventId];
                }
            } else if (actionType === 'EXPLORE') {
                const goldGained = 50;
                actor.resources.gold = (actor.resources.gold || 0) + goldGained;
                actor.stats.xp = (actor.stats.xp || 0) + 30;

                room.messages.push(`[${timestamp}] 🧭 ${actor.name} fullførte et oppdrag! +${goldGained}g.`);

                if (action.eventId && room.worldEvents) {
                    delete room.worldEvents[action.eventId];
                }
            } else if (actionType === 'CONSTRUCT') {
                const projectId = action.projectId || room.world.settlement?.activeProjectId;
                if (!projectId) return;

                const building = room.world.settlement?.buildings?.[projectId];
                if (!building) return;

                const progress = 10; // Base progress per construct action
                building.progress += progress;
                actor.stats.xp += 10;
                room.messages.push(`[${timestamp}] 🏗️ ${actor.name} arbeidet på ${projectId}. ${building.progress}/${building.target}`);

                if (building.progress >= building.target) {
                    building.level += 1;
                    building.progress = 0;
                    building.target *= 2; // Next level is harder
                    room.messages.push(`[${timestamp}] 🎉 BYGNING FERDIG: ${projectId} har nådd nivå ${building.level}!`);
                }
            } else if (actionType === 'REFINE') {
                const recipeId = action.recipeId;
                const recipe = (REFINERY_RECIPES as any)[recipeId];
                if (!recipe) return;

                // Check building requirement
                const building = room.world.settlement?.buildings?.[recipe.buildingId];
                if (!building || building.level < 1) {
                    room.messages.push(`[${timestamp}] ❌ Vi trenger en ${recipe.buildingId} for å gjøre dette!`);
                    return;
                }

                // Check inputs
                for (const [res, amt] of Object.entries(recipe.input)) {
                    if ((actor.resources as any)[res] < (amt as number)) return;
                }

                // Deduct inputs
                for (const [res, amt] of Object.entries(recipe.input)) {
                    (actor.resources as any)[res] -= (amt as number);
                }

                // Add outputs
                for (const [res, amt] of Object.entries(recipe.output)) {
                    (actor.resources as any)[res] = (actor.resources as any)[res] || 0;
                    (actor.resources as any)[res] += (amt as number);
                }

                actor.stats.xp += (recipe.xp || 0);
                room.messages.push(`[${timestamp}] ⚙️ ${actor.name} produserte ${Object.keys(recipe.output).join(', ')}.`);
            } else if (actionType === 'TRADE_ROUTE') {
                if (actor.role !== 'MERCHANT') return;

                // REAL TRADE ROUTE: Trade with another player region
                const { targetRegionId, resource, action: direction } = action;
                // direction: 'IMPORT' (Buy from foreign market, bring home) or 'EXPORT' (Sell to foreign market, get gold)

                const targetMarket = room.markets?.[targetRegionId];
                if (!targetMarket) {
                    room.messages.push(`[${timestamp}] ❌ Handelsrute feilet. Fant ikke markedet i ${targetRegionId}.`);
                    return;
                }

                const item = targetMarket[resource as keyof SimulationMarket];
                if (!item) return;

                const amount = 10;

                // Price logic using the REAL foreign market price
                const foreignPrice = item.price;
                const totalCost = Math.ceil(foreignPrice * amount);

                if (direction === 'IMPORT') {
                    // Buy 10 at Foreign Price
                    if (actor.resources.gold >= totalCost && item.stock >= amount) {
                        actor.resources.gold -= totalCost;
                        (actor.resources as any)[resource] = ((actor.resources as any)[resource] || 0) + amount;

                        // Update Foreign Market
                        item.stock -= amount;
                        item.price += (item.price * 0.05 * item.demand);

                        actor.stats.xp += 15;
                        room.messages.push(`[${timestamp}] 🚢 ${actor.name} importerte ${amount} ${resource} fra ${targetRegionId} (Kjøpt for ${totalCost}g).`);
                    } else {
                        room.messages.push(`[${timestamp}] ❌ ${actor.name} prøvde å importere, men manglet gull eller varene var utsolgt i ${targetRegionId}.`);
                    }
                } else {
                    // Export: Sell 10 at Foreign Price
                    if ((actor.resources as any)[resource] >= amount) {
                        (actor.resources as any)[resource] -= amount;

                        // We sell to them, so they gain stock, we gain gold
                        // However, we get paid by "the market" (void), but the market logic implies someone bought it.
                        // In simulation, we just dump it into their market stock.
                        const income = Math.floor(totalCost * GAME_BALANCE.MARKET.SELL_RATIO); // Export tax/tariffs? Let's say standard sell ratio applies.

                        actor.resources.gold += income;

                        // Update Foreign Market
                        item.stock += amount;
                        item.price = Math.max(1, item.price - (item.price * 0.03));

                        actor.stats.xp += 15;
                        room.messages.push(`[${timestamp}] 🚢 ${actor.name} eksporterte ${amount} ${resource} til ${targetRegionId} (Solgt for ${income}g).`);
                    }
                }

                if (actor.role !== 'SOLDIER') return;

                // Durability
                actor.equipment.weapon.durability = Math.max(0, actor.equipment.weapon.durability - 2);

                const performance = action.performance || 0.5;
                const goldReward = Math.ceil(15 * performance);
                actor.resources.gold = (actor.resources.gold || 0) + goldReward;
                actor.stats.xp += Math.ceil(10 * performance);

                // Chance to find "Contraband" (extra loot)
                if (performance > 0.8 && Math.random() > 0.7) {
                    const extraGold = 10;
                    actor.resources.gold += extraGold;
                    room.messages.push(`[${timestamp}] ⚔️ ${actor.name} fant smuglervarer under patruljen! +${goldReward + extraGold}g.`);
                } else {
                    room.messages.push(`[${timestamp}] 🛡️ ${actor.name} fullførte en patruljerunde. +${goldReward}g.`);
                }

            } else if (actionType === 'GAMBLE_RESULT') {
                const { amount, isWin, playerRoll, houseRoll } = action;

                if (isWin) {
                    actor.resources.gold = (actor.resources.gold || 0) + amount;
                    actor.stats.xp += 5;
                    room.messages.push(`[${timestamp}] 🎲 ${actor.name} vant ${amount}g! (Kast: ${playerRoll} mot ${houseRoll})`);
                } else {
                    // Deduct gold (it wasn't deducted at start of game to allow for animation cancelling)
                    actor.resources.gold = Math.max(0, (actor.resources.gold || 0) - amount);
                    room.messages.push(`[${timestamp}] 💸 ${actor.name} tapte ${amount}g. (Kast: ${playerRoll} mot ${houseRoll})`);
                }

            } else if (actionType === 'BUY_MEAL') {
                const cost = 5;
                if ((actor.resources.gold || 0) < cost) {
                    room.messages.push(`[${timestamp}] ❌ En pils og lapskaus koster ${cost}g.`);
                    return;
                }
                actor.resources.gold -= cost;
                actor.status.stamina = Math.min(100, (actor.status.stamina || 0) + 15);
                actor.status.hp = Math.min(100, (actor.status.hp || 100) + 5);
                room.messages.push(`[${timestamp}] 🍗 ${actor.name} nøt et varmt måltid og fikk tilbake kreftene.`);

            } else if (actionType === 'CHAT_LOCAL') {
                const gossip = [
                    "Jeg hørte at Baron Elvin planlegger en stor fest...",
                    "Avlingene i nord har slått feil i år, sies det.",
                    "Har du sett de nye soldatene til Kongen? De ser skumle ut.",
                    "Det er farlig i skogen om natten. Ulvene uler.",
                    "Prisen på jern har gått opp, har du merket det?",
                    "Noen sier at det spøker i den gamle gruva.",
                    "Smeden lager de beste sverdene i hele riket.",
                    "Jeg skulle ønske jeg var adelig, da kunne jeg sovet hele dagen."
                ];
                const msg = gossip[Math.floor(Math.random() * gossip.length)];
                room.messages.push(`[${timestamp}] 🗣️ ${actor.name} snakker med en lokal: "${msg}"`);

            } else if (actionType === 'RETIRE') {
                // Downgrade to Peasant
                if (actor.role === 'PEASANT') return; // Can't retire if already peasant

                const oldRole = actor.role;
                actor.role = 'PEASANT';
                actor.regionId = 'retired_wastes'; // Or just keep region? User said "become peasant", implying simpler life.
                // Reset status/stats? Maybe keep XP/Gold but reset Authority/Legitimacy
                actor.status.authority = 0;
                actor.status.legitimacy = 0;

                // Give peasant starter kit if missing
                if (!actor.resources.grain) actor.resources.grain = 10;
                if (!actor.equipment.tools) actor.equipment.tools = { id: 'tools', durability: 100, maxDurability: 100 };

                room.messages.push(`[${timestamp}] 📉 ${actor.name} har frasagt seg sin tittel som ${oldRole} og lever nå som simpel bonde.`);
            }



            // 3. Level Up Check
            const currentLevel = actor.stats.level || 1;
            const nextLevelXp = LEVEL_XP[currentLevel];
            if (nextLevelXp && actor.stats.xp >= nextLevelXp) {
                actor.stats.level = currentLevel + 1;
                actor.status.hp = 100; // Heal on level up
                room.messages.push(`[${timestamp}] ⭐ ${actor.name} nådde nivå ${actor.stats.level}!`);
            }


            if (room.messages.length > 30) room.messages.shift();

            actor.lastActive = Date.now();
            return room;
        });
        return { success: true };
    } catch (e) {
        console.error("Action failed", e);
        return { success: false, error: e };
    }
};
