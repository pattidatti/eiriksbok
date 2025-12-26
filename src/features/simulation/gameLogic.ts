import type { SimulationPlayer } from './types';
import { INITIAL_RESOURCES } from './constants';

export const assignRoles = (players: Record<string, SimulationPlayer>): Record<string, SimulationPlayer> => {
    const playerIds = Object.keys(players);
    const shuffledIds = [...playerIds].sort(() => Math.random() - 0.5);
    const updatedPlayers = { ...players };

    const totalPlayers = playerIds.length;

    // Config (can be moved to settings later)
    // 1 Baron per 5-10 peasants? Let's say 1 Baron per 5 players, min 1 if > 3 players 
    let BARON_COUNT = Math.max(0, Math.floor((totalPlayers - 1) / 5));
    if (totalPlayers >= 3 && BARON_COUNT === 0) BARON_COUNT = 1;

    // 1. Assign King
    const kingId = shuffledIds[0];
    if (kingId) {
        updatedPlayers[kingId] = {
            ...updatedPlayers[kingId],
            role: 'KING',
            resources: INITIAL_RESOURCES.KING,
            regionId: 'capital'
        };
    }

    // 2. Assign Barons
    const baronIds = shuffledIds.slice(1, 1 + BARON_COUNT);
    baronIds.forEach((id, index) => {
        updatedPlayers[id] = {
            ...updatedPlayers[id],
            role: 'BARON',
            resources: INITIAL_RESOURCES.BARON,
            regionId: `region_baron_${index}`
        };
    });

    let nextIndex = 1 + BARON_COUNT;

    // 3. Assign Merchants (1 per 6, min 1 if > 4 players)
    let MERCHANT_COUNT = Math.floor(totalPlayers / 6);
    if (totalPlayers >= 5 && MERCHANT_COUNT === 0) MERCHANT_COUNT = 1;
    const merchantIds = shuffledIds.slice(nextIndex, nextIndex + MERCHANT_COUNT);
    merchantIds.forEach(id => {
        updatedPlayers[id] = {
            ...updatedPlayers[id],
            role: 'MERCHANT',
            resources: INITIAL_RESOURCES.MERCHANT,
            regionId: 'marketplace'
        };
    });
    nextIndex += MERCHANT_COUNT;

    // 4. Assign Soldiers (1 per 5)
    let SOLDIER_COUNT = Math.floor(totalPlayers / 5);
    const soldierIds = shuffledIds.slice(nextIndex, nextIndex + SOLDIER_COUNT);
    soldierIds.forEach(id => {
        const rulerIds = baronIds.length > 0 ? baronIds : [kingId];
        const randomRuler = rulerIds[Math.floor(Math.random() * rulerIds.length)];
        updatedPlayers[id] = {
            ...updatedPlayers[id],
            role: 'SOLDIER',
            resources: INITIAL_RESOURCES.SOLDIER,
            regionId: updatedPlayers[randomRuler].regionId
        };
    });
    nextIndex += SOLDIER_COUNT;

    // 5. Assign Peasants (Rest)
    const peasantIds = shuffledIds.slice(nextIndex);
    peasantIds.forEach(id => {
        const rulerIds = baronIds.length > 0 ? baronIds : [kingId];
        const randomRuler = rulerIds[Math.floor(Math.random() * rulerIds.length)];
        updatedPlayers[id] = {
            ...updatedPlayers[id],
            role: 'PEASANT',
            resources: INITIAL_RESOURCES.PEASANT,
            regionId: updatedPlayers[randomRuler].regionId
        };
    });

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

