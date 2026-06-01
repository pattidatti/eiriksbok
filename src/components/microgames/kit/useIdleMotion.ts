import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Gir et objekt rolig "levende" bevegelse - svak vugging og svai - så verdenen
// føles i live selv når eleven ikke gjør noe. Fest ref til et mesh/group.
//   const ref = useIdleMotion({ bob: 0.05, sway: 0.04 });
//   <group ref={ref}><Boat/></group>
export function useIdleMotion({
    bob = 0.06, // vertikal vugging (verdensenheter)
    sway = 0.03, // rotasjons-svai (radianer)
    speed = 1.2,
    phase = 0, // forskyv så flere objekter ikke beveger seg i takt
}: {
    bob?: number;
    sway?: number;
    speed?: number;
    phase?: number;
} = {}) {
    const ref = useRef<THREE.Object3D>(null);
    const baseY = useRef<number | null>(null);
    useFrame(({ clock }) => {
        const o = ref.current;
        if (!o) return;
        if (baseY.current === null) baseY.current = o.position.y;
        const t = clock.getElapsedTime() * speed + phase;
        o.position.y = baseY.current + Math.sin(t) * bob;
        o.rotation.z = Math.sin(t * 0.8) * sway;
    });
    return ref;
}
