import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
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

// Mikrospill til "Religion i medier og populærkultur".
// Kjerneideen eleven skal kjenne på kroppen: religiøse symboler og fortellinger
// er gjemt over alt i tingene vi omgir oss med - filmer, musikk, spill og pynt.
// Et helt vanlig ungdomsrom er fullt av dem. Eleven klikker hvert objekt, ser
// det religiøse opphavet lyse fram, og rommet lyser sterkere for hvert funn.

interface SpotInfo {
    id: string;
    label: string;
    done: string;
    position: [number, number, number];
    color: string;
}

const SPOTS: SpotInfo[] = [
    {
        id: 'plakat',
        label: 'Superhelt-plakaten',
        done: 'Helten dør for å redde verden og vekkes til live igjen - det er Jesu oppstandelse.',
        position: [-3.6, 2.4, -4.4],
        color: '#fbbf24',
    },
    {
        id: 'skjerm',
        label: 'Filmen på skjermen',
        done: 'En storflom og en båt full av dyr - filmen bygger på Noahs ark fra Bibelen.',
        position: [2.6, 2.0, -4.4],
        color: '#38bdf8',
    },
    {
        id: 'statue',
        label: 'Buddha-statuen på hylla',
        done: 'Buddha-figuren er pynt her, men kommer fra buddhismen og betyr ro og innsikt.',
        position: [4.6, 1.7, -1.2],
        color: '#fb923c',
    },
    {
        id: 'hoyttaler',
        label: 'Julelåten i høyttaleren',
        done: 'Julemusikken feirer Jesu fødsel, selv når sangen bare handler om snø og gaver.',
        position: [-4.6, 1.1, -1.0],
        color: '#f87171',
    },
    {
        id: 'spill',
        label: 'Ordet «karma» i spillet',
        done: '«Karma» og «nirvana» i spill og prat kommer fra hinduisme og buddhisme.',
        position: [0.2, 0.8, 1.6],
        color: '#c084fc',
    },
];

const SkjulteSymboler3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [found, setFound] = useState<string[]>([]);
    const [won, setWon] = useState(false);
    const [banner, setBanner] = useState<string | null>(
        'Et helt vanlig rom - men fullt av religion. Klikk tingene som gjemmer et religiøst symbol.'
    );
    const [burst, setBurst] = useState(0);
    const [burstColor, setBurstColor] = useState('#fbbf24');
    const [burstPos, setBurstPos] = useState<[number, number, number]>([0, 2, 0]);

    const reset = () => {
        setFound([]);
        setWon(false);
        setBanner(
            'Et helt vanlig rom - men fullt av religion. Klikk tingene som gjemmer et religiøst symbol.'
        );
    };

    const spot = (s: SpotInfo) => {
        if (won || found.includes(s.id)) return;
        sounds.play('correct');
        setBurstColor(s.color);
        setBurstPos([s.position[0], s.position[1], s.position[2]]);
        setBurst((b) => b + 1);
        const next = [...found, s.id];
        setFound(next);
        if (next.length >= SPOTS.length) {
            setBanner(null);
            sounds.play('complete');
            setWon(true);
            onComplete({ score: 1, completed: true, artifact: { found: next } });
        } else {
            setBanner(s.done);
        }
    };

    const count = found.length;

    return (
        <MicroGameScaffold
            title="Skjulte symboler i populærkulturen"
            subtitle="Fem ting i rommet gjemmer et religiøst symbol eller en fortelling. Klikk og avdekk hvert ett."
            estimatedSeconds={120}
            onRetry={count > 0 || won ? reset : undefined}
            canvas={{
                idle: !won && count === 0,
                camera: { position: [0, 5, 10], fov: 46 },
                background: '#eef2f8',
                target: [0, 1.4, -1.5],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">{won ? 'Alt avdekket' : 'Ungdomsrommet'}</SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[{ label: 'Funnet', value: `${count}/${SPOTS.length}` }]}
                    />
                </>
            }
            scene={
                <RoomScene
                    found={found}
                    burst={burst}
                    burstColor={burstColor}
                    burstPos={burstPos}
                    onSpot={spot}
                />
            }
        >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SPOTS.map((s) => {
                    const done = found.includes(s.id);
                    return (
                        <div
                            key={s.id}
                            className={`rounded-xl border p-2.5 transition-all duration-300 ${
                                done ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-1.5">
                                <span
                                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-500 ${
                                        done ? 'bg-emerald-400' : 'bg-slate-300'
                                    }`}
                                    style={done ? { boxShadow: '0 0 6px #34d399' } : undefined}
                                />
                                <span
                                    className={`text-xs font-medium leading-snug ${
                                        done ? 'text-emerald-700' : 'text-slate-500'
                                    }`}
                                >
                                    {s.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {won && (
                <div className="mt-3">
                    <WinScreen title="Alle symbolene avdekket!" onReplay={reset}>
                        Et helt vanlig rom var fullt av religion: oppstandelse på plakaten, Noahs
                        ark på skjermen, Buddha på hylla, julens budskap i musikken og karma i
                        spillet. Religion forsvinner ikke i et moderne samfunn - den lever videre i
                        film, musikk og spill, ofte uten at vi tenker over det.
                    </WinScreen>
                </div>
            )}
        </MicroGameScaffold>
    );
};

export default SkjulteSymboler3D;

// ============================================================
//  3D-SCENEN - et ungdomsrom
// ============================================================

function RoomScene({
    found,
    burst,
    burstColor,
    burstPos,
    onSpot,
}: {
    found: string[];
    burst: number;
    burstColor: string;
    burstPos: [number, number, number];
    onSpot: (s: SpotInfo) => void;
}) {
    const progress = found.length / SPOTS.length;

    return (
        <group>
            <RoomLight progress={progress} />
            <directionalLight position={[5, 9, 6]} intensity={1.0} castShadow />

            {/* Gulv */}
            <GroundPlane size={26} depth={22} color="#d8c4a8" />

            {/* Bakvegg */}
            <mesh position={[0, 3, -5]} receiveShadow>
                <boxGeometry args={[16, 6, 0.3]} />
                <meshStandardMaterial color="#e7ecf3" />
            </mesh>
            {/* Sidevegg */}
            <mesh position={[-7.8, 3, -1]} receiveShadow>
                <boxGeometry args={[0.3, 6, 9]} />
                <meshStandardMaterial color="#dde4ee" />
            </mesh>

            {/* Plakat (superhelt) */}
            <group position={[-3.6, 2.6, -4.82]}>
                <mesh>
                    <boxGeometry args={[1.9, 2.6, 0.08]} />
                    <meshStandardMaterial color={found.includes('plakat') ? '#fde68a' : '#3b4a63'} />
                </mesh>
                <mesh position={[0, 0.3, 0.06]}>
                    <circleGeometry args={[0.5, 24]} />
                    <meshStandardMaterial color="#fbbf24" />
                </mesh>
            </group>

            {/* TV-skjerm (film) */}
            <group position={[2.6, 2.2, -4.78]}>
                <mesh>
                    <boxGeometry args={[3.2, 1.9, 0.12]} />
                    <meshStandardMaterial color="#1f2937" />
                </mesh>
                <mesh position={[0, 0, 0.08]}>
                    <planeGeometry args={[2.9, 1.6]} />
                    <meshStandardMaterial
                        color={found.includes('skjerm') ? '#7dd3fc' : '#475569'}
                        emissive={found.includes('skjerm') ? '#38bdf8' : '#1e293b'}
                        emissiveIntensity={0.4}
                    />
                </mesh>
            </group>

            {/* Hylle med Buddha-statue */}
            <mesh position={[4.6, 1.0, -1.2]} castShadow>
                <boxGeometry args={[2.2, 0.18, 1.4]} />
                <meshStandardMaterial color="#9a7b53" />
            </mesh>
            <group position={[4.6, 1.5, -1.2]}>
                <mesh castShadow>
                    <cylinderGeometry args={[0.28, 0.36, 0.5, 16]} />
                    <meshStandardMaterial color={found.includes('statue') ? '#fcd9b6' : '#b59b7a'} />
                </mesh>
                <mesh position={[0, 0.42, 0]} castShadow>
                    <sphereGeometry args={[0.22, 16, 16]} />
                    <meshStandardMaterial color={found.includes('statue') ? '#fcd9b6' : '#b59b7a'} />
                </mesh>
            </group>

            {/* Høyttaler (julelåt) */}
            <mesh position={[-4.6, 0.6, -1.0]} castShadow>
                <boxGeometry args={[0.9, 1.2, 0.8]} />
                <meshStandardMaterial color={found.includes('hoyttaler') ? '#fca5a5' : '#475569'} />
            </mesh>
            <mesh position={[-4.6, 0.7, -0.58]}>
                <circleGeometry args={[0.28, 20]} />
                <meshStandardMaterial color="#1f2937" />
            </mesh>

            {/* Sofa / gulvpute */}
            <mesh position={[0, 0.35, 2.4]} castShadow>
                <boxGeometry args={[3.6, 0.7, 1.6]} />
                <meshStandardMaterial color="#8aa1c2" />
            </mesh>

            {/* Spillkonsoll på lite bord (karma) */}
            <mesh position={[0.2, 0.4, 1.0]} castShadow>
                <boxGeometry args={[1.4, 0.2, 0.9]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>
            <mesh position={[0.2, 0.6, 1.0]}>
                <boxGeometry args={[0.9, 0.12, 0.5]} />
                <meshStandardMaterial
                    color={found.includes('spill') ? '#d8b4fe' : '#374151'}
                    emissive={found.includes('spill') ? '#a855f7' : '#000000'}
                    emissiveIntensity={0.35}
                />
            </mesh>

            {/* Hotspots */}
            {SPOTS.map((s) => {
                if (found.includes(s.id)) return null;
                return (
                    <Hotspot
                        key={s.id}
                        position={[s.position[0], s.position[1] + 0.3, s.position[2] + 0.3]}
                        onSelect={() => onSpot(s)}
                        label={s.label}
                    />
                );
            })}

            <Burst position={burstPos} trigger={burst} color={burstColor} count={26} spread={3.5} />
        </group>
    );
}

// Lyset i rommet stiger mykt mot mål etter hvert som symbolene avdekkes.
function RoomLight({ progress }: { progress: number }) {
    const ref = useRef<THREE.AmbientLight>(null);
    useFrame((_, dt) => {
        if (ref.current) {
            const target = 0.5 + progress * 0.7;
            ref.current.intensity = damp(ref.current.intensity, target, dt, 2);
        }
    });
    return <ambientLight ref={ref} intensity={0.5} color="#fff4e6" />;
}
