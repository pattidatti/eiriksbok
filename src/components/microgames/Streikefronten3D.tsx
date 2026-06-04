import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    SceneBanner,
    SceneBadge,
    WinScreen,
    GroundPlane,
    Figure,
    Smoke,
    Burst,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: rekrutter alle arbeidergrupper til streiken.
// Scene: en 1890-tallets fabrikk i Kristiania. 5 grupper av arbeidere er spredt
// rundt fabrikktomten. Klikk på hver gruppe for å rekruttere dem - de marsjerer
// da mot streikefronten ved porten. Når alle 5 er med: fabrikken stanser.
// Lyspære: alene kan du klage - men organisert kan du endre.

const GROUPS: { initial: [number, number, number]; target: [number, number, number] }[] = [
    { initial: [-5, 0, 4.5], target: [-7.5, 0, 0] },
    { initial: [5, 0, 3.5], target: [-7.5, 0, 1.3] },
    { initial: [0.5, 0, 5.5], target: [-7.5, 0, -1.2] },
    { initial: [5.5, 0, -0.5], target: [-7.5, 0, 2.5] },
    { initial: [-2.5, 0, -2.5], target: [-7.5, 0, -2.6] },
];

const SMOKE_ORIGIN: [number, number, number] = [3.5, 7.2, -8];

const Streikefronten3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [recruited, setRecruited] = useState<boolean[]>([false, false, false, false, false]);
    const [won, setWon] = useState(false);
    const [banner, setBanner] = useState<string | null>(
        'Klikk på arbeidergruppene for å rekruttere dem til streiken.'
    );
    const [burst, setBurst] = useState(0);

    const count = recruited.filter(Boolean).length;

    const reset = () => {
        setRecruited([false, false, false, false, false]);
        setWon(false);
        setBurst(0);
        setBanner('Klikk på arbeidergruppene for å rekruttere dem til streiken.');
    };

    const recruit = (i: number) => {
        if (recruited[i] || won) return;
        const next = [...recruited];
        next[i] = true;
        const newCount = next.filter(Boolean).length;
        if (newCount === 5) {
            sounds.play('complete');
            setRecruited(next);
            setWon(true);
            setBurst((b) => b + 1);
            setBanner(null);
            onComplete({ score: 1, completed: true });
        } else {
            sounds.play('correct');
            setRecruited(next);
            setBanner(`${newCount} av 5 grupper er med. ${5 - newCount} gjenstår.`);
        }
    };

    return (
        <MicroGameScaffold
            title="Streikefronten"
            subtitle="Rekrutter alle arbeidergrupper - alene kan du klage, sammen kan du endre"
            estimatedSeconds={90}
            onRetry={count > 0 || won ? reset : undefined}
            canvas={{
                idle: false,
                camera: { position: [0, 8, 14], fov: 42 },
                background: '#c8b49a',
                target: [0, 1, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {won ? 'Fabrikken stanser' : 'Kristiania 1900'}
                    </SceneBadge>
                </>
            }
            scene={
                <FactoryScene recruited={recruited} won={won} burst={burst} onRecruit={recruit} />
            }
        >
            {won ? (
                <WinScreen title="Fabrikken stanser - dere vant!" onReplay={reset}>
                    Alle 5 arbeidergrupper sluttet seg til streiken. Fabrikken kunne ikke kjøre uten
                    arbeidskraften. Slik fungerer kollektiv styrke: alene kan du klage, men
                    organisert kan du endre.
                </WinScreen>
            ) : (
                <div className="flex items-center gap-3 px-1 py-1">
                    <span className="text-sm text-slate-600 font-medium whitespace-nowrap">
                        {count}/5 grupper med:
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-amber-700"
                            animate={{ width: `${(count / 5) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                        />
                    </div>
                    <span className="text-sm text-slate-500 whitespace-nowrap">
                        {5 - count} igjen
                    </span>
                </div>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function FactoryScene({
    recruited,
    won,
    burst,
    onRecruit,
}: {
    recruited: boolean[];
    won: boolean;
    burst: number;
    onRecruit: (i: number) => void;
}) {
    return (
        <group>
            <GroundPlane size={40} depth={28} color="#8a7a62" />
            <FactoryBuilding />
            <Smoke origin={SMOKE_ORIGIN} show={!won} count={7} color="#aaaaaa" />

            {/* Streikefront - enkel stolpe langs z-aksen */}
            <mesh position={[-7.6, 0.6, 0]}>
                <boxGeometry args={[0.12, 1.2, 10]} />
                <meshStandardMaterial color="#5a3a10" roughness={0.9} />
            </mesh>
            {/* Streike-banner */}
            <mesh position={[-7.6, 1.4, 0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.08, 0.6, 4]} />
                <meshStandardMaterial color="#c02020" roughness={0.8} />
            </mesh>

            {GROUPS.map((g, i) => (
                <WorkerGroup
                    key={i}
                    initialPos={g.initial}
                    targetPos={g.target}
                    recruited={recruited[i]}
                    onRecruit={() => onRecruit(i)}
                />
            ))}

            <Burst position={[-7, 2, 0]} trigger={burst} color="#ffd86b" count={28} spread={4} />
        </group>
    );
}

function FactoryBuilding() {
    return (
        <group position={[0, 0, -7]}>
            {/* Hovdebygning */}
            <mesh position={[0, 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[12, 4, 5]} />
                <meshStandardMaterial color="#7a3a2a" roughness={0.9} />
            </mesh>
            {/* Tak */}
            <mesh position={[0, 4.18, 0]}>
                <boxGeometry args={[12.2, 0.36, 5.2]} />
                <meshStandardMaterial color="#2a1a0a" roughness={1} />
            </mesh>
            {/* Vinduer - frontvegg */}
            {([-4, -2, 0, 2, 4] as number[]).map((x) => (
                <mesh key={x} position={[x, 2.6, 2.52]}>
                    <boxGeometry args={[0.9, 1.0, 0.06]} />
                    <meshStandardMaterial color="#1a2a3a" roughness={0.3} metalness={0.2} />
                </mesh>
            ))}
            {/* Pipe (skorstein) */}
            <mesh position={[3.5, 3.5, -1]} castShadow>
                <cylinderGeometry args={[0.4, 0.5, 7, 8]} />
                <meshStandardMaterial color="#5a3a22" roughness={0.95} />
            </mesh>
            {/* Port */}
            <mesh position={[-5.9, 0.9, 2.52]}>
                <boxGeometry args={[1.8, 1.8, 0.08]} />
                <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
            </mesh>
        </group>
    );
}

function WorkerGroup({
    initialPos,
    targetPos,
    recruited,
    onRecruit,
}: {
    initialPos: [number, number, number];
    targetPos: [number, number, number];
    recruited: boolean;
    onRecruit: () => void;
}) {
    const grp = useRef<THREE.Group>(null);
    const curX = useRef(initialPos[0]);
    const curZ = useRef(initialPos[2]);

    useFrame((_, dt) => {
        if (!grp.current) return;
        const tx = recruited ? targetPos[0] : initialPos[0];
        const tz = recruited ? targetPos[2] : initialPos[2];
        curX.current = damp(curX.current, tx, dt, 2.2);
        curZ.current = damp(curZ.current, tz, dt, 2.2);
        grp.current.position.set(curX.current, 0, curZ.current);
    });

    return (
        <group ref={grp} position={initialPos}>
            <Figure position={[-0.38, 0, 0]} body="#2a2020" />
            <Figure position={[0, 0, 0.38]} body="#3a3020" />
            <Figure position={[0.38, 0, -0.22]} body="#1a1a2a" />
            {!recruited && (
                <Hotspot
                    position={[0, 2.4, 0]}
                    onSelect={onRecruit}
                    label="Rekrutter"
                    radius={0.55}
                />
            )}
        </group>
    );
}

export default Streikefronten3D;
