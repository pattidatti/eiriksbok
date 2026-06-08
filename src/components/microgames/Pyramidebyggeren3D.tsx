import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Draggable,
    GroundPlane,
    WaterPlane,
    Figure,
    Rock,
    SceneBanner,
    SceneBadge,
    DragHint,
    SceneFact,
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

// Mikrospill til "Det gamle Egypt". Eleven bygger Khufus pyramide lag for lag og
// kjenner kjernepoenget på kroppen: egypterne hadde verken kraner eller maskiner.
// Det eneste som kunne løfte 2,3 millioner steinblokker høyt opp var en lang,
// slak rampe av jord og murstein. Og rampen måtte vokse sammen med pyramiden:
// jo høyere bygget ble, desto lenger måtte rampen bygges.
//
// Mekanikk (kombinerer kontinuerlig slider + direkte 3D-drag + fler-stegs bygging):
//   - SceneSlider "Bygg rampen" forlenger en sandrampe oppover i sanntid.
//   - Eleven DRAR en steinblokk på slede bort til foten av rampen.
//   - Når blokken slippes ved rampefoten, sklir den opp rampen og låser seg som
//     et nytt lag i pyramiden. Men bare hvis rampen når høyt nok. Er rampen for
//     lav, sklir blokken tilbake, og eleven må bygge rampen høyere først.

const TOTAL = 4; // antall lag eleven bygger
const BASE_HALF = 3; // halvbredde på nederste lag
const SHRINK = 0.62; // hvor mye hvert lag krymper
const FOOT_Z = 7.2; // der rampen starter på bakken
const FRONT_Z = BASE_HALF + 0.2; // der rampen lener seg mot pyramiden

// Toppen (y) til lag nr. `course` (0-indeksert). Lag 0 fyller y 0..1 osv.
function courseTopY(course: number) {
    return course + 1;
}

// Omtrentlig høyde i meter (Khufu er 147 m, delt på fire lag her).
function toMeters(level: number) {
    return Math.round((level / TOTAL) * 147);
}

const Pyramidebyggeren3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const theme = THEMES.egypt;

    const [stage, setStage] = useState(0); // antall lag som ligger
    const [ramp, setRamp] = useState(0); // rampens høyde (slider), 0..TOTAL+0.2
    const [phase, setPhase] = useState<'idle' | 'climbing'>('idle');
    const [blockKey, setBlockKey] = useState(0); // remount for å sende blokken hjem
    const [burst, setBurst] = useState(0);
    const [banner, setBanner] = useState<string | null>(
        'Dra spaken og bygg rampen. Dra så steinblokken bort til foten av rampen.'
    );
    const [fact, setFact] = useState<string | null>(null);

    const snappedRef = useRef(false);

    const done = stage >= TOTAL;
    const needY = courseTopY(stage); // rampen må nå hit for å legge neste lag
    const idle = stage === 0 && phase === 'idle' && ramp < 0.15;

    const reset = () => {
        setStage(0);
        setRamp(0);
        setPhase('idle');
        setBlockKey((k) => k + 1);
        setFact(null);
        setBanner('Dra spaken og bygg rampen. Dra så steinblokken bort til foten av rampen.');
    };

    const attemptHaul = () => {
        if (phase !== 'idle' || done) return;
        if (ramp < needY - 0.18) {
            // Rampen når ikke opp til toppen av det neste laget.
            sounds.play('incorrect');
            setBanner('Rampen når ikke så høyt. Dra spaken og bygg rampen høyere først.');
            setBlockKey((k) => k + 1); // send blokken tilbake til bruddet
            return;
        }
        // Rampen er høy nok. La blokken skli opp.
        sounds.play('pick');
        setPhase('climbing');
        setBanner('Blokken sklir opp rampen på sleden.');
        window.setTimeout(() => {
            const next = stage + 1;
            setStage(next);
            setBurst((b) => b + 1);
            setPhase('idle');
            setBlockKey((k) => k + 1);
            if (next >= TOTAL) {
                sounds.play('complete');
                setBanner(null);
                setFact(null);
                window.setTimeout(() => onComplete({ score: 1, completed: true }), 350);
            } else {
                sounds.play('advance');
                setFact(FACTS[next - 1]);
                setBanner('Et nytt lag ligger. Pyramiden er høyere nå, så rampen må bli lenger.');
            }
        }, 1000);
    };

    return (
        <MicroGameScaffold
            title="Bygg Khufus pyramide"
            subtitle="Bygg rampen høyere og dra steinblokkene opp, lag for lag. Ingen kraner, bare en rampe og mange hender."
            estimatedSeconds={150}
            onRetry={stage > 0 || ramp > 0.15 ? reset : undefined}
            canvas={{
                idle,
                camera: { position: [9, 6.5, 12], fov: 42 },
                background: theme.sky,
                fog: { color: theme.fog, near: 26, far: 54 },
                target: [0, 1.6, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {done ? 'Pyramiden står' : 'Giza, ca. 2560 fvt'}
                    </SceneBadge>
                    {!done && (
                        <DataReadout
                            corner="bl"
                            items={[
                                { label: 'Lag reist', value: `${stage}/${TOTAL}` },
                                { label: 'Rampe', value: toMeters(ramp), unit: 'm' },
                                { label: 'Trenger', value: toMeters(needY), unit: 'm' },
                            ]}
                        />
                    )}
                    <DragHint show={idle} corner="bc">
                        Dra steinblokken til foten av rampen
                    </DragHint>
                </>
            }
            scene={
                <BuildSite
                    stage={stage}
                    ramp={ramp}
                    phase={phase}
                    blockKey={blockKey}
                    burst={burst}
                    done={done}
                    theme={theme}
                    onSnap={() => {
                        snappedRef.current = true;
                        attemptHaul();
                    }}
                    onDrop={() => {
                        if (!snappedRef.current) setBlockKey((k) => k + 1);
                        snappedRef.current = false;
                    }}
                />
            }
        >
            <div className="flex flex-col gap-3">
                {!done && <StepTracker current={stage} total={TOTAL} />}

                {!done ? (
                    <>
                        <SceneSlider
                            label="Bygg rampen (hvor høyt den når)"
                            min={0}
                            max={TOTAL + 0.2}
                            step={0.05}
                            value={ramp}
                            onChange={setRamp}
                            valueLabel={(v) => `${toMeters(v)} m`}
                        />
                        <p className="text-sm text-slate-600 leading-snug">
                            Dra spaken for å bygge rampen høyere. Dra så steinblokken bort til foten
                            av rampen og slipp den. Når rampen når opp til toppen, sklir blokken på
                            plass som et nytt lag. For hvert lag blir pyramiden høyere, så rampen må
                            bygges enda lenger.
                        </p>
                        {fact && <SceneFact>{fact}</SceneFact>}
                    </>
                ) : (
                    <WinScreen title="Pyramiden står ferdig!" onReplay={reset}>
                        Du bygde et fjell av stein uten en eneste maskin. Hemmeligheten var rampen:
                        en lang, slak vei av jord og murstein som lot arbeiderne dra blokkene opp på
                        sleder. Rampen måtte vokse sammen med pyramiden, og til slutt var den nesten
                        like stor som bygget selv. Khufus pyramide er 147 meter høy og har rundt 2,3
                        millioner blokker. Det var ikke magi eller maskiner, men en smart rampe og
                        tusenvis av hender som gjorde det mulig.
                    </WinScreen>
                )}
            </div>
        </MicroGameScaffold>
    );
};

// Korte fakta mellom lagene, for en 14-åring.
const FACTS = [
    'Første lag ligger. Blokkene veier i snitt 2,5 tonn. Uten hjul og kraner var en slak rampe den eneste måten å få dem opp på.',
    'Andre lag er reist. Jo høyere du bygger, desto lenger må rampen være for å holde seg slak nok til å dra sleden opp.',
    'Tredje lag ligger. Mange forskere tror rampen til slutt ble nesten like stor som selve pyramiden.',
];

// ============================================================
//  3D-SCENEN
// ============================================================

function BuildSite({
    stage,
    ramp,
    phase,
    blockKey,
    burst,
    done,
    theme,
    onSnap,
    onDrop,
}: {
    stage: number;
    ramp: number;
    phase: 'idle' | 'climbing';
    blockKey: number;
    burst: number;
    done: boolean;
    theme: (typeof THEMES)['egypt'];
    onSnap: () => void;
    onDrop: () => void;
}) {
    return (
        <group>
            {/* Ørkensand og Nilen i bakgrunnen */}
            <GroundPlane size={60} depth={52} color={theme.ground} />
            <WaterPlane position={[0, 0.02, -16]} size={[60, 10]} color={theme.water} />

            {/* Pyramiden som vokser lag for lag */}
            <Pyramid stage={stage} done={done} stone={theme.stone} />

            {/* Den voksende sandrampen */}
            <Ramp level={ramp} sand={'#cdb079'} />

            {/* Blokken som sklir opp rampen (kun mens den klatrer) */}
            <ClimbBlock phase={phase} />

            {/* Burst der det nye laget lander */}
            <Burst
                position={[0, courseTopY(Math.max(0, stage - 1)) + 0.3, FRONT_Z - 0.6]}
                trigger={burst}
                color="#e6d3a0"
                count={24}
                spread={2.4}
            />

            {/* Steinbruddet: blokken eleven drar (skjules mens den klatrer) */}
            {!done && phase === 'idle' && (
                <Draggable
                    key={blockKey}
                    position={[6, 0, 5]}
                    snapPoints={[[0, FOOT_Z]]}
                    snapRadius={2.8}
                    onSnap={onSnap}
                    onDrop={onDrop}
                >
                    {/* Romslig usynlig gripeflate for trygg trackpad-treffing */}
                    <mesh position={[0, 0.6, 0]}>
                        <boxGeometry args={[2.4, 1.8, 2.4]} />
                        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                    </mesh>
                    <StoneSled />
                </Draggable>
            )}

            {/* Arbeidere som drar ved rampefoten (dekorativt liv) */}
            {WORKER_SLOTS.map((p, i) => (
                <Worker key={i} position={[p[0], 0, p[1]]} index={i} />
            ))}

            {/* Noen råblokker ved bruddet */}
            <Rock position={[7.4, 0, 6.6]} color="#c2a878" scale={1.1} />
            <Rock position={[8.2, 0, 4.4]} color="#b8a070" scale={0.9} />
            <Rock position={[5.6, 0, 7.4]} color="#c8b080" scale={0.8} />
        </group>
    );
}

// Pyramiden bygd som stablede, krympende lag (steg-pyramide). Med toppstein når ferdig.
function Pyramid({ stage, done, stone }: { stage: number; done: boolean; stone: string }) {
    const courses = [];
    for (let i = 0; i < stage; i++) {
        const half = BASE_HALF - i * SHRINK;
        const side = half * 2;
        courses.push(
            <mesh key={i} position={[0, i + 0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[side, 1, side]} />
                <meshStandardMaterial color={stone} roughness={0.96} flatShading />
            </mesh>
        );
    }
    return (
        <group>
            {courses}
            {/* Forgylt toppstein (pyramidion) når pyramiden er ferdig */}
            {done && (
                <mesh position={[0, TOTAL + 0.35, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                    <coneGeometry args={[0.7, 0.9, 4]} />
                    <meshStandardMaterial
                        color="#e8c46a"
                        emissive="#a9791f"
                        emissiveIntensity={0.45}
                        roughness={0.4}
                        metalness={0.5}
                    />
                </mesh>
            )}
        </group>
    );
}

// Den voksende sandrampen. Lener seg mot pyramidens framside og vokser i høyde
// med slideren. Modellert som en tiltet bjelke som dempes mykt mot målet.
function Ramp({ level, sand }: { level: number; sand: string }) {
    const ref = useRef<THREE.Group>(null);
    const beam = useRef<THREE.Mesh>(null);
    const shown = useRef(0);
    useFrame((_, dt) => {
        shown.current = damp(shown.current, level, dt, 4);
        const h = Math.max(0.0001, shown.current);
        const dz = FOOT_Z - FRONT_Z; // vannrett lengde
        const len = Math.hypot(dz, h);
        const angle = Math.atan2(h, dz);
        if (ref.current) {
            ref.current.position.set(0, h / 2, (FOOT_Z + FRONT_Z) / 2);
            ref.current.rotation.x = -angle;
            ref.current.visible = shown.current > 0.05;
        }
        if (beam.current) {
            beam.current.scale.z = len;
        }
    });
    return (
        <group ref={ref}>
            {/* Rampeflaten (sand). scale.z settes til lengden hver frame. */}
            <mesh ref={beam} castShadow receiveShadow>
                <boxGeometry args={[2.4, 0.4, 1]} />
                <meshStandardMaterial color={sand} roughness={1} flatShading />
            </mesh>
        </group>
    );
}

// Blokken som sklir opp rampen. Synlig kun mens den klatrer. Dempes fra
// rampefoten opp til framkanten av det neste laget.
function ClimbBlock({ phase }: { phase: 'idle' | 'climbing' }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        const climbing = phase === 'climbing';
        const ty = climbing ? 2.4 : 0.45;
        const tz = climbing ? FRONT_Z - 0.3 : FOOT_Z;
        ref.current.position.y = damp(ref.current.position.y, ty, dt, 3.2);
        ref.current.position.z = damp(ref.current.position.z, tz, dt, 3.2);
        ref.current.visible = climbing;
    });
    return (
        <group ref={ref} position={[0, 0.45, FOOT_Z]} visible={false}>
            <StoneSled />
        </group>
    );
}

// En steinblokk på en treslede.
function StoneSled() {
    return (
        <group>
            {/* sleden */}
            <mesh position={[0, 0.12, 0]} castShadow>
                <boxGeometry args={[1.5, 0.18, 1.9]} />
                <meshStandardMaterial color="#7a5630" roughness={0.95} flatShading />
            </mesh>
            {/* meier */}
            <mesh position={[-0.6, 0.05, 0]} castShadow>
                <boxGeometry args={[0.16, 0.16, 2.1]} />
                <meshStandardMaterial color="#5f421f" roughness={1} />
            </mesh>
            <mesh position={[0.6, 0.05, 0]} castShadow>
                <boxGeometry args={[0.16, 0.16, 2.1]} />
                <meshStandardMaterial color="#5f421f" roughness={1} />
            </mesh>
            {/* selve steinen */}
            <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.15, 0.85, 1.25]} />
                <meshStandardMaterial color="#cdb487" roughness={0.95} flatShading />
            </mesh>
        </group>
    );
}

// Faste plasser for arbeidere ved rampefoten.
const WORKER_SLOTS: [number, number][] = [
    [-1.0, 6.6],
    [1.0, 6.7],
    [-1.4, 7.4],
    [1.4, 7.4],
    [-0.2, 7.8],
];

// En arbeider som lener seg framover og drar, med en liten rytmisk vugging.
function Worker({ position, index }: { position: [number, number, number]; index: number }) {
    const ref = useRef<THREE.Group>(null);
    const skin = index % 3 === 0 ? '#d8a878' : index % 3 === 1 ? '#c79468' : '#e0b98c';
    const body = index % 2 === 0 ? '#b9985f' : '#a07d44';
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = clock.getElapsedTime() * 2 + index * 0.4;
        ref.current.rotation.x = -0.3 + Math.sin(t) * 0.08;
    });
    return (
        <group position={position} rotation={[0, Math.PI, 0]}>
            <group ref={ref}>
                <Figure body={body} skin={skin} />
            </group>
        </group>
    );
}

export default Pyramidebyggeren3D;
