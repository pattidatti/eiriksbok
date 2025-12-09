import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ExplosionProps {
    position: [number, number, number];
    color?: string;
    onComplete?: () => void;
}

export function Explosion({ position, color = 'orange', onComplete }: ExplosionProps) {
    const group = useRef<THREE.Group>(null);
    const [particles] = useState(() => {
        return new Array(20).fill(0).map(() => ({
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            ),
            scale: Math.random() * 0.5 + 0.2,
            life: 1.0
        }));
    });

    useFrame((_, delta) => {
        if (!group.current) return;

        let alive = false;

        group.current.children.forEach((child, i) => {
            const particle = particles[i];
            if (particle.life > 0) {
                alive = true;
                particle.life -= delta * 2; // Fade out speed

                child.position.add(particle.velocity.clone().multiplyScalar(delta));
                child.scale.setScalar(particle.scale * particle.life);

                const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (material) material.opacity = particle.life;

                child.rotation.x += delta * 2;
                child.rotation.y += delta * 2;
            } else {
                child.visible = false;
            }
        });

        if (!alive && onComplete) {
            onComplete();
        }
    });

    return (
        <group ref={group} position={position}>
            {particles.map((_, i) => (
                <mesh key={i}>
                    <boxGeometry args={[0.2, 0.2, 0.2]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={2}
                        transparent
                    />
                </mesh>
            ))}
        </group>
    );
}
