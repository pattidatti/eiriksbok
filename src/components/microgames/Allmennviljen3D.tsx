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
    Figure,
    Tree,
    Burst,
    GlowHalo,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: "Allmennviljen". Eleven skyver en spak fra PRIVAT VILJE til
// ALLMENNVILJE. Til venstre står fem innbyggere spredt utover og snur ryggen
// til hverandre - hver drar i sin egen retning. Mens spaken skyves mot høyre
// samler de seg rundt torget, vender seg mot hverandre, og en felles LOV reiser
// seg i midten og begynner å lyse. Lyspæren: allmennviljen er ikke summen av de
// private ønskene - den er det landsbyen vil som ETT fellesskap, og loven de gir
// seg selv binder dem sammen i stedet for å splitte dem.

type Phase = 'play' | 'won';

const CITIZEN_COLORS_SPLIT = '#6b7785';
const CITIZEN_COLORS_UNITED = '#c08a55';

function moodLabel(t: number): string {
    if (t < 0.25) return 'Splittet landsby';
    if (t < 0.6) return 'På vei sammen';
    if (t < 0.88) return 'Nesten enige';
    return 'Felles lov';
}

const Allmennviljen3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [pct, setPct] = useState(0); // 0 = privat vilje, 100 = allmennvilje
    const [phase, setPhase] = useState<Phase>('play');
    const [burst, setBurst] = useState(0);

    const t = pct / 100;
    const canEnact = t >= 0.88 && phase === 'play';
    const fellesskap = Math.round(t * 100);
    const splittelse = Math.round((1 - t) * 100);

    const enactLaw = () => {
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
              ? 'Nå står alle samlet. Vedta loven dere gir dere selv.'
              : pct < 5
                ? 'Skyv spaken fra privat vilje mot allmennvilje. Se hva som skjer med landsbyen.'
                : t < 0.6
                  ? 'Når hver enkelt bare følger sin egen vilje, drar landsbyen i hver sin retning.'
                  : null;

    return (
        <MicroGameScaffold
            title="Allmennviljen"
            subtitle="Skyv landsbyen fra privat vilje til det som tjener fellesskapet"
            estimatedSeconds={130}
            onRetry={pct > 0 ? reset : undefined}
            canvas={{
                idle: pct < 1,
                camera: { position: [0, 7.5, 13], fov: 42 },
                background: '#dfe9f2',
                target: [0, 1.2, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">{moodLabel(t)}</SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[
                            { label: 'Splittelse', value: splittelse },
                            { label: 'Fellesskap', value: fellesskap },
                        ]}
                    />
                </>
            }
            scene={<SquareScene t={t} canEnact={canEnact} onEnact={enactLaw} burst={burst} />}
        >
            <div className="flex flex-col gap-3">
                <SceneSlider
                    label="Privat vilje  →  Allmennvilje"
                    min={0}
                    max={100}
                    step={1}
                    value={pct}
                    onChange={(v) => phase === 'play' && setPct(v)}
                    valueLabel={(v) => `${v} %`}
                />
                {phase === 'won' ? (
                    <WinScreen title="Dere vedtok loven sammen!" onReplay={reset}>
                        Da hver innbygger bare fulgte sin egen vilje, trakk landsbyen fra hverandre.
                        Allmennviljen er ikke summen av alle de private ønskene lagt sammen. Den er
                        det fellesskapet vil som en helhet. Og fordi dere ga loven til dere selv, er
                        det å følge den ekte frihet, mente Rousseau.
                    </WinScreen>
                ) : (
                    <SceneFact>
                        Se på tallene nede til venstre. Jo mer alle tenker på fellesskapet, jo mindre
                        splittet blir landsbyen. Loven i midten reiser seg bare når innbyggerne vil
                        det samme.
                    </SceneFact>
                )}
            </div>
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function SquareScene({
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
    const count = 5;
    return (
        <group>
            <GroundPlane size={26} depth={24} color="#9bb36a" />

            {/* Trær i utkanten - liv rundt torget */}
            <Tree position={[-8, 0, -7]} seed={2} />
            <Tree position={[8, 0, -6]} seed={5} />
            <Tree position={[-7.5, 0, 5]} seed={8} />
            <Tree position={[7.6, 0, 5.5]} seed={3} />

            {/* Den felles loven i midten */}
            <CommonLaw t={t} />

            {/* Innbyggerne som samler seg */}
            {Array.from({ length: count }).map((_, i) => (
                <Citizen key={i} angle={(i / count) * Math.PI * 2} t={t} />
            ))}

            {/* Finale: vedta loven (direkte 3D-klikk) */}
            {canEnact && (
                <Hotspot
                    position={[0, 3.4, 0]}
                    onSelect={onEnact}
                    label="Vedta loven sammen"
                    radius={0.7}
                />
            )}

            <Burst position={[0, 2.6, 0]} trigger={burst} color="#ffe6a3" count={40} spread={5} />
        </group>
    );
}

// Den felles loven: en søyle som reiser seg og lyser sterkere når fellesskapet
// vokser. Symbolet på "loven vi gir oss selv".
function CommonLaw({ t }: { t: number }) {
    const grp = useRef<THREE.Group>(null);
    const capRef = useRef<THREE.MeshStandardMaterial>(null);
    const cur = useRef(0.001);
    useFrame((_, dt) => {
        cur.current = damp(cur.current, Math.max(0.001, t), dt, 3.5);
        const h = cur.current;
        if (grp.current) {
            grp.current.scale.y = Math.max(0.04, h);
            grp.current.visible = h > 0.03;
        }
        if (capRef.current) capRef.current.emissiveIntensity = 0.15 + h * 1.6;
    });
    return (
        <group ref={grp} position={[0, 0, 0]}>
            {/* Sokkel + skaft */}
            <mesh position={[0, 1.3, 0]} castShadow>
                <cylinderGeometry args={[0.42, 0.55, 2.6, 12]} />
                <meshStandardMaterial color="#e7e2d4" roughness={0.7} />
            </mesh>
            {/* Lysende topp - "loven" */}
            <group position={[0, 2.9, 0]}>
                <mesh castShadow>
                    <sphereGeometry args={[0.5, 20, 20]} />
                    <meshStandardMaterial
                        ref={capRef}
                        color="#ffdf91"
                        emissive="#f5b942"
                        emissiveIntensity={0.4}
                        roughness={0.3}
                    />
                </mesh>
                <GlowHalo color="#ffd778" size={1.1 + t * 0.8} />
            </group>
        </group>
    );
}

// En innbygger. Ved privat vilje (t=0) står hen langt ute og vender ryggen til
// torget. Mot allmennvilje (t=1) trekker hen innover og vender seg mot loven, og
// fargen varmes opp fra kald grå til varm.
function Citizen({ angle, t }: { angle: number; t: number }) {
    const grp = useRef<THREE.Group>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);
    const cur = useRef(0);
    const cold = new THREE.Color(CITIZEN_COLORS_SPLIT);
    const warm = new THREE.Color(CITIZEN_COLORS_UNITED);
    useFrame((_, dt) => {
        cur.current = damp(cur.current, t, dt, 3);
        const u = cur.current;
        const r = 6.2 - u * 3.9; // langt ute -> tett rundt torget
        const x = Math.sin(angle) * r;
        const z = Math.cos(angle) * r;
        if (grp.current) {
            grp.current.position.set(x, 0, z);
            // u=0: vender utover (angle). u=1: vender mot midten (angle + PI).
            grp.current.rotation.y = angle + Math.PI * u;
        }
        if (matRef.current) matRef.current.color.lerpColors(cold, warm, u);
    });
    return (
        <group ref={grp}>
            <Figure body={CITIZEN_COLORS_SPLIT} skin="#e0b98c">
                {/* Overstyr kroppsfargen via et eget mesh slik at vi kan lerpe den */}
                <mesh position={[0, 0.45, 0]}>
                    <capsuleGeometry args={[0.22, 0.5, 4, 8]} />
                    <meshStandardMaterial ref={matRef} color={CITIZEN_COLORS_SPLIT} roughness={0.8} />
                </mesh>
            </Figure>
        </group>
    );
}

export default Allmennviljen3D;
