import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    Figure,
    SceneBanner,
    SceneBadge,
    SceneFact,
    WinScreen,
    StepTracker,
    DataReadout,
    Burst,
    damp,
    dampV3,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill for km-14 (Lover, normer og konsekvenser). Bygger på artikkelens
// åpning: et spill uten regler blir kaos etter fem minutter. Her ser eleven det
// romlig. Banen starter i kaos - spillerne løper hvor de vil, ballen spretter
// vilt. Eleven legger på de tre regelnivåene ETT om gangen:
//   1) Regler  -> banelinjer, spillerne holder seg innenfor
//   2) Lov     -> en dommer + straff, spillerne slutter å kollidere
//   3) Normer  -> fair play, spillerne stiller opp og spiller ballen pent
// Aha: det trengs ALLE tre nivåene sammen for at "spillet" (samfunnet) skal
// fungere. Fjern reglene, og samarbeidet faller fra hverandre.

type Level = 0 | 1 | 2 | 3;

const STEPS = [
    {
        title: 'Legg til regler',
        fact: 'Regler er bestemmelser for et bestemt område - som banelinjene og hvor mange spillere et lag har. Nå vet alle hvor spillet foregår.',
    },
    {
        title: 'Legg til lov',
        fact: 'Loven gjelder for alle og håndheves av en upartisk makt - her dommeren som blåser i fløyta og deler ut straff. Uten en dommer kan den sterkeste bare ta ballen.',
    },
    {
        title: 'Legg til normer',
        fact: 'Normer er de uskrevne reglene: fair play, å håndhilse, å ikke jukse selv om dommeren ikke ser det. Først nå flyter spillet - laget samarbeider av seg selv.',
    },
];

// 6 spillere: 3 i rødt lag, 3 i blått lag.
const TEAM = ['#d24b3e', '#d24b3e', '#d24b3e', '#3b74c4', '#3b74c4', '#3b74c4'];

// Målposisjon for hver spiller på hvert nivå. Indeks = nivå (0..3).
// 0: kaos (spredt utenfor og innenfor), 1: trukket innenfor linjene,
// 2: to adskilte lag, 3: pene to rekker som spiller mot hverandre.
const TARGETS: [number, number][][] = [
    // spiller 0 (rød)
    [[-5.5, 3.2], [-2.4, 1.6], [-2.6, 1.4], [-2.6, 1.5]],
    // spiller 1 (rød)
    [[4.8, -3.0], [-1.8, -0.4], [-2.4, 0], [-2.4, 0]],
    // spiller 2 (rød)
    [[1.5, 4.4], [-2.8, -1.7], [-2.6, -1.5], [-2.6, -1.5]],
    // spiller 3 (blå)
    [[5.4, 2.6], [2.4, 1.5], [2.6, 1.5], [2.6, 1.5]],
    // spiller 4 (blå)
    [[-4.6, -3.4], [1.9, -0.3], [2.4, 0], [2.4, 0]],
    // spiller 5 (blå)
    [[-1.4, -4.2], [2.7, -1.6], [2.6, -1.5], [2.6, -1.5]],
];

const HALF_W = 6; // banens halve bredde (x)
const HALF_D = 4; // banens halve dybde (z)

const Spillereglene3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [level, setLevel] = useState<Level>(0);
    const [banner, setBanner] = useState<string | null>(
        'Spillet er i gang - men uten regler er det rent kaos. Legg til ett nivå om gangen.'
    );
    const [burst, setBurst] = useState(0);
    const won = level === 3;

    const advance = () => {
        const next = (level + 1) as Level;
        setLevel(next);
        sounds.play(next === 3 ? 'complete' : 'correct');
        if (next === 3) {
            setBanner(null);
            setBurst((b) => b + 1);
            onComplete({ score: 1, completed: true, artifact: { level: 3 } });
        } else {
            setBanner(STEPS[next - 1].fact);
        }
    };

    const reset = () => {
        setLevel(0);
        setBanner('Spillet er i gang - men uten regler er det rent kaos. Legg til ett nivå om gangen.');
    };

    const orden = Math.round((level / 3) * 100);
    const cur = level < 3 ? STEPS[level] : null;

    return (
        <MicroGameScaffold
            title="Spillet trenger regler"
            subtitle="Legg på regler, lov og normer - og se kaoset bli til et spill som funker"
            estimatedSeconds={120}
            onRetry={level > 0 ? reset : undefined}
            canvas={{
                idle: false,
                camera: { position: [0, 8.5, 11], fov: 40 },
                background: '#cfe6f5',
                target: [0, 0, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} />
                    <SceneBadge corner="br">
                        {won ? 'Spillet funker' : 'Lover, regler og normer'}
                    </SceneBadge>
                    <DataReadout
                        corner="tr"
                        items={[
                            { label: 'Orden', value: orden, unit: '%' },
                            { label: 'Nivåer', value: `${level}/3` },
                        ]}
                    />
                </>
            }
            scene={<PitchScene level={level} burst={burst} onAdvance={advance} />}
        >
            {!won && (
                <div className="flex flex-col gap-3">
                    <StepTracker current={level} total={3} />
                    <p className="text-sm font-bold text-slate-700">
                        Neste: {cur?.title}
                    </p>
                    <SceneFact>
                        {level === 0
                            ? 'Klikk det lysende punktet på banen for å legge til det neste regelnivået. Følg med på hvordan spillerne oppfører seg.'
                            : STEPS[level - 1].fact}
                    </SceneFact>
                </div>
            )}

            {won && (
                <WinScreen title="Nå funker spillet!" onReplay={reset}>
                    Du la på alle tre regelnivåene: regler ga banen rammer, loven ga en dommer som
                    håndhever rettferdig, og normene fikk spillerne til å samarbeide av seg selv.
                    Samfunnet fungerer på samme måte - det trenger alle tre nivåene sammen. Fjerner du
                    ett av dem, faller samarbeidet fra hverandre, akkurat som et spill uten regler.
                </WinScreen>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function PitchScene({
    level,
    burst,
    onAdvance,
}: {
    level: Level;
    burst: number;
    onAdvance: () => void;
}) {
    return (
        <group>
            {/* Gressbanen */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
                <planeGeometry args={[18, 13]} />
                <meshStandardMaterial color="#5b9c4f" roughness={1} />
            </mesh>

            {/* Banelinjer - dukker opp på nivå 1 (regler) */}
            <PitchLines show={level >= 1} />

            {/* Spillerne */}
            {TEAM.map((color, i) => (
                <Player key={i} index={i} color={color} level={level} />
            ))}

            {/* Ballen */}
            <Ball level={level} />

            {/* Dommeren - dukker opp på nivå 2 (lov) */}
            <Referee show={level >= 2} />

            {/* Hotspot for å legge til neste regelnivå */}
            {level < 3 && (
                <Hotspot
                    position={[0, 2.4, 0]}
                    onSelect={onAdvance}
                    label={STEPS[level].title}
                    radius={0.55}
                />
            )}

            <Burst position={[0, 1.4, 0]} trigger={burst} color="#fff2c4" count={34} spread={5} />
        </group>
    );
}

// Banelinjer: ytre rektangel + midtlinje + midtsirkel. Skalerer inn når `show`.
function PitchLines({ show }: { show: boolean }) {
    const grp = useRef<THREE.Group>(null);
    const t = useRef(0);
    useFrame((_, dt) => {
        if (!grp.current) return;
        t.current = damp(t.current, show ? 1 : 0, dt, 6);
        grp.current.scale.setScalar(0.0001 + t.current);
        grp.current.visible = t.current > 0.02;
    });
    const lineMat = (
        <meshStandardMaterial color="#f4f7fb" emissive="#dfe8f2" emissiveIntensity={0.3} roughness={0.6} />
    );
    return (
        <group ref={grp} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {/* ytre ramme: fire tynne bokser */}
            <mesh position={[0, HALF_D, 0]}>
                <planeGeometry args={[HALF_W * 2, 0.14]} />
                {lineMat}
            </mesh>
            <mesh position={[0, -HALF_D, 0]}>
                <planeGeometry args={[HALF_W * 2, 0.14]} />
                {lineMat}
            </mesh>
            <mesh position={[-HALF_W, 0, 0]}>
                <planeGeometry args={[0.14, HALF_D * 2]} />
                {lineMat}
            </mesh>
            <mesh position={[HALF_W, 0, 0]}>
                <planeGeometry args={[0.14, HALF_D * 2]} />
                {lineMat}
            </mesh>
            {/* midtlinje */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[0.14, HALF_D * 2]} />
                {lineMat}
            </mesh>
            {/* midtsirkel */}
            <mesh position={[0, 0, 0]}>
                <ringGeometry args={[1.25, 1.39, 40]} />
                {lineMat}
            </mesh>
        </group>
    );
}

// Én spiller. Beveger seg mot målposisjonen for gjeldende nivå. På nivå 0 jitrer
// den og snurrer (kaos); fra nivå 2 står den rolig og ser framover.
function Player({ index, color, level }: { index: number; color: string; level: Level }) {
    const grp = useRef<THREE.Group>(null);
    const target = useRef(new THREE.Vector3());
    // Unik faseforskyvning per spiller så jitteret ikke er synkront.
    const seed = useMemo(() => index * 1.7 + 0.3, [index]);

    useFrame(({ clock }, dt) => {
        if (!grp.current) return;
        const [tx, tz] = TARGETS[index][level];
        const time = clock.getElapsedTime();

        // Kaos-jitter avtar med nivået: mye på nivå 0, null på nivå 3.
        const chaos = (3 - level) / 3;
        const jx = Math.sin(time * 3.1 + seed) * 0.5 * chaos;
        const jz = Math.cos(time * 2.7 + seed * 1.3) * 0.5 * chaos;

        target.current.set(tx + jx, 0, tz + jz);
        dampV3(grp.current.position, target.current, dt, chaos > 0.05 ? 2.5 : 5);
        grp.current.position.y = 0;

        if (level >= 2) {
            // Står rolig og ser inn mot midten.
            const desired = Math.atan2(-grp.current.position.x, -grp.current.position.z);
            grp.current.rotation.y = damp(grp.current.rotation.y, desired, dt, 4);
        } else {
            // Snurrer forvirret rundt - ingen vet hvor de skal.
            grp.current.rotation.y += dt * (1.8 + Math.sin(seed) * 1.2) * chaos;
        }
    });

    return (
        <group ref={grp}>
            <Figure body={color} skin="#e7c39c" />
        </group>
    );
}

// Ballen. På nivå < 3 spretter den vilt rundt (kaos). På nivå 3 ruller den i en
// rolig bue mellom de to rekkene - laget spiller ball.
function Ball({ level }: { level: Level }) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const time = clock.getElapsedTime();
        if (level >= 3) {
            // Rolig pasning fram og tilbake langs x, lett bue i y.
            const x = Math.sin(time * 1.1) * 2.2;
            ref.current.position.set(x, 0.4 + Math.abs(Math.sin(time * 2.2)) * 0.5, 0);
        } else {
            // Vilt sprett: rask pseudo-tilfeldig bane innenfor/utenfor banen.
            const chaos = (3 - level) / 3;
            const x = Math.sin(time * 5.3) * 4.5 * chaos + Math.cos(time * 2.1) * 1.5;
            const z = Math.cos(time * 4.7) * 3.2 * chaos;
            const y = 0.35 + Math.abs(Math.sin(time * 9)) * (0.9 * chaos);
            ref.current.position.set(x, y, z);
        }
        ref.current.rotation.x += 0.08;
        ref.current.rotation.z += 0.05;
    });
    return (
        <mesh ref={ref} position={[0, 0.4, 0]} castShadow>
            <icosahedronGeometry args={[0.3, 1]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.5} flatShading />
        </mesh>
    );
}

// Dommeren: en mørk figur i svart med fløyte, står ved sidelinjen. Skalerer inn
// når loven kommer (nivå 2).
function Referee({ show }: { show: boolean }) {
    const grp = useRef<THREE.Group>(null);
    const t = useRef(0);
    useFrame(({ clock }, dt) => {
        if (!grp.current) return;
        t.current = damp(t.current, show ? 1 : 0, dt, 5);
        grp.current.scale.setScalar(0.0001 + t.current);
        grp.current.visible = t.current > 0.02;
        // Liten "blås i fløyta"-nikk.
        grp.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.2;
    });
    return (
        <group ref={grp} position={[0, 0, HALF_D + 1.1]}>
            <Figure body="#2b2f36" skin="#e7c39c">
                {/* fløyte: liten kule foran hodet */}
                <mesh position={[0, 0.58, 0.18]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color="#f4d03f" emissive="#b8860b" emissiveIntensity={0.3} />
                </mesh>
            </Figure>
        </group>
    );
}

export default Spillereglene3D;
