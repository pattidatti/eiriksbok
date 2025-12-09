import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { Explosion } from './Explosion';

type ObjectType = 'obstacle' | 'powerup_health' | 'powerup_shield';

interface GameObject {
    id: number;
    type: ObjectType;
    x: number;
    y: number;
    z: number;
    rotationSpeed: number;
}

export function ObjectManager() {
    const { gameState, speed, loseLife, lives, addScore } = useGameStore();
    const [objects, setObjects] = useState<GameObject[]>([]);
    const [explosions, setExplosions] = useState<{ id: number, position: [number, number, number], color: string }[]>([]);
    const spawnTimer = useRef(0);

    useFrame((state, delta) => {
        if (gameState !== 'playing') return;

        // Spawning Logic
        spawnTimer.current += delta;
        if (spawnTimer.current > 1.5) { // Every 1.5 seconds
            spawnTimer.current = 0;
            const x = (Math.random() - 0.5) * 8;
            const y = (Math.random() - 0.5) * 5;

            // Random type: 70% Obstacle, 30% Powerup
            const rand = Math.random();
            let type: ObjectType = 'obstacle';
            if (rand > 0.8) type = 'powerup_health';

            setObjects(prev => [...prev, {
                id: Date.now(),
                type,
                x, y,
                z: -60,
                rotationSpeed: Math.random() - 0.5
            }]);
        }

        // update objects
        setObjects(prev => {
            const next = prev.map(o => ({ ...o, z: o.z + (speed * delta) }));
            const playerX = state.mouse.x * 10;
            const playerY = state.mouse.y * 6;

            return next.filter(o => {
                // Collision
                if (o.z > -1 && o.z < 1) {
                    const dist = Math.sqrt(Math.pow(o.x - playerX, 2) + Math.pow(o.y - playerY, 2));
                    if (dist < 1) {
                        if (o.type === 'obstacle') {
                            loseLife();
                            setExplosions(ex => [...ex, { id: Date.now(), position: [o.x, o.y, o.z], color: 'gray' }]);
                        } else if (o.type === 'powerup_health') {
                            // Add life logic? store doesn't have gainLife yet, but we can just ignore or add score for now
                            // Or better: Implement gainLife in store. For now just score + special effect.
                            addScore(500);
                            setExplosions(ex => [...ex, { id: Date.now(), position: [o.x, o.y, o.z], color: 'green' }]);
                        }
                        return false;
                    }
                }
                if (o.z > 5) return false;
                return true;
            });
        });
    });

    const removeExplosion = (id: number) => {
        setExplosions(prev => prev.filter(e => e.id !== id));
    };

    return (
        <>
            {objects.map(o => (
                <mesh key={o.id} position={[o.x, o.y, o.z]}>
                    {o.type === 'obstacle' ? (
                        <dodecahedronGeometry args={[0.5]} />
                    ) : (
                        <boxGeometry args={[0.4, 0.4, 0.4]} />
                    )}
                    <meshStandardMaterial
                        color={o.type === 'obstacle' ? 'gray' : 'lime'}
                        wireframe={o.type === 'obstacle'}
                        emissive={o.type === 'powerup_health' ? 'lime' : 'black'}
                        emissiveIntensity={o.type === 'powerup_health' ? 1 : 0}
                    />
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
