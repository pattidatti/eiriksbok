import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Factory } from 'lucide-react';
import {
    MicroGameScaffold,
    Draggable,
    GroundPlane,
    WaterPlane,
    Person,
    SceneBanner,
    SceneBadge,
    DragHint,
    SceneFact,
    WinScreen,
    CompareToggle,
    StepTracker,
    damp,
    Burst,
    CameraRig,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: PRODUKSJONSOPPSKRIFTEN.
// Lyspæren: produksjon er en MIKS av fire faktorer - mennesker, råvarer,
// maskiner og land/lokasjon. Eleven drar de tre flyttbare faktorene inn på
// produksjonsbordet ved kysten og ser laksefileten bli til. Den fjerde
// faktoren - lokasjonen - testes med en bryter: flytt fabrikken innland, og
// råvaren (fisken) forsvinner. Samme oppskrift, feil sted = ingen produksjon.
// Det bygger broen til komparativt fortrinn: ulike steder er billigst til ulikt.

type Phase = 'build' | 'location' | 'done';
type FactorId = 'mennesker' | 'raavare' | 'maskin';

const FACTORS: { id: FactorId; label: string; start: [number, number, number]; fact: string }[] = [
    {
        id: 'mennesker',
        label: 'Mennesker',
        start: [-4.2, 0, 3.4],
        fact: 'Mennesker (arbeidskraft) er én faktor. Noen må styre maskinen og gjøre jobben.',
    },
    {
        id: 'raavare',
        label: 'Råvare',
        start: [4.2, 0, 3.4],
        fact: 'Råvaren (innsatsfaktoren) er en annen faktor. Her er det fersk laks rett fra merden.',
    },
    {
        id: 'maskin',
        label: 'Maskin',
        start: [0, 0, 5.2],
        fact: 'Maskinen (kapital) er en tredje faktor. Den gjør at få mennesker kan lage mye.',
    },
];

const BENCH: [number, number, number] = [0, 0, 0];

const Produksjonsoppskriften3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [phase, setPhase] = useState<Phase>('build');
    const [placed, setPlaced] = useState<FactorId[]>([]);
    const [location, setLocation] = useState<'a' | 'b'>('a'); // a = kyst, b = innland
    const [triedInnland, setTriedInnland] = useState(false);
    const [banner, setBanner] = useState<string | null>('Dra de tre faktorene inn på produksjonsbordet.');
    const [fact, setFact] = useState<string | null>(null);
    const [introDone, setIntroDone] = useState(false);
    const [burst, setBurst] = useState(0);

    const reset = () => {
        setPhase('build');
        setPlaced([]);
        setLocation('a');
        setTriedInnland(false);
        setBanner('Dra de tre faktorene inn på produksjonsbordet.');
        setFact(null);
    };

    // Slipp en faktor: nær bordet => den monteres. Ellers en mild nudge.
    const dropFactor = (id: FactorId) => (pos: THREE.Vector3) => {
        const dist = Math.hypot(pos.x - BENCH[0], pos.z - BENCH[2]);
        if (dist < 2.4 && !placed.includes(id)) {
            const next = [...placed, id];
            setPlaced(next);
            setFact(FACTORS.find((f) => f.id === id)!.fact);
            if (next.length >= FACTORS.length) {
                sounds.play('complete');
                setBurst((b) => b + 1);
                setPhase('location');
                setBanner('Laksefileten er ferdig! Men hva om fabrikken lå et annet sted?');
            } else {
                sounds.play('correct');
                setBanner('Bra! Dra inn de andre faktorene også.');
            }
            return true;
        }
        setBanner('Slipp faktoren oppå produksjonsbordet i midten.');
        return false;
    };

    const changeLocation = (v: 'a' | 'b') => {
        setLocation(v);
        sounds.play('sceneChange');
        if (v === 'b') {
            setTriedInnland(true);
            setBanner('Innlandet har ingen kyst - da finnes ikke den billige råvaren. Produksjonen stopper.');
        } else {
            setBanner('Tilbake ved kysten. Nå er råvaren på plass igjen, og fileten kan lages.');
        }
    };

    const finish = () => {
        sounds.play('complete');
        setBurst((b) => b + 1);
        setPhase('done');
        setBanner(null);
        setTimeout(() => onComplete({ score: 1, completed: true }), 200);
    };

    const idle = phase === 'build' && placed.length === 0;
    const productLive = placed.length >= FACTORS.length && location === 'a';

    return (
        <MicroGameScaffold
            title="Produksjonsoppskriften"
            subtitle="Bland de fire faktorene - mennesker, råvare, maskin og lokasjon - og lag en laksefilet"
            estimatedSeconds={150}
            onRetry={placed.length > 0 || phase !== 'build' ? reset : undefined}
            canvas={{
                idle: false,
                controls: introDone,
                camera: { position: [16, 13, 18], fov: 42 },
                background: '#cfe8f5',
                target: [0, 0.8, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {phase === 'build'
                            ? `Faktorer: ${placed.length}/3`
                            : location === 'a'
                              ? 'Ved kysten'
                              : 'Innlandet'}
                    </SceneBadge>
                    <DragHint show={idle && introDone}>Dra en faktor inn på bordet</DragHint>
                </>
            }
            scene={
                <>
                    <CameraRig
                        to={[8, 7, 9]}
                        lookAt={[0, 0.8, 0]}
                        active={!introDone}
                        onArrive={() => setIntroDone(true)}
                    />
                    <FactorySite
                        placed={placed}
                        location={location}
                        productLive={productLive}
                        burst={burst}
                        onDropFactor={dropFactor}
                    />
                </>
            }
        >
            {phase === 'build' && (
                <div className="flex flex-col gap-2.5">
                    <StepTracker current={placed.length} total={FACTORS.length} />
                    <p className="text-sm text-slate-600">
                        En vare lages ikke av én ting alene. Dra mennesker, råvare og maskin inn på
                        bordet ved kysten.
                    </p>
                    {fact && <SceneFact>{fact}</SceneFact>}
                </div>
            )}

            {(phase === 'location' || phase === 'done') && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-sm font-bold text-slate-700">
                            Flytt fabrikken: hvor skal den ligge?
                        </span>
                        <CompareToggle
                            labelA="Ved kysten"
                            labelB="Innlandet"
                            value={location}
                            onChange={changeLocation}
                        />
                    </div>

                    {phase === 'location' ? (
                        <div className="rounded-xl border border-amber-200 bg-white p-3 sm:flex sm:items-center sm:gap-4">
                            <p className="text-xs text-slate-600 leading-relaxed min-w-0 flex-1">
                                {location === 'a' ? (
                                    <>
                                        <span className="font-bold text-slate-800">
                                            Lokasjonen er den fjerde faktoren.
                                        </span>{' '}
                                        Ved kysten er laksen billig og rett ved hånden. Prøv å flytte
                                        fabrikken innland og se hva som skjer.
                                    </>
                                ) : (
                                    <>
                                        <span className="font-bold text-slate-800">
                                            Samme mennesker, samme maskin - men ingen kyst.
                                        </span>{' '}
                                        Råvaren må fraktes langt og blir dyr. Derfor lønner laksefilet
                                        seg ved kysten, ikke her.
                                    </>
                                )}
                            </p>
                            <button
                                onClick={finish}
                                disabled={!triedInnland}
                                className="mt-2.5 sm:mt-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Factory className="w-4 h-4" />
                                Jeg skjønner det
                            </button>
                        </div>
                    ) : (
                        <WinScreen title="Du blandet oppskriften!" onReplay={reset}>
                            Produksjon er alltid en miks av mennesker, råvarer, maskiner og
                            lokasjon. Fordi miksen er forskjellig fra sted til sted, er ulike steder
                            billigst til ulike varer. Det er akkurat derfor land spesialiserer seg
                            og bytter med hverandre.
                        </WinScreen>
                    )}
                </div>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function FactorySite({
    placed,
    location,
    productLive,
    burst,
    onDropFactor,
}: {
    placed: FactorId[];
    location: 'a' | 'b';
    productLive: boolean;
    burst: number;
    onDropFactor: (id: FactorId) => (pos: THREE.Vector3) => boolean;
}) {
    const atCoast = location === 'a';

    return (
        <group>
            {/* Grunn: grønn forgrunn der bordet står */}
            <GroundPlane size={40} depth={34} color={atCoast ? '#8aa35a' : '#9aab63'} />

            {/* Havet (kun ved kysten) - merd med fisk ligger her */}
            <Sea show={atCoast} />

            {/* Produksjonsbordet i midten */}
            <Bench />

            {/* Ghost-mål oppå bordet før noe er plassert */}
            {placed.length === 0 && (
                <mesh position={[0, 0.92, 0]}>
                    <boxGeometry args={[1.7, 0.05, 1.1]} />
                    <meshStandardMaterial color="#ffffff" transparent opacity={0.25} depthWrite={false} />
                </mesh>
            )}

            {/* De tre flyttbare faktorene */}
            {FACTORS.map((f) => {
                const isPlaced = placed.includes(f.id);
                if (isPlaced) return <PlacedFactor key={f.id} id={f.id} location={location} />;
                return (
                    <Draggable
                        key={f.id}
                        position={f.start}
                        planeY={0}
                        bounds={{ minX: -6, maxX: 6, minZ: -2, maxZ: 6 }}
                        onDrop={onDropFactor(f.id)}
                        liftY={0.6}
                    >
                        {/* Romslig usynlig gripeflate for trackpad */}
                        <mesh position={[0, 0.6, 0]}>
                            <boxGeometry args={[1.6, 1.6, 1.6]} />
                            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                        </mesh>
                        <FactorMesh id={f.id} loose />
                    </Draggable>
                );
            })}

            {/* Det ferdige produktet (laksefilet i kasse) - kun når alt er på plass OG ved kysten */}
            <Product show={productLive} />
            <Burst position={[0, 1.7, 0]} trigger={burst} color="#f7b7a3" count={28} spread={3} />
        </group>
    );
}

// Produksjonsbordet.
function Bench() {
    return (
        <group>
            <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
                <boxGeometry args={[2, 0.16, 1.3]} />
                <meshStandardMaterial color="#9a7b52" roughness={0.85} />
            </mesh>
            {[
                [-0.85, -0.5],
                [0.85, -0.5],
                [-0.85, 0.5],
                [0.85, 0.5],
            ].map(([x, z], i) => (
                <mesh key={i} position={[x, 0.4, z]} castShadow>
                    <boxGeometry args={[0.14, 0.8, 0.14]} />
                    <meshStandardMaterial color="#6b5436" roughness={0.9} />
                </mesh>
            ))}
        </group>
    );
}

// Havet med oppdrettsmerd og et par fisk. Glir bort når fabrikken flyttes innland.
function Sea({ show }: { show: boolean }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        const targetY = show ? 0 : -3;
        ref.current.position.y = damp(ref.current.position.y, targetY, dt, 1.4);
        const s = show ? 1 : 0.6;
        ref.current.scale.x = damp(ref.current.scale.x, s, dt, 2);
        ref.current.scale.z = damp(ref.current.scale.z, s, dt, 2);
    });
    return (
        <group ref={ref}>
            <WaterPlane position={[0, 0.02, -9]} size={[26, 16]} color="#3d7fa6" />
            {/* Oppdrettsmerd (ring) */}
            <mesh position={[-3, 0.2, -8]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[1.3, 0.16, 8, 20]} />
                <meshStandardMaterial color="#3a3f47" roughness={0.7} />
            </mesh>
            <mesh position={[3, 0.2, -8.5]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[1.3, 0.16, 8, 20]} />
                <meshStandardMaterial color="#3a3f47" roughness={0.7} />
            </mesh>
        </group>
    );
}

// Installert faktor i sin faste posisjon på/ved bordet.
function PlacedFactor({ id, location }: { id: FactorId; location: 'a' | 'b' }) {
    if (id === 'mennesker') {
        return <Person position={[-1.7, 0, 0.7]} rotation={[0, Math.PI / 2.4, 0]} body="#3f6f8a" hat="cap" hatColor="#d8a13a" />;
    }
    if (id === 'maskin') {
        return <Machine position={[0.55, 0.93, 0]} />;
    }
    // råvare: fersk laks på bordet - forsvinner innland (ingen kyst => ingen råvare)
    return <RawFish position={[-0.55, 1.0, 0]} available={location === 'a'} />;
}

// Faktor-mesh i "løs" form (mens den dras).
function FactorMesh({ id, loose }: { id: FactorId; loose?: boolean }) {
    const y = loose ? 0.5 : 0;
    if (id === 'mennesker') {
        return <Person position={[0, y, 0]} body="#3f6f8a" hat="cap" hatColor="#d8a13a" />;
    }
    if (id === 'maskin') {
        return <Machine position={[0, y + 0.3, 0]} />;
    }
    return (
        <group position={[0, y + 0.3, 0]}>
            <RawFish position={[0, 0, 0]} available />
        </group>
    );
}

// Liten lavpoly-maskin: kabinett + roterende tannhjul foran.
function Machine({ position }: { position: [number, number, number] }) {
    const gear = useRef<THREE.Mesh>(null);
    useFrame((_, dt) => {
        if (gear.current) gear.current.rotation.z += dt * 1.6;
    });
    return (
        <group position={position}>
            <mesh castShadow>
                <boxGeometry args={[0.7, 0.7, 0.6]} />
                <meshStandardMaterial color="#5b6470" roughness={0.6} metalness={0.3} />
            </mesh>
            <mesh ref={gear} position={[0, 0.05, 0.32]}>
                <cylinderGeometry args={[0.26, 0.26, 0.1, 10]} />
                <meshStandardMaterial color="#c0c6cd" roughness={0.4} metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.25, 6]} />
                <meshStandardMaterial color="#3a3f47" />
            </mesh>
        </group>
    );
}

// Råvaren: en laks. `available=false` (innland) demper den bort.
function RawFish({ position, available }: { position: [number, number, number]; available: boolean }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        const target = available ? 1 : 0.001;
        ref.current.scale.x = damp(ref.current.scale.x, target, dt, 5);
        ref.current.scale.y = damp(ref.current.scale.y, target, dt, 5);
        ref.current.scale.z = damp(ref.current.scale.z, target, dt, 5);
    });
    return (
        <group ref={ref} position={position}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <capsuleGeometry args={[0.16, 0.5, 4, 8]} />
                <meshStandardMaterial color="#9aa6b0" roughness={0.5} />
            </mesh>
            {/* rosa stripe */}
            <mesh position={[0, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
                <meshStandardMaterial color="#e8836b" roughness={0.6} />
            </mesh>
            {/* hale */}
            <mesh position={[-0.42, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <coneGeometry args={[0.2, 0.3, 4]} />
                <meshStandardMaterial color="#9aa6b0" roughness={0.5} />
            </mesh>
        </group>
    );
}

// Ferdig produkt: pakket laksefilet. Spretter fram når alt er på plass ved kysten.
function Product({ show }: { show: boolean }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        const target = show ? 1 : 0.001;
        ref.current.scale.x = damp(ref.current.scale.x, target, dt, 6);
        ref.current.scale.y = damp(ref.current.scale.y, target, dt, 6);
        ref.current.scale.z = damp(ref.current.scale.z, target, dt, 6);
        ref.current.rotation.y += dt * 0.5;
    });
    return (
        <group ref={ref} position={[0, 1.25, 0]} scale={0.001}>
            {/* kasse */}
            <mesh castShadow>
                <boxGeometry args={[0.8, 0.3, 0.5]} />
                <meshStandardMaterial color="#e7ddc8" roughness={0.8} />
            </mesh>
            {/* filet oppå */}
            <mesh position={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[0.6, 0.12, 0.32]} />
                <meshStandardMaterial color="#ef8e72" roughness={0.6} />
            </mesh>
        </group>
    );
}

export default Produksjonsoppskriften3D;
