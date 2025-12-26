import type { SimulationPlayer } from './types';
import { INITIAL_RESOURCES } from './constants';

export const assignRoles = (players: Record<string, SimulationPlayer>): Record<string, SimulationPlayer> => {
    const playerIds = Object.keys(players);
    const shuffledIds = [...playerIds].sort(() => Math.random() - 0.5);
    const updatedPlayers = { ...players };
    const totalPlayers = playerIds.length;

    if (totalPlayers === 0) return updatedPlayers;

    // 1. Assign King
    const kingId = shuffledIds.shift();
    if (kingId) {
        updatedPlayers[kingId] = {
            ...updatedPlayers[kingId],
            role: 'KING',
            resources: INITIAL_RESOURCES.KING,
            regionId: 'capital',
            status: { hp: 100, stamina: 100, morale: 100, legitimacy: 100, authority: 100, loyalty: 100, isJailed: false, isFrozen: false },
            stats: { level: 1, xp: 0, reputation: 50, contribution: 0 },
            equipment: {
                tools: { id: 'tools', durability: 100, maxDurability: 100 },
                weapon: { id: 'weapon', durability: 100, maxDurability: 100 },
                armor: { id: 'armor', durability: 100, maxDurability: 100 }
            }
        };
    }

    // 2. Assign Barons (Max 2, force creation if players available)
    const baronIds: string[] = [];
    const maxBarons = 2;
    // We want to force 2 barons if we have enough players (e.g. King + 2 Barons = 3 players)
    // If we only have 2 players total: 1 King, 1 Baron.
    const potentialBarons = Math.min(maxBarons, shuffledIds.length);

    for (let i = 0; i < potentialBarons; i++) {
        const baronId = shuffledIds.shift();
        if (baronId) {
            baronIds.push(baronId);
            updatedPlayers[baronId] = {
                ...updatedPlayers[baronId],
                role: 'BARON',
                resources: INITIAL_RESOURCES.BARON,
                regionId: `region_baron_${i}`,
                status: { hp: 100, stamina: 100, morale: 100, legitimacy: 80, authority: 50, loyalty: 100, isJailed: false, isFrozen: false },
                stats: { level: 1, xp: 0, reputation: 40, contribution: 0 },
                equipment: {
                    tools: { id: 'tools', durability: 100, maxDurability: 100 },
                    weapon: { id: 'weapon', durability: 100, maxDurability: 100 },
                    armor: { id: 'armor', durability: 100, maxDurability: 100 }
                }
            };
        }
    }

    // Helper to distribute remaining players to regions
    let regionIndex = 0;
    const getNextRegionId = () => {
        if (baronIds.length === 0) return 'capital';
        const id = `region_baron_${regionIndex}`;
        regionIndex = (regionIndex + 1) % baronIds.length;
        return id;
    };

    // 3. Assign Remaining Roles
    // remaining players in shuffledIds
    const remainingCount = shuffledIds.length;

    // Config: 
    // If < 4 remaining: All Peasants
    // If >= 4 remaining: 1 Merchant, 1 Soldier, rest Peasants
    // If large scale, use ratios. For now, prioritize filling roles.

    let merchantCount = 0;
    let soldierCount = 0;

    if (remainingCount >= 4) {
        merchantCount = Math.max(1, Math.floor(remainingCount / 6));
        soldierCount = Math.max(1, Math.floor(remainingCount / 5));
    } else if (remainingCount > 0 && remainingCount < 4) {
        // Tiny game: maybe just peasants
        merchantCount = 0;
        soldierCount = 0;
    }

    // Assign Merchants
    for (let i = 0; i < merchantCount; i++) {
        const id = shuffledIds.shift();
        if (id) {
            updatedPlayers[id] = {
                ...updatedPlayers[id],
                role: 'MERCHANT',
                resources: INITIAL_RESOURCES.MERCHANT,
                regionId: 'marketplace', // Merchants live in the marketplace/capital technically or travel
                status: { hp: 100, stamina: 100, morale: 100, legitimacy: 100, authority: 30, loyalty: 100, isJailed: false, isFrozen: false },
                stats: { level: 1, xp: 0, reputation: 30, contribution: 0 },
                equipment: {
                    tools: { id: 'tools', durability: 100, maxDurability: 100 },
                    weapon: { id: 'weapon', durability: 100, maxDurability: 100 },
                    armor: { id: 'armor', durability: 100, maxDurability: 100 }
                }
            };
        }
    }

    // Assign Soldiers
    for (let i = 0; i < soldierCount; i++) {
        const id = shuffledIds.shift();
        if (id) {
            updatedPlayers[id] = {
                ...updatedPlayers[id],
                role: 'SOLDIER',
                resources: INITIAL_RESOURCES.SOLDIER,
                regionId: getNextRegionId(), // Assigned to a baron
                status: { hp: 100, stamina: 100, morale: 100, legitimacy: 100, authority: 50, loyalty: 100, isJailed: false, isFrozen: false },
                stats: { level: 1, xp: 0, reputation: 20, contribution: 0 },
                equipment: {
                    tools: { id: 'tools', durability: 100, maxDurability: 100 },
                    weapon: { id: 'weapon', durability: 100, maxDurability: 100 },
                    armor: { id: 'armor', durability: 100, maxDurability: 100 }
                }
            };
        }
    }

    // Assign Peasants (Everyone else)
    while (shuffledIds.length > 0) {
        const id = shuffledIds.shift();
        if (id) {
            updatedPlayers[id] = {
                ...updatedPlayers[id],
                role: 'PEASANT',
                resources: INITIAL_RESOURCES.PEASANT,
                regionId: getNextRegionId(), // Assigned to a baron
                status: { hp: 100, stamina: 100, morale: 80, legitimacy: 100, authority: 10, loyalty: 100, isJailed: false, isFrozen: false },
                stats: { level: 1, xp: 0, reputation: 10, contribution: 0 },
                equipment: {
                    tools: { id: 'tools', durability: 100, maxDurability: 100 },
                    weapon: { id: 'weapon', durability: 100, maxDurability: 100 },
                    armor: { id: 'armor', durability: 100, maxDurability: 100 }
                }
            };
        }
    }

    return updatedPlayers;
};

export const collectTaxes = (
    players: Record<string, SimulationPlayer>,
    kingTaxRate: number
): { updatedPlayers: Record<string, SimulationPlayer>, results: string[] } => {

    const updatedPlayers = { ...players };
    const results: string[] = [];

    // 1. Peasants pay to Barons
    Object.values(updatedPlayers).forEach(p => {
        if (p.role === 'PEASANT') {
            const baronTaxRate = 15; // default or from settings
            const grainTax = Math.ceil((p.resources.grain || 0) * (baronTaxRate / 100));
            const goldTax = Math.ceil((p.resources.gold || 0) * (baronTaxRate / 100));

            if (grainTax > 0 || goldTax > 0) {
                // Find the Baron for this region (with TEST fallback)
                const baron = Object.values(updatedPlayers).find(b =>
                    b.role === 'BARON' && (b.regionId === p.regionId || (p.regionId === 'test_region' && b.regionId === 'test_region'))
                );

                if (baron) {
                    p.resources.grain = Math.max(0, p.resources.grain - grainTax);
                    p.resources.gold = Math.max(0, p.resources.gold - goldTax);

                    updatedPlayers[baron.id].resources.grain += grainTax;
                    updatedPlayers[baron.id].resources.gold += goldTax;

                    results.push(`${p.name} betalte ${grainTax} korn og ${goldTax} gull i skatt til ${baron.name}`);
                }
            }
        }

    });

    // 2. Barons pay to King
    Object.values(updatedPlayers).forEach(p => {
        if (p.role === 'BARON') {
            const grainTax = Math.ceil((p.resources.grain || 0) * (kingTaxRate / 100));
            const goldTax = Math.ceil((p.resources.gold || 0) * (kingTaxRate / 100));

            if (grainTax > 0 || goldTax > 0) {
                const king = Object.values(updatedPlayers).find(k => k.role === 'KING');
                if (king) {
                    p.resources.grain = Math.max(0, p.resources.grain - grainTax);
                    p.resources.gold = Math.max(0, p.resources.gold - goldTax);

                    updatedPlayers[king.id].resources.grain += grainTax;
                    updatedPlayers[king.id].resources.gold += goldTax;

                    results.push(`${p.name} betalte ${grainTax} korn og ${goldTax} gull i skatt til Kongen`);
                }
            }
        }

    });

    // 3. Merchants and Soldiers pay to King
    Object.values(updatedPlayers).forEach(p => {
        if (p.role === 'MERCHANT' || p.role === 'SOLDIER') {
            const taxRate = p.role === 'MERCHANT' ? (kingTaxRate / 50) : (kingTaxRate / 100);
            const goldTax = Math.ceil((p.resources.gold || 0) * taxRate);

            if (goldTax > 0) {
                const king = Object.values(updatedPlayers).find(k => k.role === 'KING');
                if (king) {
                    p.resources.gold = Math.max(0, p.resources.gold - goldTax);
                    updatedPlayers[king.id].resources.gold += goldTax;
                    results.push(`${p.name} (${p.role}) betalte ${goldTax} gull i skatt til Kongen`);
                }
            }
        }
    });

    return { updatedPlayers, results };
};

