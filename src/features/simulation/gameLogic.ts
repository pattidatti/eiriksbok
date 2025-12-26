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

    // Assign King
    const kingId = shuffledIds[0];
    if (kingId) {
        updatedPlayers[kingId] = {
            ...updatedPlayers[kingId],
            role: 'KING',
            resources: INITIAL_RESOURCES.KING,
            regionId: 'capital'
        };
    }

    // Assign Barons
    const baronIds = shuffledIds.slice(1, 1 + BARON_COUNT);
    baronIds.forEach((id, index) => {
        updatedPlayers[id] = {
            ...updatedPlayers[id],
            role: 'BARON',
            resources: INITIAL_RESOURCES.BARON,
            regionId: `region_baron_${index}`
        };
    });

    // Assign Peasants (Rest)
    const peasantIds = shuffledIds.slice(1 + BARON_COUNT);
    peasantIds.forEach(id => {
        // Assign peasant to a random Baron or King if no barons
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
