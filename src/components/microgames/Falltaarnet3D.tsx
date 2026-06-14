import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ArrowDown, ArrowUp } from 'lucide-react';
import {
    MicroGameScaffold,
    Draggable,
    GroundPlane,
    Tree,
    SceneBanner,
    SceneBadge,
    DragHint,
    SceneFact,
    WinScreen,
    CompareToggle,
    DataReadout,
    Burst,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til Galileo-artikkelen. Eleven bærer en tung jernkule og en lett
// trekule opp i toppen av det skjeve tårnet i Pisa, velger en "verden", og
// slipper dem:
//   - I Aristoteles' verden faller den tunge raskest (slik alle trodde i 2000 år).
//   - I virkeligheten lander de helt likt - akkurat som Galileo MÅLTE.
// Lyspæren: tunge og lette ting faller like fort, og Galileos store grep var å
// sjekke selv i stedet for å tro på autoriteten. Modell-sammenlikning (morf-og-se).

type World = 'a' | 'b'; // a = Aristoteles trodde, b = virkeligheten

// Verdens-koordinater (tårnet leter mot +x, så toppen henger ut over basen).
const TOP_Y = 7;
const SLOT_IRON: [number, number, number] = [1.7, TOP_Y, -0.55];
const SLOT_WOOD: [number, number, number] = [1.7, TOP_Y, 0.55];
const PAD_IRON: [number, number, number] = [1.7, 0, -0.55];
const PAD_WOOD: [number, number, number] = [1.7, 0, 0.55];
const START_IRON: [number, number, number] = [3.9, 0, -1.7];
const START_WOOD: [number, number, number] = [3.9, 0, 1.7];
const R_IRON = 0.4;
const R_WOOD = 0.32;

// Falltider (sekunder) per kule og verden. I virkeligheten er de like.
const FALL: Record<World, { iron: number; wood: number }> = {
    a: { iron: 0.8, wood: 1.8 },
    b: { iron: 1.3, wood: 1.3 },
};

const Falltaarnet3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [ironUp, setIronUp] = useState(false);
    const [woodUp, setWoodUp] = useState(false);
    const [world, setWorld] = useState<World>('a');
    const [dropKey, setDropKey] = useState(0);
    const [dropped, setDropped] = useState(false);
    const [seen, setSeen] = useState<{ a: boolean; b: boolean }>({ a: false, b: false });
    const [banner, setBanner] = useState<string | null>(
        'Dra begge kulene bort til foten av tårnet, så heises de opp.'
    );
    const [result, setResult] = useState<string | null>(null);
    const [burst, setBurst] = useState(0);
    const [won, setWon] = useState(false);

    const bothUp = ironUp && woodUp;

    const reset = () => {
        setIronUp(false);
        setWoodUp(false);
        setWorld('a');
        setDropped(false);
        setSeen({ a: false, b: false });
        setBanner('Dra begge kulene bort til foten av tårnet, så heises de opp.');
        setResult(null);
        setWon(false);
    };

    const loadIron = () => {
        if (ironUp) return;
        setIronUp(true);
        sounds.play('drop');
        setBanner(
            woodUp
                ? 'Begge kulene er oppe. Velg en verden og slipp dem.'
                : 'Jernkula er heist opp. Bær trekula opp også.'
        );
    };
    const loadWood = () => {
        if (woodUp) return;
        setWoodUp(true);
        sounds.play('drop');
        setBanner(
            ironUp
                ? 'Begge kulene er oppe. Velg en verden og slipp dem.'
                : 'Trekula er heist opp. Bær jernkula opp også.'
        );
    };

    const drop = () => {
        if (!bothUp || dropped) return;
        setDropped(true);
        setDropKey((k) => k + 1);
        sounds.play('sceneChange');
        setBanner(null);
    };

    const onLanded = (w: World) => {
        if (w === 'b') {
            setBurst((b) => b + 1);
            sounds.play('correct');
            setResult(
                'Galileo målte: de lander helt likt! Vekten betyr ingenting for hvor fort noe faller.'
            );
        } else {
            sounds.play('advance');
            setResult(
                'Slik trodde Aristoteles: den tunge først. Men har han egentlig sjekket? Test virkeligheten.'
            );
        }
        setSeen((s) => {
            const next = { ...s, [w]: true };
            if (next.a && next.b && !won) {
                setWon(true);
                sounds.play('complete');
                setTimeout(() => onComplete({ score: 1, completed: true }), 400);
            }
            return next;
        });
    };

    const lift = () => {
        setDropped(false);
        setResult(null);
        setBanner('Velg en verden og slipp kulene igjen.');
    };

    const fall = FALL[world];
    const worldLabel = world === 'a' ? 'Aristoteles trodde' : 'Galileo målte';

    return (
        <MicroGameScaffold
            title="Falltårnet i Pisa"
            subtitle="Slipp en tung og en lett kule fra toppen, og sjekk hvem som lander først"
            estimatedSeconds={140}
            onRetry={ironUp || woodUp ? reset : undefined}
            canvas={{
                idle: !ironUp && !woodUp,
                camera: { position: [7.5, 5, 9], fov: 42 },
                background: '#ecdcb4',
                fog: { near: 30, far: 60 },
                light: 'golden',
                target: [0.6, 3.4, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {bothUp ? worldLabel : 'Tårnet i Pisa'}
                    </SceneBadge>
                    {dropped && (
                        <DataReadout
                            corner="bl"
                            items={[
                                { label: 'Jernkule', value: fall.iron.toFixed(1), unit: 's' },
                                { label: 'Trekule', value: fall.wood.toFixed(1), unit: 's' },
                            ]}
                        />
                    )}
                    <DragHint show={!bothUp} corner="bc">
                        Dra kulene til foten av tårnet
                    </DragHint>
                </>
            }
            scene={
                <TowerScene
                    ironUp={ironUp}
                    woodUp={woodUp}
                    dropped={dropped}
                    dropKey={dropKey}
                    world={world}
                    burst={burst}
                    onLoadIron={loadIron}
                    onLoadWood={loadWood}
                    onLanded={onLanded}
                />
            }
        >
            {!bothUp && (
                <p className="text-center text-sm text-slate-600">
                    I 2000 år trodde folk på Aristoteles: at tunge ting faller raskere enn lette.
                    Bær begge kulene opp i tårnet, så finner vi det ut.
                </p>
            )}

            {bothUp && !won && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <CompareToggle
                            labelA="Aristoteles trodde"
                            labelB="Virkeligheten"
                            value={world}
                            onChange={(w) => {
                                if (dropped) return;
                                setWorld(w);
                            }}
                        />
                        {!dropped ? (
                            <button
                                onClick={drop}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition"
                            >
                                <ArrowDown className="w-4 h-4" />
                                Slipp kulene
                            </button>
                        ) : (
                            <button
                                onClick={lift}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-amber-300 text-amber-800 rounded-lg text-sm font-bold hover:bg-amber-50 transition"
                            >
                                <ArrowUp className="w-4 h-4" />
                                Heis opp igjen
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                        <span className={seen.a ? 'text-emerald-600' : ''}>
                            {seen.a ? '✓' : '•'} Aristoteles testet
                        </span>
                        <span className={seen.b ? 'text-emerald-600' : ''}>
                            {seen.b ? '✓' : '•'} Virkeligheten testet
                        </span>
                    </div>

                    {result && <SceneFact>{result}</SceneFact>}
                </div>
            )}

            {won && (
                <WinScreen title="Du tenker som Galileo!" onReplay={reset}>
                    Galileo stolte ikke blindt på Aristoteles. Han satte opp forsøket og målte
                    selv, og fant at tunge og lette ting faller like fort. Å sjekke selv i stedet
                    for å tro på autoriteten er selve kjernen i vitenskapen.
                </WinScreen>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function TowerScene({
    ironUp,
    woodUp,
    dropped,
    dropKey,
    world,
    burst,
    onLoadIron,
    onLoadWood,
    onLanded,
}: {
    ironUp: boolean;
    woodUp: boolean;
    dropped: boolean;
    dropKey: number;
    world: World;
    burst: number;
    onLoadIron: () => void;
    onLoadWood: () => void;
    onLanded: (w: World) => void;
}) {
    return (
        <group>
            <GroundPlane size={44} depth={40} color="#9aa85a" />
            <LeaningTower />

            {/* Litt italiensk natur i bakkant */}
            <Tree position={[-5, 0, -6]} />
            <Tree position={[-6.5, 0, -3]} />
            <Tree position={[6, 0, -7]} />

            {/* Landingsmerker under toppen */}
            <DropPad position={PAD_IRON} />
            <DropPad position={PAD_WOOD} />

            {/* Jernkula */}
            {ironUp ? (
                <FallingBall
                    kind="iron"
                    radius={R_IRON}
                    color="#3f4750"
                    metalness={0.85}
                    roughness={0.35}
                    slot={SLOT_IRON}
                    pad={PAD_IRON}
                    dropped={dropped}
                    dropKey={dropKey}
                    fallTime={FALL[world].iron}
                    landY={R_IRON}
                />
            ) : (
                <Draggable
                    position={START_IRON}
                    planeY={0}
                    bounds={{ minX: -1, maxX: 5, minZ: -3, maxZ: 3 }}
                    snapPoints={[[PAD_IRON[0], PAD_IRON[2]]]}
                    snapRadius={1.6}
                    onSnap={onLoadIron}
                    liftY={0.5}
                >
                    <mesh position={[0, R_IRON, 0]}>
                        <boxGeometry args={[1.6, 1.6, 1.6]} />
                        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                    </mesh>
                    <BallMesh radius={R_IRON} color="#3f4750" metalness={0.85} roughness={0.35} />
                </Draggable>
            )}

            {/* Trekula */}
            {woodUp ? (
                <FallingBall
                    kind="wood"
                    radius={R_WOOD}
                    color="#b07b3e"
                    metalness={0}
                    roughness={0.9}
                    slot={SLOT_WOOD}
                    pad={PAD_WOOD}
                    dropped={dropped}
                    dropKey={dropKey}
                    fallTime={FALL[world].wood}
                    landY={R_WOOD}
                />
            ) : (
                <Draggable
                    position={START_WOOD}
                    planeY={0}
                    bounds={{ minX: -1, maxX: 5, minZ: -3, maxZ: 3 }}
                    snapPoints={[[PAD_WOOD[0], PAD_WOOD[2]]]}
                    snapRadius={1.6}
                    onSnap={onLoadWood}
                    liftY={0.5}
                >
                    <mesh position={[0, R_WOOD, 0]}>
                        <boxGeometry args={[1.4, 1.4, 1.4]} />
                        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                    </mesh>
                    <BallMesh radius={R_WOOD} color="#b07b3e" metalness={0} roughness={0.9} />
                </Draggable>
            )}

            <Burst position={[1.7, R_IRON, 0]} trigger={burst} color="#fde68a" count={26} spread={2.4} />
            {/* Den som lander tester landingen for begge kulene */}
            <LandWatch
                dropped={dropped}
                dropKey={dropKey}
                world={world}
                onLanded={onLanded}
            />
        </group>
    );
}

// En kule som hviler i toppen og faller når dropKey endres.
function FallingBall({
    radius,
    color,
    metalness,
    roughness,
    slot,
    pad,
    dropped,
    dropKey,
    fallTime,
    landY,
}: {
    kind: 'iron' | 'wood';
    radius: number;
    color: string;
    metalness: number;
    roughness: number;
    slot: [number, number, number];
    pad: [number, number, number];
    dropped: boolean;
    dropKey: number;
    fallTime: number;
    landY: number;
}) {
    const ref = useRef<THREE.Group>(null);
    const fallStart = useRef(0);

    // Start ved foten (pad) så heisen opp er synlig.
    useEffect(() => {
        if (ref.current) ref.current.position.set(pad[0], pad[1] + radius, pad[2]);
    }, [pad, radius]);

    useEffect(() => {
        if (dropped) fallStart.current = performance.now();
    }, [dropKey, dropped]);

    useFrame((_, dt) => {
        const g = ref.current;
        if (!g) return;
        if (dropped) {
            const e = (performance.now() - fallStart.current) / 1000;
            const p = Math.min(1, e / fallTime);
            // Kvadratisk ease-in etterligner akselerasjonen i et fritt fall.
            const y = THREE.MathUtils.lerp(slot[1], landY, p * p);
            g.position.set(slot[0], y, slot[2]);
        } else {
            // Heis opp til toppen og hvil der (mykt).
            g.position.x = damp(g.position.x, slot[0], dt, 6);
            g.position.y = damp(g.position.y, slot[1], dt, 5);
            g.position.z = damp(g.position.z, slot[2], dt, 6);
        }
    });

    return (
        <group ref={ref}>
            <BallMesh radius={radius} color={color} metalness={metalness} roughness={roughness} />
        </group>
    );
}

// Fyrer onLanded én gang når begge kulene har landet i den valgte verdenen.
function LandWatch({
    dropped,
    dropKey,
    world,
    onLanded,
}: {
    dropped: boolean;
    dropKey: number;
    world: World;
    onLanded: (w: World) => void;
}) {
    const startRef = useRef(0);
    const firedKey = useRef(-1);

    useEffect(() => {
        if (dropped) startRef.current = performance.now();
    }, [dropKey, dropped]);

    useFrame(() => {
        if (!dropped || firedKey.current === dropKey) return;
        const maxT = Math.max(FALL[world].iron, FALL[world].wood);
        const e = (performance.now() - startRef.current) / 1000;
        if (e >= maxT + 0.1) {
            firedKey.current = dropKey;
            onLanded(world);
        }
    });

    return null;
}

function BallMesh({
    radius,
    color,
    metalness,
    roughness,
}: {
    radius: number;
    color: string;
    metalness: number;
    roughness: number;
}) {
    return (
        <mesh castShadow>
            <sphereGeometry args={[radius, 24, 16]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
        </mesh>
    );
}

// Et flatt landingsmerke på bakken.
function DropPad({ position }: { position: [number, number, number] }) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0.02, position[2]]}>
            <ringGeometry args={[0.32, 0.5, 24]} />
            <meshBasicMaterial color="#b45309" transparent opacity={0.5} />
        </mesh>
    );
}

// Det skjeve tårnet i Pisa - hvit marmor, runde etasjer med søylegang, lent mot +x.
function LeaningTower() {
    const drums = 6;
    const drumH = 1.05;
    return (
        <group rotation={[0, 0, -0.16]}>
            {/* Sokkel */}
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.35, 1.4, 0.6, 28]} />
                <meshStandardMaterial color="#e7e0cf" roughness={0.85} />
            </mesh>
            {Array.from({ length: drums }).map((_, i) => {
                const y = 0.6 + drumH * (i + 0.5);
                return <TowerDrum key={i} y={y} height={drumH} radius={1.25} />;
            })}
            {/* Klokkerommet på toppen */}
            <mesh position={[0, 0.6 + drumH * drums + 0.45, 0]} castShadow>
                <cylinderGeometry args={[0.95, 1.05, 0.9, 24]} />
                <meshStandardMaterial color="#e3dcc8" roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.6 + drumH * drums + 1.0, 0]}>
                <cylinderGeometry args={[1.1, 1.1, 0.12, 24]} />
                <meshStandardMaterial color="#d8d0bb" roughness={0.85} />
            </mesh>
        </group>
    );
}

// Én etasje: en marmorvegg med en ring av tynne søyler rundt.
function TowerDrum({ y, height, radius }: { y: number; height: number; radius: number }) {
    const columns = 12;
    return (
        <group position={[0, y, 0]}>
            {/* Kjerneveggen */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[radius * 0.86, radius * 0.86, height, 24]} />
                <meshStandardMaterial color="#d9d2bf" roughness={0.9} />
            </mesh>
            {/* Gulv- og takband */}
            <mesh position={[0, height / 2, 0]}>
                <cylinderGeometry args={[radius, radius, 0.12, 24]} />
                <meshStandardMaterial color="#eee9dd" roughness={0.8} />
            </mesh>
            <mesh position={[0, -height / 2, 0]}>
                <cylinderGeometry args={[radius, radius, 0.12, 24]} />
                <meshStandardMaterial color="#eee9dd" roughness={0.8} />
            </mesh>
            {/* Søylegangen */}
            {Array.from({ length: columns }).map((_, i) => {
                const a = (i / columns) * Math.PI * 2;
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}
                        castShadow
                    >
                        <cylinderGeometry args={[0.08, 0.08, height * 0.78, 8]} />
                        <meshStandardMaterial color="#f2eee2" roughness={0.7} />
                    </mesh>
                );
            })}
        </group>
    );
}

export default Falltaarnet3D;
