import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    SceneBanner,
    SceneBadge,
    DataReadout,
    WinScreen,
    Burst,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til "Sentrale trekk i Hinduismen".
// Atman (sjelen) kretser rundt Brahman (det universelle) fanget i Samsara.
// Eleven aktiverer de tre yoga-veiene og ser Atman spirale innover og smelte inn i Brahman.
// Lyspæren: Atman og Brahman er identiske - frigjøringen ER gjenforeningen.

interface YogaNode {
    id: string;
    label: string;
    teaching: string;
    position: [number, number, number];
}

const YOGA_NODES: YogaNode[] = [
    {
        id: 'karma',
        label: 'Karma Yoga',
        teaching:
            'Karma Yoga: gjør pliktene dine uten å forvente belønning. Handlingen renser sjelen fra ego.',
        position: [-5.5, 0.5, 4.0],
    },
    {
        id: 'jnana',
        label: 'Jnana Yoga',
        teaching:
            'Jnana Yoga: gjennom visdom erkjenner du at Atman og Brahman er identiske. Illusjonen om atskilthet oppløses.',
        position: [6.5, 0.5, 0.0],
    },
    {
        id: 'bhakti',
        label: 'Bhakti Yoga',
        teaching:
            'Bhakti Yoga: total hengivelse til det guddommelige. Ego smelter bort i kjærlighet.',
        position: [-5.5, 0.5, -4.0],
    },
];

// Module-level deterministic RNG - avoid mutable let inside useMemo
function mkRng(seed: number) {
    let s = seed >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

function StarField() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useRef(new THREE.Object3D());
    const initialized = useRef(false);

    const positions = useMemo<[number, number, number][]>(() => {
        const rng = mkRng(42);
        return Array.from({ length: 160 }, () => {
            const theta = rng() * Math.PI * 2;
            const phi = Math.acos(2 * rng() - 1);
            const r = 35 + rng() * 15;
            return [
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.cos(phi),
                r * Math.sin(phi) * Math.sin(theta),
            ] as [number, number, number];
        });
    }, []);

    useFrame(() => {
        if (initialized.current || !meshRef.current) return;
        initialized.current = true;
        positions.forEach((pos, i) => {
            dummy.current.position.set(...pos);
            dummy.current.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.current.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 160]}>
            <sphereGeometry args={[0.07, 4, 4]} />
            <meshBasicMaterial color="white" />
        </instancedMesh>
    );
}

function CosmicScene({
    doneCount,
    merging,
    done,
    onActivate,
    burstTrigger,
}: {
    doneCount: number;
    merging: boolean;
    done: Set<string>;
    onActivate: (id: string) => void;
    burstTrigger: number;
}) {
    const atmanRef = useRef<THREE.Mesh>(null);
    const brahmanRef = useRef<THREE.Mesh>(null);
    const orbitRef = useRef({ radius: 7.5, angle: 0 });
    const brahmanTimeRef = useRef(0);

    useFrame((_, dt) => {
        const targetRadius = merging ? 0.0 : 7.5 - doneCount * 2.2;
        const orbitSpeed = merging ? 5 : 0.35 + doneCount * 0.12;
        const dampSpeed = merging ? 5 : 1.2;

        orbitRef.current.radius = damp(orbitRef.current.radius, targetRadius, dt, dampSpeed);
        orbitRef.current.angle += dt * orbitSpeed;

        if (atmanRef.current) {
            const { radius, angle } = orbitRef.current;
            atmanRef.current.position.x = Math.cos(angle) * radius;
            atmanRef.current.position.z = Math.sin(angle) * radius;
            atmanRef.current.position.y = Math.sin(angle * 0.6) * 0.45;
        }

        brahmanTimeRef.current += dt;
        if (brahmanRef.current) {
            const pulse = 1 + Math.sin(brahmanTimeRef.current * 1.1) * 0.04;
            brahmanRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <>
            {/* Cosmic sky dome */}
            <mesh>
                <sphereGeometry args={[55, 16, 16]} />
                <meshBasicMaterial color="#06051a" side={THREE.BackSide} />
            </mesh>

            <StarField />

            <ambientLight intensity={0.3} color="#c4a8ff" />
            <pointLight position={[0, 0, 0]} intensity={4} color="#fde68a" distance={25} />

            {/* Brahman - the universal soul, golden orb at center */}
            <mesh ref={brahmanRef}>
                <sphereGeometry args={[1.8, 32, 32]} />
                <meshStandardMaterial
                    color="#fbbf24"
                    emissive="#f59e0b"
                    emissiveIntensity={2.5}
                    roughness={0.1}
                    metalness={0.2}
                />
            </mesh>

            {/* Brahman glow */}
            <mesh>
                <sphereGeometry args={[2.9, 16, 16]} />
                <meshBasicMaterial
                    color="#fde68a"
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Atman - the individual soul */}
            <mesh ref={atmanRef}>
                <sphereGeometry args={[0.38, 20, 20]} />
                <meshStandardMaterial
                    color="#93c5fd"
                    emissive="#3b82f6"
                    emissiveIntensity={3}
                    roughness={0.05}
                />
            </mesh>

            {/* Yoga path hotspots */}
            {YOGA_NODES.map((node) =>
                done.has(node.id) ? null : (
                    <Hotspot
                        key={node.id}
                        position={node.position}
                        onSelect={() => onActivate(node.id)}
                        label={node.label}
                        radius={0.6}
                    />
                )
            )}

            <Burst position={[0, 0.5, 0]} trigger={burstTrigger} color="#fbbf24" count={32} spread={5} />
        </>
    );
}

const MokshaVeien3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [done, setDone] = useState<Set<string>>(new Set());
    const [merging, setMerging] = useState(false);
    const [won, setWon] = useState(false);
    const [banner, setBanner] = useState<string | null>(null);
    const [burstTrigger, setBurstTrigger] = useState(0);

    const activate = (id: string) => {
        if (merging || done.has(id)) return;
        const node = YOGA_NODES.find((n) => n.id === id);
        if (!node) return;
        sounds.play('correct');
        setBanner(node.teaching);
        const next = new Set(done);
        next.add(id);
        setDone(next);

        if (next.size === 3) {
            setTimeout(() => {
                setMerging(true);
                setBanner(
                    'Atman og Brahman er ett. Moksha er oppnådd - frigjøring fra Samsaras kretsløp!'
                );
                sounds.play('advance');
                setTimeout(() => {
                    setBurstTrigger((t) => t + 1);
                    sounds.play('complete');
                    setTimeout(() => {
                        setWon(true);
                        onComplete({ score: 1, completed: true });
                    }, 1200);
                }, 1500);
            }, 800);
        }
    };

    const reset = () => {
        setDone(new Set());
        setMerging(false);
        setWon(false);
        setBanner(null);
        setBurstTrigger(0);
    };

    return (
        <MicroGameScaffold
            title="Atman søker Brahman"
            subtitle="Aktiver de tre yoga-veiene og se sjelen forenes med det universelle"
            estimatedSeconds={90}
            onRetry={done.size > 0 || won ? reset : undefined}
            scene={
                <CosmicScene
                    doneCount={done.size}
                    merging={merging}
                    done={done}
                    onActivate={activate}
                    burstTrigger={burstTrigger}
                />
            }
            canvas={{
                idle: done.size === 0,
                camera: { position: [0, 11, 15], fov: 44 },
                background: '#0b0820',
                fog: null,
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <DataReadout items={[{ label: 'Yoga-veier', value: `${done.size}/3` }]} corner="bl" />
                    <SceneBadge corner="br">Samsara - Moksha</SceneBadge>
                </>
            }
            containerClassName="bg-[#0b0820]"
        >
            {won ? (
                <WinScreen title="Moksha oppnådd!" onReplay={reset}>
                    Atman og Brahman er ett. Sjelen er frigjort fra Samsaras evige kretsløp.
                </WinScreen>
            ) : (
                <p className="text-xs text-slate-500 text-center py-1">
                    Klikk de tre lysende punktene i scenen for å aktivere yoga-veiene
                </p>
            )}
        </MicroGameScaffold>
    );
};

export default MokshaVeien3D;
