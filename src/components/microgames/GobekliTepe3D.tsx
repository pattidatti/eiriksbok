import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    GroundPlane,
    Figure,
    Rock,
    Fire,
    SceneBanner,
    SceneBadge,
    DragHint,
    SceneFact,
    WinScreen,
    SceneSlider,
    StepTracker,
    DataReadout,
    damp,
    Burst,
    useAmbience,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til Göbekli Tepe. Eleven REISER de tunge T-pilarene i tempelringen
// og kjenner kjernen i artikkelen på kroppen: jegerne hadde verken metall, hjul
// eller pakkdyr. Det eneste som kunne reise en seksten tonn tung stein var
// hundrevis av mennesker som dro i tau sammen. For hver tyngre pilar må eleven
// kalle på ENDA flere hender. Lyspæra: en så stor flokk måtte mettes igjen og
// igjen, og det behovet kan ha drevet menneskene til å begynne med jordbruk.
//
// Mekanikk (kombinerer slider + direkte 3D-klikk):
//   - SceneSlider "Kall på flokken" styrer hvor mange som står på tauet.
//   - Hotspot "HAL!" i scenen drar steinen oppover for hvert klikk.
//   - Steinen reiser seg bare hvis flokken er stor nok. For få hender, og
//     steinen blir hengende på skrå uansett hvor mange ganger du haler.

interface PillarSpec {
    tonn: number; // vekt - vises i avlesningen
    need: number; // hvor stor andel av flokken som trengs (0-1)
    tall: boolean; // den store, frittstående midtpilaren
    label: string;
}

// Tre pilarer med stigende vekt. Poenget: tyngre stein krever flere hender.
const PILLARS: PillarSpec[] = [
    { tonn: 5, need: 0.4, tall: false, label: 'Prøvesteinen' },
    { tonn: 10, need: 0.62, tall: false, label: 'Ringpilaren' },
    { tonn: 16, need: 0.9, tall: true, label: 'Midtpilaren' },
];
const TOTAL = PILLARS.length;
const HAUL_STEP = 0.25; // hvor mye ett tak løfter (begrenset av flokkstørrelsen)

// Korte fakta som dukker opp når hver pilar står - for en 14-åring.
const FACTS = [
    'Den første pilaren står! Selv en lett stein på fem tonn krever en hel flokk som drar i takt. Jegerne hadde verken hjul eller pakkdyr - bare reip og mange hender.',
    'Ti tonn er reist. For hver tyngre stein må enda flere møtes på høyden. Og alle de munnene må mettes mens de bygger.',
];

// Faste plasser for flokken langs tauet (foran ringen). Render de N første.
const CROWD_SLOTS: [number, number][] = [
    [-1.4, 5.0],
    [0.0, 5.1],
    [1.4, 5.0],
    [-2.0, 5.9],
    [-0.7, 6.0],
    [0.7, 6.0],
    [2.0, 5.9],
    [-1.4, 6.8],
    [0.0, 6.9],
    [1.4, 6.8],
    [-2.4, 7.6],
    [-0.8, 7.7],
    [0.8, 7.7],
    [2.4, 7.6],
];
const MAX_CROWD = CROWD_SLOTS.length;

// Hvor de ferdig reiste pilarene plasseres i ringen (bak den aktive).
const RAISED_SLOTS: [number, number][] = [
    [-2.3, -1.4],
    [2.3, -1.4],
    [0, -0.2], // midtpilaren
];
const HINGE: [number, number, number] = [0, 0, 2.4]; // foten til den aktive steinen

const GobekliTepe3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const ambience = useAmbience('crowd');
    const [stage, setStage] = useState(0); // hvor mange pilarer som står
    const [crew, setCrew] = useState(0); // 0-1, andel av flokken på tauet
    const [hauls, setHauls] = useState(0); // antall tak på denne pilaren
    const [banner, setBanner] = useState<string | null>(
        'Dra spaken og kall flokken til tauet. Klikk så HAL for å reise steinen.'
    );
    const [fact, setFact] = useState<string | null>(null);
    const [burst, setBurst] = useState(0);

    const done = stage >= TOTAL;
    const spec = PILLARS[Math.min(stage, TOTAL - 1)];
    const effective = Math.min(hauls * HAUL_STEP, crew); // hvor høyt den faktisk kan komme
    const tiltRatio = done ? 1 : Math.min(effective / spec.need, 1); // 0 = flat, 1 = reist
    const people = Math.round(crew * 300);

    const reset = () => {
        setStage(0);
        setCrew(0);
        setHauls(0);
        setBanner('Dra spaken og kall flokken til tauet. Klikk så HAL for å reise steinen.');
        setFact(null);
    };

    const raisePillar = () => {
        const next = stage + 1;
        setBurst((b) => b + 1);
        sounds.play(next >= TOTAL ? 'complete' : 'advance');
        setStage(next);
        setCrew(0);
        setHauls(0);
        if (next >= TOTAL) {
            setFact(null);
            setBanner(null);
            setTimeout(() => onComplete({ score: 1, completed: true }), 250);
        } else {
            setFact(FACTS[stage]);
            setBanner('Steinen står! Neste pilar er tyngre - du må kalle på enda flere hender.');
        }
    };

    // Steinen reiser seg når flokken er stor nok OG du har halt minst ett tak.
    // Sjekkes som effekt så både slider og HAL-klikk kan utløse seieren.
    useEffect(() => {
        if (done) return;
        if (hauls > 0 && effective >= spec.need - 0.001) {
            raisePillar();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [crew, hauls, stage]);

    const haul = () => {
        if (done) return;
        if (crew <= 0.03) {
            setBanner('Ingen står på tauet. Dra spaken og kall på flokken først.');
            sounds.play('incorrect');
            return;
        }
        const newHauls = hauls + 1;
        const newEff = Math.min(newHauls * HAUL_STEP, crew);
        setHauls(newHauls);
        if (newEff >= spec.need - 0.001) {
            return; // effekten over reiser pilaren
        }
        if (newEff <= effective + 0.001) {
            // Taket ga ikke mer - flokken er for liten til denne vekten.
            sounds.play('incorrect');
            setBanner(
                `For få hender til ${spec.tonn} tonn. Steinen vil ikke høyere - kall på flere!`
            );
        } else {
            sounds.play('correct');
            setBanner(null);
        }
    };

    const onCrew = (v: number) => {
        setCrew(v);
        if (v > 0.03) ambience.start();
    };

    const idle = stage === 0 && hauls === 0 && crew <= 0.03;

    return (
        <MicroGameScaffold
            title="Reis tempelet på Magehøyden"
            subtitle="Kall flokken til tauet og hal de tunge T-pilarene opp - ingen kan reise dem alene"
            estimatedSeconds={150}
            onRetry={stage > 0 || hauls > 0 || crew > 0.03 ? reset : undefined}
            canvas={{
                idle,
                camera: { position: [0, 6.2, 11.5], fov: 42 },
                background: '#f0dcae',
                fog: { near: 20, far: 48 },
                target: [0, 1, -0.2],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {done ? 'Tempelringen står' : 'Göbekli Tepe - 9500 fvt'}
                    </SceneBadge>
                    {!done && (
                        <DataReadout
                            corner="bl"
                            items={[
                                { label: 'Hender på tauet', value: people },
                                { label: 'Steinen veier', value: spec.tonn, unit: 't' },
                                { label: 'Reist', value: Math.round(tiltRatio * 100), unit: '%' },
                            ]}
                        />
                    )}
                    <DragHint show={idle} corner="bc">
                        Dra spaken under vinduet
                    </DragHint>
                </>
            }
            scene={
                <TempleHill
                    stage={stage}
                    crew={crew}
                    tiltRatio={tiltRatio}
                    spec={spec}
                    burst={burst}
                    onHaul={haul}
                    done={done}
                />
            }
        >
            <div className="flex flex-col gap-3">
                {!done && <StepTracker current={stage} total={TOTAL} />}

                {!done ? (
                    <>
                        <SceneSlider
                            label="Kall på flokken (hender på tauet)"
                            min={0}
                            max={1}
                            step={0.01}
                            value={crew}
                            onChange={onCrew}
                            valueLabel={() => `${people} mennesker`}
                        />
                        <p className="text-sm text-slate-600 leading-snug">
                            Dra spaken for å samle flokken, og klikk den pulserende{' '}
                            <span className="font-bold text-amber-700">HAL!</span>-ringen ved tauet
                            for å reise {spec.label.toLowerCase()} ({spec.tonn} tonn). Jo tyngre
                            steinen er, desto flere hender trengs.
                        </p>
                        {fact && <SceneFact>{fact}</SceneFact>}
                    </>
                ) : (
                    <WinScreen title="Tempelringen står ferdig!" onReplay={reset}>
                        Du reiste de tunge T-pilarene uten hjul, metall eller pakkdyr - bare med en
                        stor flokk som dro i takt. Men en så stor flokk måtte ha mat, gang på gang.
                        Klaus Schmidt mente at nettopp dette behovet kan ha tvunget jegerne til å
                        dyrke korn nær møtestedet. Da kan tempelet ha kommet først, og jordbruket
                        etterpå - stikk motsatt av hva skolebøkene lenge fortalte.
                    </WinScreen>
                )}
            </div>
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function TempleHill({
    stage,
    crew,
    tiltRatio,
    spec,
    burst,
    onHaul,
    done,
}: {
    stage: number;
    crew: number;
    tiltRatio: number;
    spec: PillarSpec;
    burst: number;
    onHaul: () => void;
    done: boolean;
}) {
    const crowdCount = Math.round(crew * MAX_CROWD);

    return (
        <group>
            {/* Tørr høyde over slettelandet */}
            <GroundPlane size={48} depth={44} color="#cdb785" />
            {/* Fundamentringen (lav steinmur rundt pilarene) */}
            <FoundationRing />

            {/* Spredte steiner og et festbål - jegerne åt sammen mens de bygde */}
            <Rock position={[-4.2, 0, 1.2]} color="#b7ad97" scale={1.1} />
            <Rock position={[4.4, 0, 0.4]} color="#b0a690" scale={1.3} />
            <Rock position={[-3.6, 0, -2.6]} color="#bcb29c" scale={0.9} />
            <Fire position={[3.4, 0, 3.0]} scale={0.8} lit />

            {/* Allerede reiste pilarer i ringen */}
            {RAISED_SLOTS.slice(0, stage).map((p, i) => (
                <group key={i} position={[p[0], 0, p[1]]} rotation={[0, (i - 1) * 0.4, 0]}>
                    <TPillar tall={PILLARS[i].tall} />
                </group>
            ))}

            {/* Den aktive pilaren som eleven reiser */}
            {!done && (
                <group position={HINGE}>
                    <RaisingPillar tiltRatio={tiltRatio} tall={spec.tall} />
                    <Burst
                        position={[0, 2.6, 0]}
                        trigger={burst}
                        color="#e6d3a0"
                        count={26}
                        spread={2.6}
                    />
                </group>
            )}

            {/* Tauet på bakken fra steinen ut til flokken */}
            {!done && <Rope />}

            {/* Flokken som drar i tauet - vokser med slideren */}
            {CROWD_SLOTS.slice(0, crowdCount).map((p, i) => (
                <Hauler key={i} position={[p[0], 0, p[1]]} index={i} />
            ))}

            {/* HAL-knappen i scenen (over tauet) */}
            {!done && (
                <Hotspot
                    position={[0, 1.25, 4.7]}
                    onSelect={onHaul}
                    label="Hal i tauet"
                    radius={0.6}
                    color="#b45309"
                />
            )}
        </group>
    );
}

// Lav steinring som markerer tempelrommet.
function FoundationRing() {
    return (
        <mesh position={[0, 0.12, -0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <ringGeometry args={[2.9, 3.5, 40]} />
            <meshStandardMaterial color="#b8ac90" roughness={1} side={THREE.DoubleSide} />
        </mesh>
    );
}

// En stående T-pilar (stamme + tverrstein på toppen) med svake dyremotiver.
function TPillar({ tall = false }: { tall?: boolean }) {
    const h = tall ? 4.0 : 2.8;
    const w = tall ? 0.7 : 0.55;
    return (
        <group>
            {/* stamme */}
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, h, w * 0.55]} />
                <meshStandardMaterial color="#cabd9d" roughness={0.95} flatShading />
            </mesh>
            {/* T-hode */}
            <mesh position={[0, h - 0.18, 0]} castShadow>
                <boxGeometry args={[w * 1.7, 0.42, w * 0.6]} />
                <meshStandardMaterial color="#bfb191" roughness={0.95} flatShading />
            </mesh>
            {/* utskårne dyremotiver (rev/slange) - bare antydet med mørke relieffer */}
            <mesh position={[0, h * 0.55, w * 0.3]}>
                <boxGeometry args={[w * 0.42, 0.5, 0.03]} />
                <meshStandardMaterial color="#9c8d6c" roughness={1} />
            </mesh>
            <mesh position={[0, h * 0.32, w * 0.3]}>
                <boxGeometry args={[w * 0.55, 0.12, 0.03]} />
                <meshStandardMaterial color="#9c8d6c" roughness={1} />
            </mesh>
        </group>
    );
}

// Den aktive pilaren: hengslet i foten, svinger fra liggende til stående.
function RaisingPillar({ tiltRatio, tall }: { tiltRatio: number; tall: boolean }) {
    const hinge = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!hinge.current) return;
        // tiltRatio 0 = flat (peker mot flokken, +Z), 1 = loddrett.
        const target = -(1 - tiltRatio) * (Math.PI / 2);
        hinge.current.rotation.x = damp(hinge.current.rotation.x, target, dt, 5);
    });
    return (
        <group ref={hinge}>
            {/* Pilaren bygges stående og vippes ned av hengselet over. */}
            <TPillar tall={tall} />
        </group>
    );
}

// Tauet som ligger fra steinen ut til flokken.
function Rope() {
    return (
        <mesh position={[0, 0.06, 5.0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 5.6, 6]} />
            <meshStandardMaterial color="#7a5a32" roughness={1} />
        </mesh>
    );
}

// En jeger som drar i tauet - lener seg bakover med en liten vugging.
function Hauler({ position, index }: { position: [number, number, number]; index: number }) {
    const ref = useRef<THREE.Group>(null);
    const skin = index % 3 === 0 ? '#d8a878' : index % 3 === 1 ? '#c79468' : '#e0b98c';
    const body = index % 2 === 0 ? '#6b5436' : '#7a3f2c';
    useFrame(({ clock }) => {
        if (!ref.current) return;
        // alle drar i takt - en felles rytme i ryggene
        const t = clock.getElapsedTime() * 2 + index * 0.3;
        ref.current.rotation.x = -0.28 + Math.sin(t) * 0.08;
    });
    return (
        <group position={position} rotation={[0, Math.PI, 0]}>
            <group ref={ref}>
                <Figure body={body} skin={skin} />
            </group>
        </group>
    );
}

export default GobekliTepe3D;
