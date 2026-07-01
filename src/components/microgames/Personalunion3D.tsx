import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Check } from 'lucide-react';
import {
    MicroGameScaffold,
    SceneSlider,
    SceneBanner,
    SceneBadge,
    DragHint,
    WinScreen,
    Burst,
    damp,
    useIdleMotion,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til artikkelen "Unionen med Sverige".
// Lyspære: Personalunionen ligger MIDT imellom to ytterpunkter. Norge ble verken
// et helt selvstendig land eller slukt av Sverige - de to landene delte bare
// kongen, mens Norge beholdt sitt eget flagg, sin grunnlov og sitt storting.
// Eleven drar en spak gjennom tre modeller og ser landene, kronene og flaggene
// forvandle seg, og skal finne hvilken modell Norge faktisk ble i 1814.

const MODEL_LABELS = ['To selvstendige land', 'Personalunion 1814', 'Full innlemmelse'];
const MODEL_BADGES = ['Ikke unionen', '1814', 'Skjedde aldri'];
const MODEL_BANNERS = [
    'To helt selvstendige land. Hver har sin egen konge og sitt eget flagg.',
    'Personalunion: landene deler én konge, men Norge beholder sitt eget flagg og sin egen stat.',
    'Full innlemmelse: Norge slukes inn i Sverige. Ett flagg, én konge. Dette skjedde aldri.',
];

const Personalunion3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [model, setModel] = useState(0);
    const [won, setWon] = useState(false);
    const [nudge, setNudge] = useState<string | null>(null);
    const [burst, setBurst] = useState(0);
    const [touched, setTouched] = useState(false);
    const doneRef = useRef(false);

    const changeModel = (v: number) => {
        setTouched(true);
        setNudge(null);
        if (v !== model) sounds.play('sceneChange');
        setModel(v);
    };

    const confirm = () => {
        if (doneRef.current) return;
        if (model === 1) {
            doneRef.current = true;
            setWon(true);
            setBurst((b) => b + 1);
            sounds.play('complete');
            onComplete({ score: 1, completed: true, artifact: { model } });
        } else {
            setNudge(
                model === 0
                    ? 'Nesten. Helt selvstendig ble Norge først i 1905. I 1814 delte vi kongen med Sverige. Prøv modellen i midten.'
                    : 'Nei. Norge ble aldri slukt av Sverige. Vi beholdt flagg, grunnlov og storting. Prøv modellen i midten.'
            );
            sounds.play('incorrect');
        }
    };

    const reset = () => {
        setModel(0);
        setWon(false);
        setNudge(null);
        setTouched(false);
        doneRef.current = false;
    };

    return (
        <MicroGameScaffold
            title="Hva ble Norge i 1814?"
            subtitle="Dra spaken gjennom de tre modellene og finn hvilken Norge faktisk ble"
            estimatedSeconds={130}
            onRetry={touched ? reset : undefined}
            containerClassName="bg-gradient-to-b from-[#bcd8f0] via-[#d6e6f2] to-[#eaf1e0]"
            canvas={{
                idle: !touched,
                autoRotateSpeed: 0.25,
                camera: { position: [0, 6.5, 12], fov: 40 },
                background: '#c4dbf0',
                fog: { color: '#d2e2f0', near: 24, far: 70 },
                target: [0, 1.4, 0],
                maxPolarAngle: Math.PI / 2.1,
            }}
            overlays={
                <>
                    <SceneBanner message={touched ? MODEL_BANNERS[model] : null} wide />
                    <SceneBadge corner="br">{MODEL_BADGES[model]}</SceneBadge>
                    <DragHint show={!touched}>Dra spaken under vinduet</DragHint>
                </>
            }
            scene={<UnionScene model={model} burst={burst} />}
        >
            <div className="flex flex-col gap-3">
                <SceneSlider
                    label="Forholdet mellom Norge og Sverige"
                    min={0}
                    max={2}
                    step={1}
                    value={model}
                    onChange={changeModel}
                    valueLabel={(v) => MODEL_LABELS[v]}
                />

                {nudge && (
                    <div className="rounded-xl border-2 border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {nudge}
                    </div>
                )}

                {won ? (
                    <WinScreen title="Riktig! Norge ble en personalunion." onReplay={reset}>
                        I 1814 ble Norge verken helt fritt eller slukt av Sverige. De to landene delte bare kongen og
                        utenrikspolitikken. Norge beholdt sitt eget flagg, sin grunnlov, sitt storting og sin hær. Derfor
                        heter det personalunion: bare personen, kongen, var felles.
                    </WinScreen>
                ) : (
                    <button
                        onClick={confirm}
                        className="self-start inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition"
                    >
                        <Check className="w-4 h-4" />
                        Dette ble Norge i 1814
                    </button>
                )}
            </div>
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

// Landmasse-mål per modell: hvor langt fra midten hvert land ligger.
function landGap(model: number) {
    return model === 0 ? 3.4 : model === 1 ? 1.85 : 0.95;
}

function UnionScene({ model, burst }: { model: number; burst: number }) {
    const norge = useRef<THREE.Group>(null);
    const sverige = useRef<THREE.Group>(null);
    const crownN = useRef<THREE.Group>(null);
    const crownS = useRef<THREE.Group>(null);
    const crownShared = useRef<THREE.Group>(null);
    const flagN = useRef<THREE.Group>(null);
    const seam = useRef<THREE.Mesh>(null);
    const norgeMat = useRef<THREE.MeshStandardMaterial>(null);

    const cNorge = useRef(new THREE.Color('#4a7a52'));
    const cMerged = useRef(new THREE.Color('#3f6fae'));

    useFrame((_, dt) => {
        const gap = landGap(model);
        if (norge.current) norge.current.position.x = damp(norge.current.position.x, -gap, dt, 4);
        if (sverige.current) sverige.current.position.x = damp(sverige.current.position.x, gap, dt, 4);

        // Ved full innlemmelse (modell 2) farges Norge om til svensk blått.
        if (norgeMat.current) {
            norgeMat.current.color.lerp(model === 2 ? cMerged.current : cNorge.current, Math.min(1, dt * 3));
        }

        // Kroner: to egne (modell 0) -> én felles (modell 1 og 2).
        fadeGroup(crownN.current, model === 0 ? 1 : 0, dt);
        fadeGroup(crownS.current, model === 0 ? 1 : 0, dt);
        fadeGroup(crownShared.current, model >= 1 ? 1 : 0, dt);

        // Norsk flagg forsvinner bare ved full innlemmelse.
        fadeGroup(flagN.current, model === 2 ? 0 : 1, dt);

        // Skjøt-strek mellom landene: synlig i personalunionen (to land, tett inntil).
        if (seam.current) {
            const m = seam.current.material as THREE.MeshBasicMaterial;
            m.opacity = damp(m.opacity, model === 1 ? 0.8 : 0, dt, 5);
            seam.current.visible = m.opacity > 0.02;
        }
    });

    return (
        <group>
            {/* Hav */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
                <planeGeometry args={[60, 60]} />
                <meshStandardMaterial color="#7fb2d9" roughness={0.7} />
            </mesh>

            {/* Norge (vest) */}
            <group ref={norge} position={[-3.4, 0, 0]}>
                <Landmass matRef={norgeMat} color="#4a7a52" />
                <group ref={flagN} position={[0, 0, 0]}>
                    <FlagPole kind="norge" />
                </group>
                <group ref={crownN} position={[0, 3.1, 0]}>
                    <Crown3D scale={0.7} />
                </group>
                <Label3D text="NORGE" />
            </group>

            {/* Sverige (øst) */}
            <group ref={sverige} position={[3.4, 0, 0]}>
                <Landmass color="#3f6fae" />
                <FlagPole kind="sverige" />
                <group ref={crownS} position={[0, 3.1, 0]}>
                    <Crown3D scale={0.7} />
                </group>
                <Label3D text="SVERIGE" />
            </group>

            {/* Skjøt-strek som viser at det fortsatt er to land i personalunionen */}
            <mesh ref={seam} position={[0, 0.55, 0]}>
                <boxGeometry args={[0.08, 1.1, 5.2]} />
                <meshBasicMaterial color="#1f2937" transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Felles krone (svever midt mellom landene) */}
            <group ref={crownShared} position={[0, 3.9, 0]}>
                <Crown3D scale={1.15} />
            </group>

            <Burst position={[0, 3.9, 0]} trigger={burst} color="#ffe08a" count={34} spread={4} />
        </group>
    );
}

// Myk inn/ut-toning av en hel gruppe (opasitet + liten skala).
function fadeGroup(g: THREE.Group | null, target: number, dt: number) {
    if (!g) return;
    const cur = g.userData.vis ?? (target > 0.5 ? 1 : 0);
    const next = damp(cur, target, dt, 6);
    g.userData.vis = next;
    g.visible = next > 0.02;
    g.scale.setScalar(0.6 + next * 0.4);
    g.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((mm) => {
                const mat = mm as THREE.Material & { opacity: number; transparent: boolean };
                mat.transparent = true;
                mat.opacity = next;
            });
        }
    });
}

// Et lite, lavpoly land med litt terreng.
function Landmass({
    color,
    matRef,
}: {
    color: string;
    matRef?: React.RefObject<THREE.MeshStandardMaterial | null>;
}) {
    const float = useIdleMotion({ bob: 0.05, sway: 0.01, speed: 0.9 });
    return (
        <group ref={float}>
            <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
                <boxGeometry args={[2.6, 0.7, 5]} />
                <meshStandardMaterial ref={matRef} color={color} roughness={0.9} />
            </mesh>
            {/* Et par åser for liv */}
            <mesh position={[-0.5, 0.8, 1.2]} castShadow>
                <coneGeometry args={[0.6, 1, 5]} />
                <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
            <mesh position={[0.6, 0.75, -1.3]} castShadow>
                <coneGeometry args={[0.5, 0.85, 5]} />
                <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
        </group>
    );
}

// Enkel gullkrone: ring + tagger + kule på toppen.
function Crown3D({ scale = 1 }: { scale?: number }) {
    const gold = { color: '#e6b422', emissive: '#8a6410', emissiveIntensity: 0.35, roughness: 0.35, metalness: 0.7 };
    const points = [0, 1, 2, 3, 4];
    return (
        <group scale={scale}>
            <mesh castShadow>
                <cylinderGeometry args={[0.62, 0.7, 0.4, 5]} />
                <meshStandardMaterial {...gold} />
            </mesh>
            {points.map((i) => {
                const a = (i / points.length) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(a) * 0.66, 0.42, Math.sin(a) * 0.66]} castShadow>
                        <coneGeometry args={[0.14, 0.5, 4]} />
                        <meshStandardMaterial {...gold} />
                    </mesh>
                );
            })}
            <mesh position={[0, 0.55, 0]}>
                <sphereGeometry args={[0.14, 12, 12]} />
                <meshStandardMaterial color="#c0392b" emissive="#5a140d" emissiveIntensity={0.4} />
            </mesh>
        </group>
    );
}

// Flaggstang + flagg med nordisk kors, tegnet på en canvas-tekstur.
function FlagPole({ kind }: { kind: 'norge' | 'sverige' }) {
    const tex = useMemo(() => makeFlagTexture(kind), [kind]);
    return (
        <group position={[0, 0, -2.1]}>
            <mesh position={[0, 1.6, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 3.2, 8]} />
                <meshStandardMaterial color="#8a5a2b" roughness={0.8} />
            </mesh>
            <mesh position={[0.75, 2.75, 0]}>
                <planeGeometry args={[1.4, 1]} />
                <meshBasicMaterial map={tex} side={THREE.DoubleSide} transparent />
            </mesh>
        </group>
    );
}

// Enkel tekst-etikett på bakken (canvas-tekstur, alltid mot kamera-ish).
function Label3D({ text }: { text: string }) {
    const tex = useMemo(() => makeLabelTexture(text), [text]);
    return (
        <mesh position={[0, 0.02, 2.7]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 0.7]} />
            <meshBasicMaterial map={tex} transparent depthWrite={false} />
        </mesh>
    );
}

// --- Canvas-teksturer (tegnet én gang, memoisert) ---
function makeFlagTexture(kind: 'norge' | 'sverige') {
    const c = document.createElement('canvas');
    c.width = 220;
    c.height = 160;
    const ctx = c.getContext('2d');
    if (ctx) {
        // Nordisk kors: vertikal bjelke ved ~0.34 av bredden.
        const vx = 220 * 0.34;
        const vw = 30;
        const hy = 160 * 0.5 - 15;
        const hh = 30;
        if (kind === 'norge') {
            ctx.fillStyle = '#ba0c2f';
            ctx.fillRect(0, 0, 220, 160);
            // hvitt kors (bredt)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(vx - 8, 0, vw + 16, 160);
            ctx.fillRect(0, hy - 8, 220, hh + 16);
            // blått kors (smalt) oppå
            ctx.fillStyle = '#00205b';
            ctx.fillRect(vx, 0, vw, 160);
            ctx.fillRect(0, hy, 220, hh);
        } else {
            ctx.fillStyle = '#005293';
            ctx.fillRect(0, 0, 220, 160);
            ctx.fillStyle = '#fecb00';
            ctx.fillRect(vx, 0, vw, 160);
            ctx.fillRect(0, hy, 220, hh);
        }
    }
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
}

function makeLabelTexture(text: string) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 72;
    const ctx = c.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, 256, 72);
        ctx.font = 'bold 42px Inter, sans-serif';
        ctx.fillStyle = 'rgba(15,23,42,0.85)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 40);
    }
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
}

export default Personalunion3D;
