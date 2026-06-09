import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    Figure,
    GroundPlane,
    SceneBanner,
    SceneBadge,
    WinScreen,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: Marsjen mot Roma, oktober 1922.
// Historisk paradoks: fascistene var IKKE militaert sterke nok til å ta Roma.
// De lyktes KUN fordi kong Viktor Emanuel III nektet å bruke hæren.
// Fase 1: klikk tre hotspots. Fase 2: "hva om"-alternativ. Fase 3: WinScreen.

type Phase = 'explore' | 'whatif' | 'done';

interface HotspotInfo {
    id: string;
    title: string;
    text: string;
}

const HOTSPOTS: HotspotInfo[] = [
    {
        id: 'kolonner',
        title: 'Fascistkolonnene - et bluff',
        text: 'Ca. 30 000 mann, dårlig bevæpnet, mange uten skikkelig utstyr. Hæren hadde over 28 000 soldater i Roma med kanoner og panserbiler. Et militært opprør ville vært knust på noen timer.',
    },
    {
        id: 'palass',
        title: 'Kong Viktor Emanuels beslutning',
        text: 'Statsminister Facta ba kongen signere unntakstilstanden som ville mobilisert hæren. Kongen nektet - kanskje av frykt for borgerkrig, eller fordi han håpet Mussolini kunne kontrolleres. Istedenfor inviterte han Mussolini til å danne regjering.',
    },
    {
        id: 'garde',
        title: 'Hæren som sto stille',
        text: 'Den kongelige garde og de regulære styrkene hadde klare ordrer om å holde Roma. De ventet bare på kommandoen. Kommandoen kom aldri. Uten kongens underskrift sto soldatene passive mens fascistene marsjerte inn.',
    },
];

const MarsjenMotRoma3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [phase, setPhase] = useState<Phase>('explore');
    const [clicked, setClicked] = useState<Set<string>>(new Set());
    const [activeFact, setActiveFact] = useState<HotspotInfo | null>(null);

    const allExplored = clicked.size === HOTSPOTS.length;
    const banner =
        phase === 'whatif'
            ? 'Hva om kongen hadde signert unntakstilstanden?'
            : clicked.size === 0
              ? 'Oktober 1922. Klikk på de tre elementene og finn ut hvorfor marsjen lyktes.'
              : allExplored
                ? 'Du har utforsket alt. Trykk knappen nedenfor.'
                : null;

    const handleHotspot = (id: string) => {
        const info = HOTSPOTS.find((h) => h.id === id);
        if (!info) return;
        sounds.play('pick');
        const next = new Set(clicked);
        next.add(id);
        setClicked(next);
        setActiveFact(info);
    };

    const triggerWhatIf = () => {
        sounds.play('advance');
        setPhase('whatif');
        setActiveFact(null);
    };

    const finish = () => {
        sounds.play('complete');
        setPhase('done');
        onComplete({ score: 1, completed: true });
    };

    const reset = () => {
        setPhase('explore');
        setClicked(new Set());
        setActiveFact(null);
    };

    return (
        <MicroGameScaffold
            title="Marsjen mot Roma"
            subtitle="Avdekk det historiske paradokset: fascistene vant uten å være sterke nok"
            estimatedSeconds={140}
            onRetry={clicked.size > 0 || phase !== 'explore' ? reset : undefined}
            canvas={{
                idle: phase === 'explore' && clicked.size === 0,
                camera: { position: [0, 6, 13], fov: 44 },
                background: '#1a1a2e',
                target: [0, 1, 0],
            }}
            containerClassName="bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]"
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="bl">Roma, oktober 1922</SceneBadge>
                </>
            }
            scene={
                <RomaScene
                    phase={phase}
                    clicked={clicked}
                    onHotspot={handleHotspot}
                />
            }
        >
            {phase === 'explore' && (
                <div className="flex flex-col gap-3">
                    {activeFact ? (
                        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="font-bold text-amber-900 text-sm mb-1">
                                {activeFact.title}
                            </p>
                            <p className="text-sm text-amber-800 leading-relaxed">
                                {activeFact.text}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-600 leading-relaxed px-1">
                            Klikk på fascistkolonnene, kongens palass og den kongelige garde for å
                            avdekke det historiske paradokset.
                        </p>
                    )}
                    <div className="flex items-center gap-2">
                        {HOTSPOTS.map((h) => (
                            <div
                                key={h.id}
                                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${
                                    clicked.has(h.id)
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                        : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}
                            >
                                {clicked.has(h.id) ? '✓' : '○'}
                                {h.id.charAt(0).toUpperCase() + h.id.slice(1)}
                            </div>
                        ))}
                    </div>
                    {allExplored && (
                        <button
                            onClick={triggerWhatIf}
                            className="self-start inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 text-white rounded-xl text-sm font-bold hover:bg-indigo-800 transition"
                        >
                            Hva om kongen hadde handlet?
                        </button>
                    )}
                </div>
            )}

            {phase === 'whatif' && (
                <div className="flex flex-col gap-3">
                    <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <p className="font-bold text-emerald-900 text-sm mb-1">
                            Det alternative utfallet
                        </p>
                        <p className="text-sm text-emerald-800 leading-relaxed">
                            Hadde kong Viktor Emanuel signert unntakstilstanden, ville hæren rykket
                            ut og spredt marchene i løpet av timer. Mussolini ville blitt arrestert.
                            Italia ville forblitt et demokrati - og historien om fascisme i Europa
                            ville sett helt annerledes ut.
                        </p>
                    </div>
                    <button
                        onClick={finish}
                        className="self-start inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition"
                    >
                        Fortsett
                    </button>
                </div>
            )}

            {phase === 'done' && (
                <WinScreen title="Marsjen lyktes fordi kongen ga seg" onReplay={reset}>
                    Fascistene hadde ikke militær styrke nok til å ta Roma. De vant fordi kongen
                    nektet å bruke hæren. Demokratiets fall skyldtes ikke fascistenes styrke, men
                    demokratiets egne representanters svakhet.
                </WinScreen>
            )}
        </MicroGameScaffold>
    );
};

// ---- 3D-SCENE ----

function RomaScene({
    phase,
    clicked,
    onHotspot,
}: {
    phase: Phase;
    clicked: Set<string>;
    onHotspot: (id: string) => void;
}) {
    return (
        <group>
            <GroundPlane size={30} />

            {/* Gate mot Roma */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                <planeGeometry args={[6, 26]} />
                <meshStandardMaterial color="#2c2c44" roughness={1} />
            </mesh>

            {/* Kongens palass - bakgrunn */}
            <PalassBuilding clicked={clicked.has('palass')} />

            {/* Kongelig garde - midten */}
            <GuardGroup clicked={clicked.has('garde')} />

            {/* Fascistkolonner - forgrunn */}
            <FascistColumns phase={phase} />

            {/* Hotspots (bare i explore-fase) */}
            {phase === 'explore' && (
                <>
                    <Hotspot
                        position={[0, 0.8, 5]}
                        onSelect={() => onHotspot('kolonner')}
                        label="Fascistkolonnene"
                        radius={0.55}
                        color="#dc2626"
                    />
                    <Hotspot
                        position={[0, 2.5, -7]}
                        onSelect={() => onHotspot('palass')}
                        label="Kongens palass"
                        radius={0.55}
                        color="#7c3aed"
                    />
                    <Hotspot
                        position={[0, 1.0, -1]}
                        onSelect={() => onHotspot('garde')}
                        label="Den kongelige garde"
                        radius={0.55}
                        color="#1d4ed8"
                    />
                </>
            )}

            {/* Lys - nattscene med fakkelgløde */}
            <ambientLight intensity={0.15} color="#2030a0" />
            <pointLight position={[-4, 3, 7]} intensity={1.4} color="#ff8c00" distance={12} />
            <pointLight position={[4, 3, 7]} intensity={1.1} color="#ff8c00" distance={12} />
            <pointLight position={[0, 5, -7]} intensity={0.7} color="#dde0ff" distance={16} />
        </group>
    );
}

function PalassBuilding({ clicked }: { clicked: boolean }) {
    return (
        <group position={[0, 0, -9]}>
            {/* Hoveddel */}
            <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[10, 5, 2]} />
                <meshStandardMaterial color={clicked ? '#d4c9b0' : '#c8b89a'} roughness={0.9} />
            </mesh>
            {/* Søyler */}
            {[-3.5, -2, -0.5, 1, 2.5].map((x, i) => (
                <mesh key={i} position={[x, 1.5, 1.1]} castShadow>
                    <cylinderGeometry args={[0.15, 0.18, 3, 8]} />
                    <meshStandardMaterial color="#e8dcc8" roughness={0.85} />
                </mesh>
            ))}
            {/* Gavl */}
            <mesh position={[0, 5.2, 0]}>
                <boxGeometry args={[10, 0.4, 2.2]} />
                <meshStandardMaterial color="#b8a888" roughness={0.9} />
            </mesh>
            {/* Vinduslys */}
            <pointLight position={[0, 3, 0.5]} intensity={0.35} color="#ffe8a0" distance={5} />
        </group>
    );
}

function GuardGroup({ clicked }: { clicked: boolean }) {
    const color = clicked ? '#1d4ed8' : '#374151';
    return (
        <group position={[0, 0, -1.5]}>
            {([-2.4, -0.8, 0.8, 2.4] as number[]).map((x, i) => (
                <Figure key={i} position={[x, 0, 0]} body={color} skin="#d4a77a" />
            ))}
        </group>
    );
}

function FascistColumns({ phase }: { phase: Phase }) {
    const grp = useRef<THREE.Group>(null);
    const dir = useRef(1);

    useFrame((_, dt) => {
        if (!grp.current) return;
        if (phase === 'whatif' || phase === 'done') {
            // Trekker seg tilbake
            grp.current.position.z = damp(grp.current.position.z, 12, dt, 1.5);
        } else {
            // Langsom, truende fremrykk
            grp.current.position.z += dt * 0.25 * dir.current;
            if (grp.current.position.z > 6) dir.current = -1;
            if (grp.current.position.z < 2) dir.current = 1;
        }
    });

    return (
        <group ref={grp} position={[0, 0, 3]}>
            {/* Rad 1 */}
            {([-3, -1.5, 0, 1.5, 3] as number[]).map((x, i) => (
                <Figure key={`r1-${i}`} position={[x, 0, 0]} body="#1a1a1a" skin="#c8a07a" />
            ))}
            {/* Rad 2 */}
            {([-2.5, -1, 0.5, 2] as number[]).map((x, i) => (
                <Figure key={`r2-${i}`} position={[x, 0, 1.8]} body="#1a1a1a" skin="#c8a07a" />
            ))}
            {/* Rad 3 */}
            {([-1.5, 0, 1.5] as number[]).map((x, i) => (
                <Figure key={`r3-${i}`} position={[x, 0, 3.4]} body="#1a1a1a" skin="#c8a07a" />
            ))}
        </group>
    );
}

export default MarsjenMotRoma3D;
