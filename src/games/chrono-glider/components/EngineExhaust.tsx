import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';

interface Particle {
    x: number;
    y: number;
    z: number;
    life: number;
    maxLife: number;
    scale: number;
    velocityZ: number;
}

export function EngineExhaust({ shipRef }: { shipRef: React.MutableRefObject<THREE.Group | null> }) {
    const { gameState, isBoosting } = useGameStore();
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const particles = useRef<Particle[]>([]);

    // Create dummy object for positioning instances
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((_, delta) => {
        if (!meshRef.current || !shipRef.current) return;

        // Spawn new particles
        if (gameState === 'playing') {
            const spawnRate = isBoosting ? 4 : 2; // Particles per frame

            for (let i = 0; i < spawnRate; i++) {
                // Offset slightly from center
                const offset = 0.2;
                particles.current.push({
                    x: shipRef.current.position.x + (Math.random() - 0.5) * offset,
                    y: shipRef.current.position.y + (Math.random() - 0.5) * offset,
                    z: shipRef.current.position.z + 0.5, // Behind ship? Ship looks at -Z? 
                    // Wait, in this game, we fly into screen? No, tunnel moves +Z, we are static.
                    // Actually Tunnel moves +Z, so world moves towards camera?
                    // "gridRef.current.position.z += speed * delta;"
                    // If grid moves +Z, and camera is static, it looks like we move -Z.
                    // So particles should move +Z (towards camera) to look like trail.

                    life: 0,
                    maxLife: Math.random() * 0.5 + 0.2, // Short life
                    scale: Math.random() * 0.3 + 0.1,
                    velocityZ: (Math.random() * 5) + 2 // Speed relative to ship
                });
            }
        }

        // Update particles
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i];
            p.life += delta;
            p.z += p.velocityZ * delta; // Move towards camera (trail)

            if (p.life >= p.maxLife) {
                particles.current.splice(i, 1);
            }
        }

        // Update Instance Mesh
        meshRef.current.count = particles.current.length;
        particles.current.forEach((p, i) => {
            const alpha = 1 - p.life / p.maxLife;
            dummy.position.set(p.x, p.y, p.z);
            dummy.scale.setScalar(p.scale * alpha);
            dummy.rotation.z = Math.random() * Math.PI;
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 200]}>
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial
                color={isBoosting ? "#ffaa00" : "#00ffff"}
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </instancedMesh>
    );
}
