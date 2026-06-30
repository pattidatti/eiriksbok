import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Crosshair, Hand, ArrowLeftRight } from 'lucide-react';
import {
    MicroGameScaffold,
    Hotspot,
    Particles,
    Hill,
    Burst,
    SceneBanner,
    SceneBadge,
    DataReadout,
    DragHint,
    WinScreen,
    SceneFact,
    SceneSlider,
    StepTracker,
    THEMES,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Den fingerte flukten - et mikrospill om mongolenes mest beryktede taktikk.
//
// Lyspæren: mongolene vant ikke fordi de var sterkest, men fordi de var raskest
// og mest disiplinerte. Den fingerte flukten gjorde fiendens egen iver til en
// felle. De later som de flykter i panikk, den tunge fienden jager etter og blir
// strukket ut i en lang, sliten linje, og så lukkes bakholdet fra begge sider.
//
// Tre grep, tre interaksjonstyper:
//   1. Egg fienden  (klikk-hotspot: de lette rytterne skyter piler og lokker)
//   2. Falsk flukt  (slider: dra tilbake, se den tette blokka strekkes ut)
//   3. Lukk fellen  (to klikk: bakholdet sveiper inn fra begge flanker)
//
// Hele scenen drives av to tilstander - `phase` og `retreat` - og hvert delobjekt
// demper mykt mot mål utledet av dem. Ingen ref leses i render.

const T = THEMES.medieval;

// Mongolenes hovedstyrke trekker seg fra x=0 mot x=RETREAT_END når retreat -> 1.
const RETREAT_END = -13;
// Hvor langt fienden jager når den er full strukket ut.
const CHASE_SPAN = 16;

// ── En lett lavpoly-rytter (hest + rytter). Holdt billig for Chromebook. ──
function Rider({
    mount = '#7a4a28',
    cloak = '#9a3b2e',
    helmet = false,
    bow = false,
    bobPhase = 0,
}: {
    mount?: string;
    cloak?: string;
    helmet?: boolean;
    bow?: boolean;
    bobPhase?: number;
}) {
    const g = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (!g.current) return;
        // Liten galopp-vugging så rytteren lever.
        g.current.position.y = Math.abs(Math.sin(clock.getElapsedTime() * 7 + bobPhase)) * 0.06;
    });
    return (
        <group ref={g}>
            {/* hestekropp */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[0.9, 0.34, 0.34]} />
                <meshStandardMaterial color={mount} roughness={0.92} flatShading />
            </mesh>
            {/* hals + hode (peker i +x = fremover) */}
            <mesh position={[0.5, 0.66, 0]} rotation={[0, 0, -0.5]} castShadow>
                <boxGeometry args={[0.3, 0.22, 0.22]} />
                <meshStandardMaterial color={mount} roughness={0.92} flatShading />
            </mesh>
            {/* bein */}
            {[
                [0.32, 0.18],
                [0.32, -0.18],
                [-0.32, 0.18],
                [-0.32, -0.18],
            ].map(([x, z], i) => (
                <mesh key={i} position={[x, 0.18, z]} castShadow>
                    <boxGeometry args={[0.09, 0.36, 0.09]} />
                    <meshStandardMaterial color={mount} roughness={0.92} />
                </mesh>
            ))}
            {/* rytterkropp */}
            <mesh position={[-0.05, 0.86, 0]} castShadow>
                <boxGeometry args={[0.24, 0.36, 0.22]} />
                <meshStandardMaterial color={cloak} roughness={0.88} />
            </mesh>
            {/* hode */}
            <mesh position={[-0.05, 1.12, 0]} castShadow>
                <sphereGeometry args={[0.12, 10, 10]} />
                <meshStandardMaterial color="#e0b98c" roughness={0.8} />
            </mesh>
            {helmet && (
                <mesh position={[-0.05, 1.18, 0]} castShadow>
                    <coneGeometry args={[0.14, 0.2, 8]} />
                    <meshStandardMaterial color="#9aa0aa" metalness={0.5} roughness={0.4} />
                </mesh>
            )}
            {bow && (
                <mesh position={[0.12, 0.92, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.18, 0.025, 6, 12, Math.PI * 1.2]} />
                    <meshStandardMaterial color="#5c3f26" roughness={0.85} />
                </mesh>
            )}
        </group>
    );
}

// ── Mongolenes hovedstyrke: de lette bueskytterne som lokker og flykter ──
function MongolHorde({ retreat }: { retreat: number }) {
    const g = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!g.current) return;
        const targetX = RETREAT_END * retreat;
        g.current.position.x = damp(g.current.position.x, targetX, dt, 3);
    });
    const riders: [number, number][] = [
        [0, 0],
        [-1, 0.9],
        [-1, -0.9],
        [-2, 0.2],
    ];
    return (
        <group ref={g} position={[0, 0, 0]}>
            {riders.map(([x, z], i) => (
                <group key={i} position={[x, 0, z]} rotation={[0, Math.PI, 0]}>
                    {/* snur seg framover (mot fienden) når de står, men de RIR bakover */}
                    <Rider mount="#6b4226" cloak="#c0392b" bow bobPhase={i * 1.3} />
                </group>
            ))}
        </group>
    );
}

// ── En enkelt tung fiende-rytter som jager. Front-rekkene er ivrigst og
//    drar fra, bakerste rekkene henger etter -> blokka strekkes ut. ──
function EnemyKnight({
    base,
    eager,
    retreat,
    bobPhase,
}: {
    base: [number, number];
    eager: number;
    retreat: number;
    bobPhase: number;
}) {
    const g = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!g.current) return;
        const targetX = base[0] - retreat * CHASE_SPAN * eager;
        g.current.position.x = damp(g.current.position.x, targetX, dt, 2.4);
    });
    return (
        <group ref={g} position={[base[0], 0, base[1]]}>
            {/* peker mot -x (jager mongolene mot venstre) */}
            <Rider mount="#4a3a30" cloak="#3b5a78" helmet bobPhase={bobPhase} />
        </group>
    );
}

function EnemyBlock({ retreat }: { retreat: number }) {
    // Tett 3-rekkers blokk i ro. Fremste rytter (lavest baseX) er ivrigst.
    const knights: { base: [number, number]; eager: number }[] = [
        { base: [6.0, 0], eager: 1.35 },
        { base: [6.4, 1.1], eager: 1.2 },
        { base: [6.4, -1.1], eager: 1.2 },
        { base: [7.4, 0.5], eager: 0.95 },
        { base: [7.4, -0.5], eager: 0.95 },
        { base: [8.4, 1.0], eager: 0.7 },
        { base: [8.4, -1.0], eager: 0.7 },
        { base: [9.2, 0], eager: 0.5 },
    ];
    return (
        <group>
            {knights.map((k, i) => (
                <EnemyKnight
                    key={i}
                    base={k.base}
                    eager={k.eager}
                    retreat={retreat}
                    bobPhase={i * 0.8}
                />
            ))}
        </group>
    );
}

// ── Bakholdsstyrken: skjult bak en ås, sveiper inn fra en flanke ved seier ──
function FlankUnit({ side, closing }: { side: 1 | -1; closing: boolean }) {
    const g = useRef<THREE.Group>(null);
    // Starter gjemt bak åsen ute ved kanten, sveiper inn mot midten av den
    // strukne fiendelinja (rundt x=-7) når flanken lukkes.
    const startZ = side * 8.5;
    const endZ = side * 1.6;
    useFrame((_, dt) => {
        if (!g.current) return;
        const targetZ = closing ? endZ : startZ;
        g.current.position.z = damp(g.current.position.z, targetZ, dt, 2.2);
    });
    const riders: [number, number][] = [
        [0, 0],
        [1.1, side * 0.4],
        [-1.1, side * 0.4],
    ];
    return (
        <group ref={g} position={[-7, 0, startZ]}>
            {riders.map(([x, z], i) => (
                <group
                    key={i}
                    position={[x, 0, z]}
                    rotation={[0, side === 1 ? Math.PI : 0, 0]}
                >
                    <Rider mount="#6b4226" cloak="#c0392b" bow bobPhase={i * 1.7 + 4} />
                </group>
            ))}
        </group>
    );
}

// ── Pilregn under egging: små piler som buer mot fienden, looper mens active ──
function Arrows({ active }: { active: boolean }) {
    const arrows = useRef<THREE.Mesh[]>([]);
    const N = 5;
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        for (let i = 0; i < N; i++) {
            const m = arrows.current[i];
            if (!m) continue;
            m.visible = active;
            if (!active) continue;
            const cycle = (t * 1.1 + i / N) % 1;
            m.position.x = -1.5 + cycle * 8;
            m.position.z = (i - (N - 1) / 2) * 0.45;
            m.position.y = 1 + Math.sin(cycle * Math.PI) * 1.6;
            m.rotation.z = -Math.cos(cycle * Math.PI) * 0.7;
        }
    });
    return (
        <group>
            {Array.from({ length: N }).map((_, i) => (
                <mesh
                    key={i}
                    ref={(el) => {
                        if (el) arrows.current[i] = el;
                    }}
                    rotation={[0, 0, 0]}
                    visible={false}
                >
                    <boxGeometry args={[0.5, 0.04, 0.04]} />
                    <meshStandardMaterial color="#3a2a1a" roughness={0.8} />
                </mesh>
            ))}
        </group>
    );
}

function Steppe() {
    return (
        <group>
            {/* steppegrunnen */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[52, 40]} />
                <meshStandardMaterial color="#8a9456" roughness={1} />
            </mesh>
            {/* åser som skjuler bakholdet ute ved kantene */}
            <Hill position={[-7, -0.4, 11]} radius={6} height={3} color="#7a8a4a" seed={3} />
            <Hill position={[-7, -0.4, -11]} radius={6} height={3} color="#75854a" seed={7} />
            <Hill position={[15, -0.6, -8]} radius={5} height={2.4} color="#809050" seed={11} />
        </group>
    );
}

const Scene = ({
    phase,
    retreat,
    left,
    right,
    burst,
    onBait,
    onCloseLeft,
    onCloseRight,
}: {
    phase: number;
    retreat: number;
    left: boolean;
    right: boolean;
    burst: number;
    onBait: () => void;
    onCloseLeft: () => void;
    onCloseRight: () => void;
}) => {
    const r = retreat / 100;
    return (
        <group>
            <Steppe />
            <MongolHorde retreat={r} />
            <EnemyBlock retreat={r} />
            <Arrows active={phase === 1} />

            {/* Bakholdet vises når fellen er klar (fase 2+) og sveiper inn ved klikk */}
            {phase >= 2 && <FlankUnit side={1} closing={left} />}
            {phase >= 2 && <FlankUnit side={-1} closing={right} />}

            {/* Steg 1: egg fienden - hotspot foran den tette blokka */}
            {phase === 0 && (
                <Hotspot position={[3.5, 1.6, 0]} onSelect={onBait} label="Egg fienden" radius={0.6} />
            )}

            {/* Steg 3: lukk fellen fra begge sider */}
            {phase >= 2 && !left && (
                <Hotspot
                    position={[-7, 1.4, 5]}
                    onSelect={onCloseLeft}
                    label="Lukk venstre flanke"
                    radius={0.6}
                />
            )}
            {phase >= 2 && !right && (
                <Hotspot
                    position={[-7, 1.4, -5]}
                    onSelect={onCloseRight}
                    label="Lukk høyre flanke"
                    radius={0.6}
                />
            )}

            <Burst position={[-7, 2, 0]} trigger={burst} color="#e3b23c" count={34} spread={4} />
            <Particles preset="dust" />
        </group>
    );
};

const FingertFlukt3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [phase, setPhase] = useState(0); // 0 egg, 1 flukt, 2 felle klar, 3 vunnet
    const [retreat, setRetreat] = useState(0); // 0-100 slider
    const [left, setLeft] = useState(false);
    const [right, setRight] = useState(false);
    const [banner, setBanner] = useState<string | null>(null);
    const [won, setWon] = useState(false);
    const [burst, setBurst] = useState(0);

    const bait = () => {
        if (phase !== 0) return;
        setPhase(1);
        setBanner('Pilene hagler! Den tunge fienden mister tålmodigheten og setter etter.');
        sounds.play('advance');
    };

    const onSlider = (v: number) => {
        if (phase < 1 || phase >= 2) return;
        setRetreat(v);
        if (v >= 100) {
            setPhase(2);
            setBanner('Fienden er strukket ut i en lang, sliten linje. Nå! Lukk fellen fra begge sider.');
            sounds.play('correct');
        }
    };

    const tryFinish = (l: boolean, r: boolean) => {
        if (l && r) {
            setPhase(3);
            setBanner('Bakholdet smeller igjen. Den strukne fienden er omringet.');
            sounds.play('complete');
            setBurst((b) => b + 1);
            setTimeout(() => {
                setWon(true);
                onComplete({ score: 1, completed: true, artifact: { tactic: 'fingert-flukt' } });
            }, 1300);
        }
    };

    const closeLeft = () => {
        if (phase < 2 || left) return;
        setLeft(true);
        sounds.play('advance');
        tryFinish(true, right);
    };

    const closeRight = () => {
        if (phase < 2 || right) return;
        setRight(true);
        sounds.play('advance');
        tryFinish(left, true);
    };

    const reset = () => {
        setPhase(0);
        setRetreat(0);
        setLeft(false);
        setRight(false);
        setBanner(null);
        setWon(false);
    };

    const stepNo = phase === 0 ? 1 : phase === 1 ? 2 : 3;

    return (
        <MicroGameScaffold
            title="Den fingerte flukten"
            subtitle="Slå en tyngre fiende med fart og disiplin, slik mongolene gjorde"
            estimatedSeconds={150}
            onRetry={phase > 0 ? reset : undefined}
            scene={
                <Scene
                    phase={phase}
                    retreat={retreat}
                    left={left}
                    right={right}
                    burst={burst}
                    onBait={bait}
                    onCloseLeft={closeLeft}
                    onCloseRight={closeRight}
                />
            }
            canvas={{
                idle: phase === 0,
                camera: { position: [3, 12, 18], fov: 40 },
                background: T.sky,
                fog: { color: T.fog, near: 34, far: 60 },
                target: [-3, 0.5, 0],
                light: 'golden',
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">1223 · Slaget ved Kalka</SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[{ label: 'Fienden strukket ut', value: Math.round(retreat), unit: '%' }]}
                    />
                    <DragHint show={phase === 0} corner="bc">
                        Klikk «Egg fienden» for å lokke dem
                    </DragHint>
                </>
            }
        >
            <div className="mb-2.5 flex items-center justify-between gap-2">
                <StepTracker current={stepNo} total={3} />
                {phase >= 1 && phase < 3 && (
                    <span className="text-[11px] font-semibold text-amber-700">
                        {phase === 1 ? 'Steg 2: dra spaken og flykt' : 'Steg 3: lukk begge flanker'}
                    </span>
                )}
            </div>

            {/* Steg 1: egg fienden (knapp speiler hotspoten i scenen) */}
            {phase === 0 && (
                <button
                    onClick={bait}
                    className="w-full rounded-xl border-2 border-amber-400 bg-amber-100 hover:bg-amber-200 p-3 flex items-center gap-2.5 transition cursor-pointer"
                >
                    <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                        <Crosshair className="w-5 h-5" />
                    </span>
                    <span className="text-left">
                        <span className="block text-sm font-bold text-slate-800">Egg fienden med pilregn</span>
                        <span className="block text-xs text-slate-500">
                            De lette rytterne skyter og lokker den tunge blokka til å jage.
                        </span>
                    </span>
                </button>
            )}

            {/* Steg 2: falsk flukt - kjernekontrollen */}
            {phase >= 1 && (
                <div className={phase >= 2 ? 'opacity-60 pointer-events-none' : ''}>
                    <SceneSlider
                        label="Falsk flukt — dra tilbake og strekk fienden ut"
                        min={0}
                        max={100}
                        value={retreat}
                        onChange={onSlider}
                        valueLabel={(v) => `${Math.round(v)}%`}
                    />
                </div>
            )}

            {/* Steg 3: lukk fellen (knapper speiler hotspotene) */}
            {phase >= 2 && !won && (
                <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    <button
                        onClick={closeLeft}
                        disabled={left}
                        className={`rounded-xl border-2 p-3 flex items-center gap-2 transition ${
                            left
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-amber-100 border-amber-400 hover:bg-amber-200 cursor-pointer'
                        }`}
                    >
                        <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-bold">
                            {left ? 'Venstre flanke lukket' : 'Lukk venstre flanke'}
                        </span>
                    </button>
                    <button
                        onClick={closeRight}
                        disabled={right}
                        className={`rounded-xl border-2 p-3 flex items-center gap-2 transition ${
                            right
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-amber-100 border-amber-400 hover:bg-amber-200 cursor-pointer'
                        }`}
                    >
                        <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-bold">
                            {right ? 'Høyre flanke lukket' : 'Lukk høyre flanke'}
                        </span>
                    </button>
                </div>
            )}

            {/* Forklaring underveis / seier */}
            <div className="mt-3">
                {won ? (
                    <WinScreen title="Bakholdet lukket. Du vant uten å være sterkest." onReplay={reset}>
                        Mongolene vant ikke fordi de var flest eller tyngst, men fordi de var raske og
                        disiplinerte nok til å late som de flyktet. Iveren til den tunge fienden ble dens
                        egen felle: den strakk seg ut, ble sliten og kunne omringes.
                    </WinScreen>
                ) : phase === 1 ? (
                    <SceneFact>
                        Se hva som skjer: jo lenger du flykter, jo mer strekker den tette fiendeblokka seg ut.
                        De ivrigste rir fra, de tyngste henger etter. Flykt helt til linja er strukket ut.
                    </SceneFact>
                ) : phase === 0 ? (
                    <p className="text-center text-xs text-slate-500 italic px-2 mt-1">
                        <Hand className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                        Du styrer den lette mongolske rytterstyrken. Begynn med å egge fienden.
                    </p>
                ) : null}
            </div>
        </MicroGameScaffold>
    );
};

export default FingertFlukt3D;
