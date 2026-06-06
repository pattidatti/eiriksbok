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

// Mikrospill: gjenreis den samiske kulturen.
// Fornorskinga prøvde å viske ut samisk språk og levesett. På en vidde står
// fem grå, dempede kulturuttrykk rundt en flaggstang, og en grå internatskole
// rager over dem. Eleven klikker hvert kulturuttrykk og vekker det til live -
// det får farge og reiser seg. Etter hvert som kulturen kommer tilbake, synker
// internatskolen ned i bakken og det samiske flagget heises og fargelegges.
// Lyspære: fornorskinga prøvde å fjerne disse, men kulturen kan tas tilbake og
// gjenreises - bit for bit.

interface KulturInfo {
    id: string;
    name: string;
    desc: string;
    color: string;
    angle: number;
}

const KULTUR: KulturInfo[] = [
    { id: 'lavvu', name: 'Lávvu', desc: 'Det samiske teltet', color: '#b45309', angle: 90 },
    { id: 'rein', name: 'Reinen', desc: 'Reindrifta', color: '#a16207', angle: 162 },
    { id: 'kofte', name: 'Kofta', desc: 'Den samiske drakta', color: '#1d4ed8', angle: 234 },
    { id: 'joik', name: 'Joiken', desc: 'Den samiske sangen', color: '#db2777', angle: 306 },
    { id: 'sprak', name: 'Språket', desc: 'Samisk morsmål', color: '#059669', angle: 18 },
];

const deg = (d: number) => (d * Math.PI) / 180;
const RING_R = 4.6;
const GREY = '#8b94a3';

const SamiskGjenreising3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [restored, setRestored] = useState<string[]>([]);
    const [won, setWon] = useState(false);
    const [banner, setBanner] = useState<string | null>(
        'Klikk et grått kulturuttrykk for å vekke det til live igjen.'
    );
    const [burst, setBurst] = useState(0);
    const [burstColor, setBurstColor] = useState('#ffe9a8');

    const reset = () => {
        setRestored([]);
        setWon(false);
        setBanner('Klikk et grått kulturuttrykk for å vekke det til live igjen.');
    };

    const revive = (k: KulturInfo) => {
        if (won || restored.includes(k.id)) return;
        sounds.play('correct');
        setBurstColor(k.color);
        setBurst((b) => b + 1);
        const next = [...restored, k.id];
        setRestored(next);
        if (next.length >= KULTUR.length) {
            setBanner(null);
            sounds.play('complete');
            setWon(true);
            onComplete({ score: 1, completed: true, artifact: { restored: next } });
        } else {
            setBanner(
                `${k.name} er tilbake: ${k.desc}. ${KULTUR.length - next.length} uttrykk er fortsatt dempet.`
            );
        }
    };

    const count = restored.length;

    return (
        <MicroGameScaffold
            title="Gjenreis den samiske kulturen"
            subtitle="Fem kulturuttrykk står grå og dempet etter fornorskinga. Vekk hvert av dem til live."
            estimatedSeconds={120}
            onRetry={count > 0 || won ? reset : undefined}
            canvas={{
                idle: !won && count === 0,
                camera: { position: [0, 5.5, 12.5], fov: 42 },
                background: '#dceaf2',
                target: [0, 0.6, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">{won ? 'Kulturen lever' : 'Sápmi'}</SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[{ label: 'Gjenreist', value: `${count}/${KULTUR.length}` }]}
                    />
                </>
            }
            scene={
                <SiidaScene
                    restored={restored}
                    count={count}
                    won={won}
                    burst={burst}
                    burstColor={burstColor}
                    onRevive={revive}
                />
            }
        >
            {/* Legende under vinduet */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {KULTUR.map((k) => {
                    const on = restored.includes(k.id);
                    return (
                        <div
                            key={k.id}
                            className={`rounded-xl border p-2.5 transition ${
                                on ? 'bg-white shadow-sm' : 'bg-slate-50 border-slate-200'
                            }`}
                            style={on ? { borderColor: k.color } : undefined}
                        >
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="w-3 h-3 rounded-full flex-shrink-0 transition"
                                    style={{
                                        backgroundColor: on ? k.color : '#cbd5e1',
                                        boxShadow: on ? `0 0 8px ${k.color}` : 'none',
                                    }}
                                />
                                <span className="text-xs font-bold text-slate-700">{k.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 leading-snug">{k.desc}</p>
                        </div>
                    );
                })}
            </div>

            {won && (
                <div className="mt-3">
                    <WinScreen title="Kulturen er gjenreist!" onReplay={reset}>
                        Fornorskinga prøvde å fjerne lávvuen, reindrifta, kofta, joiken og det
                        samiske språket. Men ingenting av dette var borte for alltid. De siste tiåra
                        har samene tatt kulturen sin tilbake - språket læres på nytt, joiken synges
                        igjen, og flagget heises med stolthet. En kultur kan dempes, men den kan
                        også reise seg igjen.
                    </WinScreen>
                </div>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function SiidaScene({
    restored,
    count,
    won,
    burst,
    burstColor,
    onRevive,
}: {
    restored: string[];
    count: number;
    won: boolean;
    burst: number;
    burstColor: string;
    onRevive: (k: KulturInfo) => void;
}) {
    return (
        <group>
            <Vidde count={count} />
            <Internatskole count={count} />
            <Flaggstang won={won} />

            {KULTUR.map((k) => (
                <KulturObjekt
                    key={k.id}
                    info={k}
                    restored={restored.includes(k.id)}
                    onRevive={() => onRevive(k)}
                />
            ))}

            <Burst position={[0, 2.6, 0]} trigger={burst} color={burstColor} count={32} spread={4.8} />
        </group>
    );
}

// Vidda: grå og dempet i starten, blir lys tundra-grønn når kulturen kommer tilbake.
function Vidde({ count }: { count: number }) {
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    const target = count / KULTUR.length;

    useFrame((_, dt) => {
        if (mat.current) {
            const goal = new THREE.Color('#9aa6b8').lerp(new THREE.Color('#c7e0c0'), target);
            mat.current.color.lerp(goal, 1 - Math.exp(-4 * dt));
        }
    });

    return (
        <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[14, 56]} />
            <meshStandardMaterial ref={mat} color="#9aa6b8" roughness={1} />
        </mesh>
    );
}

// Internatskolen: en grå bygning som raget over alt. Synker ned i bakken og
// blekner etter hvert som kulturen gjenreises.
function Internatskole({ count }: { count: number }) {
    const grp = useRef<THREE.Group>(null);
    const target = count / KULTUR.length;

    useFrame((_, dt) => {
        if (grp.current) {
            const y = damp(grp.current.position.y, -target * 3.2, dt, 3);
            grp.current.position.y = y;
            const s = damp(grp.current.scale.x, 1 - target * 0.25, dt, 3);
            grp.current.scale.setScalar(s);
        }
    });

    return (
        <group ref={grp} position={[0, 0, -2.2]}>
            {/* vegger */}
            <mesh position={[0, 0.6, 0]} castShadow>
                <boxGeometry args={[2.6, 2, 1.8]} />
                <meshStandardMaterial color="#6b7280" roughness={0.9} flatShading />
            </mesh>
            {/* tak */}
            <mesh position={[0, 1.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[2.1, 1, 4]} />
                <meshStandardMaterial color="#4b5563" roughness={0.9} flatShading />
            </mesh>
            {/* vinduer */}
            {[-0.7, 0, 0.7].map((x) => (
                <mesh key={x} position={[x, 0.7, 0.92]}>
                    <boxGeometry args={[0.4, 0.5, 0.05]} />
                    <meshStandardMaterial color="#374151" roughness={0.5} />
                </mesh>
            ))}
        </group>
    );
}

// Flaggstanga i sentrum. Flagget henger lavt og grått til all kultur er gjenreist;
// da heises det og fargene kommer fram.
function Flaggstang({ won }: { won: boolean }) {
    const flagg = useRef<THREE.Group>(null);
    const bands = useRef<THREE.MeshStandardMaterial[]>([]);
    const targetColors = ['#1d4ed8', '#db2777', '#eab308', '#059669'];

    useFrame((state, dt) => {
        if (flagg.current) {
            const targetY = won ? 2.6 : 0.2;
            flagg.current.position.y = damp(flagg.current.position.y, targetY, dt, 3);
            if (won) {
                flagg.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.04;
            }
        }
        bands.current.forEach((m, i) => {
            if (!m) return;
            const goal = new THREE.Color(won ? targetColors[i] : GREY);
            m.color.lerp(goal, 1 - Math.exp(-5 * dt));
        });
    });

    return (
        <group position={[0, 0, 1.4]}>
            {/* stang */}
            <mesh position={[0, 1.4, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 4.4, 8]} />
                <meshStandardMaterial color="#9a7b4f" roughness={0.7} />
            </mesh>
            {/* flagg med fire fargefelt */}
            <group ref={flagg} position={[0.55, 0.2, 0]}>
                {[0, 1, 2, 3].map((i) => (
                    <mesh key={i} position={[(i - 1.5) * 0.34, 0, 0]} castShadow>
                        <boxGeometry args={[0.34, 0.9, 0.05]} />
                        <meshStandardMaterial
                            ref={(el) => {
                                if (el) bands.current[i] = el;
                            }}
                            color={GREY}
                            roughness={0.6}
                            flatShading
                        />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

// Et kulturuttrykk. Grått og senket mens det er dempet. Klikkes for å reise det
// opp, gi det farge og en myk glød.
function KulturObjekt({
    info,
    restored,
    onRevive,
}: {
    info: KulturInfo;
    restored: boolean;
    onRevive: () => void;
}) {
    const grp = useRef<THREE.Group>(null);
    const mats = useRef<THREE.MeshStandardMaterial[]>([]);
    const aura = useRef<THREE.Mesh>(null);

    const a = deg(info.angle);
    const x = Math.cos(a) * RING_R;
    const z = Math.sin(a) * RING_R;

    useFrame((state, dt) => {
        const lift = restored ? 0.3 : 0;
        if (grp.current) {
            grp.current.position.y = damp(grp.current.position.y, lift, dt, 5);
            if (restored) {
                grp.current.position.y += Math.sin(state.clock.elapsedTime * 1.4 + a) * 0.04;
            }
        }
        const onCol = new THREE.Color(info.color);
        const offCol = new THREE.Color(GREY);
        mats.current.forEach((m) => {
            if (!m) return;
            m.color.lerp(restored ? onCol : offCol, 1 - Math.exp(-5 * dt));
            m.emissive.lerp(
                restored ? onCol : new THREE.Color('#000000'),
                1 - Math.exp(-5 * dt)
            );
            m.emissiveIntensity = damp(m.emissiveIntensity, restored ? 0.35 : 0, dt, 5);
        });
        if (aura.current) {
            const am = aura.current.material as THREE.MeshBasicMaterial;
            am.opacity = damp(am.opacity, restored ? 0.26 : 0, dt, 4);
            am.color.lerp(onCol, 1 - Math.exp(-5 * dt));
        }
    });

    const matRef = (el: THREE.MeshStandardMaterial | null) => {
        if (el && !mats.current.includes(el)) mats.current.push(el);
    };

    return (
        <group position={[x, 0, z]}>
            <Interactive
                onSelect={onRevive}
                disabled={restored}
                state={restored ? 'correct' : 'idle'}
                hitArea={[2, 2.8, 2]}
            >
                {(s) => (
                    <group ref={grp}>
                        <KulturMesh id={info.id} matRef={matRef} />
                        {!restored && s === 'hover' && (
                            <mesh position={[0, 2, 0]}>
                                <sphereGeometry args={[0.12, 12, 12]} />
                                <meshBasicMaterial color={info.color} />
                            </mesh>
                        )}
                        <mesh ref={aura} position={[0, 0.6, 0]}>
                            <sphereGeometry args={[1.2, 18, 18]} />
                            <meshBasicMaterial
                                color={info.color}
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

// Selve formen for hvert kulturuttrykk. Enkle lavpoly-mesher.
function KulturMesh({
    id,
    matRef,
}: {
    id: string;
    matRef: (el: THREE.MeshStandardMaterial | null) => void;
}) {
    const makeMat = (props: object = {}) => (
        <meshStandardMaterial ref={matRef} color={GREY} roughness={0.6} flatShading {...props} />
    );

    if (id === 'lavvu') {
        return (
            <group>
                <mesh position={[0, 0.7, 0]} castShadow>
                    <coneGeometry args={[0.95, 1.7, 8]} />
                    {makeMat()}
                </mesh>
                {/* stenger på toppen */}
                <mesh position={[0, 1.7, 0]} rotation={[0.2, 0, 0.2]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
                    {makeMat()}
                </mesh>
            </group>
        );
    }
    if (id === 'rein') {
        return (
            <group position={[0, 0.55, 0]}>
                {/* kropp */}
                <mesh castShadow>
                    <capsuleGeometry args={[0.32, 0.7, 4, 8]} />
                    {makeMat()}
                </mesh>
                {/* hals/hode */}
                <mesh position={[0.5, 0.35, 0]} rotation={[0, 0, -0.5]} castShadow>
                    <capsuleGeometry args={[0.14, 0.5, 4, 8]} />
                    {makeMat()}
                </mesh>
                {/* gevir */}
                {[-0.12, 0.12].map((z) => (
                    <mesh key={z} position={[0.75, 0.7, z]} rotation={[0, 0, 0.4]}>
                        <coneGeometry args={[0.06, 0.5, 5]} />
                        {makeMat()}
                    </mesh>
                ))}
                {/* bein */}
                {[
                    [0.25, -0.2],
                    [-0.25, -0.2],
                    [0.25, 0.2],
                    [-0.25, 0.2],
                ].map(([bx, bz], i) => (
                    <mesh key={i} position={[bx, -0.45, bz]}>
                        <cylinderGeometry args={[0.06, 0.06, 0.5, 6]} />
                        {makeMat()}
                    </mesh>
                ))}
            </group>
        );
    }
    if (id === 'kofte') {
        return (
            <group position={[0, 0.1, 0]}>
                {/* kropp/kofte */}
                <mesh position={[0, 0.55, 0]} castShadow>
                    <cylinderGeometry args={[0.36, 0.52, 1.2, 10]} />
                    {makeMat()}
                </mesh>
                {/* hode */}
                <mesh position={[0, 1.4, 0]} castShadow>
                    <sphereGeometry args={[0.28, 16, 16]} />
                    {makeMat({ color: '#d6c3a3' })}
                </mesh>
                {/* lue */}
                <mesh position={[0, 1.7, 0]} castShadow>
                    <coneGeometry args={[0.26, 0.4, 8]} />
                    {makeMat()}
                </mesh>
            </group>
        );
    }
    if (id === 'joik') {
        return (
            <group position={[0, 0.4, 0]}>
                {/* syngende figur */}
                <mesh position={[0, 0.4, 0]} castShadow>
                    <cylinderGeometry args={[0.3, 0.42, 0.95, 10]} />
                    {makeMat()}
                </mesh>
                <mesh position={[0, 1.1, 0]} castShadow>
                    <sphereGeometry args={[0.25, 16, 16]} />
                    {makeMat({ color: '#d6c3a3' })}
                </mesh>
                {/* lydringer */}
                {[0.5, 0.85, 1.2].map((r, i) => (
                    <mesh key={i} position={[0.5, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[r, 0.04, 8, 24, Math.PI]} />
                        {makeMat()}
                    </mesh>
                ))}
            </group>
        );
    }
    // sprak: en skiltplate med "tekst"-striper
    return (
        <group position={[0, 0.5, 0]}>
            {/* stolpe */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 1.4, 6]} />
                {makeMat({ color: '#7c5c33' })}
            </mesh>
            {/* skilt */}
            <mesh position={[0, 0.9, 0]} castShadow>
                <boxGeometry args={[1.2, 0.8, 0.08]} />
                {makeMat()}
            </mesh>
            {/* tekstlinjer */}
            {[0.18, -0.02, -0.22].map((y) => (
                <mesh key={y} position={[0, 0.9 + y, 0.05]}>
                    <boxGeometry args={[0.8, 0.07, 0.04]} />
                    {makeMat({ color: '#e2e8f0' })}
                </mesh>
            ))}
        </group>
    );
}

export default SamiskGjenreising3D;
