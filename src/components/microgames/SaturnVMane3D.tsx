import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Rocket } from 'lucide-react';
import {
    MicroGameScaffold,
    Draggable,
    Hotspot,
    GroundPlane,
    SceneBanner,
    SceneBadge,
    DragHint,
    SceneFact,
    WinScreen,
    StepTracker,
    DataReadout,
    damp,
    Burst,
    Particles,
    GlowMaterial,
    GlowHalo,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill for Romkappløpet. Eleven BYGGER en Saturn V-rakett ved å stable
// de tre trinnene oppå hverandre, tenner motorene, og slipper hvert tomme
// trinn ett for ett mens raketten klatrer. Lyspæren: Apollo 11 nådde månen
// fordi den kastet fra seg de tunge, tomme trinnene - bare slik ble fartøyet
// lett nok til å rive seg løs fra jordas tyngdekraft.
//
// Interaksjon: dra trinnene på plass (Draggable), tenn motorene (knapp),
// slipp hvert trinn (Hotspot i scenen). Fler-stegs forvandling: for hvert
// trinn som faller av synker massen og høyden stiger.

type Phase = 'build' | 'ready' | 'flight' | 'landed';

// Trinnene, nedenfra og opp. center = y-senter når trinnet står ferdig stablet.
const STAGES = [
    { key: 's1', h: 1.6, r: 0.46, color: '#eef1f4', center: 0.8, label: 'Trinn 1' },
    { key: 's2', h: 1.2, r: 0.46, color: '#e1e6ec', center: 2.2, label: 'Trinn 2' },
    { key: 's3', h: 0.9, r: 0.34, color: '#eef1f4', center: 3.25, label: 'Trinn 3' },
];

// Hvor høyt rakett-stabelen står (climbY) i hvert flysteg. Capsel-senteret er
// ca. 4.05, så ved siste steg når den månen rundt y = 8.
const ALT = [1.0, 1.9, 2.9, 3.95];
const MOON_Y = 8.0;

// Illustrerende tall (avrundet) som synliggjør at massen stuper når trinn slippes.
const READOUT = [
    { mass: '660', alt: '60' },
    { mass: '165', alt: '185' },
    { mass: '45', alt: '380 000' },
    { mass: '45', alt: '380 000' },
];

const SaturnVMane3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [phase, setPhase] = useState<Phase>('build');
    const [placed, setPlaced] = useState(0);
    const [flightStep, setFlightStep] = useState(0);
    const [dropped, setDropped] = useState<{ i: number; startY: number }[]>([]);
    const [banner, setBanner] = useState<string | null>(null);
    const [fact, setFact] = useState<string | null>(null);
    const [burst, setBurst] = useState(0);

    const reset = () => {
        setPhase('build');
        setPlaced(0);
        setFlightStep(0);
        setDropped([]);
        setBanner(null);
        setFact(null);
    };

    const droppedCount = Math.min(flightStep, 2);
    const climbStep = phase === 'flight' || phase === 'landed' ? Math.min(flightStep, 3) : -1;

    // Sett et trinn på rampen. Draggable snapper til [0,0], så et treff betyr
    // at trinnet ligger over rampen.
    const placeStage = (pos: THREE.Vector3) => {
        const dist = Math.hypot(pos.x, pos.z);
        if (dist > 1.6) {
            setBanner('Dra trinnet helt inn over utskytningsrampen.');
            return;
        }
        const next = placed + 1;
        setPlaced(next);
        if (next < 3) {
            sounds.play('correct');
            setBanner(
                next === 1
                    ? 'Trinn 1 står. Det største trinnet bærer mest drivstoff.'
                    : 'Trinn 2 på plass. Stable det siste trinnet med romfartøyet på toppen.'
            );
        } else {
            sounds.play('advance');
            setPhase('ready');
            setBanner('Raketten er ferdig montert. Tenn motorene!');
        }
    };

    const ignite = () => {
        sounds.play('advance');
        setPhase('flight');
        setFlightStep(0);
        setBurst((b) => b + 1);
        setBanner('Raketten letter! Trinn 1 brenner snart tomt - slipp det da.');
        setFact(
            'En full Saturn V veide nesten 3000 tonn. Nesten alt var drivstoff. Den måtte være enorm bare for å løfte seg selv opp fra bakken.'
        );
    };

    const dropStage = () => {
        if (phase !== 'flight' || flightStep >= 2) return;
        sounds.play('drop');
        setDropped((d) => [...d, { i: flightStep, startY: STAGES[flightStep].center + ALT[flightStep] }]);
        const ns = flightStep + 1;
        setFlightStep(ns);
        setBurst((b) => b + 1);
        if (ns === 1) {
            setBanner('Trinn 1 falt av! Raketten ble mye lettere og skyter fart. Nå brenner trinn 2.');
            setFact(
                'Det tomme trinnet er bare dødvekt. Ved å slippe det slipper raketten å dra på en tung, tom tank videre.'
            );
        } else if (ns === 2) {
            setBanner('Trinn 2 falt av! Bare det lille fartøyet er igjen - lett nok til å nå månen.');
            setFact(
                'Nå er nesten all vekten borte. Det lille som er igjen, kan gli helt til månen.'
            );
            window.setTimeout(() => {
                sounds.play('advance');
                setFlightStep(3);
                setBanner('Apollo glir mot månen.');
            }, 1500);
            window.setTimeout(() => land(), 3400);
        }
    };

    const land = () => {
        sounds.play('complete');
        setBurst((b) => b + 1);
        setPhase('landed');
        setBanner(null);
        window.setTimeout(() => onComplete({ score: 1, completed: true }), 200);
    };

    const idle = phase === 'build' && placed === 0;
    const badge =
        phase === 'landed'
            ? 'På månen'
            : phase === 'flight'
              ? flightStep >= 3
                  ? 'Mot månen'
                  : `Trinn ${droppedCount + 1} brenner`
              : phase === 'ready'
                ? 'Klar til oppskyting'
                : 'Monteringen';

    return (
        <MicroGameScaffold
            title="Saturn V til månen"
            subtitle="Bygg raketten, tenn motorene, og slipp hvert tomme trinn på vei opp"
            estimatedSeconds={150}
            onRetry={placed > 0 || phase !== 'build' ? reset : undefined}
            canvas={{
                idle,
                camera: { position: [1.5, 4.4, 13.5], fov: 44 },
                background: '#cfe2f2',
                fog: null,
                target: [0, 4, 0],
                minPolarAngle: Math.PI / 8,
                maxPolarAngle: Math.PI / 2.1,
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">{badge}</SceneBadge>
                    {(phase === 'flight' || phase === 'landed') && (
                        <DataReadout
                            corner="bl"
                            items={[
                                { label: 'Masse', value: READOUT[Math.min(flightStep, 3)].mass, unit: 'tonn' },
                                { label: 'Høyde', value: READOUT[Math.min(flightStep, 3)].alt, unit: 'km' },
                            ]}
                        />
                    )}
                    <DragHint show={idle}>Dra trinnet opp på rampen</DragHint>
                </>
            }
            scene={
                <LaunchScene
                    phase={phase}
                    placed={placed}
                    flightStep={flightStep}
                    climbStep={climbStep}
                    droppedCount={droppedCount}
                    dropped={dropped}
                    burst={burst}
                    onPlaceStage={placeStage}
                    onDropStage={dropStage}
                />
            }
        >
            {phase === 'build' && (
                <div className="flex flex-col gap-2.5">
                    <StepTracker current={placed} total={3} />
                    <p className="text-sm text-slate-600">
                        Dra trinnet fra siden og slipp det over utskytningsrampen. Raketten bygges
                        nedenfra og opp - det største og tyngste trinnet helt nederst.
                    </p>
                    {fact && <SceneFact>{fact}</SceneFact>}
                </div>
            )}

            {phase === 'ready' && (
                <div className="rounded-xl border border-amber-200 bg-white p-3 sm:flex sm:items-center sm:gap-4">
                    <p className="text-xs text-slate-600 leading-relaxed min-w-0 flex-1">
                        <span className="font-bold text-slate-800">Raketten er ferdig.</span> Tre
                        trinn stablet oppå hverandre, med romfartøyet øverst. Trykk for å tenne
                        motorene.
                    </p>
                    <button
                        onClick={ignite}
                        className="mt-2.5 sm:mt-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition flex-shrink-0"
                    >
                        <Rocket className="w-4 h-4" />
                        Tenn motorene
                    </button>
                </div>
            )}

            {phase === 'flight' && (
                <div className="flex flex-col gap-2.5">
                    <p className="text-sm text-slate-600">
                        {flightStep < 2
                            ? 'Klikk den pulserende ringen ved bunnen av raketten for å slippe det tomme trinnet. Mindre vekt betyr mer fart.'
                            : 'Fartøyet er lett nok. Se det gli de siste milene mot månen.'}
                    </p>
                    {fact && <SceneFact>{fact}</SceneFact>}
                </div>
            )}

            {phase === 'landed' && (
                <WinScreen title="Apollo er på månen!" onReplay={reset}>
                    Raketten klarte aldri å nå månen i ett stykke. Hemmeligheten var å bygge den i
                    trinn og kaste fra seg hvert tomt trinn underveis. For hver tank som falt av, ble
                    fartøyet lettere - og først da ble det lett nok til å rive seg løs fra jordas
                    tyngdekraft og nå helt fram.
                </WinScreen>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function LaunchScene({
    phase,
    placed,
    flightStep,
    climbStep,
    droppedCount,
    dropped,
    burst,
    onPlaceStage,
    onDropStage,
}: {
    phase: Phase;
    placed: number;
    flightStep: number;
    climbStep: number;
    droppedCount: number;
    dropped: { i: number; startY: number }[];
    burst: number;
    onPlaceStage: (pos: THREE.Vector3) => void;
    onDropStage: () => void;
}) {
    const flying = phase === 'flight' || phase === 'landed';
    const targetClimb = climbStep >= 0 ? ALT[climbStep] : 0;

    // Hvilke trinn henger fortsatt på raketten?
    const attached: number[] = [];
    if (flying) {
        for (let i = droppedCount; i < 3; i++) attached.push(i);
    } else {
        for (let i = 0; i < placed; i++) attached.push(i);
    }

    // Bunnen av nederste festede trinn (for flamme + hotspot), i lokal høyde.
    const bottomStage = attached[0] ?? 0;
    const bottomY = STAGES[bottomStage].center - STAGES[bottomStage].h / 2;

    return (
        <group>
            <SkyDome />
            <GroundPlane size={48} depth={40} color="#9bb36a" />
            {/* Atmosfære-støv lavt, stjerner høyt oppe (lyse motes) */}
            <Particles preset="motes" center={[0, 7, 0]} area={[20, 12]} height={6} count={40} />

            <LaunchPad />

            {/* Romfartøyet/raketten som stiger */}
            <RocketAssembly targetClimb={targetClimb} bottomY={bottomY} flying={flying} burst={burst}>
                {attached.map((i) => (
                    <StageMesh key={STAGES[i].key} index={i} />
                ))}
                {/* Motorflamme ved bunnen mens den flyr */}
                {phase === 'flight' && <EngineFlame y={bottomY} />}
                {/* Slipp-knapp i scenen */}
                {phase === 'flight' && flightStep < 2 && (
                    <Hotspot
                        position={[0, bottomY + 0.2, 0]}
                        onSelect={onDropStage}
                        label="Slipp det tomme trinnet"
                        radius={0.5}
                        color="#f97316"
                    />
                )}
            </RocketAssembly>

            {/* Trinn som har falt av og tumler nedover */}
            {dropped.map((d) => (
                <FallingStage key={d.i} index={d.i} startY={d.startY} />
            ))}

            {/* Trinnet eleven holder på å montere */}
            {phase === 'build' && placed < 3 && (
                <>
                    <GhostSlot index={placed} />
                    <Draggable
                        position={[-4, 0, 1.6]}
                        planeY={0}
                        bounds={{ minX: -6, maxX: 4, minZ: -4, maxZ: 5 }}
                        snapPoints={[[0, 0]]}
                        snapRadius={2.2}
                        onDrop={onPlaceStage}
                        liftY={0.5}
                    >
                        {/* Romslig usynlig gripeflate */}
                        <mesh position={[0, STAGES[placed].h / 2, 0]}>
                            <boxGeometry args={[1.6, STAGES[placed].h + 0.8, 1.6]} />
                            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                        </mesh>
                        <group position={[0, STAGES[placed].h / 2, 0]}>
                            <StageBody index={placed} />
                        </group>
                    </Draggable>
                </>
            )}

            <Moon />
        </group>
    );
}

// Gruppe som bærer de festede trinnene og stiger mykt mot målhøyden.
function RocketAssembly({
    targetClimb,
    bottomY,
    flying,
    burst,
    children,
}: {
    targetClimb: number;
    bottomY: number;
    flying: boolean;
    burst: number;
    children: React.ReactNode;
}) {
    const grp = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!grp.current) return;
        // Litt raskere stigning når raketten er lett (høyt oppe).
        grp.current.position.y = damp(grp.current.position.y, targetClimb, dt, flying ? 1.1 : 6);
        // Mild risting mens motorene brenner.
        const t = performance.now() / 1000;
        grp.current.position.x = flying ? Math.sin(t * 30) * 0.012 : 0;
    });
    return (
        <group ref={grp}>
            {children}
            <Burst position={[0, bottomY, 0]} trigger={burst} color="#ffd9a0" count={26} spread={2.6} />
        </group>
    );
}

// Et helt trinn der det står stablet (senter-offset innebygd).
function StageMesh({ index }: { index: number }) {
    const grp = useRef<THREE.Group>(null);
    // Liten pop når trinnet kommer på plass / blir nederst.
    useFrame((_, dt) => {
        if (!grp.current) return;
        grp.current.scale.x = damp(grp.current.scale.x, 1, dt, 8);
        grp.current.scale.z = damp(grp.current.scale.z, 1, dt, 8);
    });
    return (
        <group ref={grp} position={[0, STAGES[index].center, 0]} scale={[0.92, 1, 0.92]}>
            <StageBody index={index} />
        </group>
    );
}

// Selve geometrien for ett trinn, sentrert i (0,0,0).
function StageBody({ index }: { index: number }) {
    const s = STAGES[index];
    return (
        <group>
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[s.r, s.r, s.h, 22]} />
                <meshStandardMaterial color={s.color} roughness={0.55} metalness={0.1} />
            </mesh>
            {/* Mørk interstage-ring nederst */}
            <mesh position={[0, -s.h / 2 + 0.09, 0]}>
                <cylinderGeometry args={[s.r + 0.015, s.r + 0.015, 0.18, 22]} />
                <meshStandardMaterial color="#2b2f36" roughness={0.7} />
            </mesh>
            {index === 0 && <Stage1Details r={s.r} h={s.h} />}
            {index === 2 && <Spacecraft topY={s.h / 2} r={s.r} />}
        </group>
    );
}

// Svarte felt og finner på det store førstetrinnet (Saturn V-omrisset).
function Stage1Details({ r, h }: { r: number; h: number }) {
    return (
        <>
            {/* svart bånd litt opp på kroppen */}
            <mesh position={[0, h / 2 - 0.45, 0]}>
                <cylinderGeometry args={[r + 0.01, r + 0.01, 0.34, 22]} />
                <meshStandardMaterial color="#23262c" roughness={0.7} />
            </mesh>
            {/* fire finner ved foten */}
            {[0, 1, 2, 3].map((k) => {
                const a = (k / 4) * Math.PI * 2;
                return (
                    <mesh
                        key={k}
                        position={[Math.cos(a) * (r + 0.16), -h / 2 + 0.35, Math.sin(a) * (r + 0.16)]}
                        rotation={[0, -a, 0]}
                        castShadow
                    >
                        <boxGeometry args={[0.05, 0.55, 0.4]} />
                        <meshStandardMaterial color="#3a3f47" roughness={0.7} />
                    </mesh>
                );
            })}
        </>
    );
}

// Romfartøyet på toppen: kommandomodul (kjegle) + liten rømningstårn-spiss.
function Spacecraft({ topY, r }: { topY: number; r: number }) {
    return (
        <group position={[0, topY, 0]}>
            {/* overgangskjegle ned mot trinn 3 */}
            <mesh position={[0, 0.18, 0]} castShadow>
                <cylinderGeometry args={[0.2, r, 0.36, 20]} />
                <meshStandardMaterial color="#d7dce2" roughness={0.5} />
            </mesh>
            {/* kommandomodul (Apollo-kapsel) */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <coneGeometry args={[0.21, 0.42, 20]} />
                <meshStandardMaterial color="#b9c0c8" roughness={0.45} metalness={0.2} />
            </mesh>
            {/* rømningstårn */}
            <mesh position={[0, 0.86, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 0.4, 8]} />
                <meshStandardMaterial color="#b23b2e" roughness={0.6} />
            </mesh>
            <mesh position={[0, 1.08, 0]}>
                <coneGeometry args={[0.06, 0.16, 10]} />
                <meshStandardMaterial color="#b23b2e" roughness={0.6} />
            </mesh>
        </group>
    );
}

// Glødende motorflamme + eksos under raketten mens den flyr.
function EngineFlame({ y }: { y: number }) {
    const flame = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (!flame.current) return;
        const t = clock.getElapsedTime();
        const s = 1 + Math.sin(t * 28) * 0.18;
        flame.current.scale.set(s, 1 + Math.sin(t * 22) * 0.25, s);
    });
    return (
        <group position={[0, y - 0.1, 0]}>
            <mesh ref={flame} position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.34, 1.1, 16]} />
                <GlowMaterial color="#ffb43c" intensity={1.8} transparent opacity={0.92} />
            </mesh>
            <mesh position={[0, -0.3, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.2, 0.7, 14]} />
                <GlowMaterial color="#fff1c4" intensity={2.2} transparent opacity={0.95} />
            </mesh>
            <Particles preset="embers" center={[0, -0.9, 0]} area={[0.7, 0.7]} height={2.4} count={26} />
        </group>
    );
}

// Et tomt trinn som er sluppet og tumler nedover og falmer.
function FallingStage({ index, startY }: { index: number; startY: number }) {
    const grp = useRef<THREE.Group>(null);
    const vel = useRef(0);
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    useFrame((_, dt) => {
        if (!grp.current) return;
        vel.current += dt * 4.5;
        grp.current.position.y -= vel.current * dt;
        grp.current.position.x -= dt * 0.8;
        grp.current.rotation.z += dt * 1.6;
        grp.current.rotation.x += dt * 0.9;
        if (mat.current && mat.current.opacity > 0) {
            mat.current.opacity = Math.max(0, mat.current.opacity - dt * 0.32);
        }
    });
    const s = STAGES[index];
    return (
        <group ref={grp} position={[0, startY, 0]}>
            <mesh>
                <cylinderGeometry args={[s.r, s.r, s.h, 18]} />
                <meshStandardMaterial ref={mat} color={s.color} roughness={0.6} transparent opacity={1} />
            </mesh>
        </group>
    );
}

// Gjennomskinnelig omriss av hvor neste trinn skal stables.
function GhostSlot({ index }: { index: number }) {
    const s = STAGES[index];
    return (
        <mesh position={[0, s.center, 0]}>
            <cylinderGeometry args={[s.r, s.r, s.h, 18]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.18} depthWrite={false} />
        </mesh>
    );
}

// Utskytningsrampen med et enkelt servicetårn.
function LaunchPad() {
    return (
        <group>
            {/* betongsokkel */}
            <mesh position={[0, 0.1, 0]} receiveShadow>
                <cylinderGeometry args={[1.5, 1.7, 0.2, 24]} />
                <meshStandardMaterial color="#9aa0a2" roughness={0.9} />
            </mesh>
            {/* flammegrav */}
            <mesh position={[0, 0.21, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.04, 20]} />
                <meshStandardMaterial color="#3a3f47" roughness={0.9} />
            </mesh>
            {/* servicetårn */}
            <group position={[1.25, 0, 0]}>
                {[0.7, 2.0, 3.3].map((y) => (
                    <mesh key={y} position={[0, y, 0]}>
                        <boxGeometry args={[0.5, 0.08, 0.5]} />
                        <meshStandardMaterial color="#b23b2e" roughness={0.8} />
                    </mesh>
                ))}
                {[
                    [-0.2, -0.2],
                    [-0.2, 0.2],
                    [0.2, -0.2],
                    [0.2, 0.2],
                ].map(([x, z], k) => (
                    <mesh key={k} position={[x, 2.0, z]} castShadow>
                        <boxGeometry args={[0.07, 4.0, 0.07]} />
                        <meshStandardMaterial color="#8a3328" roughness={0.8} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

// Månen høyt oppe, med kratere og et mykt glød-skall.
function Moon() {
    const craters = useMemo(
        () =>
            [
                [0.18, 0.2, 0.12],
                [-0.22, -0.1, 0.1],
                [0.05, -0.28, 0.08],
                [-0.1, 0.3, 0.07],
                [0.3, -0.1, 0.06],
            ] as [number, number, number][],
        []
    );
    return (
        <group position={[1.5, MOON_Y, -1]}>
            <mesh>
                <sphereGeometry args={[0.95, 28, 28]} />
                <meshStandardMaterial color="#e7e3d8" roughness={1} />
            </mesh>
            {craters.map((c, i) => (
                <mesh key={i} position={[c[0], c[1], 0.92]}>
                    <circleGeometry args={[c[2], 16]} />
                    <meshStandardMaterial color="#cfc8b6" roughness={1} />
                </mesh>
            ))}
            <GlowHalo color="#f3eede" size={1.25} opacity={0.35} />
        </group>
    );
}

// Lys himmel-gradient: blekt blått ved bakken som går over i romblått oppe.
// Holder scenen lys (lys stil-regelen) men gir følelsen av å løfte mot rommet.
function SkyDome() {
    const texture = useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 8;
        c.height = 256;
        const ctx = c.getContext('2d');
        if (ctx) {
            const g = ctx.createLinearGradient(0, 0, 0, 256);
            g.addColorStop(0, '#5b6fa8'); // romblått i toppen
            g.addColorStop(0.5, '#9fc0df');
            g.addColorStop(1, '#dbeaf5'); // lyst ved horisonten
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 8, 256);
        }
        const t = new THREE.CanvasTexture(c);
        t.needsUpdate = true;
        return t;
    }, []);
    return (
        <mesh scale={[60, 60, 60]}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} fog={false} depthWrite={false} />
        </mesh>
    );
}

export default SaturnVMane3D;
