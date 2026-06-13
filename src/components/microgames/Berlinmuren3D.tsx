import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DoorClosed, SlidersHorizontal, Hammer } from 'lucide-react';
import {
    MicroGameScaffold,
    Interactive,
    Hotspot,
    Building,
    Tree,
    Figure,
    Burst,
    damp,
    SceneBanner,
    SceneBadge,
    DragHint,
    SceneFact,
    DataReadout,
    WinScreen,
    StepTracker,
    SceneSlider,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Berlinmuren: dodsstripen som delte en by.
//
// Lyspaere: Berlinmuren var ALDRI bare en vegg. Den var et dypt, dodelig system -
// to murer med en apen "dodsstripe" imellom, vakttarn og lyskastere - som skar
// rett gjennom en levende by og skilte familier i 28 ar. Eleven kjenner dette pa
// kroppen ved a (1) stenge de apne overgangene natt til 13. august 1961, (2) dra
// en spak som bygger dodsstripen lag for lag, og (3) rive muren i 1989 sa de to
// familiene endelig moter hverandre igjen.
//
// Scenen drives av enkel React-tilstand (phase, sealed, build, down, reunite) og
// hvert delobjekt demper mykt mot mal utledet av den.

// Geometri: muren gar langs X. Vest (mot kamera) = negativ Z, Ost = positiv Z.
const SEG_X = [-4, -2, 0, 2, 4];
const GAP_IDX = [1, 2, 3]; // de tre apne overgangene som ma stenges 13. august
const FRONT_Z = -0.9; // frontmuren (vest, med graffiti)
const INNER_Z = 2.4; // bakmuren (ost) - reiser seg nar dodsstripen bygges
const WEST_Z = -4.2;
const EAST_Z = 4.6;

type Phase = 'seal' | 'build' | 'fall' | 'done';

// --- En murseksjon: reiser seg, star, eller faller ---
function WallSegment({
    x,
    raised,
    fallen,
    clickable,
    graffiti,
    onSmash,
}: {
    x: number;
    raised: boolean;
    fallen: boolean;
    clickable: boolean;
    graffiti: string;
    onSmash: () => void;
}) {
    const g = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!g.current) return;
        const targetY = fallen ? -2.4 : raised ? 0 : -3.2;
        g.current.position.y = damp(g.current.position.y, targetY, dt, fallen ? 5 : 3.2);
        g.current.rotation.x = damp(g.current.rotation.x, fallen ? -1.15 : 0, dt, 4);
    });

    const slab = (
        <group ref={g} position={[0, -3.2, 0]}>
            {/* selve betongplata */}
            <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.9, 1.8, 0.34]} />
                <meshStandardMaterial color="#d8d2c6" roughness={0.95} />
            </mesh>
            {/* karakteristisk ror pa toppen */}
            <mesh position={[0, 1.85, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.17, 0.17, 1.9, 12]} />
                <meshStandardMaterial color="#bdb6a8" roughness={0.8} />
            </mesh>
            {/* graffiti pa vest-siden (mot kamera) */}
            <mesh position={[0, 0.95, -0.18]}>
                <planeGeometry args={[1.5, 1.1]} />
                <meshStandardMaterial color={graffiti} roughness={0.9} />
            </mesh>
        </group>
    );

    if (clickable && !fallen) {
        return (
            <group position={[x, 0, FRONT_Z]}>
                <Interactive onSelect={onSmash} hitArea={[2.1, 2.4, 1]}>
                    {slab}
                </Interactive>
            </group>
        );
    }
    return <group position={[x, 0, FRONT_Z]}>{slab}</group>;
}

// --- Bakmuren (Hinterlandmauer): en lang, lav mur som vokser fram med dodsstripen ---
function InnerWall({ build }: { build: number }) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        ref.current.scale.y = damp(ref.current.scale.y, build > 0.15 ? 1 : 0.001, dt, 3);
    });
    return (
        <mesh ref={ref} position={[0, 0.7, INNER_Z]} scale={[1, 0.001, 1]} castShadow>
            <boxGeometry args={[10.5, 1.4, 0.3]} />
            <meshStandardMaterial color="#cfc8ba" roughness={0.95} />
        </mesh>
    );
}

// --- Vakttarn: reiser seg nar dodsstripen er bygd ---
function WatchTower({ build }: { build: number }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        const t = build > 0.55 ? 1 : 0.001;
        ref.current.scale.y = damp(ref.current.scale.y, t, dt, 2.6);
    });
    return (
        <group ref={ref} position={[4.4, 0, 0.7]} scale={[1, 0.001, 1]}>
            <mesh position={[0, 1.6, 0]} castShadow>
                <boxGeometry args={[0.7, 3.2, 0.7]} />
                <meshStandardMaterial color="#9aa0a6" roughness={0.8} />
            </mesh>
            {/* vaktbu pa toppen med vindusbelte */}
            <mesh position={[0, 3.55, 0]} castShadow>
                <boxGeometry args={[1.25, 0.9, 1.25]} />
                <meshStandardMaterial color="#6f7780" roughness={0.6} />
            </mesh>
            <mesh position={[0, 3.55, 0]}>
                <boxGeometry args={[1.28, 0.4, 1.28]} />
                <meshStandardMaterial
                    color="#bfe6ff"
                    emissive="#9fd4f5"
                    emissiveIntensity={0.3}
                    roughness={0.2}
                />
            </mesh>
        </group>
    );
}

// --- Lyskaster langs dodsstripen ---
function StripLamp({ x, build }: { x: number; build: number }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        ref.current.scale.y = damp(ref.current.scale.y, build > 0.78 ? 1 : 0.001, dt, 3);
    });
    return (
        <group ref={ref} position={[x, 0, 0.7]} scale={[1, 0.001, 1]}>
            <mesh position={[0, 1.1, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.08, 2.2, 6]} />
                <meshStandardMaterial color="#5b6168" roughness={0.7} />
            </mesh>
            <mesh position={[0, 2.2, 0]}>
                <sphereGeometry args={[0.18, 10, 10]} />
                <meshStandardMaterial
                    color="#fff4c2"
                    emissive="#ffe27a"
                    emissiveIntensity={build > 0.78 ? 1.2 : 0}
                />
            </mesh>
        </group>
    );
}

// --- Dodsstripen: en sand-stripe mellom murene som lysner og bredner ---
function DeathStrip({ build }: { build: number }) {
    const ref = useRef<THREE.Mesh>(null);
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    useFrame((_, dt) => {
        if (!ref.current || !mat.current) return;
        // bredner ostover mens den bygges
        const depth = 1 + build * 2.6;
        ref.current.scale.z = damp(ref.current.scale.z, depth, dt, 2.4);
        // gra asfalt -> bleik, raket sand
        const c = mat.current.color;
        const target = new THREE.Color('#cdbf97').lerp(new THREE.Color('#8b9097'), 1 - build);
        c.lerp(target, Math.min(1, dt * 3));
    });
    return (
        <mesh
            ref={ref}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.04, (FRONT_Z + INNER_Z) / 2]}
            receiveShadow
        >
            <planeGeometry args={[10.5, 1]} />
            <meshStandardMaterial ref={mat} color="#8b9097" roughness={1} />
        </mesh>
    );
}

// --- En liten figur som kan ga mot et mal (Z) ved gjenforening ---
function Person({
    x,
    homeZ,
    meetZ,
    reunite,
    body,
}: {
    x: number;
    homeZ: number;
    meetZ: number;
    reunite: number;
    body: string;
}) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        const targetZ = homeZ + (meetZ - homeZ) * reunite;
        ref.current.position.z = damp(ref.current.position.z, targetZ, dt, 2);
        // lite hopp av glede pa slutten
        const joy = reunite > 0.9 ? Math.abs(Math.sin(performance.now() * 0.006)) * 0.25 : 0;
        ref.current.position.y = damp(ref.current.position.y, joy, dt, 6);
    });
    return (
        <group ref={ref} position={[x, 0, homeZ]}>
            <Figure body={body} />
        </group>
    );
}

// --- Husrekke ---
function HouseRow({
    z,
    cool,
}: {
    z: number;
    cool: boolean;
}) {
    const houses = useMemo(
        () =>
            [-5, -3, -1, 1, 3, 5].map((x, i) => ({
                x,
                body: cool ? ['#8a8f96', '#9a958c', '#7e8893'][i % 3] : ['#c2693f', '#d59a52', '#a8794e'][i % 3],
                roof: cool ? '#5d636b' : '#7a4326',
                h: 1.1 + ((i * 7) % 3) * 0.35,
            })),
        [cool]
    );
    return (
        <group position={[0, 0, z]}>
            {houses.map((h) => (
                <Building key={h.x} position={[h.x, 0, 0]} body={h.body} roof={h.roof} w={1.5} h={h.h} d={1.3} />
            ))}
        </group>
    );
}

interface SceneProps {
    phase: Phase;
    sealed: boolean[];
    build: number;
    down: boolean[];
    reunite: number;
    smash: (i: number) => void;
}

function BerlinScene({ phase, sealed, build, down, reunite, smash }: SceneProps) {
    const graffiti = ['#e2554b', '#3f8fd0', '#f2b134', '#56b36a', '#b06fd0'];
    return (
        <group>
            {/* bakke: ost (gra) base + vest (gronn) flekk */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
                <planeGeometry args={[30, 24]} />
                <meshStandardMaterial color="#9298a0" roughness={1} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]} receiveShadow>
                <planeGeometry args={[30, 12]} />
                <meshStandardMaterial color="#7d9b57" roughness={1} />
            </mesh>

            {/* hus pa hver side */}
            <HouseRow z={WEST_Z} cool={false} />
            <HouseRow z={EAST_Z} cool />
            <Tree position={[-6, 0, WEST_Z + 1.4]} />
            <Tree position={[6, 0, WEST_Z + 1.2]} />

            {/* dodsstripe-systemet (vises fra build-fasen) */}
            <DeathStrip build={build} />
            <InnerWall build={build} />
            <WatchTower build={build} />
            <StripLamp x={-3} build={build} />
            <StripLamp x={1.2} build={build} />

            {/* frontmuren: 5 seksjoner */}
            {SEG_X.map((x, i) => {
                const isGap = GAP_IDX.includes(i);
                const gapPos = GAP_IDX.indexOf(i);
                const raised = isGap ? sealed[gapPos] : true;
                return (
                    <WallSegment
                        key={x}
                        x={x}
                        raised={raised}
                        fallen={down[i]}
                        clickable={phase === 'fall'}
                        graffiti={graffiti[i]}
                        onSmash={() => smash(i)}
                    />
                );
            })}

            {/* apne overganger: hotspots i seal-fasen */}
            {phase === 'seal' &&
                GAP_IDX.map((idx, j) =>
                    sealed[j] ? null : (
                        <Hotspot
                            key={idx}
                            position={[SEG_X[idx], 1.1, FRONT_Z]}
                            onSelect={() => smash(-1 - j)}
                            label="Steng overgangen"
                            radius={0.55}
                        />
                    )
                )}

            {/* to familier, en pa hver side */}
            <Person x={-0.6} homeZ={WEST_Z + 1.6} meetZ={FRONT_Z - 0.4} reunite={reunite} body="#3f6fa3" />
            <Person x={0.6} homeZ={EAST_Z - 1.6} meetZ={FRONT_Z + 0.5} reunite={reunite} body="#a3553f" />

            {/* feiringspartikler nar muren faller */}
            <Burst position={[0, 1.6, FRONT_Z]} trigger={down.filter(Boolean).length} />
        </group>
    );
}

export default function Berlinmuren3D({ onComplete }: MicroGameProps) {
    const [phase, setPhase] = useState<Phase>('seal');
    const [sealed, setSealed] = useState<boolean[]>([false, false, false]);
    const [build, setBuild] = useState(0);
    const [down, setDown] = useState<boolean[]>([false, false, false, false, false]);
    const [reunite, setReunite] = useState(0);
    const [banner, setBanner] = useState<string | null>(
        'Natt til 13. august 1961: grensa stenges. Klikk de apne overgangene.'
    );
    const sound = useStepSounds();

    const reset = () => {
        setPhase('seal');
        setSealed([false, false, false]);
        setBuild(0);
        setDown([false, false, false, false, false]);
        setReunite(0);
        setBanner('Natt til 13. august 1961: grensa stenges. Klikk de apne overgangene.');
    };

    // Et grep i scenen: enten stenge en overgang (negativ i) eller rive en seksjon.
    const handle = (i: number) => {
        if (i < 0) {
            // stenge overgang j
            const j = -1 - i;
            setSealed((prev) => {
                if (prev[j]) return prev;
                const next = [...prev];
                next[j] = true;
                sound.play('drop');
                if (next.every(Boolean)) {
                    setBanner('Grensa er stengt. Na bygges den ut til en dodelig sone.');
                    setTimeout(() => setPhase('build'), 700);
                }
                return next;
            });
        } else if (phase === 'fall') {
            setDown((prev) => {
                if (prev[i]) return prev;
                const next = [...prev];
                next[i] = true;
                sound.play('correct');
                if (next.every(Boolean)) {
                    setBanner('Muren er borte. Ost og vest moter hverandre igjen.');
                    setReunite(1);
                    setPhase('done');
                    sound.play('complete');
                    onComplete({ score: 1, completed: true });
                } else {
                    setBanner('Folket river muren, stein for stein!');
                }
                return next;
            });
        }
    };

    // Bygg-fasen: nar spaken nar topps, star muren ferdig - hopp fram til 1989.
    const finishBuild = () => {
        setBanner('Muren star ferdig: to murer, dodsstripe, vakttarn. 28 ar gar...');
        setTimeout(() => {
            setPhase('fall');
            setBanner('9. november 1989: portene apnes. Klikk og riv muren!');
        }, 1100);
    };

    const stepNum = phase === 'seal' ? 1 : phase === 'build' ? 2 : 3;
    const era =
        phase === 'seal' ? '13. august 1961' : phase === 'build' ? '1961 - 1980-tallet' : '9. november 1989';
    const stripWidth = (1 + build * 2.6) * 12; // grov "meter"-folelse for avlesning

    return (
        <MicroGameScaffold
            title="Dodsstripen: muren som delte en by"
            subtitle="Steng grensa, bygg dodsstripen, og riv den i 1989"
            estimatedSeconds={150}
            onRetry={reset}
            scene={
                <BerlinScene
                    phase={phase}
                    sealed={sealed}
                    build={build}
                    down={down}
                    reunite={reunite}
                    smash={handle}
                />
            }
            canvas={{
                idle: phase === 'seal',
                camera: { position: [7, 7, 12], fov: 42 },
                background: '#c4d2dd',
                fog: { near: 30, far: 60 },
                target: [0, 0.9, 0.6],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">{era}</SceneBadge>
                    {phase === 'build' && (
                        <DataReadout
                            corner="bl"
                            items={[
                                { label: 'Murer', value: build > 0.15 ? 2 : 1 },
                                { label: 'Dodsstripe', value: Math.round(stripWidth), unit: 'm' },
                                { label: 'Vakttarn', value: build > 0.55 ? 1 : 0 },
                            ]}
                        />
                    )}
                    {phase === 'seal' && (
                        <DragHint show={!sealed.every(Boolean)} corner="bc">
                            Klikk de gule overgangene
                        </DragHint>
                    )}
                    {phase === 'fall' && (
                        <DragHint show={!down.every(Boolean)} corner="bc">
                            Klikk murseksjonene og riv dem
                        </DragHint>
                    )}
                </>
            }
        >
            <div className="flex items-center justify-between mb-2.5">
                <StepTracker current={stepNum} total={3} />
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-700">
                    {phase === 'seal' && (
                        <>
                            <DoorClosed className="w-3.5 h-3.5" /> Steng grensa
                        </>
                    )}
                    {phase === 'build' && (
                        <>
                            <SlidersHorizontal className="w-3.5 h-3.5" /> Bygg dodsstripen
                        </>
                    )}
                    {(phase === 'fall' || phase === 'done') && (
                        <>
                            <Hammer className="w-3.5 h-3.5" /> Riv muren
                        </>
                    )}
                </span>
            </div>

            {phase === 'seal' && (
                <SceneFact>
                    Folk som la seg lordag kveld, vaknet sondag morgen til en stengt by. Plutselig
                    kunne de ikke ga pa jobb, besoke familie eller krysse gata. Steng de tre apne
                    overgangene.
                </SceneFact>
            )}

            {phase === 'build' && (
                <div className="space-y-2.5">
                    <SceneSlider
                        label="Forsterk grensa (1961 til 1980-tallet)"
                        min={0}
                        max={100}
                        value={Math.round(build * 100)}
                        onChange={(v) => {
                            setBuild(v / 100);
                            if (v % 25 === 0) sound.play('select');
                            if (v >= 100 && phase === 'build') finishBuild();
                        }}
                        valueLabel={(v) => `${v}%`}
                    />
                    <SceneFact>
                        Dra spaken og se: piggtraden blir til en betongmur, en bakmur reiser seg, og
                        mellom dem apner det seg en tom dodsstripe med vakttarn og lyskastere. Muren
                        var aldri bare en vegg, men et helt dodelig system.
                    </SceneFact>
                </div>
            )}

            {phase === 'fall' && (
                <SceneFact>
                    Presset fra folket ble for stort. 9. november 1989 strommet titusener til
                    grensa, og vaktene apnet portene. Klikk hver murseksjon og riv den.
                </SceneFact>
            )}

            {phase === 'done' && (
                <WinScreen
                    title="Muren falt - 9. november 1989"
                    onReplay={reset}
                >
                    Du kjente det selv: Berlinmuren var ingen enkel vegg, men et dypt, dodelig system
                    som skar gjennom en levende by i 28 ar. Da den falt, motes ost og vest igjen - og
                    den kalde krigen gikk mot slutten.
                </WinScreen>
            )}
        </MicroGameScaffold>
    );
}
