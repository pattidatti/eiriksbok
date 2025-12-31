import { ref, runTransaction, update, get, push } from 'firebase/database';
import { simulationDb as db } from './simulationFirebase';
import { ACTION_COSTS, GAME_BALANCE, INITIAL_RESOURCES, INITIAL_SKILLS, LEVEL_XP } from './constants';
import { calculateStaminaCost } from './utils/simulationUtils';
import { ACTION_REGISTRY } from './logic/actionRegistry';
import type { SkillType, SimulationPlayer, EquipmentSlot } from './simulationTypes';

/* --- HELPERS --- */

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

/* --- ACTIONS CLASSIFICATION --- */
const GLOBAL_ACTIONS = ['RAID', 'TAX', 'TAX_PEASANTS', 'TAX_ROYAL', 'TRADE', 'CONTRIBUTE_TO_UPGRADE']; // Involve interactions or global state writes
// All other actions are "Solo" and can be sharded (locking only the player)



export const performAction = async (pin: string, playerId: string, action: any): Promise<{ success: boolean, data?: { success: boolean, timestamp: number, message: string, utbytte: any[], xp: any[], durability: any[] }, error?: any }> => {
    const actionType = typeof action === 'string' ? action : action.type;
    const isGlobalAction = GLOBAL_ACTIONS.includes(actionType);

    // PATH 1: GLOBAL ACTIONS (Legacy Mode - Locks Room)
    if (isGlobalAction) {
        return performGlobalAction(pin, playerId, action);
    }

    // PATH 2: SOLO ACTIONS (Sharded Mode - Locks Player Only)
    return performSoloAction(pin, playerId, action);
};

/* --- SHARDED ACTION HANDLER (OPTIMIZED) --- */
const performSoloAction = async (pin: string, playerId: string, action: any) => {
    const playerRef = ref(db, `simulation_rooms/${pin}/players/${playerId}`);
    const messagesRef = ref(db, `simulation_rooms/${pin}/messages`);

    // 1. Fetch Read-Only State (No Lock)
    const worldRef = ref(db, `simulation_rooms/${pin}/world`);
    const marketsRef = ref(db, `simulation_rooms/${pin}/markets`);
    const marketRef = ref(db, `simulation_rooms/${pin}/market`);

    let result: any = null;

    try {
        const [worldSnap, marketsSnap, marketSnap] = await Promise.all([
            get(worldRef),
            get(marketsRef),
            get(marketRef)
        ]);

        const world = worldSnap.exists() ? worldSnap.val() : { season: 'Spring', weather: 'Clear', activeLaws: [] };
        const markets = marketsSnap.exists() ? marketsSnap.val() : {};
        const market = marketSnap.exists() ? marketSnap.val() : null;

        await runTransaction(playerRef, (actor: any) => {
            if (!actor) return actor; // Player missing?

            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Initialize Core State if missing (Self-Repair)
            if (!actor.resources) actor.resources = JSON.parse(JSON.stringify(INITIAL_RESOURCES[actor.role as keyof typeof INITIAL_RESOURCES] || INITIAL_RESOURCES.PEASANT));
            if (!actor.skills) actor.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS[actor.role as keyof typeof INITIAL_SKILLS] || INITIAL_SKILLS.PEASANT));
            if (!actor.status) actor.status = { stamina: 100, hp: 100, authority: 0, gold: actor.resources.gold || 0, level: 1, xp: 0 };
            if (!actor.equipment) actor.equipment = { HEAD: null, BODY: null, MAIN_HAND: null, OFF_HAND: null, FEET: null, TRINKET: null, AXE: null, PICKAXE: null, SCYTHE: null, HAMMER: null };
            if (!actor.stats) actor.stats = { level: 1, xp: 0 };

            // Initialize Local Result
            const localResult = {
                success: true,
                timestamp: Date.now(),
                message: "",
                utbytte: [] as any[],
                xp: [] as any[],
                durability: [] as any[]
            };

            // Helpers (same as before)
            const trackXp = (skill: SkillType, amount: number) => {
                const preLevel = actor.skills?.[skill]?.level || 0;
                /* Note: addXp expects 'messages' array. For solo actions, we collect messages locally. */
                const msgList: string[] = [];
                addXp(actor, skill, amount, msgList);
                // Append XP messages to local result message or handle differently. For now, we mainly care about the level up logic.
                if (msgList.length > 0) localResult.message += " " + msgList.join(" ");

                const postLevel = actor.skills?.[skill]?.level || 0;
                localResult.xp.push({ skill, amount, levelUp: postLevel > preLevel });
            };

            const damageTool = (slot: EquipmentSlot, amount: number) => {
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
                        return false;
                    }
                }
                return true;
            };

            // 0. Passive Income & Regen
            const now = Date.now();
            const elapsedMs = now - (actor.lastActive || now);
            const elapsedMinutes = Math.min(60, isNaN(elapsedMs) ? 0 : elapsedMs / 60000);

            if (elapsedMinutes > 0.1) {
                let passiveGold = 0;
                if (actor.upgrades?.includes('cow')) passiveGold += elapsedMinutes * GAME_BALANCE.PASSIVE_INCOME.COW;
                if (actor.upgrades?.includes('accounting_books')) passiveGold += elapsedMinutes * GAME_BALANCE.PASSIVE_INCOME.ACCOUNTING_BOOKS;
                if (actor.upgrades?.includes('caravan')) passiveGold += elapsedMinutes * GAME_BALANCE.PASSIVE_INCOME.CARAVAN;
                if (passiveGold > 0) {
                    actor.resources.gold = (actor.resources.gold || 0) + Math.floor(passiveGold);
                }
                const staminaRegen = elapsedMinutes * 2;
                actor.status.stamina = Math.min(100, (actor.status.stamina || 0) + staminaRegen);
            }

            const actionType = typeof action === 'string' ? action : action.type;

            // 1. Handle Costs
            const cost = ACTION_COSTS[actionType as import('./simulationTypes').ActionType];

            if (cost) {
                const finalStaminaCost = calculateStaminaCost(cost.stamina || 0, world.season, world.weather);

                // Resource Check
                for (const [res, amt] of Object.entries(cost)) {
                    if (res === 'stamina') continue;
                    const resourceKey = res as keyof import('./simulationTypes').Resources;
                    const currentAmount = actor.resources[resourceKey] || 0;
                    if (currentAmount < (amt as number)) {
                        localResult.success = false;
                        localResult.message = `❌ Mangler ${amt} ${res}!`;
                        result = localResult;
                        return actor; // Abort write? logic says return actor but marked failure
                    }
                }

                // Stamina Check
                if ((actor.status.stamina || 0) < finalStaminaCost) {
                    localResult.success = false;
                    localResult.message = `💤 For sliten! (${finalStaminaCost}⚡ kreves)`;
                    result = localResult;
                    return actor;
                }

                // Deduct
                for (const [res, amt] of Object.entries(cost)) {
                    if (res === 'stamina') continue;
                    const resourceKey = res as keyof import('./simulationTypes').Resources;
                    actor.resources[resourceKey] = (actor.resources[resourceKey] || 0) - (amt as number);
                }
                actor.status.stamina -= finalStaminaCost;
            }

            // 2. Perform Action Logic
            const handler = ACTION_REGISTRY[actionType];
            if (handler) {
                const mockRoom = {
                    world: world,
                    markets: markets,
                    market: market,
                    messages: [],
                    players: { [playerId]: actor }
                };

                const ctx = {
                    actor,
                    room: mockRoom as any, // Pass structured mock
                    pin,
                    action,
                    timestamp,
                    localResult,
                    trackXp,
                    damageTool
                };

                const handlerSuccess = handler(ctx);
                if (handlerSuccess === false) {
                    result = localResult;
                    return actor;
                }
            } else {
                localResult.success = false;
                localResult.message = `Ukjent handling: ${actionType}`;
            }

            if (!localResult.message) localResult.message = "Handling utført.";

            // 3. Jackpot Moment (Rare Luck Drops - 0.5% chance)
            if (localResult.success && Math.random() < 0.005) {
                const rareRelic = {
                    resource: 'ancient_relic',
                    type: 'ITEM',
                    id: 'ancient_relic',
                    name: 'Gammel Relikvie',
                    icon: '🏺',
                    amount: 1,
                    jackpot: true
                };
                actor.resources.gold = (actor.resources.gold || 0) + 150; // Big gold find
                localResult.utbytte.push(rareRelic);
                localResult.message += " ✨ ET JORDFUNN! Du fant en eldgammel relikvie begravd i bakken!";
            }

            actor.lastActive = Date.now();
            result = localResult;

            // SPECIAL: If retiring
            if (actionType === 'RETIRE' && localResult.success) {
                (result as any).characterSnapshot = JSON.parse(JSON.stringify(actor));
            }

            return actor;
        });

        // Post-Transaction: Log Message
        if (result && result.success) {
            // Push message to separate list
            push(messagesRef, `[${new Date().toLocaleTimeString()}] ${result.message}`);

            if ((result as any).characterSnapshot) {
                await recordCharacterLife(playerId, pin, (result as any).characterSnapshot);
            }
        } else if (result && !result.success && result.message) {
            // Optional: Log failures too? Maybe strictly for user feedback
            // push(messagesRef, `[${new Date().toLocaleTimeString()}] ${result.message}`);
        }

        return { success: !!result?.success, data: result || undefined };

    } catch (e) {
        console.error("Solo Action failed", e);
        return { success: false, error: e };
    }
};

/* --- GLOBAL ACTION HANDLER (Optimized: Get/Update pattern to avoid root transaction timeouts) --- */
const performGlobalAction = async (pin: string, playerId: string, action: any) => {
    const roomRef = ref(db, `simulation_rooms/${pin}`);
    let result: any = null;

    try {
        // 1. Fetch State (No Transaction Lock to prevent hangs on large objects)
        const snapshot = await get(roomRef);
        if (!snapshot.exists()) return { success: false, error: "Room not found" };

        const room = snapshot.val();
        if (!room.players || !room.players[playerId]) return { success: false, error: "Player not found" };

        const actor = room.players[playerId];
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (!room.messages || !Array.isArray(room.messages)) room.messages = [];

        // Initialize Core State if missing
        if (!actor.resources) actor.resources = JSON.parse(JSON.stringify(INITIAL_RESOURCES[actor.role as keyof typeof INITIAL_RESOURCES] || INITIAL_RESOURCES.PEASANT));
        if (!actor.skills) actor.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS[actor.role as keyof typeof INITIAL_SKILLS] || INITIAL_SKILLS.PEASANT));
        if (!actor.status) actor.status = { stamina: 100, hp: 100, authority: 0, gold: actor.resources.gold || 0, level: 1, xp: 0 };

        const localResult = {
            success: true,
            timestamp: Date.now(),
            message: "",
            utbytte: [] as any[],
            xp: [] as any[],
            durability: [] as any[]
        };

        const trackXp = (skill: SkillType, amount: number) => {
            const preLevel = actor.skills?.[skill]?.level || 0;
            addXp(actor, skill, amount, room.messages);
            const postLevel = actor.skills?.[skill]?.level || 0;
            localResult.xp.push({ skill, amount, levelUp: postLevel > preLevel });
        };

        const damageTool = (slot: EquipmentSlot, amount: number) => {
            // simplified logic for global actions
            if (actor.equipment?.[slot]) {
                actor.equipment[slot].durability = Math.max(0, actor.equipment[slot].durability - amount);
                if (actor.equipment[slot].durability <= 0) {
                    localResult.message = `❌ ${actor.equipment[slot].name} ble ødelagt!`;
                    localResult.success = false;
                    return false;
                }
            }
            return true;
        };

        const actionType = typeof action === 'string' ? action : action.type;
        const handler = ACTION_REGISTRY[actionType];

        // 1. Handle Costs
        const cost = ACTION_COSTS[actionType as import('./simulationTypes').ActionType];
        if (cost) {
            const worldSeason = room.world?.season || 'Spring';
            const worldWeather = room.world?.weather || 'Clear';
            const finalStaminaCost = calculateStaminaCost(cost.stamina || 0, worldSeason, worldWeather);

            for (const [res, amt] of Object.entries(cost)) {
                if (res === 'stamina') continue;
                const resourceKey = res as keyof import('./simulationTypes').Resources;
                if ((actor.resources[resourceKey] || 0) < (amt as number)) {
                    return { success: false, error: `Mangler ${amt} ${res}` };
                }
            }
            if ((actor.status.stamina || 0) < finalStaminaCost) {
                return { success: false, error: "For sliten" };
            }

            for (const [res, amt] of Object.entries(cost)) {
                if (res === 'stamina') continue;
                const resourceKey = res as keyof import('./simulationTypes').Resources;
                actor.resources[resourceKey] = (actor.resources[resourceKey] || 0) - (amt as number);
            }
            actor.status.stamina -= finalStaminaCost;
        }

        // 2. Execute Handler
        if (handler) {
            const ctx = { actor, room, pin, action, timestamp, localResult, trackXp, damageTool };
            const handlerSuccess = handler(ctx);

            if (handlerSuccess === false) {
                return { success: false, error: localResult.message || "Handling feilet" };
            }
        } else {
            localResult.success = false;
            localResult.message = `Ukjent handling: ${actionType}`;
        }

        // 3. Commit
        if (localResult.success) {
            if (localResult.message) room.messages.push(`[${timestamp}] ${localResult.message}`);
            actor.lastActive = Date.now();

            // WRITE BACK (Optimistic update)
            await update(roomRef, room);
        }

        return { success: localResult.success, data: localResult };

    } catch (e) {
        console.error("Global Action ERROR:", e);
        return { success: false, error: JSON.stringify(e, Object.getOwnPropertyNames(e)) };
    }
};

export const recordCharacterLife = async (uid: string, roomPin: string, player: SimulationPlayer) => {
    if (!uid || !player) return;

    const accountRef = ref(db, `simulation_accounts/${uid}`);
    try {
        const snapshot = await get(accountRef);
        if (!snapshot.exists()) return;

        const accountData = snapshot.val();
        const history = accountData.characterHistory || [];

        const newEntry = {
            name: player.name,
            role: player.role,
            level: player.stats?.level || 1,
            xp: player.stats?.xp || 0,
            roomPin: roomPin,
            timestamp: Date.now()
        };

        // Append to history and update total XP/Level if needed
        const updatedHistory = [...history, newEntry];
        const addedXp = player.stats?.xp || 0;
        const newGlobalXp = (accountData.globalXp || 0) + addedXp;

        // Simple level up logic for global account
        const newGlobalLevel = Math.floor(Math.sqrt(newGlobalXp / 100)) + 1;

        await update(accountRef, {
            characterHistory: updatedHistory,
            globalXp: newGlobalXp,
            globalLevel: newGlobalLevel,
            lastActive: Date.now()
        });

        console.log(`Character life recorded for ${player.name} (${uid})`);
    } catch (e) {
        console.error("Failed to record character life:", e);
    }
};
