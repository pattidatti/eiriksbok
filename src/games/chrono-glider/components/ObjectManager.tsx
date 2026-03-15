import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { Explosion } from './Explosion';
import * as THREE from 'three';

type ObjectType = 'obstacle' | 'powerup_health' | 'powerup_shield';

interface GameObject {
    id: number;
    type: ObjectType;
    x: number;
    y: number;
    z: number;
    rotationSpeed: number;
}

export function ObjectManager({ projectilesRef }: { projectilesRef: React.MutableRefObject<{ id: number, x: number, y: number, z: number, life: number }[]> }) {
    const { gameState, speed, loseLife, gainLife, addScore } = useGameStore();
    const [objects, setObjects] = useState<GameObject[]>([]);
    const [explosions, setExplosions] = useState<{ id: number, position: [number, number, number], color: string }[]>([]);
    const spawnTimer = useRef(0);

    // Geometry Pre-creation
    const obstacleGeom = useMemo(() => new THREE.DodecahedronGeometry(0.5), []);
    // Heart Shape for Health
    const heartShape = useMemo(() => {
        const x = 0, y = 0;
        const heartShape = new THREE.Shape();
        heartShape.moveTo(x + 0.25, y + 0.25);
        heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.20, y, x, y);
        heartShape.bezierCurveTo(x - 0.30, y, x - 0.30, y + 0.35, x - 0.30, y + 0.35);
        heartShape.bezierCurveTo(x - 0.30, y + 0.55, x - 0.10, y + 0.77, x + 0.25, y + 0.95);
        heartShape.bezierCurveTo(x + 0.60, y + 0.77, x + 0.80, y + 0.55, x + 0.80, y + 0.35);
        heartShape.bezierCurveTo(x + 0.80, y + 0.35, x + 0.80, y, x + 0.50, y);
        heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
        return new THREE.ExtrudeGeometry(heartShape, { depth: 0.1, bevelEnabled: false });
    }, []);

    useFrame((state, delta) => {
        if (gameState !== 'playing') return;

        // Spawning Logic
        spawnTimer.current += delta;
        if (spawnTimer.current > 1.5) { // Every 1.5 seconds
            spawnTimer.current = 0;
            const x = (Math.random() - 0.5) * 8;
            const y = (Math.random() - 0.5) * 5;

            // Random type: 85% Obstacle, 15% Powerup
            const rand = Math.random();
            let type: ObjectType = 'obstacle';
            if (rand > 0.85) type = 'powerup_health';

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
                // Projectile-obstacle collision
                if (o.type === 'obstacle') {
                    const projectiles = projectilesRef.current;
                    for (let i = 0; i < projectiles.length; i++) {
                        const p = projectiles[i];
                        const dx = o.x - p.x;
                        const dy = o.y - p.y;
                        const dz = o.z - p.z;
                        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        if (dist < 1.2) {
                            p.life = 999; // Mark projectile for removal
                            addScore(50);
                            setExplosions(ex => [...ex, { id: Date.now(), position: [o.x, o.y, o.z], color: '#ff8800' }]);
                            return false;
                        }
                    }
                }

                // Player collision
                if (o.z > -1 && o.z < 1) {
                    const dist = Math.sqrt(Math.pow(o.x - playerX, 2) + Math.pow(o.y - playerY, 2));
                    if (dist < 1) {
                        if (o.type === 'obstacle') {
                            loseLife();
                            setExplosions(ex => [...ex, { id: Date.now(), position: [o.x, o.y, o.z], color: 'gray' }]);
                        } else if (o.type === 'powerup_health') {
                            gainLife();
                            addScore(500);
                            setExplosions(ex => [...ex, { id: Date.now(), position: [o.x, o.y, o.z], color: '#ff0055' }]);
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
                <group key={o.id} position={[o.x, o.y, o.z]}>
                    <mesh rotation={[o.type === 'powerup_health' ? Math.PI : 0, 0, 0]}> {/* Flip heart if needed */}
                        {o.type === 'obstacle' ? (
                            <primitive object={obstacleGeom} />
                        ) : (
                            // Scale down heart and center it
                            <mesh geometry={heartShape} scale={[0.5, 0.5, 0.5]} position={[-0.2, -0.2, 0]} />
                        )}
                        <meshStandardMaterial
                            color={o.type === 'obstacle' ? 'gray' : '#ff0055'}
                            wireframe={o.type === 'obstacle'}
                            emissive={o.type === 'powerup_health' ? '#ff0055' : 'black'}
                            emissiveIntensity={o.type === 'powerup_health' ? 2 : 0}
                        />
                    </mesh>

                    {/* Add spinning ring for powerup visibility */}
                    {o.type === 'powerup_health' && (
                        <mesh rotation={[0, Date.now() * 0.005, 0]}>
                            <torusGeometry args={[0.6, 0.05, 8, 32]} />
                            <meshBasicMaterial color="#ff0055" />
                        </mesh>
                    )}
                </group>
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
