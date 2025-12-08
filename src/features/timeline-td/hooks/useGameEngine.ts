import { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GAME_PATH } from '../utils/pathUtils';

export const useGameEngine = () => {
    const {
        status,
        enemies,
        towers,
        projectiles,
        spawnEnemy,
        updateEnemyPosition,
        updateProjectile,
        removeEnemy,
        removeProjectile,
        damageEnemy,
        addProjectile,
        updateTower,
        updateLives
    } = useGameStore();

    const requestRef = useRef<number>(undefined);
    const previousTimeRef = useRef<number>(undefined);

    const gameLoop = (time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current; // ms

            // 1. Move Enemies
            if (enemies.length > 0) {
                enemies.forEach(e => {
                    if (e.isFrozen) return;

                    // Speed 1 = 20 points per second
                    const moveAmount = (e.speed * 20) * (deltaTime / 1000);
                    const nextIndex = e.pathIndex + moveAmount;

                    if (nextIndex >= GAME_PATH.length - 1) {
                        removeEnemy(e.id);
                        updateLives(-1);
                    } else {
                        const newPos = GAME_PATH[Math.floor(nextIndex)];
                        updateEnemyPosition(e.id, newPos, nextIndex);
                    }
                });
            }

            // 2. Towers Attack
            towers.forEach(tower => {
                // Check cooldown (cooldown is in seconds)
                if (Date.now() - tower.lastFired < tower.cooldown * 1000) return;

                // Find target
                // Simple logic: First enemy in range
                // Optimization: could spatial hash, but N is small here
                const target = enemies.find(e => {
                    const dx = e.position.x - tower.position.x;
                    const dy = e.position.y - tower.position.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    return dist <= tower.range;
                });

                if (target) {
                    // Fire!
                    updateTower(tower.id, { lastFired: Date.now() });

                    addProjectile({
                        id: Math.random().toString(),
                        targetId: target.id,
                        position: { ...tower.position },
                        speed: 300, // px per second
                        damage: tower.damage,
                        type: tower.type
                    });
                }
            });

            // 3. Move Projectiles
            if (projectiles.length > 0) {
                projectiles.forEach(p => {
                    const target = enemies.find(e => e.id === p.targetId);
                    if (!target) {
                        removeProjectile(p.id);
                        return;
                    }

                    // Move towards target
                    const dx = target.position.x - p.position.x;
                    const dy = target.position.y - p.position.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 10) {
                        // Hit!
                        damageEnemy(target.id, p.damage);
                        removeProjectile(p.id);
                        // TODO: Splash damage if Gutenberg
                    } else {
                        // Normalize and move
                        const moveDist = (p.speed * deltaTime) / 1000;
                        const angle = Math.atan2(dy, dx);
                        const vx = Math.cos(angle) * moveDist;
                        const vy = Math.sin(angle) * moveDist;

                        updateProjectile(p.id, {
                            x: p.position.x + vx,
                            y: p.position.y + vy
                        });
                    }
                });
            }

            // 4. Spawning (Simple Debug Spawn)
            if (Math.random() < 0.005) {
                spawnEnemy({
                    id: Math.random().toString(),
                    type: 'IGNORANCE', // 'Svartedauden' later
                    position: GAME_PATH[0],
                    health: 100,
                    maxHealth: 100,
                    speed: 2 + Math.random(),
                    pathIndex: 0,
                    isFrozen: false
                });
            }
        }
        previousTimeRef.current = time;
        if (status === 'PLAYING') {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    useEffect(() => {
        if (status === 'PLAYING') {
            previousTimeRef.current = undefined; // Reset time so we don't have huge delta on resume
            requestRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [status, enemies, towers, projectiles]);

    return {};
};
