import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Draggable,
    WaterPlane,
    GroundPlane,
    Boat,
    Banner,
    Person,
    SceneBanner,
    SceneBadge,
    DragHint,
    WinScreen,
    DataReadout,
    StepTracker,
    Burst,
    damp,
    useAmbience,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til artikkelen om Songhai-riket.
// Songhai var et elve-rike. Eleven drar krigsbater fra hjemmehavna i Gao opp
// langs Niger til de tre store byene (Gao, Timbuktu, Djenne). For hver by som
// kommer under Songhai, reiser et flagg seg, husene vokser og riket utvider seg
// langs elva. Lyspaera: kontroll over Niger og handelsbyene gjorde Songhai til
// det storste riket Afrika har sett. Mekanikken ER poenget - elva bant riket
// sammen.

const TOTAL = 3;

interface CityDef {
    id: string;
    name: string;
    // Hvor byen ligger pa elvebredden (xz).
    slot: [number, number];
    // Hvor baten starter foran i bildet.
    shore: [number, number];
    body: string;
}

const CITIES: CityDef[] = [
    { id: 'gao', name: 'Gao', slot: [4.6, -0.6], shore: [-4.8, 7.2], body: '#cf9f63' },
    { id: 'timbuktu', name: 'Timbuktu', slot: [0, -3.0], shore: [0, 7.8], body: '#d9b27a' },
    { id: 'djenne', name: 'Djenne', slot: [-4.6, -0.6], shore: [4.8, 7.2], body: '#c79456' },
];

const RiketLangsNiger3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const ambience = useAmbience('waves');
    const [held, setHeld] = useState<boolean[]>(() => Array(TOTAL).fill(false));
    const [burst, setBurst] = useState(0);
    const [banner, setBanner] = useState<string | null>(
        'Dra en krigsbat oppover Niger til den lysende havna ved en by.'
    );

    const placed = held.filter(Boolean).length;
    const done = placed >= TOTAL;
    const people = 400000 + placed * 1200000; // riket vokser

    const reach = (i: number) => {
        ambience.start();
        setHeld((prev) => {
            if (prev[i]) return prev;
            const next = prev.slice();
            next[i] = true;
            const n = next.filter(Boolean).length;
            setBurst((b) => b + 1);
            if (n >= TOTAL) {
                sounds.play('complete');
                setBanner(null);
                setTimeout(() => onComplete({ score: 1, completed: true }), 250);
            } else {
                sounds.play('correct');
                setBanner(`${CITIES[i].name} er na en del av Songhai! Send neste bat videre.`);
            }
            return next;
        });
    };

    const reset = () => {
        setHeld(Array(TOTAL).fill(false));
        setBanner('Dra en krigsbat oppover Niger til den lysende havna ved en by.');
    };

    const idle = placed === 0;

    return (
        <MicroGameScaffold
            title="Bygg riket langs Niger"
            subtitle="Dra Songhais krigsbater opp elva og knytt de tre store byene sammen til ett rike"
            estimatedSeconds={120}
            onRetry={placed > 0 ? reset : undefined}
            canvas={{
                idle,
                camera: { position: [0, 9.5, 12.5], fov: 42 },
                background: '#e7d3a6',
                fog: { near: 26, far: 54 },
                target: [0, 0.4, 0.5],
            }}
            containerClassName="bg-gradient-to-b from-[#e7d3a6] via-[#ecdcb4] to-[#cdb482]"
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {done ? 'Songhai star sterkt' : 'Songhai-riket — ca. 1500'}
                    </SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[
                            { label: 'Byer i riket', value: `${placed}/${TOTAL}` },
                            { label: 'Innbyggere', value: people.toLocaleString('no') },
                        ]}
                    />
                    <DragHint show={idle} corner="bc">
                        Dra en bat opp til en lysende havn
                    </DragHint>
                </>
            }
            scene={<RiverEmpire held={held} burst={burst} onReach={reach} />}
        >
            <div className="flex flex-col gap-3">
                {!done ? (
                    <>
                        <StepTracker current={placed} total={TOTAL} />
                        <p className="text-sm text-slate-600 leading-snug">
                            Niger er elva som binder Vest-Afrika sammen. Songhai bygde en{' '}
                            <span className="font-bold text-amber-700">krigsflate</span> av lange
                            elvebater. Dra hver bat opp til en by. For hver by som kommer under
                            Songhai, reiser flagget seg og riket vokser.
                        </p>
                    </>
                ) : (
                    <WinScreen title="Afrikas storste rike star ferdig!" onReplay={reset}>
                        Med kontroll over Niger og handelsbyene Gao, Timbuktu og Djenne ble Songhai
                        det storste riket Afrika har sett. Elva var rikets motorvei: bater fraktet
                        salt, gull, korn og soldater mellom byene. Det var ikke erobring alene, men
                        kontroll over elva og handelen, som gjorde riket sa mektig.
                    </WinScreen>
                )}
            </div>
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function RiverEmpire({
    held,
    burst,
    onReach,
}: {
    held: boolean[];
    burst: number;
    onReach: (i: number) => void;
}) {
    return (
        <group>
            {/* Tort, sandfarget land rundt elva */}
            <GroundPlane size={32} depth={32} color="#d8bd84" />

            {/* Niger-buen: tre brede vannband som danner en boge */}
            <WaterPlane position={[-4.6, 0.02, -0.6]} size={[7, 3.4]} color="#3f8fae" />
            <WaterPlane position={[0, 0.02, -2.6]} size={[10, 3.2]} color="#3f8fae" />
            <WaterPlane position={[4.6, 0.02, -0.6]} size={[7, 3.4]} color="#3f8fae" />
            {/* elveband som forer batene ned mot start */}
            <WaterPlane position={[0, 0.02, 4.5]} size={[4.2, 11]} color="#3f8fae" />

            {/* Byene pa bredden */}
            {CITIES.map((c, i) => (
                <CityCluster key={c.id} city={c} active={held[i]} />
            ))}

            {/* Tomme havner: pulserende ring viser hvor neste bat skal */}
            {CITIES.map((c, i) =>
                held[i] ? null : <DockMarker key={c.id} position={[c.slot[0], 0.06, c.slot[1] + 1.1]} />
            )}

            {/* Krigsbatene eleven drar opp elva. Hver har sin egen by. */}
            {CITIES.map((c, i) => (
                <Draggable
                    key={c.id}
                    position={[c.shore[0], 0.18, c.shore[1]]}
                    planeY={0.18}
                    snapPoints={[[c.slot[0], c.slot[1] + 1.1]]}
                    snapRadius={2.4}
                    liftY={0.4}
                    onSnap={() => onReach(i)}
                >
                    {/* Romslig usynlig gripeflate for trygg trackpad-treffing */}
                    <mesh>
                        <boxGeometry args={[2.4, 1.4, 2.8]} />
                        <meshBasicMaterial transparent opacity={0} />
                    </mesh>
                    <group rotation={[0, Math.PI, 0]} scale={1.1}>
                        <Boat color={held[i] ? '#7a4a24' : '#6b4a2c'} sail="#c45b2e" />
                    </group>
                </Draggable>
            ))}

            {/* Feiringspartikler nar en by kommer under riket */}
            <Burst position={[0, 1.6, -1]} trigger={burst} color="#f2c14e" count={24} spread={2.6} />
        </group>
    );
}

// En by pa elvebredden: hus som vokser + et flagg som reiser seg nar byen
// kommer under Songhai.
function CityCluster({ city, active }: { city: CityDef; active: boolean }) {
    const [x, z] = city.slot;
    return (
        <group position={[x, 0, z]}>
            <GrowingHouse offset={[-0.9, 0]} maxH={1.3} w={1.0} color={city.body} active={active} />
            <GrowingHouse offset={[0.5, 0.3]} maxH={1.7} w={1.1} color={city.body} active={active} />
            <GrowingHouse offset={[0.1, -0.9]} maxH={1.0} w={0.85} color={city.body} active={active} />
            <RaisingBanner active={active} />
            {active && <Person position={[-0.2, 0, 1.2]} body="#3f6f4a" skin="#7a4a2c" pose="raise" />}
        </group>
    );
}

// Et hus som reiser seg fra bakken nar byen aktiveres.
function GrowingHouse({
    offset,
    maxH,
    w,
    color,
    active,
}: {
    offset: [number, number];
    maxH: number;
    w: number;
    color: string;
    active: boolean;
}) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        const target = active ? maxH : 0.06;
        const h = damp(ref.current.scale.y, target, dt, 4);
        ref.current.scale.y = h;
        ref.current.position.y = h / 2;
    });
    return (
        <mesh ref={ref} position={[offset[0], 0, offset[1]]} castShadow receiveShadow>
            <boxGeometry args={[w, 1, w]} />
            <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
    );
}

// Songhai-flagget som reiser seg nar byen kommer under riket.
function RaisingBanner({ active }: { active: boolean }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        const target = active ? 1 : 0.001;
        const s = damp(ref.current.scale.y, target, dt, 5);
        ref.current.scale.y = s;
    });
    return (
        <group ref={ref} position={[0, 0, 0.2]}>
            <Banner color="#1f6f54" height={2.2} />
        </group>
    );
}

// Pulsende ring som markerer en ledig havn.
function DockMarker({ position }: { position: [number, number, number] }) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (!ref.current) return;
        ref.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 3) * 0.12);
    });
    return (
        <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.95, 0.11, 10, 28]} />
            <meshStandardMaterial
                color="#f2c14e"
                emissive="#d99a2b"
                emissiveIntensity={0.6}
                roughness={0.4}
            />
        </mesh>
    );
}

export default RiketLangsNiger3D;
