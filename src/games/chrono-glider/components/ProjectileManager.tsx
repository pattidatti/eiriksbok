import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';

export function ProjectileManager() {
    const { gameState, lastFired, speed } = useGameStore();
    const projectilesRef = useRef<{ id: number; mesh: THREE.Mesh; velocity: THREE.Vector3 }[]>([]);
    const groupRef = useRef<THREE.Group>(null);
    const [lastFiredTime, setLastFiredTime] = useState(0);

    // Sync with store trigger
    useEffect(() => {
        if (lastFired > lastFiredTime) {
            setLastFiredTime(lastFired);
            spawnProjectile();
        }
    }, [lastFired, lastFiredTime]);

    const spawnProjectile = () => {
        if (!groupRef.current) return;

        // We need player position. Since Glider is separate, we can hack it by query or valid state store position.
        // Or simpler: Glider updates a ref in store? No, avoiding too many renders.
        // Let's assume Glider is at mouse position roughly.
        // In Glider.tsx we use: targetX = state.mouse.x * 10;
        // Ideally we pass player position to store, but that's heavy.
        // Let's cheat: Read mouse pos from state directly here as start pos.

        // But we need to do this inside useFrame to get state.mouse? No, we can access strict state via hooks if needed, 
        // OR we just spawn it at 0,0,0 and let useFrame move it to mouse pos on first frame?
        // Better: ProjectileManager shouldn't spawn instantly on effect, but trigger a "pending spawn" flag 
        // that useFrame consumes to get accurate mouse pos.

        // Actually, let's just use a ref in store for playerPosition if we care about precision,
        // or just re-calculate mouse pos here (it's global state in R3F).
    };

    // We'll use a local state array for rendering, but manage logic in ref to avoid re-renders
    const [projectiles, setProjectiles] = useState<{ id: number, x: number, y: number, z: number }[]>([]);

    useFrame((state, delta) => {
        if (gameState !== 'playing') return;

        // Check for new spawn request from effect (via timestamp diff)
        // Actually, we can just detect store change here?
        // Let's stick to the Effect setting a flag or verify timestamp.
        if (lastFired > lastFiredTime) {
            setLastFiredTime(lastFired); // Update local tracker
            const playerX = state.mouse.x * 10;
            const playerY = state.mouse.y * 6;

            setProjectiles(prev => [...prev, {
                id: Date.now(),
                x: playerX,
                y: playerY,
                z: 0
            }]);
        }

        setProjectiles(prev => prev
            .map(p => ({ ...p, z: p.z - (speed * 2 * delta) - (20 * delta) })) // Move faster than glier/world
            .filter(p => p.z > -100) // Despawn far away
        );
    });

    return (
        <group ref={groupRef}>
            {projectiles.map(p => (
                <mesh key={p.id} position={[p.x, p.y, p.z]}>
                    <sphereGeometry args={[0.2, 8, 8]} />
                    <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={2} />
                </mesh>
            ))}
        </group>
    );
}
