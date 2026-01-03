import type { ActionContext } from '../actionTypes';
// import type { ActiveSiege } from '../../simulationTypes';

// const SIEGE_TICK_MS = 1000;
const GATE_MAX_HP = 5000;
const BREACH_DAMAGE = 10;
// const ARROW_VOLLEY_CHANCE = 0.1; // Reserved for Tick Logic

// --- HANDLERS ---

export const handleStartSiege = (ctx: ActionContext) => {
    const { actor, room, localResult, action } = ctx;

    // Validations
    const regionId = action.payload?.targetRegionId || actor.regionId;
    if (!regionId || regionId === 'capital' || regionId === 'unassigned') {
        localResult.success = false;
        localResult.message = "Du må angi en gyldig region for å starte beleiring.";
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
    const { actor, room, localResult, action } = ctx;
    const regionId = action.payload?.targetRegionId || actor.regionId;
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

    const regionId = action.payload?.targetRegionId || actor.regionId;
    if (!regionId || !room.regions[regionId]?.activeSiege) {
        localResult.success = false;
        localResult.message = "Ingen aktiv beleiring funnet i dette området.";
        return false;
    }

    const siege = room.regions[regionId].activeSiege as any; // Cast for custom props
    const attackers = siege.attackers || {};
    const defenders = siege.defenders || {};
    const participant = (attackers[actor.id] || defenders[actor.id]) as any;
    if (!participant) {
        localResult.message = "Du må være deltaker i beleiringen (angriper eller forsvarer) for å delta i kappløpet.";
        return false;
    }

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

            const occupiers: any = {};
            if (isOnline && defenderId && defender) {
                occupiers[defenderId] = {
                    id: defenderId,
                    name: defender.name,
                    armor: 100, // Home ground advantage/Palace guard armor
                    progress: 20, // Start with a head start for being the owner
                    joinedAt: Date.now()
                };
            }

            siege.throne = {
                mode: isOnline ? 'PVP' : 'PVE',
                occupation: 0,
                plundered: false,
                bossHp: isOnline ? (defender?.status?.hp || 100) * 5 : 5000, // PvP Baron has 5x HP, PvE Steward has 5k
                maxBossHp: isOnline ? (defender?.status?.hp || 100) * 5 : 5000,
                defendingPlayerId: defenderId,
                occupiers: occupiers
            };

            localResult.message = "GARNISONSSJEFEN ER BESEIRET! Dørene til Tronsalen slås opp!";
        }

        return true;
    }

    // --- PHASE 3: THRONE ROOM (Death Race) ---
    if (siege.phase === 'THRONE_ROOM' || (siege.phase as string) === 'THRONE') {
        let t = siege.throne;

        // Init Schema for Race
        if (!t || !t.occupiers) {
            t = t || {};
            t.occupiers = t.occupiers || {};
            t.lastTick = Date.now();
            siege.throne = t;
        }

        // --- TICK LOGIC (Global Loop) ---
        // Iterate ALL occupiers
        const now = Date.now();
        if (now - (t.lastTick || 0) > 1000) {
            const deltaSeconds = Math.floor((now - (t.lastTick || 0)) / 1000);
            t.lastTick = now;

            const occupiersList = Object.values(t.occupiers || {});
            occupiersList.forEach((occ: any) => {
                // 1. DRAIN ARMOR
                occ.armor = Math.max(0, occ.armor - (1 * deltaSeconds));

                // 2. INCREASE PROGRESS
                const part = (attackers[occ.id] || defenders[occ.id]);
                const dmgDealt = part?.stats?.damageDealt || 0;
                const momentum = 1 + (dmgDealt / 200);

                const progressGain = (1 * momentum * deltaSeconds);
                occ.progress = Math.min(100, occ.progress + progressGain);

                // 3. TRACK STATS
                if (part) {
                    part.stats = part.stats || { damageDealt: 0, damageTaken: 0, armorDonated: 0, ticksOnThrone: 0 };
                    part.stats.ticksOnThrone += deltaSeconds;
                }

                // 4. CHECK FAILURE (Ejection)
                if (occ.armor <= 0) {
                    delete t.occupiers[occ.id];
                    localResult.message = `${occ.name} falt fra tronen! (0 Beleiringsrustning)`;
                } else if (occ.progress >= 100) {
                    delete room.regions[regionId].activeSiege;
                    const region = room.regions[regionId];
                    const isDefenderWin = occ.id === region.rulerId;

                    if (isDefenderWin) {
                        localResult.message = `🛡️ ${occ.name} har knust opprøret og gjenopprettet kontroll over ${region.name}!`;
                    } else {
                        localResult.message = `👑 ${occ.name} har vunnet kappeløpet og TATT TRONEN med makt!`;
                        // Signal direct takeover to the transaction handler
                        (localResult as any).siegeWinnerId = occ.id;
                        (localResult as any).targetRegionId = regionId;
                    }
                }
            });
        }

        // --- ACTIONS ---

        // 1. JOIN RACE (Claim)
        if (action.subType === 'CLAIM_THRONE') {
            // JOIN
            if (!t.occupiers) t.occupiers = {};
            const initialArmor = 10;
            const armor = actor.resources.armor || 0;
            if (armor < initialArmor) {
                localResult.message = `Mangler Beleiringsrustning! Du har ${armor}, men trenger ${initialArmor}.`;
                return false;
            }

            // TAKE ALL ARMOR (Death Race)
            actor.resources.armor = 0;

            t.occupiers[actor.id] = {
                id: actor.id,
                name: actor.name,
                armor: armor, // Use all available armor
                progress: 0, // Everyone starts at 0
                joinedAt: Date.now()
            };

            localResult.message = `${actor.name} kastet seg inn i kampen om tronen med ${armor} rustning!`;
            return true;
        }

        // 2. DONATE ARMOR (Targeted)
        if (action.subType === 'DONATE_ARMOR') {
            const targetId = action.payload?.targetId;
            const target = t.occupiers[targetId];
            if (!target) {
                localResult.message = "Ugyldig mål.";
                return false;
            }

            const myArmor = actor.resources.armor || 0;
            if (myArmor < 1) {
                localResult.message = "Du har ingen beleiringsrustning å gi!";
                return false;
            }

            actor.resources.armor = myArmor - 1;
            target.armor += 1;

            // Stats
            participant.stats = participant.stats || { damageDealt: 0, damageTaken: 0, armorDonated: 0, ticksOnThrone: 0 };
            participant.stats.armorDonated += 1;
            localResult.message = `Donerte rustning til ${target.name}`;
            return true;
        }

        // 3. SUNDER ARMOR (Targeted)
        if (action.subType === 'SUNDER_ARMOR') {
            const targetId = action.payload?.targetId;
            const target = t.occupiers[targetId];
            if (!target) {
                localResult.success = false;
                localResult.message = "Ingen på tronen å angripe!";
                return false;
            }

            target.armor = Math.max(0, target.armor - 1);

            // Stats
            participant.stats = participant.stats || { damageDealt: 0, damageTaken: 0, armorDonated: 0, ticksOnThrone: 0 };
            participant.stats.damageDealt += 1;
            localResult.message = `Angrep ${target.name} på tronen!`;
            return true;
        }

        if (action.subType === 'TICK') return true;

        return true;
    }

    return false;
};
