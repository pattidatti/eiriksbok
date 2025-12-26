import { ref, runTransaction } from 'firebase/database';
import { db } from '../../lib/firebase';
import type { SimulationPlayer, Role } from './types';

export const ACTION_COSTS = {
    WORK: { manpower: 1 },
    CHOP: { manpower: 1 },
    STEAL: { manpower: 2, gold: 0 },
};

export const REWARDS = {
    WORK: { grain: 10, xp: 5 },
    CHOP: { wood: 5, xp: 5 },
};

export const performAction = async (pin: string, playerId: string, action: 'WORK' | 'CHOP') => {
    const playerRef = ref(db, `simulation_rooms/${pin}/players/${playerId}`);

    try {
        await runTransaction(playerRef, (player: SimulationPlayer | null) => {
            if (!player) return null;

            // Check Costs (if we add stamina/manpower later)
            // if (player.resources.manpower < ACTION_COSTS[action].manpower) return; // Abort

            // Apply Rewards
            if (action === 'WORK') {
                player.resources.grain = (player.resources.grain || 0) + REWARDS.WORK.grain;
                player.stats.xp = (player.stats.xp || 0) + REWARDS.WORK.xp;
            } else if (action === 'CHOP') {
                player.resources.wood = (player.resources.wood || 0) + REWARDS.CHOP.wood;
                player.stats.xp = (player.stats.xp || 0) + REWARDS.CHOP.xp;
            }

            player.lastActive = Date.now();
            return player;
        });
        return { success: true };
    } catch (e) {
        console.error("Action failed", e);
        return { success: false, error: e };
    }
};
