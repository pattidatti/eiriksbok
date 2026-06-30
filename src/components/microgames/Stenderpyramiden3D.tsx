import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    SceneBanner,
    SceneBadge,
    SceneFact,
    SceneSlider,
    DataReadout,
    WinScreen,
    GroundPlane,
    Tree,
    Burst,
    GlowHalo,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: "Stenderpyramiden". Eleven skyver en spak fra 1788 til 1789.
// Til venstre (1788) er samfunnet en bratt pyramide: den lille geistligheten og
// adelen står høyt på toppen, mens den enorme tredjestanden er presset sammen
// nederst og bøyer seg under vekten. Mens spaken skyves mot 1789 synker de
// privilegerte ned til bakken, de tre stendene blir tre like brede plattformer
// ved siden av hverandre, alle reiser seg, og erklæringen lyser opp bak dem.
// Lyspæren: før 1789 bestemte fødselen din om du sto på toppen eller bunnen. To
// bittesmå grupper styrte alt. Erklæringen flyttet alle ned på samme grunn:
// like for loven, uansett hvem du var født som.

type Phase = 'play' | 'won';

function moodLabel(t: number): string {
    if (t < 0.25) return 'Stendersamfunn (1788)';
    if (t < 0.6) return 'Privilegiene vakler';
    if (t < 0.88) return 'Nesten like';
    return 'Like rettigheter (1789)';
}

const Stenderpyramiden3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [pct, setPct] = useState(0); // 0 = 1788, 100 = 1789
    const [phase, setPhase] = useState<Phase>('play');
    const [burst, setBurst] = useState(0);

    const t = pct / 100;
    const canEnact = t >= 0.88 && phase === 'play';
    const fodsel = Math.round((1 - t) * 100);
    const likhet = Math.round(t * 100);

    const enact = () => {
        if (!canEnact) return;
        setBurst((b) => b + 1);
        sounds.play('complete');
        setPhase('won');
        onComplete({ score: 1, completed: true, artifact: { pct } });
    };

    const reset = () => {
        setPct(0);
        setPhase('play');
    };

    const banner =
        phase === 'won'
            ? null
            : canEnact
              ? 'Nå står alle på samme grunn. Vedta erklæringen.'
              : pct < 5
                ? 'Skyv spaken fra 1788 mot 1789. Se hva som skjer med samfunnet.'
                : t < 0.6
                  ? 'I 1788 sto to små grupper på toppen, mens folket bar dem nederst.'
                  : null;

    return (
        <MicroGameScaffold
            title="Stenderpyramiden"
            subtitle="Skyv samfunnet fra stenderpyramide til like rettigheter"
            estimatedSeconds={140}
            onRetry={pct > 0 ? reset : undefined}
            canvas={{
                idle: pct < 1,
                camera: { position: [0, 6.5, 14], fov: 42 },
                background: '#e3e9f0',
                target: [0, 1.4, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">{moodLabel(t)}</SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[
                            { label: 'Bestemmes av fødsel', value: fodsel },
                            { label: 'Like for loven', value: likhet },
                        ]}
                    />
                </>
            }
            scene={<PyramidScene t={t} canEnact={canEnact} onEnact={enact} burst={burst} />}
        >
            <div className="flex flex-col gap-3">
                <SceneSlider
                    label="1788  →  1789"
                    min={0}
                    max={100}
                    step={1}
                    value={pct}
                    onChange={(v) => phase === 'play' && setPct(v)}
                    valueLabel={(v) => `${v} %`}
                />
                {phase === 'won' ? (
                    <WinScreen title="Erklæringen er vedtatt!" onReplay={reset}>
                        I stendersamfunnet bestemte fødselen din alt. Geistligheten og adelen var
                        bittesmå grupper, men de sto på toppen og slapp skatt og straff som rammet
                        andre. Erklæringen fra 1789 flyttet alle ned på samme grunn: alle er født
                        frie og like, og loven er den samme for alle. Den ideen ble grunnmuren i
                        rettighetene du har i dag.
                    </WinScreen>
                ) : (
                    <SceneFact>
                        Se på tallene nede til venstre. Jo nærmere 1789 du skyver, jo mindre
                        bestemmer fødselen, og jo mer like blir alle for loven.
                    </SceneFact>
                )}
            </div>
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function PyramidScene({
    t,
    canEnact,
    onEnact,
    burst,
}: {
    t: number;
    canEnact: boolean;
    onEnact: () => void;
    burst: number;
}) {
    return (
        <group>
            <GroundPlane size={30} depth={26} color="#9bb36a" />

            <Tree position={[-10, 0, -6]} seed={3} />
            <Tree position={[10, 0, -5]} seed={7} />
            <Tree position={[-9.5, 0, 6]} seed={5} />
            <Tree position={[9.6, 0, 6.5]} seed={9} />

            {/* Erklæringen som reiser seg bak stendene */}
            <Declaration t={t} />

            {/* De tre stendene */}
            <Estate
                t={t}
                color="#d6c98c"
                from={{ x: 0, y: 2.0, w: 2.0 }}
                to={{ x: 3.3, y: 0.4, w: 2.7 }}
                count={1}
                bent={false}
                label="clergy"
            />
            <Estate
                t={t}
                color="#a394c8"
                from={{ x: 0, y: 1.2, w: 4.4 }}
                to={{ x: 0, y: 0.4, w: 2.7 }}
                count={2}
                bent={false}
                label="nobility"
            />
            <Estate
                t={t}
                color="#c9b79a"
                from={{ x: 0, y: 0.4, w: 9.0 }}
                to={{ x: -3.3, y: 0.4, w: 2.7 }}
                count={6}
                bent={true}
                label="third"
            />

            {/* Finale: vedta erklæringen (direkte 3D-klikk) */}
            {canEnact && (
                <Hotspot
                    position={[0, 3.6, -2.6]}
                    onSelect={onEnact}
                    label="Vedta erklæringen"
                    radius={0.7}
                />
            )}

            <Burst position={[0, 2.8, -2.6]} trigger={burst} color="#ffe6a3" count={42} spread={5} />
        </group>
    );
}

// En stand: en steinplattform med noen figurer på toppen. Plattformen morfer
// fra sin plass i pyramiden (`from`) til en likestilt plattform på bakken (`to`).
function Estate({
    t,
    color,
    from,
    to,
    count,
    bent,
    label,
}: {
    t: number;
    color: string;
    from: { x: number; y: number; w: number };
    to: { x: number; y: number; w: number };
    count: number;
    bent: boolean;
    label: string;
}) {
    const grp = useRef<THREE.Group>(null);
    const slab = useRef<THREE.Mesh>(null);
    const cur = useRef(0);

    // Lokale figurplasseringer som passer både bred og smal plattform.
    const spots: [number, number][] = [];
    for (let i = 0; i < count; i++) {
        const row = i < 3 ? 0 : 1;
        const col = i % 3;
        const n = Math.min(count, 3);
        const x = n === 1 ? 0 : (col - (n - 1) / 2) * 0.8;
        spots.push([x, row === 0 ? 1.0 : -1.0]);
    }

    useFrame((_, dt) => {
        cur.current = damp(cur.current, t, dt, 3);
        const u = cur.current;
        const x = from.x + (to.x - from.x) * u;
        const y = from.y + (to.y - from.y) * u;
        const w = from.w + (to.w - from.w) * u;
        if (grp.current) grp.current.position.set(x, y, 0);
        if (slab.current) slab.current.scale.x = w;
    });

    const slabTopY = 0.4; // halve høyden av slab (geometri-høyde 0.8)

    return (
        <group ref={grp}>
            {/* Plattform */}
            <mesh ref={slab} castShadow receiveShadow>
                <boxGeometry args={[1, 0.8, 5]} />
                <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Figurer på toppen */}
            {spots.map(([fx, fz], i) => (
                <EstateFigure
                    key={`${label}-${i}`}
                    t={t}
                    bent={bent}
                    position={[fx, slabTopY, fz]}
                />
            ))}
        </group>
    );
}

// En person på en stand. Tredjestandens folk bøyer seg under vekten ved t=0 og
// reiser seg ved t=1. De privilegerte står oppreist hele veien.
function EstateFigure({
    t,
    bent,
    position,
}: {
    t: number;
    bent: boolean;
    position: [number, number, number];
}) {
    const grp = useRef<THREE.Group>(null);
    const cur = useRef(0);
    useFrame((_, dt) => {
        cur.current = damp(cur.current, t, dt, 3);
        const u = cur.current;
        if (grp.current) {
            // bøyd ved u=0, oppreist ved u=1 (kun for tredjestanden)
            const lean = bent ? (1 - u) * 0.5 : 0;
            grp.current.rotation.z = lean;
            grp.current.position.y = position[1] - (bent ? (1 - u) * 0.12 : 0);
        }
    });
    return (
        <group ref={grp} position={position}>
            {/* kropp */}
            <mesh position={[0, 0.45, 0]} castShadow>
                <capsuleGeometry args={[0.16, 0.42, 4, 8]} />
                <meshStandardMaterial color="#6f7a86" roughness={0.85} />
            </mesh>
            {/* hode */}
            <mesh position={[0, 0.86, 0]} castShadow>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#e0b98c" roughness={0.7} />
            </mesh>
        </group>
    );
}

// Erklæringen: en tavle som reiser seg og lyser sterkere mot 1789.
function Declaration({ t }: { t: number }) {
    const grp = useRef<THREE.Group>(null);
    const glow = useRef<THREE.MeshStandardMaterial>(null);
    const cur = useRef(0.001);
    useFrame((_, dt) => {
        cur.current = damp(cur.current, Math.max(0.001, t), dt, 3);
        const h = cur.current;
        if (grp.current) {
            grp.current.scale.y = Math.max(0.05, h);
            grp.current.visible = h > 0.04;
        }
        if (glow.current) glow.current.emissiveIntensity = 0.15 + h * 1.5;
    });
    return (
        <group ref={grp} position={[0, 0, -2.6]}>
            {/* sokkel + tavle */}
            <mesh position={[0, 1.7, 0]} castShadow>
                <boxGeometry args={[2.4, 3.2, 0.3]} />
                <meshStandardMaterial
                    ref={glow}
                    color="#fbf3da"
                    emissive="#f3c969"
                    emissiveIntensity={0.3}
                    roughness={0.4}
                />
            </mesh>
            <group position={[0, 3.5, 0]}>
                <GlowHalo color="#ffd778" size={1.2 + t * 0.9} />
            </group>
        </group>
    );
}

export default Stenderpyramiden3D;
