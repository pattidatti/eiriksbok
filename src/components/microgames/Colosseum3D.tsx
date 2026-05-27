import React, { useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    RotateCcw,
    Hand,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import * as THREE from 'three';
import { MicroGameFrame } from './MicroGameFrame';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Roter Colosseum og klikk de fire etasjene i riktig byggerekkefølge.
// Lærer arkitektur-rekkefølgen: dorisk (bunn) → jonisk → korintisk → attika.

interface Level {
    order: number;
    name: string;
    columnStyle: string;
    fact: string;
    y: number;             // vertikal posisjon
    radiusOuter: number;
    radiusInner: number;
    height: number;
}

const LEVELS: Level[] = [
    {
        order: 1,
        name: '1. etasje',
        columnStyle: 'Dorisk',
        fact: 'Tyngste søylestil — enkle, kraftige søyler. Begynt under keiser Vespasian rundt år 70 e.Kr.',
        y: 0,
        radiusOuter: 3.0,
        radiusInner: 2.5,
        height: 1.6,
    },
    {
        order: 2,
        name: '2. etasje',
        columnStyle: 'Jonisk',
        fact: 'Slankere søyler med voluttkapiteler. Bygd under Vespasians sønn Titus.',
        y: 1.6,
        radiusOuter: 2.85,
        radiusInner: 2.35,
        height: 1.5,
    },
    {
        order: 3,
        name: '3. etasje',
        columnStyle: 'Korintisk',
        fact: 'Mest dekorerte søyler — akantusblader. Ferdig under Domitian rundt år 80 e.Kr.',
        y: 3.1,
        radiusOuter: 2.7,
        radiusInner: 2.2,
        height: 1.4,
    },
    {
        order: 4,
        name: '4. etasje (attika)',
        columnStyle: 'Pilaster',
        fact: 'Solid topp uten åpne bueganger. Her ble velariet (soltaket) festet med master.',
        y: 4.5,
        radiusOuter: 2.6,
        radiusInner: 2.1,
        height: 1.0,
    },
];

interface LevelState {
    correct: boolean;
    selectedAt: number;
}

const Colosseum3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [levelStates, setLevelStates] = useState<Record<number, LevelState>>({});
    const [wrongOrder, setWrongOrder] = useState<number | null>(null);
    const [hoveredOrder, setHoveredOrder] = useState<number | null>(null);
    const [done, setDone] = useState(false);

    const nextExpected = Object.values(levelStates).filter((s) => s.correct).length + 1;

    const handleSelect = (order: number) => {
        if (done) return;
        if (levelStates[order]?.correct) return;

        if (order === nextExpected) {
            const next = {
                ...levelStates,
                [order]: { correct: true, selectedAt: Date.now() },
            };
            setLevelStates(next);
            sounds.play('correct');

            if (Object.keys(next).length === LEVELS.length) {
                setTimeout(() => {
                    sounds.play('complete');
                    setDone(true);
                    onComplete({
                        score: 1,
                        completed: true,
                        artifact: { perfectOrder: true },
                    });
                }, 600);
            }
        } else {
            sounds.play('incorrect');
            setWrongOrder(order);
            setTimeout(() => setWrongOrder(null), 800);
        }
    };

    const handleRetry = () => {
        setLevelStates({});
        setWrongOrder(null);
        setDone(false);
    };

    const handleFinish = () => {
        onComplete({
            score: Object.values(levelStates).filter((s) => s.correct).length / LEVELS.length,
            completed: true,
            artifact: { perfectOrder: done },
        });
    };

    const currentLevel = LEVELS.find((l) => l.order === nextExpected);
    const lastCorrectLevel = (() => {
        const correctEntries = Object.entries(levelStates).filter(([, s]) => s.correct);
        if (correctEntries.length === 0) return null;
        const lastKey = correctEntries.sort((a, b) => b[1].selectedAt - a[1].selectedAt)[0][0];
        return LEVELS.find((l) => l.order === Number(lastKey)) ?? null;
    })();

    return (
        <MicroGameFrame
            title="Roter Colosseum"
            subtitle="Klikk etasjene i byggerekkefølge — nederst først"
            estimatedSeconds={120}
            onRetry={Object.keys(levelStates).length > 0 ? handleRetry : undefined}
        >
            <div className="grid md:grid-cols-[1fr_240px] gap-4">
                {/* 3D Canvas */}
                <div className="relative bg-gradient-to-b from-[#fef9ee] to-[#e8d8b8] rounded-xl border-2 border-amber-300 overflow-hidden shadow-inner" style={{ aspectRatio: '4/3', minHeight: 320 }}>
                    <Canvas
                        camera={{ position: [9, 7, 9], fov: 38 }}
                        gl={{ antialias: true, alpha: true }}
                        dpr={[1, 2]}
                    >
                        <color attach="background" args={[0xf8eed7]} />
                        <ambientLight intensity={0.55} />
                        <directionalLight
                            position={[8, 10, 6]}
                            intensity={1.0}
                            castShadow
                            shadow-mapSize={[1024, 1024]}
                        />
                        <hemisphereLight args={[0xfff1cc, 0x553311, 0.3]} />

                        {/* Grunn */}
                        <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <circleGeometry args={[5, 64]} />
                            <meshStandardMaterial color="#d4be8f" roughness={0.95} />
                        </mesh>

                        {/* Indre arena-grøft */}
                        <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <circleGeometry args={[2.0, 48]} />
                            <meshStandardMaterial color="#9b7d4a" roughness={1.0} />
                        </mesh>

                        {LEVELS.map((level) => (
                            <ColosseumLevel
                                key={level.order}
                                level={level}
                                state={
                                    wrongOrder === level.order
                                        ? 'wrong'
                                        : levelStates[level.order]?.correct
                                          ? 'correct'
                                          : hoveredOrder === level.order
                                            ? 'hover'
                                            : 'idle'
                                }
                                onSelect={() => handleSelect(level.order)}
                                onHover={(h) => setHoveredOrder(h ? level.order : null)}
                            />
                        ))}

                        <OrbitControls
                            enableZoom={false}
                            enablePan={false}
                            minPolarAngle={Math.PI / 6}
                            maxPolarAngle={Math.PI / 2.1}
                            autoRotate={!hoveredOrder && Object.keys(levelStates).length === 0}
                            autoRotateSpeed={0.6}
                        />
                    </Canvas>

                    {/* Drag-hint */}
                    {Object.keys(levelStates).length === 0 && (
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

                {/* Sidepanel */}
                <div className="flex flex-col gap-3">
                    {LEVELS.map((level) => {
                        const isDone = levelStates[level.order]?.correct;
                        const isExpected = level.order === nextExpected && !done;
                        const isWrong = wrongOrder === level.order;
                        return (
                            <button
                                key={level.order}
                                onClick={() => handleSelect(level.order)}
                                onMouseEnter={() => setHoveredOrder(level.order)}
                                onMouseLeave={() => setHoveredOrder(null)}
                                disabled={done || isDone}
                                className={`relative rounded-xl border-2 p-3 text-left transition group ${
                                    isDone
                                        ? 'bg-emerald-50 border-emerald-300'
                                        : isWrong
                                          ? 'bg-rose-50 border-rose-300 animate-pulse'
                                          : isExpected
                                            ? 'bg-amber-50 border-amber-300 hover:bg-amber-100'
                                            : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    <span
                                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                            isDone
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-slate-200 text-slate-600 group-hover:bg-amber-200'
                                        }`}
                                    >
                                        {isDone ? (
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        ) : isWrong ? (
                                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                        ) : (
                                            '?'
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800">
                                            {level.name}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500">
                                            {level.columnStyle}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Status og fact */}
            <AnimatePresence mode="wait">
                {done ? (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                        className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3"
                    >
                        <Trophy className="w-6 h-6 text-amber-500 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold text-emerald-900">
                                Perfekt! Du har Colosseums hele byggrekkefølge.
                            </p>
                            <p className="text-sm text-emerald-800 mt-0.5">
                                Hele monumentet sto ferdig i år 80 e.Kr — 50 000 tilskuere kunne ta plass.
                            </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={handleRetry}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Igjen
                            </button>
                            <button
                                onClick={handleFinish}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition"
                            >
                                Gå videre
                            </button>
                        </div>
                    </motion.div>
                ) : lastCorrectLevel ? (
                    <motion.div
                        key={lastCorrectLevel.order}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 bg-white border border-amber-200 rounded-xl p-4"
                    >
                        <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
                            {lastCorrectLevel.name} · {lastCorrectLevel.columnStyle}
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            {lastCorrectLevel.fact}
                        </p>
                    </motion.div>
                ) : currentLevel ? (
                    <motion.div
                        key="hint"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 bg-white/70 border border-amber-200 rounded-xl p-3 text-center text-xs text-slate-600 italic"
                    >
                        Hvilken etasje ble bygd som {nextExpected === 1 ? 'den første' : `nummer ${nextExpected}`}? Klikk etasjen direkte på modellen eller i listen.
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </MicroGameFrame>
    );
};

// 3D-MESH PR. ETASJE

interface ColosseumLevelProps {
    level: Level;
    state: 'idle' | 'hover' | 'correct' | 'wrong';
    onSelect: () => void;
    onHover: (hovering: boolean) => void;
}

const ColosseumLevel: React.FC<ColosseumLevelProps> = ({ level, state, onSelect, onHover }) => {
    const ringRef = useRef<THREE.Group>(null);

    // Bokslignende riser i hver ring (gir illusjon av buegang-mønster)
    const archCount = level.order === 4 ? 36 : 28;
    const archHeight = level.height * 0.7;

    // State-baserte farger
    const baseColor = level.order === 1
        ? '#d3b98c'
        : level.order === 2
          ? '#cdb185'
          : level.order === 3
            ? '#c7a97c'
            : '#b78f57';

    const color =
        state === 'correct'
            ? '#34d399'
            : state === 'wrong'
              ? '#fb7185'
              : state === 'hover'
                ? '#fcd34d'
                : baseColor;

    const emissive = state === 'correct' ? '#10b981' : state === 'hover' ? '#f59e0b' : '#000000';
    const emissiveIntensity =
        state === 'correct' ? 0.25 : state === 'hover' ? 0.15 : 0;

    // Lett pulse på korrekt
    useFrame(({ clock }) => {
        if (!ringRef.current) return;
        const t = clock.getElapsedTime();
        if (state === 'correct') {
            const scale = 1 + Math.sin(t * 6) * 0.012;
            ringRef.current.scale.set(scale, 1, scale);
        } else if (state === 'wrong') {
            ringRef.current.position.x = Math.sin(t * 30) * 0.04;
        } else {
            ringRef.current.position.x = 0;
            ringRef.current.scale.set(1, 1, 1);
        }
    });

    return (
        <group
            ref={ringRef}
            position={[0, level.y, 0]}
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
            {/* Ytre vegg */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry
                    args={[level.radiusOuter, level.radiusOuter, level.height, 48, 1, true]}
                />
                <meshStandardMaterial
                    color={color}
                    roughness={0.85}
                    emissive={emissive}
                    emissiveIntensity={emissiveIntensity}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Bunn/topp-ringer (gulvskille) */}
            <mesh position={[0, -level.height / 2 + 0.05, 0]}>
                <torusGeometry
                    args={[level.radiusOuter, 0.08, 8, 48]}
                />
                <meshStandardMaterial color="#9c7e51" roughness={0.7} />
            </mesh>
            <mesh position={[0, level.height / 2 - 0.05, 0]}>
                <torusGeometry
                    args={[level.radiusOuter, 0.08, 8, 48]}
                />
                <meshStandardMaterial color="#9c7e51" roughness={0.7} />
            </mesh>

            {/* Søyler/bueganger (ikke for attika) */}
            {level.order < 4 &&
                Array.from({ length: archCount }).map((_, i) => {
                    const angle = (i / archCount) * Math.PI * 2;
                    const x = Math.cos(angle) * (level.radiusOuter + 0.01);
                    const z = Math.sin(angle) * (level.radiusOuter + 0.01);
                    return (
                        <mesh
                            key={i}
                            position={[x, 0, z]}
                            rotation={[0, -angle + Math.PI / 2, 0]}
                            castShadow
                        >
                            <boxGeometry args={[0.12, archHeight, 0.18]} />
                            <meshStandardMaterial color="#b6925c" roughness={0.9} />
                        </mesh>
                    );
                })}
        </group>
    );
};

export default Colosseum3D;
