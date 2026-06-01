import React, { useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Hand, CheckCircle2, XCircle, Flame } from 'lucide-react';
import * as THREE from 'three';
import { MicroGameFrame } from './MicroGameFrame';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Teodosianmuren: roter Konstantinopels trippelmur i 3D og svar på romlige
// spørsmål ved å klikke riktig forsvarslag (vollgrav → ytre mur → terrasse →
// hovedmur). Til slutt knuser Mehmet 2.s kanon muren — slik den falt i 1453.
//
// Mekanikken er spørsmålsdrevet hotspot-klikking, ikke fast rekkefølge.

type PartId = 'moat' | 'outer' | 'terrace' | 'inner';
type PartState = 'idle' | 'hover' | 'correct' | 'wrong';

interface Part {
    id: PartId;
    label: string;
    short: string;
}

const PARTS: Part[] = [
    { id: 'moat', label: 'Vollgraven', short: 'Vannfylt grav foran alt' },
    { id: 'outer', label: 'Ytre mur', short: 'Lav førstemur' },
    { id: 'terrace', label: 'Terrassen', short: 'Stripen mellom murene' },
    { id: 'inner', label: 'Hovedmuren', short: 'Høy og tjukk, med tårn' },
];

interface Question {
    targetPart: PartId;
    prompt: string;
    fact: string;
}

const QUESTIONS: Question[] = [
    {
        targetPart: 'moat',
        prompt: 'En angriper måtte over dette aller først, foran hver eneste mur. Klikk det.',
        fact: 'Ytterst lå en bred, vannfylt vollgrav. Fienden måtte krysse den i åpent lende mens piler haglet ned fra murene. Mange kom aldri lenger.',
    },
    {
        targetPart: 'inner',
        prompt: 'Her sto det høyeste og tjukkeste forsvaret, med de største tårnene. Klikk hovedmuren.',
        fact: 'Hovedmuren var rundt 12 meter høy og 5 meter tjukk, med nesten hundre tårn. Forsvarerne på toppen så langt og skjøt ned på alt som nærmet seg.',
    },
    {
        targetPart: 'terrace',
        prompt: 'Kom fienden forbi den ytre muren, havnet de i en smal felle. Klikk området mellom murene.',
        fact: 'Stripen mellom murene ble en dødssone. Angripere som klatret over den lave ytre muren ble fanget her, under ild fra den høye hovedmuren rett foran seg.',
    },
];

// Plassering langs X (utside = -X, by = +X). Muren går langs Z.
const MOAT_X = -5.2;
const OUTER_X = -2.4;
const TERRACE_X = -0.4;
const INNER_X = 1.6;
const WALL_LEN = 11;

function stateColor(state: PartState, base: string): string {
    if (state === 'correct') return '#34d399';
    if (state === 'wrong') return '#fb7185';
    if (state === 'hover') return '#fcd34d';
    return base;
}

const TheodosianWalls3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [answered, setAnswered] = useState<Record<PartId, boolean>>({} as Record<PartId, boolean>);
    const [wrongPart, setWrongPart] = useState<PartId | null>(null);
    const [hoveredPart, setHoveredPart] = useState<PartId | null>(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [activeFact, setActiveFact] = useState<string | null>(null);
    const [phase, setPhase] = useState<'inspect' | 'firing' | 'done'>('inspect');
    const [breached, setBreached] = useState(false);

    const current = QUESTIONS[questionIndex];

    const partStateFor = (id: PartId): PartState => {
        if (wrongPart === id) return 'wrong';
        if (answered[id]) return 'correct';
        if (hoveredPart === id) return 'hover';
        return 'idle';
    };

    const handleSelect = (id: PartId) => {
        if (phase !== 'inspect' || !current) return;
        if (answered[id]) return;

        if (id === current.targetPart) {
            const nextAnswered = { ...answered, [id]: true };
            setAnswered(nextAnswered);
            setActiveFact(current.fact);
            sounds.play('correct');

            if (questionIndex + 1 >= QUESTIONS.length) {
                // Alle lag forklart — start kanon-finalen.
                setTimeout(() => {
                    setPhase('firing');
                    sounds.play('advance');
                }, 900);
            } else {
                setQuestionIndex((i) => i + 1);
            }
        } else {
            sounds.play('incorrect');
            setWrongPart(id);
            setTimeout(() => setWrongPart(null), 700);
        }
    };

    const handleImpact = () => {
        setBreached(true);
        sounds.play('complete');
        setTimeout(() => {
            setPhase('done');
            onComplete({ score: 1, completed: true, artifact: { walls: 'breached' } });
        }, 700);
    };

    const handleRetry = () => {
        setAnswered({} as Record<PartId, boolean>);
        setWrongPart(null);
        setHoveredPart(null);
        setQuestionIndex(0);
        setActiveFact(null);
        setBreached(false);
        setPhase('inspect');
    };

    const idle = Object.keys(answered).length === 0 && phase === 'inspect';

    return (
        <MicroGameFrame
            title="Teodosianmuren"
            subtitle="Roter trippelmuren og finn forsvarets hemmelighet"
            estimatedSeconds={120}
            onRetry={Object.keys(answered).length > 0 || phase !== 'inspect' ? handleRetry : undefined}
        >
            {/* Spørsmåls-banner */}
            <AnimatePresence mode="wait">
                {phase === 'inspect' && current && (
                    <motion.div
                        key={questionIndex}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mb-4 rounded-xl bg-amber-100 border border-amber-300 px-4 py-3"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                            Spørsmål {questionIndex + 1} av {QUESTIONS.length}
                        </span>
                        <p className="text-sm md:text-base font-semibold text-slate-800 leading-snug">
                            {current.prompt}
                        </p>
                    </motion.div>
                )}
                {phase !== 'inspect' && (
                    <motion.div
                        key="finale"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 rounded-xl bg-rose-100 border border-rose-300 px-4 py-3 flex items-center gap-3"
                    >
                        <Flame className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        <p className="text-sm md:text-base font-semibold text-rose-900 leading-snug">
                            {breached
                                ? 'Steinkulen traff. Etter tusen år brast muren.'
                                : 'Året er 1453. Mehmet 2. fyrer av sin gigantiske kanon ...'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid md:grid-cols-[1fr_210px] gap-4">
                {/* 3D-scene */}
                <div
                    className="relative bg-gradient-to-b from-[#eaf2f6] to-[#cfe0d9] rounded-xl border-2 border-amber-300 overflow-hidden shadow-inner"
                    style={{ aspectRatio: '16/10', minHeight: 320 }}
                >
                    <Canvas camera={{ position: [9, 6.5, 8.5], fov: 40 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
                        <color attach="background" args={[0xe9f1f4]} />
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[7, 11, 5]} intensity={1.05} castShadow shadow-mapSize={[1024, 1024]} />
                        <hemisphereLight args={[0xfff4d8, 0x4a5b44, 0.35]} />

                        {/* Bakke (bysiden) */}
                        <mesh receiveShadow position={[3, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[10, WALL_LEN + 2]} />
                            <meshStandardMaterial color="#bcae8c" roughness={1} />
                        </mesh>
                        {/* Bakke (utsiden) */}
                        <mesh receiveShadow position={[-7, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[6, WALL_LEN + 2]} />
                            <meshStandardMaterial color="#a9b27e" roughness={1} />
                        </mesh>

                        <MoatPart
                            state={partStateFor('moat')}
                            onSelect={() => handleSelect('moat')}
                            onHover={(h) => setHoveredPart(h ? 'moat' : null)}
                        />
                        <OuterWallPart
                            state={partStateFor('outer')}
                            onSelect={() => handleSelect('outer')}
                            onHover={(h) => setHoveredPart(h ? 'outer' : null)}
                        />
                        <TerracePart
                            state={partStateFor('terrace')}
                            onSelect={() => handleSelect('terrace')}
                            onHover={(h) => setHoveredPart(h ? 'terrace' : null)}
                        />
                        <InnerWallPart
                            state={partStateFor('inner')}
                            breached={breached}
                            onSelect={() => handleSelect('inner')}
                            onHover={(h) => setHoveredPart(h ? 'inner' : null)}
                        />

                        {phase === 'firing' && <Cannonball onImpact={handleImpact} />}

                        <OrbitControls
                            enableZoom={false}
                            enablePan={false}
                            minPolarAngle={Math.PI / 8}
                            maxPolarAngle={Math.PI / 2.2}
                            autoRotate={idle}
                            autoRotateSpeed={0.5}
                        />
                    </Canvas>

                    {idle && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-semibold text-amber-800 shadow"
                        >
                            <Hand className="w-3.5 h-3.5" />
                            Dra for å rotere
                        </motion.div>
                    )}
                </div>

                {/* Sidepanel: klikkbare deler (også for trackpad) */}
                <div className="flex flex-col gap-2">
                    {PARTS.map((part) => {
                        const st = partStateFor(part.id);
                        const isAnswered = answered[part.id];
                        return (
                            <button
                                key={part.id}
                                onClick={() => handleSelect(part.id)}
                                onMouseEnter={() => setHoveredPart(part.id)}
                                onMouseLeave={() => setHoveredPart(null)}
                                disabled={phase !== 'inspect' || isAnswered}
                                className={`relative rounded-xl border-2 p-2.5 text-left transition group ${
                                    isAnswered
                                        ? 'bg-emerald-50 border-emerald-300'
                                        : st === 'wrong'
                                          ? 'bg-rose-50 border-rose-300 animate-pulse'
                                          : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    <span
                                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                            isAnswered ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600 group-hover:bg-amber-200'
                                        }`}
                                    >
                                        {isAnswered ? (
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        ) : st === 'wrong' ? (
                                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                        ) : (
                                            '?'
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800">{part.label}</p>
                                        <p className="text-[10px] text-slate-500 leading-tight">{part.short}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Fakta / finale-panel */}
            <AnimatePresence mode="wait">
                {phase === 'done' ? (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                        className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3"
                    >
                        <Trophy className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-bold text-emerald-900">
                                I tusen år stoppet disse murene alle angripere.
                            </p>
                            <p className="text-sm text-emerald-800 mt-0.5 leading-relaxed">
                                Men i 1453 stilte Mehmet 2. opp kanoner større enn noe sett før. Steinkulene
                                knuste det vollgrav, tårn og dobbel mur aldri hadde møtt - og etter 53 dager
                                brast forsvaret.
                            </p>
                        </div>
                        <button
                            onClick={handleRetry}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition flex-shrink-0"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Igjen
                        </button>
                    </motion.div>
                ) : activeFact ? (
                    <motion.div
                        key={activeFact}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 bg-white border border-amber-200 rounded-xl p-4"
                    >
                        <p className="text-sm text-slate-700 leading-relaxed">{activeFact}</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 bg-white/70 border border-amber-200 rounded-xl p-3 text-center text-xs text-slate-600 italic"
                    >
                        Klikk delen direkte på modellen, eller velg den i listen.
                    </motion.div>
                )}
            </AnimatePresence>
        </MicroGameFrame>
    );
};

// FELLES KLIKKBAR DEL — håndterer pekerhendelser + puls/risting

interface ClickablePartProps {
    state: PartState;
    onSelect: () => void;
    onHover: (hovering: boolean) => void;
    children: React.ReactNode;
}

const ClickablePart: React.FC<ClickablePartProps> = ({ state, onSelect, onHover, children }) => {
    const anim = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (!anim.current) return;
        const t = clock.getElapsedTime();
        if (state === 'correct') {
            const s = 1 + Math.sin(t * 6) * 0.015;
            anim.current.scale.set(s, s, s);
            anim.current.position.x = 0;
        } else if (state === 'wrong') {
            anim.current.position.x = Math.sin(t * 32) * 0.06;
            anim.current.scale.set(1, 1, 1);
        } else {
            anim.current.position.x = 0;
            anim.current.scale.set(1, 1, 1);
        }
    });

    return (
        <group
            onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                onSelect();
            }}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                onHover(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                onHover(false);
                document.body.style.cursor = '';
            }}
        >
            <group ref={anim}>{children}</group>
        </group>
    );
};

// Krenelering (tinder) langs en murtopp
function Battlements({ x, topY, thickness, length, color }: { x: number; topY: number; thickness: number; length: number; color: string }) {
    const count = Math.floor(length / 0.7);
    const start = -length / 2 + 0.35;
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <mesh key={i} position={[x, topY + 0.18, start + i * 0.7]} castShadow>
                    <boxGeometry args={[thickness * 0.9, 0.36, 0.34]} />
                    <meshStandardMaterial color={color} roughness={0.9} />
                </mesh>
            ))}
        </>
    );
}

// VOLLGRAVEN — vannfylt grav ytterst
const MoatPart: React.FC<Omit<ClickablePartProps, 'children'>> = (props) => {
    const water = stateColor(props.state, '#3f6f8f');
    return (
        <ClickablePart {...props}>
            {/* Grav-grøft */}
            <mesh position={[MOAT_X, -0.35, 0]} receiveShadow>
                <boxGeometry args={[2.0, 0.7, WALL_LEN]} />
                <meshStandardMaterial color="#7d6a45" roughness={1} />
            </mesh>
            {/* Vannflate */}
            <mesh position={[MOAT_X, -0.12, 0]}>
                <boxGeometry args={[1.8, 0.18, WALL_LEN - 0.3]} />
                <meshStandardMaterial
                    color={water}
                    roughness={0.25}
                    metalness={0.1}
                    transparent
                    opacity={0.92}
                    emissive={props.state === 'correct' ? '#10b981' : '#11405a'}
                    emissiveIntensity={props.state === 'correct' ? 0.3 : 0.12}
                />
            </mesh>
        </ClickablePart>
    );
};

// YTRE MUR — lav førstemur
const OuterWallPart: React.FC<Omit<ClickablePartProps, 'children'>> = (props) => {
    const stone = stateColor(props.state, '#cdb88f');
    const emissive = props.state === 'correct' ? '#10b981' : props.state === 'hover' ? '#f59e0b' : '#000000';
    const ei = props.state === 'correct' ? 0.22 : props.state === 'hover' ? 0.14 : 0;
    return (
        <ClickablePart {...props}>
            <mesh position={[OUTER_X, 0.75, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.5, 1.5, WALL_LEN]} />
                <meshStandardMaterial color={stone} roughness={0.9} emissive={emissive} emissiveIntensity={ei} />
            </mesh>
            <Battlements x={OUTER_X} topY={1.5} thickness={0.5} length={WALL_LEN} color={stone} />
        </ClickablePart>
    );
};

// TERRASSEN — stripen (peribolos) mellom murene
const TerracePart: React.FC<Omit<ClickablePartProps, 'children'>> = (props) => {
    const ground = stateColor(props.state, '#9c8a64');
    const width = INNER_X - OUTER_X - 0.75; // mellomrom mellom murene
    return (
        <ClickablePart {...props}>
            <mesh position={[TERRACE_X, 0.04, 0]}>
                <boxGeometry args={[width, 0.08, WALL_LEN]} />
                <meshStandardMaterial
                    color={ground}
                    roughness={1}
                    emissive={props.state === 'correct' ? '#10b981' : props.state === 'hover' ? '#f59e0b' : '#000000'}
                    emissiveIntensity={props.state === 'correct' ? 0.25 : props.state === 'hover' ? 0.15 : 0}
                />
            </mesh>
        </ClickablePart>
    );
};

// HOVEDMUREN — høy, tjukk mur med tårn; midtsegmentet kan brytes (1453)
const InnerWallPart: React.FC<Omit<ClickablePartProps, 'children'> & { breached: boolean }> = ({ breached, ...props }) => {
    const stone = stateColor(props.state, '#c2a570');
    const emissive = props.state === 'correct' ? '#10b981' : props.state === 'hover' ? '#f59e0b' : '#000000';
    const ei = props.state === 'correct' ? 0.22 : props.state === 'hover' ? 0.14 : 0;

    const H = 3.0;
    const TH = 1.0;
    const segLen = (WALL_LEN - 1.8) / 2; // venstre/høyre om bresjen
    const towerZ = [-WALL_LEN / 2 + 0.4, -2.6, 2.6, WALL_LEN / 2 - 0.4];

    const mat = (
        <meshStandardMaterial color={stone} roughness={0.85} emissive={emissive} emissiveIntensity={ei} />
    );

    return (
        <ClickablePart {...props}>
            {/* Venstre murdel */}
            <mesh position={[INNER_X, H / 2, -(1.8 / 2 + segLen / 2)]} castShadow receiveShadow>
                <boxGeometry args={[TH, H, segLen]} />
                {mat}
            </mesh>
            {/* Høyre murdel */}
            <mesh position={[INNER_X, H / 2, 1.8 / 2 + segLen / 2]} castShadow receiveShadow>
                <boxGeometry args={[TH, H, segLen]} />
                {mat}
            </mesh>
            {/* Bresj-segment (faller ved kanontreff) */}
            <BreachBlock x={INNER_X} h={H} th={TH} color={stone} breached={breached} />

            {/* Tårn */}
            {towerZ.map((z, i) => (
                <mesh key={i} position={[INNER_X, H * 0.62, z]} castShadow receiveShadow>
                    <boxGeometry args={[TH * 1.5, H * 1.25, 1.3]} />
                    {mat}
                </mesh>
            ))}

            {/* Krenelering på murdelene */}
            <Battlements x={INNER_X} topY={H} thickness={TH} length={segLen} color={stone} />
        </ClickablePart>
    );
};

// Bresj-blokken som faller når kanonkula treffer
function BreachBlock({ x, h, th, color, breached }: { x: number; h: number; th: number; color: string; breached: boolean }) {
    const ref = useRef<THREE.Mesh>(null);
    const fall = useRef(0);

    useFrame((_, dt) => {
        if (!ref.current) return;
        const target = breached ? 1 : 0;
        fall.current += (target - fall.current) * Math.min(1, dt * 4);
        const f = fall.current;
        // velter utover (mot utsiden, -X) og synker
        ref.current.rotation.z = f * (Math.PI / 2.4);
        ref.current.position.set(x - f * 1.4, h / 2 - f * (h / 2 - 0.2), 0);
    });

    return (
        <mesh ref={ref} position={[x, h / 2, 0]} castShadow>
            <boxGeometry args={[th, h, 1.8]} />
            <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
    );
}

// KANONKULA — flyr inn fra utsiden og treffer hovedmuren
function Cannonball({ onImpact }: { onImpact: () => void }) {
    const ref = useRef<THREE.Mesh>(null);
    const progress = useRef(0);
    const done = useRef(false);
    const start = new THREE.Vector3(-10, 3.2, 0);
    const end = new THREE.Vector3(INNER_X, 1.7, 0);

    useFrame((_, dt) => {
        if (!ref.current || done.current) return;
        progress.current = Math.min(1, progress.current + dt * 1.15);
        const p = progress.current;
        ref.current.position.lerpVectors(start, end, p);
        // liten kastebue
        ref.current.position.y += Math.sin(p * Math.PI) * 1.0;
        if (p >= 1) {
            done.current = true;
            onImpact();
        }
    });

    return (
        <mesh ref={ref} position={[start.x, start.y, start.z]}>
            <sphereGeometry args={[0.34, 16, 16]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.35} />
        </mesh>
    );
}

export default TheodosianWalls3D;
