import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Gjenbrukbare lavpoly-deler for raskt å bygge en levende mikrospill-scene.
// Alle er billige (få polygoner), kaster/mottar skygge, og tar farger som props
// så de kan tilpasses hvert emne. Sett dem sammen til en hel verden.

// --- Bakkeplan ---
export function GroundPlane({
    size = 44,
    depth = 34,
    color = '#7aa84f',
}: {
    size?: number;
    depth?: number;
    color?: string;
}) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[size, depth]} />
            <meshStandardMaterial color={color} roughness={1} />
        </mesh>
    );
}

// --- Vannflate med svak skimring ---
export function WaterPlane({
    position = [0, 0.02, 0],
    size = [16, 30],
    color = '#3d7fa6',
}: {
    position?: [number, number, number];
    size?: [number, number];
    color?: string;
}) {
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    useFrame(({ clock }) => {
        if (mat.current) {
            mat.current.emissiveIntensity =
                0.12 + Math.sin(clock.getElapsedTime() * 1.2) * 0.05;
        }
    });
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
            <planeGeometry args={size} />
            <meshStandardMaterial
                ref={mat}
                color={color}
                roughness={0.3}
                metalness={0.15}
                emissive="#1e4d6b"
                emissiveIntensity={0.14}
            />
        </mesh>
    );
}

// --- Hus med saltak (boks + flattrykt 4-sidig kjegle) ---
export function Building({
    position = [0, 0, 0],
    body = '#a8412f',
    roof = '#5c3326',
    w = 1.6,
    h = 1.1,
    d = 1.3,
}: {
    position?: [number, number, number];
    body?: string;
    roof?: string;
    w?: number;
    h?: number;
    d?: number;
}) {
    return (
        <group position={position}>
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color={body} roughness={0.85} />
            </mesh>
            <mesh position={[0, h + 0.32, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[w * 0.82, 0.64, 4]} />
                <meshStandardMaterial color={roof} roughness={0.9} />
            </mesh>
        </group>
    );
}

// --- Tre (stamme + løvkjegle) ---
export function Tree({
    position = [0, 0, 0],
    leaf = '#3f6b39',
}: {
    position?: [number, number, number];
    leaf?: string;
}) {
    return (
        <group position={position}>
            <mesh position={[0, 0.4, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.14, 0.8, 6]} />
                <meshStandardMaterial color="#5c3f26" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.1, 0]} castShadow>
                <coneGeometry args={[0.6, 1.4, 8]} />
                <meshStandardMaterial color={leaf} roughness={0.9} />
            </mesh>
        </group>
    );
}

// --- Liten figur (kropp + hode), valgfri farge. Sett rotation utenfra. ---
export function Figure({
    position = [0, 0, 0],
    body = '#5a4632',
    skin = '#e0b98c',
    children,
}: {
    position?: [number, number, number];
    body?: string;
    skin?: string;
    children?: React.ReactNode; // f.eks. et redskap festet til figuren
}) {
    return (
        <group position={position}>
            <mesh position={[0, 0.32, 0]} castShadow>
                <cylinderGeometry args={[0.13, 0.18, 0.5, 7]} />
                <meshStandardMaterial color={body} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.66, 0]} castShadow>
                <sphereGeometry args={[0.13, 10, 10]} />
                <meshStandardMaterial color={skin} roughness={0.8} />
            </mesh>
            {children}
        </group>
    );
}

// --- Røyk/damp: puffer som stiger og toner ut. Bra for fabrikker, ildsteder. ---
export function Smoke({
    origin = [0, 0, 0],
    show = true,
    count = 5,
    color = '#6b6b6b',
}: {
    origin?: [number, number, number];
    show?: boolean;
    count?: number;
    color?: string;
}) {
    const puffs = useRef<THREE.Mesh[]>([]);
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        for (let i = 0; i < count; i++) {
            const m = puffs.current[i];
            if (!m) continue;
            const cycle = (t * 0.5 + i / count) % 1;
            const y = origin[1] + cycle * 2.2;
            const spread = cycle * 0.6;
            m.position.set(
                origin[0] + Math.sin(t + i) * spread,
                y,
                origin[2] + Math.cos(t * 0.7 + i) * spread * 0.5
            );
            m.scale.setScalar(0.18 + cycle * 0.45);
            const mat = m.material as THREE.MeshStandardMaterial;
            mat.opacity = show ? (1 - cycle) * 0.6 : 0;
            m.visible = show;
        }
    });
    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <mesh
                    key={i}
                    ref={(el) => {
                        if (el) puffs.current[i] = el;
                    }}
                >
                    <sphereGeometry args={[1, 8, 8]} />
                    <meshStandardMaterial color={color} transparent opacity={0} roughness={1} />
                </mesh>
            ))}
        </group>
    );
}
