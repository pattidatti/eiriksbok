import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    SceneBanner,
    SceneBadge,
    DataReadout,
    WinScreen,
    StepTracker,
    SceneFact,
    Building,
    Figure,
    WaterPlane,
    Tree,
    damp,
    Burst,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: levekårsgapet. To land med et hav imellom. Hjemlandet ligger lavt,
// det rike landet høyt. Når gapet er stort, strømmer folk over havet (migrasjon).
// Eleven bygger skole, klinikk og arbeid i hjemlandet. For hver investering stiger
// levekårene hjemme, gapet krymper, og strømmen tynnes. Lyspæren: store
// levekårsforskjeller er den sterkeste drivkraften bak migrasjon - minker gapet,
// minker presset. Det er ikke avstand, men levekår, som avgjør om folk blir.

type Phase = 'build' | 'won';

interface Institution {
    id: string;
    label: string;
    pos: [number, number, number]; // bygge-punkt på hjemlandet
    body: string;
    roof: string;
}

const INSTITUTIONS: Institution[] = [
    { id: 'skole', label: 'Bygg skole', pos: [-8.5, 0, -1.6], body: '#d98c3a', roof: '#7a4a22' },
    { id: 'klinikk', label: 'Bygg klinikk', pos: [-6.8, 0, 1.4], body: '#e4e2dc', roof: '#b23b3b' },
    { id: 'arbeid', label: 'Skap arbeid', pos: [-5.3, 0, -1.2], body: '#9aa0a6', roof: '#5c6066' },
];

const HOME_X = -7;
const RICH_X = 7;
const N_FIG = 6;

// Levekår hjemme stiger med hver investering. Gapet er forskjellen mot det rike
// landet (fast 100). gapFactor (0..1) styrer migrasjonsstrømmen.
function homeLevekaar(built: number) {
    return 15 + built * 28; // 15, 43, 71, 99
}

const Levekaarsgapet3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [phase, setPhase] = useState<Phase>('build');
    const [done, setDone] = useState<Record<string, boolean>>({});
    const [banner, setBanner] = useState<string | null>(
        'Gapet er stort - folk forlater hjemlandet. Bygg opp levekårene hjemme.'
    );
    const [burst, setBurst] = useState(0);

    const builtCount = INSTITUTIONS.filter((i) => done[i.id]).length;
    const home = homeLevekaar(builtCount);
    const gap = 100 - home;
    const gapFactor = Math.max(0, Math.min(1, gap / 85));
    const onTheMove = Math.round(gapFactor * N_FIG);

    const reset = () => {
        setPhase('build');
        setDone({});
        setBanner('Gapet er stort - folk forlater hjemlandet. Bygg opp levekårene hjemme.');
    };

    const build = (id: string) => {
        if (phase !== 'build' || done[id]) return;
        sounds.play('correct');
        const next = { ...done, [id]: true };
        setDone(next);
        const count = INSTITUTIONS.filter((i) => next[i.id]).length;
        if (count >= INSTITUTIONS.length) {
            setBurst((b) => b + 1);
            sounds.play('complete');
            setPhase('won');
            setBanner(null);
            onComplete({ score: 1, completed: true });
        } else if (count === 1) {
            setBanner('Levekårene hjemme stiger, og gapet krymper. Folk begynner å snu.');
        } else {
            setBanner('Nesten i mål. Ett løft til, så er presset for å reise nesten borte.');
        }
    };

    return (
        <MicroGameScaffold
            title="Levekårsgapet"
            subtitle="Bygg opp levekårene hjemme, og se hva som skjer med migrasjonen"
            estimatedSeconds={130}
            onRetry={builtCount > 0 || phase !== 'build' ? reset : undefined}
            canvas={{
                idle: builtCount === 0,
                camera: { position: [0, 8, 17], fov: 40 },
                background: '#bfe0f2',
                target: [0, 0.5, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} />
                    <DataReadout
                        items={[
                            { label: 'Levekårsgap', value: Math.round(gap) },
                            { label: 'Folk på vandring', value: onTheMove },
                        ]}
                    />
                    <SceneBadge corner="br">
                        {phase === 'won' ? 'Gapet er lukket' : 'Migrasjon'}
                    </SceneBadge>
                </>
            }
            scene={
                <GapScene
                    done={done}
                    gapFactor={gapFactor}
                    builtCount={builtCount}
                    burst={burst}
                    onBuild={build}
                    phase={phase}
                />
            }
        >
            {phase === 'build' && (
                <div className="flex flex-col gap-3">
                    <StepTracker current={builtCount} total={INSTITUTIONS.length} />
                    <p className="text-sm text-slate-600">
                        Klikk på de gule punktene i hjemlandet for å bygge skole, klinikk og arbeid.
                    </p>
                    <SceneFact>
                        Folk migrerer sjelden fordi de vil bort - de migrerer fordi levekårene hjemme
                        er for vanskelige. Jo større forskjellen i levekår er, desto sterkere blir
                        presset for å reise.
                    </SceneFact>
                </div>
            )}

            {phase === 'won' && (
                <WinScreen title="Folk blir værende hjemme!" onReplay={reset}>
                    Da du bygde skole, klinikk og arbeid, steg levekårene hjemme og gapet til det rike
                    landet krympet. Strømmen av folk stoppet nesten helt. Det viser kjernen i
                    migrasjon: store levekårsforskjeller er den sterkeste drivkraften. Minker gapet,
                    minker presset for å reise.
                </WinScreen>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function GapScene({
    done,
    gapFactor,
    builtCount,
    burst,
    onBuild,
    phase,
}: {
    done: Record<string, boolean>;
    gapFactor: number;
    builtCount: number;
    burst: number;
    onBuild: (id: string) => void;
    phase: Phase;
}) {
    return (
        <group>
            {/* Havet mellom landene */}
            <WaterPlane position={[0, 0.02, 0]} size={[8, 22]} color="#3d7fa6" />

            {/* Hjemlandet (venstre) - tørt, men grønnes når levekårene stiger */}
            <Land x={HOME_X} builtCount={builtCount} />
            {/* Det rike landet (høyre) - frodig og utbygd */}
            <RichLand x={RICH_X} />

            {/* Institusjoner som reiser seg når de bygges */}
            {INSTITUTIONS.map((inst) => (
                <RisingBuilding key={inst.id} inst={inst} built={!!done[inst.id]} />
            ))}

            {/* Bygge-hotspots på hjemlandet */}
            {phase === 'build' &&
                INSTITUTIONS.map((inst) =>
                    done[inst.id] ? null : (
                        <Hotspot
                            key={inst.id}
                            position={[inst.pos[0], 1.4, inst.pos[2]]}
                            onSelect={() => onBuild(inst.id)}
                            label={inst.label}
                            radius={0.5}
                        />
                    )
                )}

            {/* Migrasjonsstrømmen */}
            <Migrants gapFactor={gapFactor} />

            {/* Feiring når gapet lukkes */}
            <Burst position={[HOME_X, 2, 0]} trigger={burst} color="#bfe6a8" count={34} spread={4.5} />
        </group>
    );
}

// Hjemlandet: en platform som skifter fra tørr sand mot grønt etter hvert som
// levekårene bygges opp.
function Land({ x, builtCount }: { x: number; builtCount: number }) {
    const top = useRef<THREE.MeshStandardMaterial>(null);
    const target = new THREE.Color().lerpColors(
        new THREE.Color('#c9b079'),
        new THREE.Color('#6aa84f'),
        builtCount / 3
    );
    useFrame((_, dt) => {
        if (top.current) {
            top.current.color.r = damp(top.current.color.r, target.r, dt, 4);
            top.current.color.g = damp(top.current.color.g, target.g, dt, 4);
            top.current.color.b = damp(top.current.color.b, target.b, dt, 4);
        }
    });
    return (
        <group position={[x, 0, 0]}>
            <mesh position={[0, -0.6, 0]} receiveShadow castShadow>
                <boxGeometry args={[7, 1.2, 9]} />
                <meshStandardMaterial color="#8a7f6a" roughness={0.95} />
            </mesh>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[7, 9]} />
                <meshStandardMaterial ref={top} color="#c9b079" roughness={0.95} />
            </mesh>
        </group>
    );
}

// Det rike landet: frodig, med hus og trær som allerede står der.
function RichLand({ x }: { x: number }) {
    return (
        <group position={[x, 0, 0]}>
            <mesh position={[0, -0.6, 0]} receiveShadow castShadow>
                <boxGeometry args={[7, 1.2, 9]} />
                <meshStandardMaterial color="#7a8a6a" roughness={0.95} />
            </mesh>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[7, 9]} />
                <meshStandardMaterial color="#5f9e46" roughness={0.9} />
            </mesh>
            <Building position={[0.6, 0, -1.8]} body="#c9d3dc" roof="#3b5161" w={1.5} h={1.6} d={1.4} />
            <Building position={[-1.4, 0, 0.6]} body="#dbe2e8" roof="#475c6b" w={1.3} h={1.2} d={1.2} />
            <Building position={[1.8, 0, 1.4]} body="#cdd6de" roof="#3b5161" w={1.2} h={1.3} d={1.1} />
            <Tree position={[-2, 0, -2.2]} leaf="#3f6b39" />
            <Tree position={[2.4, 0, -0.8]} leaf="#48793f" />
        </group>
    );
}

// En institusjon som vokser opp av bakken når den bygges.
function RisingBuilding({ inst, built }: { inst: Institution; built: boolean }) {
    const grp = useRef<THREE.Group>(null);
    const t = useRef(0);
    useFrame((_, dt) => {
        if (!grp.current) return;
        t.current = damp(t.current, built ? 1 : 0, dt, 6);
        grp.current.scale.y = Math.max(0.0001, t.current);
        grp.current.position.y = (t.current - 1) * 0.4; // litt under bakken først
    });
    return (
        <group ref={grp} position={[inst.pos[0], 0, inst.pos[2]]}>
            <Building position={[0, 0, 0]} body={inst.body} roof={inst.roof} w={1.4} h={1.3} d={1.2} />
        </group>
    );
}

// Migrasjonsstrømmen: små figurer som trekkes mot det rike landet når gapet er
// stort, og vender hjem når gapet lukkes. Drevet av gapFactor alene - ingen
// ref-lesing i render.
const FIGS = [
    { z: -2.6, reach: 9.5, body: '#7a5a3a' },
    { z: -1.4, reach: 10.5, body: '#6b4f8a' },
    { z: -0.2, reach: 11.2, body: '#5a6b3a' },
    { z: 1.0, reach: 10.0, body: '#8a5a4a' },
    { z: 2.2, reach: 9.0, body: '#4a6b7a' },
    { z: 3.0, reach: 11.0, body: '#7a6b3a' },
];

function Migrants({ gapFactor }: { gapFactor: number }) {
    return (
        <group>
            {FIGS.map((f, i) => (
                <Migrant key={i} z={f.z} reach={f.reach} body={f.body} gapFactor={gapFactor} index={i} />
            ))}
        </group>
    );
}

function Migrant({
    z,
    reach,
    body,
    gapFactor,
    index,
}: {
    z: number;
    reach: number;
    body: string;
    gapFactor: number;
    index: number;
}) {
    const grp = useRef<THREE.Group>(null);
    const homeX = HOME_X + 1.8;
    // Hver figur trekkes ulikt langt ut, så strømmen sprer seg utover havet.
    const pull = gapFactor * (0.55 + 0.45 * (index / FIGS.length));
    const targetX = homeX + pull * reach;
    useFrame(({ clock }, dt) => {
        if (!grp.current) return;
        grp.current.position.x = damp(grp.current.position.x, targetX, dt, 1.6);
        // Liten gange-vugging når de er på vandring.
        const moving = grp.current.position.x > HOME_X + 2.5;
        const t = clock.getElapsedTime();
        grp.current.position.y = moving ? 0.08 + Math.abs(Math.sin(t * 6 + index)) * 0.12 : 0;
        grp.current.rotation.z = moving ? Math.sin(t * 6 + index) * 0.12 : 0;
    });
    return (
        <group ref={grp} position={[homeX, 0, z]}>
            <Figure position={[0, 0, 0]} body={body} />
        </group>
    );
}

export default Levekaarsgapet3D;
