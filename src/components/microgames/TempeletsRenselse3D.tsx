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
    GlowHalo,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: Tempelets renselse (Josjia-reformen, ca. 622 f.Kr.).
// På en kanaaneisk offerhøyde (bamah) står Yahweh-steinen sammen med flere andre
// guder: Asherah-pælen, Baal-figuren, en Astarte-figurin og et røkelsesalter.
// FASE 1 (utforsk): eleven klikker hvert objekt og lærer at folk dyrket dem
// SAMMEN her - mange guder på ett sted (henoteisme/polyteisme).
// FASE 2 (reformen): eleven gjenskaper kong Josjias reform og fjerner de andre
// gudene én for én, til bare Yahweh-steinen står igjen og lyser.
// Lyspære: slik ble mange guder til én - det vi kaller monoteisme.

interface Kultobjekt {
    id: string;
    name: string;
    label: string;
    color: string;
    exploreFact: string;
    removeFact: string;
    central?: boolean;
    angle: number;
}

const OBJECTS: Kultobjekt[] = [
    {
        id: 'yahweh',
        name: 'Yahweh-steinen',
        label: 'Steinstøtte (massebe)',
        color: '#cdbfa6',
        exploreFact:
            'En reist stein markerte at Yahweh var til stede. Yahweh ble dyrket her - men ikke alene.',
        removeFact: 'Yahweh-steinen blir stående. Reformen lot bare denne være igjen.',
        central: true,
        angle: 0,
    },
    {
        id: 'asherah',
        name: 'Asherah-pælen',
        label: 'Gudinnen ved Yahwehs side',
        color: '#3f8f5b',
        exploreFact:
            'En hellig pæl for gudinnen Asherah. Inskripsjoner kaller henne "Yahweh og hans Asherah".',
        removeFact: 'Asherah fjernes. Gudinnen ble nesten visket helt ut av historien.',
        angle: 55,
    },
    {
        id: 'baal',
        name: 'Baal-figuren',
        label: 'Kanaaneisk værgud',
        color: '#b0814e',
        exploreFact: 'Baal var kanaaneernes mektige værgud. Mange dyrket både Yahweh og Baal.',
        removeFact: 'Baal fjernes fra høyden.',
        angle: 140,
    },
    {
        id: 'astarte',
        name: 'Astarte-figurin',
        label: 'Husgudinne av leire',
        color: '#c2724f',
        exploreFact:
            'Små leirfigurer av gudinnen sto hjemme hos folk, for hell og fruktbarhet.',
        removeFact: 'Figurinene fjernes fra hjemmene og høyden.',
        angle: 220,
    },
    {
        id: 'roykelse',
        name: 'Røkelsesalteret',
        label: 'Offer til mange guder',
        color: '#9aa0aa',
        exploreFact: 'Her brente folk røkelse som offer - også til andre guder enn Yahweh.',
        removeFact: 'Alteret rives. Offeret skulle nå bare gå til Yahweh.',
        angle: 300,
    },
];

const REMOVABLE = OBJECTS.filter((o) => !o.central);
const deg = (d: number) => (d * Math.PI) / 180;
const RING_R = 3.7;

type Phase = 'explore' | 'reform' | 'won';

const TempeletsRenselse3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [phase, setPhase] = useState<Phase>('explore');
    const [seen, setSeen] = useState<string[]>([]);
    const [removed, setRemoved] = useState<string[]>([]);
    const [banner, setBanner] = useState<string | null>(
        'Klikk hvert objekt på offerhøyden og se hva folk dyrket sammen her.'
    );
    const [burst, setBurst] = useState(0);
    const [burstColor, setBurstColor] = useState('#ffe9a8');

    const reset = () => {
        setPhase('explore');
        setSeen([]);
        setRemoved([]);
        setBanner('Klikk hvert objekt på offerhøyden og se hva folk dyrket sammen her.');
    };

    const handleSelect = (o: Kultobjekt) => {
        if (phase === 'won') return;

        if (phase === 'explore') {
            if (!seen.includes(o.id)) {
                sounds.play('correct');
                setBurstColor(o.color);
                setBurst((b) => b + 1);
                const next = [...seen, o.id];
                setSeen(next);
                if (next.length >= OBJECTS.length) {
                    setPhase('reform');
                    setBanner(
                        'Kong Josjia kommer med reformen sin (år 622 f.Kr.). Fjern de fremmede gudene, én for én.'
                    );
                } else {
                    setBanner(`${o.name}: ${o.exploreFact}`);
                }
            } else {
                setBanner(`${o.name}: ${o.exploreFact}`);
            }
            return;
        }

        // phase === 'reform'
        if (o.central) {
            setBanner(o.removeFact);
            return;
        }
        if (removed.includes(o.id)) return;
        sounds.play('advance');
        setBurstColor('#d6c3a3');
        setBurst((b) => b + 1);
        const next = [...removed, o.id];
        setRemoved(next);
        if (next.length >= REMOVABLE.length) {
            setBanner(null);
            sounds.play('complete');
            setPhase('won');
            onComplete({ score: 1, completed: true, artifact: { reform: 'josjia' } });
        } else {
            setBanner(`${o.name}: ${o.removeFact}`);
        }
    };

    const badge =
        phase === 'won' ? 'Én Gud igjen' : phase === 'reform' ? 'År 622 f.Kr.' : 'Offerhøyden';
    const readout =
        phase === 'explore'
            ? { label: 'Sett', value: `${seen.length}/${OBJECTS.length}` }
            : { label: 'Fjernet', value: `${removed.length}/${REMOVABLE.length}` };

    return (
        <MicroGameScaffold
            title="Tempelets renselse"
            subtitle="Mange guder sto sammen på offerhøyden. Utforsk dem først, og gjenskap så Josjias reform der bare Yahweh blir igjen."
            estimatedSeconds={140}
            onRetry={seen.length > 0 || phase !== 'explore' ? reset : undefined}
            canvas={{
                idle: phase === 'explore' && seen.length === 0,
                camera: { position: [0, 5.4, 12], fov: 42 },
                background: '#ead9c0',
                target: [0, 1, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">{badge}</SceneBadge>
                    <DataReadout corner="bl" items={[readout]} />
                </>
            }
            scene={
                <HoydeScene
                    phase={phase}
                    seen={seen}
                    removed={removed}
                    burst={burst}
                    burstColor={burstColor}
                    onSelect={handleSelect}
                />
            }
        >
            {/* Legende under vinduet */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {OBJECTS.map((o) => {
                    const isSeen = seen.includes(o.id);
                    const isGone = removed.includes(o.id);
                    return (
                        <div
                            key={o.id}
                            className={`rounded-xl border p-2.5 transition ${
                                isGone
                                    ? 'bg-slate-100 border-slate-200 opacity-50'
                                    : isSeen
                                      ? 'bg-white shadow-sm'
                                      : 'bg-slate-50 border-slate-200'
                            }`}
                            style={isSeen && !isGone ? { borderColor: o.color } : undefined}
                        >
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="w-3 h-3 rounded-full flex-shrink-0 transition"
                                    style={{
                                        backgroundColor: isGone
                                            ? '#cbd5e1'
                                            : isSeen
                                              ? o.color
                                              : '#cbd5e1',
                                        boxShadow:
                                            isSeen && !isGone ? `0 0 8px ${o.color}` : 'none',
                                    }}
                                />
                                <span className="text-xs font-bold text-slate-700">{o.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                                {isGone ? 'Fjernet i reformen' : o.label}
                            </p>
                        </div>
                    );
                })}
            </div>

            {phase === 'won' && (
                <div className="mt-3">
                    <WinScreen title="Mange guder ble til én" onReplay={reset}>
                        På offerhøyden sto Yahweh sammen med Asherah, Baal, Astarte og et
                        røkelsesalter for mange guder. Kong Josjias reform fjernet alt unntatt
                        Yahweh. Slik ble troen på mange guder gjort om til troen på én eneste Gud.
                        Det kaller vi monoteisme - og det skjedde gjennom historien, ikke på én dag.
                    </WinScreen>
                </div>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function HoydeScene({
    phase,
    seen,
    removed,
    burst,
    burstColor,
    onSelect,
}: {
    phase: Phase;
    seen: string[];
    removed: string[];
    burst: number;
    burstColor: string;
    onSelect: (o: Kultobjekt) => void;
}) {
    return (
        <group>
            <Bakke />
            <Bamah />

            {OBJECTS.map((o) =>
                o.central ? (
                    <YahwehStein
                        key={o.id}
                        info={o}
                        seen={seen.includes(o.id)}
                        won={phase === 'won'}
                        onSelect={() => onSelect(o)}
                    />
                ) : (
                    <FremmedObjekt
                        key={o.id}
                        info={o}
                        phase={phase}
                        seen={seen.includes(o.id)}
                        removed={removed.includes(o.id)}
                        onSelect={() => onSelect(o)}
                    />
                )
            )}

            <Burst position={[0, 2.4, 0]} trigger={burst} color={burstColor} count={30} spread={4.5} />
        </group>
    );
}

// Den tørre høyden av sand og stein.
function Bakke() {
    return (
        <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[15, 56]} />
            <meshStandardMaterial color="#cbb389" roughness={1} />
        </mesh>
    );
}

// Selve offerhøyden - en lav steinplattform i sentrum.
function Bamah() {
    return (
        <group position={[0, -0.4, 0]}>
            <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[5, 5.4, 0.5, 36]} />
                <meshStandardMaterial color="#b8a079" roughness={0.95} flatShading />
            </mesh>
            <mesh position={[0, 0.55, 0]} receiveShadow>
                <cylinderGeometry args={[4.3, 4.6, 0.18, 36]} />
                <meshStandardMaterial color="#c7b189" roughness={0.95} flatShading />
            </mesh>
        </group>
    );
}

// Yahweh-steinen: en reist steinstøtte i sentrum. Står gjennom hele spillet.
// Lyser opp når den er den eneste igjen.
function YahwehStein({
    info,
    seen,
    won,
    onSelect,
}: {
    info: Kultobjekt;
    seen: boolean;
    won: boolean;
    onSelect: () => void;
}) {
    const halo = useRef<THREE.Mesh>(null);
    const mat = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((state, dt) => {
        if (mat.current) {
            mat.current.emissiveIntensity = damp(
                mat.current.emissiveIntensity,
                won ? 0.5 : 0,
                dt,
                4
            );
        }
        if (halo.current) {
            const hm = halo.current.material as THREE.MeshBasicMaterial;
            hm.opacity = damp(hm.opacity, won ? 0.32 : 0, dt, 4);
            if (won) {
                const s = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.04;
                halo.current.scale.setScalar(s);
            }
        }
    });

    return (
        <group position={[0, 0.25, 0]}>
            <Interactive onSelect={onSelect} state={won ? 'correct' : 'idle'} hitArea={[1.8, 3.2, 1.8]}>
                {(s) => (
                    <group>
                        {/* steinstøtten */}
                        <mesh position={[0, 1.35, 0]} castShadow>
                            <boxGeometry args={[0.85, 2.7, 0.55]} />
                            <meshStandardMaterial
                                ref={mat}
                                color={info.color}
                                emissive="#ffcf7a"
                                emissiveIntensity={0}
                                roughness={0.85}
                                flatShading
                            />
                        </mesh>
                        {/* avrundet topp */}
                        <mesh position={[0, 2.75, 0]} castShadow>
                            <sphereGeometry args={[0.44, 12, 10]} />
                            <meshStandardMaterial color={info.color} roughness={0.85} flatShading />
                        </mesh>
                        {/* hint-markør i utforsk-fasen */}
                        {!seen && s !== 'idle' && (
                            <mesh position={[0, 3.4, 0]}>
                                <sphereGeometry args={[0.13, 12, 12]} />
                                <meshBasicMaterial color="#fbbf24" />
                            </mesh>
                        )}
                        <mesh ref={halo} position={[0, 1.4, 0]}>
                            <sphereGeometry args={[1.7, 18, 18]} />
                            <meshBasicMaterial
                                color="#ffd98a"
                                transparent
                                opacity={0}
                                depthWrite={false}
                                blending={THREE.AdditiveBlending}
                                side={THREE.BackSide}
                            />
                        </mesh>
                        {won && <GlowHalo color="#ffd98a" size={2.2} />}
                    </group>
                )}
            </Interactive>
        </group>
    );
}

// Et fremmed kultobjekt rundt Yahweh-steinen. Klikkes for å utforske i fase 1,
// og fjernes (synker + blekner) i reform-fasen.
function FremmedObjekt({
    info,
    phase,
    seen,
    removed,
    onSelect,
}: {
    info: Kultobjekt;
    phase: Phase;
    seen: boolean;
    removed: boolean;
    onSelect: () => void;
}) {
    const grp = useRef<THREE.Group>(null);
    const mats = useRef<THREE.MeshStandardMaterial[]>([]);

    const a = deg(info.angle);
    const x = Math.cos(a) * RING_R;
    const z = Math.sin(a) * RING_R;

    useFrame((state, dt) => {
        if (grp.current) {
            const targetY = removed ? -2.6 : 0.1;
            grp.current.position.y = damp(grp.current.position.y, targetY, dt, 3);
            if (!removed && phase !== 'won') {
                grp.current.position.y += Math.sin(state.clock.elapsedTime * 1.2 + a) * 0.02;
            }
        }
        mats.current.forEach((m) => {
            if (!m) return;
            m.opacity = damp(m.opacity, removed ? 0 : 1, dt, 3);
        });
    });

    const matRef = (el: THREE.MeshStandardMaterial | null) => {
        if (el && !mats.current.includes(el)) mats.current.push(el);
    };

    return (
        <group position={[x, 0.35, z]}>
            <Interactive
                onSelect={onSelect}
                disabled={removed}
                state={seen && phase === 'explore' ? 'correct' : 'idle'}
                hitArea={[1.8, 2.6, 1.8]}
            >
                {(s) => (
                    <group ref={grp}>
                        <ObjektMesh id={info.id} color={info.color} matRef={matRef} />
                        {/* utforsk-hint */}
                        {!seen && phase === 'explore' && s !== 'idle' && (
                            <mesh position={[0, 2.1, 0]}>
                                <sphereGeometry args={[0.12, 12, 12]} />
                                <meshBasicMaterial color="#fbbf24" />
                            </mesh>
                        )}
                        {/* fjern-hint i reform-fasen */}
                        {phase === 'reform' && !removed && s === 'hover' && (
                            <mesh position={[0, 2.1, 0]}>
                                <boxGeometry args={[0.3, 0.08, 0.08]} />
                                <meshBasicMaterial color="#dc2626" />
                            </mesh>
                        )}
                    </group>
                )}
            </Interactive>
        </group>
    );
}

// Lavpoly-form per fremmed kultobjekt.
function ObjektMesh({
    id,
    color,
    matRef,
}: {
    id: string;
    color: string;
    matRef: (el: THREE.MeshStandardMaterial | null) => void;
}) {
    const makeMat = (c: string = color) => (
        <meshStandardMaterial ref={matRef} color={c} roughness={0.8} flatShading transparent />
    );

    if (id === 'asherah') {
        // Hellig pæl/tre for gudinnen Asherah.
        return (
            <group>
                <mesh position={[0, 0.8, 0]} castShadow>
                    <cylinderGeometry args={[0.13, 0.18, 1.7, 8]} />
                    {makeMat('#7c5a36')}
                </mesh>
                {[
                    [0, 1.9, 0],
                    [0.32, 1.65, 0.1],
                    [-0.3, 1.6, -0.12],
                ].map(([fx, fy, fz], i) => (
                    <mesh key={i} position={[fx, fy, fz]} castShadow>
                        <coneGeometry args={[0.5, 0.95, 8]} />
                        {makeMat()}
                    </mesh>
                ))}
            </group>
        );
    }
    if (id === 'baal') {
        // Stående værgud-figur med hevet arm.
        return (
            <group position={[0, 0.1, 0]}>
                <mesh position={[0, 0.65, 0]} castShadow>
                    <cylinderGeometry args={[0.22, 0.3, 1.2, 10]} />
                    {makeMat()}
                </mesh>
                <mesh position={[0, 1.45, 0]} castShadow>
                    <sphereGeometry args={[0.25, 14, 14]} />
                    {makeMat()}
                </mesh>
                {/* hevet arm */}
                <mesh position={[0.32, 1.25, 0]} rotation={[0, 0, -1.1]} castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
                    {makeMat()}
                </mesh>
                {/* lynkile i hånda */}
                <mesh position={[0.6, 1.7, 0]} rotation={[0, 0, 0.4]}>
                    <boxGeometry args={[0.08, 0.5, 0.08]} />
                    {makeMat('#e0b54a')}
                </mesh>
            </group>
        );
    }
    if (id === 'astarte') {
        // Liten husgudinne-figurin av leire (pilarfigur).
        return (
            <group position={[0, 0.1, 0]}>
                <mesh position={[0, 0.55, 0]} castShadow>
                    <cylinderGeometry args={[0.26, 0.4, 1.05, 12]} />
                    {makeMat()}
                </mesh>
                <mesh position={[0, 1.3, 0]} castShadow>
                    <sphereGeometry args={[0.24, 14, 14]} />
                    {makeMat()}
                </mesh>
                {/* armer foldet */}
                <mesh position={[0, 0.95, 0.22]} rotation={[0.5, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.07, 0.07, 0.5, 8]} />
                    {makeMat()}
                </mesh>
            </group>
        );
    }
    // roykelse: et lite alter med horn i hjørnene og litt røyk.
    return (
        <group position={[0, 0.1, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[0.9, 1, 0.9]} />
                {makeMat()}
            </mesh>
            {[
                [0.35, 0.35],
                [-0.35, 0.35],
                [0.35, -0.35],
                [-0.35, -0.35],
            ].map(([hx, hz], i) => (
                <mesh key={i} position={[hx, 1.1, hz]} castShadow>
                    <coneGeometry args={[0.1, 0.3, 6]} />
                    {makeMat('#b7bcc4')}
                </mesh>
            ))}
            {/* røyk */}
            {[1.4, 1.75, 2.05].map((ry, i) => (
                <mesh key={i} position={[0, ry, 0]}>
                    <sphereGeometry args={[0.18 + i * 0.04, 10, 10]} />
                    <meshStandardMaterial
                        ref={matRef}
                        color="#e8e4dc"
                        transparent
                        opacity={0.55}
                        roughness={1}
                    />
                </mesh>
            ))}
        </group>
    );
}

export default TempeletsRenselse3D;
