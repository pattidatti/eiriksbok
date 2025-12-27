import { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GAME_PATH } from '../utils/pathUtils';

export const useGameEngine = () => {
    const status = useGameStore(state => state.status);

    const requestRef = useRef<number>(undefined);
    const previousTimeRef = useRef<number>(undefined);

    const gameLoop = (time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current;
            const dtSeconds = deltaTime / 1000;
            const state = useGameStore.getState();

            // 1. Move Enemies
            // Faster speed: Base speed * 1.5 + curve compensation
            if (state.enemies.length > 0) {
                state.enemies.forEach(e => {
                    if (e.isFrozen) return;

                    // Apply Effects
                    let speedMod = 1.0;
                    e.activeEffects.forEach(eff => {
                        if (eff.type === 'SLOW') speedMod *= eff.value;
                    });

                    // Decay Effects (simple time based? store needs to update duration)
                    // For now, let's just use speedMod. The duration logic needs a store action 'updateEffects'
                    // or we handle it here by filtering.
                    // Doing state updates inside loop is expensive.
                    // Let's assume effects are permanent or handled by a separate tick for now to keep it simple,
                    // OR we add logic to remove expired effects in updateParticles or similar.
                    // Actually, let's just apply the mod.

                    // Slowing down enemies. 
                    // Previously 40, reducing to 10 for much slower gameplay.
                    const moveAmount = (e.speed * speedMod * 10) * dtSeconds;
                    const nextIndex = e.pathIndex + moveAmount;

                    if (nextIndex >= GAME_PATH.length - 1) {
                        state.removeEnemy(e.id);
                        state.updateLives(-1);
                    } else {
                        const newPos = GAME_PATH[Math.floor(nextIndex)];
                        state.updateEnemyPosition(e.id, newPos, nextIndex);
                    }
                });
            }

            // 2. Towers Attack
            state.towers.forEach(tower => {
                if (Date.now() - tower.lastFired < tower.cooldown * 1000) return;

                // Targeting
                // Different towers might have different targeting priorities?
                // For now, closest.
                const enemiesInRange = state.enemies.filter(e => {
                    const dx = e.position.x - tower.position.x;
                    const dy = e.position.y - tower.position.y;
                    return (dx * dx + dy * dy) <= (tower.range * tower.range);
                });

                if (enemiesInRange.length === 0) return;

                // Sort by distance (default) or progress? Progress is better for TD.
                // enemiesInRange.sort((a,b) => b.pathIndex - a.pathIndex); 
                const target = enemiesInRange[0];

                if (tower.type === 'TESLA') {
                    // Instant Attack (Chain Lightning)
                    state.updateTower(tower.id, { lastFired: Date.now() });
                    // Chain Logic: Hit target, then find closest to target, etc.
                    // For Phase 3 MVP: Just instant hit single target or small area?
                    // Let's do instant damage to target.
                    state.damageEnemy(target.id, tower.damage);

                    // Visual: Add a "Lightning" particle?
                    state.addParticle({
                        id: Math.random().toString(),
                        text: "⚡",
                        position: target.position,
                        life: 0.5,
                        color: '#6366f1'
                    });

                } else if (tower.type === 'NEWTON') {
                    // Gravity: Apply Slow Effect instantly to target(s)
                    state.updateTower(tower.id, { lastFired: Date.now() });
                    // Projectile? Newton apple? 
                    // Let's use projectile but it applies slow on hit.
                    state.addProjectile({
                        id: Math.random().toString(),
                        targetId: target.id,
                        position: { ...tower.position },
                        speed: 300,
                        damage: tower.damage,
                        type: tower.type
                    });

                } else {
                    // Standard Projectile (Gutenberg, Da Vinci)
                    state.updateTower(tower.id, { lastFired: Date.now() });
                    state.addProjectile({
                        id: Math.random().toString(),
                        targetId: target.id,
                        position: { ...tower.position },
                        speed: tower.type === 'GUTENBERG' ? 600 : 400,
                        damage: tower.damage,
                        type: tower.type
                    });
                }
            });

            state.updateParticles(dtSeconds);
            // 5. Wave Management
            if (state.waveInProgress) {
                state.updateWaveProgress(time);
            }

            // 6. Spawning (Legacy/Debug spawn removed in favor of WaveManager)
            /* 
            if (Math.random() < 0.005) { ... }
            */
        }
        previousTimeRef.current = time;
        if (useGameStore.getState().status === 'PLAYING') {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    useEffect(() => {
        if (status === 'PLAYING') {
            previousTimeRef.current = undefined;
            requestRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [status]);

    return {};
};
