import { ref, runTransaction } from 'firebase/database';
import { db } from '../../lib/firebase';
import { ACTION_COSTS, UPGRADES_LIST, REWARDS, SEASONS, LEVEL_XP, WEATHER } from './constants';



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

                // Season & Weather modifier
                const seasonYMod = seasonData?.yieldMod || 1.0;
                const weatherYMod = weatherData?.yieldMod || 1.0;
                let lawYMod = 1.0;
                if (activeLaws.includes('conscription')) lawYMod = 0.8;

                yieldAmount = Math.floor(yieldAmount * seasonYMod * weatherYMod * lawYMod);


                // PERFORMANCE MULTIPLIER (from minigame)
                const performance = action.performance || 1.0; // 0-1.0 from minigame
                const finalMultiplier = 0.5 + (performance * 1.0); // Range 0.5x to 1.5x
                yieldAmount = Math.ceil(yieldAmount * finalMultiplier);


                actor.resources.grain = (actor.resources.grain || 0) + yieldAmount;
                actor.stats.xp = (actor.stats.xp || 0) + Math.ceil(REWARDS.WORK.xp * finalMultiplier);

                if (yieldAmount === 0 && currentSeason === 'Winter') {
                    room.messages.push(`[${timestamp}] ❄️ ${actor.name} prøvde å så korn, men jorda er frossen!`);
                } else if (performance > 0.8) {
                    room.messages.push(`[${timestamp}] 🌾 ${actor.name} viste eminente ferdigheter og høstet ${yieldAmount} korn!`);
                }
            } else if (actionType === 'CHOP') {
                let yieldAmount = REWARDS.CHOP.wood;
                if (currentSeason === 'Summer') yieldAmount += 2; // Summer bonus

                // PERFORMANCE MULTIPLIER (from minigame)
                const performance = action.performance || 1.0;
                const finalMultiplier = 0.5 + (performance * 1.0);
                yieldAmount = Math.ceil(yieldAmount * finalMultiplier);

                actor.resources.wood = (actor.resources.wood || 0) + yieldAmount;
                actor.stats.xp = (actor.stats.xp || 0) + Math.ceil(REWARDS.CHOP.xp * finalMultiplier);

                if (performance > 0.8) {
                    room.messages.push(`[${timestamp}] 🪵 ${actor.name} hogg ved som en kjempe! +${yieldAmount} trevirke.`);
                }

            } else if (actionType === 'MILL') {
                const performance = action.performance || 1.0;
                const finalMultiplier = 0.5 + (performance * 1.5); // Range 0.5x to 2.0x for processing
                const yieldAmount = Math.ceil(10 * finalMultiplier);

                actor.resources.flour = (actor.resources.flour || 0) + yieldAmount;
                actor.stats.xp = (actor.stats.xp || 0) + Math.ceil(10 * finalMultiplier);

                if (performance > 0.8) {
                    room.messages.push(`[${timestamp}] 🥖 ${actor.name} er en mestermøller! +${yieldAmount} mel.`);
                } else {
                    room.messages.push(`[${timestamp}] 🥖 ${actor.name} malte korn til mel.`);
                }
            } else if (actionType === 'CRAFT') {
                const performance = action.performance || 1.0;
                const finalMultiplier = 0.5 + (performance * 1.5);
                const yieldAmount = Math.ceil(10 * finalMultiplier);

                actor.resources.swords = (actor.resources.swords || 0) + yieldAmount;
                actor.stats.xp = (actor.stats.xp || 0) + Math.ceil(15 * finalMultiplier);

                if (performance > 0.8) {
                    room.messages.push(`[${timestamp}] ⚔️ ${actor.name} smidde sverd av legendarisk kvalitet! +${yieldAmount} sverd.`);
                } else {
                    room.messages.push(`[${timestamp}] ⚔️ ${actor.name} smidde nye sverd.`);
                }

            } else if (actionType === 'TAX_PEASANTS') {

                if (actor.role !== 'BARON') return;
                let count = 0;
                let totalGold = 0;
                Object.values(room.players).forEach((p: any) => {
                    const baronRegion = actor.regionId || 'unassigned';
                    const peasantRegion = p.regionId || 'unassigned';

                    if (p.role === 'PEASANT' && (peasantRegion === baronRegion || (room.pin === 'TEST' && peasantRegion === 'test_region'))) {
                        let taxRate = 0.15;
                        if (activeLaws.includes('tax_cut')) taxRate = 0.07;

                        const grainTax = Math.ceil((p.resources.grain || 0) * taxRate);
                        const goldTax = Math.ceil((p.resources.gold || 0) * taxRate);

                        p.resources.grain = Math.max(0, p.resources.grain - grainTax);
                        p.resources.gold = Math.max(0, p.resources.gold - goldTax);
                        actor.resources.grain += grainTax;
                        actor.resources.gold += goldTax;
                        totalGold += goldTax;
                        count++;

                        // Loyalty Penalty
                        p.status.loyalty = Math.max(0, (p.status.loyalty || 100) - 10);

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

                        // Loyalty Penalty (Barons also lose loyalty to King)
                        p.status.loyalty = Math.max(0, (p.status.loyalty || 100) - 5);

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
            } else if (actionType === 'PRAY') {
                const favorGained = Math.floor(Math.random() * 5) + 1;
                actor.resources.favor = (actor.resources.favor || 0) + favorGained;
                actor.stats.xp += 2;
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
                const performance = action.performance || 0;
                const goldGained = Math.ceil(20 * performance);
                actor.resources.gold = (actor.resources.gold || 0) + goldGained;
                actor.stats.xp = (actor.stats.xp || 0) + 20;

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
            } else if (actionType === 'CONTRIBUTE') {
                const progress = 10;
                room.world.monumentProgress = (room.world.monumentProgress || 0) + progress;
                actor.stats.xp += 15;
                room.messages.push(`[${timestamp}] 🏗️ ${actor.name} bidro til rikets monument! +${progress} fremgang.`);

                if (room.world.monumentProgress >= 1000) {
                    room.messages.push(`[${timestamp}] 🏛️ MONUMENTET ER FERDIGSTILT! Riket går inn i en ny gullalder!`);
                }
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
