import React, { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';

// Sprer hundrevis av kopier av ett objekt utover et område til prisen av få -
// skog, folkemengde, åkerteiger, steinur. Lar scenen bli mye rikere uten å sprenge
// Chromebook-budsjettet. Gi din egen geometri/materiale, ellers en enkel boks.
//
//   <InstancedField count={120} area={[26, 22]}
//       geometry={<coneGeometry args={[0.6, 1.4, 7]} />}
//       material={<meshStandardMaterial color="#3f6b39" />} />
interface InstancedFieldProps {
    count?: number;
    area?: [number, number]; // bredde (x) x dybde (z) å spre over
    center?: [number, number, number];
    y?: number;
    minScale?: number;
    maxScale?: number;
    // Sett geometri/materiale (delt mal). Default: liten boks.
    geometry?: React.ReactNode;
    material?: React.ReactNode;
    // Pseudo-tilfeldig frø (gir stabil, men variert layout). Endre for ny variant.
    seed?: number;
}

// Deterministisk pseudo-random (mulvarp-hash) - stabil layout uten Math.random,
// så scenen ser lik ut ved hver render og resume.
function rng(seed: number) {
    let s = seed >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

export function InstancedField({
    count = 80,
    area = [24, 20],
    center = [0, 0, 0],
    y = 0,
    minScale = 0.7,
    maxScale = 1.3,
    geometry,
    material,
    seed = 1,
}: InstancedFieldProps) {
    const data = useMemo(() => {
        const rand = rng(seed * 7919 + count);
        return Array.from({ length: count }, () => {
            const x = center[0] + (rand() - 0.5) * area[0];
            const z = center[2] + (rand() - 0.5) * area[1];
            const scale = minScale + rand() * (maxScale - minScale);
            const rot = rand() * Math.PI * 2;
            return { position: [x, y + center[1], z] as [number, number, number], scale, rot };
        });
    }, [count, area, center, y, minScale, maxScale, seed]);

    return (
        <Instances limit={count} range={count} castShadow receiveShadow>
            {geometry ?? <boxGeometry args={[1, 1, 1]} />}
            {material ?? <meshStandardMaterial color="#8a9a44" />}
            {data.map((d, i) => (
                <Instance key={i} position={d.position} scale={d.scale} rotation={[0, d.rot, 0]} />
            ))}
        </Instances>
    );
}
