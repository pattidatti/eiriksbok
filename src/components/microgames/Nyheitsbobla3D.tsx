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
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// 8 nyheitskategoriar med fargar
const CARDS = [
    { id: 0, label: 'Klima', color: '#2d9a54' },
    { id: 1, label: 'Sport', color: '#2563eb' },
    { id: 2, label: 'Politikk', color: '#7c3aed' },
    { id: 3, label: 'Teknologi', color: '#4338ca' },
    { id: 4, label: 'Vitskap', color: '#0d9488' },
    { id: 5, label: 'Kultur', color: '#ea580c' },
    { id: 6, label: 'Internasjonalt', color: '#dc2626' },
    { id: 7, label: 'Lokalt', color: '#ca8a04' },
] as const;

type CardData = (typeof CARDS)[number];
type Phase = 'choosing' | 'filtered' | 'revealing' | 'won';

const N = CARDS.length;
const MAX_SEL = 3;
const RADIUS = 3.2;
const BASE_Y = 1.5;

function cardAngle(i: number) {
    return (i / N) * Math.PI * 2 - Math.PI / 2;
}

const Nyheitsbobla3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [selected, setSelected] = useState<ReadonlySet<number>>(new Set<number>());
    const [phase, setPhase] = useState<Phase>('choosing');
    const [burst, setBurst] = useState(0);
    const [banner, setBanner] = useState<string | null>(
        'Klikk på tre nyhende du ville lest. Sjå kva som skjer med resten.'
    );

    const reset = () => {
        setSelected(new Set<number>());
        setPhase('choosing');
        setBanner('Klikk på tre nyhende du ville lest. Sjå kva som skjer med resten.');
    };

    const selectCard = (id: number) => {
        if (phase !== 'choosing' || selected.size >= MAX_SEL) return;
        sounds.play('correct');
        const next = new Set(selected);
        next.add(id);
        setSelected(next);
        if (next.size === MAX_SEL) {
            setTimeout(() => {
                setPhase('filtered');
                setBanner('Algoritmen er aktiv. 5 nyhende er no skjulte under bordet.');
            }, 500);
        }
    };

    const revealAll = () => {
        sounds.play('advance');
        setPhase('revealing');
        setBanner('Dei gøymde nyheitene stig opp att. Klikk på eitt du ikkje hadde sett!');
    };

    const discoverCard = (id: number) => {
        if (phase !== 'revealing' || selected.has(id)) return;
        sounds.play('complete');
        setBurst((b) => b + 1);
        setPhase('won');
        setBanner(null);
        onComplete({ score: 1, completed: true });
    };

    return (
        <MicroGameScaffold
            title="Nyheitsbordet"
            subtitle="Vel favorittane dine og sjå kva algoritmen gøymer"
            estimatedSeconds={120}
            onRetry={phase !== 'choosing' ? reset : undefined}
            canvas={{
                idle: phase === 'choosing' && selected.size === 0,
                camera: { position: [0, 10, 12], fov: 44 },
                background: '#e8f0f8',
                target: [0, 0.5, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} />
                    <SceneBadge corner="br">
                        {phase === 'choosing'
                            ? `${selected.size}/${MAX_SEL} valt`
                            : phase === 'filtered'
                            ? `${MAX_SEL} av ${N} synlege`
                            : phase === 'revealing'
                            ? 'Sjå det gøymde!'
                            : 'Blindsona oppdaga!'}
                    </SceneBadge>
                </>
            }
            scene={
                <TableScene
                    selected={selected}
                    phase={phase}
                    burst={burst}
                    onSelect={selectCard}
                    onReveal={revealAll}
                    onDiscover={discoverCard}
                />
            }
        >
            {phase === 'choosing' && (
                <p className="text-sm text-slate-600 text-center py-2">
                    {selected.size < MAX_SEL
                        ? `Klikk på ${MAX_SEL - selected.size} nyhende til`
                        : 'Algoritmen aktiverer...'}
                </p>
            )}
            {phase === 'filtered' && (
                <div className="flex items-center justify-center gap-3 flex-wrap py-1">
                    <p className="text-sm text-slate-700">5 nyhende er skjulte under bordet</p>
                    <button
                        onClick={revealAll}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium transition-colors"
                    >
                        Sjå alt!
                    </button>
                </div>
            )}
            {phase === 'revealing' && (
                <p className="text-sm text-slate-600 text-center py-2">
                    Klikk på eit nyhende som var gøymt for å fullføre
                </p>
            )}
            {phase === 'won' && (
                <WinScreen title="Du fann det gøymde nyheitsbildet!" onReplay={reset}>
                    Algoritmen gøymde 5 av 8 nyhende basert på dei tre klikkane dine - utan at du ba
                    om det. Blindsonene er ikkje nyhende vi avviser; det er nyhende vi aldri ein gong
                    veit at finst.
                </WinScreen>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function TableScene({
    selected,
    phase,
    burst,
    onSelect,
    onReveal,
    onDiscover,
}: {
    selected: ReadonlySet<number>;
    phase: Phase;
    burst: number;
    onSelect: (id: number) => void;
    onReveal: () => void;
    onDiscover: (id: number) => void;
}) {
    return (
        <group>
            {/* Rundt bord */}
            <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[4.8, 4.8, 0.22, 40]} />
                <meshStandardMaterial color="#d4b896" roughness={0.7} />
            </mesh>
            {/* Bordkant */}
            <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[4.88, 4.88, 0.04, 40]} />
                <meshStandardMaterial color="#b89a76" roughness={0.8} />
            </mesh>
            {/* Bordsokkel */}
            <mesh position={[0, -1.5, 0]} castShadow>
                <cylinderGeometry args={[0.35, 0.6, 3, 12]} />
                <meshStandardMaterial color="#b89a76" roughness={0.9} />
            </mesh>
            {/* Golv */}
            <mesh position={[0, -3.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#c4d4e4" roughness={1} />
            </mesh>

            {/* Nyheitskort */}
            {CARDS.map((card, i) => (
                <NewsCard3D
                    key={card.id}
                    index={i}
                    card={card}
                    selected={selected.has(card.id)}
                    phase={phase}
                    onSelect={() => onSelect(card.id)}
                    onDiscover={() => onDiscover(card.id)}
                />
            ))}

            {/* Avdek-hotspot i midten */}
            {phase === 'filtered' && (
                <Hotspot
                    position={[0, 2.2, 0]}
                    onSelect={onReveal}
                    label="Sjå alt!"
                    radius={0.8}
                />
            )}

            {/* Vinnar-burst */}
            <Burst position={[0, 3.5, 0]} trigger={burst} color="#ffe9a8" count={50} spread={6} />
        </group>
    );
}

function NewsCard3D({
    index,
    card,
    selected,
    phase,
    onSelect,
    onDiscover,
}: {
    index: number;
    card: CardData;
    selected: boolean;
    phase: Phase;
    onSelect: () => void;
    onDiscover: () => void;
}) {
    const grp = useRef<THREE.Group>(null);
    const angle = cardAngle(index);
    const baseX = Math.cos(angle) * RADIUS;
    const baseZ = Math.sin(angle) * RADIUS;
    const yRef = useRef(BASE_Y);

    useFrame((_, dt) => {
        if (!grp.current) return;
        let target = BASE_Y;
        if (phase === 'filtered' && !selected) {
            target = -1.8; // synk under bordet
        } else if (selected) {
            target = BASE_Y + 0.55; // hev valde kort litt
        } else if (phase === 'revealing' && !selected) {
            target = BASE_Y; // stig opp att
        }
        yRef.current = damp(yRef.current, target, dt, 3);
        grp.current.position.y = yRef.current;
    });

    return (
        <group ref={grp} position={[baseX, BASE_Y, baseZ]}>
            {/* Kortflate */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[1.2, 0.07, 1.6]} />
                <meshStandardMaterial
                    color={selected ? card.color : '#f5f7fa'}
                    roughness={0.5}
                    emissive={selected ? card.color : '#000000'}
                    emissiveIntensity={selected ? 0.3 : 0}
                />
            </mesh>
            {/* Kategorifarge-stribe nedst */}
            <mesh position={[0, 0.05, 0.66]}>
                <boxGeometry args={[1.2, 0.04, 0.28]} />
                <meshStandardMaterial
                    color={card.color}
                    roughness={0.3}
                    emissive={card.color}
                    emissiveIntensity={0.15}
                />
            </mesh>

            {/* Hotspot for val i choosing-fase */}
            {phase === 'choosing' && !selected && (
                <Hotspot position={[0, 0.65, 0]} onSelect={onSelect} label={card.label} radius={0.5} />
            )}
            {/* Hotspot for oppdaging i revealing-fase */}
            {phase === 'revealing' && !selected && (
                <Hotspot
                    position={[0, 0.65, 0]}
                    onSelect={onDiscover}
                    label={`Klikk: ${card.label}`}
                    radius={0.5}
                />
            )}
        </group>
    );
}

export default Nyheitsbobla3D;
