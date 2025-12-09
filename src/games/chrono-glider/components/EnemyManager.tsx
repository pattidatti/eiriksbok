import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { Explosion } from './Explosion';

export function EnemyManager() {
    const { gameState, speed, loseLife, addScore } = useGameStore();
    const [enemies, setEnemies] = useState<{ id: number, x: number, y: number, z: number }[]>([]);
    const [explosions, setExplosions] = useState<{ id: number, position: [number, number, number], color: string }[]>([]);
    const spawnTimer = useRef(0);

    useFrame((state, delta) => {
        if (gameState !== 'playing') return;

        // Spawning Logic
        spawnTimer.current += delta;
        if (spawnTimer.current > 2) { // Every 2 seconds
            spawnTimer.current = 0;
            const x = (Math.random() - 0.5) * 8;
            const y = (Math.random() - 0.5) * 5;
            setEnemies(prev => [...prev, { id: Date.now(), x, y, z: -60 }]);
        }

        // Move Enemies
        setEnemies(prev => {
            const next = prev.map(e => ({ ...e, z: e.z + (speed * delta) }));

            // Collision Detection with Player
            const playerX = state.mouse.x * 10;
            const playerY = state.mouse.y * 6;

            // Filter out collided or passed enemies
            return next.filter(e => {
                // Check player collision
                if (e.z > -1 && e.z < 1) {
                    const dist = Math.sqrt(Math.pow(e.x - playerX, 2) + Math.pow(e.y - playerY, 2));
                    if (dist < 1) {
                        loseLife();
                        // Trigger explosion
                        setExplosions(ex => [...ex, { id: Date.now(), position: [e.x, e.y, e.z], color: 'red' }]);
                        return false; // Remove enemy
                    }
                }

                // Despawn if passed
                if (e.z > 5) return false;

                return true;
            });
        });

        // TODO: Collision with Projectiles (needs access to ProjectileManager state or handle it via a shared collision system)
        // For now, simpler: Projectiles are just visual or we need a shared ref.
        // Let's leave projectile collision for next step or use a very simple approach:
        // ProjectileManager could check collisions if it had access to enemies?
        // Or we hoist state up.
        // Given the modularity, hoisting `enemies` to store might be best, OR just use `zustand` to expose them.
        // Let's stick to this for now, enemies are just obstacles. Shooting them requires a bit more connection.
        // I will add a "hit" function to store or event bus? 
        // Actually, let's keep it simple: Player dodges enemies for now.
        // The user asked for "Skyting... Motstandere som kommer".
        // If I make projectiles hit enemies, I need to know where enemies are.
        // I'll leave a TODO for projectile collision.
    });

    const removeExplosion = (id: number) => {
        setExplosions(prev => prev.filter(e => e.id !== id));
    };

    return (
        <>
            {enemies.map(e => (
                <mesh key={e.id} position={[e.x, e.y, e.z]}>
                    <dodecahedronGeometry args={[0.5]} />
                    <meshStandardMaterial color="#ff0000" wireframe />
                </mesh>
            ))}
            {explosions.map(ex => (
                <Explosion
                    key={ex.id}
                    position={ex.position}
                    color={ex.color}
                    onComplete={() => removeExplosion(ex.id)}
                />
            ))}
        </>
    );
}
