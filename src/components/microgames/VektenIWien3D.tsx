import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Draggable,
    GroundPlane,
    SceneBanner,
    SceneBadge,
    DataReadout,
    WinScreen,
    Burst,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Lyspære: det krevde flere stormakter SAMMEN for å balansere én sterk stat.
// Eleven drar de fire koalisjonsmaktene opp på vekten mot Frankrike, og kjenner
// fysisk at vippen først blir vannrett når alle fire er på plass. Slik holdt
// maktbalansen Europa stabilt etter Napoleon.

const FRANCE_W = 4;
const SLOT_X = 3.0;

interface Power {
    id: string;
    short: string;
    color: string;
    home: [number, number, number];
    slotZ: number;
}

// Den firedoble allianse mot Frankrike.
const COALITION: Power[] = [
    { id: 'storbritannia', short: 'Storbritannia', color: '#2563eb', home: [-3.2, 0, 5.4], slotZ: -1.35 },
    { id: 'russland', short: 'Russland', color: '#059669', home: [-1.1, 0, 6.0], slotZ: -0.45 },
    { id: 'preussen', short: 'Preussen', color: '#475569', home: [1.1, 0, 6.0], slotZ: 0.45 },
    { id: 'osterrike', short: 'Østerrike', color: '#d97706', home: [3.2, 0, 5.4], slotZ: 1.35 },
];

function Plank({
    placedCount,
    children,
}: {
    placedCount: number;
    children: React.ReactNode;
}) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        // Tyngste side synker: Frankrike (venstre) drar ned til koalisjonen veier like mye.
        const target = (FRANCE_W - placedCount) * 0.085;
        ref.current.rotation.z = damp(ref.current.rotation.z, target, dt, 4);
    });
    return (
        <group ref={ref} position={[0, 1.75, 0]}>
            {children}
        </group>
    );
}

function FrancePedestal({ balanced }: { balanced: boolean }) {
    return (
        <group position={[-SLOT_X, 0, 0]}>
            <mesh position={[0, 0.6, 0]} castShadow>
                <boxGeometry args={[1.4, 1.2, 1.4]} />
                <meshStandardMaterial
                    color="#b91c1c"
                    emissive={balanced ? '#10b981' : '#7f1d1d'}
                    emissiveIntensity={balanced ? 0.35 : 0.15}
                />
            </mesh>
            {/* Liten krone-knott på toppen */}
            <mesh position={[0, 1.35, 0]} castShadow>
                <coneGeometry args={[0.35, 0.5, 4]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.4} roughness={0.4} />
            </mesh>
        </group>
    );
}

function PowerCube({ color }: { color: string }) {
    return (
        <group>
            {/* Romslig usynlig gripeflate for trygg trackpad-treffing */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1.7, 1.7, 1.7]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
            <mesh position={[0, 0.4, 0]} castShadow>
                <boxGeometry args={[0.85, 0.85, 0.85]} />
                <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
        </group>
    );
}

function Scene({
    placedIds,
    onPlace,
    balanced,
    burstTrigger,
}: {
    placedIds: string[];
    onPlace: (id: string) => void;
    balanced: boolean;
    burstTrigger: number;
}) {
    const placedCount = placedIds.length;
    return (
        <group>
            <GroundPlane color="#cdb892" size={40} depth={30} />

            {/* Vippen */}
            <mesh position={[0, 0.85, 0]} castShadow>
                <coneGeometry args={[0.9, 1.7, 4]} />
                <meshStandardMaterial color="#8a6d3b" roughness={0.8} />
            </mesh>
            <Plank placedCount={placedCount}>
                <mesh castShadow>
                    <boxGeometry args={[7.4, 0.3, 1.1]} />
                    <meshStandardMaterial
                        color={balanced ? '#10b981' : '#a8743a'}
                        emissive={balanced ? '#10b981' : '#000000'}
                        emissiveIntensity={balanced ? 0.3 : 0}
                        roughness={0.7}
                    />
                </mesh>
                <FrancePedestal balanced={balanced} />
                {COALITION.filter((c) => placedIds.includes(c.id)).map((c) => (
                    <mesh key={c.id} position={[SLOT_X, 0.55, c.slotZ]} castShadow>
                        <boxGeometry args={[0.85, 0.85, 0.85]} />
                        <meshStandardMaterial color={c.color} roughness={0.5} />
                    </mesh>
                ))}
            </Plank>

            {/* Tomme målmarkører på bakken under høyre ende */}
            {COALITION.filter((c) => !placedIds.includes(c.id)).map((c) => (
                <mesh
                    key={c.id}
                    position={[SLOT_X, 0.03, c.slotZ]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <ringGeometry args={[0.45, 0.62, 24]} />
                    <meshBasicMaterial color="#f59e0b" transparent opacity={0.55} />
                </mesh>
            ))}

            {/* Draggable koalisjonsmakter som ennå ikke er plassert */}
            {COALITION.filter((c) => !placedIds.includes(c.id)).map((c) => (
                <Draggable
                    key={c.id}
                    position={c.home}
                    snapPoints={[[SLOT_X, c.slotZ]]}
                    snapRadius={2.6}
                    onSnap={() => onPlace(c.id)}
                >
                    <PowerCube color={c.color} />
                </Draggable>
            ))}

            <Burst position={[SLOT_X, 2.4, 0]} trigger={burstTrigger} color="#10b981" />
        </group>
    );
}

export default function VektenIWien3D({ onComplete, onRetry }: MicroGameProps) {
    const [placedIds, setPlacedIds] = useState<string[]>([]);
    const [won, setWon] = useState(false);
    const [burstTrigger, setBurstTrigger] = useState(0);
    const sounds = useStepSounds();
    const completedRef = useRef(false);

    const balanced = placedIds.length === FRANCE_W;

    const place = (id: string) => {
        if (placedIds.includes(id)) return;
        const next = [...placedIds, id];
        setPlacedIds(next);
        if (next.length === FRANCE_W && !completedRef.current) {
            completedRef.current = true;
            setWon(true);
            setBurstTrigger((t) => t + 1);
            sounds.play('complete');
            onComplete({ score: 1, completed: true });
        } else {
            sounds.play('drop');
        }
    };

    const reset = () => {
        setPlacedIds([]);
        setWon(false);
        completedRef.current = false;
        onRetry?.();
    };

    const banner = won
        ? 'Vekten er i balanse. Ingen makt er sterk nok til å herske alene.'
        : placedIds.length === 0
          ? 'Dra de fire stormaktene opp på den tomme siden av vekten.'
          : `Koalisjonen veier ${placedIds.length} av ${FRANCE_W}. Frankrike er fortsatt tyngst.`;

    return (
        <MicroGameScaffold
            title="Vekten i Wien"
            subtitle="Balanser Frankrike ved å samle stormaktene mot det."
            estimatedSeconds={90}
            onRetry={reset}
            scene={
                <Scene
                    placedIds={placedIds}
                    onPlace={place}
                    balanced={balanced}
                    burstTrigger={burstTrigger}
                />
            }
            canvas={{
                camera: { position: [0, 6.5, 12.5], fov: 42 },
                background: '#cfe6f5',
                target: [0, 1.6, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <DataReadout
                        corner="bl"
                        items={[
                            { label: 'Frankrike', value: FRANCE_W },
                            { label: 'Koalisjon', value: placedIds.length },
                        ]}
                    />
                    <SceneBadge corner="br">Wien 1815</SceneBadge>
                </>
            }
        >
            {won ? (
                <WinScreen title="Maktbalanse oppnådd!" onReplay={reset}>
                    Det tok alle fire stormaktene sammen å balansere Frankrike. Slik tenkte
                    diplomatene i Wien: ingen stat skulle bli sterk nok til å herske over resten.
                    Denne maktbalansen holdt Europa uten storkrig i nesten hundre år.
                </WinScreen>
            ) : (
                <p className="text-sm text-slate-600 leading-relaxed">
                    Frankrike ble svært sterkt under Napoleon. Storbritannia, Russland, Preussen og
                    Østerrike gikk derfor sammen. Dra hver makt opp på vekten og se når den blir
                    vannrett.
                </p>
            )}
        </MicroGameScaffold>
    );
}
