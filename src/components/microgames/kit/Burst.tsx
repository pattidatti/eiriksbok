import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Partikkel-burst for suksess-feedback (konfetti/gnist/støv). Instansert, så det
// er billig selv med mange partikler. Avfyres når `trigger` endrer seg.
//   <Burst position={[0,1,0]} trigger={winCount} color="#fbbf24" />
interface BurstProps {
    position?: [number, number, number];
    count?: number;
    color?: string;
    // Endre dette tallet (f.eks. en teller) for å avfyre et nytt burst.
    trigger: number;
    spread?: number; // hvor langt partiklene flyr
    life?: number; // levetid i sekunder
    size?: number;
    gravity?: number;
}

interface ParticleState {
    vel: THREE.Vector3[];
    pos: THREE.Vector3[];
    age: Float32Array;
}

export function Burst({
    position = [0, 0, 0],
    count = 26,
    color = '#fbbf24',
    trigger,
    spread = 3,
    life = 1.1,
    size = 0.14,
    gravity = 4,
}: BurstProps) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    // Refs er den tiltenkte muterbare lagringen for et partikkelsystem.
    const dummyRef = useRef<THREE.Object3D | null>(null);
    if (dummyRef.current == null) dummyRef.current = new THREE.Object3D();
    const stateRef = useRef<ParticleState | null>(null);
    if (stateRef.current == null) {
        stateRef.current = {
            vel: Array.from({ length: count }, () => new THREE.Vector3()),
            pos: Array.from({ length: count }, () => new THREE.Vector3()),
            age: new Float32Array(count).fill(life + 1), // start "dead"
        };
    }
    const prevTrigger = useRef(trigger);

    // Avfyr nytt burst når trigger endrer seg.
    useEffect(() => {
        if (trigger === prevTrigger.current) return;
        prevTrigger.current = trigger;
        const s = stateRef.current;
        if (!s) return;
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.5; // mest oppover
            const speed = spread * (0.5 + Math.random() * 0.8);
            s.vel[i].set(
                Math.cos(theta) * Math.sin(phi) * speed,
                Math.cos(phi) * speed + spread * 0.4,
                Math.sin(theta) * Math.sin(phi) * speed
            );
            s.pos[i].set(0, 0, 0);
            s.age[i] = 0;
        }
    }, [trigger, count, spread, life]);

    useFrame((_, dt) => {
        const m = mesh.current;
        const dummy = dummyRef.current;
        const s = stateRef.current;
        if (!m || !dummy || !s) return;
        for (let i = 0; i < count; i++) {
            if (s.age[i] > life) {
                dummy.scale.setScalar(0);
                dummy.position.set(0, -999, 0);
            } else {
                s.age[i] += dt;
                s.vel[i].y -= gravity * dt;
                s.pos[i].addScaledVector(s.vel[i], dt);
                const k = 1 - s.age[i] / life;
                dummy.position.copy(s.pos[i]);
                dummy.scale.setScalar(size * Math.max(0, k));
                dummy.rotation.set(s.age[i] * 6, s.age[i] * 4, 0);
            }
            dummy.updateMatrix();
            m.setMatrixAt(i, dummy.matrix);
        }
        m.instanceMatrix.needsUpdate = true;
    });

    return (
        <group position={position}>
            <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
                <boxGeometry args={[1, 1, 0.4]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
            </instancedMesh>
        </group>
    );
}
