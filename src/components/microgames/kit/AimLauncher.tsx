import React, { useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { microSfx } from './sound';
import { useOrbitToggle } from './useOrbitToggle';

// Sikt-og-skyt med ballistisk bue: dra håndtaket bakover/opp for å lade (slynge-
// metafor), se den predikerte banen, slipp for å skyte. Katapult, bue, kanon,
// diskos. En "sikt/bane"-mekanikk - helt annen enn klikk-hotspot.
//
//   <AimLauncher
//       position={[0, 0.6, 6]} forward={[0, -1]}
//       targets={[{ id: 'mur', position: [0, 1.2, -10], radius: 1.4 }]}
//       onHit={(id) => score(id)} onMiss={() => shake()}
//   >
//       <CatapultMesh />
//   </AimLauncher>
//
// Treff sjekkes analytisk mot `targets` (ingen fysikk-body). Forfatteren tegner
// selve målene; her trengs bare posisjon + radius for treff-deteksjon.

export interface AimTarget {
    id: string;
    position: [number, number, number];
    radius: number;
}

interface AimLauncherProps {
    children?: React.ReactNode;
    // Utskytningspunkt.
    position?: [number, number, number];
    // Retning prosjektilet sendes (XZ-enhetsvektor). Default [0,-1] = innover i scenen.
    forward?: [number, number];
    gravity?: number;
    // Maks utgangsfart (m/s) ved full ladning.
    maxPower?: number;
    // Hvor mye fart per meter tilbaketrekk. Default 2.6.
    powerScale?: number;
    targets?: AimTarget[];
    // Bakkenivå - prosjektil under dette uten treff = bom.
    groundY?: number;
    projectileColor?: string;
    projectileRadius?: number;
    onFire?: () => void;
    onHit?: (id: string) => void;
    onMiss?: () => void;
    sound?: boolean;
}

// Sample den ballistiske banen til den treffer bakken (for forhåndsvisning).
function sampleArc(
    origin: THREE.Vector3,
    vel: THREE.Vector3,
    gravity: number,
    groundY: number,
    steps = 20,
    dt = 0.08
): THREE.Vector3[] {
    const pts: THREE.Vector3[] = [];
    const p = origin.clone();
    const v = vel.clone();
    for (let i = 0; i < steps; i++) {
        pts.push(p.clone());
        v.y -= gravity * dt;
        p.addScaledVector(v, dt);
        if (p.y < groundY) break;
    }
    return pts;
}

export const AimLauncher: React.FC<AimLauncherProps> = ({
    children,
    position = [0, 0.6, 6],
    forward = [0, -1],
    gravity = 9,
    maxPower = 14,
    powerScale = 2.6,
    targets = [],
    groundY = 0,
    projectileColor = '#3a3a42',
    projectileRadius = 0.18,
    onFire,
    onHit,
    onMiss,
    sound = true,
}) => {
    const setOrbit = useOrbitToggle();
    const origin = useMemo(
        () => new THREE.Vector3(position[0], position[1], position[2]),
        [position]
    );
    // Loddrett plan som inneholder forward-aksen + opp: normalen er vannrett og
    // står normalt på forward. Tilbaketrekk-punktet leses i dette planet.
    const plane = useMemo(() => {
        const fwd = new THREE.Vector3(forward[0], 0, forward[1]).normalize();
        const normal = new THREE.Vector3(fwd.z, 0, -fwd.x); // vannrett, normalt på fwd
        return { fwd, mathPlane: new THREE.Plane(normal, -normal.dot(origin)) };
    }, [forward, origin]);

    const hit = useMemo(() => new THREE.Vector3(), []);
    const [aimVel, setAimVel] = useState<THREE.Vector3 | null>(null);
    const [flying, setFlying] = useState(false);

    const projMesh = useRef<THREE.Mesh>(null);
    const projPos = useRef(new THREE.Vector3());
    const projVel = useRef(new THREE.Vector3());

    // Regn ut ladnings-fart fra et tilbaketrekkspunkt i det loddrette planet.
    const velFromDrag = (point: THREE.Vector3): THREE.Vector3 => {
        const pull = new THREE.Vector3().subVectors(origin, point); // slynge: motsatt av trekk
        // Behold bare forover- og opp-komponent (ingen bakover/ned-skyting).
        const fwdAmount = Math.max(0, pull.dot(plane.fwd));
        const upAmount = Math.max(0, pull.y);
        const v = new THREE.Vector3()
            .addScaledVector(plane.fwd, fwdAmount)
            .addScaledVector(new THREE.Vector3(0, 1, 0), upAmount)
            .multiplyScalar(powerScale);
        if (v.length() > maxPower) v.setLength(maxPower);
        return v;
    };

    const arcPoints = useMemo(() => {
        if (!aimVel) return [];
        return sampleArc(origin, aimVel, gravity, groundY);
    }, [aimVel, origin, gravity, groundY]);

    useFrame((_, dt) => {
        if (!flying || !projMesh.current) return;
        const clampedDt = Math.min(dt, 0.04);
        projVel.current.y -= gravity * clampedDt;
        projPos.current.addScaledVector(projVel.current, clampedDt);
        projMesh.current.position.copy(projPos.current);

        for (const tg of targets) {
            const d = projPos.current.distanceTo(
                new THREE.Vector3(tg.position[0], tg.position[1], tg.position[2])
            );
            if (d <= tg.radius) {
                setFlying(false);
                if (sound) microSfx.play('correct');
                onHit?.(tg.id);
                return;
            }
        }
        if (projPos.current.y <= groundY && projVel.current.y < 0) {
            setFlying(false);
            if (sound) microSfx.play('incorrect');
            onMiss?.();
        }
    });

    const startFlight = (v: THREE.Vector3) => {
        projPos.current.copy(origin);
        projVel.current.copy(v);
        if (projMesh.current) projMesh.current.position.copy(origin);
        setFlying(true);
        if (sound) microSfx.play('drop');
        onFire?.();
    };

    return (
        <group>
            {/* Launcher-visualet (forfatterens mesh) ved origo. */}
            <group position={position}>{children}</group>

            {/* Gripeflate ved origo: dra for å sikte. */}
            <mesh
                position={position}
                onPointerDown={(e: ThreeEvent<PointerEvent>) => {
                    if (flying) return;
                    e.stopPropagation();
                    (e.target as Element).setPointerCapture?.(e.pointerId);
                    setOrbit(false);
                    document.body.style.cursor = 'grabbing';
                    if (sound) microSfx.play('pick');
                    setAimVel(new THREE.Vector3(0, 0, 0));
                }}
                onPointerMove={(e: ThreeEvent<PointerEvent>) => {
                    if (aimVel === null) return;
                    e.stopPropagation();
                    if (e.ray.intersectPlane(plane.mathPlane, hit)) {
                        setAimVel(velFromDrag(hit.clone()));
                    }
                }}
                onPointerUp={(e: ThreeEvent<PointerEvent>) => {
                    if (aimVel === null) return;
                    e.stopPropagation();
                    (e.target as Element).releasePointerCapture?.(e.pointerId);
                    setOrbit(true);
                    document.body.style.cursor = '';
                    const v = aimVel;
                    setAimVel(null);
                    if (v.length() > 0.5) startFlight(v);
                }}
                onPointerOver={() => {
                    if (!flying && aimVel === null) document.body.style.cursor = 'grab';
                }}
                onPointerOut={() => {
                    if (aimVel === null) document.body.style.cursor = '';
                }}
            >
                <sphereGeometry args={[Math.max(0.35, projectileRadius * 2), 12, 12]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Bue-forhåndsvisning mens man sikter. */}
            {arcPoints.map((p, i) => (
                <mesh key={i} position={[p.x, p.y, p.z]}>
                    <sphereGeometry args={[0.07, 6, 6]} />
                    <meshStandardMaterial
                        color="#fbbf24"
                        emissive="#fbbf24"
                        emissiveIntensity={0.6}
                        transparent
                        opacity={0.85 - (i / arcPoints.length) * 0.5}
                        depthWrite={false}
                    />
                </mesh>
            ))}

            {/* Prosjektilet. */}
            <mesh ref={projMesh} position={position} visible={flying} castShadow>
                <sphereGeometry args={[projectileRadius, 12, 12]} />
                <meshStandardMaterial color={projectileColor} roughness={0.6} />
            </mesh>
        </group>
    );
};
