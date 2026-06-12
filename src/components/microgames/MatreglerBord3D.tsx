import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Interactive,
    SceneBanner,
    SceneBadge,
    DataReadout,
    WinScreen,
    Burst,
    ChoiceRow,
    damp,
    type ChoiceItem,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: matreglerbordet. Det samme bordet med seks matvarer står dekket.
// Eleven velger en religion, og de samme matvarene blir grønne (lov) eller
// røde (forbudt) etter reglene i den troen. Klikk en matvare for å se hvorfor.
// Lyspære: samme mat kan være helt vanlig i én religion og forbudt i en annen.

interface Food {
    id: string;
    name: string;
    color: string;
    x: number;
}

const FOODS: Food[] = [
    { id: 'svin', name: 'Svinekjøtt', color: '#f7a8b8', x: -5 },
    { id: 'okse', name: 'Oksekjøtt', color: '#a0522d', x: -3 },
    { id: 'reker', name: 'Reker', color: '#fb923c', x: -1 },
    { id: 'fisk', name: 'Fisk', color: '#7dd3fc', x: 1 },
    { id: 'vin', name: 'Vin', color: '#7f1d1d', x: 3 },
    { id: 'brod', name: 'Brød', color: '#e3c08d', x: 5 },
];

interface Religion {
    id: string;
    name: string;
    lov: Record<string, boolean>;
    grunn: Record<string, string>;
}

const RELIGIONS: Religion[] = [
    {
        id: 'jodedom',
        name: 'Jødedom',
        lov: { svin: false, okse: true, reker: false, fisk: true, vin: true, brod: true },
        grunn: {
            svin: 'Gris er ikke kosher. Jøder spiser ikke svinekjøtt.',
            reker: 'Bare fisk med finner og skjell er kosher. Reker er ikke lov.',
        },
    },
    {
        id: 'islam',
        name: 'Islam',
        lov: { svin: false, okse: true, reker: true, fisk: true, vin: false, brod: true },
        grunn: {
            svin: 'Svin er haram, altså forbudt i islam.',
            vin: 'Alkohol er forbudt i islam.',
        },
    },
    {
        id: 'hinduisme',
        name: 'Hinduisme',
        lov: { svin: true, okse: false, reker: true, fisk: true, vin: true, brod: true },
        grunn: {
            okse: 'Kua er hellig i hinduismen. Mange hinduer spiser ikke oksekjøtt.',
        },
    },
    {
        id: 'buddhisme',
        name: 'Buddhisme',
        lov: { svin: false, okse: false, reker: false, fisk: false, vin: false, brod: true },
        grunn: {
            svin: 'Mange buddhister er vegetarianere og vil ikke drepe dyr.',
            okse: 'Mange buddhister er vegetarianere og vil ikke drepe dyr.',
            reker: 'Mange buddhister er vegetarianere og spiser ikke sjømat.',
            fisk: 'Mange buddhister er vegetarianere og spiser ikke fisk.',
            vin: 'Mange buddhister unngår alkohol og andre rusmidler.',
        },
    },
    {
        id: 'kristendom',
        name: 'Kristendom',
        lov: { svin: true, okse: true, reker: true, fisk: true, vin: true, brod: true },
        grunn: {},
    },
];

// En matvare på bordet. Lov = løftes og lyser grønt, forbudt = synker og lyser
// rødt, nøytral = hviler grått. Driver alt fra én verdi (verdict) via damp.
function FoodMesh({
    food,
    verdict,
    onClick,
}: {
    food: Food;
    verdict: 'lov' | 'forbudt' | 'neutral';
    onClick: () => void;
}) {
    const group = useRef<THREE.Group>(null);
    const ring = useRef<THREE.MeshStandardMaterial>(null);
    const ringColor = useMemo(() => new THREE.Color(), []);

    useFrame((_, dt) => {
        if (!group.current) return;
        const targetY = verdict === 'lov' ? 1.35 : verdict === 'forbudt' ? 0.55 : 0.95;
        group.current.position.y = damp(group.current.position.y, targetY, dt, 6);
        if (ring.current) {
            const target =
                verdict === 'lov' ? '#22c55e' : verdict === 'forbudt' ? '#ef4444' : '#cbd5e1';
            ringColor.set(target);
            ring.current.color.lerp(ringColor, 1 - Math.exp(-8 * dt));
            const targetOpacity = verdict === 'neutral' ? 0.35 : 0.9;
            ring.current.opacity = damp(ring.current.opacity, targetOpacity, dt, 8);
        }
    });

    return (
        <Interactive
            position={[food.x, 0.95, 0]}
            onSelect={onClick}
            hitArea={[1.8, 2.2, 1.8]}
            state={verdict === 'lov' ? 'correct' : verdict === 'forbudt' ? 'wrong' : 'idle'}
        >
            <group ref={group}>
                {/* selve matvaren */}
                <mesh castShadow position={[0, 0.35, 0]}>
                    <boxGeometry args={[1, 0.7, 1]} />
                    <meshStandardMaterial color={food.color} roughness={0.6} />
                </mesh>
                {/* liten topp for variasjon */}
                <mesh castShadow position={[0, 0.8, 0]}>
                    <boxGeometry args={[0.7, 0.25, 0.7]} />
                    <meshStandardMaterial color={food.color} roughness={0.7} />
                </mesh>
                {/* fargering på tallerkenen som viser dommen */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
                    <ringGeometry args={[0.62, 0.82, 32]} />
                    <meshStandardMaterial
                        ref={ring}
                        color="#cbd5e1"
                        transparent
                        opacity={0.35}
                        emissive="#000000"
                    />
                </mesh>
                {/* tallerken */}
                <mesh receiveShadow position={[0, -0.05, 0]}>
                    <cylinderGeometry args={[0.7, 0.62, 0.1, 24]} />
                    <meshStandardMaterial color="#f8fafc" roughness={0.4} />
                </mesh>
            </group>
        </Interactive>
    );
}

function TableScene({
    religion,
    onFood,
}: {
    religion: Religion | null;
    onFood: (f: Food) => void;
}) {
    return (
        <group>
            {/* gulv */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial color="#efe4d2" roughness={1} />
            </mesh>
            {/* bordplate */}
            <mesh position={[0, 0.35, 0]} receiveShadow castShadow>
                <boxGeometry args={[13, 0.5, 4.2]} />
                <meshStandardMaterial color="#b07a46" roughness={0.7} />
            </mesh>
            {/* bordduk-stripe */}
            <mesh position={[0, 0.61, 0]} receiveShadow>
                <boxGeometry args={[13.2, 0.04, 2]} />
                <meshStandardMaterial color="#fcf6ea" roughness={0.9} />
            </mesh>
            {/* bordben */}
            {[
                [-6, -1.8],
                [6, -1.8],
                [-6, 1.8],
                [6, 1.8],
            ].map(([x, z], i) => (
                <mesh key={i} position={[x, -0.1, z]} castShadow>
                    <boxGeometry args={[0.4, 1.4, 0.4]} />
                    <meshStandardMaterial color="#8a5a30" roughness={0.8} />
                </mesh>
            ))}
            {/* matvarene */}
            {FOODS.map((f) => {
                const verdict: 'lov' | 'forbudt' | 'neutral' = !religion
                    ? 'neutral'
                    : religion.lov[f.id]
                      ? 'lov'
                      : 'forbudt';
                return <FoodMesh key={f.id} food={f} verdict={verdict} onClick={() => onFood(f)} />;
            })}
        </group>
    );
}

const MatreglerBord3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [religionId, setReligionId] = useState<string | null>(null);
    const [explored, setExplored] = useState<string[]>([]);
    const [banner, setBanner] = useState<string | null>(
        'Velg en religion under bildet, og se hva som er lov og forbudt å spise.'
    );
    const [burst, setBurst] = useState(0);
    const [won, setWon] = useState(false);

    const religion = RELIGIONS.find((r) => r.id === religionId) ?? null;

    const reset = () => {
        setReligionId(null);
        setExplored([]);
        setBanner('Velg en religion under bildet, og se hva som er lov og forbudt å spise.');
        setWon(false);
    };

    const pickReligion = (id: string) => {
        if (won) return;
        setReligionId(id);
        sounds.play('select');
        const r = RELIGIONS.find((x) => x.id === id)!;
        const forbudt = FOODS.filter((f) => !r.lov[f.id]).map((f) => f.name.toLowerCase());
        setBanner(
            forbudt.length
                ? `${r.name}: ${forbudt.join(', ')} er forbudt. Klikk en matvare for å se hvorfor.`
                : `${r.name} har få matregler i dag. Det meste er lov å spise.`
        );
        if (!explored.includes(id)) {
            const next = [...explored, id];
            setExplored(next);
            setBurst((b) => b + 1);
            if (next.length >= RELIGIONS.length) {
                setWon(true);
                sounds.play('complete');
                onComplete({ score: 1, completed: true });
            } else {
                sounds.play('correct');
            }
        }
    };

    const onFood = (f: Food) => {
        if (!religion) {
            setBanner('Velg en religion først, så kan du klikke på maten.');
            return;
        }
        const lov = religion.lov[f.id];
        sounds.play(lov ? 'correct' : 'incorrect');
        if (lov) {
            setBanner(`${f.name} er vanlig å spise i ${religion.name.toLowerCase()}.`);
        } else {
            setBanner(religion.grunn[f.id] ?? `${f.name} er forbudt i ${religion.name.toLowerCase()}.`);
        }
    };

    const choices: ChoiceItem[] = RELIGIONS.map((r) => ({
        id: r.id,
        title: r.name,
        status: won
            ? 'done'
            : explored.includes(r.id)
              ? 'done'
              : 'active',
    }));

    return (
        <MicroGameScaffold
            title="Matreglerbordet"
            subtitle="Samme bord, ulike regler. Velg en religion og se hva som er lov å spise."
            estimatedSeconds={150}
            onRetry={reset}
            canvas={{
                idle: religionId === null,
                camera: { position: [0, 7.5, 12], fov: 42 },
                background: '#f3ead9',
                fog: { near: 28, far: 55 },
                target: [0, 1, 0],
            }}
            scene={
                <>
                    <TableScene religion={religion} onFood={onFood} />
                    <Burst position={[0, 2, 0]} trigger={burst} color="#fde68a" />
                </>
            }
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <DataReadout
                        corner="bl"
                        items={[{ label: 'Religioner utforsket', value: `${explored.length}/5` }]}
                    />
                    <SceneBadge corner="br">{religion ? religion.name : 'Velg en religion'}</SceneBadge>
                </>
            }
        >
            {won ? (
                <WinScreen
                    title="Du har sett alle bordene!"
                    onReplay={reset}
                >
                    Samme svinekjøtt var forbudt for jøder og muslimer, men greit for kristne. Kua var
                    hellig for hinduer. Hva du får lov til å spise, henger sammen med hva du tror på.
                </WinScreen>
            ) : (
                <ChoiceRow items={choices} onSelect={pickReligion} />
            )}
        </MicroGameScaffold>
    );
};

export default MatreglerBord3D;
