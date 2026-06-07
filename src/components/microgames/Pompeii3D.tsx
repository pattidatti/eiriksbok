import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    GroundPlane,
    Smoke,
    SceneBanner,
    SceneBadge,
    DragHint,
    SceneFact,
    WinScreen,
    SceneSlider,
    DataReadout,
    damp,
    Burst,
    useAmbience,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til "Pompeii: Byen som ble frosset i tid".
//
// Lyspæra: det som ØDELA Pompeii, reddet den også. Eleven drar spaken og lar
// Vesuv begrave byen i aske til den er helt borte. Så går 1700 år, asken synker
// til ruinnivå, og eleven graver fram tre ting asken har bevart akkurat slik de
// var den dagen i år 79: et veggmaleri, et brød i ovnen og en gipsavstøpning av
// et menneske. Aha-et: den samme asken som kvalte byen, forseglet og bevarte
// alt. Derfor er Pompeii en tidskapsel.
//
// Mekanikk (slider + direkte 3D-klikk + avdekk):
//   - SceneSlider "Utbruddet" styrer hvor dypt asken begraver byen (sanntid).
//   - Når byen er helt begravet, går tiden, og scenen blir til ruiner i aske.
//   - Hotspot-er over askehaugene graves fram med klikk - hvert funn avdekkes.

interface Find {
    id: string;
    pos: [number, number]; // x, z på bakken
    label: string;
    fact: string;
}

const FINDS: Find[] = [
    {
        id: 'fresco',
        pos: [-3.4, 1.6],
        label: 'Veggmaleri',
        fact: 'Et veggmaleri, like fargesterkt som dagen det ble malt. Asken stengte ute lys og luft, så fargene aldri falmet. Vi ser hva romerne pyntet stuene sine med.',
    },
    {
        id: 'bread',
        pos: [0, 2.4],
        label: 'Brød i ovnen',
        fact: 'Et helt brød, forkullet men intakt, fortsatt i ovnen. Asken kom så fort at bakeren aldri rakk å ta det ut. Vi ser et måltid frosset midt i tilberedningen.',
    },
    {
        id: 'cast',
        pos: [3.4, 1.5],
        label: 'Gipsavstøpning',
        fact: 'Asken herdet rundt menneskene som døde. Da kroppen råtnet bort, ble det igjen et tomrom. På 1800-tallet helte arkeologen Fiorelli gips i hullene, og fram kom personen i sitt aller siste øyeblikk.',
    },
];

// Enkel modul-RNG (ren funksjon) for spredning av askefnugg - se InstancedField.
let _seed = 7;
function rand(): number {
    _seed = (_seed * 16807) % 2147483647;
    return _seed / 2147483647;
}

type Phase = 'eruption' | 'excavation' | 'done';

const Pompeii3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const ambience = useAmbience('wind');
    const [phase, setPhase] = useState<Phase>('eruption');
    const [burial, setBurial] = useState(0); // 0-1, hvor dypt asken ligger
    const [revealed, setRevealed] = useState<string[]>([]);
    const [burst, setBurst] = useState(0);
    const [burstPos, setBurstPos] = useState<[number, number, number]>([0, 1, 0]);
    const [banner, setBanner] = useState<string | null>(
        'Dra spaken under vinduet og la Vesuv begrave Pompeii i aske.'
    );
    const [fact, setFact] = useState<string | null>(null);

    const dug = revealed.length;
    const idle = phase === 'eruption' && burial < 0.03;
    const ashMeters = Math.round(burial * 6); // asken ble ca. 6 meter tjukk

    const reset = () => {
        setPhase('eruption');
        setBurial(0);
        setRevealed([]);
        setFact(null);
        setBanner('Dra spaken under vinduet og la Vesuv begrave Pompeii i aske.');
    };

    const startExcavation = () => {
        setPhase('excavation');
        setBurial(1);
        sounds.play('sceneChange');
        setBanner(
            '1700 år senere graver arkeologene fram byen. Klikk de pulserende punktene og avdekk det asken har bevart.'
        );
    };

    const onBury = (v: number) => {
        if (phase !== 'eruption') return;
        setBurial(v);
        if (v > 0.04) ambience.start();
        if (v >= 0.985) {
            startExcavation();
        } else if (v > 0.45) {
            setBanner('Asken faller som snø. Takene raser sammen under vekten, og byen forsvinner.');
        } else {
            setBanner('Dra spaken videre. La asken legge seg metervis over hele Pompeii.');
        }
    };

    const dig = (find: Find) => {
        if (phase !== 'excavation' || revealed.includes(find.id)) return;
        const next = [...revealed, find.id];
        setRevealed(next);
        setBurstPos([find.pos[0], 1.1, find.pos[1]]);
        setBurst((b) => b + 1);
        setFact(find.fact);
        if (next.length >= FINDS.length) {
            sounds.play('complete');
            setBanner(null);
            setPhase('done');
            setTimeout(() => onComplete({ score: 1, completed: true }), 350);
        } else {
            sounds.play('advance');
            setBanner('Bevart i asken! Grav fram resten.');
        }
    };

    return (
        <MicroGameScaffold
            title="Pompeii: byen som ble frosset"
            subtitle="La Vesuv begrave byen i aske, og grav fram det asken bevarte"
            estimatedSeconds={150}
            onRetry={burial > 0.03 || phase !== 'eruption' ? reset : undefined}
            canvas={{
                idle,
                camera: { position: [0, 5.6, 13], fov: 44 },
                background: '#f1e3c4',
                fog: { near: 24, far: 52 },
                target: [0, 1.2, -1],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {phase === 'eruption' ? 'Vesuv - år 79 evt.' : 'Utgravningen i dag'}
                    </SceneBadge>
                    {phase === 'eruption' ? (
                        <DataReadout
                            corner="bl"
                            items={[{ label: 'Asketykkelse', value: ashMeters, unit: 'm' }]}
                        />
                    ) : (
                        <DataReadout
                            corner="bl"
                            items={[{ label: 'Gravd fram', value: `${dug}/${FINDS.length}` }]}
                        />
                    )}
                    <DragHint show={idle} corner="bc">
                        Dra spaken under vinduet
                    </DragHint>
                </>
            }
            scene={
                <PompeiiScene
                    phase={phase}
                    burial={burial}
                    revealed={revealed}
                    burst={burst}
                    burstPos={burstPos}
                    onDig={dig}
                />
            }
        >
            <div className="flex flex-col gap-3">
                {phase === 'eruption' && (
                    <>
                        <SceneSlider
                            label="Utbruddet (hvor dypt asken begraver byen)"
                            min={0}
                            max={1}
                            step={0.01}
                            value={burial}
                            onChange={onBury}
                            valueLabel={() => `${ashMeters} m aske`}
                        />
                        <p className="text-sm text-slate-600 leading-snug">
                            Dra spaken helt til høyre. Vesuv spyr ut en søyle av aske som faller som
                            snø og begraver hele Pompeii. Det virker som slutten for byen, men se hva
                            som skjer etterpå.
                        </p>
                    </>
                )}

                {phase === 'excavation' && (
                    <>
                        <p className="text-sm text-slate-600 leading-snug">
                            Klikk de tre pulserende{' '}
                            <span className="font-bold text-amber-700">grav her</span>-punktene for å
                            fjerne asken. Under hver askehaug ligger noe asken har bevart i nesten
                            2000 år.
                        </p>
                        {fact && <SceneFact>{fact}</SceneFact>}
                    </>
                )}

                {phase === 'done' && (
                    <WinScreen title="Tidskapselen er åpnet!" onReplay={reset}>
                        Det som ødela Pompeii, reddet den også. Asken kvalte byen, men den samme
                        asken forseglet alt: maling, brød, til og med menneskene, akkurat slik det
                        var den dagen i år 79. Ingen annen kilde gir oss en hel romersk dag frosset i
                        tid. Derfor er Pompeii en tidskapsel.
                    </WinScreen>
                )}
            </div>
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function PompeiiScene({
    phase,
    burial,
    revealed,
    burst,
    burstPos,
    onDig,
}: {
    phase: Phase;
    burial: number;
    revealed: string[];
    burst: number;
    burstPos: [number, number, number];
    onDig: (find: Find) => void;
}) {
    // Asketeppet: stiger under utbruddet, synker til ruinnivå når tiden går.
    const ashTop = phase === 'eruption' ? burial * 3.6 : 0.45;

    return (
        <group>
            <GroundPlane size={42} depth={40} color="#cdb98c" />

            {/* Vesuv i bakgrunnen */}
            <Volcano burial={phase === 'eruption' ? burial : 1} />
            <AshColumn target={phase === 'eruption' ? 0.2 + burial * 5.6 : 0} />
            <Smoke origin={[0, 5.4, -8]} show={phase === 'eruption' && burial > 0.1} color="#9a948a" count={6} />

            {/* Byen Pompeii: hus og søyler. Står hele, blir til ruiner i aske. */}
            <Town />

            {/* De tre funnene ligger på bakken hele tiden, men er dekket av
                store askehauger til eleven graver dem fram. */}
            {FINDS.map((f) => (
                <FindSite
                    key={f.id}
                    find={f}
                    phase={phase}
                    revealed={revealed.includes(f.id)}
                    onDig={() => onDig(f)}
                />
            ))}

            {/* Asketeppet som svelger byen og senere ligger som ruinmark */}
            <AshBlanket top={ashTop} />

            {/* Askefnugg som faller som snø under utbruddet */}
            <AshFall intensity={phase === 'eruption' ? burial : 0} />

            <Burst position={burstPos} trigger={burst} color="#c9bfa6" count={24} spread={2.4} />
        </group>
    );
}

// Vulkanen. Krateret gløder rødt jo kraftigere utbruddet er.
function Volcano({ burial }: { burial: number }) {
    const glow = useRef<THREE.MeshStandardMaterial>(null);
    useFrame((_, dt) => {
        if (glow.current) {
            glow.current.emissiveIntensity = damp(
                glow.current.emissiveIntensity,
                0.3 + burial * 2.4,
                dt,
                3
            );
        }
    });
    return (
        <group position={[0, 0, -8]}>
            <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <coneGeometry args={[5.2, 5.4, 28]} />
                <meshStandardMaterial color="#6f6053" roughness={1} flatShading />
            </mesh>
            {/* krater-glød */}
            <mesh position={[0, 5.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.9, 20]} />
                <meshStandardMaterial
                    ref={glow}
                    color="#ff6a2a"
                    emissive="#ff4d00"
                    emissiveIntensity={0.3}
                    roughness={0.6}
                />
            </mesh>
        </group>
    );
}

// Askesøyla over krateret: en stamme som vokser og en flat "pinje"-paraply på
// toppen, akkurat slik Plinius beskrev skyen.
function AshColumn({ target }: { target: number }) {
    const stem = useRef<THREE.Mesh>(null);
    const canopy = useRef<THREE.Group>(null);
    const hRef = useRef(0);
    useFrame((_, dt) => {
        hRef.current = damp(hRef.current, target, dt, 4);
        const h = hRef.current;
        if (stem.current) {
            stem.current.scale.y = Math.max(0.001, h);
            stem.current.position.y = 5.2 + (h * 1) / 2;
            stem.current.visible = h > 0.05;
        }
        if (canopy.current) {
            canopy.current.position.y = 5.2 + h;
            const s = Math.max(0.001, Math.min(1, h / 3));
            canopy.current.scale.setScalar(s);
            canopy.current.visible = h > 0.4;
        }
    });
    return (
        <group position={[0, 0, -8]}>
            <mesh ref={stem} position={[0, 5.2, 0]}>
                <cylinderGeometry args={[0.55, 0.85, 1, 12]} />
                <meshStandardMaterial color="#8c8377" roughness={1} transparent opacity={0.92} />
            </mesh>
            <group ref={canopy} position={[0, 5.2, 0]}>
                <mesh scale={[1, 0.5, 1]}>
                    <sphereGeometry args={[2.4, 16, 12]} />
                    <meshStandardMaterial color="#9a9084" roughness={1} transparent opacity={0.9} />
                </mesh>
            </group>
        </group>
    );
}

// Byen: noen hus og en liten tempelfront med søyler.
function Town() {
    return (
        <group>
            <SimpleHouse position={[-4.3, 0, -1]} body="#c08a5a" />
            <SimpleHouse position={[-2.4, 0, -2]} body="#b87f52" />
            <SimpleHouse position={[4.3, 0, -1.2]} body="#bd855a" />
            <SimpleHouse position={[2.5, 0, -2.1]} body="#c79066" />
            {/* tempelfront bak i midten */}
            <group position={[0, 0, -3.4]}>
                {[-1.6, -0.8, 0, 0.8, 1.6].map((x) => (
                    <Column key={x} position={[x, 0, 0]} h={2.2} />
                ))}
                <mesh position={[0, 2.5, 0]} castShadow>
                    <boxGeometry args={[4.2, 0.5, 1.1]} />
                    <meshStandardMaterial color="#cbb894" roughness={0.95} />
                </mesh>
                {/* gavltak over søylene */}
                <mesh position={[0, 2.95, 0]} castShadow>
                    <boxGeometry args={[4.4, 0.4, 1.2]} />
                    <meshStandardMaterial color="#bda983" roughness={0.95} />
                </mesh>
            </group>
            {/* en brukken søyle som "ruin" foran */}
            <Column position={[-1.5, 0, 3.2]} h={1.1} />
            <Column position={[1.6, 0, 3.4]} h={0.7} />
        </group>
    );
}

function SimpleHouse({
    position,
    body,
}: {
    position: [number, number, number];
    body: string;
}) {
    return (
        <group position={position}>
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.8, 1.5, 1.5]} />
                <meshStandardMaterial color={body} roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.75, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[1.45, 0.7, 4]} />
                <meshStandardMaterial color="#8a5a3a" roughness={0.95} />
            </mesh>
        </group>
    );
}

function Column({ position, h }: { position: [number, number, number]; h: number }) {
    return (
        <mesh position={[position[0], h / 2, position[2]]} castShadow receiveShadow>
            <cylinderGeometry args={[0.22, 0.26, h, 12]} />
            <meshStandardMaterial color="#d8c8a4" roughness={0.9} />
        </mesh>
    );
}

// Et funnsted: selve funnet + en askehaug som dekker det, med en hotspot.
function FindSite({
    find,
    phase,
    revealed,
    onDig,
}: {
    find: Find;
    phase: Phase;
    revealed: boolean;
    onDig: () => void;
}) {
    const [x, z] = find.pos;
    // Haugen er synlig kun i utgravningsfasen og fram til funnet er gravd ut.
    const moundTarget = phase !== 'eruption' && !revealed ? 1 : 0;
    const mound = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!mound.current) return;
        const s = damp(mound.current.scale.x, moundTarget, dt, 6);
        mound.current.scale.setScalar(Math.max(0.001, s));
        mound.current.visible = s > 0.02;
    });

    return (
        <group position={[x, 0, z]}>
            {/* selve funnet ligger her hele tiden, dekkes av aske/haug */}
            {find.id === 'fresco' && <FrescoWall />}
            {find.id === 'bread' && <BreadOven />}
            {find.id === 'cast' && <BodyCast />}

            {/* askehaugen over funnet */}
            <group ref={mound}>
                <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
                    <sphereGeometry args={[1.15, 14, 10]} />
                    <meshStandardMaterial color="#bcb39e" roughness={1} flatShading />
                </mesh>
            </group>

            {/* grav-her-hotspot */}
            {phase === 'excavation' && !revealed && (
                <Hotspot
                    position={[0, 1.9, 0]}
                    onSelect={onDig}
                    label={`Grav fram: ${find.label}`}
                    radius={0.55}
                    color="#b45309"
                />
            )}
        </group>
    );
}

// Funn 1: et fargesterkt veggmaleri.
function FrescoWall() {
    return (
        <group>
            <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.7, 1.5, 0.18]} />
                <meshStandardMaterial color="#9c2b22" roughness={0.85} />
            </mesh>
            {/* enkle fargefelt som "figurer" på maleriet */}
            <mesh position={[-0.4, 1.1, 0.11]}>
                <planeGeometry args={[0.45, 0.8]} />
                <meshStandardMaterial color="#e8c14a" roughness={0.8} />
            </mesh>
            <mesh position={[0.35, 0.95, 0.11]}>
                <planeGeometry args={[0.5, 0.6]} />
                <meshStandardMaterial color="#2f6d6a" roughness={0.8} />
            </mesh>
            <mesh position={[0.2, 1.45, 0.11]}>
                <circleGeometry args={[0.18, 18]} />
                <meshStandardMaterial color="#f0ead2" roughness={0.8} />
            </mesh>
        </group>
    );
}

// Funn 2: en steinovn med et brød inni.
function BreadOven() {
    return (
        <group>
            {/* ovnskuppel */}
            <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
                <sphereGeometry args={[0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#a98a64" roughness={0.95} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.18, 0.0]}>
                <boxGeometry args={[1.2, 0.36, 1.2]} />
                <meshStandardMaterial color="#8c7250" roughness={1} />
            </mesh>
            {/* brødet */}
            <mesh position={[0, 0.42, 0.4]} castShadow>
                <cylinderGeometry args={[0.3, 0.3, 0.16, 14]} />
                <meshStandardMaterial color="#6e4a26" roughness={1} />
            </mesh>
        </group>
    );
}

// Funn 3: en gipsavstøpning av et menneske, lav og sammenkrøpet. Verdig, grå.
function BodyCast() {
    const grey = '#cfc8ba';
    return (
        <group rotation={[0, 0.5, 0]}>
            {/* sokkel */}
            <mesh position={[0, 0.12, 0]} receiveShadow>
                <boxGeometry args={[1.7, 0.24, 0.9]} />
                <meshStandardMaterial color="#b7ad97" roughness={1} />
            </mesh>
            {/* liggende kropp */}
            <mesh position={[0, 0.42, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <capsuleGeometry args={[0.22, 0.9, 6, 10]} />
                <meshStandardMaterial color={grey} roughness={1} flatShading />
            </mesh>
            {/* hode */}
            <mesh position={[0.62, 0.5, 0]} castShadow>
                <sphereGeometry args={[0.2, 12, 12]} />
                <meshStandardMaterial color={grey} roughness={1} flatShading />
            </mesh>
            {/* oppdratt kne */}
            <mesh position={[-0.4, 0.55, 0.18]} rotation={[0, 0, 0.6]} castShadow>
                <capsuleGeometry args={[0.16, 0.5, 6, 8]} />
                <meshStandardMaterial color={grey} roughness={1} flatShading />
            </mesh>
        </group>
    );
}

// Det brede asketeppet. Toppflaten ligger på `top`; resten av boksen stikker ned
// under bakken og er skjult. Stiger under utbruddet, synker til ruinnivå etterpå.
function AshBlanket({ top }: { top: number }) {
    const ref = useRef<THREE.Mesh>(null);
    const H = 7;
    useFrame((_, dt) => {
        if (!ref.current) return;
        const target = top - H / 2;
        ref.current.position.y = damp(ref.current.position.y, target, dt, 3.5);
    });
    return (
        <mesh ref={ref} position={[0, -H / 2, 0.5]} receiveShadow>
            <boxGeometry args={[15.5, H, 10.5]} />
            <meshStandardMaterial color="#bdb49f" roughness={1} flatShading />
        </mesh>
    );
}

// Askefnugg som faller som snø. Drevet rent av klokka (ingen muterte refs i
// render), antallet/størrelsen skaleres av `intensity`.
const ASH_COUNT = 60;
function AshFall({ intensity }: { intensity: number }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const flakes = useMemo(
        () =>
            Array.from({ length: ASH_COUNT }, () => ({
                x: (rand() * 2 - 1) * 7,
                z: (rand() * 2 - 1) * 4.5 - 0.5,
                off: rand(),
                speed: 0.4 + rand() * 0.5,
                drift: rand() * 6,
            })),
        []
    );
    useFrame(({ clock }) => {
        const m = mesh.current;
        if (!m) return;
        m.visible = intensity > 0.04;
        if (!m.visible) return;
        const t = clock.getElapsedTime();
        const top = 9;
        for (let i = 0; i < ASH_COUNT; i++) {
            const f = flakes[i];
            const cycle = (t * f.speed + f.off) % 1;
            const y = top - cycle * top;
            dummy.position.set(f.x + Math.sin(t * 0.6 + f.drift) * 0.4, y, f.z);
            dummy.scale.setScalar(0.05 + intensity * 0.07);
            dummy.updateMatrix();
            m.setMatrixAt(i, dummy.matrix);
        }
        m.instanceMatrix.needsUpdate = true;
    });
    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, ASH_COUNT]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#d6d0c2" roughness={1} transparent opacity={0.85} />
        </instancedMesh>
    );
}

export default Pompeii3D;
