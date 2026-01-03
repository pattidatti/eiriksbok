import { ref, runTransaction, get, update } from 'firebase/database';
import { simulationDb as db } from './simulationFirebase';
import { calculateStaminaCost, logSimulationMessage } from './utils/simulationUtils';
import { ACTION_COSTS, GAME_BALANCE, INITIAL_RESOURCES, INITIAL_SKILLS, LEVEL_XP } from './constants';
import { ACTION_REGISTRY } from './logic/actionRegistry';
import { handleGlobalTrade, handleGlobalTax, handleGlobalContribution } from './globalActions';
import type { SkillType, SimulationPlayer, EquipmentSlot, ActionType, Resources } from './simulationTypes';

/* --- HELPERS --- */

const addXp = (actor: SimulationPlayer, skillType: SkillType, amount: number, messages: string[]) => {
    // 1. Initialize roleStats if missing
    if (!actor.roleStats) actor.roleStats = {};
    const currRole = actor.role;

    // 2. Ensure current role stats exist (Sync if it's the first time)
    if (!actor.roleStats[currRole]) {
        actor.roleStats[currRole] = {
            level: actor.stats?.level || 1,
            xp: actor.stats?.xp || 0,
            skills: JSON.parse(JSON.stringify(actor.skills || INITIAL_SKILLS[currRole as keyof typeof INITIAL_SKILLS] || INITIAL_SKILLS.PEASANT))
        };
    }

    const roleStats = actor.roleStats[currRole]!;

    // 3. Update Skills (Local to role container)
    const skill = roleStats.skills[skillType];
    if (skill) {
        skill.xp += (amount || 0);
        if (skill.xp >= skill.maxXp) {
            skill.level += 1;
            skill.xp -= skill.maxXp;
            skill.maxXp = Math.floor(skill.maxXp * 1.5);
            messages.push(`⭐ ${actor.name} ble bedre i ${skillType}! (Nivå ${skill.level})`);
        }
    }

    // 4. Update Role Rank XP
    roleStats.xp = (roleStats.xp || 0) + (amount || 0);

    const getLevel = (xp: number) => {
        const index = LEVEL_XP.findIndex(req => xp < req);
        return index === -1 ? LEVEL_XP.length : index;
    };

    const newLevel = getLevel(roleStats.xp);
    if (newLevel > roleStats.level) {
        roleStats.level = newLevel;
        messages.push(`🏰 ${actor.name} har steget i rang som ${currRole} til Nivå ${newLevel}!`);
    }

    // 5. Sync to root for UI/Engine compatibility (important for existing systems)
    actor.stats.xp = roleStats.xp;
    actor.stats.level = roleStats.level;
    actor.skills = roleStats.skills;
};

/* --- ACTIONS CLASSIFICATION --- */
const GLOBAL_ACTIONS = ['RAID', 'TAX', 'TAX_PEASANTS', 'TAX_ROYAL', 'TRADE', 'TRADE_ROUTE', 'CONTRIBUTE_TO_UPGRADE', 'BUY', 'SELL', 'CONTRIBUTE', 'START_SIEGE', 'JOIN_SIEGE', 'SIEGE_ACTION'];

export const performAction = async (pin: string, playerId: string, action: any): Promise<{ success: boolean, data?: { success: boolean, timestamp: number, message: string, utbytte: any[], xp: any[], durability: any[] }, error?: any }> => {
    const actionType = typeof action === 'string' ? action : action.type;
    const isGlobalAction = GLOBAL_ACTIONS.includes(actionType);

    // PATH 1: GLOBAL ACTIONS
    if (isGlobalAction) {
        return performGlobalAction(pin, playerId, action);
    }

    // PATH 2: SOLO ACTIONS
    return performSoloAction(pin, playerId, action);
};

/* --- SHARDED ACTION HANDLER (OPTIMIZED) --- */
async function performSoloAction(pin: string, playerId: string, action: any) {
    const playerRef = ref(db, `simulation_rooms/${pin}/players/${playerId}`);

    // 1. Fetch Read-Only State (No Lock)
    const worldRef = ref(db, `simulation_rooms/${pin}/world`);

    let result: any = null;

    try {
        const worldSnap = await get(worldRef);
        const world = worldSnap.exists() ? worldSnap.val() : { season: 'Spring', weather: 'Clear', activeLaws: [] };

        const markets = {};
        const market = {};

        await runTransaction(playerRef, (actor: any) => {
            if (!actor) return actor; // Player missing?

            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Initialize Core State if missing
            if (!actor.resources) actor.resources = JSON.parse(JSON.stringify(INITIAL_RESOURCES[actor.role as keyof typeof INITIAL_RESOURCES] || INITIAL_RESOURCES.PEASANT));
            if (!actor.skills) actor.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS[actor.role as keyof typeof INITIAL_SKILLS] || INITIAL_SKILLS.PEASANT));
            if (!actor.status) actor.status = { stamina: 100, hp: 100, authority: 0, gold: actor.resources.gold || 0, level: 1, xp: 0 };
            if (!actor.equipment) actor.equipment = { HEAD: null, BODY: null, MAIN_HAND: null, OFF_HAND: null, FEET: null, TRINKET: null, AXE: null, PICKAXE: null, SCYTHE: null, HAMMER: null };
            if (!actor.stats) actor.stats = { level: 1, xp: 0 };
            if (!actor.activeBuffs) actor.activeBuffs = [];

            // Initialize Local Result
            const localResult = {
                success: true,
                timestamp: Date.now(),
                message: "",
                utbytte: [] as any[],
                xp: [] as any[],
                durability: [] as any[]
            };

            // Helpers
            const trackXp = (skill: SkillType, amount: number) => {
                const preLevel = actor.skills?.[skill]?.level || 0;
                const msgList: string[] = [];
                addXp(actor, skill, amount, msgList);
                if (msgList.length > 0) localResult.message += " " + msgList.join(" ");

                const postLevel = actor.skills?.[skill]?.level || 0;
                localResult.xp.push({ skill, amount, levelUp: postLevel > preLevel });
            };

            const initialLevel = actor.stats.level || 1;

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
            const cost = ACTION_COSTS[actionType as ActionType];

            if (cost) {
                const finalStaminaCost = calculateStaminaCost(cost.stamina || 0, world.season, world.weather, actor.activeBuffs, world.gameTick || 0);

                // Resource Check
                for (const [res, amt] of Object.entries(cost)) {
                    if (res === 'stamina') continue;
                    const resourceKey = res as keyof Resources;
                    const currentAmount = actor.resources[resourceKey] || 0;
                    if (currentAmount < (amt as number)) {
                        localResult.success = false;
                        localResult.message = `❌ Mangler ${amt} ${res}!`;
                        result = localResult;
                        return actor;
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
                    const resourceKey = res as keyof Resources;
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
                    room: mockRoom as any,
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

            // 3. Jackpot Moment
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
                actor.resources.gold = (actor.resources.gold || 0) + 150;
                localResult.utbytte.push(rareRelic);
                localResult.message += " ✨ ET JORDFUNN! Du fant en eldgammel relikvie begravd i bakken!";
            }

            actor.lastActive = Date.now();
            result = localResult;

            if (actionType === 'RETIRE' && localResult.success) {
                (result as any).characterSnapshot = JSON.parse(JSON.stringify(actor));
            }

            // Flag for side-effect
            if (actor.stats.level > initialLevel) {
                (result as any).newLevel = actor.stats.level;
            }

            return actor;
        });

        // Post-Transaction: Log Message & Side-Effects
        try {
            if (result && result.success) {
                // Log message if significant
                if (result.message) {
                    await logSimulationMessage(pin, `[${new Date().toLocaleTimeString()}] ${result.message}`);
                }
            }

            if ((result as any).characterSnapshot) {
                await recordCharacterLife(playerId, pin, (result as any).characterSnapshot);
            }

            // DUAL-WRITE: Sync Level Up to Public Profile
            if ((result as any).newLevel) {
                try {
                    await update(ref(db, `simulation_rooms/${pin}/public_profiles/${playerId}`), {
                        "stats/level": (result as any).newLevel,
                        lastActive: Date.now()
                    });
                } catch (e) {
                    console.error("Failed to sync level to public profile", e);
                }
            }
        } catch (logErr) {
            console.error("Non-critical post-action error (logging/history):", logErr);
        }

        return { success: !!result?.success, data: result || undefined };

    } catch (e) {
        console.error("Solo Action failed", e);
        return { success: false, error: e };
    }
};

/* --- GLOBAL ACTION HANDLER --- */
async function performGlobalAction(pin: string, playerId: string, action: any) {
    const actionType = typeof action === 'string' ? action : action.type;

    try {
        if (actionType === 'BUY' || actionType === 'SELL' || actionType === 'TRADE_ROUTE') {
            return await handleGlobalTrade(pin, playerId, action);
        }

        if (actionType === 'CONTRIBUTE' || actionType === 'CONTRIBUTE_TO_UPGRADE') {
            return await handleGlobalContribution(pin, playerId, action);
        }



        if (actionType === 'TAX' || actionType === 'TAX_PEASANTS' || actionType === 'TAX_ROYAL') {
            return await handleGlobalTax(pin, playerId, action);
        }

        if (actionType === 'START_SIEGE' || actionType === 'JOIN_SIEGE' || actionType === 'SIEGE_ACTION') {
            return await performSiegeTransaction(pin, playerId, action);
        }

        return { success: false, error: "Global handling for this action not yet optimized." };

    } catch (e) {
        console.error("Global Action ERROR:", e);
        return { success: false, error: JSON.stringify(e, Object.getOwnPropertyNames(e)) };
    }
};

// Hoisted Helper (converted to function to avoid TDZ issues if called before definition)
export async function recordCharacterLife(uid: string, roomPin: string, player: SimulationPlayer) {
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

        const updatedHistory = [...history, newEntry];
        const addedXp = player.stats?.xp || 0;
        const newGlobalXp = (accountData.globalXp || 0) + addedXp;
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
}

/* --- SIEGE TRANSACTION --- */
async function performSiegeTransaction(pin: string, playerId: string, action: any) {
    const actionType = typeof action === 'string' ? action : action.type;
    const playerRef = ref(db, `simulation_rooms/${pin}/players/${playerId}`);
    const regionsRef = ref(db, `simulation_rooms/${pin}/regions`);
    const worldRef = ref(db, `simulation_rooms/${pin}/world`);

    try {
        // 1. Fetch Data (Parallel)
        const [playerSnap, regionsSnap, worldSnap] = await Promise.all([
            get(playerRef),
            get(regionsRef),
            get(worldRef)
        ]);

        if (!playerSnap.exists()) return { success: false, error: "Spiller finnes ikke" };

        const actor = playerSnap.val();
        // Ensure minimal state
        if (!actor.resources) actor.resources = INITIAL_RESOURCES[actor.role as keyof typeof INITIAL_RESOURCES] || INITIAL_RESOURCES.PEASANT;

        const regions = regionsSnap.val() || {};
        const world = worldSnap.val() || {};

        // 2. Prepare Context with REGIONS
        const localResult = {
            success: true,
            timestamp: Date.now(),
            message: "",
            utbytte: [] as any[],
            xp: [] as any[],
            durability: [] as any[]
        };

        const mockRoom = {
            world,
            regions, // <--- CRITICAL FIX
            players: { [playerId]: actor },
            markets: {},
            messages: []
        };

        const ctx = {
            actor,
            room: mockRoom as any,
            pin,
            action,
            timestamp: new Date().toLocaleTimeString(),
            localResult,
            trackXp: (_skill: SkillType, _amount: number) => { /* Simplified XP tracking for Siege */ },
            damageTool: () => true
        };

        // 3. Run Handler
        const handler = ACTION_REGISTRY[actionType];
        if (!handler) return { success: false, error: "Ukjent handling" };

        const success = handler(ctx);

        if (!success || !localResult.success) {
            return { success: false, data: localResult }; // Failure
        }

        // 4. Atomic Commit (Multi-Path Update)
        const updates: any = {};
        updates[`players/${playerId}`] = actor;
        updates[`regions`] = regions; // Persist modified region state (Siege progress)

        await update(ref(db, `simulation_rooms/${pin}`), updates);

        return { success: true, data: localResult };

    } catch (e: any) {
        console.error("Siege Transaction Failed", e);
        return { success: false, error: e.message || "Beleiring feilet" };
    }
}
