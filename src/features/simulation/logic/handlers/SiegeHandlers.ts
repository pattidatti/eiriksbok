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

    if (isDefender) {
        if (!siege.defenders) siege.defenders = {};
        siege.defenders[actor.id] = { lane: 1, hp: 100, name: actor.name };
        localResult.message = "Du forsvarer murene!";
    } else {
        if (!siege.attackers) siege.attackers = {};
        siege.attackers[actor.id] = { lane: 1, hp: 100, name: actor.name };
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
    const participant = siege.attackers[actor.id] || siege.defenders[actor.id];

    if (!participant) return false;

    // --- PHASE 1: BREACH (Attack Gate) ---
    if (siege.phase === 'BREACH') {
        if (action.subType === 'ATTACK_GATE') {
            // Requirement: Must have Sword (or use fists for tiny damage)
            // Simplified: Base Dmg 10.
            siege.gateHp = Math.max(0, (siege.gateHp || GATE_MAX_HP) - BREACH_DAMAGE);

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

    // --- PHASE 3: THRONE ROOM (Plunder vs Usurp) ---
    if (siege.phase === 'THRONE_ROOM') {
        const t = siege.throne;
        if (!t) return false;

        // 1. PLUNDER
        if (action.subType === 'PLUNDER') {
            if (t.plundered) {
                localResult.message = "Skattekammeret er allerede tømt!";
                return false;
            }

            // Logic: Steal 50% of Region Treasury (Mocked as finding 500 Gold for now, need Region Treasury Ref)
            // Ideally: const treasury = region.treasury;
            const lootAmount = 500;

            actor.resources.gold = (actor.resources.gold || 0) + lootAmount;
            t.plundered = true;

            // End Siege? Or just let them leave?
            // "Plunder ends the siege" per design
            delete room.regions[regionId].activeSiege;

            localResult.message = `💰 Du stjal ${lootAmount} gull og flyktet fra borgen! Beleiringen er over.`;
            // TODO: Log history event
            return true;
        }

        // 2. USURP (King of the Hill)
        if (action.subType === 'USURP') {
            // "Stand on the point"
            t.occupation += 5; // +5% per click/action tick
            localResult.message = `Du sikrer tronen! Okkupasjon: ${t.occupation}%`;

            // Victory Condition
            if (t.occupation >= 100) {
                // USURPER WINS!
                // 1. End Siege
                delete room.regions[regionId].activeSiege;

                // 2. Transfer Power logic (mocked event for now)
                // region.rulerId = actor.id;
                // region.rulerName = actor.name;
                // But wait, coup system usually handles this.
                // For now, let's just trigger a massive Bribe Boost as per design.
                const region = room.regions[regionId];
                if (region.coup) {
                    region.coup.bribeProgress = 100; // Instant Claim Ready
                }

                localResult.message = "👑 DU HAR TATT TRONEN! Regionen er din å kreve!";
            }
            return true;
        }

        // 3. DEFEND (Baron/Steward)
        if (action.subType === 'DEFEND_THRONE') {
            // Push back occupation
            t.occupation = Math.max(0, t.occupation - 10);
            localResult.message = "Du presser angriperne tilbake!";
            return true;
        }

        return true;
    }

    return false;
};
