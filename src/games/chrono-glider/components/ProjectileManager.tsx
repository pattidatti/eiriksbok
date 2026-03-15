import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';

export function ProjectileManager({ shipRef, projectilesRef }: { shipRef: React.MutableRefObject<THREE.Group | null>, projectilesRef: React.MutableRefObject<{ id: number, x: number, y: number, z: number, life: number }[]> }) {
    const { gameState, lastFired, speed } = useGameStore();
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const projectiles = projectilesRef;
    const lastFiredTime = useRef(0);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Sync with store trigger
    useEffect(() => {
        if (lastFired > lastFiredTime.current) {
            lastFiredTime.current = lastFired;

            if (shipRef.current) {
                // Determine spawn position (tip of ship)
                // Ship is approx 2 units long, centered. Tip is roughly at +1 Y (if rotated) or check rotation.
                // Glider rotation is [-Math.PI / 2, 0, 0] so it points up/forward?
                // Actually in Glider.tsx: <coneGeometry args={[0.5, 2, 4]} /> rotation={[-Math.PI / 2, 0, 0]}
                // Cone point is at (0, 1, 0) in local space (Y up).
                // Rotated -90 X => Point is at (0, 0, -1) or (0,0,1)?
                // Standard Cone points up Y. Rot -90 X => Points -Z (into screen).
                // Camera is at [0, 2, 10], looking at 0,0,0.
                // Wait, if it points -Z, it points AWAY from camera.
                // So spawn should be at shipRef.position.z - 1?

                // Let's rely on shipRef.position.

                projectiles.current.push({
                    id: Date.now(),
                    x: shipRef.current.position.x,
                    y: shipRef.current.position.y,
                    z: shipRef.current.position.z - 1.5, // Start slightly ahead
                    life: 0
                });
            }
        }
    }, [lastFired, shipRef]);

    useFrame((_, delta) => {
        if (gameState !== 'playing' || !meshRef.current) return;

        // Move projectiles
        for (let i = projectiles.current.length - 1; i >= 0; i--) {
            const p = projectiles.current[i];
            p.life += delta;
            // Move "forward" (away from camera, into the tunnel)
            // Tunnel moves +Z (towards camera).
            // Ship is static.
            // Projectiles should move -Z relative to Ship.
            // But visual speed = speed + projectile_speed.
            // If world moves +Z at Speed, then Projectile moving -Z at P_Speed separates fast.
            p.z -= (speed + 20) * delta;

            if (p.life > 2 || p.z < -100) {
                projectiles.current.splice(i, 1);
            }
        }

        // Update Instance Mesh
        meshRef.current.count = projectiles.current.length;
        projectiles.current.forEach((p, i) => {
            dummy.position.set(p.x, p.y, p.z);
            dummy.scale.setScalar(1);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 50]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
                color="#ffff00"
                emissive="#ffff00"
                emissiveIntensity={3}
                toneMapped={false}
            />
        </instancedMesh>
    );
}
