import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Footprints, ArrowRight } from 'lucide-react';
import {
    MicroGameScaffold,
    Interactive,
    damp,
    Burst,
    SceneBanner,
    SceneBadge,
    DataReadout,
    SceneFact,
    WinScreen,
    StepTracker,
    SceneSlider,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Stålmonsteret bryter fronten — første verdenskrig.
//
// Lyspæren: maskingevær og piggtråd gjorde det umulig for infanteri å krysse
// ingenmannsland. Løsningen var en MASKIN: stridsvognen var pansret mot kuler,
// knuste piggtråden og krysset skyttergraven. Eleven prøver først å sende
// infanteriet (de blir meiet ned ved piggtråden), og kjører deretter
// stridsvognen fram med en spak og ser den bryte stillstanden.
//
// Mekanikken: ett knappetrykk (send infanteri) + en kontinuerlig spak som
// driver stridsvognen over ingenmannsland. Scenen leser bare `advance` (0-100)
// og `attempted`, og demper alt mykt mot mål utledet av dem.

// Banebredder langs Z: egen skyttergrav nær kamera (+Z), fiendens bak (-Z).
const TANK_START_Z = 7;
const TANK_END_Z = -9;
const WIRE_Z = 2.4;
const ENEMY_TRENCH_Z = -7;

// Stridsvognens Z ut fra spakverdien (0-100).
function tankZAt(advance: number) {
    return TANK_START_Z + (TANK_END_Z - TANK_START_Z) * (advance / 100);
}

const MUD = '#6b6053';
const STEEL = '#566054';

const Stalmonsteret3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [attempted, setAttempted] = useState(false);
    const [advance, setAdvance] = useState(0);
    const [won, setWon] = useState(false);
    const [banner, setBanner] = useState<string | null>(
        'Infanteriet skal krysse ingenmannsland til fiendens skyttergrav.'
    );
    const [fact, setFact] = useState<string | null>(null);
    const [burst, setBurst] = useState(0);

    const sendInfantry = () => {
        if (attempted) return;
        setAttempted(true);
        sounds.play('incorrect');
        setBanner('Angrep! Soldatene løper over det åpne feltet.');
        // La bølgen løpe fram før vi viser at den stoppes.
        setTimeout(() => {
            setBanner('Maskingeværet meier dem ned ved piggtråden. Fronten står stille.');
            setFact(
                'Ett maskingevær kunne skyte 400 til 600 skudd i minuttet. Sammen med piggtråden gjorde det selvmord av å løpe over ingenmannsland. Slik stivnet hele Vestfronten.'
            );
        }, 2600);
    };

    const drive = (v: number) => {
        if (won) return;
        setAdvance(v);
        // Bytt banner ved viktige terskler — kun når den faktisk endrer seg.
        let next = banner;
        if (v >= 88) next = 'Stålmonsteret ruller over skyttergraven. Fronten er brutt!';
        else if (v >= 30) next = 'Stridsvognen knuser piggtråden og tar imot kulene med panseret.';
        else if (v > 0) next = 'Stridsvognen ruller ut i ingenmannsland.';
        if (next !== banner) setBanner(next);
        if (v >= 100 && !won) {
            setWon(true);
            setBurst((b) => b + 1);
            sounds.play('complete');
            setFact(
                'Stridsvognen ble bygd for å gjøre nettopp dette: den var pansret mot kuler, kunne kjøre over piggtråd og krysse skyttergraver. Slik brøt den stillstanden som maskingeværet hadde skapt.'
            );
            onComplete({ score: 1, completed: true, artifact: { advance: 100 } });
        }
    };

    const inspectMg = () => {
        sounds.play('select');
        setFact(
            'Maskingeværet var tungt og vannavkjølt, og krevde flere mann. Men plassert i en god stilling kunne to-tre slike stoppe tusenvis av angripere.'
        );
    };

    const reset = () => {
        setAttempted(false);
        setAdvance(0);
        setWon(false);
        setBanner('Infanteriet skal krysse ingenmannsland til fiendens skyttergrav.');
        setFact(null);
    };

    const eraLabel = won
        ? 'Fronten er brutt'
        : advance > 0
          ? 'Stridsvognen ruller'
          : attempted
            ? 'Stillstand'
            : '1916 · Vestfronten';

    return (
        <MicroGameScaffold
            title="Stålmonsteret bryter fronten"
            subtitle="Send infanteriet, og kjør så stridsvognen over ingenmannsland"
            estimatedSeconds={150}
            onRetry={attempted || advance > 0 ? reset : undefined}
            canvas={{
                idle: !attempted && advance === 0,
                camera: { position: [9, 8, 15], fov: 42 },
                background: '#c4c8cc',
                fog: { color: '#bcc0c4', near: 28, far: 56 },
                target: [0, 0.4, -1],
                light: 'overcast',
            }}
            containerClassName="bg-gradient-to-b from-[#c4c8cc] via-[#c9cabf] to-[#9a8f78]"
            scene={
                <Battlefield
                    attempted={attempted}
                    advance={advance}
                    won={won}
                    burst={burst}
                    onInspectMg={inspectMg}
                />
            }
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <DataReadout
                        corner="bl"
                        items={[
                            { label: 'Stridsvogn', value: Math.round(advance), unit: '%' },
                            { label: 'Infanteri', value: attempted ? 'tapt' : '–' },
                        ]}
                    />
                    <SceneBadge corner="br">{eraLabel}</SceneBadge>
                </>
            }
        >
            <div className="mb-2.5 flex items-center justify-between">
                <StepTracker current={won ? 2 : attempted ? 2 : 1} total={2} />
                <span className="text-[11px] font-semibold text-slate-500">
                    Klikk maskingeværet for å lese om det
                </span>
            </div>

            {!attempted ? (
                <button
                    onClick={sendInfantry}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl border-2 border-amber-400 bg-amber-100 px-4 py-3 text-sm font-bold text-amber-900 shadow-sm transition hover:bg-amber-200 hover:border-amber-500"
                >
                    <Footprints className="h-5 w-5" />
                    Send infanteriet over ingenmannsland
                    <ArrowRight className="h-4 w-4 animate-pulse" />
                </button>
            ) : !won ? (
                <SceneSlider
                    label="Kjør stridsvognen fram"
                    min={0}
                    max={100}
                    step={1}
                    value={advance}
                    onChange={drive}
                    valueLabel={(v) => `${Math.round(v)} %`}
                />
            ) : null}

            {won ? (
                <div className="mt-3">
                    <WinScreen title="Stillstanden er brutt." onReplay={reset}>
                        Maskingeværet stoppet menneskene. Men en maskine som tålte kulene, knuste
                        piggtråden og krysset skyttergraven, kunne gjøre det de ikke klarte. Derfor
                        ble stridsvognen oppfunnet.
                    </WinScreen>
                </div>
            ) : fact ? (
                <div className="mt-3">
                    <SceneFact>{fact}</SceneFact>
                </div>
            ) : (
                <p className="mt-3 px-2 text-center text-xs italic text-slate-500">
                    Prøv først infanteriet. Se hva som stopper det, og finn så løsningen.
                </p>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN — alt utledes av `attempted` og `advance`.
// ============================================================

function Battlefield({
    attempted,
    advance,
    won,
    burst,
    onInspectMg,
}: {
    attempted: boolean;
    advance: number;
    won: boolean;
    burst: number;
    onInspectMg: () => void;
}) {
    // Maskingeværet fyrer når infanteriet løper, og når vognen tar imot kuler.
    const firing = (attempted && advance < 1) || (advance >= 30 && advance < 90 && !won);
    return (
        <group>
            <Ground />
            <Craters />
            <Trench position={[0, 0, 7]} color="#4f4639" />
            <Trench position={[0, 0, ENEMY_TRENCH_Z]} color="#463d31" />
            <BarbedWire advance={advance} />
            <Infantry attempted={attempted} />
            <Tank advance={advance} />
            <MgNest firing={firing} onInspect={onInspectMg} />
            <Burst position={[0, 1.4, ENEMY_TRENCH_Z]} trigger={burst} color="#e3b23c" count={30} spread={3.6} />
        </group>
    );
}

// --- Gjørmete bakke ---
function Ground() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[46, 40]} />
            <meshStandardMaterial color={MUD} roughness={1} />
        </mesh>
    );
}

// --- Granatkratere som strør ingenmannsland ---
function Craters() {
    const spots = useMemo(() => {
        const out: { pos: [number, number, number]; r: number }[] = [];
        const seeds = [
            [-5, 4, 0.9], [4, 1, 1.1], [-2, -2, 0.8], [6, -3, 1.0], [-7, -1, 0.7],
            [2, 5, 0.85], [-4, -5, 1.0], [7, 3, 0.75], [0, -4, 0.95], [-8, 5, 0.8],
        ];
        for (const s of seeds) out.push({ pos: [s[0], 0.01, s[1]], r: s[2] });
        return out;
    }, []);
    return (
        <group>
            {spots.map((c, i) => (
                <mesh key={i} position={c.pos} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <circleGeometry args={[c.r, 14]} />
                    <meshStandardMaterial color="#4d4438" roughness={1} />
                </mesh>
            ))}
        </group>
    );
}

// --- En skyttergrav: nedsenket renne med sandsekk-rad foran ---
function Trench({
    position,
    color,
}: {
    position: [number, number, number];
    color: string;
}) {
    return (
        <group position={position}>
            {/* selve renna (mørk, nedsenket) */}
            <mesh position={[0, -0.25, 0]} receiveShadow>
                <boxGeometry args={[24, 0.5, 1.6]} />
                <meshStandardMaterial color={color} roughness={1} />
            </mesh>
            {/* sandsekker langs kanten */}
            {Array.from({ length: 13 }).map((_, i) => (
                <mesh key={i} position={[i * 1.9 - 11.4, 0.18, 0.85]} castShadow>
                    <boxGeometry args={[1.7, 0.36, 0.5]} />
                    <meshStandardMaterial color="#8a7d5e" roughness={1} />
                </mesh>
            ))}
        </group>
    );
}

// --- Piggtråd: en rad spiraler som flattes når stridsvognen ruller over ---
function BarbedWire({ advance }: { advance: number }) {
    const xs = useMemo(() => [-8, -6, -4, -2, 0, 2, 4, 6, 8], []);
    return (
        <group position={[0, 0, WIRE_Z]}>
            {xs.map((x, i) => (
                <WireCoil key={i} x={x} advance={advance} />
            ))}
        </group>
    );
}

function WireCoil({ x, advance }: { x: number; advance: number }) {
    const group = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!group.current) return;
        // Stridsvognen passerer piggtråden rundt advance 30 — da flattes den.
        const crushed = advance >= 30;
        const target = crushed ? 0.12 : 1;
        group.current.scale.y = damp(group.current.scale.y, target, dt, 4);
    });
    return (
        <group ref={group} position={[x, 0, 0]}>
            {/* stolpe */}
            <mesh position={[0, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.7, 5]} />
                <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
            </mesh>
            {/* tråd-spiral som tre skrå ringer */}
            {[0.25, 0.45, 0.62].map((y, j) => (
                <mesh key={j} position={[0, y, 0]} rotation={[Math.PI / 2, 0, j * 0.6]}>
                    <torusGeometry args={[0.34, 0.025, 5, 12]} />
                    <meshStandardMaterial color="#6e6a60" metalness={0.4} roughness={0.6} />
                </mesh>
            ))}
        </group>
    );
}

// --- Infanteribølgen: figurer som løper fram og faller ved piggtråden ---
const SOLDIERS: { x: number; phase: number }[] = [
    { x: -5, phase: 0.0 },
    { x: -3, phase: 0.5 },
    { x: -1, phase: 0.2 },
    { x: 1, phase: 0.7 },
    { x: 3, phase: 0.35 },
    { x: 5, phase: 0.9 },
];

function Infantry({ attempted }: { attempted: boolean }) {
    return (
        <group>
            {SOLDIERS.map((s, i) => (
                <Soldier key={i} x={s.x} phase={s.phase} attempted={attempted} />
            ))}
        </group>
    );
}

function Soldier({ x, phase, attempted }: { x: number; phase: number; attempted: boolean }) {
    const group = useRef<THREE.Group>(null);
    const t = useRef(0); // 0 = i grava, 1 = falt
    const START_Z = 6;
    const FALL_Z = WIRE_Z + 0.6;
    useFrame((clock, dt) => {
        if (!group.current) return;
        // Spol tilbake helt når angrepet nullstilles.
        const goal = attempted ? 1 : 0;
        t.current = damp(t.current, goal, dt, attempted ? 0.45 : 6);
        const p = t.current;
        // Løp fram til ~0.6, deretter "fall" mens de blir liggende.
        const runP = Math.min(p / 0.6, 1);
        const z = START_Z + (FALL_Z - START_Z) * runP;
        group.current.position.set(x, 0, z);
        const fallen = p > 0.62;
        const fall = Math.min(Math.max((p - 0.62) / 0.3, 0), 1);
        group.current.rotation.x = fall * -1.45;
        group.current.position.y = fall * 0.18;
        // gå-vugging mens de løper
        const moving = attempted && runP < 0.99 && !fallen;
        const time = clock.clock.elapsedTime;
        group.current.position.y += moving ? Math.abs(Math.sin(time * 9 + phase * 6)) * 0.1 : 0;
        group.current.visible = attempted || p > 0.02;
    });
    return (
        <group ref={group} position={[x, 0, START_Z]} visible={false}>
            {/* kropp */}
            <mesh position={[0, 0.34, 0]} castShadow>
                <cylinderGeometry args={[0.12, 0.16, 0.5, 7]} />
                <meshStandardMaterial color="#5a6147" roughness={0.9} />
            </mesh>
            {/* hode + hjelm */}
            <mesh position={[0, 0.66, 0]} castShadow>
                <sphereGeometry args={[0.12, 10, 10]} />
                <meshStandardMaterial color="#d8b48c" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.71, 0]} castShadow>
                <sphereGeometry args={[0.15, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#4a5040" roughness={0.8} />
            </mesh>
            {/* gevær */}
            <mesh position={[0.16, 0.42, 0.18]} rotation={[Math.PI / 2.6, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.6, 5]} />
                <meshStandardMaterial color="#3a2a1c" roughness={0.8} />
            </mesh>
        </group>
    );
}

// --- Stridsvognen (rhomboide Mark-typen): kjører fram via advance ---
function Tank({ advance }: { advance: number }) {
    const group = useRef<THREE.Group>(null);
    const trackL = useRef<THREE.Mesh>(null);
    const trackR = useRef<THREE.Mesh>(null);
    const z = useRef(TANK_START_Z);
    useFrame((_, dt) => {
        if (!group.current) return;
        const target = tankZAt(advance);
        const prev = z.current;
        z.current = damp(z.current, target, dt, 3);
        group.current.position.z = z.current;
        // Vipp nesa når den krysser fiendens skyttergrav (rundt advance 88).
        let pitch = 0;
        let lift = 0;
        if (advance >= 80) {
            const cp = Math.min(Math.max((advance - 80) / 16, 0), 1);
            pitch = Math.sin(cp * Math.PI) * -0.22;
            lift = -Math.sin(cp * Math.PI) * 0.18;
        }
        group.current.rotation.x = damp(group.current.rotation.x, pitch, dt, 4);
        group.current.position.y = damp(group.current.position.y, lift, dt, 4);
        // beltehjul ruller når vognen faktisk beveger seg
        const moving = Math.abs(z.current - prev) > 0.001;
        if (moving) {
            const spin = dt * 7;
            if (trackL.current) trackL.current.rotation.x += spin;
            if (trackR.current) trackR.current.rotation.x += spin;
        }
    });
    return (
        <group ref={group} position={[0, 0, TANK_START_Z]}>
            {/* skrog */}
            <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.5, 0.9, 2.8]} />
                <meshStandardMaterial color={STEEL} roughness={0.6} metalness={0.3} />
            </mesh>
            {/* skrå frontplate — klatrer over kanten */}
            <mesh position={[0, 0.45, -1.5]} rotation={[0.7, 0, 0]} castShadow>
                <boxGeometry args={[1.5, 0.9, 0.5]} />
                <meshStandardMaterial color={STEEL} roughness={0.6} metalness={0.3} />
            </mesh>
            {/* den karakteristiske rhomboide beltrammen på hver side */}
            {[-0.9, 0.9].map((sx, i) => (
                <group key={i} position={[sx, 0.55, 0]}>
                    <mesh castShadow>
                        <boxGeometry args={[0.34, 1.3, 3.4]} />
                        <meshStandardMaterial color="#3c423a" roughness={0.8} />
                    </mesh>
                </group>
            ))}
            {/* roterende beltevisere (markerer bevegelse) */}
            <mesh ref={trackL} position={[-0.9, 0.55, 1.0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 0.36, 8]} />
                <meshStandardMaterial color="#23271f" roughness={0.9} />
            </mesh>
            <mesh ref={trackR} position={[0.9, 0.55, 1.0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 0.36, 8]} />
                <meshStandardMaterial color="#23271f" roughness={0.9} />
            </mesh>
            {/* sponson med kanon på siden */}
            <mesh position={[0.85, 0.8, 0.2]} castShadow>
                <boxGeometry args={[0.5, 0.5, 0.8]} />
                <meshStandardMaterial color="#4a5247" roughness={0.7} metalness={0.2} />
            </mesh>
            <mesh position={[1.3, 0.8, 0.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.07, 0.07, 0.6, 8]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
            </mesh>
            {/* liten kommandørkuppel */}
            <mesh position={[0, 1.25, 0.3]} castShadow>
                <boxGeometry args={[0.7, 0.3, 0.7]} />
                <meshStandardMaterial color="#4a5247" roughness={0.7} />
            </mesh>
        </group>
    );
}

// --- Maskingevær-rede i fiendens grav: klikkbart, og fyrer ved angrep ---
function MgNest({ firing, onInspect }: { firing: boolean; onInspect: () => void }) {
    const flash = useRef<THREE.Mesh>(null);
    useFrame((clock) => {
        if (!flash.current) return;
        const time = clock.clock.elapsedTime;
        // Rask flimring av munningsblink mens det fyrer.
        const on = firing && Math.sin(time * 40) > 0;
        const mat = flash.current.material as THREE.MeshStandardMaterial;
        mat.opacity = on ? 0.95 : 0;
        flash.current.visible = on;
        flash.current.scale.setScalar(on ? 0.9 + Math.sin(time * 60) * 0.2 : 0.2);
    });
    return (
        <group position={[3.2, 0.1, ENEMY_TRENCH_Z - 0.2]}>
            <Interactive onSelect={onInspect} hitArea={[1.6, 1.6, 1.6]}>
                {(s) => (
                    <group>
                        {/* lavt skjold av sandsekker */}
                        <mesh position={[0, 0.2, 0.3]} castShadow>
                            <boxGeometry args={[1.0, 0.4, 0.4]} />
                            <meshStandardMaterial
                                color={s === 'hover' ? '#a7986f' : '#8a7d5e'}
                                roughness={1}
                            />
                        </mesh>
                        {/* trebein */}
                        <mesh position={[0, 0.32, 0]} castShadow>
                            <boxGeometry args={[0.16, 0.16, 0.5]} />
                            <meshStandardMaterial color="#3a3a36" roughness={0.7} />
                        </mesh>
                        {/* løp som peker mot angriperne (+Z) */}
                        <mesh position={[0, 0.45, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
                            <meshStandardMaterial color="#23241f" roughness={0.6} metalness={0.3} />
                        </mesh>
                    </group>
                )}
            </Interactive>
            {/* munningsblink */}
            <mesh ref={flash} position={[0, 0.45, 1.05]} visible={false}>
                <sphereGeometry args={[0.18, 8, 8]} />
                <meshStandardMaterial
                    color="#ffd27a"
                    emissive="#ffb000"
                    emissiveIntensity={2}
                    transparent
                    opacity={0}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}

export default Stalmonsteret3D;
