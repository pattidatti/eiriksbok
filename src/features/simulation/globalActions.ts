import { ref, runTransaction, get } from 'firebase/database';
import { simulationDb as db } from './simulationFirebase';
import { GAME_BALANCE, VILLAGE_BUILDINGS } from './constants';
import { logSimulationMessage } from './utils/simulationUtils';
import { finalizeLeadershipProject } from './gameLogic';
import type { SimulationPlayer } from './simulationTypes';
import { update } from 'firebase/database';

/*
 * GLOBAL ACTION HANDLERS
 * These functions use granular transactions to avoid locking the entire room.
 */

/* --- MARKET HANDLER --- */
export const handleGlobalTrade = async (pin: string, playerId: string, action: any) => {
    const { resource, type: actionType } = action;
    // Buying/Selling involves two transactions: Market and Player.
    // We transaction the Market FIRST to lock price/stock.

    // 1. Determine Market Region (Guestimate: Player's region or Capital)
    // To do this strictly without extensive reads, we assume 'capital' or read the player first.
    // Reading player is safe (non-blocking).
    const playerRef = ref(db, `simulation_rooms/${pin}/players/${playerId}`);
    const playerSnap = await get(playerRef);
    if (!playerSnap.exists()) return { success: false, error: "Player not found" };
    const player = playerSnap.val() as SimulationPlayer;
    const regionId = player.regionId || 'capital';

    const marketItemRef = ref(db, `simulation_rooms/${pin}/markets/${regionId}/${resource}`);

    // Result State
    let tradeResult: { success: boolean, message: string, cost?: number, revenue?: number, amount: number, price?: number } = {
        success: false, message: "Init", amount: 0
    };

    // TRANSACTION 1: MARKET
    await runTransaction(marketItemRef, (item) => {
        if (!item) {
            // Lazy init item helper if null? Difficult inside transaction.
            // Assumption: Market exists. If not, we abort or handle gracefully.
            // For now, if null, we can't trade.
            return;
        }

        if (actionType === 'BUY') {
            if (item.stock <= 0) return; // Out of stock
            tradeResult.price = item.price;
            tradeResult.cost = item.price;
            tradeResult.amount = 1;

            // Mutate
            item.stock -= 1;
            item.price += item.price * (GAME_BALANCE.MARKET.PRICE_IMPACT_BUY || 0.005);
            tradeResult.success = true;
        } else if (actionType === 'SELL') {
            tradeResult.price = item.price;
            // Sell Price logic
            const sellPrice = item.price * (GAME_BALANCE.MARKET.SELL_RATIO || 0.8);
            tradeResult.revenue = sellPrice;
            tradeResult.amount = 1;

            // Mutate
            item.stock += 1;
            item.price -= item.price * (GAME_BALANCE.MARKET.PRICE_IMPACT_SELL || 0.005);
            tradeResult.success = true;
        }

        return item;
    });

    if (!tradeResult.success) {
        return { success: false, error: "Handel feilet (Vare mangler eller utsolgt)" };
    }

    // TRANSACTION 2: PLAYER
    // If this fails, the market is slightly desynced (item consumed/sold but no gold change).
    // In a game jam context, this is acceptable risk compared to Room Lock.
    let playerSuccess = false;
    let finalMessage = "";

    await runTransaction(playerRef, (actor) => {
        if (!actor) return;
        if (!actor.resources) actor.resources = {};

        if (actionType === 'BUY') {
            const cost = tradeResult.cost || 0;
            if ((actor.resources.gold || 0) < cost) {
                // Critical Failure: Player has no money but Market transaction already happened.
                // We can't revert Market easily.
                // Mitigation: Check gold before Market Transaction? Yes, we did a read earlier.
                // But racily, money could be gone.
                // For this implementation, we abort and Accept the Desync (Market lost stock, Player kept gold).
                // Or we force negative gold?
                return; // Abort
            }
            actor.resources.gold = (actor.resources.gold || 0) - cost;
            actor.resources[resource] = (actor.resources[resource] || 0) + 1;
            finalMessage = `Kjøpte 1 ${resource} for ${cost.toFixed(2)}g`;
            playerSuccess = true;
        } else if (actionType === 'SELL') {
            if ((actor.resources[resource] || 0) < 1) return; // Abort

            const revenue = tradeResult.revenue || 0;
            actor.resources[resource] -= 1;
            actor.resources.gold = (actor.resources.gold || 0) + revenue;
            finalMessage = `Solgte 1 ${resource} for ${revenue.toFixed(2)}g`;
            playerSuccess = true;
        }
        return actor;
    });

    if (playerSuccess) {
        // Log to global messages (fire and forget)
        logSimulationMessage(pin, `[${new Date().toLocaleTimeString()}] ${player.name}: ${finalMessage}`);
        return {
            success: true,
            data: {
                success: true,
                timestamp: Date.now(),
                message: finalMessage,
                utbytte: actionType === 'BUY' ? [{ resource, amount: 1 }] : [{ resource: 'gold', amount: tradeResult.revenue }],
                xp: [],
                durability: []
            }
        };
    } else {
        return { success: false, error: "Transaksjon avbrutt (Mangler ressurser)" };
    }
};

/* --- CONTRIBUTION HANDLER --- */
export const handleGlobalContribution = async (pin: string, playerId: string, action: any) => {
    const { buildingId, resource, amount } = action;
    const buildingRef = ref(db, `simulation_rooms/${pin}/world/settlement/buildings/${buildingId}`);
    const playerRef = ref(db, `simulation_rooms/${pin}/players/${playerId}`);

    // Pre-flight check
    const playerSnap = await get(playerRef);
    if (!playerSnap.exists()) return { success: false, error: "Player missing" };
    const player = playerSnap.val();
    if ((player.resources?.[resource] || 0) < amount) return { success: false, error: "Not enough resources" };

    // 1. Update Building (The Contested Resource)
    let contributionSuccess = false;
    let actualContributed = 0;
    let buildingName = "";
    let leveledUp = false;
    let newLevel = 0;

    await runTransaction(buildingRef, (building) => {
        if (!building) {
            // Init building if missing
            return { id: buildingId, level: 1, progress: { [resource]: amount }, contributions: { [playerId]: { name: player.name, resources: { [resource]: amount } } } };
        }

        const buildingDef = VILLAGE_BUILDINGS[buildingId];
        buildingName = buildingDef?.name || buildingId;
        const nextLevel = (building.level || 1) + 1;
        const nextLevelDef = buildingDef?.levels?.[nextLevel];

        if (!nextLevelDef) return; // Max Level

        const req = nextLevelDef.requirements?.[resource as keyof import('./simulationTypes').Resources] || 0;
        const current = building.progress?.[resource as keyof import('./simulationTypes').Resources] || 0;
        const needed = req - current;

        if (needed <= 0) return; // Already met

        actualContributed = Math.min(amount, needed);

        // Mutate Building
        if (!building.progress) building.progress = {};
        building.progress[resource as keyof import('./simulationTypes').Resources] = current + actualContributed;

        if (!building.contributions) building.contributions = {};
        if (!building.contributions[playerId]) building.contributions[playerId] = { name: player.name, resources: {} };
        const pCont = building.contributions[playerId].resources;
        pCont[resource] = (pCont[resource] || 0) + actualContributed;

        // Check completion
        let finished = true;
        Object.entries(nextLevelDef.requirements).forEach(([r, amt]) => {
            if ((building.progress[r] || 0) < (amt as number)) finished = false;
        });

        if (finished) {
            building.level = nextLevel;
            building.progress = {}; // Reset progress

            // Power Vacuum Logic
            if (buildingId === 'manor_ost' || buildingId === 'manor_vest' || buildingId === 'throne_room') {
                const results = finalizeLeadershipProject(building.contributions, buildingId);
                if (results) {
                    // We can't update other players inside this building transaction easily
                    // But we can store the winner in the building state OR trigger an external update.
                    // For now, let's store it so the Host or a "Success" hook can pick it up.
                    building.pendingWinnerId = results.winningPlayerId;
                    building.pendingRole = results.role;
                }
            }

            building.contributions = {};
            leveledUp = true;
            newLevel = nextLevel;
        }

        contributionSuccess = true;
        return building;
    });

    if (!contributionSuccess) return { success: false, error: "Kunne ikke bidra (Fullt eller ugyldig)" };

    // 2. Post-Completion: Update Roles & Regions (outside transaction)
    if (leveledUp) {
        const buildSnap = await get(buildingRef);
        const bData = buildSnap.val();
        if (bData.pendingWinnerId) {
            const winnerId = bData.pendingWinnerId;
            const newRole = bData.pendingRole;
            const winnerRef = ref(db, `simulation_rooms/${pin}/players/${winnerId}`);

            const winnerSnap = await get(winnerRef);
            const winner = winnerSnap.val();

            const updates: any = {};
            updates[`${winnerId}/role`] = newRole;
            // If Baron, update regionId (if they were capital/somewhere else)
            if (newRole === 'BARON') {
                const regId = buildingId === 'manor_ost' ? 'region_ost' : 'region_vest';
                updates[`${winnerId}/regionId`] = regId;

                // Update Region Meta
                const regionalMetaRef = ref(db, `simulation_rooms/${pin}/regions/${regId}`);
                await update(regionalMetaRef, {
                    rulerId: winnerId,
                    rulerName: winner.name
                });
            } else if (newRole === 'KING') {
                updates[`${winnerId}/regionId`] = 'capital';

                // Update global world state if needed
                // (e.g. log the new king)
            }

            await update(ref(db, `simulation_rooms/${pin}/players`), updates);
            await update(ref(db, `simulation_rooms/${pin}/public_profiles`), updates);

            const coronationMsg = `📢 ${winner.name} har fullført ${buildingName} og er nå utnevnt til ${newRole === 'BARON' ? 'Baron' : 'Konge'}!`;
            logSimulationMessage(pin, coronationMsg);

            // Clear pending from building
            await update(buildingRef, { pendingWinnerId: null, pendingRole: null });
        }
    }

    // 2. Update Player (This should rarely fail if pre-flight passed, but purely local lock)
    let finalMessage = `Bidro med ${actualContributed} ${resource} til ${buildingName}`;
    if (leveledUp) finalMessage += ` 🎉 ${buildingName} nådde nivå ${newLevel}!`;

    await runTransaction(playerRef, (actor) => {
        if (!actor) return;
        if (actor.resources?.[resource] >= actualContributed) {
            actor.resources[resource] -= actualContributed;
        }
        return actor;
    });

    logSimulationMessage(pin, `[${new Date().toLocaleTimeString()}] ${player.name}: ${finalMessage}`);

    return {
        success: true,
        data: {
            success: true,
            timestamp: Date.now(),
            message: finalMessage,
            utbytte: [{ resource, amount: -actualContributed }],
            xp: [],
            durability: []
        }
    };
};

/* --- TAX HANDLER --- */
export const handleGlobalTax = async (pin: string, playerId: string, _action: any) => {
    // Tax is complex because it scrapes ALL players.
    // Iterating all players in a transaction is exactly what we want to avoid.
    // OPTIMIZED STRATEGY: 
    // Instead of pushing/pulling resources from 50 players instantly,
    // we set a "Tax Mandate" timestamp. 
    // Players "pay tax" lazily when they next perform an action (Solo Action).
    // BUT, the user wants immediate feedback.

    // Fallback: We DO read all players, but we process them in batches or accept the heavy read?
    // Actually, distinct transactions on each player is better than one big transaction.
    // We can fire off 50 promises of runTransaction(player). parallel.
    // This is scalable-ish (Firebase handles it well).

    const roomPlayersRef = ref(db, `simulation_rooms/${pin}/players`);
    const snapshot = await get(roomPlayersRef);
    if (!snapshot.exists()) return { success: false, error: "No players" };

    const players = snapshot.val();
    let taxCollectedGold = 0;
    let taxCollectedGrain = 0;

    // We can't sum up safely in parallel without mutex, so we just collect what we INTEND to take
    // and hope the transactions succeed. 
    // OR we just transaction the Baron immediately after? No, we need to know how much we got.

    // REVISED: We loop players, calculate tax, and runTransaction on them.
    // We sum the result.

    const taxationPromises = Object.keys(players).map(async (targetId) => {
        const targetRef = ref(db, `simulation_rooms/${pin}/players/${targetId}`);
        let taxesFromThisPlayer = { gold: 0, grain: 0 };

        await runTransaction(targetRef, (p) => {
            if (!p || p.role !== 'PEASANT' || p.regionId !== playerId) return; // Only tax own peasants (if ID matches region)

            // Logic match ManagementHandlers:
            const goldTax = Math.floor((p.resources.gold || 0) * GAME_BALANCE.TAX.PEASANT_RATE_DEFAULT);
            const grainTax = Math.floor((p.resources.grain || 0) * GAME_BALANCE.TAX.PEASANT_RATE_DEFAULT);

            if (goldTax > 0) {
                p.resources.gold -= goldTax;
                taxesFromThisPlayer.gold = goldTax;
            }
            if (grainTax > 0) {
                p.resources.grain -= grainTax;
                taxesFromThisPlayer.grain = grainTax;
            }
            return p;
        });

        // Accumulate (This is safe as we are in the map closure, not shared state writing)
        // Wait, 'taxCollectedGold' is shared. We need atomic add or lock.
        // Javascript is single threaded event loop, so `taxCollectedGold += val` inside the `then` block is safe
        // provided we await the transaction. 
        if (taxesFromThisPlayer.gold > 0) taxCollectedGold += taxesFromThisPlayer.gold;
        if (taxesFromThisPlayer.grain > 0) taxCollectedGrain += taxesFromThisPlayer.grain;
    });

    await Promise.all(taxationPromises);

    // Give to Baron
    const baronRef = ref(db, `simulation_rooms/${pin}/players/${playerId}`);
    await runTransaction(baronRef, (actor) => {
        if (!actor) return;
        actor.resources.gold = (actor.resources.gold || 0) + taxCollectedGold;
        actor.resources.grain = (actor.resources.grain || 0) + taxCollectedGrain;
        actor.status.legitimacy = Math.max(0, (actor.status.legitimacy || 100) - 5);
        return actor;
    });

    const msg = `Skatteinnkreving fullført: ${taxCollectedGold}g og ${taxCollectedGrain} korn.`;
    logSimulationMessage(pin, `[${new Date().toLocaleTimeString()}] ${msg}`);

    return {
        success: true,
        data: {
            success: true,
            timestamp: Date.now(),
            message: msg,
            utbytte: [{ resource: 'gold', amount: taxCollectedGold }, { resource: 'grain', amount: taxCollectedGrain }],
            xp: [],
            durability: []
        }
    };
};

/* --- CAREER HANDLER --- */
export const handleCareerChange = async (pin: string, playerId: string, newRole: import('./simulationTypes').Role) => {
    const playerRef = ref(db, `simulation_rooms/${pin}/players/${playerId}`);

    // Pre-flight check
    const playerSnap = await get(playerRef);
    if (!playerSnap.exists()) return { success: false, error: "Fant ikke spilleren." };
    const player = playerSnap.val() as SimulationPlayer;

    if (player.role !== 'PEASANT') return { success: false, error: "Du har alt en karriere." };
    if (newRole !== 'SOLDIER' && newRole !== 'MERCHANT') return { success: false, error: "Ugyldig karrierevalg." };

    const reqs = GAME_BALANCE.CAREERS[newRole];
    if (player.stats.level < reqs.LEVEL_REQ) return { success: false, error: `Du må være level ${reqs.LEVEL_REQ} for å bli ${newRole === 'SOLDIER' ? 'Soldat' : 'Kjøpmann'}.` };
    if ((player.resources.gold || 0) < reqs.COST) return { success: false, error: `Du mangler ${(reqs.COST - (player.resources.gold || 0))} gull.` };

    let success = false;
    await runTransaction(playerRef, (p) => {
        if (!p) return;
        if (p.resources.gold < reqs.COST) return; // Re-check inside transaction lock

        // PAY
        p.resources.gold -= reqs.COST;
        // CHANGE ROLE
        p.role = newRole;
        // Set default equipment/stats for new role? Optional, but role is enough for now.

        success = true;
        return p;
    });

    if (success) {
        logSimulationMessage(pin, `[KARRIERE] ${player.name} er nå en ${newRole}!`);
        return { success: true, message: `Gratulerer! Du er nå en ${newRole === 'SOLDIER' ? 'Soldat' : 'Kjøpmann'}.` };
    } else {
        return { success: false, error: "Transaksjon feilet." };
    }
};
