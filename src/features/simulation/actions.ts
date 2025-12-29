import { ref, runTransaction } from 'firebase/database';
import { simulationDb as db } from './simulationFirebase';
import { ACTION_COSTS, GAME_BALANCE, INITIAL_SKILLS, LEVEL_XP } from './constants';
import { calculateStaminaCost } from './utils/simulationUtils';
import { ACTION_REGISTRY } from './logic/actionRegistry';

import type { SkillType, SimulationPlayer } from './simulationTypes';


/* --- HELPERS --- */
// (calculateYield removed, now in simulationUtils.ts)

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
                const preLevel = actor.skills?.[skill]?.level || 0;
                addXp(actor, skill, amount, room.messages);
                const postLevel = actor.skills?.[skill]?.level || 0;
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
                        return false;
                    }
                }
                return true;
            };

            // 0. Passive Income & Regeneration
            const now = Date.now();
            const elapsedMs = now - (actor.lastActive || now);
            const elapsedMinutes = Math.min(60, elapsedMs / 60000);

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
            const currentSeason = room.world?.season || 'Spring';
            const currentWeather = room.world?.weather || 'Clear';
            const activeLaws = room.world?.activeLaws || [];

            // Law Checks
            if (actionType === 'RAID' && activeLaws.includes('peace')) {
                localResult.success = false;
                localResult.message = `🕊️ RAID BLOKKERT: Fredsavtalen gjelder!`;
                result = localResult;
                room.messages.push(`[${timestamp}] ${localResult.message}`);
                return room;
            }

            // Normalization
            let normalizedType = actionType;
            if (['BAKE', 'MILL', 'SMELT', 'WEAVE', 'MIX'].includes(actionType)) {
                if (action.recipeId) normalizedType = 'REFINE';
                else if (action.subType) normalizedType = 'CRAFT';
            }

            // 1. Handle Costs
            const cost = (ACTION_COSTS as any)[actionType] || (ACTION_COSTS as any)[normalizedType];
            if (cost) {
                const finalStaminaCost = calculateStaminaCost(cost.stamina || 0, currentSeason as any, currentWeather as any);

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

            // Initialize equipment if missing
            if (!actor.equipment) {
                actor.equipment = {
                    HEAD: null, BODY: { id: 'tunic', name: 'Slitt Tunika', durability: 20, maxDurability: 20, level: 1, stats: { defense: 1 } },
                    MAIN_HAND: null, OFF_HAND: null, FEET: null, TRINKET: null
                };
            }

            // 2. Perform Action Logic via Registry
            const handler = ACTION_REGISTRY[normalizedType] || ACTION_REGISTRY[actionType];

            if (handler) {
                const ctx = {
                    actor,
                    room,
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
                    return room;
                }
            } else {
                console.warn(`No handler found for action: ${actionType} / ${normalizedType}`);
                localResult.success = false;
                localResult.message = "Ukjent handling.";
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
