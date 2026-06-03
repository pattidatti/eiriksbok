import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Interactive,
    SceneBanner,
    SceneBadge,
    WinScreen,
    DataReadout,
    Burst,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: gudenes verden. Olympen reiser seg i en grå, "uforklart" verden.
// Rundt fjellet står seks guder som sovende statuer. Eleven klikker en gud:
// guden våkner, reiser seg og lyser i sin farge - og DEN delen av verden
// guden eide, fargelegges. Når alle seks er våkne, er hele verden forklart og
// lyser opp.
// Lyspære: hver gud eide sin egen del av verden. Til sammen forklarte gudene
// alt grekerne så rundt seg - himmel, hav, jord, død, kjærlighet og visdom.

interface GudInfo {
    id: string;
    name: string;
    domain: string;
    color: string;
    angle: number; // grader rundt fjellet
}

const GODS: GudInfo[] = [
    { id: 'zevs', name: 'Zevs', domain: 'Himmel og lyn', color: '#f59e0b', angle: 90 },
    { id: 'poseidon', name: 'Poseidon', domain: 'Hav og jordskjelv', color: '#2563eb', angle: 150 },
    { id: 'hades', name: 'Hades', domain: 'Underverdenen', color: '#7c3aed', angle: 210 },
    { id: 'demeter', name: 'Demeter', domain: 'Avling og jord', color: '#16a34a', angle: 270 },
    { id: 'afrodite', name: 'Afrodite', domain: 'Kjærlighet', color: '#ec4899', angle: 330 },
    { id: 'athene', name: 'Athene', domain: 'Visdom', color: '#14b8a6', angle: 30 },
];

const deg = (d: number) => (d * Math.PI) / 180;
const RING_R = 4.4;

const GudenesVerden3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [awoke, setAwoke] = useState<string[]>([]);
    const [won, setWon] = useState(false);
    const [banner, setBanner] = useState<string | null>(
        'Klikk en sovende gud for å vekke den - og se hvilken del av verden den eide.'
    );
    const [burst, setBurst] = useState(0);
    const [burstColor, setBurstColor] = useState('#ffe9a8');

    const reset = () => {
        setAwoke([]);
        setWon(false);
        setBanner('Klikk en sovende gud for å vekke den - og se hvilken del av verden den eide.');
    };

    const wake = (g: GudInfo) => {
        if (won || awoke.includes(g.id)) return;
        sounds.play('correct');
        setBurstColor(g.color);
        setBurst((b) => b + 1);
        const next = [...awoke, g.id];
        setAwoke(next);
        if (next.length >= GODS.length) {
            setBanner(null);
            sounds.play('complete');
            setWon(true);
            onComplete({ score: 1, completed: true, artifact: { awoke: next } });
        } else {
            setBanner(`${g.name} våknet: ${g.domain}. ${GODS.length - next.length} guder sover ennå.`);
        }
    };

    const count = awoke.length;

    return (
        <MicroGameScaffold
            title="Vekk gudene på Olympen"
            subtitle="Seks guder sover rundt fjellet. Vekk hver av dem og se delen av verden de eide."
            estimatedSeconds={130}
            onRetry={count > 0 || won ? reset : undefined}
            canvas={{
                idle: !won && count === 0,
                camera: { position: [0, 5.5, 12], fov: 42 },
                background: '#eaf1fb',
                target: [0, 0.6, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} />
                    <SceneBadge corner="br">
                        {won ? 'En forklart verden' : 'Antikkens Hellas'}
                    </SceneBadge>
                    <DataReadout
                        corner="tr"
                        items={[{ label: 'Guder vekket', value: `${count}/${GODS.length}` }]}
                    />
                </>
            }
            scene={
                <OlympusScene
                    awoke={awoke}
                    count={count}
                    burst={burst}
                    burstColor={burstColor}
                    onWake={wake}
                />
            }
        >
            {/* Legende under vinduet */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GODS.map((g) => {
                    const on = awoke.includes(g.id);
                    return (
                        <div
                            key={g.id}
                            className={`rounded-xl border p-2.5 transition ${
                                on ? 'bg-white shadow-sm' : 'bg-slate-50 border-slate-200'
                            }`}
                            style={on ? { borderColor: g.color } : undefined}
                        >
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="w-3 h-3 rounded-full flex-shrink-0 transition"
                                    style={{
                                        backgroundColor: on ? g.color : '#cbd5e1',
                                        boxShadow: on ? `0 0 8px ${g.color}` : 'none',
                                    }}
                                />
                                <span className="text-xs font-bold text-slate-700">{g.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                                {g.domain}
                            </p>
                        </div>
                    );
                })}
            </div>

            {won && (
                <div className="mt-3">
                    <WinScreen title="Hele verden lyser!" onReplay={reset}>
                        Hver gud eide sin egen del av verden: Zevs himmelen, Poseidon havet, Hades de
                        døde, Demeter åkeren, Afrodite kjærligheten og Athene visdommen. Til sammen
                        forklarte gudene alt grekerne så rundt seg. Mytene var deres måte å forstå
                        naturen og livet på - lenge før vitenskapen kunne svare.
                    </WinScreen>
                </div>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function OlympusScene({
    awoke,
    count,
    burst,
    burstColor,
    onWake,
}: {
    awoke: string[];
    count: number;
    burst: number;
    burstColor: string;
    onWake: (g: GudInfo) => void;
}) {
    return (
        <group>
            {/* Verdensdisk - den "uforklarte" verden som lyser opp etter hvert */}
            <WorldDisc count={count} />

            {/* Olympen i sentrum */}
            <Mountain count={count} />

            {/* De seks gudene rundt fjellet */}
            {GODS.map((g) => (
                <GodStatue key={g.id} god={g} awake={awoke.includes(g.id)} onWake={() => onWake(g)} />
            ))}

            <Burst position={[0, 2.4, 0]} trigger={burst} color={burstColor} count={32} spread={4.5} />
        </group>
    );
}

// Bakkeflaten/verden under fjellet. Grå og død i starten, blir grønn og levende
// når flere guder er vekket.
function WorldDisc({ count }: { count: number }) {
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    const target = count / GODS.length;

    useFrame((_, dt) => {
        if (mat.current) {
            const goal = new THREE.Color('#9aa6b8').lerp(new THREE.Color('#bfe3c4'), target);
            mat.current.color.lerp(goal, 1 - Math.exp(-4 * dt));
        }
    });

    return (
        <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[13, 56]} />
            <meshStandardMaterial ref={mat} color="#9aa6b8" roughness={1} />
        </mesh>
    );
}

// Olympen: et kjegleformet fjell med snøtopp. Lyser sterkere for hver gud som
// vekkes, og glør gyllent ved full forklaring.
function Mountain({ count }: { count: number }) {
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    const glow = useRef<THREE.Mesh>(null);
    const target = count / GODS.length;

    useFrame((state, dt) => {
        if (mat.current) {
            mat.current.emissiveIntensity = damp(
                mat.current.emissiveIntensity,
                0.05 + target * 0.55,
                dt,
                4
            );
            mat.current.emissive.lerp(new THREE.Color('#fbbf24'), 1 - Math.exp(-3 * dt));
        }
        if (glow.current) {
            const gm = glow.current.material as THREE.MeshBasicMaterial;
            gm.opacity = damp(gm.opacity, 0.04 + target * 0.3, dt, 4);
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.04 * target;
            glow.current.scale.setScalar(pulse);
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* fjellkropp */}
            <mesh castShadow position={[0, 0.4, 0]}>
                <coneGeometry args={[2.1, 3.6, 6]} />
                <meshStandardMaterial
                    ref={mat}
                    color="#cdd6e4"
                    emissive="#fbbf24"
                    emissiveIntensity={0.05}
                    roughness={0.7}
                    flatShading
                />
            </mesh>
            {/* snøtopp */}
            <mesh position={[0, 1.95, 0]} castShadow>
                <coneGeometry args={[0.95, 1.1, 6]} />
                <meshStandardMaterial color="#ffffff" roughness={0.6} flatShading />
            </mesh>
            {/* gyllen glød rundt toppen */}
            <mesh ref={glow} position={[0, 1.6, 0]}>
                <sphereGeometry args={[2.4, 24, 24]} />
                <meshBasicMaterial
                    color="#ffe9a8"
                    transparent
                    opacity={0.04}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
}

// En gud som statue. Mørk og grå mens den sover. Når den vekkes: reiser seg
// litt, lyser i gudens farge, og får en myk fargeglød.
function GodStatue({ god, awake, onWake }: { god: GudInfo; awake: boolean; onWake: () => void }) {
    const grp = useRef<THREE.Group>(null);
    const bodyMat = useRef<THREE.MeshStandardMaterial>(null);
    const headMat = useRef<THREE.MeshStandardMaterial>(null);
    const aura = useRef<THREE.Mesh>(null);

    const a = deg(god.angle);
    const x = Math.cos(a) * RING_R;
    const z = Math.sin(a) * RING_R;

    useFrame((state, dt) => {
        const lift = awake ? 0.35 : 0;
        if (grp.current) {
            grp.current.position.y = damp(grp.current.position.y, lift, dt, 5);
            if (awake) {
                grp.current.position.y += Math.sin(state.clock.elapsedTime * 1.4 + a) * 0.05;
            }
        }
        const onCol = new THREE.Color(god.color);
        const offCol = new THREE.Color('#8a93a3');
        if (bodyMat.current) {
            bodyMat.current.color.lerp(awake ? onCol : offCol, 1 - Math.exp(-5 * dt));
            bodyMat.current.emissive.lerp(awake ? onCol : new THREE.Color('#000000'), 1 - Math.exp(-5 * dt));
            bodyMat.current.emissiveIntensity = damp(
                bodyMat.current.emissiveIntensity,
                awake ? 0.6 : 0,
                dt,
                5
            );
        }
        if (headMat.current) {
            headMat.current.color.lerp(awake ? onCol : offCol, 1 - Math.exp(-5 * dt));
            headMat.current.emissive.lerp(awake ? onCol : new THREE.Color('#000000'), 1 - Math.exp(-5 * dt));
            headMat.current.emissiveIntensity = damp(
                headMat.current.emissiveIntensity,
                awake ? 0.7 : 0,
                dt,
                5
            );
        }
        if (aura.current) {
            const am = aura.current.material as THREE.MeshBasicMaterial;
            am.opacity = damp(am.opacity, awake ? 0.28 : 0, dt, 4);
            am.color.lerp(onCol, 1 - Math.exp(-5 * dt));
        }
    });

    return (
        <group position={[x, 0, z]}>
            <Interactive
                onSelect={onWake}
                disabled={awake}
                state={awake ? 'correct' : 'idle'}
                hitArea={[1.8, 2.6, 1.8]}
            >
                {(s) => (
                    <group ref={grp}>
                        {/* sokkel */}
                        <mesh position={[0, -0.55, 0]} receiveShadow>
                            <cylinderGeometry args={[0.7, 0.8, 0.4, 12]} />
                            <meshStandardMaterial color="#e2e8f0" roughness={0.8} flatShading />
                        </mesh>
                        {/* kropp */}
                        <mesh position={[0, 0.25, 0]} castShadow>
                            <cylinderGeometry args={[0.34, 0.5, 1.3, 10]} />
                            <meshStandardMaterial
                                ref={bodyMat}
                                color="#8a93a3"
                                emissive="#000000"
                                emissiveIntensity={0}
                                roughness={0.5}
                                flatShading
                            />
                        </mesh>
                        {/* hode */}
                        <mesh position={[0, 1.15, 0]} castShadow>
                            <icosahedronGeometry args={[0.36, 0]} />
                            <meshStandardMaterial
                                ref={headMat}
                                color="#8a93a3"
                                emissive="#000000"
                                emissiveIntensity={0}
                                roughness={0.4}
                                flatShading
                            />
                        </mesh>
                        {/* hover-løft hint for sovende guder */}
                        {!awake && s === 'hover' && (
                            <mesh position={[0, 1.85, 0]}>
                                <sphereGeometry args={[0.12, 12, 12]} />
                                <meshBasicMaterial color={god.color} />
                            </mesh>
                        )}
                        {/* fargeglød ved oppvåkning */}
                        <mesh ref={aura} position={[0, 0.5, 0]}>
                            <sphereGeometry args={[1.05, 18, 18]} />
                            <meshBasicMaterial
                                color={god.color}
                                transparent
                                opacity={0}
                                depthWrite={false}
                                blending={THREE.AdditiveBlending}
                                side={THREE.BackSide}
                            />
                        </mesh>
                    </group>
                )}
            </Interactive>
        </group>
    );
}

export default GudenesVerden3D;
