import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    GroundPlane,
    Figure,
    SceneBanner,
    SceneBadge,
    DragHint,
    SceneFact,
    WinScreen,
    DataReadout,
    StepTracker,
    damp,
    Burst,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til "Det føydale Japan". Eleven dyrker rismarkene i en daimyos len.
// For hver rismark som plantes stiger koku (rismålet rikdommen ble målt i), borgen
// vokser en etasje, og en ny samurai stiller seg på plass foran porten.
// Lyspæra: makt i føydale Japan var bygd på ris. Jo mer ris en daimyo kunne høste,
// desto flere samuraier kunne han fø, og desto mektigere var han.

const TOTAL = 6; // antall rismarker
const KOKU_PER = 100; // koku per rismark

// Plassering av de seks rismarkene foran borgen (x, z).
const PADDIES: [number, number][] = [
    [-3.2, 3.6],
    [0, 4.2],
    [3.2, 3.6],
    [-4.4, 1.4],
    [0, 1.0],
    [4.4, 1.4],
];

// Faste plasser for samuraiene langs porten (vokser med høsten).
const SAMURAI_SLOTS: [number, number][] = [
    [-1.8, -1.2],
    [1.8, -1.2],
    [-2.8, -0.2],
    [2.8, -0.2],
    [-1.0, -2.0],
    [1.0, -2.0],
];

const RismarkOgMakt3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [planted, setPlanted] = useState<boolean[]>(() => Array(TOTAL).fill(false));
    const [banner, setBanner] = useState<string | null>(
        'Klikk de tørre rismarkene for å dyrke dem. Se hva risen gjør med makten.'
    );
    const [fact, setFact] = useState<string | null>(null);
    const [burst, setBurst] = useState(0);

    const count = planted.filter(Boolean).length;
    const koku = count * KOKU_PER;
    const done = count >= TOTAL;

    const reset = () => {
        setPlanted(Array(TOTAL).fill(false));
        setBanner('Klikk de tørre rismarkene for å dyrke dem. Se hva risen gjør med makten.');
        setFact(null);
    };

    const plant = (i: number) => {
        if (planted[i]) return;
        const next = planted.slice();
        next[i] = true;
        const newCount = next.length && next.filter(Boolean).length;
        setPlanted(next);
        setBurst((b) => b + 1);

        if (newCount >= TOTAL) {
            sounds.play('complete');
            setBanner(null);
            setFact(null);
            setTimeout(() => onComplete({ score: 1, completed: true }), 250);
            return;
        }
        sounds.play('advance');
        if (newCount === 1) {
            setFact(
                'Første rismark gir 100 koku. Koku var sekker med ris, og rikdom ble målt i nettopp koku, ikke i penger.'
            );
            setBanner('Borgen reiser seg, og en samurai stiller seg ved porten.');
        } else if (newCount === 3) {
            setFact(
                'Samuraiene fikk lønn i ris, ikke mynt. Jo mer ris daimyoen høstet, desto flere krigere kunne han holde.'
            );
            setBanner('Mer ris betyr flere samuraier og en høyere borg.');
        } else {
            setBanner('Mer ris betyr flere samuraier og en høyere borg.');
        }
    };

    const idle = count === 0;

    return (
        <MicroGameScaffold
            title="Dyrk lenet, fø samuraiene"
            subtitle="Klikk rismarkene rundt borgen og se makten vokse med hver høst"
            estimatedSeconds={140}
            onRetry={count > 0 ? reset : undefined}
            canvas={{
                idle,
                camera: { position: [0, 7, 12], fov: 42 },
                background: '#cfe6c4',
                fog: { near: 22, far: 50 },
                target: [0, 1, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {done ? 'Et mektig len' : 'Daimyoens len'}
                    </SceneBadge>
                    {!done && (
                        <DataReadout
                            corner="bl"
                            items={[
                                { label: 'Rismarker dyrket', value: count, unit: `/${TOTAL}` },
                                { label: 'Ris i lager', value: koku, unit: 'koku' },
                                { label: 'Samurai du kan fø', value: count },
                            ]}
                        />
                    )}
                    <DragHint show={idle} corner="bc">
                        Klikk de pulserende ringene på rismarkene
                    </DragHint>
                </>
            }
            scene={<Domain planted={planted} count={count} burst={burst} onPlant={plant} />}
        >
            <div className="flex flex-col gap-3">
                {!done && <StepTracker current={count} total={TOTAL} />}
                {!done ? (
                    <>
                        <p className="text-sm text-slate-600 leading-snug">
                            Klikk en tørr rismark for å plante ris. For hver mark fylles lageret med{' '}
                            <span className="font-bold text-emerald-700">koku</span>, borgen vokser,
                            og en ny <span className="font-bold text-sky-700">samurai</span> kan få
                            lønn i ris. Slik var rikdom det samme som makt i føydale Japan.
                        </p>
                        {fact && <SceneFact>{fact}</SceneFact>}
                    </>
                ) : (
                    <WinScreen title="Lenet blomstrer!" onReplay={reset}>
                        Du fylte lageret med {TOTAL * KOKU_PER} koku og kan nå fø {TOTAL} samuraier.
                        Det var nettopp dette makten i føydale Japan hvilte på: ris. En daimyo ble
                        rangert etter hvor mange koku landet hans ga, for risen betalte krigerne som
                        ga ham makt. Bøndene som dyrket den, sto lavt i rang, men uten dem stoppet
                        hele samfunnet.
                    </WinScreen>
                )}
            </div>
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function Domain({
    planted,
    count,
    burst,
    onPlant,
}: {
    planted: boolean[];
    count: number;
    burst: number;
    onPlant: (i: number) => void;
}) {
    return (
        <group>
            <GroundPlane size={50} depth={46} color="#a9cf99" />

            {/* Borgen i bakkant */}
            <group position={[0, 0, -3.4]}>
                <Tenshu count={count} />
                <Burst position={[0, 4.2, 0]} trigger={burst} color="#fde68a" count={20} spread={2.2} />
            </group>

            {/* Rismarkene */}
            {PADDIES.map((p, i) => (
                <group key={i} position={[p[0], 0, p[1]]}>
                    <Paddy planted={planted[i]} />
                    {!planted[i] && (
                        <Hotspot
                            position={[0, 0.8, 0]}
                            onSelect={() => onPlant(i)}
                            label="Plant ris"
                            radius={0.55}
                            color="#15803d"
                        />
                    )}
                </group>
            ))}

            {/* Samuraiene som vokser med høsten */}
            {SAMURAI_SLOTS.slice(0, count).map((p, i) => (
                <SamuraiFigure key={i} position={[p[0], 0, p[1]]} index={i} />
            ))}
        </group>
    );
}

// En rismark: brun jord alltid, vann + grønne riskorn som vokser fram når plantet.
function Paddy({ planted }: { planted: boolean }) {
    const water = useRef<THREE.Mesh>(null);
    const rice = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        const target = planted ? 1 : 0;
        if (water.current) {
            const s = damp(water.current.scale.x, target, dt, 6);
            water.current.scale.set(s, s, 1);
        }
        if (rice.current) {
            const s = damp(rice.current.scale.y, target, dt, 5);
            rice.current.scale.set(1, Math.max(s, 0.001), 1);
        }
    });
    return (
        <group>
            {/* Jordvoll rundt marken */}
            <mesh position={[0, 0.08, 0]} receiveShadow>
                <boxGeometry args={[2.2, 0.16, 2.2]} />
                <meshStandardMaterial color="#8a6d4b" roughness={1} flatShading />
            </mesh>
            {/* Vann som fyller marken */}
            <mesh ref={water} position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.9, 1.9]} />
                <meshStandardMaterial
                    color="#5aa9d6"
                    transparent
                    opacity={0.85}
                    roughness={0.3}
                    metalness={0.1}
                />
            </mesh>
            {/* Riskorn i rader */}
            <group ref={rice} position={[0, 0.2, 0]}>
                {RICE_SPOTS.map((s, i) => (
                    <mesh key={i} position={[s[0], 0.25, s[1]]} castShadow>
                        <cylinderGeometry args={[0.04, 0.07, 0.5, 5]} />
                        <meshStandardMaterial color="#7cbf4a" roughness={0.9} flatShading />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

const RICE_SPOTS: [number, number][] = (() => {
    const out: [number, number][] = [];
    for (let x = -0.7; x <= 0.7; x += 0.7) {
        for (let z = -0.7; z <= 0.7; z += 0.7) {
            out.push([x, z]);
        }
    }
    return out;
})();

// En japansk borg (tenshu) som reiser seg etasje for etasje med høsten.
function Tenshu({ count }: { count: number }) {
    // Antall synlige etasjer (1-3) avhengig av hvor mye ris som er dyrket.
    const tiers = count >= 5 ? 3 : count >= 3 ? 2 : count >= 1 ? 1 : 0;
    return (
        <group>
            {/* Steinsokkel - alltid der */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.4, 1.0, 3.4]} />
                <meshStandardMaterial color="#9ca3af" roughness={1} flatShading />
            </mesh>
            <CastleTier show={tiers >= 1} y={1.6} size={2.6} height={1.1} roof="#7f1d1d" />
            <CastleTier show={tiers >= 2} y={2.9} size={2.0} height={1.0} roof="#7f1d1d" />
            <CastleTier show={tiers >= 3} y={4.0} size={1.4} height={0.9} roof="#b45309" gold />
        </group>
    );
}

// En enkelt borg-etasje med vegg og utstikkende tak. Vokser fram (skala) når synlig.
function CastleTier({
    show,
    y,
    size,
    height,
    roof,
    gold = false,
}: {
    show: boolean;
    y: number;
    size: number;
    height: number;
    roof: string;
    gold?: boolean;
}) {
    const g = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!g.current) return;
        const s = damp(g.current.scale.x, show ? 1 : 0.001, dt, 6);
        g.current.scale.setScalar(s);
    });
    return (
        <group ref={g} position={[0, y, 0]} scale={0.001}>
            {/* Vegg */}
            <mesh castShadow>
                <boxGeometry args={[size, height, size]} />
                <meshStandardMaterial color={gold ? '#f5e6c8' : '#efe7d8'} roughness={0.9} flatShading />
            </mesh>
            {/* Utstikkende tak */}
            <mesh position={[0, height / 2 + 0.18, 0]} castShadow>
                <boxGeometry args={[size + 0.7, 0.35, size + 0.7]} />
                <meshStandardMaterial color={roof} roughness={0.8} flatShading />
            </mesh>
        </group>
    );
}

// En samurai med en liten idle-vugging. Bærer to "sverd" antydet med tynne bokser.
function SamuraiFigure({ position, index }: { position: [number, number, number]; index: number }) {
    const ref = useRef<THREE.Group>(null);
    const body = index % 2 === 0 ? '#3b3a4a' : '#4a2f2f';
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = clock.getElapsedTime() * 1.4 + index * 0.5;
        ref.current.position.y = Math.sin(t) * 0.04;
    });
    return (
        <group position={position} rotation={[0, Math.PI, 0]}>
            <group ref={ref}>
                <Figure body={body} skin="#e6c39a">
                    {/* to sverd ved hoften */}
                    <mesh position={[0.28, 0.4, 0]} rotation={[0, 0, 0.4]}>
                        <boxGeometry args={[0.04, 0.7, 0.04]} />
                        <meshStandardMaterial color="#d1d5db" metalness={0.4} roughness={0.4} />
                    </mesh>
                    <mesh position={[0.32, 0.35, 0]} rotation={[0, 0, 0.5]}>
                        <boxGeometry args={[0.03, 0.5, 0.03]} />
                        <meshStandardMaterial color="#9ca3af" metalness={0.4} roughness={0.4} />
                    </mesh>
                </Figure>
            </group>
        </group>
    );
}

export default RismarkOgMakt3D;
