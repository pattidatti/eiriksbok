import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    SceneBanner,
    SceneBadge,
    SceneFact,
    WinScreen,
    GroundPlane,
    Figure,
    damp,
    Burst,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: en konflikt sprer konsekvenser som ringer i vann. Eleven får sikre
// tre forutsetninger som hindrer krig (meklingsorgan, samhandel, demokratisk
// fred) FØR hun tenner gnisten i sentrum. Sikrer hun alle tre, dør gnisten ut og
// krigen hindres. Sikrer hun for få, ruller en sjokkbølge utover og treffer
// matpriser, energi, flyktninger og handel langt utenfor konfliktsonen.
// Lyspæren: endrer du de dype forutsetningene, kan du hindre krigen - og
// konsekvensene rammer mye mer enn bare de som kriger.

type Phase = 'prep' | 'war' | 'result' | 'won';

interface PrecDef {
    id: string;
    label: string;
    pos: [number, number, number];
}

const PRECS: PrecDef[] = [
    { id: 'fn', label: 'Meklingsorgan (FN)', pos: [-2.6, 1.3, -1.6] },
    { id: 'handel', label: 'Økonomisk samhandel', pos: [2.6, 1.3, -1.6] },
    { id: 'demokrati', label: 'Demokratisk fred', pos: [0, 1.3, 2.8] },
];

interface SatDef {
    id: string;
    label: string;
    pos: [number, number, number];
    kind: 'field' | 'city' | 'people' | 'trade';
    base: string;
}

// Konsekvenser rundt konfliktsonen. Rekkefølgen avgjør hvem som rammes først.
const SATS: SatDef[] = [
    { id: 'mat', label: 'Matpriser stiger', pos: [0, 0, -6], kind: 'field', base: '#86b94e' },
    { id: 'energi', label: 'Energiprisene hopper', pos: [6, 0, 0], kind: 'city', base: '#cfd6df' },
    { id: 'flykt', label: 'Flyktninger på flukt', pos: [0, 0, 6], kind: 'people', base: '#6d8bb0' },
    { id: 'handel', label: 'Verdenshandel rammes', pos: [-6, 0, 0], kind: 'trade', base: '#c79a55' },
];

const WAVE_MAX = 7.2;

const Konsekvensbolgen3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [phase, setPhase] = useState<Phase>('prep');
    const [secured, setSecured] = useState<Set<string>>(new Set());
    const [hits, setHits] = useState<boolean[]>([false, false, false, false]);
    const [banner, setBanner] = useState<string | null>(
        'Sikre forutsetningene som hindrer krig - klikk de tre lysende punktene. Tenn så gnisten i midten.'
    );
    const [burst, setBurst] = useState(0);

    const waveRef = useRef(0);
    const pendingHitsRef = useRef<boolean[]>([false, false, false, false]);
    const finalizedRef = useRef(false);

    const securedCount = secured.size;

    const togglePrec = (id: string) => {
        if (phase !== 'prep') return;
        sounds.play('correct');
        setSecured((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const ignite = () => {
        if (phase !== 'prep') return;
        if (securedCount >= 3) {
            // Gnisten dør ut - krigen hindret.
            sounds.play('complete');
            setBurst((b) => b + 1);
            setPhase('won');
            setBanner(null);
            onComplete({ score: 1, completed: true, artifact: { secured: [...secured] } });
            return;
        }
        // Krig bryter ut. Jo færre forutsetninger sikret, jo flere konsekvenser.
        sounds.play('incorrect');
        const hitCount = 4 - securedCount; // 0 sikret -> 4 rammes, 2 sikret -> 2 rammes
        const ph = SATS.map((_, i) => i < hitCount);
        pendingHitsRef.current = ph;
        finalizedRef.current = false;
        waveRef.current = 0;
        setHits([false, false, false, false]);
        setPhase('war');
        setBanner('Gnisten tente. Sjokkbølgen ruller utover...');
    };

    const onWaveCross = (i: number) => {
        setHits((prev) => {
            if (prev[i]) return prev;
            const next = [...prev];
            next[i] = true;
            return next;
        });
        sounds.play('drop');
    };

    const onWaveDone = () => {
        const hitCount = pendingHitsRef.current.filter(Boolean).length;
        setPhase('result');
        setBanner(
            securedCount === 2
                ? 'Nesten! Du dempet mye, men krigen brøt ut likevel. Sikre alle tre forutsetningene.'
                : 'Konflikten brøt ut. Konsekvensene spredte seg som ringer i vann og rammet ' +
                      hitCount +
                      ' områder langt utenfor konfliktsonen.'
        );
    };

    const retry = () => {
        setPhase('prep');
        setSecured(new Set());
        setHits([false, false, false, false]);
        waveRef.current = 0;
        finalizedRef.current = false;
        setBanner('Sikre alle tre forutsetningene denne gangen, og tenn så gnisten.');
    };

    return (
        <MicroGameScaffold
            title="Konsekvensbølgen"
            subtitle="Sikre forutsetningene som hindrer krig, før du tenner gnisten"
            estimatedSeconds={130}
            onRetry={phase !== 'prep' || securedCount > 0 ? retry : undefined}
            canvas={{
                idle: phase === 'prep',
                camera: { position: [0, 8.5, 10], fov: 42 },
                background: '#dCEAF6',
                target: [0, 0.4, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} />
                    <SceneBadge corner="br">
                        {phase === 'won' ? 'Krigen hindret' : 'Årsak og konsekvens'}
                    </SceneBadge>
                </>
            }
            scene={
                <WaveWorld
                    phase={phase}
                    secured={secured}
                    waveRef={waveRef}
                    pendingHitsRef={pendingHitsRef}
                    finalizedRef={finalizedRef}
                    burst={burst}
                    onPrec={togglePrecGuard(phase, togglePrec)}
                    onIgnite={ignite}
                    onWaveCross={onWaveCross}
                    onWaveDone={onWaveDone}
                />
            }
        >
            {/* Status for de fire konsekvensene */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SATS.map((s, i) => (
                    <div
                        key={s.id}
                        className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors ${
                            hits[i]
                                ? 'border-rose-300 bg-rose-50 text-rose-700'
                                : 'border-slate-200 bg-white text-slate-500'
                        }`}
                    >
                        {s.label}
                    </div>
                ))}
            </div>

            {phase === 'prep' && (
                <div className="mt-3 flex flex-col gap-2">
                    <p className="text-sm font-bold text-slate-700">
                        Forutsetninger sikret: {securedCount} av 3
                    </p>
                    <SceneFact>
                        Sterke fellesinstitusjoner, land som handler tett, og demokratier som
                        forhandler i stedet for å krige - det er forutsetninger som hindrer krig.
                        Klikk de tre lysende punktene, og tenn så gnisten i midten.
                    </SceneFact>
                </div>
            )}

            {phase === 'war' && (
                <p className="mt-3 text-sm text-slate-600 py-1">Sjokkbølgen sprer seg utover...</p>
            )}

            {phase === 'result' && (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 sm:flex sm:items-center sm:gap-4">
                    <p className="text-xs text-rose-800 leading-relaxed min-w-0 flex-1">
                        Du sikret bare {securedCount} av 3 forutsetninger. Endrer du nok av de dype
                        forutsetningene, kan gnisten dø ut helt.
                    </p>
                    <button
                        onClick={retry}
                        className="mt-2.5 sm:mt-0 inline-flex items-center justify-center px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition flex-shrink-0"
                    >
                        Endre forutsetningene
                    </button>
                </div>
            )}

            {phase === 'won' && (
                <WinScreen title="Gnisten døde ut - krigen ble hindret!" onReplay={retry}>
                    Du sikret alle tre forutsetningene: et organ som megler, land som er økonomisk
                    avhengige av hverandre, og demokratier som forhandler. Da hadde ikke gnisten noe
                    å tenne. Dette er kjernen i kompetansemålet: endrer vi de dype forutsetningene,
                    kan konflikter hindres - og konsekvensene rammer alltid mye mer enn bare de som
                    kriger.
                </WinScreen>
            )}
        </MicroGameScaffold>
    );
};

// Liten guard så precondition-klikk bare virker i prep-fasen.
function togglePrecGuard(phase: Phase, fn: (id: string) => void) {
    return phase === 'prep' ? fn : () => {};
}

// ============================================================
//  3D-VERDENEN
// ============================================================

function WaveWorld({
    phase,
    secured,
    waveRef,
    pendingHitsRef,
    finalizedRef,
    burst,
    onPrec,
    onIgnite,
    onWaveCross,
    onWaveDone,
}: {
    phase: Phase;
    secured: Set<string>;
    waveRef: React.MutableRefObject<number>;
    pendingHitsRef: React.MutableRefObject<boolean[]>;
    finalizedRef: React.MutableRefObject<boolean>;
    burst: number;
    onPrec: (id: string) => void;
    onIgnite: () => void;
    onWaveCross: (i: number) => void;
    onWaveDone: () => void;
}) {
    // Driver for sjokkbølgen.
    useFrame((_, dt) => {
        if (phase !== 'war') return;
        waveRef.current = damp(waveRef.current, WAVE_MAX, dt, 2.2);
        // Marker konsekvenser som bølgen har nådd.
        SATS.forEach((s, i) => {
            const dist = Math.hypot(s.pos[0], s.pos[2]);
            if (pendingHitsRef.current[i] && waveRef.current >= dist - 0.05) {
                onWaveCross(i);
            }
        });
        if (waveRef.current >= WAVE_MAX - 0.25 && !finalizedRef.current) {
            finalizedRef.current = true;
            onWaveDone();
        }
    });

    const showWave = phase === 'war' || phase === 'result';

    return (
        <group>
            <GroundPlane size={26} depth={26} color="#cfe3c2" />

            {/* Konfliktsone i sentrum */}
            <ConflictCore active={phase !== 'prep'} />

            {/* Sjokkbølge-ring */}
            {showWave && <ShockRing waveRef={waveRef} />}

            {/* Konsekvensene rundt */}
            {SATS.map((s, i) => (
                <Satellite key={s.id} data={s} index={i} waveRef={waveRef} pendingHitsRef={pendingHitsRef} />
            ))}

            {/* Forutsetning-hotspots */}
            {PRECS.map((p) => (
                <Hotspot
                    key={p.id}
                    position={p.pos}
                    onSelect={() => onPrec(p.id)}
                    state={secured.has(p.id) ? 'correct' : 'idle'}
                    label={p.label}
                    radius={0.5}
                    disabled={phase !== 'prep'}
                />
            ))}

            {/* Gnist-hotspot i midten */}
            {phase === 'prep' && (
                <Hotspot
                    position={[0, 1.5, 0]}
                    onSelect={onIgnite}
                    state="wrong"
                    color="#dc2626"
                    label="Tenn gnisten"
                    radius={0.6}
                />
            )}

            <Burst position={[0, 1.4, 0]} trigger={burst} color="#bff0c4" count={30} spread={4} />
        </group>
    );
}

// Konfliktkjernen: en mørk søyle som gløder rødt når gnisten er tent.
function ConflictCore({ active }: { active: boolean }) {
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    const t = useRef(0);
    useFrame((_, dt) => {
        t.current = damp(t.current, active ? 1 : 0, dt, 4);
        if (mat.current) {
            mat.current.emissiveIntensity = t.current * (1.1 + Math.sin(performance.now() * 0.008) * 0.3);
        }
    });
    return (
        <group position={[0, 0, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.6, 0.8, 1, 6]} />
                <meshStandardMaterial
                    ref={mat}
                    color="#5b4636"
                    emissive="#ff3b1f"
                    emissiveIntensity={0}
                    roughness={0.9}
                />
            </mesh>
        </group>
    );
}

// Den ekspanderende sjokkbølge-ringen langs bakken.
function ShockRing({ waveRef }: { waveRef: React.MutableRefObject<number> }) {
    const ring = useRef<THREE.Mesh>(null);
    const mat = useRef<THREE.MeshBasicMaterial>(null);
    useFrame(() => {
        const r = Math.max(0.001, waveRef.current);
        if (ring.current) ring.current.scale.set(r, r, r);
        if (mat.current) mat.current.opacity = Math.max(0, 0.55 * (1 - r / WAVE_MAX));
    });
    return (
        <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[0.82, 1, 64]} />
            <meshBasicMaterial ref={mat} color="#e0492f" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
    );
}

const C_BASE = new THREE.Color('#ffffff');
const C_DMG = new THREE.Color('#7a3b2e');

// En konsekvens-satellitt. Skifter til skadet (brunrød, synker litt) når
// sjokkbølgen når den OG den er blant dem som rammes.
function Satellite({
    data,
    index,
    waveRef,
    pendingHitsRef,
}: {
    data: SatDef;
    index: number;
    waveRef: React.MutableRefObject<number>;
    pendingHitsRef: React.MutableRefObject<boolean[]>;
}) {
    const grp = useRef<THREE.Group>(null);
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    const dmg = useRef(0);
    const dist = Math.hypot(data.pos[0], data.pos[2]);
    const baseCol = useRef(new THREE.Color(data.base));

    useFrame((_, dt) => {
        const reached = pendingHitsRef.current[index] && waveRef.current >= dist - 0.05;
        dmg.current = damp(dmg.current, reached ? 1 : 0, dt, 3.5);
        if (grp.current) {
            grp.current.position.y = -dmg.current * 0.3;
            const s = 1 - dmg.current * 0.18;
            grp.current.scale.set(s, s, s);
        }
        if (mat.current) {
            // base -> brunrød ved skade
            mat.current.color.copy(baseCol.current).lerp(C_DMG, dmg.current * 0.85);
            mat.current.emissive.copy(C_BASE).lerp(C_DMG, 1);
            mat.current.emissiveIntensity = dmg.current * 0.25;
        }
    });

    return (
        <group position={data.pos}>
            {/* liten sokkel */}
            <mesh position={[0, 0.05, 0]} receiveShadow>
                <cylinderGeometry args={[1.3, 1.4, 0.1, 20]} />
                <meshStandardMaterial color="#b9c7a7" roughness={1} />
            </mesh>
            <group ref={grp}>
                <SatelliteEmblem kind={data.kind} matRef={mat} />
            </group>
        </group>
    );
}

// Visuelt motiv per konsekvens. Hovedmaterialet tar imot matRef for fargeskift.
function SatelliteEmblem({
    kind,
    matRef,
}: {
    kind: SatDef['kind'];
    matRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
}) {
    if (kind === 'field') {
        // Kornåker: tre korn-aks på et grønt felt.
        return (
            <group position={[0, 0.1, 0]}>
                <mesh position={[0, 0.06, 0]} castShadow>
                    <boxGeometry args={[1.6, 0.12, 1.6]} />
                    <meshStandardMaterial ref={matRef} color="#86b94e" roughness={1} />
                </mesh>
                {[-0.4, 0, 0.4].map((x) => (
                    <mesh key={x} position={[x, 0.5, 0]} castShadow>
                        <coneGeometry args={[0.12, 0.8, 6]} />
                        <meshStandardMaterial color="#d9b24a" roughness={0.9} />
                    </mesh>
                ))}
            </group>
        );
    }
    if (kind === 'city') {
        // Kraftverk/by: en boks med en lysende lampe på toppen.
        return (
            <group position={[0, 0.1, 0]}>
                <mesh position={[0, 0.5, 0]} castShadow>
                    <boxGeometry args={[0.9, 1, 0.9]} />
                    <meshStandardMaterial ref={matRef} color="#cfd6df" roughness={0.7} />
                </mesh>
                <mesh position={[0, 1.15, 0]}>
                    <sphereGeometry args={[0.22, 14, 14]} />
                    <meshStandardMaterial color="#ffe27a" emissive="#ffcf3a" emissiveIntensity={0.9} />
                </mesh>
            </group>
        );
    }
    if (kind === 'people') {
        // Flyktninger: tre små figurer.
        return (
            <group position={[0, 0.1, 0]}>
                <mesh position={[0, 0.05, 0]} castShadow>
                    <boxGeometry args={[1.4, 0.1, 1.0]} />
                    <meshStandardMaterial ref={matRef} color="#6d8bb0" roughness={0.9} />
                </mesh>
                <Figure position={[-0.4, 0.1, 0]} body="#4a5d77" />
                <Figure position={[0.1, 0.1, 0.25]} body="#3e5168" />
                <Figure position={[0.5, 0.1, -0.15]} body="#56698a" />
            </group>
        );
    }
    // trade: markedsbod med tak.
    return (
        <group position={[0, 0.1, 0]}>
            <mesh position={[0, 0.45, 0]} castShadow>
                <boxGeometry args={[1.1, 0.7, 0.9]} />
                <meshStandardMaterial ref={matRef} color="#c79a55" roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.95, 0]} rotation={[0, 0, 0]} castShadow>
                <boxGeometry args={[1.3, 0.16, 1.1]} />
                <meshStandardMaterial color="#8a5a32" roughness={0.9} />
            </mesh>
        </group>
    );
}

export default Konsekvensbolgen3D;
