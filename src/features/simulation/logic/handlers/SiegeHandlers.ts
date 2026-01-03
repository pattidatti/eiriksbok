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
    if (siege.attackers[actor.id] || siege.defenders[actor.id]) {
        localResult.message = "Du deltar allerede.";
        return false;
    }

    // Join as Attacker (for now, default to attacker unless you are Ruler)
    // TODO: Let Baron/Soldiers join as Defenders
    const isDefender = room.regions[regionId].rulerName === actor.name; // Simple check

    if (isDefender) {
        siege.defenders[actor.id] = { lane: 1, hp: 100, name: actor.name };
        localResult.message = "Du forsvarer murene!";
    } else {
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
            siege.phase = 'THRONE';
            localResult.message = "GARNISONSSJEFEN ER BESEIRET! Mot Tronsalen!";
        }

        return true;
    }

    return false;
};
