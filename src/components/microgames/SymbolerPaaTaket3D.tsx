import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Draggable,
    GroundPlane,
    SceneBanner,
    SceneBadge,
    DataReadout,
    DragHint,
    WinScreen,
    Burst,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: Symbolene på taket.
// Tre gudshus står på rad: en kirke, en moské og en synagoge. Foran dem
// svever tre symboler. Eleven drar hvert symbol opp på riktig tak. Treffer
// det rett hus, klikker symbolet på plass på toppen og huset lyser opp.
// Lyspære: hvert gudshus har sitt eget symbol, og symbolet på taket forteller
// deg hvilken tro huset hører til.

interface HouseInfo {
    id: string;
    name: string;
    x: number;
    color: string;
    topY: number;
}

interface SymbolInfo {
    id: string;
    name: string;
    correct: string;
    startX: number;
    color: string;
    shape: 'kors' | 'halvmane' | 'davidsstjerne';
}

const HOUSES: HouseInfo[] = [
    { id: 'kirke', name: 'Kirke', x: -4.2, color: '#f59e0b', topY: 3.6 },
    { id: 'moske', name: 'Moské', x: 0, color: '#10b981', topY: 3.0 },
    { id: 'synagoge', name: 'Synagoge', x: 4.2, color: '#3b82f6', topY: 2.7 },
];

const SYMBOLS: SymbolInfo[] = [
    { id: 'kors', name: 'Kors', correct: 'kirke', startX: -3.2, color: '#fbbf24', shape: 'kors' },
    {
        id: 'halvmane',
        name: 'Halvmåne og stjerne',
        correct: 'moske',
        startX: 0,
        color: '#34d399',
        shape: 'halvmane',
    },
    {
        id: 'davidsstjerne',
        name: 'Davidsstjerne',
        correct: 'synagoge',
        startX: 3.2,
        color: '#60a5fa',
        shape: 'davidsstjerne',
    },
];

const HOUSE_Z = -1.2;
const START_Z = 4.4;
const EXTRUDE = {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 1,
};

// --- Geometri-byggere (rene moduler, kalt i useMemo) ---

function crossGeometry(): THREE.ExtrudeGeometry {
    const s = new THREE.Shape();
    const pts: [number, number][] = [
        [-0.18, 0.75],
        [0.18, 0.75],
        [0.18, 0.5],
        [0.5, 0.5],
        [0.5, 0.15],
        [0.18, 0.15],
        [0.18, -0.75],
        [-0.18, -0.75],
        [-0.18, 0.15],
        [-0.5, 0.15],
        [-0.5, 0.5],
        [-0.18, 0.5],
    ];
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, EXTRUDE);
    g.center();
    return g;
}

function starShape(points: number, outerR: number, innerR: number, startDeg = 90): THREE.Shape {
    const s = new THREE.Shape();
    const total = points * 2;
    for (let i = 0; i < total; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (startDeg * Math.PI) / 180 + (i * Math.PI) / points;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) s.moveTo(x, y);
        else s.lineTo(x, y);
    }
    s.closePath();
    return s;
}

function hexagramGeometry(): THREE.ExtrudeGeometry {
    const g = new THREE.ExtrudeGeometry(starShape(6, 0.72, 0.42), EXTRUDE);
    g.center();
    return g;
}

function crescentGeometry(): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 0.62, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0.3, 0.06, 0.5, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(shape, EXTRUDE);
    g.center();
    return g;
}

function smallStarGeometry(): THREE.ExtrudeGeometry {
    const g = new THREE.ExtrudeGeometry(starShape(5, 0.2, 0.085), EXTRUDE);
    g.center();
    return g;
}

// --- Symbol-mesh (flat, står oppreist mot kameraet) ---

function SymbolMesh({ shape, color }: { shape: SymbolInfo['shape']; color: string }) {
    const crossG = useMemo(() => crossGeometry(), []);
    const hexG = useMemo(() => hexagramGeometry(), []);
    const crescentG = useMemo(() => crescentGeometry(), []);
    const starG = useMemo(() => smallStarGeometry(), []);

    const mat = (
        <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.35}
            roughness={0.4}
            metalness={0.2}
            flatShading
        />
    );

    if (shape === 'kors') {
        return (
            <mesh geometry={crossG} castShadow>
                {mat}
            </mesh>
        );
    }
    if (shape === 'davidsstjerne') {
        return (
            <mesh geometry={hexG} castShadow>
                {mat}
            </mesh>
        );
    }
    // halvmåne med stjerne
    return (
        <group>
            <mesh geometry={crescentG} castShadow>
                {mat}
            </mesh>
            <mesh geometry={starG} position={[0.62, 0.04, 0]} castShadow>
                <meshStandardMaterial
                    color="#fde68a"
                    emissive="#fde68a"
                    emissiveIntensity={0.5}
                    roughness={0.4}
                    flatShading
                />
            </mesh>
        </group>
    );
}

// --- Gudshus ---

function House({ house, lit }: { house: HouseInfo; lit: boolean }) {
    const grp = useRef<THREE.Group>(null);
    const black = useMemo(() => new THREE.Color('#000000'), []);
    const litColor = useMemo(() => new THREE.Color(house.color), [house.color]);

    useFrame((_, dt) => {
        if (!grp.current) return;
        const target = lit ? 0.55 : 0;
        grp.current.traverse((o) => {
            const mesh = o as THREE.Mesh;
            const m = mesh.material as THREE.MeshStandardMaterial | undefined;
            if (m && m.isMeshStandardMaterial) {
                m.emissive.lerp(lit ? litColor : black, 1 - Math.exp(-5 * dt));
                m.emissiveIntensity = damp(m.emissiveIntensity, target, dt, 5);
            }
        });
    });

    const wall = '#e7e2d8';
    const roof = '#b7ae9d';

    return (
        <group ref={grp} position={[house.x, 0, HOUSE_Z]}>
            {house.id === 'kirke' && (
                <>
                    {/* skip */}
                    <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1.7, 1.8, 2.0]} />
                        <meshStandardMaterial color={wall} roughness={0.8} />
                    </mesh>
                    {/* saltak */}
                    <mesh position={[0, 2.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                        <coneGeometry args={[1.35, 0.9, 4]} />
                        <meshStandardMaterial color={roof} roughness={0.8} flatShading />
                    </mesh>
                    {/* tårn */}
                    <mesh position={[0, 2.6, 0.2]} castShadow>
                        <boxGeometry args={[0.7, 1.7, 0.7]} />
                        <meshStandardMaterial color={wall} roughness={0.8} />
                    </mesh>
                    {/* spir */}
                    <mesh position={[0, 3.7, 0.2]} rotation={[0, Math.PI / 4, 0]} castShadow>
                        <coneGeometry args={[0.55, 0.9, 4]} />
                        <meshStandardMaterial color={roof} roughness={0.8} flatShading />
                    </mesh>
                </>
            )}

            {house.id === 'moske' && (
                <>
                    <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
                        <boxGeometry args={[2.0, 1.6, 2.0]} />
                        <meshStandardMaterial color={wall} roughness={0.8} />
                    </mesh>
                    {/* kuppel */}
                    <mesh position={[0, 1.6, 0]} castShadow>
                        <sphereGeometry args={[0.95, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color={roof} roughness={0.7} flatShading />
                    </mesh>
                    {/* minaret */}
                    <mesh position={[1.25, 1.5, -0.6]} castShadow>
                        <cylinderGeometry args={[0.16, 0.2, 3.0, 10]} />
                        <meshStandardMaterial color={wall} roughness={0.8} />
                    </mesh>
                    <mesh position={[1.25, 3.15, -0.6]} castShadow>
                        <coneGeometry args={[0.22, 0.5, 10]} />
                        <meshStandardMaterial color={roof} roughness={0.8} flatShading />
                    </mesh>
                </>
            )}

            {house.id === 'synagoge' && (
                <>
                    <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1.9, 1.7, 2.0]} />
                        <meshStandardMaterial color={wall} roughness={0.8} />
                    </mesh>
                    {/* portal/bue foran */}
                    <mesh position={[0, 0.75, 1.02]} castShadow>
                        <cylinderGeometry args={[0.42, 0.42, 0.2, 16, 1, false, 0, Math.PI]} />
                        <meshStandardMaterial color={roof} roughness={0.8} flatShading />
                    </mesh>
                    {/* flatt tak med kant */}
                    <mesh position={[0, 1.78, 0]} castShadow>
                        <boxGeometry args={[2.1, 0.22, 2.2]} />
                        <meshStandardMaterial color={roof} roughness={0.8} flatShading />
                    </mesh>
                </>
            )}
        </group>
    );
}

// --- Plassert symbol over taket (svever og lyser) ---

function PlacedSymbol({ symbol, house }: { symbol: SymbolInfo; house: HouseInfo }) {
    const grp = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (grp.current) {
            grp.current.position.y = house.topY + Math.sin(state.clock.elapsedTime * 1.6) * 0.07;
            grp.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
        }
    });
    return (
        <group ref={grp} position={[house.x, house.topY, HOUSE_Z]}>
            <group scale={0.85}>
                <SymbolMesh shape={symbol.shape} color={symbol.color} />
            </group>
            {/* myk glød */}
            <mesh>
                <sphereGeometry args={[0.95, 16, 16]} />
                <meshBasicMaterial
                    color={symbol.color}
                    transparent
                    opacity={0.18}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
}

// --- Dragbart symbol (står på bakken foran husene) ---

function DraggableSymbol({
    symbol,
    onDrop,
}: {
    symbol: SymbolInfo;
    onDrop: (sym: SymbolInfo, pos: THREE.Vector3) => void;
}) {
    const bob = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (bob.current) {
            bob.current.position.y =
                1.0 + Math.sin(state.clock.elapsedTime * 2 + symbol.startX) * 0.08;
        }
    });
    return (
        <Draggable
            position={[symbol.startX, 0, START_Z]}
            bounds={{ minX: -6.5, maxX: 6.5, minZ: -3, maxZ: 5 }}
            liftY={0.3}
            onDrop={(p) => onDrop(symbol, p)}
        >
            {/* romslig usynlig gripeflate */}
            <mesh position={[0, 1.1, 0]}>
                <boxGeometry args={[1.7, 2.2, 1.2]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
            {/* sokkel */}
            <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.55, 0.62, 0.18, 18]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
            </mesh>
            <group ref={bob} position={[0, 1.0, 0]} scale={0.78}>
                <SymbolMesh shape={symbol.shape} color={symbol.color} />
            </group>
        </Draggable>
    );
}

// ============================================================

const SymbolerPaaTaket3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [placed, setPlaced] = useState<Record<string, string>>({});
    const [nonce, setNonce] = useState<Record<string, number>>({});
    const [banner, setBanner] = useState<string | null>(
        'Dra et symbol opp på taket der det hører hjemme.'
    );
    const [burst, setBurst] = useState(0);
    const [burstColor, setBurstColor] = useState('#fbbf24');
    const [burstPos, setBurstPos] = useState<[number, number, number]>([0, 3, HOUSE_Z]);
    const [won, setWon] = useState(false);

    const placedCount = Object.keys(placed).length;

    const reset = () => {
        setPlaced({});
        setNonce((n) => {
            const next = { ...n };
            for (const s of SYMBOLS) next[s.id] = (next[s.id] || 0) + 1;
            return next;
        });
        setWon(false);
        setBanner('Dra et symbol opp på taket der det hører hjemme.');
    };

    const sendHome = (id: string) => {
        setNonce((n) => ({ ...n, [id]: (n[id] || 0) + 1 }));
    };

    const handleDrop = (sym: SymbolInfo, pos: THREE.Vector3) => {
        if (won || placed[sym.id]) return;
        // nærmeste hus
        let best: HouseInfo | null = null;
        let bestDist = Infinity;
        for (const h of HOUSES) {
            const d = Math.hypot(pos.x - h.x, pos.z - HOUSE_Z);
            if (d < bestDist) {
                bestDist = d;
                best = h;
            }
        }
        if (!best || bestDist > 2.6) {
            // sluppet i tomrommet - tilbake til start
            sendHome(sym.id);
            return;
        }
        if (best.id === sym.correct) {
            sounds.play('correct');
            const next = { ...placed, [sym.id]: best.id };
            setPlaced(next);
            setBurstColor(sym.color);
            setBurstPos([best.x, best.topY, HOUSE_Z]);
            setBurst((b) => b + 1);
            if (Object.keys(next).length >= SYMBOLS.length) {
                setBanner(null);
                setWon(true);
                sounds.play('complete');
                onComplete({ score: 1, completed: true, artifact: { placed: next } });
            } else {
                setBanner(`${best.name} fikk symbolet sitt. ${SYMBOLS.length - Object.keys(next).length} igjen.`);
            }
        } else {
            sounds.play('incorrect');
            setBanner(`En ${best.name.toLowerCase()} bruker ikke det symbolet. Prøv et annet tak.`);
            sendHome(sym.id);
        }
    };

    const placedSymbols = SYMBOLS.filter((s) => placed[s.id]);
    const looseSymbols = SYMBOLS.filter((s) => !placed[s.id]);

    return (
        <MicroGameScaffold
            title="Symbolene på taket"
            subtitle="Tre gudshus mangler tegnet sitt. Dra hvert symbol opp på riktig tak."
            estimatedSeconds={120}
            onRetry={placedCount > 0 || won ? reset : undefined}
            canvas={{
                idle: !won && placedCount === 0,
                camera: { position: [0, 4.5, 13], fov: 42 },
                background: '#dbeafe',
                target: [0, 1.4, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">{won ? 'Tre hus, tre tegn' : 'Religion og samfunn'}</SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[{ label: 'Tak fylt', value: `${placedCount}/${SYMBOLS.length}` }]}
                    />
                    <DragHint show={placedCount === 0 && !won} corner="bc">
                        Dra et symbol opp på et tak
                    </DragHint>
                </>
            }
            scene={
                <group>
                    <GroundPlane color="#cbb894" />

                    {HOUSES.map((h) => (
                        <House
                            key={h.id}
                            house={h}
                            lit={Object.values(placed).includes(h.id)}
                        />
                    ))}

                    {placedSymbols.map((s) => {
                        const h = HOUSES.find((x) => x.id === placed[s.id])!;
                        return <PlacedSymbol key={s.id} symbol={s} house={h} />;
                    })}

                    {looseSymbols.map((s) => (
                        <DraggableSymbol
                            key={`${s.id}-${nonce[s.id] || 0}`}
                            symbol={s}
                            onDrop={handleDrop}
                        />
                    ))}

                    <Burst position={burstPos} trigger={burst} color={burstColor} count={28} spread={3.5} />
                </group>
            }
        >
            <div className="grid grid-cols-3 gap-2">
                {HOUSES.map((h) => {
                    const on = Object.values(placed).includes(h.id);
                    return (
                        <div
                            key={h.id}
                            className={`rounded-xl border p-2.5 text-center transition ${
                                on ? 'bg-white shadow-sm' : 'bg-slate-50 border-slate-200'
                            }`}
                            style={on ? { borderColor: h.color } : undefined}
                        >
                            <span
                                className="inline-block w-3 h-3 rounded-full mb-1 transition"
                                style={{
                                    backgroundColor: on ? h.color : '#cbd5e1',
                                    boxShadow: on ? `0 0 8px ${h.color}` : 'none',
                                }}
                            />
                            <p className="text-xs font-bold text-slate-700">{h.name}</p>
                        </div>
                    );
                })}
            </div>

            {won && (
                <div className="mt-3">
                    <WinScreen title="Alle tre takene lyser!" onReplay={reset}>
                        Korset hører til kirken, halvmånen til moskeen og davidsstjernen til
                        synagogen. Symbolet på taket forteller deg hvilken tro huset hører til, lenge
                        før du går inn døra. Slik blir tro noe du kan se i byen rundt deg.
                    </WinScreen>
                </div>
            )}
        </MicroGameScaffold>
    );
};

export default SymbolerPaaTaket3D;
