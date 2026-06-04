import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    SceneBanner,
    SceneBadge,
    WinScreen,
    Burst,
    damp,
    DataReadout,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: bryt taushetsspiralen. Fire figurer i periferien av et digitalt
// forum tier stille med nyanserte meninger. De to høyrøstede figurene ved
// mikrofonen dominerer debatten. Eleven klikker på de stille for å gi dem mot.
// Lyspære: demokratiet er sterkere når alle tør å delta, ikke bare de 5%.

type Phase = 'play' | 'won';

const SILENT_START: [number, number, number][] = [
    [-5, 0, 0],
    [5, 0, 0],
    [0, 0, -5],
    [0, 0, 5],
];

const SILENT_END: [number, number, number][] = [
    [-2, 0, 1.2],
    [2, 0, 1.2],
    [-2, 0, -1.2],
    [2, 0, -1.2],
];

const FIGURE_COLORS = ['#f5a030', '#4a9eff', '#7ec870', '#b070f5'];

const TaushetsspiralenTorg3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [clicked, setClicked] = useState<Set<number>>(new Set());
    const [burst, setBurst] = useState(0);
    const [phase, setPhase] = useState<Phase>('play');

    const handleClick = (i: number) => {
        if (clicked.has(i) || phase !== 'play') return;
        sounds.play('correct');
        const next = new Set(clicked);
        next.add(i);
        setClicked(next);
        if (next.size === 4) {
            setTimeout(() => {
                setBurst((b) => b + 1);
                sounds.play('complete');
                setPhase('won');
                onComplete({ score: 1, completed: true, artifact: {} });
            }, 900);
        }
    };

    const reset = () => {
        setClicked(new Set());
        setBurst(0);
        setPhase('play');
    };

    const banner =
        phase === 'won'
            ? null
            : clicked.size === 0
            ? 'Fire figurer tier med nyanserte meninger. Klikk «Oppmuntre» for å gi dem mot til å ta ordet.'
            : `${clicked.size} av 4 tør nå å snakke. Finn de andre.`;

    return (
        <MicroGameScaffold
            title="Bryt taushetsspiralen"
            subtitle="Oppmuntre de stille stemmene til å delta i debatten"
            estimatedSeconds={120}
            onRetry={clicked.size > 0 || phase !== 'play' ? reset : undefined}
            canvas={{
                idle: phase === 'play' && clicked.size === 0,
                camera: { position: [0, 9, 12], fov: 44 },
                background: '#c8daf0',
                target: [0, 0.5, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <DataReadout
                        corner="bl"
                        items={[
                            { label: 'Stemmer inkludert', value: `${clicked.size} / 4` },
                            {
                                label: 'Debattkvalitet',
                                value:
                                    clicked.size < 2
                                        ? 'Ensidig'
                                        : clicked.size < 4
                                        ? 'Bedre'
                                        : 'Mangfoldig',
                            },
                        ]}
                    />
                    <SceneBadge corner="br">
                        {phase === 'won' ? 'Spiralen er brutt!' : 'Taushetsspiralen'}
                    </SceneBadge>
                </>
            }
            scene={
                <TorgScene
                    clicked={clicked}
                    phase={phase}
                    burst={burst}
                    onClickFigure={handleClick}
                />
            }
        >
            {phase === 'won' && (
                <WinScreen title="Taushetsspiralen er brutt!" onReplay={reset}>
                    Alle fire nyanserte stemmene er nå inkludert. Demokratiet er sterkere når alle
                    tør å delta, ikke bare de høyrøstede. Mange som tier på sosiale medier har
                    verdifulle meninger – de er bare redde for reaksjonene. Taushetsspiralen brytes
                    én stemme om gangen.
                </WinScreen>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function TorgScene({
    clicked,
    phase,
    burst,
    onClickFigure,
}: {
    clicked: Set<number>;
    phase: Phase;
    burst: number;
    onClickFigure: (i: number) => void;
}) {
    return (
        <group>
            <ambientLight intensity={0.8} />
            <directionalLight position={[6, 12, 6]} intensity={0.9} castShadow />
            <pointLight position={[0, 3, 0]} intensity={0.6} color="#a0c0ff" />

            {/* Glassgulv */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
                <planeGeometry args={[22, 22]} />
                <meshStandardMaterial color="#b0c8e0" metalness={0.25} roughness={0.4} />
            </mesh>

            {/* Sentral mikrofon-plattform */}
            <Platform activated={clicked.size === 4} />

            {/* De to høyrøstede figurene ved mikrofonen */}
            <LoudFigure position={[-0.9, 0, 0.3]} />
            <LoudFigure position={[0.9, 0, 0.3]} />

            {/* Fire stille figurer */}
            {SILENT_START.map((startPos, i) => (
                <SilentFigure
                    key={i}
                    startPos={startPos}
                    endPos={SILENT_END[i]}
                    color={FIGURE_COLORS[i]}
                    activated={clicked.has(i)}
                    onClick={() => onClickFigure(i)}
                    showHotspot={!clicked.has(i) && phase === 'play'}
                />
            ))}

            {/* Digitale skjermer langs veggene */}
            <DigitalScreen position={[-9, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} />
            <DigitalScreen position={[9, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} />
            <DigitalScreen position={[0, 2.5, -9]} rotation={[0, 0, 0]} />

            <Burst position={[0, 3.5, 0]} trigger={burst} color="#aad4ff" count={45} spread={5} />
        </group>
    );
}

function Platform({ activated }: { activated: boolean }) {
    const discRef = useRef<THREE.Mesh>(null);
    const micHeadRef = useRef<THREE.Mesh>(null);
    const emissive = useRef(0);

    useFrame((_, dt) => {
        emissive.current = damp(emissive.current, activated ? 1 : 0.12, dt, 3);
        if (discRef.current) {
            (discRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
                emissive.current * 0.6;
        }
        if (micHeadRef.current) {
            (micHeadRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
                emissive.current;
        }
    });

    return (
        <group>
            {/* Disc */}
            <mesh ref={discRef} position={[0, -0.02, 0]} receiveShadow>
                <cylinderGeometry args={[2.8, 2.8, 0.18, 48]} />
                <meshStandardMaterial
                    color="#5080b0"
                    emissive="#2050a0"
                    emissiveIntensity={0.12}
                    metalness={0.55}
                    roughness={0.25}
                />
            </mesh>
            {/* Mikrofon-stativ */}
            <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 1.6, 8]} />
                <meshStandardMaterial color="#8898aa" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Mikrofon-hode */}
            <mesh ref={micHeadRef} position={[0, 1.65, 0]}>
                <sphereGeometry args={[0.2, 20, 20]} />
                <meshStandardMaterial
                    color="#c8ddf0"
                    emissive="#4090e0"
                    emissiveIntensity={0.12}
                    metalness={0.8}
                    roughness={0.1}
                />
            </mesh>
        </group>
    );
}

function LoudFigure({ position }: { position: [number, number, number] }) {
    const headRef = useRef<THREE.Mesh>(null);
    const t = useRef(0);
    useFrame((_, dt) => {
        t.current += dt * 1.2;
        if (headRef.current) {
            headRef.current.position.y = 1.6 + Math.sin(t.current) * 0.04;
        }
    });
    return (
        <group position={position}>
            <mesh position={[0, 0.75, 0]} castShadow>
                <cylinderGeometry args={[0.22, 0.22, 1.2, 10]} />
                <meshStandardMaterial
                    color="#c05528"
                    roughness={0.7}
                    emissive="#803020"
                    emissiveIntensity={0.25}
                />
            </mesh>
            <mesh ref={headRef} position={[0, 1.6, 0]} castShadow>
                <sphereGeometry args={[0.3, 18, 18]} />
                <meshStandardMaterial color="#e09060" roughness={0.8} />
            </mesh>
        </group>
    );
}

function SilentFigure({
    startPos,
    endPos,
    color,
    activated,
    onClick,
    showHotspot,
}: {
    startPos: [number, number, number];
    endPos: [number, number, number];
    color: string;
    activated: boolean;
    onClick: () => void;
    showHotspot: boolean;
}) {
    const grp = useRef<THREE.Group>(null);
    const curPos = useRef(new THREE.Vector3(...startPos));
    const bodyRef = useRef<THREE.Mesh>(null);
    const headRef = useRef<THREE.Mesh>(null);
    const bodyColor = useRef(new THREE.Color('#8899aa'));
    const targetBodyColor = new THREE.Color(activated ? color : '#8899aa');
    const headColor = useRef(new THREE.Color('#aabbcc'));
    const targetHeadColor = activated
        ? new THREE.Color(color).lerp(new THREE.Color('#f0c8a0'), 0.45)
        : new THREE.Color('#aabbcc');

    useFrame((_, dt) => {
        if (!grp.current) return;
        const target = new THREE.Vector3(...(activated ? endPos : startPos));
        curPos.current.lerp(target, Math.min(1, dt * 3.5));
        grp.current.position.copy(curPos.current);

        bodyColor.current.lerp(targetBodyColor, Math.min(1, dt * 3));
        headColor.current.lerp(targetHeadColor, Math.min(1, dt * 3));

        if (bodyRef.current) {
            const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
            mat.color.copy(bodyColor.current);
            mat.emissive.copy(bodyColor.current).multiplyScalar(activated ? 0.18 : 0);
        }
        if (headRef.current) {
            (headRef.current.material as THREE.MeshStandardMaterial).color.copy(headColor.current);
        }
    });

    return (
        <group ref={grp} position={startPos}>
            <mesh ref={bodyRef} position={[0, 0.75, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1.2, 10]} />
                <meshStandardMaterial color="#8899aa" roughness={0.8} />
            </mesh>
            <mesh ref={headRef} position={[0, 1.55, 0]} castShadow>
                <sphereGeometry args={[0.28, 18, 18]} />
                <meshStandardMaterial color="#aabbcc" roughness={0.8} />
            </mesh>
            {showHotspot && (
                <Hotspot
                    position={[0, 2.4, 0]}
                    onSelect={onClick}
                    label="Oppmuntre"
                    radius={0.45}
                />
            )}
        </group>
    );
}

function DigitalScreen({
    position,
    rotation,
}: {
    position: [number, number, number];
    rotation: [number, number, number];
}) {
    return (
        <group position={position} rotation={rotation}>
            <mesh>
                <boxGeometry args={[6, 3.5, 0.14]} />
                <meshStandardMaterial color="#1a2a3a" roughness={0.35} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0.08]}>
                <planeGeometry args={[5.6, 3.1]} />
                <meshStandardMaterial
                    color="#0a1828"
                    emissive="#1a3858"
                    emissiveIntensity={0.55}
                    roughness={0.2}
                />
            </mesh>
        </group>
    );
}

export default TaushetsspiralenTorg3D;
