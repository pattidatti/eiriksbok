import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Draggable,
    GroundPlane,
    Tree,
    Person,
    Banner,
    SceneBanner,
    SceneBadge,
    DragHint,
    SceneFact,
    WinScreen,
    StepTracker,
    DataReadout,
    GlowMaterial,
    damp,
    type KitTheme,
    Burst,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til artikkelen om Magna Carta (1215). Eleven står på enga ved
// Runnymede og forsegler avtalen mellom kong Johan og baronene. For hvert segl
// som dras på pergamentet SYNKER kongens høye trone et hakk, mens en stein-stele
// merket "LOVEN" reiser seg like mye. Når alle fire segl er satt, står tronen og
// loven på SAMME høyde.
//
// Lyspæren eleven kjenner på kroppen: Magna Carta gjorde ikke kongen maktesløs.
// Den senket ham ned til lovens nivå - for første gang måtte selv kongen følge
// reglene, i stedet for å stå over dem.

const TOTAL = 4;

// De fire løftene som forsegles, ett per segl.
const CLAUSES = [
    'Ingen ny skatt uten at rådet sier ja.',
    'Ingen fri mann fengsles uten lov og dom.',
    'Alle frie menn har rett til en rettferdig rettssak.',
    'Selv kongen står nå under loven.',
];

// Eng ved Themsen: friskt gress, gråblå stein, varmt tre.
const RUNNYMEDE: KitTheme = {
    sky: '#cfe3f0',
    fog: '#d6e6f0',
    ground: '#7fa356',
    water: '#5b86a6',
    wood: '#6e4d2e',
    stone: '#b9bfc4',
    leaf: '#5f7d39',
    accent: '#b5651d',
};

// Punktet på bordet der eleven slipper seglet.
const TABLE_X = 0;
const TABLE_Z = 0.5;

const ForseglingenRunnymede3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();

    const [stage, setStage] = useState(0); // antall segl satt (0-4)
    const [sealKey, setSealKey] = useState(0); // remount for å sende seglet hjem
    const [burst, setBurst] = useState(0);
    const [banner, setBanner] = useState<string | null>(
        'Dra voksseglet bort til pergamentet og slipp det. Hvert segl binder kongen til loven.'
    );
    const [fact, setFact] = useState<string | null>(null);

    const snappedRef = useRef(false);

    const done = stage >= TOTAL;
    const idle = stage === 0;

    const reset = () => {
        setStage(0);
        setSealKey((k) => k + 1);
        setFact(null);
        setBanner(
            'Dra voksseglet bort til pergamentet og slipp det. Hvert segl binder kongen til loven.'
        );
    };

    const placeSeal = () => {
        if (done) return;
        sounds.play('pick');
        const next = stage + 1;
        setStage(next);
        setBurst((b) => b + 1);
        setSealKey((k) => k + 1);
        setFact(CLAUSES[next - 1]);
        if (next >= TOTAL) {
            sounds.play('complete');
            setBanner(null);
            window.setTimeout(() => onComplete({ score: 1, completed: true }), 500);
        } else {
            sounds.play('advance');
            setBanner('Tronen synker, loven reiser seg. Sett neste segl.');
        }
    };

    return (
        <MicroGameScaffold
            title="Forseglingen på Runnymede"
            subtitle="Sett seglene på Magna Carta og se kongens trone synke ned til lovens nivå."
            estimatedSeconds={150}
            onRetry={stage > 0 ? reset : undefined}
            canvas={{
                idle,
                camera: { position: [11, 7, 12], fov: 42 },
                background: RUNNYMEDE.sky,
                fog: { color: RUNNYMEDE.fog, near: 30, far: 64 },
                target: [0, 1.6, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {done ? 'Magna Carta forseglet' : 'Runnymede, England, 1215'}
                    </SceneBadge>
                    {!done && (
                        <DataReadout
                            corner="bl"
                            items={[
                                { label: 'Segl satt', value: `${stage}/${TOTAL}` },
                                {
                                    label: 'Kongens makt over loven',
                                    value: `${Math.round(((TOTAL - stage) / TOTAL) * 100)}%`,
                                },
                            ]}
                        />
                    )}
                    <DragHint show={idle} corner="bc">
                        Dra voksseglet til pergamentet
                    </DragHint>
                </>
            }
            scene={
                <SealScene
                    stage={stage}
                    sealKey={sealKey}
                    burst={burst}
                    done={done}
                    onSnap={() => {
                        snappedRef.current = true;
                        placeSeal();
                    }}
                    onDrop={() => {
                        if (!snappedRef.current) setSealKey((k) => k + 1);
                        snappedRef.current = false;
                    }}
                />
            }
        >
            <div className="flex flex-col gap-3">
                {!done && <StepTracker current={stage} total={TOTAL} />}

                {!done ? (
                    <>
                        <p className="text-sm text-slate-600 leading-snug">
                            Dra voksseglet fra bordkanten bort til pergamentet og slipp det.
                            For hvert segl synker kong Johans høye trone et hakk, mens steinen
                            merket LOVEN reiser seg like mye. Se på telleren: kongens frie makt
                            over loven faller mot null.
                        </p>
                        {fact && <SceneFact>{fact}</SceneFact>}
                    </>
                ) : (
                    <WinScreen title="Kongen står nå likt med loven!" onReplay={reset}>
                        I juni 1215 møtte kong Johan opprørske baroner på enga ved Runnymede,
                        og satte seglet sitt på Magna Carta. Avtalen gjorde ikke kongen
                        maktesløs. Den senket ham ned til lovens nivå: for første gang måtte
                        selv kongen følge regler han ikke kunne endre alene. Det er denne ideen,
                        at ingen står over loven, vi fortsatt bygger rettsstaten på i dag.
                    </WinScreen>
                )}
            </div>
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function SealScene({
    stage,
    sealKey,
    burst,
    done,
    onSnap,
    onDrop,
}: {
    stage: number;
    sealKey: number;
    burst: number;
    done: boolean;
    onSnap: () => void;
    onDrop: () => void;
}) {
    // Andel av forhandlingen som er fullført (0-1).
    const t = stage / TOTAL;

    return (
        <group>
            {/* Frisk eng ved Themsen */}
            <GroundPlane size={70} depth={60} color={RUNNYMEDE.ground} />

            {/* Kongens trone til venstre: synker ned mot loven */}
            <Throne progress={t} stone={RUNNYMEDE.wood} />

            {/* Stein-stelen merket LOVEN til høyre: reiser seg */}
            <LawStele progress={t} stone={RUNNYMEDE.stone} />

            {/* Bordet med pergamentet i midten */}
            <CharterTable />

            {/* Baroner som løfter armene etter hvert som loven vinner fram */}
            {BARON_SLOTS.map((p, i) => (
                <Person
                    key={i}
                    position={[p[0], 0, p[1]]}
                    rotation={[0, p[2], 0]}
                    body={i % 2 === 0 ? '#5b3a6b' : '#3a4f6b'}
                    skin={i % 3 === 0 ? '#caa07a' : '#e0b98c'}
                    pose={i < stage ? 'raise' : 'idle'}
                    hat="hood"
                />
            ))}

            {/* Suksess-burst ved pergamentet for hvert segl */}
            <Burst
                position={[TABLE_X, 1.4, TABLE_Z]}
                trigger={burst}
                color="#c0392b"
                count={18}
                spread={1.8}
            />

            {/* Voksseglet eleven drar (skjules når avtalen er forseglet) */}
            {!done && (
                <Draggable
                    key={sealKey}
                    position={[6.6, 0, 4.8]}
                    snapPoints={[[TABLE_X, TABLE_Z]]}
                    snapRadius={3}
                    onSnap={onSnap}
                    onDrop={onDrop}
                    dropFx="dustPuff"
                >
                    {/* Romslig usynlig gripeflate for trygg trackpad-treffing */}
                    <mesh position={[0, 0.7, 0]}>
                        <boxGeometry args={[2.2, 2, 2.2]} />
                        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                    </mesh>
                    <WaxSeal />
                </Draggable>
            )}

            {/* Trær for eng-stemning */}
            <Tree position={[-12, 0, 7]} seed={3} leaf={RUNNYMEDE.leaf} />
            <Tree position={[12, 0, 9]} seed={7} leaf={RUNNYMEDE.leaf} />
            <Tree position={[-10, 0, -6]} seed={11} leaf={RUNNYMEDE.leaf} />
            <Tree position={[9, 0, -8]} seed={5} leaf={RUNNYMEDE.leaf} />
        </group>
    );
}

// Kongens trone: en høy sokkel med kongen på toppen. Sokkelen senkes mykt mot
// lovens nivå når progress vokser fra 0 til 1.
function Throne({ progress, stone }: { progress: number; stone: string }) {
    const daisRef = useRef<THREE.Mesh>(null);
    const kingRef = useRef<THREE.Group>(null);

    // Høyde på sokkelen: høy ved start (3.2), nede ved lovens nivå (0.6).
    const targetH = 3.2 - progress * 2.6;

    useFrame((_, dt) => {
        if (daisRef.current) {
            const h = damp(daisRef.current.scale.y, targetH, dt, 4);
            daisRef.current.scale.y = h;
            daisRef.current.position.y = h / 2;
            if (kingRef.current) kingRef.current.position.y = h;
        }
    });

    return (
        <group position={[-5, 0, -0.5]}>
            {/* Sokkel/trone som synker */}
            <mesh ref={daisRef} position={[0, 1.6, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.2, 1, 2.2]} />
                <meshStandardMaterial color={stone} roughness={0.9} flatShading />
            </mesh>
            {/* Kongen med krone på toppen av sokkelen */}
            <group ref={kingRef} position={[0, 3.2, 0]}>
                <Person body="#8a1f1f" skin="#e0b98c" pose="sit" hat="crown" hatColor="#e8b923" />
            </group>
        </group>
    );
}

// Steinstelen merket LOVEN: reiser seg fra bakken mens progress vokser.
function LawStele({ progress, stone }: { progress: number; stone: string }) {
    const stoneRef = useRef<THREE.Mesh>(null);

    // Lav ved start (0.6), opp til kongens nivå (3.2) ved full enighet.
    const targetH = 0.6 + progress * 2.6;

    useFrame((_, dt) => {
        if (stoneRef.current) {
            const h = damp(stoneRef.current.scale.y, targetH, dt, 4);
            stoneRef.current.scale.y = h;
            stoneRef.current.position.y = h / 2;
        }
    });

    return (
        <group position={[5, 0, -0.5]}>
            <mesh ref={stoneRef} position={[0, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.6, 1, 1.6]} />
                <meshStandardMaterial color={stone} roughness={0.95} flatShading />
            </mesh>
            {/* Gloende topp som markerer loven */}
            <mesh position={[0, 0.1, 0.81]}>
                <boxGeometry args={[1.2, 0.5, 0.06]} />
                <GlowMaterial color="#3b82f6" />
            </mesh>
            <Banner position={[0, 3.4, 0]} color="#1e3a8a" height={2.2} />
        </group>
    );
}

// Bordet med pergamentet der seglene settes.
function CharterTable() {
    return (
        <group position={[TABLE_X, 0, TABLE_Z]}>
            {/* Bordplate */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 0.18, 1.8]} />
                <meshStandardMaterial color="#7a5630" roughness={0.9} flatShading />
            </mesh>
            {/* Bordbein */}
            {[
                [-1.3, -0.7],
                [1.3, -0.7],
                [-1.3, 0.7],
                [1.3, 0.7],
            ].map((p, i) => (
                <mesh key={i} position={[p[0], 0.5, p[1]]} castShadow>
                    <boxGeometry args={[0.18, 1, 0.18]} />
                    <meshStandardMaterial color="#5e4326" roughness={0.9} flatShading />
                </mesh>
            ))}
            {/* Pergamentet */}
            <mesh position={[0, 1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.4, 1.4]} />
                <meshStandardMaterial color="#efe6cf" roughness={1} />
            </mesh>
        </group>
    );
}

// Et voksseglet på en liten plate (det eleven drar).
function WaxSeal() {
    return (
        <group>
            <mesh position={[0, 0.12, 0]} castShadow>
                <cylinderGeometry args={[0.7, 0.7, 0.18, 24]} />
                <meshStandardMaterial color="#7a5630" roughness={0.9} flatShading />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
                <cylinderGeometry args={[0.5, 0.55, 0.3, 24]} />
                <meshStandardMaterial color="#a93226" roughness={0.6} flatShading />
            </mesh>
            {/* Preget kongekors på seglet */}
            <mesh position={[0, 0.48, 0]}>
                <boxGeometry args={[0.5, 0.08, 0.12]} />
                <meshStandardMaterial color="#7b241c" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.48, 0]}>
                <boxGeometry args={[0.12, 0.08, 0.5]} />
                <meshStandardMaterial color="#7b241c" roughness={0.5} />
            </mesh>
        </group>
    );
}

// Faste plasser for baronene rundt bordet: [x, z, rotasjon].
const BARON_SLOTS: [number, number, number][] = [
    [-2.2, 2.6, Math.PI * 0.85],
    [2.4, 2.4, -Math.PI * 0.85],
    [-2.6, -1.4, Math.PI * 0.3],
    [2.6, -1.2, -Math.PI * 0.3],
];

export default ForseglingenRunnymede3D;
