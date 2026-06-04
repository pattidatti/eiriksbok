import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Wind } from 'lucide-react';
import {
    MicroGameScaffold,
    Hotspot,
    Interactive,
    SceneSlider,
    StepTracker,
    SceneBanner,
    SceneBadge,
    SceneFact,
    WinScreen,
    DataReadout,
    DragHint,
    GroundPlane,
    WaterPlane,
    Tree,
    Gear,
    Burst,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til artikkelen "Vannet som jobbet: vann- og vindmølla".
// Lyspære: kraften kan hentes rett ut av naturen - en elv som renner eller en
// vind som blåser - og føres gjennom tannhjul til å gjøre det tunge arbeidet,
// uten en eneste sliten arm. Eleven kjenner det på kroppen i tre steg:
//   1) Vann: hell korn i trakta og åpne slusen -> hjulet maler mel av seg selv.
//   2) Mer enn mel: koble inn stamphammeren -> samme kraft banker jern.
//   3) Vind: elva tørker inn, hjulet står -> vri mølla mot vinden så vingene
//      driver de samme steinene videre.

const WIND_DIR = 90; // grader der vinden gir best tak

// Naturlig, lys palett (middelalder-bygd, ikke sotete industri).
const SKY = '#cfe6f2';
const COL = {
    ground: '#7da44e',
    water: '#3f86ab',
    wood: '#6b4a2a',
    woodDark: '#523620',
    stone: '#9aa0a6',
    stoneDark: '#7c828a',
    sack: '#e7d8a6',
    accent: '#b9722e',
};

type Step = 1 | 2 | 3;

const Vannmolla3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [step, setStep] = useState<Step>(1);
    const [waterFlow, setWaterFlow] = useState(0); // 0..1, slusen
    const [capAngle, setCapAngle] = useState(0); // 0..360, mølle-hetten
    const [grainLoaded, setGrainLoaded] = useState(false);
    const [hammerOn, setHammerOn] = useState(false);
    const [flour, setFlour] = useState(0); // 0..100 (% av en sekk)
    const [done, setDone] = useState(false);
    const [banner, setBanner] = useState<string | null>('Hell korn i trakta over kvernsteinene.');
    const [fact, setFact] = useState<string | null>(null);
    const [burst, setBurst] = useState(0);
    const [resetKey, setResetKey] = useState(0);

    const reset = () => {
        setStep(1);
        setWaterFlow(0);
        setCapAngle(0);
        setGrainLoaded(false);
        setHammerOn(false);
        setFlour(0);
        setDone(false);
        setBanner('Hell korn i trakta over kvernsteinene.');
        setFact(null);
        setResetKey((k) => k + 1);
    };

    const riverDry = step === 3;
    const windCatch = riverDry ? Math.max(0, Math.cos(((capAngle - WIND_DIR) * Math.PI) / 180)) : 0;
    // Hjulet snurrer med vannet i steg 1-2, står stille når elva er tørr.
    const wheelPower = riverDry ? 0 : waterFlow;
    // Det som driver kvernsteinene: vann i steg 1-2, vind i steg 3.
    const millPower = riverDry ? windCatch : waterFlow;

    // Hell korn i trakta (steg 1).
    const pourGrain = () => {
        if (grainLoaded) return;
        setGrainLoaded(true);
        sounds.play('drop');
        setBanner('Kornet ligger klart. Åpne slusen så elva maler det.');
    };

    // Mel-mengden oppdateres fra scenens useFrame. Når en hel sekk er malt
    // (steg 1), går vi videre - vi reagerer på selve hendelsen, ikke i en effekt.
    const handleFlour = (v: number) => {
        setFlour(v);
        if (step === 1 && v >= 100) {
            sounds.play('advance');
            setStep(2);
            setBanner('Sekken er full! Men kraften kan brukes til mer enn mel.');
            setFact(
                'Med noen smarte tannhjul kan den runde bevegelsen gjøres om til andre slags bevegelser. Det samme hjulet drev sager og store hamre.'
            );
        }
    };

    // Koble inn stamphammeren (steg 2).
    const engageHammer = () => {
        if (step !== 2 || hammerOn) return;
        setHammerOn(true);
        sounds.play('correct');
        setBanner('Stamphammeren banker jern - samme elv, ny jobb.');
        setFact(null);
        window.setTimeout(() => {
            sounds.play('sceneChange');
            setStep(3);
            setBanner('Sommeren kom og elva tørket inn. Hjulet står stille.');
            setFact(
                'Vannmølla hadde én svakhet: den trengte en elv. Der landet var flatt og tørt, måtte en annen kraft ta over.'
            );
        }, 1900);
    };

    // Steg 3: vri hetten til vingene fanger vinden. Vi sjekker direkte når
    // eleven drar i spaken - ikke i en effekt.
    const handleCap = (v: number) => {
        setCapAngle(v);
        if (step === 3 && !done) {
            const c = Math.max(0, Math.cos(((v - WIND_DIR) * Math.PI) / 180));
            if (c >= 0.94) {
                setDone(true);
                setBurst((b) => b + 1);
                sounds.play('complete');
                setBanner(null);
                window.setTimeout(() => onComplete({ score: 1, completed: true }), 300);
            }
        }
    };

    const rpm = Math.round(millPower * 30);
    const readout =
        step === 3
            ? [
                  { label: 'Vind fanget', value: Math.round(windCatch * 100), unit: '%' },
                  { label: 'Mel', value: flour, unit: '%' },
              ]
            : [
                  { label: 'Steinen', value: rpm, unit: 'o/min' },
                  { label: 'Mel', value: flour, unit: '%' },
              ];

    const idleHint = step === 1 && !grainLoaded;

    return (
        <MicroGameScaffold
            title="Mølla som aldri ble trøtt"
            subtitle="La elva male kornet, koble inn hammeren, og vri mølla mot vinden når elva svikter"
            estimatedSeconds={150}
            onRetry={grainLoaded || step > 1 || waterFlow > 0 || capAngle > 0 ? reset : undefined}
            canvas={{
                idle: false,
                controls: true,
                camera: { position: [9.5, 7, 11], fov: 42 },
                background: SKY,
                target: [1, 1.1, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {step === 1 ? 'Vannmølla' : step === 2 ? 'Sag og hammer' : 'Vindmølla'}
                    </SceneBadge>
                    <DataReadout items={readout} corner="bl" />
                    <DragHint show={idleHint} corner="bc">
                        Klikk den gule ringen over trakta
                    </DragHint>
                </>
            }
            scene={
                <MillScene
                    key={resetKey}
                    step={step}
                    wheelPower={wheelPower}
                    millPower={millPower}
                    windPower={windCatch}
                    capAngle={capAngle}
                    grainLoaded={grainLoaded}
                    hammerOn={hammerOn}
                    riverDry={riverDry}
                    burst={burst}
                    onPourGrain={pourGrain}
                    onEngageHammer={engageHammer}
                    onFlour={handleFlour}
                />
            }
        >
            {step === 1 && (
                <div className="flex flex-col gap-2.5">
                    <StepTracker current={1} total={3} />
                    <p className="text-sm text-slate-600">
                        {grainLoaded
                            ? 'Dra i spaken for å åpne sluseporten. Jo mer vann som renner forbi skovlene, jo raskere maler steinen.'
                            : 'Først må det være korn å male. Klikk den gule ringen over trakta for å helle korn på steinene.'}
                    </p>
                    <SceneSlider
                        label="Sluseporten: hvor mye vann slipper du på hjulet?"
                        min={0}
                        max={1}
                        step={0.01}
                        value={waterFlow}
                        onChange={setWaterFlow}
                        valueLabel={(v) =>
                            v < 0.05 ? 'Lukket' : v < 0.5 ? 'Litt vann' : 'Full elv'
                        }
                    />
                    {fact && <SceneFact>{fact}</SceneFact>}
                </div>
            )}

            {step === 2 && (
                <div className="flex flex-col gap-2.5">
                    <StepTracker current={2} total={3} />
                    <p className="text-sm text-slate-600">
                        {hammerOn
                            ? 'Kjenn på det: den samme runde bevegelsen ble nå til harde slag. Slik drev mølla også sager og smihamre.'
                            : 'Klikk den glødende kløtsjen ved hammeren for å koble vannhjulet til stamphammeren.'}
                    </p>
                    {fact && <SceneFact>{fact}</SceneFact>}
                </div>
            )}

            {step === 3 && !done && (
                <div className="flex flex-col gap-2.5">
                    <StepTracker current={3} total={3} />
                    <p className="text-sm text-slate-600">
                        Elva er tørr, men vinden blåser. Vri hetten på vindmølla til vingene står
                        rett mot vinden. Følg med på "Vind fanget" - jo høyere tall, jo bedre tak.
                    </p>
                    <SceneSlider
                        label="Vri mølla mot vinden"
                        min={0}
                        max={360}
                        step={2}
                        value={capAngle}
                        onChange={handleCap}
                        valueLabel={(v) => `${v}°`}
                    />
                    {fact && <SceneFact>{fact}</SceneFact>}
                </div>
            )}

            {done && (
                <WinScreen title="Du fanget vinden!" onReplay={reset}>
                    <span className="inline-flex items-center gap-1.5">
                        <Wind className="w-4 h-4 text-amber-500" />
                        Først elva, så vinden - begge malte de samme steinene helt av seg selv.
                    </span>{' '}
                    Mølla lærte menneskene den viktigste leksjonen av alle: kraft trenger ikke komme
                    fra en sliten kropp, men kan hentes rett ut av naturen. Den ideen pekte rett
                    fram mot dampmaskinen.
                </WinScreen>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function MillScene({
    step,
    wheelPower,
    millPower,
    windPower,
    capAngle,
    grainLoaded,
    hammerOn,
    riverDry,
    burst,
    onPourGrain,
    onEngageHammer,
    onFlour,
}: {
    step: Step;
    wheelPower: number;
    millPower: number;
    windPower: number;
    capAngle: number;
    grainLoaded: boolean;
    hammerOn: boolean;
    riverDry: boolean;
    burst: number;
    onPourGrain: () => void;
    onEngageHammer: () => void;
    onFlour: (v: number) => void;
}) {
    // Mel akkumuleres i en ref (sannheten), speiles til state kun når heltallet
    // endrer seg - aldri setState hver frame.
    const flourRef = useRef(0);
    const lastInt = useRef(0);
    const sackRef = useRef<THREE.Group>(null);
    const waterGroup = useRef<THREE.Group>(null); // demper elve-nivået ned når den tørker

    useFrame((_, dt) => {
        // Grinding: produser mel når steinen går og det finnes korn.
        if (grainLoaded && millPower > 0.12 && flourRef.current < 100) {
            flourRef.current = Math.min(100, flourRef.current + millPower * 16 * dt);
            const i = Math.round(flourRef.current);
            if (i !== lastInt.current) {
                lastInt.current = i;
                onFlour(i);
            }
        }
        // Melsekken vokser med mel-mengden.
        if (sackRef.current) {
            const target = 0.18 + (flourRef.current / 100) * 0.9;
            sackRef.current.scale.y = damp(sackRef.current.scale.y, target, dt, 5);
        }
        // Elve-nivået synker når den tørker inn.
        if (waterGroup.current) {
            waterGroup.current.position.y = damp(
                waterGroup.current.position.y,
                riverDry ? -0.55 : 0,
                dt,
                1.2
            );
        }
    });

    return (
        <group>
            <GroundPlane size={42} depth={34} color={COL.ground} />

            {/* Elva renner langs X foran mølla. Synker når den tørker. */}
            <group ref={waterGroup}>
                <WaterPlane position={[-3.2, 0.06, 2.6]} size={[16, 3.4]} color={COL.water} />
            </group>
            {/* Tørr elveleie under, så det ser uttørket ut i steg 3 */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.2, -0.04, 2.6]} receiveShadow>
                <planeGeometry args={[16, 3.4]} />
                <meshStandardMaterial color="#9c8a5a" roughness={1} />
            </mesh>

            <Trees />

            {/* Mølle-huset */}
            <MillHouse />

            {/* Vannhjulet i elva */}
            <WaterWheel power={wheelPower} />

            {/* Drivverk: aksling + stort tannhjul inne ved huset */}
            <DriveTrain wheelPower={wheelPower} millPower={millPower} />

            {/* Kvernsteinene + trakt + melsekk */}
            <group position={[1.4, 0, -0.1]}>
                <MillStones millPower={millPower} />
                <Hopper grainLoaded={grainLoaded} />
                <group ref={sackRef} position={[1.1, 0.0, 0.8]} scale={[1, 0.18, 1]}>
                    <mesh position={[0, 0.6, 0]} castShadow>
                        <cylinderGeometry args={[0.34, 0.42, 1.2, 10]} />
                        <meshStandardMaterial color={COL.sack} roughness={0.95} />
                    </mesh>
                </group>
                {/* Steg 1: hell korn i trakta */}
                {step === 1 && !grainLoaded && (
                    <Hotspot
                        position={[0, 2.5, 0]}
                        onSelect={onPourGrain}
                        label="Hell korn i trakta"
                        radius={0.55}
                    />
                )}
            </group>

            {/* Stamphammeren (steg 2-3) */}
            <TripHammer active={hammerOn} power={hammerOn ? Math.max(millPower, 0.5) : 0} />
            {step === 2 && !hammerOn && (
                <Interactive onSelect={onEngageHammer} hitArea={[1.4, 1.4, 1.4]}>
                    {(s) => (
                        <mesh position={[3.4, 1.15, -1.3]} castShadow>
                            <cylinderGeometry args={[0.26, 0.26, 0.4, 8]} />
                            <meshStandardMaterial
                                color={s === 'hover' ? '#fcd34d' : COL.accent}
                                emissive={COL.accent}
                                emissiveIntensity={s === 'hover' ? 0.9 : 0.5}
                                metalness={0.3}
                                roughness={0.5}
                            />
                        </mesh>
                    )}
                </Interactive>
            )}

            {/* Vindmølla - står i landskapet, kommer til liv i steg 3 */}
            <Windmill capAngle={capAngle} windPower={windPower} active={riverDry} />
            {riverDry && <WindCue />}

            {/* Feiringspartikler ved seier */}
            <Burst
                position={[5.4, 4.6, -1]}
                trigger={burst}
                color="#dff0ff"
                count={34}
                spread={4}
            />
        </group>
    );
}

// --- Trær i bakkant ---
function Trees() {
    return (
        <>
            <Tree position={[6.5, 0, -6]} leaf="#3f6b39" />
            <Tree position={[8, 0, -3.5]} leaf="#4a7a3e" />
            <Tree position={[-6, 0, -5]} leaf="#3f6b39" />
            <Tree position={[-7.5, 0, -2]} leaf="#4a7a3e" />
        </>
    );
}

// --- Mølle-huset med saltak ---
function MillHouse() {
    return (
        <group position={[1.4, 0, -0.1]}>
            <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.4, 2.0, 2.6]} />
                <meshStandardMaterial color={COL.wood} roughness={0.9} />
            </mesh>
            {/* tak */}
            <mesh position={[0, 2.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[2.2, 1.2, 4]} />
                <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
            </mesh>
            {/* dør */}
            <mesh position={[0, 0.6, 1.31]}>
                <planeGeometry args={[0.7, 1.2]} />
                <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
            </mesh>
        </group>
    );
}

// --- Vannhjulet: ring + eiker + skovler, snurrer om Z (vertikalt hjul) ---
function WaterWheel({ power }: { power: number }) {
    const ref = useRef<THREE.Group>(null);
    const paddles = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);
    useFrame((_, dt) => {
        if (ref.current) ref.current.rotation.z -= power * 3.4 * dt;
    });
    const R = 1.15;
    return (
        <group position={[-1.1, 1.25, 2.4]}>
            {/* aksling inn mot huset */}
            <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.12, 0.12, 2.6, 8]} />
                <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
            </mesh>
            <group ref={ref}>
                {/* to ringer */}
                {[-0.35, 0.35].map((z) => (
                    <mesh key={z} position={[0, 0, z]} castShadow>
                        <torusGeometry args={[R, 0.08, 8, 28]} />
                        <meshStandardMaterial color={COL.wood} roughness={0.9} />
                    </mesh>
                ))}
                {/* eiker */}
                {paddles.slice(0, 6).map((i) => {
                    const a = (i / 6) * Math.PI * 2;
                    return (
                        <mesh key={`s${i}`} rotation={[0, 0, a]} castShadow>
                            <boxGeometry args={[0.07, 2 * R, 0.07]} />
                            <meshStandardMaterial color={COL.wood} roughness={0.9} />
                        </mesh>
                    );
                })}
                {/* skovler (de flate platene som vannet dytter på) */}
                {paddles.map((i) => {
                    const a = (i / paddles.length) * Math.PI * 2;
                    return (
                        <mesh
                            key={`p${i}`}
                            position={[Math.cos(a) * R, Math.sin(a) * R, 0]}
                            rotation={[0, 0, a]}
                            castShadow
                        >
                            <boxGeometry args={[0.08, 0.34, 0.8]} />
                            <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
                        </mesh>
                    );
                })}
            </group>
        </group>
    );
}

// --- Drivverk: et stort tannhjul på akslingen som overfører kraften inn ---
function DriveTrain({ wheelPower, millPower }: { wheelPower: number; millPower: number }) {
    return (
        <group position={[0.5, 1.25, 1.3]}>
            {/* stort vannhjuls-tannhjul (snurrer om Z med vannhjulet) */}
            <Gear
                position={[0, 0, 0]}
                radius={0.55}
                teeth={12}
                color={COL.stone}
                spin={-wheelPower * 3.4}
            />
            {/* mindre tannhjul som griper inn (kjernen i "smarte tannhjul") */}
            <Gear
                position={[0.78, -0.2, 0]}
                radius={0.28}
                teeth={8}
                color={COL.stoneDark}
                spin={millPower * 6.8}
            />
        </group>
    );
}

// --- Kvernsteinene: liggesteinen + løpersteinen som snurrer om Y ---
function MillStones({ millPower }: { millPower: number }) {
    const runner = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (runner.current) runner.current.rotation.y += millPower * 4 * dt;
    });
    return (
        <group position={[0, 1.05, 0]}>
            {/* benk */}
            <mesh position={[0, -0.25, 0]} castShadow>
                <cylinderGeometry args={[0.85, 0.9, 0.3, 16]} />
                <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
            </mesh>
            {/* liggesteinen */}
            <mesh position={[0, -0.04, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.74, 0.74, 0.16, 24]} />
                <meshStandardMaterial color={COL.stoneDark} roughness={1} />
            </mesh>
            {/* løpersteinen (snurrer) */}
            <group ref={runner}>
                <mesh position={[0, 0.1, 0]} castShadow>
                    <cylinderGeometry args={[0.72, 0.72, 0.18, 24]} />
                    <meshStandardMaterial color={COL.stone} roughness={1} />
                </mesh>
                {/* hakk i steinen så rotasjonen synes */}
                <mesh position={[0.4, 0.2, 0]}>
                    <boxGeometry args={[0.5, 0.04, 0.06]} />
                    <meshStandardMaterial color={COL.stoneDark} />
                </mesh>
            </group>
        </group>
    );
}

// --- Trakta som kornet helles i, over steinene ---
function Hopper({ grainLoaded }: { grainLoaded: boolean }) {
    return (
        <group position={[0, 1.9, 0]}>
            <mesh castShadow>
                <coneGeometry args={[0.42, 0.6, 4, 1, true]} />
                <meshStandardMaterial color={COL.wood} roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
            {/* korn-haug oppi når den er fylt */}
            {grainLoaded && (
                <mesh position={[0, 0.12, 0]}>
                    <coneGeometry args={[0.3, 0.28, 8]} />
                    <meshStandardMaterial color="#d9b44a" roughness={1} />
                </mesh>
            )}
        </group>
    );
}

// --- Stamphammeren: en bjelke som vipper og banker en ambolt ---
function TripHammer({ active, power }: { active: boolean; power: number }) {
    const beam = useRef<THREE.Group>(null);
    const phase = useRef(0);
    useFrame((_, dt) => {
        if (!beam.current) return;
        phase.current += power * 5 * dt;
        const lift = active ? Math.max(0, Math.sin(phase.current)) * 0.32 : 0;
        beam.current.rotation.z = damp(beam.current.rotation.z, -lift, dt, 14);
    });
    return (
        <group position={[3.4, 0, -1.3]}>
            {/* stativ */}
            <mesh position={[0, 0.7, 0]} castShadow>
                <boxGeometry args={[0.16, 1.4, 0.16]} />
                <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
            </mesh>
            {/* ambolt */}
            <mesh position={[0.95, 0.45, 0]} castShadow>
                <boxGeometry args={[0.4, 0.4, 0.4]} />
                <meshStandardMaterial color={COL.stoneDark} metalness={0.4} roughness={0.5} />
            </mesh>
            {/* vippe-bjelken med hammerhode */}
            <group ref={beam} position={[0, 1.3, 0]}>
                <mesh position={[0.5, 0, 0]} castShadow>
                    <boxGeometry args={[1.3, 0.16, 0.16]} />
                    <meshStandardMaterial color={COL.wood} roughness={0.9} />
                </mesh>
                <mesh position={[0.95, -0.18, 0]} castShadow>
                    <boxGeometry args={[0.3, 0.4, 0.3]} />
                    <meshStandardMaterial color={COL.stone} metalness={0.3} roughness={0.6} />
                </mesh>
            </group>
        </group>
    );
}

// --- Vindmølla: tårn + hette som vris (capAngle) + vinger som snurrer ---
function Windmill({
    capAngle,
    windPower,
    active,
}: {
    capAngle: number;
    windPower: number;
    active: boolean;
}) {
    const cap = useRef<THREE.Group>(null);
    const sails = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (cap.current) {
            const target = (capAngle * Math.PI) / 180;
            cap.current.rotation.y = damp(cap.current.rotation.y, target, dt, 8);
        }
        if (sails.current) sails.current.rotation.z += windPower * 5 * dt;
    });
    const blades = useMemo(() => [0, 1, 2, 3], []);
    return (
        <group position={[5.4, 0, -1]}>
            {/* tårn */}
            <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.7, 1.1, 3.4, 12]} />
                <meshStandardMaterial color="#cdbd9a" roughness={0.95} />
            </mesh>
            {/* hetten som vris mot vinden */}
            <group ref={cap} position={[0, 3.55, 0]}>
                <mesh castShadow>
                    <coneGeometry args={[0.85, 0.8, 12]} />
                    <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
                </mesh>
                {/* nav + vinger foran (peker i hettens +Z) */}
                <group position={[0, 0, 0.7]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.14, 0.14, 0.4, 8]} />
                        <meshStandardMaterial color={COL.woodDark} roughness={0.9} />
                    </mesh>
                    <group ref={sails} position={[0, 0, 0.2]}>
                        {blades.map((i) => {
                            const a = (i / 4) * Math.PI * 2;
                            return (
                                <group key={i} rotation={[0, 0, a]}>
                                    {/* vinge-stang */}
                                    <mesh position={[0, 0.85, 0]} castShadow>
                                        <boxGeometry args={[0.08, 1.7, 0.05]} />
                                        <meshStandardMaterial
                                            color={COL.woodDark}
                                            roughness={0.9}
                                        />
                                    </mesh>
                                    {/* seilduk */}
                                    <mesh position={[0.22, 0.85, 0.02]}>
                                        <planeGeometry args={[0.3, 1.5]} />
                                        <meshStandardMaterial
                                            color={active ? '#f3ead2' : '#cfc6ad'}
                                            roughness={0.95}
                                            side={THREE.DoubleSide}
                                        />
                                    </mesh>
                                </group>
                            );
                        })}
                    </group>
                </group>
            </group>
        </group>
    );
}

// --- Vind-peker: en pil som viser hvor vinden kommer fra, + driv-skyer ---
function WindCue() {
    const clouds = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!clouds.current) return;
        clouds.current.children.forEach((c) => {
            c.position.x -= dt * 1.2;
            if (c.position.x < -10) c.position.x = 11;
        });
    });
    return (
        <group>
            {/* vinden kommer fra +X (peker mot mølla) */}
            <group position={[9, 4.2, -1]} rotation={[0, 0, 0]}>
                <mesh rotation={[0, 0, -Math.PI / 2]}>
                    <coneGeometry args={[0.3, 0.7, 8]} />
                    <meshStandardMaterial color="#5fa8d8" />
                </mesh>
                <mesh position={[0.5, 0, 0]}>
                    <boxGeometry args={[0.9, 0.12, 0.12]} />
                    <meshStandardMaterial color="#5fa8d8" />
                </mesh>
            </group>
            <group ref={clouds}>
                {[
                    [7, 5.5, -4],
                    [2, 6.2, -6],
                    [-4, 5.8, -3],
                ].map((p, i) => (
                    <mesh key={i} position={p as [number, number, number]}>
                        <sphereGeometry args={[1.1, 10, 8]} />
                        <meshStandardMaterial color="#ffffff" transparent opacity={0.55} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

export default Vannmolla3D;
