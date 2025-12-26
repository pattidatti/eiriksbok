import { ref, runTransaction } from 'firebase/database';
import { db } from '../../lib/firebase';
import { ACTION_COSTS, UPGRADES_LIST, REWARDS, SEASONS, LEVEL_XP } from './constants';


export const performAction = async (pin: string, playerId: string, action: any) => {
    const roomRef = ref(db, `simulation_rooms/${pin}`);

    try {
        await runTransaction(roomRef, (room: any) => {
            if (!room || !room.players || !room.players[playerId]) return;

            const actor = room.players[playerId];
            if (!room.messages) room.messages = [];
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Passively regen stamina based on time since last action?
            // Actually, let's keep it simple: setiap kali melakukan aksi, stamina berkurang.
            // Regenerasi stamina bisa dilakukan lewat aksi "REST" atau pasif di UI.
            // Untuk sekarang, kita implementasikan konsumsi dulu.

            const actionType = typeof action === 'string' ? action : action.type;
            const currentSeason = room.world?.season || 'Spring';
            const seasonData = (SEASONS as any)[currentSeason];

            // 1. Handle Costs (Resources & Stamina)
            const cost = (ACTION_COSTS as any)[actionType];
            if (cost) {
                // Stamina penalty in winter
                const staminaMod = seasonData?.staminaMod || 1.0;
                const finalStaminaCost = Math.ceil((cost.stamina || 0) * staminaMod);

                if ((actor.resources.grain || 0) < (cost.grain || 0)) return;
                if ((actor.resources.flour || 0) < (cost.flour || 0)) return;
                if ((actor.resources.iron || 0) < (cost.iron || 0)) return;
                if ((actor.resources.wood || 0) < (cost.wood || 0)) return;
                if ((actor.status.stamina || 0) < finalStaminaCost) return;

                actor.resources.grain -= (cost.grain || 0);
                actor.resources.flour -= (cost.flour || 0);
                actor.resources.iron -= (cost.iron || 0);
                actor.resources.wood -= (cost.wood || 0);
                actor.status.stamina -= finalStaminaCost;
            }


            // 2. Perform Action Logic
            if (actionType === 'WORK') {
                let yieldAmount = REWARDS.WORK.grain;
                if (actor.upgrades?.includes('iron_plow')) yieldAmount += 5;

                // Season modifier
                yieldAmount = Math.floor(yieldAmount * (seasonData?.yieldMod || 1.0));

                actor.resources.grain = (actor.resources.grain || 0) + yieldAmount;
                actor.stats.xp = (actor.stats.xp || 0) + REWARDS.WORK.xp;

                if (yieldAmount === 0 && currentSeason === 'Winter') {
                    room.messages.push(`[${timestamp}] ❄️ ${actor.name} prøvde å så korn, men jorda er frossen!`);
                }
            } else if (actionType === 'CHOP') {
                let yieldAmount = REWARDS.CHOP.wood;
                if (currentSeason === 'Summer') yieldAmount += 2; // Summer bonus
                actor.resources.wood = (actor.resources.wood || 0) + yieldAmount;
                actor.stats.xp = (actor.stats.xp || 0) + REWARDS.CHOP.xp;
            } else if (actionType === 'MILL') {
                actor.resources.flour = (actor.resources.flour || 0) + 10;
                actor.stats.xp = (actor.stats.xp || 0) + 10;
                room.messages.push(`[${timestamp}] 🥖 ${actor.name} malte korn til mel.`);
            } else if (actionType === 'CRAFT') {
                actor.resources.swords = (actor.resources.swords || 0) + 10;
                actor.stats.xp = (actor.stats.xp || 0) + 15;
                room.messages.push(`[${timestamp}] ⚔️ ${actor.name} smidde nye sverd.`);
            } else if (actionType === 'TAX_PEASANTS') {

                if (actor.role !== 'BARON') return;
                let count = 0;
                let totalGold = 0;
                Object.values(room.players).forEach((p: any) => {
                    const baronRegion = actor.regionId || 'unassigned';
                    const peasantRegion = p.regionId || 'unassigned';

                    if (p.role === 'PEASANT' && (peasantRegion === baronRegion || (room.pin === 'TEST' && peasantRegion === 'test_region'))) {
                        const grainTax = Math.ceil((p.resources.grain || 0) * 0.15);
                        const goldTax = Math.ceil((p.resources.gold || 0) * 0.15);
                        p.resources.grain = Math.max(0, p.resources.grain - grainTax);
                        p.resources.gold = Math.max(0, p.resources.gold - goldTax);
                        actor.resources.grain += grainTax;
                        actor.resources.gold += goldTax;
                        totalGold += goldTax;
                        count++;
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
                        const grainTax = Math.ceil((p.resources.grain || 0) * 0.20);
                        const goldTax = Math.ceil((p.resources.gold || 0) * 0.20);
                        p.resources.grain = Math.max(0, p.resources.grain - grainTax);
                        p.resources.gold = Math.max(0, p.resources.gold - goldTax);
                        actor.resources.grain += grainTax;
                        actor.resources.gold += goldTax;
                        totalGold += goldTax;
                        count++;
                    }
                });

                room.messages.push(`[${timestamp}] 👑 Kong ${actor.name} krevde inn ${totalGold} gull i kongelig skatt.`);
                actor.stats.xp += 20;
            } else if (actionType === 'BUY_GRAIN') {
                const costMarket = room.market.grain.price;
                if (actor.resources.gold >= costMarket) {
                    actor.resources.gold -= costMarket;
                    actor.resources.grain += 1;
                    room.market.grain.price += 0.1;
                }
            } else if (actionType === 'SELL_GRAIN') {
                if (actor.resources.grain >= 1) {
                    const price = room.market.grain.price;
                    actor.resources.grain -= 1;
                    const payout = Math.floor(price * 0.8);
                    actor.resources.gold += payout;
                    room.market.grain.price = Math.max(1, room.market.grain.price - 0.1);
                    room.messages.push(`[${timestamp}] 🌾 ${actor.name} solgte korn for ${payout} gull.`);
                }
            } else if (actionType === 'BUY_WOOD') {
                const costMarket = room.market.wood.price;
                if (actor.resources.gold >= costMarket) {
                    actor.resources.gold -= costMarket;
                    actor.resources.wood += 5;
                    room.market.wood.price += 0.2;
                }
            } else if (actionType === 'SELL_WOOD') {
                if (actor.resources.wood >= 5) {
                    const price = room.market.wood.price;
                    actor.resources.wood -= 5;
                    const payout = Math.floor(price * 0.8 * 5);
                    actor.resources.gold += payout;
                    room.market.wood.price = Math.max(2, room.market.wood.price - 0.2);
                    room.messages.push(`[${timestamp}] 🪵 ${actor.name} solgte trevirke.`);
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

                    // Upgrade: Stone Keep increases defense
                    if (targetBaron.upgrades?.includes('stone_keep')) targetPower += 20;

                    const roll = Math.random() * 0.5 + 0.75;

                    if (myPower * roll > targetPower) {
                        const lootGold = Math.floor(targetBaron.resources.gold * 0.4);
                        const lootGrain = Math.floor(targetBaron.resources.grain * 0.4);
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
            } else if (actionType === 'REST') {
                actor.status.stamina = Math.min(100, (actor.status.stamina || 0) + 30);
                actor.resources.flour = Math.max(0, (actor.resources.flour || 0) - 1);
                actor.status.legitimacy = Math.min(100, (actor.status.legitimacy || 100) + 2);
                room.messages.push(`[${timestamp}] 💤 ${actor.name} hviler og spiser.`);
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
