import React, { useMemo, useRef, useState } from 'react';
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

// Mikrospill: kognitiv mangfoldighet. En grå "problemkjerne" svever i et lyst
// rom med fire mørke sider. Rundt den flyter perspektiv-skår i fire farger -
// men noen farger går igjen. Eleven klikker et skår: et NYTT perspektiv lyser
// opp én side av problemet. Klikker du et perspektiv du allerede har, spretter
// skåret av - samme vinkel viser ingen ny side. Først når alle fire ULIKE
// perspektivene er på, lyser hele kjernen opp.
// Lyspære: ett perspektiv ser én side. For å forstå hele problemet trenger du
// flere ULIKE vinkler. Det er derfor mangfold løser problemer bedre.

type Phase = 'play' | 'won';

interface Persp {
    id: string;
    label: string;
    color: string;
    desc: string;
    angle: number; // grader, posisjon for sidepanelet rundt kjernen
}

const PERSPS: Persp[] = [
    {
        id: 'erfaring',
        label: 'Erfaring',
        color: '#f59e0b',
        desc: 'Det du har opplevd selv',
        angle: 0,
    },
    { id: 'fag', label: 'Fagkunnskap', color: '#3b82f6', desc: 'Det du har lært deg', angle: 90 },
    {
        id: 'kultur',
        label: 'Kultur',
        color: '#a855f7',
        desc: 'Bakgrunnen du bærer med deg',
        angle: 180,
    },
    {
        id: 'alder',
        label: 'Generasjon',
        color: '#10b981',
        desc: 'Alderen og tiden du lever i',
        angle: 270,
    },
];

const PERSP_BY_ID: Record<string, Persp> = Object.fromEntries(PERSPS.map((p) => [p.id, p]));

// Seks skår i en ytre ring - fire ulike, pluss to gjengangere som fristelse.
interface Shard {
    key: string;
    persp: string;
    angle: number; // grader rundt ringen
}

const SHARDS: Shard[] = [
    { key: 's1', persp: 'erfaring', angle: 20 },
    { key: 's2', persp: 'kultur', angle: 80 },
    { key: 's3', persp: 'fag', angle: 140 },
    { key: 's4', persp: 'alder', angle: 200 },
    { key: 's5', persp: 'erfaring', angle: 260 },
    { key: 's6', persp: 'fag', angle: 320 },
];

const deg = (d: number) => (d * Math.PI) / 180;
const PANEL_R = 2.4;
const RING_R = 5.2;

const Perspektivkjernen3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [phase, setPhase] = useState<Phase>('play');
    const [lit, setLit] = useState<string[]>([]);
    const [consumed, setConsumed] = useState<Record<string, boolean>>({});
    const [banner, setBanner] = useState<string | null>(
        'Klikk et lysende skår for å se problemet fra den vinkelen.'
    );
    const [burst, setBurst] = useState(0);
    const [burstColor, setBurstColor] = useState('#ffe9a8');

    const reset = () => {
        setPhase('play');
        setLit([]);
        setConsumed({});
        setBanner('Klikk et lysende skår for å se problemet fra den vinkelen.');
    };

    const clickShard = (shard: Shard) => {
        if (phase !== 'play' || consumed[shard.key]) return;
        const persp = PERSP_BY_ID[shard.persp];

        if (lit.includes(shard.persp)) {
            // Samme perspektiv finnes allerede - ingen ny side lyser opp.
            sounds.play('incorrect');
            setBanner(
                `Samme vinkel igjen (${persp.label}). Den siden lyser allerede - du trenger et ANNET perspektiv for å se en ny side.`
            );
            return;
        }

        // Nytt perspektiv: lys opp en side.
        sounds.play('correct');
        setConsumed((c) => ({ ...c, [shard.key]: true }));
        setBurstColor(persp.color);
        setBurst((b) => b + 1);
        const next = [...lit, shard.persp];
        setLit(next);

        if (next.length >= PERSPS.length) {
            setBanner(null);
            sounds.play('complete');
            setPhase('won');
            onComplete({ score: 1, completed: true, artifact: { lit: next } });
        } else {
            setBanner(
                `${persp.label} lyser opp én side. ${
                    PERSPS.length - next.length
                } sider er fortsatt mørke - finn andre vinkler.`
            );
        }
    };

    const litCount = lit.length;

    return (
        <MicroGameScaffold
            title="Lys opp problemet"
            subtitle="Ett perspektiv ser én side. Finn fire ulike vinkler og se hele problemet."
            estimatedSeconds={140}
            onRetry={litCount > 0 || phase === 'won' ? reset : undefined}
            canvas={{
                idle: phase === 'play' && litCount === 0,
                camera: { position: [0, 4.5, 11], fov: 42 },
                background: '#eef3fb',
                target: [0, 0.3, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {phase === 'won' ? 'Hele problemet' : 'Kognitiv mangfoldighet'}
                    </SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[{ label: 'Sider opplyst', value: `${litCount}/${PERSPS.length}` }]}
                    />
                </>
            }
            scene={
                <CoreScene
                    lit={lit}
                    consumed={consumed}
                    litCount={litCount}
                    burst={burst}
                    burstColor={burstColor}
                    onClickShard={clickShard}
                />
            }
        >
            {/* Legende under vinduet: de fire perspektivene og hvilke som lyser. */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PERSPS.map((p) => {
                    const on = lit.includes(p.id);
                    return (
                        <div
                            key={p.id}
                            className={`rounded-xl border p-2.5 transition ${
                                on ? 'bg-white shadow-sm' : 'bg-slate-50 border-slate-200'
                            }`}
                            style={on ? { borderColor: p.color } : undefined}
                        >
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="w-3 h-3 rounded-full flex-shrink-0 transition"
                                    style={{
                                        backgroundColor: on ? p.color : '#cbd5e1',
                                        boxShadow: on ? `0 0 8px ${p.color}` : 'none',
                                    }}
                                />
                                <span className="text-xs font-bold text-slate-700">{p.label}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 leading-snug">{p.desc}</p>
                        </div>
                    );
                })}
            </div>

            {phase === 'won' && (
                <div className="mt-3">
                    <WinScreen title="Hele problemet lyser!" onReplay={reset}>
                        Hvert perspektiv lyste opp bare én side. Alene så ingen av dem hele
                        problemet. Sammen gjorde fire ulike vinkler hele kjernen tydelig. Det er
                        dette som menes med kognitiv mangfoldighet: grupper med ulike erfaringer og
                        perspektiver ser flere sider - og løser problemer bedre enn en gruppe der
                        alle tenker likt.
                    </WinScreen>
                </div>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function CoreScene({
    lit,
    consumed,
    litCount,
    burst,
    burstColor,
    onClickShard,
}: {
    lit: string[];
    consumed: Record<string, boolean>;
    litCount: number;
    burst: number;
    burstColor: string;
    onClickShard: (s: Shard) => void;
}) {
    return (
        <group>
            {/* Lys gulvflate - en rolig, abstrakt scene, ikke en åker. */}
            <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[14, 48]} />
                <meshStandardMaterial color="#dde6f5" roughness={1} />
            </mesh>

            {/* Problemkjernen */}
            <Core litCount={litCount} />

            {/* Fire sidepaneler rundt kjernen */}
            {PERSPS.map((p) => (
                <SidePanel key={p.id} persp={p} on={lit.includes(p.id)} />
            ))}

            {/* Skårene i ytre ring */}
            {SHARDS.map((s) => (
                <ShardObject
                    key={s.key}
                    shard={s}
                    consumed={!!consumed[s.key]}
                    onSelect={() => onClickShard(s)}
                />
            ))}

            <Burst
                position={[0, 0.4, 0]}
                trigger={burst}
                color={burstColor}
                count={30}
                spread={4}
            />
        </group>
    );
}

// Den sentrale kjernen. Mørk og matt når den er uopplyst, lyser sterkere for
// hver side som tennes, og blomstrer ved full opplysning.
function Core({ litCount }: { litCount: number }) {
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    const glow = useRef<THREE.Mesh>(null);
    const grp = useRef<THREE.Group>(null);
    const target = litCount / PERSPS.length;

    useFrame((state, dt) => {
        if (grp.current) {
            grp.current.rotation.y += dt * 0.25;
            const s = 1 + target * 0.12;
            grp.current.scale.setScalar(damp(grp.current.scale.x, s, dt, 4));
        }
        if (mat.current) {
            mat.current.emissiveIntensity = damp(
                mat.current.emissiveIntensity,
                0.08 + target * 0.9,
                dt,
                4
            );
            const c = mat.current.color;
            const goal = new THREE.Color('#94a3b8').lerp(new THREE.Color('#fff4d6'), target);
            c.lerp(goal, 1 - Math.exp(-4 * dt));
            mat.current.emissive.lerp(new THREE.Color('#fbbf24'), 1 - Math.exp(-3 * dt));
        }
        if (glow.current) {
            const gm = glow.current.material as THREE.MeshBasicMaterial;
            gm.opacity = damp(gm.opacity, 0.05 + target * 0.32, dt, 4);
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.04 * target;
            glow.current.scale.setScalar(pulse);
        }
    });

    return (
        <group ref={grp} position={[0, 0.3, 0]}>
            <mesh castShadow>
                <icosahedronGeometry args={[1.15, 0]} />
                <meshStandardMaterial
                    ref={mat}
                    color="#94a3b8"
                    emissive="#475569"
                    emissiveIntensity={0.08}
                    roughness={0.35}
                    metalness={0.1}
                    flatShading
                />
            </mesh>
            {/* Myk atmosfære-glød */}
            <mesh ref={glow}>
                <sphereGeometry args={[1.8, 24, 24]} />
                <meshBasicMaterial
                    color="#ffe9a8"
                    transparent
                    opacity={0.05}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
}

// Ett av de fire sidepanelene. Grått og dødt til perspektivet er valgt, da
// lyser det i perspektivets farge.
function SidePanel({ persp, on }: { persp: Persp; on: boolean }) {
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    const grp = useRef<THREE.Group>(null);
    const a = deg(persp.angle);
    const x = Math.cos(a) * PANEL_R;
    const z = Math.sin(a) * PANEL_R;

    useFrame((_, dt) => {
        if (mat.current) {
            mat.current.emissiveIntensity = damp(
                mat.current.emissiveIntensity,
                on ? 0.9 : 0,
                dt,
                5
            );
            const goal = new THREE.Color(on ? persp.color : '#9aa6b8');
            mat.current.color.lerp(goal, 1 - Math.exp(-5 * dt));
            mat.current.emissive.lerp(
                new THREE.Color(on ? persp.color : '#000000'),
                1 - Math.exp(-5 * dt)
            );
        }
        if (grp.current) {
            const ty = on ? 0.3 : 0;
            grp.current.position.y = damp(grp.current.position.y, ty, dt, 5);
        }
    });

    return (
        <group ref={grp} position={[x, 0, z]} rotation={[0, -a + Math.PI / 2, 0]}>
            <mesh castShadow>
                <boxGeometry args={[1.1, 1.1, 0.18]} />
                <meshStandardMaterial
                    ref={mat}
                    color="#9aa6b8"
                    emissive="#000000"
                    emissiveIntensity={0}
                    roughness={0.5}
                    flatShading
                />
            </mesh>
        </group>
    );
}

// Et flytende skår i ytre ring. Klikkbart via Interactive (stor hitArea for
// trackpad). Når det er brukt opp, krymper det inn mot kjernen og forsvinner.
function ShardObject({
    shard,
    consumed,
    onSelect,
}: {
    shard: Shard;
    consumed: boolean;
    onSelect: () => void;
}) {
    const grp = useRef<THREE.Group>(null);
    const persp = PERSP_BY_ID[shard.persp];
    const a = deg(shard.angle);
    const home = useMemo<[number, number, number]>(
        () => [Math.cos(a) * RING_R, 0.5, Math.sin(a) * RING_R],
        [a]
    );
    // Deterministisk fase-forskyvning så skårene bobber i utakt.
    const bob = a * 1.7;

    useFrame((state, dt) => {
        if (!grp.current) return;
        const t = state.clock.elapsedTime;
        if (consumed) {
            // Fløy inn i kjernen og forsvant.
            grp.current.position.x = damp(grp.current.position.x, 0, dt, 5);
            grp.current.position.z = damp(grp.current.position.z, 0, dt, 5);
            grp.current.position.y = damp(grp.current.position.y, 0.3, dt, 5);
            const s = damp(grp.current.scale.x, 0.0001, dt, 5);
            grp.current.scale.setScalar(s);
        } else {
            grp.current.position.x = damp(grp.current.position.x, home[0], dt, 4);
            grp.current.position.z = damp(grp.current.position.z, home[2], dt, 4);
            grp.current.position.y = home[1] + Math.sin(t * 1.4 + bob) * 0.18;
            grp.current.rotation.y += dt * 0.6;
            const s = damp(grp.current.scale.x, 1, dt, 4);
            grp.current.scale.setScalar(s);
        }
    });

    return (
        <group ref={grp} position={home}>
            <Interactive onSelect={onSelect} disabled={consumed} hitArea={[1.6, 1.8, 1.6]}>
                {(s) => (
                    <group>
                        <mesh castShadow>
                            <octahedronGeometry args={[0.6, 0]} />
                            <meshStandardMaterial
                                color={persp.color}
                                emissive={persp.color}
                                emissiveIntensity={s === 'hover' ? 0.95 : 0.55}
                                roughness={0.25}
                                metalness={0.15}
                                flatShading
                            />
                        </mesh>
                        {/* myk glød rundt skåret */}
                        <mesh>
                            <sphereGeometry args={[0.95, 16, 16]} />
                            <meshBasicMaterial
                                color={persp.color}
                                transparent
                                opacity={s === 'hover' ? 0.32 : 0.18}
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

export default Perspektivkjernen3D;
