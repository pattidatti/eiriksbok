import type { ActionContext } from '../actionTypes';
// import type { ActiveSiege } from '../../simulationTypes';

// const SIEGE_TICK_MS = 1000;
const GATE_MAX_HP = 5000;
const BREACH_DAMAGE = 10;
// const ARROW_VOLLEY_CHANCE = 0.1; // Reserved for Tick Logic

// --- HANDLERS ---

export const handleStartSiege = (ctx: ActionContext) => {
    const { actor, room, localResult } = ctx;

    // Validations
    if (!actor.regionId || actor.regionId === 'capital' || actor.regionId === 'unassigned') {
        localResult.success = false;
        localResult.message = "Du må være i baroniet for å starte beleiring.";
        return false;
    }

    if (!room.regions) {
        console.error("CRITICAL: room.regions is undefined in handleStartSiege", room);
        localResult.success = false;
        localResult.message = "Systemfeil: Kunne ikke hente regiondata.";
        return false;
    }

    const region = room.regions[actor.regionId];
    if (region.activeSiege) {
        localResult.success = false;
        localResult.message = "Beleiring pågår allerede!";
        return false;
    }

    if (region.rulerName === actor.name) {
        localResult.success = false;
        localResult.message = "Du kan ikke beleire ditt eget slott!";
        return false;
    }

    // Initialize Siege
    region.activeSiege = {
        phase: 'BREACH',
        startedAt: Date.now(),
        lastTick: Date.now(),
        attackers: {
            [actor.id]: { lane: 1, hp: 100, name: actor.name }
        },
        defenders: {},
        // Extra state for Phase 1
        gateHp: GATE_MAX_HP,
        maxGateHp: GATE_MAX_HP
    } as any; // Cast as any because we might be adding extra runtime props not in strict interface yet

    localResult.message = `Beleiringen av ${region.name} har startet!`;
    return true;
};

export const handleJoinSiege = (ctx: ActionContext) => {
    const { actor, room, localResult } = ctx;
    const regionId = actor.regionId;
    if (!regionId || !room.regions[regionId]?.activeSiege) {
        localResult.success = false;
        localResult.message = "Ingen aktiv beleiring her.";
        return false;
    }

    const siege = room.regions[regionId].activeSiege!;

    // Check if already joined
    const attackers = siege.attackers || {};
    const defenders = siege.defenders || {};

    if (attackers[actor.id] || defenders[actor.id]) {
        localResult.message = "Du deltar allerede.";
        return false;
    }

    // Join as Attacker (for now, default to attacker unless you are Ruler)
    // TODO: Let Baron/Soldiers join as Defenders
    const isDefender = room.regions[regionId].rulerName === actor.name; // Simple check

    const initialStats = { damageDealt: 0, damageTaken: 0, armorDonated: 0, ticksOnThrone: 0 };

    if (isDefender) {
        if (!siege.defenders) siege.defenders = {};
        siege.defenders[actor.id] = { lane: 1, hp: 100, name: actor.name, stats: initialStats };
        localResult.message = "Du forsvarer murene!";
    } else {
        if (!siege.attackers) siege.attackers = {};
        siege.attackers[actor.id] = { lane: 1, hp: 100, name: actor.name, stats: initialStats };
        localResult.message = "Du har sluttet deg til beleiringen!";
    }

    return true;
};

export const handleSiegeAction = (ctx: ActionContext) => {
    const { actor, room, action, localResult } = ctx;
    // const { type, payload } = action; // payload might contain 'lane' or 'target'

    const regionId = actor.regionId;
    if (!regionId || !room.regions[regionId]?.activeSiege) return false;

    const siege = room.regions[regionId].activeSiege as any; // Cast for custom props
    const attackers = siege.attackers || {};
    const defenders = siege.defenders || {};
    const participant = attackers[actor.id] || defenders[actor.id];

    if (!participant) return false;

    // --- PHASE 1: BREACH (Attack Gate) ---
    if (siege.phase === 'BREACH') {
        if (action.subType === 'ATTACK_GATE') {
            // Requirement: Must have Sword (or use fists for tiny damage)
            // Simplified: Base Dmg 10.
            siege.gateHp = Math.max(0, (siege.gateHp || GATE_MAX_HP) - BREACH_DAMAGE);

            // Stats
            participant.stats = participant.stats || { damageDealt: 0, damageTaken: 0, armorDonated: 0, ticksOnThrone: 0 };
            participant.stats.damageDealt += BREACH_DAMAGE;

            // FX: "Clang!"
            localResult.message = `Angrep porten! Portens HP: ${siege.gateHp}`;

            // Check Victory
            if (siege.gateHp <= 0) {
                siege.phase = 'COURTYARD';
                siege.gateHp = 0;
                localResult.message = "PORTEN ER KNUST! Storm borggården!";
            }
            return true;
        }

        if (action.subType === 'SHIELD_WALL') {
            // Toggle defense mode?
            return true;
        }
    }

    // --- PHASE 2: COURTYARD (Tactical Lanes) ---
    if (siege.phase === 'COURTYARD') {
        const s = siege as any;
        if (!s.bossHp) {
            // Init Phase 2 Data on first action if missing
            s.bossHp = 10000;
            s.maxBossHp = 10000;
            s.bossTargetLane = 1; // Middle
            s.nextBossAttack = Date.now() + 5000;
        }

        // 1. Handle Player Actions
        if (action.subType === 'MOVE_LANE') {
            const targetLane = action.payload?.lane;
            if (targetLane >= 0 && targetLane <= 2) {
                participant.lane = targetLane;
                localResult.message = `Forflyttet til bane ${targetLane === 0 ? 'Venstre' : targetLane === 1 ? 'Midten' : 'Høyre'}.`;
            }
            // Fallthrough to tick check
        }

        if (action.subType === 'ATTACK_BOSS') {
            s.bossHp -= 25; // Base dmg
            // Stats
            participant.stats = participant.stats || { damageDealt: 0, damageTaken: 0, armorDonated: 0, ticksOnThrone: 0 };
            participant.stats.damageDealt += 25;

            localResult.message = `Angrep Bossen! HP: ${s.bossHp}`;
            // Fallthrough to tick check
        }

        // 2. Boss Logic (Pseudo-Tick triggered by player actions)
        if (Date.now() > s.nextBossAttack) {
            // Boss Attacks previous target lane
            const hitLane = s.bossTargetLane;
            // const victims = Object.values(siege.attackers).filter((p: any) => p.lane === hitLane);

            // "Damage" them (visual message for now, or reduce HP)
            if (participant.lane === hitLane) {
                participant.hp -= 20;
                // Stats
                participant.stats = participant.stats || { damageDealt: 0, damageTaken: 0, armorDonated: 0, ticksOnThrone: 0 };
                participant.stats.damageTaken += 20;

                localResult.message += " AU! Bossen traff deg!";
            }

            // Pick NEXT target
            s.bossTargetLane = Math.floor(Math.random() * 3);
            s.nextBossAttack = Date.now() + 5000; // 5 seconds telegraph

            // Global Broadcast hack? Or just rely on polling state.
            // In a real app we'd push a notification.
        }

        // 3. Victory Check
        if (s.bossHp <= 0) {
            siege.phase = 'THRONE_ROOM';

            // Initialize Phase 3 Data
            // Detect if Defender is online (Mock logic for now, or check LastActive)
            const defenderId = room.regions[regionId].rulerId;
            const defender = room.players[defenderId || ''];
            const isOnline = defender && (Date.now() - (defender.lastActive || 0) < 60000);

            siege.throne = {
                mode: isOnline ? 'PVP' : 'PVE',
                occupation: 0,
                plundered: false,
                bossHp: isOnline ? (defender?.status?.hp || 100) * 5 : 5000, // PvP Baron has 5x HP, PvE Steward has 5k
                maxBossHp: isOnline ? (defender?.status?.hp || 100) * 5 : 5000,
                defendingPlayerId: defenderId
            };

            localResult.message = "GARNISONSSJEFEN ER BESEIRET! Dørene til Tronsalen slås opp!";
        }

        return true;
    }

    // --- PHASE 3: THRONE ROOM (Hotseat) ---
    if (siege.phase === 'THRONE_ROOM' || (siege.phase as string) === 'THRONE') {
        let t = siege.throne;

        // Lazy Init / Schema Update for Hotseat
        if (!t || t.usurperId === undefined) {
            const defenderId = room.regions[regionId].rulerId;
            const defender = room.players[defenderId || ''];
            const isOnline = defender && (Date.now() - (defender.lastActive || 0) < 60000);

            // Preserve existing occupation if any
            const existingOcc = t?.occupation || 0;

            t = {
                mode: isOnline ? 'PVP' : 'PVE',
                occupation: existingOcc,
                plundered: t?.plundered || false,
                bossHp: 0, // Not used in Hotseat
                maxBossHp: 0,
                defendingPlayerId: defenderId,
                usurperId: null,
                usurperName: null,
                usurperArmor: 0,
                lastTick: Date.now(),
                drainRate: 1
            };
            siege.throne = t;
        }

        // --- TICK LOGIC (Pseudo-tick triggered by actions) ---
        const now = Date.now();
        if (t.usurperId && now - (t.lastTick || 0) > 1000) {
            const deltaSeconds = Math.floor((now - (t.lastTick || 0)) / 1000);

            // 1. Drain Armor
            const drain = (t.drainRate || 1) * deltaSeconds;
            t.usurperArmor = Math.max(0, (t.usurperArmor || 0) - drain);

            // 2. Increase Occupation
            t.occupation = Math.min(100, (t.occupation || 0) + (1 * deltaSeconds));

            // 3. Track Stats (Ticks on Throne)
            const usurperPart = (attackers[t.usurperId] || defenders[t.usurperId]);
            if (usurperPart) {
                usurperPart.stats = usurperPart.stats || { damageDealt: 0, damageTaken: 0, armorDonated: 0, ticksOnThrone: 0 };
                usurperPart.stats.ticksOnThrone += deltaSeconds;
            }

            // 4. Update Tick
            t.lastTick = now;

            // 5. Check Ejection
            if (t.usurperArmor <= 0) {
                t.usurperId = null;
                t.usurperName = null;
                t.usurperArmor = 0;
                localResult.message = "Troneroceren har falt! Tronen er ledig!";
                // Don't return yet, allow specific action to process
            } else if (t.occupation >= 100) {
                // VICTORY!
                delete room.regions[regionId].activeSiege;
                const region = room.regions[regionId];
                if (region.coup) {
                    region.coup.bribeProgress = 100;
                }
                localResult.message = `👑 ${t.usurperName} HAR TATT TRONEN!`;
                return true;
            }
        } else if (!t.usurperId) {
            // Decay occupation if nobody on throne? Or stay static? 
            // Design doc didn't specify decay. Static for now.
            t.lastTick = now; // Keep tick fresh
        }

        // --- PLAYER ACTIONS ---

        // 1. CLAIM THRONE
        if (action.subType === 'CLAIM_THRONE') {
            if (t.usurperId) {
                localResult.message = "Tronen er allerede opptatt!";
                return false;
            }
            // Cost: 1 Armor
            const currentArmor = actor.resources.armor || 0;
            if (currentArmor < 1) {
                localResult.message = "Du trenger minst 1 Rustning (Armor) for å ta tronen!";
                return false;
            }

            actor.resources.armor = currentArmor - 1;
            t.usurperId = actor.id;
            t.usurperName = actor.name;
            t.usurperArmor = 1; // Starts with 1 durability
            t.lastTick = Date.now();
            t.drainRate = 1; // Reset drain rate

            // Stats
            participant.stats = participant.stats || { damageDealt: 0, damageTaken: 0, armorDonated: 0, ticksOnThrone: 0 };
            participant.stats.armorDonated += 1; // Count self-claim as donation? Discussable, but fair.
            t.usurperArmor = 10;
            t.lastTick = Date.now();
            t.drainRate = 1;

            localResult.message = `${actor.name} KREVDE TRONEN! ("Jeg er kapteinen nå")`;
            return true;
        }

        // DONATE ARMOR (Support)
        if (action.subType === 'DONATE_ARMOR') {
            if (!t.usurperId) return { success: false, message: "Ingen på tronen å støtte!" };
            if (t.usurperId === actor.id) return { success: false, message: "Du kan ikke donere til deg selv!" };

            t.usurperArmor = (t.usurperArmor || 0) + 1;

            participant.stats = participant.stats || { damageDealt: 0, damageTaken: 0, armorDonated: 0, ticksOnThrone: 0 };
            participant.stats.armorDonated += 1;

            localResult.message = `${actor.name} donerte rustning til ${t.usurperName}!`;
            return true;
        }

        // SUNDER ARMOR (Defend/Attack)
        if (action.subType === 'SUNDER_ARMOR') {
            if (!t.usurperId) return { success: false, message: "Tronen er tom! Ingen å angripe!" };

            t.usurperArmor = Math.max(0, (t.usurperArmor || 0) - 1);

            participant.stats = participant.stats || { damageDealt: 0, damageTaken: 0, armorDonated: 0, ticksOnThrone: 0 };
            participant.stats.damageDealt += 1;

            localResult.message = `${actor.name} knuste rustningen til ${t.usurperName}!`;
            return true;
        }

        // PLUNDER (Alternative)
        if (action.subType === 'PLUNDER') {
            if (t.plundered) return { success: false, message: "Skattekammeret er allerede tømt!" };
            if (t.usurperId === actor.id) return { success: false, message: "Du sitter på tronen! Ikke plyndre ditt eget slott!" };

            t.plundered = true;

            // Give Gold
            actor.resources.gold = (actor.resources.gold || 0) + 500;

            localResult.message = `${actor.name} plyndret 500 gull og stakk av! (Grådigpinn)`;
            return true;
        }

        if (action.subType === 'TICK') return true;

        return true;
    }

    return false;
};
