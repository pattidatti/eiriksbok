import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    Figure,
    Smoke,
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

// Mikrospill: "Fredelig maktskifte". Den skarpeste prøven på et demokrati er om
// stemmen din faktisk kan bytte ut dem som styrer. Mellom borgeren og makt-
// sokkelen står tre barrierer som autoritære system bruker: en sensurmur (presse-
// kontroll), en godkjenningsport (kandidater siles) og en partidommer (domstol
// under partiet). Eleven river barrierene og avgir så stemmen. Står barrierene,
// blokkeres stemmen: "du er innbygger, ikke medborger". Er alle borte, når stemmen
// fram, den gamle lederen trer av og en folkevalgt reiser seg. Lyspære: forskjellen
// på innbygger og medborger er ikke om valg finnes, men om stemmen kan bytte ut makta.

type Phase = 'dismantle' | 'crossing' | 'won';

const BALLOT_Z = 3.6;
const PEDESTAL_Z = -4.6;

interface BarrierDef {
    z: number;
    kind: 'wall' | 'gate' | 'judge';
    title: string;
    label: string;
}

const BARRIERS: BarrierDef[] = [
    { z: 2, kind: 'wall', title: 'Sensurmur', label: 'Riv sensurmuren' },
    { z: 0, kind: 'gate', title: 'Godkjenningsport', label: 'Fjern godkjenningsporten' },
    { z: -2, kind: 'judge', title: 'Partidommer', label: 'Frigjør domstolen' },
];

const Maktskiftet3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [phase, setPhase] = useState<Phase>('dismantle');
    const [removed, setRemoved] = useState<boolean[]>([false, false, false]);
    const [result, setResult] = useState<{ success: boolean; targetZ: number } | null>(null);
    const [banner, setBanner] = useState<string | null>(
        'Riv de tre barrierene mellom stemmen din og makta - klikk hver av dem, og avgi så stemmen.'
    );
    const [burst, setBurst] = useState(0);

    const removedCount = removed.filter(Boolean).length;
    const pct = Math.round((removedCount / 3) * 100);

    const reset = () => {
        setPhase('dismantle');
        setRemoved([false, false, false]);
        setResult(null);
        setBurst(0);
        setBanner(
            'Riv de tre barrierene mellom stemmen din og makta - klikk hver av dem, og avgi så stemmen.'
        );
    };

    const removeBarrier = (i: number) => {
        if (phase !== 'dismantle' || removed[i]) return;
        sounds.play('correct');
        const next = removed.map((r, idx) => (idx === i ? true : r));
        setRemoved(next);
        const left = next.filter((r) => !r).length;
        setBanner(
            left === 0
                ? 'Veien er åpen. Avgi stemmen din - nå når den helt fram til makta.'
                : `${BARRIERS[i].title} er borte. ${left} ${
                      left === 1 ? 'barriere' : 'barrierer'
                  } igjen.`
        );
    };

    const castVote = () => {
        if (phase !== 'dismantle') return;
        const first = removed.findIndex((r) => !r);
        sounds.play('advance');
        setBanner(null);
        if (first === -1) {
            setResult({ success: true, targetZ: PEDESTAL_Z + 0.6 });
        } else {
            setResult({ success: false, targetZ: BARRIERS[first].z + 0.4 });
        }
        setPhase('crossing');
    };

    const onArrive = () => {
        if (!result) return;
        if (result.success) {
            setBurst((b) => b + 1);
            sounds.play('complete');
            setPhase('won');
            onComplete({ score: 1, completed: true, artifact: { removed } });
        } else {
            sounds.play('incorrect');
            setBanner(
                'Valget finnes, men stemmen din når ikke fram - du er innbygger, ikke medborger. Riv barrieren som blokkerer.'
            );
            setPhase('dismantle');
            setResult(null);
        }
    };

    return (
        <MicroGameScaffold
            title="Fredelig maktskifte"
            subtitle="Riv barrierene mellom stemmen din og makta, og bytt ut dem som styrer"
            estimatedSeconds={120}
            onRetry={removedCount > 0 || phase !== 'dismantle' ? reset : undefined}
            canvas={{
                idle: phase === 'dismantle',
                camera: { position: [0, 5, 11], fov: 42 },
                background: '#d6e4ee',
                target: [0, 1, -1],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {phase === 'won' ? 'Folkestyre' : 'Stemmerett på prøve'}
                    </SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[
                            { label: 'Barrierer fjernet', value: `${removedCount}/3` },
                            { label: 'Reell stemmerett', value: pct, unit: '%' },
                        ]}
                    />
                </>
            }
            scene={
                <SquareScene
                    phase={phase}
                    removed={removed}
                    result={result}
                    burst={burst}
                    onRemove={removeBarrier}
                    onVote={castVote}
                    onArrive={onArrive}
                />
            }
        >
            {phase !== 'won' ? (
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        I et demokrati kan borgerne bytte ut dem som styrer ved frie valg.
                        Autoritære system blokkerer den veien. Riv de tre barrierene, og avgi så
                        stemmen din.
                    </p>
                    <button
                        onClick={castVote}
                        disabled={phase === 'crossing'}
                        className="self-start inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        Avgi stemmen din
                    </button>
                </div>
            ) : (
                <WinScreen title="Du byttet ut makta - fredelig!" onReplay={reset}>
                    Stemmen din nådde helt fram, den gamle lederen trådte av, og en folkevalgt
                    reiste seg. Det er kjernen i medborgerskapet: forskjellen på en innbygger og en
                    medborger er ikke om det finnes valg, men om stemmen din faktisk kan bytte ut
                    dem som styrer.
                </WinScreen>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function SquareScene({
    phase,
    removed,
    result,
    burst,
    onRemove,
    onVote,
    onArrive,
}: {
    phase: Phase;
    removed: boolean[];
    result: { success: boolean; targetZ: number } | null;
    burst: number;
    onRemove: (i: number) => void;
    onVote: () => void;
    onArrive: () => void;
}) {
    return (
        <group>
            <GroundPlane size={26} depth={26} color="#c4ced8" />
            {/* lyst "torggulv" rundt aksen */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, -0.5]} receiveShadow>
                <planeGeometry args={[5, 12]} />
                <meshStandardMaterial color="#dfe6ee" roughness={0.95} />
            </mesh>

            {/* Makt-sokkelen bakerst med leder-figur */}
            <Throne won={phase === 'won'} />

            {/* Stemmeurne + borger foran */}
            <BallotBox />
            <Figure position={[-1.5, 0, BALLOT_Z + 0.2]} body="#4f7cc0" skin="#e9c39b" />

            {/* De tre barrierene */}
            {BARRIERS.map((b, i) => (
                <Barrier key={i} def={b} removed={removed[i]} />
            ))}

            {/* Stemme-strålen */}
            <VoteBeam phase={phase} result={result} onArrive={onArrive} />

            {/* Hotspots for å rive barrierene */}
            {phase === 'dismantle' &&
                BARRIERS.map((b, i) =>
                    removed[i] ? null : (
                        <Hotspot
                            key={`hs-${i}`}
                            position={[0, 1.9, b.z]}
                            onSelect={() => onRemove(i)}
                            label={b.label}
                            radius={0.5}
                        />
                    )
                )}

            {/* Hotspot for å avgi stemme */}
            {phase === 'dismantle' && (
                <Hotspot
                    position={[1.5, 1.5, BALLOT_Z]}
                    onSelect={onVote}
                    label="Avgi stemme"
                    radius={0.5}
                    color="#6366f1"
                />
            )}

            <Burst
                position={[0, 1.8, PEDESTAL_Z]}
                trigger={burst}
                color="#ffe9a8"
                count={34}
                spread={4}
            />
        </group>
    );
}

// Makt-sokkelen. Gammel leder (mørk) trer av og en folkevalgt (lys) reiser seg
// når maktskiftet lykkes.
function Throne({ won }: { won: boolean }) {
    const oldRef = useRef<THREE.Group>(null);
    const newRef = useRef<THREE.Group>(null);
    const t = useRef(0);
    useFrame((_, dt) => {
        t.current = damp(t.current, won ? 1 : 0, dt, 3.5);
        if (oldRef.current) {
            oldRef.current.position.y = 1.5 + t.current * 3;
            oldRef.current.scale.setScalar(Math.max(0.0001, 1 - t.current));
        }
        if (newRef.current) {
            newRef.current.scale.setScalar(t.current);
        }
    });
    return (
        <group position={[0, 0, PEDESTAL_Z]}>
            {/* sokkel */}
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.1, 1.3, 1.5, 24]} />
                <meshStandardMaterial color="#9aa3ad" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.55, 0]} receiveShadow>
                <cylinderGeometry args={[1.15, 1.15, 0.12, 24]} />
                <meshStandardMaterial
                    color="#c8a24a"
                    roughness={0.6}
                    emissive="#7a5e1f"
                    emissiveIntensity={won ? 0.4 : 0.12}
                />
            </mesh>
            {/* gammel leder */}
            <group ref={oldRef} position={[0, 1.5, 0]}>
                <Figure position={[0, 0, 0]} body="#3a3a44" skin="#b8a99a" />
                {/* mørk krone-markør */}
                <mesh position={[0, 0.92, 0]} castShadow>
                    <coneGeometry args={[0.16, 0.22, 5]} />
                    <meshStandardMaterial color="#2c2c34" roughness={0.7} />
                </mesh>
            </group>
            {/* ny folkevalgt */}
            <group ref={newRef} position={[0, 1.5, 0]} scale={0.0001}>
                <Figure position={[0, 0, 0]} body="#3f8f5a" skin="#e9c39b" />
            </group>
        </group>
    );
}

// Stemmeurne.
function BallotBox() {
    return (
        <group position={[0, 0, BALLOT_Z]}>
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.7, 0.9, 0.6]} />
                <meshStandardMaterial color="#5a78b0" roughness={0.8} />
            </mesh>
            {/* slisse på toppen */}
            <mesh position={[0, 0.91, 0]}>
                <boxGeometry args={[0.4, 0.04, 0.08]} />
                <meshStandardMaterial color="#27324a" />
            </mesh>
        </group>
    );
}

// Én barriere. Synker ned i bakken (med røyk) når den fjernes. Tre ulike former.
function Barrier({ def, removed }: { def: BarrierDef; removed: boolean }) {
    const grp = useRef<THREE.Group>(null);
    const t = useRef(0);
    useFrame((_, dt) => {
        if (!grp.current) return;
        t.current = damp(t.current, removed ? 1 : 0, dt, 4);
        grp.current.position.y = -t.current * 2.6;
        const s = 1 - t.current * 0.25;
        grp.current.scale.set(s, 1, s);
    });
    return (
        <group position={[0, 0, def.z]}>
            <group ref={grp}>
                {def.kind === 'wall' && (
                    <>
                        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
                            <boxGeometry args={[3.4, 1.5, 0.35]} />
                            <meshStandardMaterial color="#828c98" roughness={0.95} />
                        </mesh>
                        {/* forbudt-stripe */}
                        <mesh position={[0, 0.95, 0.19]}>
                            <boxGeometry args={[3.4, 0.22, 0.04]} />
                            <meshStandardMaterial color="#b5443c" roughness={0.7} />
                        </mesh>
                    </>
                )}
                {def.kind === 'gate' && (
                    <>
                        {[-1.4, 1.4].map((x) => (
                            <mesh key={x} position={[x, 0.95, 0]} castShadow>
                                <boxGeometry args={[0.35, 1.9, 0.35]} />
                                <meshStandardMaterial color="#7d8590" roughness={0.9} />
                            </mesh>
                        ))}
                        <mesh position={[0, 1.75, 0]} castShadow>
                            <boxGeometry args={[3.15, 0.4, 0.4]} />
                            <meshStandardMaterial color="#6c757f" roughness={0.9} />
                        </mesh>
                        {/* godkjennings-stempel */}
                        <mesh position={[0, 1.75, 0.22]}>
                            <boxGeometry args={[0.5, 0.28, 0.04]} />
                            <meshStandardMaterial
                                color="#c25b53"
                                emissive="#7a2b25"
                                emissiveIntensity={0.3}
                            />
                        </mesh>
                    </>
                )}
                {def.kind === 'judge' && (
                    <>
                        <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
                            <boxGeometry args={[1.3, 1.9, 0.6]} />
                            <meshStandardMaterial color="#46414f" roughness={0.85} />
                        </mesh>
                        {/* paragraf-plate */}
                        <mesh position={[0, 1.2, 0.32]}>
                            <boxGeometry args={[0.5, 0.5, 0.04]} />
                            <meshStandardMaterial color="#e6e2d6" roughness={0.6} />
                        </mesh>
                    </>
                )}
            </group>
            {/* røyk når barrieren synker */}
            <Smoke origin={[0, 0.2, 0]} show={removed} count={5} color="#9aa3ad" />
        </group>
    );
}

// Stemme-strålen som ruller fra urna mot makt-sokkelen. Stopper ved targetZ
// (en gjenstående barriere = blokkert, eller sokkelen = den nådde fram).
function VoteBeam({
    phase,
    result,
    onArrive,
}: {
    phase: Phase;
    result: { success: boolean; targetZ: number } | null;
    onArrive: () => void;
}) {
    const mesh = useRef<THREE.Mesh>(null);
    const head = useRef(BALLOT_Z);
    const arrived = useRef(false);
    const lastPhase = useRef<Phase>('dismantle');

    useFrame((_, dt) => {
        if (!mesh.current) return;

        if (phase === 'crossing' && lastPhase.current !== 'crossing') {
            head.current = BALLOT_Z;
            arrived.current = false;
        }
        lastPhase.current = phase;

        if (phase !== 'crossing' || !result) {
            mesh.current.visible = false;
            return;
        }

        mesh.current.visible = true;
        head.current = Math.max(result.targetZ, head.current - dt * 9);
        const len = Math.max(0.001, BALLOT_Z - head.current);
        mesh.current.scale.z = len;
        mesh.current.position.z = (BALLOT_Z + head.current) / 2;

        if (!arrived.current && head.current <= result.targetZ + 0.03) {
            arrived.current = true;
            onArrive();
        }
    });

    return (
        <mesh ref={mesh} position={[0, 1.0, 0]} visible={false}>
            <boxGeometry args={[0.45, 0.16, 1]} />
            <meshStandardMaterial
                color="#ffd86b"
                emissive="#f5b942"
                emissiveIntensity={0.9}
                transparent
                opacity={0.85}
            />
        </mesh>
    );
}

export default Maktskiftet3D;
