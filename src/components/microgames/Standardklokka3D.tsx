import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { MicroGameScaffold } from './kit/MicroGameScaffold';
import { Rotatable, Burst, GroundPlane, Building, Tree, Person } from './kit';
import { SceneBanner, SceneBadge, DragHint, DataReadout, WinScreen } from './kit/overlays';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Standardklokka: jernbanen tvinger fram en felles tid.
//
// Lyspæren: før jernbanen hadde hver by sin egen klokke etter sola. Da togene
// begynte å gå etter ruteplan, ble det kaos - et tog "rakk" aldri stasjonen
// til riktig tid fordi klokkene viste ulikt. Eleven drar viseren på hvert
// klokketårn til samme standardtid (rett opp, klokka tolv). Når alle klokkene
// viser det samme, kan toget endelig kjøre ruta si - og klokka har blitt
// viktigere enn sola.
//
// Mekanikken ER pedagogikken: du føler kaoset i de skjeve klokkene, og du
// løser det ved å stille dem alle til EN tid.

function damp(cur: number, target: number, dt: number, speed: number) {
    return cur + (target - cur) * Math.min(1, dt * speed);
}

interface Town {
    id: string;
    name: string;
    x: number; // plass langs sporet
    localAngle: number; // viserens startvinkel (byens egen soltid)
    fact: string;
}

// Tre stasjoner vest for London. Lenger vest = sola står opp seinere =
// lokalklokka ligger mer bak London-tida. London (referansen) står allerede
// på standardtid og er fast.
const LONDON_X = -6.6;
const TOWNS: Town[] = [
    {
        id: 'reading',
        name: 'Reading',
        x: -2.2,
        localAngle: -1.15,
        fact: 'Reading ligger litt vest for London. Sola står opp seinere der, så lokalklokka gikk noen minutter bak London.',
    },
    {
        id: 'bristol',
        name: 'Bristol',
        x: 2.0,
        localAngle: 1.95,
        fact: 'Bristol ligger lenger vest. Før jernbanen var Bristol-klokka rundt ti minutter bak London-tida.',
    },
    {
        id: 'exeter',
        name: 'Exeter',
        x: 6.2,
        localAngle: -2.5,
        fact: 'Exeter ligger lengst vest. Der lå soltida enda mer bak London-tida.',
    },
];

const END_X = 7.8;

type Phase = 'setting' | 'running' | 'done';

export default function Standardklokka3D({ onComplete }: MicroGameProps) {
    const sounds = useStepSounds();
    const [aligned, setAligned] = useState<string[]>([]);
    const [phase, setPhase] = useState<Phase>('setting');
    const [banner, setBanner] = useState<string | null>(null);
    const [fact, setFact] = useState<string | null>(null);
    const [burst, setBurst] = useState(0);
    const [resetKey, setResetKey] = useState(0);

    const onAlign = (town: Town) => {
        if (aligned.includes(town.id) || phase !== 'setting') return;
        const next = [...aligned, town.id];
        setAligned(next);
        setBanner(`${town.name} stilt til standardtid`);
        setFact(town.fact);
        if (next.length === TOWNS.length) {
            setBurst((b) => b + 1);
            window.setTimeout(() => {
                sounds.play('advance');
                setPhase('running');
                setBanner('Alle klokkene viser samme tid - toget kan kjøre!');
                setFact(
                    'I 1847 bestemte de britiske jernbaneselskapene at alle stasjoner skulle bruke samme tid: Greenwich-tid. Klokka ble plutselig viktigere enn sola.'
                );
            }, 700);
        }
    };

    const onArrive = () => {
        if (phase === 'done') return;
        sounds.play('complete');
        setBurst((b) => b + 1);
        setPhase('done');
        setBanner('Toget er framme - i rute!');
        onComplete({ score: 1, completed: true, artifact: { standardtid: true } });
    };

    const reset = () => {
        setAligned([]);
        setPhase('setting');
        setBanner(null);
        setFact(null);
        setResetKey((k) => k + 1);
    };

    const idle = aligned.length === 0 && phase === 'setting';
    const era =
        phase === 'done'
            ? 'Ruta går - takket være standardtid'
            : phase === 'running'
              ? 'Toget kjører'
              : 'England, 1840-tallet';

    return (
        <MicroGameScaffold
            title="Still klokkene til togets tid"
            subtitle="Dra viseren på hvert klokketårn til samme tid, så toget endelig kan kjøre etter ruteplanen"
            estimatedSeconds={150}
            onRetry={aligned.length > 0 || phase !== 'setting' ? reset : undefined}
            canvas={{
                idle,
                camera: { position: [0.5, 7, 16], fov: 42 },
                background: '#c4cdd6',
                fog: { color: '#cfd6dd', near: 30, far: 60 },
                target: [0, 2.4, 0],
                light: 'overcast',
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">{era}</SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[{ label: 'Standardtid', value: `${aligned.length}/${TOWNS.length}` }]}
                    />
                    <DragHint show={idle} corner="bc">
                        Dra viseren til klokka står rett opp på tolv
                    </DragHint>
                </>
            }
            scene={
                <RailwayScene
                    aligned={aligned}
                    phase={phase}
                    burst={burst}
                    resetKey={resetKey}
                    onAlign={onAlign}
                    onArrive={onArrive}
                />
            }
        >
            {/* Kontroller / status under vinduet */}
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-amber-700">
                {phase === 'setting'
                    ? `Klokker stilt til standardtid: ${aligned.length} av ${TOWNS.length}`
                    : phase === 'running'
                      ? 'Toget kjører etter ruta'
                      : 'Toget kom fram i rute'}
            </p>

            <div className="grid grid-cols-3 gap-2.5">
                {TOWNS.map((t) => {
                    const ok = aligned.includes(t.id);
                    return (
                        <div
                            key={t.id}
                            className={`rounded-xl border-2 p-2.5 text-left transition ${
                                ok
                                    ? 'border-emerald-300 bg-emerald-50'
                                    : 'border-amber-300 bg-amber-50'
                            }`}
                        >
                            <span className="block text-sm font-bold leading-tight text-slate-800">
                                {t.name}
                            </span>
                            <span
                                className={`block text-xs ${ok ? 'text-emerald-700' : 'text-slate-500'}`}
                            >
                                {ok ? 'Standardtid' : 'Lokal soltid'}
                            </span>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {phase === 'done' ? (
                    <motion.div key="win" className="mt-3">
                        <WinScreen
                            title="Klokka ble viktigere enn sola."
                            onReplay={reset}
                        >
                            Før jernbanen hadde hver by sin egen tid etter sola. Togene trengte EN
                            felles klokke for at ruteplanen skulle stemme. Slik fant jernbanen opp
                            standardtida vi fortsatt lever etter.
                        </WinScreen>
                    </motion.div>
                ) : fact ? (
                    <motion.div
                        key={fact}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 rounded-xl border border-amber-200 bg-white p-3"
                    >
                        <p className="text-xs leading-relaxed text-slate-600">{fact}</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 px-2 text-center text-xs italic text-slate-500"
                    >
                        Hver by har sin egen klokke etter sola. Dra viserne til samme tid, så toget
                        kan kjøre.
                    </motion.div>
                )}
            </AnimatePresence>
        </MicroGameScaffold>
    );
}

// ============================================================
//  3D-SCENEN
// ============================================================

function RailwayScene({
    aligned,
    phase,
    burst,
    resetKey,
    onAlign,
    onArrive,
}: {
    aligned: string[];
    phase: Phase;
    burst: number;
    resetKey: number;
    onAlign: (t: Town) => void;
    onArrive: () => void;
}) {
    return (
        <group>
            <GroundPlane color="#869a78" />
            <Rails />
            {/* London - referansestasjonen med klokka som allerede viser standardtid */}
            <ReferenceStation x={LONDON_X} />
            {TOWNS.map((t) => (
                <ClockTower
                    key={`${t.id}-${resetKey}`}
                    town={t}
                    aligned={aligned.includes(t.id)}
                    onAlign={() => onAlign(t)}
                />
            ))}
            <Train running={phase !== 'setting'} startX={LONDON_X} endX={END_X} onArrive={onArrive} />
            <Burst position={[END_X, 1.6, 0]} trigger={burst} color="#e8c34a" count={22} spread={2.4} />
        </group>
    );
}

// To skinner med sviller langs x-aksen.
function Rails() {
    const sleepers = [];
    for (let x = -8.5; x <= 8.5; x += 0.9) {
        sleepers.push(x);
    }
    return (
        <group position={[0, 0, 0]}>
            {/* grusbed */}
            <mesh position={[0, 0.04, 0]} receiveShadow>
                <boxGeometry args={[18, 0.08, 1.5]} />
                <meshStandardMaterial color="#8a8276" roughness={1} />
            </mesh>
            {sleepers.map((x) => (
                <mesh key={x} position={[x, 0.12, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.18, 0.1, 1.3]} />
                    <meshStandardMaterial color="#5a4631" roughness={0.95} />
                </mesh>
            ))}
            {[-0.45, 0.45].map((z) => (
                <mesh key={z} position={[0, 0.2, z]} castShadow>
                    <boxGeometry args={[18, 0.1, 0.08]} />
                    <meshStandardMaterial color="#7d7d84" metalness={0.5} roughness={0.4} />
                </mesh>
            ))}
        </group>
    );
}

// Et klokketårn med en viser eleven kan dra. Når viseren står rett opp
// (standardtid), låser den seg grønn.
function ClockTower({
    town,
    aligned,
    onAlign,
}: {
    town: Town;
    aligned: boolean;
    onAlign: () => void;
}) {
    const clockY = 3.4;
    return (
        <group position={[town.x, 0, -1.7]}>
            {/* by rundt stasjonen */}
            <Building position={[-1.4, 0, -1.2]} body="#9c5a3c" roof="#43321f" seed={town.x} />
            <Building position={[1.5, 0, -1.0]} body="#86603f" roof="#3c2b1a" seed={town.x + 4} />
            <Tree position={[2.4, 0, -0.2]} leaf="#4a6b3a" seed={town.x} />
            {/* perrong-folk */}
            <Person position={[-0.7, 0, 1.5]} body="#3c4a63" hat="cap" pose="idle" rotation={[0, 0.4, 0]} />

            {/* tårnkropp */}
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.0, 3.0, 1.0]} />
                <meshStandardMaterial color="#b9b0a0" roughness={0.9} />
            </mesh>
            <mesh position={[0, 3.15, 0]} castShadow>
                <coneGeometry args={[0.85, 0.7, 4]} />
                <meshStandardMaterial color="#5b4a3a" roughness={0.9} />
            </mesh>

            <ClockFace y={clockY} aligned={aligned} />

            {/* viseren: låst når stilt riktig, ellers drabar */}
            {aligned ? (
                <group position={[0, clockY, 0.56]}>
                    <ClockHand color="#10874f" />
                </group>
            ) : (
                <Rotatable
                    axis="z"
                    position={[0, clockY, 0.56]}
                    initial={town.localAngle}
                    target={0}
                    tolerance={0.22}
                    sensitivity={0.014}
                    onAlign={onAlign}
                >
                    {/* romslig usynlig gripeflate for trackpad */}
                    <mesh>
                        <boxGeometry args={[1.1, 1.1, 0.5]} />
                        <meshBasicMaterial transparent opacity={0} />
                    </mesh>
                    <ClockHand color="#b9322b" />
                </Rotatable>
            )}

            {/* signal-lampe på perrongen */}
            <SignalLamp on={aligned} />
        </group>
    );
}

// Selve klokkeskiva (rim + skive + 12 hakk + topp-markør). Rimet lyser grønt
// når viseren står riktig.
function ClockFace({ y, aligned }: { y: number; aligned: boolean }) {
    const rimRef = useRef<THREE.MeshStandardMaterial>(null);
    useFrame((_, dt) => {
        if (rimRef.current) {
            rimRef.current.emissiveIntensity = damp(
                rimRef.current.emissiveIntensity,
                aligned ? 0.7 : 0,
                dt,
                3
            );
        }
    });
    const ticks = [];
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ticks.push(
            <mesh key={i} position={[Math.sin(a) * 0.62, Math.cos(a) * 0.62, 0.07]}>
                <boxGeometry args={[0.05, 0.12, 0.04]} />
                <meshStandardMaterial color="#3a3530" />
            </mesh>
        );
    }
    return (
        <group position={[0, y, 0.48]}>
            {/* rim */}
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.78, 0.78, 0.12, 28]} />
                <meshStandardMaterial
                    ref={rimRef}
                    color="#e7dcc4"
                    emissive="#39d98a"
                    emissiveIntensity={0}
                    roughness={0.6}
                />
            </mesh>
            {/* skive */}
            <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.68, 0.68, 0.06, 28]} />
                <meshStandardMaterial color="#fbf6ea" roughness={0.7} />
            </mesh>
            {ticks}
            {/* topp-markør: hit skal viseren peke */}
            <mesh position={[0, 0.74, 0.08]}>
                <coneGeometry args={[0.1, 0.18, 3]} />
                <meshStandardMaterial color="#c8881f" emissive="#c8881f" emissiveIntensity={0.4} />
            </mesh>
        </group>
    );
}

// Viseren: peker rett opp (+y) ved rotasjon 0, med en motvekt og et nav.
function ClockHand({ color }: { color: string }) {
    return (
        <group>
            <mesh position={[0, 0.27, 0]} castShadow>
                <boxGeometry args={[0.07, 0.62, 0.05]} />
                <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
                <boxGeometry args={[0.07, 0.24, 0.05]} />
                <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.09, 0.09, 0.08, 12]} />
                <meshStandardMaterial color="#2a2620" metalness={0.4} roughness={0.5} />
            </mesh>
        </group>
    );
}

// Liten lampe på en stolpe ved perrongen: rød når lokal tid, grønn når stilt.
function SignalLamp({ on }: { on: boolean }) {
    const matRef = useRef<THREE.MeshStandardMaterial>(null);
    useFrame((_, dt) => {
        if (matRef.current) {
            const r = on ? 0.2 : 0.85;
            const g = on ? 0.85 : 0.18;
            matRef.current.color.r = damp(matRef.current.color.r, r, dt, 4);
            matRef.current.color.g = damp(matRef.current.color.g, g, dt, 4);
            matRef.current.emissive.r = damp(matRef.current.emissive.r, r, dt, 4);
            matRef.current.emissive.g = damp(matRef.current.emissive.g, g, dt, 4);
        }
    });
    return (
        <group position={[1.0, 0, 1.4]}>
            <mesh position={[0, 0.6, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
                <meshStandardMaterial color="#4a4036" />
            </mesh>
            <mesh position={[0, 1.3, 0]}>
                <sphereGeometry args={[0.16, 14, 14]} />
                <meshStandardMaterial
                    ref={matRef}
                    color={'#d92f24'}
                    emissive={'#d92f24'}
                    emissiveIntensity={0.6}
                />
            </mesh>
        </group>
    );
}

// London-stasjonen: referansen med en klokke som allerede viser standardtid.
function ReferenceStation({ x }: { x: number }) {
    return (
        <group position={[x, 0, -1.7]}>
            <Building position={[-1.5, 0, -1.0]} body="#7d5236" roof="#3a2a1c" seed={1} />
            <Building position={[1.4, 0, -1.3]} body="#8c6a45" roof="#42301e" seed={9} />
            <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.1, 3.2, 1.1]} />
                <meshStandardMaterial color="#c3bba9" roughness={0.9} />
            </mesh>
            <mesh position={[0, 3.35, 0]} castShadow>
                <coneGeometry args={[0.9, 0.75, 4]} />
                <meshStandardMaterial color="#574636" roughness={0.9} />
            </mesh>
            <ClockFace y={3.55} aligned />
            <group position={[0, 3.55, 0.56]}>
                <ClockHand color="#c8881f" />
            </group>
            <Person position={[0.6, 0, 1.6]} body="#5a3c2a" hat="none" pose="idle" rotation={[0, -0.3, 0]} />
        </group>
    );
}

// Damplokomotiv med to vogner. Står på London-stasjonen og kjører langs
// sporet når alle klokkene er stilt.
function Train({
    running,
    startX,
    endX,
    onArrive,
}: {
    running: boolean;
    startX: number;
    endX: number;
    onArrive: () => void;
}) {
    const group = useRef<THREE.Group>(null);
    const arrived = useRef(false);
    const puff = useRef<THREE.Group>(null);

    useFrame(({ clock }, dt) => {
        const g = group.current;
        if (!g) return;
        const targetX = running ? endX : startX;
        g.position.x = damp(g.position.x, targetX, dt, running ? 1.1 : 6);
        // damp gleder, men vi vil ha jevn framdrift: skyv litt ekstra når langt unna
        if (running && endX - g.position.x > 0.2) {
            g.position.x += dt * 1.4;
        }
        if (running && !arrived.current && Math.abs(g.position.x - endX) < 0.25) {
            arrived.current = true;
            onArrive();
        }
        if (!running) arrived.current = false;
        // dampbølge fra skorsteinen
        if (puff.current) {
            puff.current.children.forEach((c, i) => {
                const m = c as THREE.Mesh;
                const t = (clock.getElapsedTime() * 0.8 + i * 0.4) % 1.2;
                m.position.y = 1.5 + t * 1.0;
                m.scale.setScalar(0.2 + t * 0.5);
                const mat = m.material as THREE.MeshStandardMaterial;
                mat.opacity = running ? Math.max(0, 0.5 - t * 0.4) : 0.12 * Math.max(0, 1 - t);
            });
        }
    });

    return (
        <group ref={group} position={[startX, 0, 0]}>
            {/* lokomotiv */}
            <mesh position={[0, 0.62, 0]} castShadow>
                <boxGeometry args={[1.7, 0.7, 0.8]} />
                <meshStandardMaterial color="#2f5a3e" roughness={0.6} />
            </mesh>
            <mesh position={[0.75, 0.62, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.36, 0.36, 1.1, 16]} />
                <meshStandardMaterial color="#243f2c" roughness={0.6} />
            </mesh>
            {/* førerhus */}
            <mesh position={[-0.6, 0.95, 0]} castShadow>
                <boxGeometry args={[0.6, 0.8, 0.85]} />
                <meshStandardMaterial color="#7a1f1a" roughness={0.7} />
            </mesh>
            {/* skorstein */}
            <mesh position={[0.9, 1.15, 0]} castShadow>
                <cylinderGeometry args={[0.14, 0.18, 0.5, 12]} />
                <meshStandardMaterial color="#1f1c18" roughness={0.8} />
            </mesh>
            {/* hjul */}
            {[-0.55, 0.05, 0.65].map((x) => (
                <mesh key={x} position={[x, 0.26, 0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.26, 0.26, 0.1, 16]} />
                    <meshStandardMaterial color="#33312c" metalness={0.3} roughness={0.6} />
                </mesh>
            ))}
            {[-0.55, 0.05, 0.65].map((x) => (
                <mesh key={x} position={[x, 0.26, -0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.26, 0.26, 0.1, 16]} />
                    <meshStandardMaterial color="#33312c" metalness={0.3} roughness={0.6} />
                </mesh>
            ))}
            {/* vogner */}
            {[-1.9, -3.0].map((x) => (
                <group key={x} position={[x, 0, 0]}>
                    <mesh position={[0, 0.62, 0]} castShadow>
                        <boxGeometry args={[0.95, 0.7, 0.78]} />
                        <meshStandardMaterial color="#9c7a3a" roughness={0.7} />
                    </mesh>
                    <mesh position={[-0.25, 0.26, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 0.08, 12]} />
                        <meshStandardMaterial color="#33312c" />
                    </mesh>
                    <mesh position={[0.25, 0.26, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 0.08, 12]} />
                        <meshStandardMaterial color="#33312c" />
                    </mesh>
                </group>
            ))}
            {/* dampbølge */}
            <group ref={puff} position={[0.9, 0, 0]}>
                {[0, 1, 2].map((i) => (
                    <mesh key={i} position={[0, 1.5, 0]}>
                        <sphereGeometry args={[0.3, 10, 10]} />
                        <meshStandardMaterial color="#e8e8ea" transparent opacity={0.3} depthWrite={false} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}
