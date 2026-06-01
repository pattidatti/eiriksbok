import React, { useRef } from 'react';
import { Billboard, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Interactive, type InteractiveState } from './Interactive';

interface HotspotProps {
    position: [number, number, number];
    onSelect?: () => void;
    onHover?: (hovering: boolean) => void;
    state?: InteractiveState;
    disabled?: boolean;
    // Radius på pin-ringen. Stor nok til trygg trackpad-treffing.
    radius?: number;
    // Valgfri etikett som vises over pinnen ved hover/aktiv.
    label?: string;
    color?: string;
}

const STATE_COLOR: Record<InteractiveState, string> = {
    idle: '#f59e0b',
    hover: '#fbbf24',
    selected: '#0ea5e9',
    correct: '#10b981',
    wrong: '#f43f5e',
    disabled: '#94a3b8',
};

// En flytende, kamera-vendt markør i 3D-rom. Brukes til "klikk her"-punkter
// uten at eleven må treffe en liten mesh presist. Pulser for å trekke blikket.
export const Hotspot: React.FC<HotspotProps> = ({
    position,
    onSelect,
    onHover,
    state,
    disabled = false,
    radius = 0.5,
    label,
    color,
}) => {
    return (
        <Billboard position={position}>
            <Interactive
                onSelect={onSelect}
                onHover={onHover}
                state={state}
                disabled={disabled}
                hitArea={[radius * 3, radius * 3, 0.1]}
            >
                {(s) => (
                    <>
                        <PinRing radius={radius} color={color ?? STATE_COLOR[s]} active={s} />
                        {label && (s === 'hover' || s === 'selected') && (
                            <Html center position={[0, radius * 2.2, 0]} pointerEvents="none">
                                <div className="px-2 py-1 rounded-md bg-slate-900/85 text-white text-xs font-semibold whitespace-nowrap shadow-lg">
                                    {label}
                                </div>
                            </Html>
                        )}
                    </>
                )}
            </Interactive>
        </Billboard>
    );
};

function PinRing({
    radius,
    color,
    active,
}: {
    radius: number;
    color: string;
    active: InteractiveState;
}) {
    const ring = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (!ring.current) return;
        // Rolig pulse når den venter på klikk; ro når valgt/korrekt.
        const pulsing = active === 'idle' || active === 'hover';
        const t = clock.getElapsedTime();
        const s = pulsing ? 1 + Math.sin(t * 3) * 0.12 : 1;
        ring.current.scale.setScalar(s);
    });
    return (
        <group>
            {/* ytre ring */}
            <mesh ref={ring}>
                <torusGeometry args={[radius, radius * 0.18, 12, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    roughness={0.4}
                />
            </mesh>
            {/* senterprikk */}
            <mesh>
                <circleGeometry args={[radius * 0.42, 24]} />
                <meshBasicMaterial color={color} transparent opacity={0.85} />
            </mesh>
        </group>
    );
}
