import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Play, Square } from 'lucide-react';
import {
    MicroGameScaffold,
    Hotspot,
    SceneBanner,
    SceneBadge,
    DragHint,
    SceneFact,
    WinScreen,
    SceneQuiz,
    CompareToggle,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til "Den vitenskapelige revolusjonen".
// Lyspære-øyeblikket eleven skal kjenne på kroppen: begge modellene kan forklare
// det vi ser på himmelen, men den ene gjør det med enkle, runde baner, mens den
// andre må fylle himmelen med kronglete sløyfer. Vitenskapen valgte den enkleste
// modellen som forklarer det vi ser - derfor vant sola-i-sentrum over jorda-i-sentrum.
//
//   - Jorda i sentrum (geosentrisk): jorda står stille, sola og Mars går rundt
//     oss. For at det skal stemme med himmelen må Mars gå i sløyfer (episykler) -
//     en rotete rosett.
//   - Sola i sentrum (heliosentrisk): sola står i ro, jorda og Mars går i rene
//     sirkler rundt den. Enkelt og ryddig.

type Model = 'geo' | 'helio';
type Phase = 'explore' | 'quiz' | 'won';

const SUN_R = 2.55; // solas baneradius i geosentrisk modell
const EARTH_R = 2.0; // jordas baneradius i heliosentrisk modell
const MARS_DEFERENT = 3.5; // Mars' store bane
const MARS_EPI = 1.0; // episykel-radius (geosentrisk sløyfe)
const EPI_LOOPS = 5; // antall sløyfer per omløp (gir en pen rosett)
const SPEED = 0.06; // hvor fort tiden går

// Mars-posisjon i de to modellene (rene funksjoner - trygge i useMemo/useFrame).
function marsHelio(tau: number, out: THREE.Vector3) {
    const a = tau * Math.PI * 2;
    return out.set(Math.cos(a) * MARS_DEFERENT, 0, Math.sin(a) * MARS_DEFERENT);
}
function marsGeo(tau: number, out: THREE.Vector3) {
    const d = tau * Math.PI * 2;
    const e = tau * Math.PI * 2 * EPI_LOOPS;
    const cx = Math.cos(d) * MARS_DEFERENT;
    const cz = Math.sin(d) * MARS_DEFERENT;
    return out.set(cx + Math.cos(e) * MARS_EPI, 0, cz + Math.sin(e) * MARS_EPI);
}

const HimmelModellen3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [phase, setPhase] = useState<Phase>('explore');
    const [model, setModel] = useState<Model>('geo');
    const [running, setRunning] = useState(false);
    const [seen, setSeen] = useState({ geo: false, helio: false });
    const [banner, setBanner] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const doneRef = useRef(false);

    const reset = () => {
        setPhase('explore');
        setModel('geo');
        setRunning(false);
        setSeen({ geo: false, helio: false });
        setBanner(null);
        setTouched(false);
        doneRef.current = false;
    };

    const pickModel = (v: 'a' | 'b') => {
        const next: Model = v === 'a' ? 'geo' : 'helio';
        if (next === model) return;
        setModel(next);
        sounds.play('sceneChange');
        setBanner(
            next === 'geo'
                ? 'Jorda i sentrum: for å stemme med himmelen må Mars gå i sløyfer.'
                : 'Sola i sentrum: nå går alt i rene, enkle sirkler.'
        );
    };

    const toggleRun = () => {
        setTouched(true);
        setRunning((r) => !r);
        if (!running) {
            setSeen((p) => ({ ...p, [model]: true }));
            sounds.play('select');
        }
    };

    const bothSeen = seen.geo && seen.helio;

    const finish = (correct: boolean) => {
        if (doneRef.current) return;
        doneRef.current = true;
        setPhase('won');
        setRunning(false);
        sounds.play('complete');
        onComplete({ score: correct ? 1 : 0.7, completed: true, artifact: { model } });
    };

    const idle = !touched && !running;

    return (
        <MicroGameScaffold
            title="To modeller av himmelen"
            subtitle="Begge forklarer det vi ser - men hvilken gjør det enklest?"
            estimatedSeconds={150}
            onRetry={touched || phase !== 'explore' ? reset : undefined}
            containerClassName="bg-gradient-to-b from-[#cdd8f0] via-[#dfe2f2] to-[#efe9d8]"
            canvas={{
                idle: idle && phase === 'explore',
                autoRotateSpeed: 0.3,
                camera: { position: [0, 8.5, 9.5], fov: 40 },
                background: '#d3def0',
                fog: { color: '#dde6f4', near: 24, far: 80 },
                target: [0, 0.4, 0],
                contactShadows: false,
                maxPolarAngle: Math.PI / 2.1,
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">
                        {model === 'geo' ? 'Jorda i sentrum' : 'Sola i sentrum'}
                    </SceneBadge>
                    <DragHint show={idle}>Trykk midten: La planetene gå</DragHint>
                </>
            }
            scene={
                <SkyScene
                    model={model}
                    running={running}
                    showStart={!running}
                    onStart={toggleRun}
                />
            }
        >
            {phase === 'explore' && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <CompareToggle
                            labelA="Jorda i sentrum"
                            labelB="Sola i sentrum"
                            value={model === 'geo' ? 'a' : 'b'}
                            onChange={pickModel}
                        />
                        <button
                            onClick={toggleRun}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                        >
                            {running ? (
                                <>
                                    <Square className="w-4 h-4" /> Stopp
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" /> La planetene gå
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex gap-2.5">
                        <SeenChip label="Jorda i sentrum" hint="sløyfer" done={seen.geo} />
                        <SeenChip label="Sola i sentrum" hint="rene sirkler" done={seen.helio} />
                    </div>

                    <SceneFact>
                        {model === 'geo' ? (
                            <>
                                <span className="font-bold text-slate-800">Jorda i sentrum:</span>{' '}
                                slik trodde nesten alle i 1500 år. Jorda står stille, og sola går
                                rundt oss. Men for at den røde planeten Mars skal bevege seg slik vi
                                faktisk ser den på himmelen, må den lage rare sløyfer. Modellen
                                funker, men den blir rotete.
                            </>
                        ) : (
                            <>
                                <span className="font-bold text-slate-800">Sola i sentrum:</span>{' '}
                                Kopernikus foreslo at sola står i ro og at jorda og planetene går
                                rundt den. Plutselig trenger ikke Mars noen sløyfer - alt går i rene,
                                rolige sirkler. Den samme himmelen, forklart på en mye enklere måte.
                            </>
                        )}
                    </SceneFact>

                    {bothSeen ? (
                        <button
                            onClick={() => {
                                setRunning(false);
                                setBanner(null);
                                setPhase('quiz');
                                sounds.play('advance');
                            }}
                            className="self-start inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition"
                        >
                            Du har sett begge - hvilken vant?
                        </button>
                    ) : (
                        <p className="text-xs text-slate-500">
                            Kjør begge modellene for å se forskjellen på Mars-banen.
                        </p>
                    )}
                </div>
            )}

            {phase === 'quiz' && (
                <SceneQuiz
                    question="Begge modellene kan forklare hva vi ser på himmelen. Hvorfor valgte vitenskapen sola i sentrum?"
                    options={[
                        'Fordi den forklarer det samme på en mye enklere måte',
                        'Fordi kongen bestemte det',
                        'Fordi jorda i sentrum var helt umulig',
                        'Fordi sola er størst',
                    ]}
                    answerIndex={0}
                    explanation="Riktig: begge modellene passet med observasjonene, men sola-i-sentrum slapp de kronglete sløyfene. Den enkleste forklaringen som stemmer med det vi ser, vinner. Det var slik den vitenskapelige måten å tenke på fungerte."
                    onResult={finish}
                />
            )}

            {phase === 'won' && (
                <WinScreen title="Du tenker som Kopernikus og Galileo!" onReplay={reset}>
                    Begge modellene forklarte himmelen. Men sola i sentrum gjorde det uten rare
                    sløyfer. Vitenskapen stolte ikke lenger på den gamle læren bare fordi den var
                    gammel - den valgte den modellen som forklarte det vi ser, enklest og best.
                </WinScreen>
            )}
        </MicroGameScaffold>
    );
};

function SeenChip({ label, hint, done }: { label: string; hint: string; done: boolean }) {
    return (
        <div
            className={`flex-1 rounded-xl border-2 px-3 py-2 transition ${
                done ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
            }`}
        >
            <div className="flex items-center gap-2">
                <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        done ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'
                    }`}
                >
                    {done ? '✓' : ''}
                </span>
                <span className="text-sm font-bold text-slate-800">{label}</span>
                <span className="text-[11px] text-slate-400">{hint}</span>
            </div>
        </div>
    );
}

// ============================================================
//  3D-SCENEN - sola, jorda og Mars i et lyst kosmos
// ============================================================

interface SceneProps {
    model: Model;
    running: boolean;
    showStart: boolean;
    onStart: () => void;
}

function SkyScene({ model, running, showStart, onStart }: SceneProps) {
    const tau = useRef(0); // 0..1 framdrift gjennom "året"

    const centerGrp = useRef<THREE.Group>(null);
    const sunMat = useRef<THREE.MeshStandardMaterial>(null);
    const earthCenterMat = useRef<THREE.MeshStandardMaterial>(null);
    const orbSun = useRef<THREE.Group>(null);
    const orbEarth = useRef<THREE.Group>(null);
    const orbMars = useRef<THREE.Group>(null);
    const centerLight = useRef<THREE.PointLight>(null);

    // visuell vekt for hver modell (crossfade av banespor)
    const geoVis = useRef(1);
    const helioVis = useRef(0);
    const geoPath = useRef<THREE.Group>(null);
    const helioPath = useRef<THREE.Group>(null);

    const tmp = useRef(new THREE.Vector3());

    // Forhåndsberegnede banespor for Mars i begge modeller (prikker langs banen).
    const geoDots = useMemo(() => {
        const v = new THREE.Vector3();
        return Array.from({ length: 160 }, (_, i) => {
            marsGeo(i / 160, v);
            return [v.x, v.y, v.z] as [number, number, number];
        });
    }, []);
    const helioDots = useMemo(() => {
        const v = new THREE.Vector3();
        return Array.from({ length: 120 }, (_, i) => {
            marsHelio(i / 120, v);
            return [v.x, v.y, v.z] as [number, number, number];
        });
    }, []);

    useFrame((state, dt) => {
        if (running) tau.current = (tau.current + dt * SPEED) % 1;
        const t = tau.current;

        // crossfade banespor + senterkropp
        geoVis.current = damp(geoVis.current, model === 'geo' ? 1 : 0, dt, 6);
        helioVis.current = damp(helioVis.current, model === 'helio' ? 1 : 0, dt, 6);
        if (geoPath.current) geoPath.current.visible = geoVis.current > 0.02;
        if (helioPath.current) helioPath.current.visible = helioVis.current > 0.02;

        // Senterkropp: sola (helio) gløder, jorda (geo) er blå.
        if (sunMat.current) {
            sunMat.current.emissiveIntensity = damp(
                sunMat.current.emissiveIntensity,
                model === 'helio' ? 1.6 : 0.15,
                dt,
                5
            );
            sunMat.current.opacity = damp(sunMat.current.opacity, model === 'helio' ? 1 : 0, dt, 6);
        }
        if (earthCenterMat.current) {
            earthCenterMat.current.opacity = damp(
                earthCenterMat.current.opacity,
                model === 'geo' ? 1 : 0,
                dt,
                6
            );
        }
        if (centerLight.current)
            centerLight.current.intensity = damp(
                centerLight.current.intensity,
                model === 'helio' ? 2.4 : 0.6,
                dt,
                5
            );

        // Posisjoner. Sola og jorda bytter rolle mellom modellene.
        if (model === 'helio') {
            // sola i sentrum (0,0,0). Jorda og Mars går rundt.
            const ae = t * Math.PI * 2 * 1.9;
            if (orbEarth.current)
                orbEarth.current.position.set(
                    Math.cos(ae) * EARTH_R,
                    0,
                    Math.sin(ae) * EARTH_R
                );
            if (orbSun.current) orbSun.current.position.set(0, 0, 0); // sola = senter
            marsHelio(t, tmp.current);
            if (orbMars.current) orbMars.current.position.copy(tmp.current);
        } else {
            // jorda i sentrum (0,0,0). Sola og Mars går rundt.
            const asun = t * Math.PI * 2 * 1.9;
            if (orbSun.current)
                orbSun.current.position.set(Math.cos(asun) * SUN_R, 0, Math.sin(asun) * SUN_R);
            if (orbEarth.current) orbEarth.current.position.set(0, 0, 0); // jorda = senter
            marsGeo(t, tmp.current);
            if (orbMars.current) orbMars.current.position.copy(tmp.current);
        }

        // senterkropp svever rolig
        if (centerGrp.current)
            centerGrp.current.position.y =
                0.4 + Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
    });

    return (
        <group>
            <SkyDome />
            <StarMotes />

            {/* Banespor for Mars - rosett (geo) vs ren sirkel (helio) */}
            <group ref={geoPath}>
                {geoDots.map((p, i) => (
                    <mesh key={i} position={p}>
                        <sphereGeometry args={[0.035, 6, 6]} />
                        <meshBasicMaterial color="#c2553a" transparent opacity={0.55} fog={false} />
                    </mesh>
                ))}
            </group>
            <group ref={helioPath}>
                {helioDots.map((p, i) => (
                    <mesh key={i} position={p}>
                        <sphereGeometry args={[0.035, 6, 6]} />
                        <meshBasicMaterial color="#4f7fc4" transparent opacity={0.5} fog={false} />
                    </mesh>
                ))}
            </group>

            {/* Senterkropp: sola + jorda i samme punkt, vi fader mellom dem */}
            <group ref={centerGrp} position={[0, 0.4, 0]}>
                <mesh>
                    <sphereGeometry args={[0.95, 32, 32]} />
                    <meshStandardMaterial
                        ref={sunMat}
                        color="#ffd451"
                        emissive="#ffb000"
                        emissiveIntensity={1.6}
                        transparent
                        toneMapped={false}
                    />
                </mesh>
                <mesh>
                    <sphereGeometry args={[0.62, 32, 32]} />
                    <meshStandardMaterial
                        ref={earthCenterMat}
                        color="#2f6f9f"
                        emissive="#16324a"
                        emissiveIntensity={0.3}
                        transparent
                        opacity={0}
                        roughness={0.8}
                    />
                </mesh>
                <pointLight ref={centerLight} color="#ffe6a8" distance={16} intensity={2.4} />
            </group>

            {/* Jorda som planet (synlig som orbiter i helio, skjult i sentrum i geo) */}
            <group ref={orbEarth}>
                <Planet color="#2f6f9f" emissive="#16324a" r={0.45} hideAt={[0, 0.4, 0]} />
            </group>

            {/* Sola som orbiter (synlig i geo, i sentrum i helio) */}
            <group ref={orbSun}>
                <Planet color="#ffd451" emissive="#ffb000" r={0.6} glow hideAt={[0, 0.4, 0]} />
            </group>

            {/* Mars - den røde planeten med den avslørende banen */}
            <group ref={orbMars}>
                <Planet color="#c2553a" emissive="#6e2616" r={0.34} />
            </group>

            {/* Direkte 3D-interaksjon: trykk midten for å la planetene gå */}
            {showStart && (
                <Hotspot
                    position={[0, 2.6, 0]}
                    onSelect={onStart}
                    label="La planetene gå"
                    radius={0.5}
                />
            )}
        </group>
    );
}

// En planet som ligger litt over baneplanet. hideAt skjuler den når den
// faller sammen med sentrum (så vi ikke får to kuler oppå hverandre).
function Planet({
    color,
    emissive,
    r,
    glow = false,
    hideAt,
}: {
    color: string;
    emissive: string;
    r: number;
    glow?: boolean;
    hideAt?: [number, number, number];
}) {
    const grp = useRef<THREE.Group>(null);
    useFrame(() => {
        if (!grp.current || !hideAt) return;
        const wp = grp.current.getWorldPosition(new THREE.Vector3());
        const near =
            Math.abs(wp.x - hideAt[0]) < 0.3 && Math.abs(wp.z - hideAt[2]) < 0.3;
        grp.current.visible = !near;
    });
    return (
        <group ref={grp} position={[0, 0.4, 0]}>
            <mesh>
                <sphereGeometry args={[r, 24, 24]} />
                <meshStandardMaterial
                    color={color}
                    emissive={emissive}
                    emissiveIntensity={glow ? 1.4 : 0.35}
                    roughness={0.7}
                    toneMapped={!glow}
                />
            </mesh>
        </group>
    );
}

// --- Lysende himmelkuppel (gradient: kjølig blå topp -> varm horisont) ---
function SkyDome() {
    const texture = useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 16;
        c.height = 256;
        const ctx = c.getContext('2d');
        if (ctx) {
            const g = ctx.createLinearGradient(0, 0, 0, 256);
            g.addColorStop(0, '#9fb0e0');
            g.addColorStop(0.5, '#c9d4ee');
            g.addColorStop(0.8, '#e7e3da');
            g.addColorStop(1, '#f3ead2');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 16, 256);
        }
        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }, []);
    return (
        <mesh scale={[-1, 1, 1]}>
            <sphereGeometry args={[60, 24, 24]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} fog={false} depthWrite={false} />
        </mesh>
    );
}

// Deterministisk pseudo-random (på modulnivå - ingen mutasjon under render).
function makeRng(seed: number) {
    let s = seed >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

// --- Svake lyspartikler i lufta (atmosfære uten å bli mørkt) ---
function StarMotes() {
    const data = useMemo(() => {
        const rand = makeRng(7321);
        return Array.from({ length: 44 }, () => {
            const r = 10 + rand() * 22;
            const theta = rand() * Math.PI * 2;
            const phi = (rand() - 0.5) * Math.PI;
            return [
                Math.cos(theta) * Math.cos(phi) * r,
                3 + rand() * 12,
                Math.sin(theta) * Math.cos(phi) * r - 4,
            ] as [number, number, number];
        });
    }, []);
    const grp = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (grp.current) grp.current.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.3;
    });
    return (
        <group ref={grp}>
            {data.map((p, i) => (
                <mesh key={i} position={p}>
                    <sphereGeometry args={[0.05, 6, 6]} />
                    <meshBasicMaterial color="#fff6da" transparent opacity={0.7} fog={false} />
                </mesh>
            ))}
        </group>
    );
}

export default HimmelModellen3D;
