import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    SceneBanner,
    SceneBadge,
    WinScreen,
    DataReadout,
    Burst,
    Figure,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: velferdsstaten som spleiselag. En felleskasse står i midten. Rundt
// den står seks innbyggere. Tre er i arbeid og betaler INN etter evne (den med
// høyest inntekt sender en tykkere strøm). Tre har et behov og får ytelser UT
// etter behov (skole, helse, pensjon). Eleven klikker hver innbygger for å koble
// dem på spleiselaget; kassa fylles og gløder. Lyspæren: velferd er et spleiselag
// - du betaler etter evne og får etter behov, og det bærer bare når alle er med.

const POT_Y = 0.55;

interface Citizen {
    id: string;
    label: string;
    role: 'payer' | 'receiver';
    detail: string;
    pos: [number, number, number];
    body: string;
    flow: number; // tykkelse: antall mynter/ytelser i strømmen
}

const CITIZENS: Citizen[] = [
    // Betalere (inn etter evne) - venstre side
    {
        id: 'ingenior',
        label: 'Ingeniør',
        role: 'payer',
        detail: 'Høy inntekt - betaler mest',
        pos: [-4.6, 0, 1.4],
        body: '#1e3a8a',
        flow: 3,
    },
    {
        id: 'laerer',
        label: 'Lærer',
        role: 'payer',
        detail: 'Vanlig inntekt - betaler etter evne',
        pos: [-4.8, 0, -0.8],
        body: '#0d9488',
        flow: 2,
    },
    {
        id: 'butikk',
        label: 'Butikkmedarbeider',
        role: 'payer',
        detail: 'Lavere inntekt - betaler mindre',
        pos: [-3.6, 0, -2.8],
        body: '#2563eb',
        flow: 1,
    },
    // Mottakere (ut etter behov) - høyre side
    {
        id: 'elev',
        label: 'Skoleelev',
        role: 'receiver',
        detail: 'Gratis skolegang',
        pos: [4.6, 0, 1.4],
        body: '#16a34a',
        flow: 2,
    },
    {
        id: 'pasient',
        label: 'Pasient',
        role: 'receiver',
        detail: 'Helsehjelp ved sykdom',
        pos: [4.8, 0, -0.8],
        body: '#db2777',
        flow: 2,
    },
    {
        id: 'pensjonist',
        label: 'Pensjonist',
        role: 'receiver',
        detail: 'Alderspensjon',
        pos: [3.6, 0, -2.8],
        body: '#eab308',
        flow: 2,
    },
];

const TOTAL = CITIZENS.length;

const Spleiselaget3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [connected, setConnected] = useState<Set<string>>(new Set());
    const [burst, setBurst] = useState(0);
    const [banner, setBanner] = useState<string | null>(
        'Klikk innbyggerne for å koble dem på spleiselaget. De i arbeid betaler inn - de med et behov får ut.'
    );

    const count = connected.size;
    const won = count === TOTAL;
    const fill = count / TOTAL;
    const payersIn = CITIZENS.filter((c) => c.role === 'payer' && connected.has(c.id)).length;
    const coveredOut = CITIZENS.filter((c) => c.role === 'receiver' && connected.has(c.id)).length;

    const connect = (id: string) => {
        if (connected.has(id) || won) return;
        const c = CITIZENS.find((x) => x.id === id)!;
        sounds.play(c.role === 'payer' ? 'correct' : 'pick');
        setConnected((prev) => {
            const next = new Set(prev);
            next.add(id);
            if (next.size === TOTAL) {
                setBurst((b) => b + 1);
                setBanner(null);
                sounds.play('complete');
                onComplete({ score: 1, completed: true });
            } else if (next.size === 1) {
                setBanner(
                    'Kassa begynner å fylles. Koble på alle seks - både de som betaler og de som får.'
                );
            }
            return next;
        });
    };

    const reset = () => {
        setConnected(new Set());
        setBanner(
            'Klikk innbyggerne for å koble dem på spleiselaget. De i arbeid betaler inn - de med et behov får ut.'
        );
    };

    return (
        <MicroGameScaffold
            title="Spleiselaget"
            subtitle="Koble innbyggerne på felleskassa - inn etter evne, ut etter behov"
            estimatedSeconds={110}
            onRetry={count > 0 ? reset : undefined}
            canvas={{
                idle: count === 0,
                camera: { position: [0, 6, 12.5], fov: 42 },
                background: '#dbeafe',
                target: [0, 0.6, -0.4],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {won ? 'Velferdsstaten bærer' : 'Spleiselaget'}
                    </SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[
                            { label: 'I kassa', value: Math.round(fill * 100), unit: '%' },
                            { label: 'Betaler inn', value: `${payersIn}/3` },
                            { label: 'Får ut', value: `${coveredOut}/3` },
                        ]}
                    />
                </>
            }
            scene={
                <SpleiselagScene
                    connected={connected}
                    fill={fill}
                    won={won}
                    burst={burst}
                    onConnect={connect}
                />
            }
        >
            {won ? (
                <WinScreen title="Velferdsstaten bærer!" onReplay={reset}>
                    Alle er med på spleiselaget. De som er i arbeid betaler inn etter evne - den med
                    høyest inntekt betaler mest - og kassa betaler ut etter behov: gratis skole,
                    helsehjelp og pensjon. Det er universelt (alle er med), solidarisk (de rikeste
                    bidrar mest) og obligatorisk. Nettopp derfor bærer den - men bare så lenge
                    nesten alle er med.
                </WinScreen>
            ) : (
                <div className="rounded-xl border border-amber-200 bg-white p-3">
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Klikk de gule punktene over hver innbygger. Venstre side er i arbeid og
                        betaler inn (den tykke strømmen kommer fra den som tjener mest). Høyre side
                        får hjelp ut av kassa. {TOTAL - count} igjen.
                    </p>
                </div>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function SpleiselagScene({
    connected,
    fill,
    won,
    burst,
    onConnect,
}: {
    connected: Set<string>;
    fill: number;
    won: boolean;
    burst: number;
    onConnect: (id: string) => void;
}) {
    return (
        <group>
            {/* Lyst gulv */}
            <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[9, 48]} />
                <meshStandardMaterial color="#eef2f7" roughness={1} />
            </mesh>

            {/* Felleskassa i midten */}
            <Pot fill={fill} won={won} />
            <Burst
                position={[0, POT_Y + 1.4, 0]}
                trigger={burst}
                color="#ffe9a8"
                count={40}
                spread={4}
            />

            {/* Innbyggerne + strømmene */}
            {CITIZENS.map((c) => {
                const isOn = connected.has(c.id);
                return (
                    <group key={c.id}>
                        <CitizenFigure citizen={c} active={isOn} />
                        <FlowStream citizen={c} active={isOn} />
                        {!isOn && !won && (
                            <Hotspot
                                position={[c.pos[0], 1.5, c.pos[2]]}
                                onSelect={() => onConnect(c.id)}
                                label={c.label}
                                radius={0.5}
                            />
                        )}
                    </group>
                );
            })}
        </group>
    );
}

// Felleskassa: et bredt kar med "penger" som stiger med fyllingsgraden, og en
// glød som vokser når flere kobles på.
function Pot({ fill, won }: { fill: number; won: boolean }) {
    const money = useRef<THREE.Mesh>(null);
    const halo = useRef<THREE.Mesh>(null);
    const haloMat = useRef<THREE.MeshBasicMaterial>(null);
    const f = useRef(0);

    useFrame((_, dt) => {
        f.current = damp(f.current, fill, dt, 4);
        const h = 0.12 + f.current * 0.95;
        if (money.current) {
            money.current.scale.y = h;
            money.current.position.y = POT_Y - 0.18 + h / 2;
            const mat = money.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0.25 + f.current * 0.7;
        }
        if (halo.current) {
            const s = 1 + f.current * 0.9;
            halo.current.scale.setScalar(s);
        }
        if (haloMat.current) {
            haloMat.current.opacity = 0.06 + f.current * 0.32;
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Sokkel */}
            <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[1.7, 1.95, 0.4, 32]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
            </mesh>
            {/* Karet */}
            <mesh position={[0, POT_Y, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[1.65, 1.4, 0.95, 32]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.7} metalness={0.2} />
            </mesh>
            {/* Pengene i kassa */}
            <mesh ref={money} position={[0, POT_Y - 0.1, 0]}>
                <cylinderGeometry args={[1.5, 1.32, 1, 32]} />
                <meshStandardMaterial
                    color="#fcd34d"
                    emissive="#f59e0b"
                    emissiveIntensity={0.3}
                    roughness={0.35}
                    metalness={0.4}
                />
            </mesh>
            {/* Glød-halo */}
            <mesh ref={halo} position={[0, POT_Y + 0.3, 0]}>
                <sphereGeometry args={[1.9, 20, 20]} />
                <meshBasicMaterial
                    ref={haloMat}
                    color={won ? '#fde68a' : '#bfdbfe'}
                    transparent
                    opacity={0.08}
                    depthWrite={false}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
}

// Én innbygger. Pop-skalerer og får farge når den kobles på; grå før det.
// Et lite pedestal-lys tennes under føttene ved tilkobling.
function CitizenFigure({ citizen, active }: { citizen: Citizen; active: boolean }) {
    const grp = useRef<THREE.Group>(null);
    const disk = useRef<THREE.Mesh>(null);
    const s = useRef(0);

    useFrame((_, dt) => {
        s.current = damp(s.current, active ? 1 : 0, dt, 7);
        if (grp.current) {
            const pop = 1 + s.current * 0.12;
            grp.current.scale.setScalar(pop);
        }
        if (disk.current) {
            const mat = disk.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = s.current * 0.9;
        }
    });

    const body = active ? citizen.body : '#9aa6b2';
    const skin = active ? '#e8c39a' : '#b9c0c9';
    const diskColor = citizen.role === 'payer' ? '#34d399' : '#fbbf24';

    return (
        <group position={citizen.pos}>
            {/* Pedestal-lys */}
            <mesh ref={disk} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[0.6, 24]} />
                <meshStandardMaterial
                    color="#e2e8f0"
                    emissive={diskColor}
                    emissiveIntensity={0}
                    roughness={0.8}
                />
            </mesh>
            <group ref={grp}>
                <Figure body={body} skin={skin} />
            </group>
        </group>
    );
}

// Strøm av mynter (betaler -> kassa) eller ytelser (kassa -> mottaker).
// Synlig bare når innbyggeren er koblet på. Myntene følger en bue.
function FlowStream({ citizen, active }: { citizen: Citizen; active: boolean }) {
    const isPayer = citizen.role === 'payer';
    const from = useMemo<THREE.Vector3>(
        () =>
            isPayer
                ? new THREE.Vector3(citizen.pos[0], 0.7, citizen.pos[2])
                : new THREE.Vector3(0, POT_Y + 0.5, 0),
        [citizen, isPayer]
    );
    const to = useMemo<THREE.Vector3>(
        () =>
            isPayer
                ? new THREE.Vector3(0, POT_Y + 0.5, 0)
                : new THREE.Vector3(citizen.pos[0], 0.7, citizen.pos[2]),
        [citizen, isPayer]
    );

    const count = citizen.flow;
    const refs = useRef<(THREE.Mesh | null)[]>([]);
    const vis = useRef(0);

    useFrame(({ clock }, dt) => {
        vis.current = damp(vis.current, active ? 1 : 0, dt, 5);
        const t = clock.getElapsedTime();
        for (let i = 0; i < count; i++) {
            const m = refs.current[i];
            if (!m) continue;
            const frac = (((t * 0.55 + i / count) % 1) + 1) % 1;
            m.position.lerpVectors(from, to, frac);
            // Bue: løft opp på midten.
            m.position.y += Math.sin(frac * Math.PI) * 1.1;
            const scl = vis.current * (0.7 + Math.sin(frac * Math.PI) * 0.5);
            m.scale.setScalar(active ? scl : 0.0001);
            m.visible = active || vis.current > 0.02;
        }
    });

    const color = isPayer ? '#fbbf24' : '#34d399';

    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <mesh
                    key={i}
                    ref={(el) => {
                        refs.current[i] = el;
                    }}
                >
                    <sphereGeometry args={[0.16, 12, 12]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.5}
                        roughness={0.3}
                        metalness={isPayer ? 0.5 : 0.1}
                    />
                </mesh>
            ))}
        </group>
    );
}

export default Spleiselaget3D;
