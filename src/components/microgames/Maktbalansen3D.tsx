import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Interactive,
    SceneBanner,
    SceneBadge,
    WinScreen,
    DataReadout,
    Burst,
    KitOutline,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: maktbalanse. En glødende avgjørelse svever over en arena. Fire
// maktaktør-pilarer (Politikk, Næringsliv, Media, Sivilsamfunn) står rundt.
// Eleven klikker en pilar for å la aktøren TREKKE i avgjørelsen - en
// spennings-stråle tennes og avgjørelsen dras mot den. Én aktør alene = helt
// skjevt. Når alle fire motvektene trekker samtidig, balanserer de hverandre,
// avgjørelsen lander i den legitime midtringen og blomstrer.
// Lyspære: spredt makt med flere motvekter gir en balansert, legitim avgjørelse;
// konsentrert makt gjør avgjørelsen skjev.

type Phase = 'play' | 'won';

interface Actor {
    id: string;
    label: string;
    color: string;
    angle: number; // grader i XZ-planet
    grunngiving: string;
}

const ACTORS: Actor[] = [
    { id: 'politikk', label: 'Politikk', color: '#3b82f6', angle: 90, grunngiving: 'Vi er valgt av folket' },
    { id: 'naering', label: 'Næringsliv', color: '#f59e0b', angle: 0, grunngiving: 'Vi skaper jobber og vekst' },
    { id: 'media', label: 'Media', color: '#a855f7', angle: 180, grunngiving: 'Vi er den fjerde statsmakt' },
    { id: 'sivil', label: 'Sivilsamfunn', color: '#10b981', angle: 270, grunngiving: 'Vi taler for de uten makt' },
];

const PILLAR_R = 4.5;
const PULL_R = 2.2;
const rad = (d: number) => (d * Math.PI) / 180;
// Retning fra sentrum til pilaren, i XZ.
const dirOf = (a: number): [number, number] => [Math.cos(rad(a)), Math.sin(rad(a))];

function targetOf(engaged: string[]): THREE.Vector3 {
    let x = 0,
        z = 0;
    for (const id of engaged) {
        const ac = ACTORS.find((a) => a.id === id)!;
        const [dx, dz] = dirOf(ac.angle);
        x += dx;
        z += dz;
    }
    return new THREE.Vector3(x * PULL_R, 0.9, z * PULL_R);
}

const Maktbalansen3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [phase, setPhase] = useState<Phase>('play');
    const [engaged, setEngaged] = useState<string[]>([]);
    const [banner, setBanner] = useState<string | null>(
        'Klikk en maktaktør for å la den trekke i avgjørelsen.'
    );
    const [burst, setBurst] = useState(0);

    const reset = () => {
        setPhase('play');
        setEngaged([]);
        setBanner('Klikk en maktaktør for å la den trekke i avgjørelsen.');
    };

    const toggle = (id: string) => {
        if (phase !== 'play') return;
        const isOn = engaged.includes(id);
        const next = isOn ? engaged.filter((x) => x !== id) : [...engaged, id];
        sounds.play(isOn ? 'drop' : 'pick');
        setEngaged(next);

        if (next.length === ACTORS.length) {
            setBanner(null);
            sounds.play('complete');
            setBurst((b) => b + 1);
            setPhase('won');
            onComplete({ score: 1, completed: true, artifact: { engaged: next } });
            return;
        }
        const msg: Record<number, string> = {
            0: 'Klikk en maktaktør for å la den trekke i avgjørelsen.',
            1: 'Én aktør alene drar avgjørelsen helt skjevt. Makta er konsentrert.',
            2: 'To krefter trekker, men flere stemmer mangler ennå.',
            3: 'Nesten balansert - én motvekt mangler fortsatt.',
        };
        setBanner(msg[next.length]);
    };

    // Skjevhet i prosent: hvor langt fra midten avgjørelsen havner (0 = balansert).
    const skew = useMemo(() => {
        const t = targetOf(engaged);
        const mag = Math.hypot(t.x, t.z);
        const max = PULL_R; // én aktør
        return Math.min(100, Math.round((mag / max) * 100));
    }, [engaged]);

    return (
        <MicroGameScaffold
            title="Balanser makta"
            subtitle="La maktaktørene trekke i avgjørelsen. Bare når alle fire motvektene er med, blir den balansert."
            estimatedSeconds={120}
            onRetry={engaged.length > 0 || phase === 'won' ? reset : undefined}
            canvas={{
                idle: phase === 'play' && engaged.length === 0,
                camera: { position: [0, 6.5, 10], fov: 42 },
                background: '#eef3fb',
                target: [0, 0.6, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} />
                    <SceneBadge corner="br">
                        {phase === 'won' ? 'Legitim avgjørelse' : 'Maktbalanse'}
                    </SceneBadge>
                    <DataReadout
                        corner="tr"
                        items={[
                            { label: 'Aktører med', value: `${engaged.length}/${ACTORS.length}` },
                            { label: 'Skjevhet', value: skew, unit: '%' },
                        ]}
                    />
                </>
            }
            scene={
                <ArenaScene engaged={engaged} phase={phase} burst={burst} onToggle={toggle} />
            }
        >
            {/* Legende under vinduet: de fire aktørene + grunngivingen deres. */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ACTORS.map((a) => {
                    const on = engaged.includes(a.id);
                    return (
                        <button
                            key={a.id}
                            onClick={() => toggle(a.id)}
                            disabled={phase === 'won'}
                            className={`text-left rounded-xl border p-2.5 transition ${
                                on ? 'bg-white shadow-sm' : 'bg-slate-50 border-slate-200'
                            } ${phase === 'won' ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'}`}
                            style={on ? { borderColor: a.color } : undefined}
                        >
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="w-3 h-3 rounded-full flex-shrink-0 transition"
                                    style={{
                                        backgroundColor: on ? a.color : '#cbd5e1',
                                        boxShadow: on ? `0 0 8px ${a.color}` : 'none',
                                    }}
                                />
                                <span className="text-xs font-bold text-slate-700">{a.label}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                                {a.grunngiving}
                            </p>
                        </button>
                    );
                })}
            </div>

            {phase === 'won' && (
                <div className="mt-3">
                    <WinScreen title="Balansert og legitim!" onReplay={reset}>
                        Med bare én aktør ble avgjørelsen dratt helt skjevt - da bestemmer makta
                        alene. Først da alle fire maktaktørene trakk samtidig, balanserte de
                        hverandre og avgjørelsen landet i midten. Det er kjernen i et demokrati:
                        makta er spredt mellom flere motvekter, og ingen aktør bestemmer alene.
                    </WinScreen>
                </div>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function ArenaScene({
    engaged,
    phase,
    burst,
    onToggle,
}: {
    engaged: string[];
    phase: Phase;
    burst: number;
    onToggle: (id: string) => void;
}) {
    // Delt, mutbar posisjon for avgjørelses-orben (oppdateres av Orb, leses av Beam).
    const orbPos = useRef(new THREE.Vector3(0, 0.9, 0));
    const balanced = phase === 'won';

    return (
        <group>
            {/* Arena-gulv */}
            <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[7, 56]} />
                <meshStandardMaterial color="#dde6f5" roughness={1} />
            </mesh>

            {/* Legitim midtring */}
            <LegitRing balanced={balanced} />

            {/* Spennings-stråler (bak orben, tegnes først) */}
            {ACTORS.map((a) => (
                <Beam key={a.id} actor={a} on={engaged.includes(a.id)} orbPos={orbPos} />
            ))}

            {/* Avgjørelses-orben */}
            <Orb engaged={engaged} balanced={balanced} orbPos={orbPos} />

            {/* Maktaktør-pilarer */}
            {ACTORS.map((a) => (
                <Pillar
                    key={a.id}
                    actor={a}
                    on={engaged.includes(a.id)}
                    onSelect={() => onToggle(a.id)}
                />
            ))}

            <Burst position={[0, 1, 0]} trigger={burst} color="#bbf7d0" count={32} spread={4} />
        </group>
    );
}

// Den legitime midtringen. Blek til avgjørelsen er balansert, da lyser den grønt.
function LegitRing({ balanced }: { balanced: boolean }) {
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    useFrame((_, dt) => {
        if (!mat.current) return;
        mat.current.emissiveIntensity = damp(
            mat.current.emissiveIntensity,
            balanced ? 0.9 : 0.05,
            dt,
            5
        );
        mat.current.color.lerp(new THREE.Color(balanced ? '#22c55e' : '#b9c6d2'), 1 - Math.exp(-5 * dt));
        mat.current.emissive.lerp(
            new THREE.Color(balanced ? '#22c55e' : '#000000'),
            1 - Math.exp(-5 * dt)
        );
    });
    return (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.25, 0.09, 12, 48]} />
            <meshStandardMaterial ref={mat} color="#b9c6d2" emissive="#000000" emissiveIntensity={0.05} roughness={0.6} />
        </mesh>
    );
}

// Avgjørelses-orben. Damper mot vektor-summen av aktørene som trekker. Skriver
// posisjonen sin til orbPos så strålene kan følge den.
function Orb({
    engaged,
    balanced,
    orbPos,
}: {
    engaged: string[];
    balanced: boolean;
    orbPos: React.MutableRefObject<THREE.Vector3>;
}) {
    const grp = useRef<THREE.Group>(null);
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    const glow = useRef<THREE.Mesh>(null);

    useFrame((state, dt) => {
        const t = targetOf(engaged);
        if (grp.current) {
            grp.current.position.x = damp(grp.current.position.x, t.x, dt, 4);
            grp.current.position.z = damp(grp.current.position.z, t.z, dt, 4);
            grp.current.position.y = 0.9 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
            orbPos.current.copy(grp.current.position);
        }
        if (mat.current) {
            mat.current.emissiveIntensity = damp(
                mat.current.emissiveIntensity,
                balanced ? 1.1 : 0.5,
                dt,
                4
            );
            mat.current.color.lerp(
                new THREE.Color(balanced ? '#fde68a' : '#cbd5e1'),
                1 - Math.exp(-4 * dt)
            );
            mat.current.emissive.lerp(
                new THREE.Color(balanced ? '#fbbf24' : '#64748b'),
                1 - Math.exp(-4 * dt)
            );
        }
        if (glow.current) {
            const gm = glow.current.material as THREE.MeshBasicMaterial;
            gm.opacity = damp(gm.opacity, balanced ? 0.4 : 0.16, dt, 4);
        }
    });

    return (
        <group ref={grp} position={[0, 0.9, 0]}>
            <mesh castShadow>
                <icosahedronGeometry args={[0.7, 0]} />
                <meshStandardMaterial
                    ref={mat}
                    color="#cbd5e1"
                    emissive="#64748b"
                    emissiveIntensity={0.5}
                    roughness={0.3}
                    flatShading
                />
            </mesh>
            <mesh ref={glow}>
                <sphereGeometry args={[1.15, 20, 20]} />
                <meshBasicMaterial
                    color="#ffe9a8"
                    transparent
                    opacity={0.16}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
}

// En spennings-stråle fra orben til en pilar. Synlig bare når aktøren trekker.
function Beam({
    actor,
    on,
    orbPos,
}: {
    actor: Actor;
    on: boolean;
    orbPos: React.MutableRefObject<THREE.Vector3>;
}) {
    const grp = useRef<THREE.Group>(null);
    const mat = useRef<THREE.MeshBasicMaterial>(null);
    const [dx, dz] = dirOf(actor.angle);
    const end = useMemo(() => new THREE.Vector3(dx * PILLAR_R, 1.6, dz * PILLAR_R), [dx, dz]);
    const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
    const visible = useRef(0);

    useFrame((_, dt) => {
        if (!grp.current || !mat.current) return;
        visible.current = damp(visible.current, on ? 1 : 0, dt, 8);
        mat.current.opacity = visible.current * 0.8;
        const a = orbPos.current;
        const mid = a.clone().add(end).multiplyScalar(0.5);
        const dir = end.clone().sub(a);
        const len = dir.length();
        grp.current.position.copy(mid);
        grp.current.quaternion.setFromUnitVectors(up, dir.clone().normalize());
        grp.current.scale.set(1, len * visible.current + 0.0001, 1);
        grp.current.visible = visible.current > 0.02;
    });

    return (
        <group ref={grp}>
            <mesh>
                <cylinderGeometry args={[0.06, 0.06, 1, 8]} />
                <meshBasicMaterial
                    ref={mat}
                    color={actor.color}
                    transparent
                    opacity={0}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
}

// En maktaktør-pilar. Klikkbar (stor hitArea for trackpad). Lyser i aktørfargen
// når den trekker.
function Pillar({ actor, on, onSelect }: { actor: Actor; on: boolean; onSelect: () => void }) {
    const cap = useRef<THREE.MeshStandardMaterial>(null);
    const [dx, dz] = dirOf(actor.angle);
    const x = dx * PILLAR_R;
    const z = dz * PILLAR_R;

    useFrame((_, dt) => {
        if (!cap.current) return;
        cap.current.emissiveIntensity = damp(cap.current.emissiveIntensity, on ? 0.85 : 0.1, dt, 5);
    });

    return (
        <group position={[x, 0, z]}>
            <Interactive onSelect={onSelect} state={on ? 'selected' : 'idle'} hitArea={[1.8, 2.6, 1.8]}>
                {(s) => (
                    <group>
                        {/* stolpe */}
                        <mesh position={[0, 0.8, 0]} castShadow>
                            <cylinderGeometry args={[0.22, 0.28, 1.6, 12]} />
                            <meshStandardMaterial color="#94a3b8" roughness={0.8} />
                        </mesh>
                        {/* kapsel på toppen i aktørfargen */}
                        <mesh position={[0, 1.85, 0]} castShadow>
                            <octahedronGeometry args={[0.5, 0]} />
                            <meshStandardMaterial
                                ref={cap}
                                color={actor.color}
                                emissive={actor.color}
                                emissiveIntensity={on ? 0.85 : s === 'hover' ? 0.5 : 0.1}
                                roughness={0.3}
                                flatShading
                            />
                            {(on || s === 'hover') && <KitOutline />}
                        </mesh>
                    </group>
                )}
            </Interactive>
        </group>
    );
}

export default Maktbalansen3D;
