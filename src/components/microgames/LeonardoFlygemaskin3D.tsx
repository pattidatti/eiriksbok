import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Feather } from 'lucide-react';
import {
    MicroGameScaffold,
    Hotspot,
    Draggable,
    GroundPlane,
    SceneBanner,
    SceneBadge,
    SceneFact,
    DragHint,
    WinScreen,
    SceneSlider,
    StepTracker,
    DataReadout,
    THEMES,
    damp,
    Burst,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til artikkelen om Leonardo da Vinci. Kjernen i artikkelen er
// "uomo universale": Leonardo bygde ikke maskiner ut av fantasi, han STUDERTE
// naturen (fuglevingen) og kopierte prinsippene inn i maskinene sine.
// Eleven gjenskaper akkurat den arbeidsmaten:
//   1) STUDER fuglevingen - klikk tre punkter og oppdag hvert prinsipp,
//   2) BYGG flygemaskinen - dra de tre delene inn (hvert prinsipp blir en del),
//   3) TEST - tråkk pedalen og slå med vingene.
// Lyspæra: maskinen var for tung til at en mann kunne fly den, men METODEN
// (se nøye, forstå, gjenskap) var helt riktig - det var det som var geniet.

type Phase = 'study' | 'build' | 'test' | 'flown';
type PrincipleId = 'curve' | 'light' | 'joint';

const theme = THEMES.enlightenment;

// De tre prinsippene eleven oppdager på fuglevingen.
const PRINCIPLES: Record<
    PrincipleId,
    { studyFact: string; buildFact: string; part: string }
> = {
    curve: {
        studyFact:
            'Vingen er buet, ikke flat. Luften over den må gå lengre vei, og det suger vingen oppover. Slik blir det loft.',
        buildFact: 'Du spente seilduk over rammen, lett buet - akkurat som fuglevingen.',
        part: 'Seilduk',
    },
    light: {
        studyFact:
            'Fuglens knokler er hule og lette. En tung fugl kommer aldri opp. Alt handler om å spare vekt.',
        buildFact: 'Du la inn et rammeverk av tynne, lette trespiler - sterkt, men nesten vektløst.',
        part: 'Rammeverk',
    },
    joint: {
        studyFact:
            'Vingen slår fra et kraftig skulderledd. Det er muskelen her som driver hele flukten.',
        buildFact: 'Du koblet til en tråkkmekanisme. Pilotens bein blir muskelen som slår vingene.',
        part: 'Tråkkpedal',
    },
};

const ORDER: PrincipleId[] = ['curve', 'light', 'joint'];
const ASSEMBLY: [number, number] = [0, 0]; // monteringssone (xz) midt på maskinen

// Startposisjoner for de tre delene som skal dras inn.
const PART_START: Record<PrincipleId, [number, number, number]> = {
    light: [-5.5, 0, 4],
    curve: [0, 0, 5.5],
    joint: [5.5, 0, 4],
};

const LeonardoFlygemaskin3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [phase, setPhase] = useState<Phase>('study');
    const [studied, setStudied] = useState<Record<PrincipleId, boolean>>({
        curve: false,
        light: false,
        joint: false,
    });
    const [built, setBuilt] = useState<Record<PrincipleId, boolean>>({
        curve: false,
        light: false,
        joint: false,
    });
    const [crank, setCrank] = useState(0);
    const [banner, setBanner] = useState<string | null>(
        'Klikk de tre punktene på fuglevingen for å se hvordan fuglen flyr.'
    );
    const [fact, setFact] = useState<string | null>(null);
    const [burst, setBurst] = useState(0);

    const studiedCount = ORDER.filter((p) => studied[p]).length;
    const builtCount = ORDER.filter((p) => built[p]).length;

    const reset = () => {
        setPhase('study');
        setStudied({ curve: false, light: false, joint: false });
        setBuilt({ curve: false, light: false, joint: false });
        setCrank(0);
        setBanner('Klikk de tre punktene på fuglevingen for å se hvordan fuglen flyr.');
        setFact(null);
    };

    const study = (id: PrincipleId) => {
        if (studied[id]) return;
        sounds.play('correct');
        const next = { ...studied, [id]: true };
        setStudied(next);
        setFact(PRINCIPLES[id].studyFact);
        const done = ORDER.filter((p) => next[p]).length;
        if (done >= ORDER.length) {
            sounds.play('advance');
            setPhase('build');
            setBanner('Nå vet du hvordan fuglen flyr. Dra de tre delene inn på flygemaskinen.');
            setFact(null);
        } else {
            setBanner('Bra! Finn de neste punktene på vingen.');
        }
    };

    const place = (id: PrincipleId, pos: THREE.Vector3) => {
        const dist = Math.hypot(pos.x - ASSEMBLY[0], pos.z - ASSEMBLY[1]);
        if (dist > 2.6) {
            setBanner('Dra delen helt inn på flygemaskinen i midten.');
            return;
        }
        if (built[id]) return;
        sounds.play('drop');
        const next = { ...built, [id]: true };
        setBuilt(next);
        setFact(PRINCIPLES[id].buildFact);
        const done = ORDER.filter((p) => next[p]).length;
        if (done >= ORDER.length) {
            sounds.play('advance');
            setPhase('test');
            setBanner('Flygemaskinen er ferdig! Tråkk pedalen for å slå med vingene.');
            setFact(null);
        } else {
            setBanner('Delen sitter. ' + (ORDER.length - done) + ' igjen.');
        }
    };

    const fly = () => {
        sounds.play('complete');
        setBurst((b) => b + 1);
        setPhase('flown');
        setBanner(null);
        setTimeout(() => {
            onComplete({ score: 1, completed: true, artifact: { crank } });
        }, 250);
    };

    const idle = phase === 'study' && studiedCount === 0;
    const liftPct = Math.round(crank * 100);

    return (
        <MicroGameScaffold
            title="Leonardos flygemaskin"
            subtitle="Studer fuglevingen, bygg maskinen med de samme prinsippene, og slå med vingene"
            estimatedSeconds={150}
            onRetry={phase !== 'study' || studiedCount > 0 ? reset : undefined}
            canvas={{
                idle: false,
                camera: { position: [10, 7.5, 12], fov: 42 },
                background: theme.sky,
                fog: { color: theme.fog, near: 28, far: 52 },
                target: [-0.5, 1.1, 0],
                light: 'golden',
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {phase === 'study'
                            ? 'Studer fuglen'
                            : phase === 'build'
                              ? 'Bygg maskinen'
                              : phase === 'flown'
                                ? 'Verkstedet i Milano'
                                : 'Test vingene'}
                    </SceneBadge>
                    {phase === 'test' && (
                        <DataReadout
                            corner="bl"
                            items={[
                                { label: 'Pedalkraft', value: liftPct, unit: '%' },
                                {
                                    label: 'Vingeslag',
                                    value: crank > 0.05 ? Math.round(12 + crank * 60) : 0,
                                    unit: '/min',
                                },
                            ]}
                        />
                    )}
                    <DragHint show={idle}>Klikk punktene på fuglevingen</DragHint>
                </>
            }
            scene={
                <Workshop
                    phase={phase}
                    studied={studied}
                    built={built}
                    crank={crank}
                    burst={burst}
                    onStudy={study}
                    onPlace={place}
                />
            }
        >
            {phase === 'study' && (
                <div className="flex flex-col gap-2.5">
                    <StepTracker current={studiedCount} total={ORDER.length} />
                    <p className="text-sm text-slate-600">
                        Leonardo tegnet fugler i flukt i timevis. Klikk de pulserende punktene på
                        vingen for å oppdage hvert prinsipp.
                    </p>
                    {fact && <SceneFact>{fact}</SceneFact>}
                </div>
            )}

            {phase === 'build' && (
                <div className="flex flex-col gap-2.5">
                    <StepTracker current={builtCount} total={ORDER.length} />
                    <p className="text-sm text-slate-600">
                        Dra de tre delene inn på rammen i midten. Hver del er ett av prinsippene du
                        nettopp så på fuglen.
                    </p>
                    {fact && <SceneFact>{fact}</SceneFact>}
                </div>
            )}

            {(phase === 'test' || phase === 'flown') && (
                <div className="flex flex-col gap-3">
                    <SceneSlider
                        label="Tråkk pedalen: slå med vingene"
                        min={0}
                        max={1}
                        step={0.01}
                        value={crank}
                        onChange={setCrank}
                        valueLabel={(v) => Math.round(v * 100) + '%'}
                    />
                    {phase === 'test' ? (
                        <div className="rounded-xl border border-amber-200 bg-white p-3 sm:flex sm:items-center sm:gap-4">
                            <p className="text-xs text-slate-600 leading-relaxed min-w-0 flex-1">
                                {crank < 0.9 ? (
                                    <>
                                        Vingene slår raskere jo hardere du tråkker. Tråkk for fullt
                                        og prøv å lette.
                                    </>
                                ) : (
                                    <>
                                        Vingene slår for fullt! Maskinen rister og strever - men en
                                        manns bein er ikke sterke nok. Prøv likevel.
                                    </>
                                )}
                            </p>
                            <button
                                onClick={fly}
                                disabled={crank < 0.9}
                                className={`mt-2.5 sm:mt-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition flex-shrink-0 ${
                                    crank < 0.9
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-amber-600 text-white hover:bg-amber-700'
                                }`}
                            >
                                <Feather className="w-4 h-4" />
                                Prøv å lette
                            </button>
                        </div>
                    ) : (
                        <WinScreen title="Maskinen slo med vingene!" onReplay={reset}>
                            Leonardos flygemaskin var for tung til at en mann kunne fly den - vi
                            fikk ikke ekte motorer før mange hundre år senere. Men selve metoden var
                            genial: studer naturen nøye, forstå hvordan den virker, og gjenskap den.
                            Det var den arbeidsmaten som gjorde Leonardo til renessansens største
                            geni.
                        </WinScreen>
                    )}
                </div>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN: Leonardos verksted
// ============================================================

function Workshop({
    phase,
    studied,
    built,
    crank,
    burst,
    onStudy,
    onPlace,
}: {
    phase: Phase;
    studied: Record<PrincipleId, boolean>;
    built: Record<PrincipleId, boolean>;
    crank: number;
    burst: number;
    onStudy: (id: PrincipleId) => void;
    onPlace: (id: PrincipleId, pos: THREE.Vector3) => void;
}) {
    return (
        <group>
            <GroundPlane size={42} depth={34} color={theme.ground} />
            <WorkshopFloor />

            {/* Tegnebrettet med vinge-skisse i bakkant - verkstedstemning */}
            <SketchBoard position={[-7.5, 0, -4]} />

            {/* Fugle-studiemodellen til venstre */}
            <BirdStudy
                position={[-4.6, 0, 2.4]}
                phase={phase}
                studied={studied}
                onStudy={onStudy}
            />

            {/* Selve flygemaskinen i midten */}
            <FlyingMachine phase={phase} built={built} crank={crank} burst={burst} />

            {/* Delene som skal dras inn (kun i byggefasen) */}
            {phase === 'build' &&
                ORDER.filter((id) => !built[id]).map((id) => (
                    <PartDraggable key={id} id={id} onPlace={onPlace} />
                ))}

            {/* Ghost-sone som viser hvor delene skal */}
            {phase === 'build' && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ASSEMBLY[0], 0.04, ASSEMBLY[1]]}>
                    <ringGeometry args={[2.1, 2.5, 40]} />
                    <meshBasicMaterial color="#b07d2a" transparent opacity={0.4} />
                </mesh>
            )}
        </group>
    );
}

// Et trebord/gulv-flak for verkstedfølelse.
function WorkshopFloor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]} receiveShadow>
            <circleGeometry args={[9, 40]} />
            <meshStandardMaterial color="#b89b6e" roughness={0.95} />
        </mesh>
    );
}

// Tegnebrett med en enkel vinge-skisse (tynne streker).
function SketchBoard({ position }: { position: [number, number, number] }) {
    return (
        <group position={position} rotation={[0, 0.5, 0]}>
            {/* staffeli-bein */}
            <mesh position={[-1, 1.4, 0.2]} rotation={[0, 0, 0.08]} castShadow>
                <boxGeometry args={[0.12, 2.8, 0.12]} />
                <meshStandardMaterial color={theme.wood} roughness={0.9} />
            </mesh>
            <mesh position={[1, 1.4, 0.2]} rotation={[0, 0, -0.08]} castShadow>
                <boxGeometry args={[0.12, 2.8, 0.12]} />
                <meshStandardMaterial color={theme.wood} roughness={0.9} />
            </mesh>
            {/* pergament-plate */}
            <mesh position={[0, 2.2, 0]} rotation={[-0.18, 0, 0]} castShadow>
                <boxGeometry args={[3, 2.2, 0.08]} />
                <meshStandardMaterial color="#efe4c6" roughness={1} />
            </mesh>
            {/* skisse-streker (vinge) */}
            {[-0.5, -0.2, 0.1, 0.4].map((y, i) => (
                <mesh key={i} position={[0, 2.2 + y, 0.06]} rotation={[-0.18, 0, 0.1 * i]}>
                    <boxGeometry args={[1.8 - i * 0.3, 0.04, 0.01]} />
                    <meshBasicMaterial color="#6b4a2a" />
                </mesh>
            ))}
        </group>
    );
}

// Fugl på sokkel med tre klikkbare studie-punkter.
function BirdStudy({
    position,
    phase,
    studied,
    onStudy,
}: {
    position: [number, number, number];
    phase: Phase;
    studied: Record<PrincipleId, boolean>;
    onStudy: (id: PrincipleId) => void;
}) {
    const wing = useRef<THREE.Group>(null);
    useFrame(() => {
        if (!wing.current) return;
        // Vingen vifter rolig så fuglen ser levende ut.
        const t = performance.now() / 1000;
        wing.current.rotation.z = -0.2 + Math.sin(t * 2) * 0.18;
    });

    return (
        <group position={position}>
            {/* sokkel */}
            <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.55, 0.7, 0.7, 16]} />
                <meshStandardMaterial color={theme.stone} roughness={0.9} />
            </mesh>
            {/* fuglekropp */}
            <group position={[0, 1.3, 0]}>
                <mesh castShadow>
                    <sphereGeometry args={[0.42, 16, 12]} />
                    <meshStandardMaterial color="#7a6a52" roughness={0.7} />
                </mesh>
                {/* hode */}
                <mesh position={[0.42, 0.18, 0]} castShadow>
                    <sphereGeometry args={[0.22, 12, 10]} />
                    <meshStandardMaterial color="#8a7a60" roughness={0.7} />
                </mesh>
                {/* nebb */}
                <mesh position={[0.66, 0.16, 0]} rotation={[0, 0, -0.3]} castShadow>
                    <coneGeometry args={[0.07, 0.24, 8]} />
                    <meshStandardMaterial color="#caa23a" roughness={0.6} />
                </mesh>
                {/* hale */}
                <mesh position={[-0.5, -0.02, 0]} rotation={[0, 0, 0.2]} castShadow>
                    <boxGeometry args={[0.5, 0.06, 0.3]} />
                    <meshStandardMaterial color="#6a5a44" roughness={0.7} />
                </mesh>
                {/* utstrakt vinge (vifter) */}
                <group ref={wing} position={[0, 0.05, 0.35]}>
                    <Wingfeathers />
                </group>
            </group>

            {/* Studie-hotspots (kun i studiefasen) */}
            {phase === 'study' && (
                <>
                    <Hotspot
                        position={[0.1, 1.55, 1.0]}
                        onSelect={() => onStudy('curve')}
                        label="Buet vinge"
                        radius={0.34}
                        state={studied.curve ? 'correct' : undefined}
                    />
                    <Hotspot
                        position={[-0.4, 1.3, 0.2]}
                        onSelect={() => onStudy('light')}
                        label="Lette knokler"
                        radius={0.34}
                        state={studied.light ? 'correct' : undefined}
                    />
                    <Hotspot
                        position={[0.15, 1.45, 0.35]}
                        onSelect={() => onStudy('joint')}
                        label="Skulderledd"
                        radius={0.34}
                        state={studied.joint ? 'correct' : undefined}
                    />
                </>
            )}
        </group>
    );
}

// Fjær-vifte for fugleving og maskinvinge.
function Wingfeathers() {
    const feathers = [0, 1, 2, 3, 4];
    return (
        <>
            {feathers.map((i) => (
                <mesh
                    key={i}
                    position={[-i * 0.16, 0, 0.25 + i * 0.18]}
                    rotation={[0.3, 0, 0]}
                    castShadow
                >
                    <boxGeometry args={[0.5 - i * 0.05, 0.03, 0.4]} />
                    <meshStandardMaterial color="#9a8a6c" roughness={0.8} />
                </mesh>
            ))}
        </>
    );
}

// En del som dras inn på maskinen.
function PartDraggable({
    id,
    onPlace,
}: {
    id: PrincipleId;
    onPlace: (id: PrincipleId, pos: THREE.Vector3) => void;
}) {
    return (
        <Draggable
            position={PART_START[id]}
            planeY={0}
            bounds={{ minX: -7, maxX: 7, minZ: -3, maxZ: 6.5 }}
            onDrop={(p) => onPlace(id, p)}
            liftY={0.5}
            dropFx="dustPuff"
        >
            {/* Romslig usynlig gripeflate for trygg trackpad-treffing */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[2, 1.6, 2]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <PartMesh id={id} />
        </Draggable>
    );
}

// Visuell representasjon av hver del i hånden.
function PartMesh({ id }: { id: PrincipleId }) {
    if (id === 'light') {
        // Rammeverk: bunt av tynne trespiler.
        return (
            <group position={[0, 0.5, 0]}>
                {[-0.25, 0, 0.25].map((x) => (
                    <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, 0.1]} castShadow>
                        <boxGeometry args={[0.08, 1.6, 0.08]} />
                        <meshStandardMaterial color={theme.wood} roughness={0.85} />
                    </mesh>
                ))}
                <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <boxGeometry args={[0.08, 1.2, 0.08]} />
                    <meshStandardMaterial color={theme.wood} roughness={0.85} />
                </mesh>
            </group>
        );
    }
    if (id === 'curve') {
        // Seilduk: en lett buet, sammenrullet duk.
        return (
            <group position={[0, 0.5, 0]}>
                <mesh rotation={[0, 0, 0.2]} castShadow>
                    <cylinderGeometry args={[0.32, 0.32, 1.4, 12]} />
                    <meshStandardMaterial color="#e7dcc0" roughness={1} />
                </mesh>
            </group>
        );
    }
    // joint: tråkkpedal/mekanisme.
    return (
        <group position={[0, 0.4, 0]}>
            <mesh castShadow>
                <boxGeometry args={[0.7, 0.5, 0.7]} />
                <meshStandardMaterial color="#8a6a3a" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.45, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
                <meshStandardMaterial color="#5a4a2a" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.7, 0.18]} castShadow>
                <boxGeometry args={[0.5, 0.08, 0.3]} />
                <meshStandardMaterial color={theme.accent} roughness={0.7} />
            </mesh>
        </group>
    );
}

// Flygemaskinen: kropp + to slående vinger. Delene dukker opp etter hvert.
function FlyingMachine({
    phase,
    built,
    crank,
    burst,
}: {
    phase: Phase;
    built: Record<PrincipleId, boolean>;
    crank: number;
    burst: number;
}) {
    const body = useRef<THREE.Group>(null);
    const leftWing = useRef<THREE.Group>(null);
    const rightWing = useRef<THREE.Group>(null);

    const flying = phase === 'test' || phase === 'flown';

    useFrame((_, dt) => {
        const t = performance.now() / 1000;
        // Vingeslag: amplitude og frekvens følger pedalkraften.
        const amp = flying ? crank * 0.85 : 0;
        const freq = 4 + crank * 7;
        const flap = Math.sin(t * freq) * amp;
        if (leftWing.current) {
            leftWing.current.rotation.z = damp(leftWing.current.rotation.z, -0.05, dt, 6) + flap;
        }
        if (rightWing.current) {
            rightWing.current.rotation.z = damp(rightWing.current.rotation.z, 0.05, dt, 6) - flap;
        }
        if (body.current) {
            // Maskinen rister og hopper litt når den slår for fullt, men letter aldri.
            const strain = phase === 'flown' ? crank : flying ? crank * 0.5 : 0;
            const hop = Math.abs(Math.sin(t * freq)) * strain * 0.3;
            body.current.position.y = damp(body.current.position.y, 0.55, dt, 4) + hop;
            body.current.rotation.x =
                phase === 'flown' ? Math.sin(t * freq * 0.5) * crank * 0.04 : 0;
        }
    });

    return (
        <group ref={body} position={[0, 0.55, 0]}>
            {/* Kropp / der piloten ligger */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[0.7, 0.25, 3]} />
                <meshStandardMaterial color={theme.wood} roughness={0.85} />
            </mesh>
            {/* liten sete-plate */}
            <mesh position={[0, 0.18, -0.3]} castShadow>
                <boxGeometry args={[0.8, 0.08, 1.2]} />
                <meshStandardMaterial color="#9c7b4a" roughness={0.85} />
            </mesh>

            {/* Tråkkmekanisme (joint) */}
            {built.joint && (
                <group position={[0, 0.1, 0.9]}>
                    <mesh castShadow>
                        <boxGeometry args={[0.6, 0.4, 0.6]} />
                        <meshStandardMaterial color="#8a6a3a" roughness={0.8} />
                    </mesh>
                    <PedalCrank crank={crank} active={flying} />
                </group>
            )}

            {/* Vingene */}
            <group ref={leftWing} position={[-0.3, 0.15, 0]}>
                <MachineWing dir={-1} struts={built.light} membrane={built.curve} />
            </group>
            <group ref={rightWing} position={[0.3, 0.15, 0]}>
                <MachineWing dir={1} struts={built.light} membrane={built.curve} />
            </group>

            {/* Feiringspartikler når den "letter" */}
            <Burst position={[0, 1.2, 0]} trigger={burst} color="#f0e2b8" count={30} spread={3.5} />
        </group>
    );
}

// Roterende pedal-arm som spinner med pedalkraften.
function PedalCrank({ crank, active }: { crank: number; active: boolean }) {
    const arm = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!arm.current) return;
        arm.current.rotation.x += active ? dt * (1 + crank * 8) : 0;
    });
    return (
        <group ref={arm} position={[0, 0, 0.35]}>
            <mesh castShadow>
                <boxGeometry args={[0.12, 0.5, 0.08]} />
                <meshStandardMaterial color={theme.accent} roughness={0.7} />
            </mesh>
        </group>
    );
}

// Én vinge: spilene (struts) og seilduken (membrane) dukker opp når de bygges.
function MachineWing({
    dir,
    struts,
    membrane,
}: {
    dir: number;
    struts: boolean;
    membrane: boolean;
}) {
    const strutRef = useRef<THREE.Group>(null);
    const memRef = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (strutRef.current)
            strutRef.current.scale.x = damp(strutRef.current.scale.x, struts ? 1 : 0.001, dt, 5);
        if (memRef.current)
            memRef.current.scale.x = damp(memRef.current.scale.x, membrane ? 1 : 0.001, dt, 5);
    });

    // Tre radiale spiler som vifter ut langs X.
    const spars = useMemo(() => [0.25, 0, -0.25], []);

    return (
        <group>
            {/* Rammeverk: spiler */}
            <group ref={strutRef} scale={[0.001, 1, 1]}>
                {spars.map((zoff, i) => (
                    <mesh
                        key={i}
                        position={[dir * 1.9, 0, zoff * 2]}
                        rotation={[0, dir > 0 ? -0.12 * i : 0.12 * i, 0]}
                        castShadow
                    >
                        <boxGeometry args={[3.6, 0.07, 0.07]} />
                        <meshStandardMaterial color={theme.wood} roughness={0.85} />
                    </mesh>
                ))}
                {/* fremre kant-spile */}
                <mesh position={[dir * 1.9, 0, 0]} castShadow>
                    <boxGeometry args={[0.09, 0.09, 1.1]} />
                    <meshStandardMaterial color="#5a4a2a" roughness={0.85} />
                </mesh>
            </group>

            {/* Seilduk: membran spent mellom spilene */}
            <group ref={memRef} scale={[0.001, 1, 1]}>
                <mesh position={[dir * 1.9, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <planeGeometry args={[3.6, 1.1]} />
                    <meshStandardMaterial
                        color="#ece0c2"
                        roughness={1}
                        side={THREE.DoubleSide}
                        transparent
                        opacity={0.96}
                    />
                </mesh>
            </group>
        </group>
    );
}

export default LeonardoFlygemaskin3D;
