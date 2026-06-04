import React, { useEffect, useRef, useState } from 'react';
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
    WaterPlane,
    Building,
    Figure,
    Smoke,
    Gear,
    Burst,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill: "Teknologibølgja". Eleven skyver teknologinivået oppover og ser
// en liten bygd forvandle seg samtidig på tre arenaer - enkeltmenneske (folk
// framme), samfunn (byen i midten) og natur (elv og trær bak). Lyspæren: hver
// gang du løfter teknologien, stiger BÅDE gevinst og kostnad. Du kan ikke skru
// opp den ene uten at den andre følger med. Til slutt får eleven sette inn grønn
// teknologi - samme kraft som skapte forurensningen kan også rydde opp i den.

type Phase = 'play' | 'won';

// Avled en epoke-etikett av teknologinivået (0..1).
function eraLabel(t: number): string {
    if (t < 0.22) return 'Før industrien';
    if (t < 0.48) return 'Industrialisering';
    if (t < 0.74) return 'Digital tid';
    return 'Kunstig intelligens';
}

const Teknologibolgen3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [pct, setPct] = useState(0); // teknologinivå 0..100
    const [green, setGreen] = useState(false);
    const [phase, setPhase] = useState<Phase>('play');
    const [burst, setBurst] = useState(0);
    const lastEra = useRef('Før industrien');

    const tech = pct / 100;
    const heavySmoke = tech >= 0.55 && !green;
    const canGreen = tech >= 0.8 && !green;

    // Gevinst og kostnad stiger sammen. Grønn teknologi kutter kostnaden.
    const gevinst = Math.round(tech * 100);
    const kostnad = Math.round(tech * 100 * (green ? 0.45 : 1));

    // Lyd når eleven krysser inn i en ny epoke.
    useEffect(() => {
        const era = eraLabel(tech);
        if (era !== lastEra.current) {
            lastEra.current = era;
            sounds.play('sceneChange');
        }
    }, [tech, sounds]);

    const installGreen = () => {
        if (!canGreen) return;
        setGreen(true);
        setBurst((b) => b + 1);
        sounds.play('complete');
        setPhase('won');
        onComplete({ score: 1, completed: true, artifact: { pct, green: true } });
    };

    const reset = () => {
        setPct(0);
        setGreen(false);
        setPhase('play');
        lastEra.current = 'Før industrien';
    };

    const banner =
        phase === 'won'
            ? null
            : canGreen
            ? 'Naturen kveles av røyk. Sett inn den grønne teknologien som lyser bak.'
            : heavySmoke
            ? 'Gevinsten vokser - men se røyken og folka som faller fra.'
            : pct < 5
            ? 'Skyv teknologinivået oppover. Se hva som skjer med folk, by og natur.'
            : null;

    return (
        <MicroGameScaffold
            title="Teknologibølgja"
            subtitle="Skru opp teknologien og se bygda forvandle seg på alle tre arenaene"
            estimatedSeconds={140}
            onRetry={pct > 0 || green ? reset : undefined}
            canvas={{
                idle: pct < 1,
                camera: { position: [0, 7.5, 17], fov: 42 },
                background: green ? '#d6ecf2' : heavySmoke ? '#c9c6bd' : '#cfe3ef',
                target: [0, 1, -1],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">{eraLabel(tech)}</SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[
                            { label: 'Gevinst', value: gevinst },
                            { label: 'Kostnad', value: kostnad },
                        ]}
                    />
                </>
            }
            scene={
                <VillageScene
                    tech={tech}
                    green={green}
                    showGreenHotspot={canGreen}
                    onGreen={installGreen}
                    burst={burst}
                />
            }
        >
            <div className="flex flex-col gap-3">
                <SceneSlider
                    label="Teknologinivå"
                    min={0}
                    max={100}
                    step={1}
                    value={pct}
                    onChange={(v) => phase === 'play' && setPct(v)}
                    valueLabel={(v) => `${v} %`}
                />
                {phase === 'won' ? (
                    <WinScreen
                        title="Du drev teknologien helt fram - og ryddet opp!"
                        onReplay={reset}
                    >
                        Hvert hakk opp ga både gevinst og kostnad, på alle tre arenaene: folk fikk
                        nye verktøy men noen mistet jobben, byen vokste men naturen ble forurenset.
                        Til slutt viste det seg at samme kraft - teknologien - også kan løse
                        problemet den skapte. Å drøfte teknologi er å se begge sidene samtidig.
                    </WinScreen>
                ) : (
                    <SceneFact>
                        Legg merke til tallene oppe til venstre: når gevinsten stiger, stiger
                        kostnaden med. Ingen teknologi gir bare fordeler - den treffer
                        enkeltmennesket, samfunnet og naturen på én gang.
                    </SceneFact>
                )}
            </div>
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function VillageScene({
    tech,
    green,
    showGreenHotspot,
    onGreen,
    burst,
}: {
    tech: number;
    green: boolean;
    showGreenHotspot: boolean;
    onGreen: () => void;
    burst: number;
}) {
    return (
        <group>
            <GroundPlane size={32} depth={30} color="#86a55a" />

            {/* --- NATUR (bak): elv, trær, skorstein med røyk, grønn teknologi --- */}
            <WaterPlane
                position={[0, 0.03, -9.5]}
                size={[30, 6]}
                color={green ? '#3f8fb8' : '#5f7d7a'}
            />
            {[-9, -6.5, -4, 6.5, 9].map((x, i) => (
                <WitherTree key={i} x={x} z={-8 + (i % 2) * 1.4} tech={tech} green={green} />
            ))}
            <Chimney x={-2.5} tech={tech} green={green} />
            <Chimney x={2.6} tech={tech} green={green} />
            {green && <SolarFarm />}
            {green && <WindTurbine x={7.5} z={-9} />}

            {/* --- SAMFUNN (midt): byen som vokser + monopol-tårn --- */}
            <Townhouse x={-5} baseH={0.9} tech={tech} />
            <Townhouse x={-2.6} baseH={1.2} tech={tech} />
            <Townhouse x={2.6} baseH={1.1} tech={tech} />
            <Townhouse x={5} baseH={0.8} tech={tech} />
            <MonopolTower tech={tech} />
            <Machine tech={tech} />

            {/* --- ENKELTMENNESKE (framme): arbeiderne --- */}
            {[-4.5, -2.2, 0.2, 2.6, 4.8].map((x, i) => (
                <Worker key={i} x={x} index={i} tech={tech} />
            ))}

            {/* Grønn-teknologi-hotspot: direkte 3D-interaksjon */}
            {showGreenHotspot && (
                <Hotspot
                    position={[7.5, 2.2, -9]}
                    onSelect={onGreen}
                    label="Sett inn grønn teknologi"
                    radius={0.6}
                />
            )}

            <Burst
                position={[7.5, 2.4, -9]}
                trigger={burst}
                color="#bff0c4"
                count={32}
                spread={4}
            />
        </group>
    );
}

// Et tre som visner når teknologien stiger - med mindre grønn teknologi reddet naturen.
function WitherTree({ x, z, tech, green }: { x: number; z: number; tech: number; green: boolean }) {
    const grp = useRef<THREE.Group>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);
    // Helse: 1 = frisk, 0 = vissen. Synker med tech, men grønn teknologi løfter den opp igjen.
    const targetHealth = green ? 0.95 : Math.max(0.15, 1 - tech * 1.05);
    const cur = useRef(1);
    const healthy = new THREE.Color('#3f6b39');
    const dead = new THREE.Color('#8a7a4a');
    useFrame((_, dt) => {
        cur.current = damp(cur.current, targetHealth, dt, 3);
        if (grp.current) grp.current.scale.setScalar(0.7 + cur.current * 0.45);
        if (matRef.current) matRef.current.color.lerpColors(dead, healthy, cur.current);
    });
    return (
        <group ref={grp} position={[x, 0, z]}>
            <mesh position={[0, 0.4, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.14, 0.8, 6]} />
                <meshStandardMaterial color="#5c3f26" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.1, 0]} castShadow>
                <coneGeometry args={[0.6, 1.4, 8]} />
                <meshStandardMaterial ref={matRef} color="#3f6b39" roughness={0.9} />
            </mesh>
        </group>
    );
}

// Fabrikkskorstein. Vokser med tech og spyr røyk - til grønn teknologi rydder opp.
function Chimney({ x, tech, green }: { x: number; tech: number; green: boolean }) {
    const ref = useRef<THREE.Mesh>(null);
    const cur = useRef(0.001);
    const target = Math.max(0.001, (tech - 0.2) * 2.4);
    useFrame((_, dt) => {
        cur.current = damp(cur.current, target, dt, 4);
        if (ref.current) {
            ref.current.scale.y = Math.max(0.001, cur.current);
            ref.current.visible = cur.current > 0.05;
        }
    });
    const smoking = tech >= 0.3 && !green;
    return (
        <group position={[x, 0, -3.2]}>
            <mesh ref={ref} position={[0, 0.8, 0]} castShadow>
                <cylinderGeometry args={[0.22, 0.28, 1.6, 8]} />
                <meshStandardMaterial color="#6b5b50" roughness={0.95} />
            </mesh>
            <Smoke origin={[0, 1.7, 0]} show={smoking} count={6} color="#736f68" />
        </group>
    );
}

// Et byhus som vokser i høyden med teknologien (samfunnsvekst).
function Townhouse({ x, baseH, tech }: { x: number; baseH: number; tech: number }) {
    const ref = useRef<THREE.Group>(null);
    const cur = useRef(0.4);
    const target = baseH + tech * 1.6;
    useFrame((_, dt) => {
        cur.current = damp(cur.current, target, dt, 4);
        if (ref.current) ref.current.scale.y = cur.current / baseH;
    });
    return (
        <group ref={ref} position={[x, 0, -1.2]}>
            <Building body="#c08a55" roof="#7a4a30" w={1.5} h={baseH} d={1.3} />
        </group>
    );
}

// Det mørke monopol-tårnet: reiser seg først i digital tid, dominerer i AI-tida.
function MonopolTower({ tech }: { tech: number }) {
    const ref = useRef<THREE.Group>(null);
    const winRef = useRef<THREE.MeshStandardMaterial>(null);
    const cur = useRef(0.001);
    const target = Math.max(0.001, (tech - 0.5) * 8);
    useFrame((_, dt) => {
        cur.current = damp(cur.current, target, dt, 4);
        if (ref.current) {
            ref.current.scale.y = Math.max(0.001, cur.current / 4);
            ref.current.visible = cur.current > 0.1;
        }
        if (winRef.current) winRef.current.emissiveIntensity = 0.3 + tech * 0.7;
    });
    return (
        <group ref={ref} position={[0, 0, -2.2]}>
            <mesh position={[0, 2, 0]} castShadow>
                <boxGeometry args={[1.3, 4, 1.3]} />
                <meshStandardMaterial
                    ref={winRef}
                    color="#3a4250"
                    emissive="#9ec5ff"
                    emissiveIntensity={0.4}
                    roughness={0.5}
                    metalness={0.4}
                />
            </mesh>
        </group>
    );
}

// Den sentrale "innovasjonsmaskinen": tannhjul som spinner raskere med tech.
function Machine({ tech }: { tech: number }) {
    return (
        <group position={[0, 1.1, 0.4]}>
            <Gear
                position={[-0.45, 0, 0]}
                radius={0.55}
                teeth={10}
                color="#8a7f74"
                spin={tech * 4}
            />
            <Gear
                position={[0.5, -0.15, 0]}
                radius={0.4}
                teeth={8}
                color="#9a8f84"
                spin={-tech * 5.4}
            />
            <mesh position={[0, 0.05, 0.2]}>
                <sphereGeometry args={[0.26, 18, 18]} />
                <meshStandardMaterial
                    color="#ffd86b"
                    emissive="#f5b942"
                    emissiveIntensity={0.4 + tech * 0.9}
                    roughness={0.3}
                />
            </mesh>
        </group>
    );
}

// En arbeider framme. Får et glødende verktøy når teknologien kommer (gevinst),
// men enkelte (index 1 og 3) faller fra etter hvert (jobbtap = kostnad).
function Worker({ x, index, tech }: { x: number; index: number; tech: number }) {
    const grp = useRef<THREE.Group>(null);
    const displaced = index === 1 || index === 3;
    const fallen = displaced && tech > 0.5;
    const hasTool = !fallen && tech > 0.3;
    const cur = useRef(0);
    useFrame((_, dt) => {
        // 0 = står oppreist, 1 = falt om.
        cur.current = damp(cur.current, fallen ? 1 : 0, dt, 4);
        if (grp.current) {
            grp.current.rotation.z = cur.current * (Math.PI / 2 - 0.1);
            grp.current.position.y = cur.current * -0.18;
        }
    });
    return (
        <group ref={grp} position={[x, 0, 5]}>
            <Figure body={displaced ? '#6b5240' : '#3f5a6b'} skin="#e0b98c">
                {hasTool && (
                    <mesh position={[0.22, 0.4, 0]}>
                        <boxGeometry args={[0.08, 0.3, 0.08]} />
                        <meshStandardMaterial
                            color="#ffe39a"
                            emissive="#ffd24a"
                            emissiveIntensity={0.8}
                        />
                    </mesh>
                )}
            </Figure>
        </group>
    );
}

// Solcellepanel-rekke som dukker opp når eleven setter inn grønn teknologi.
function SolarFarm() {
    return (
        <group position={[-7.5, 0, -9]}>
            {[0, 1.1, 2.2].map((dx) => (
                <mesh key={dx} position={[dx, 0.5, 0]} rotation={[-Math.PI / 3.2, 0, 0]} castShadow>
                    <boxGeometry args={[0.9, 0.06, 0.7]} />
                    <meshStandardMaterial
                        color="#1e3a5f"
                        emissive="#2f6db5"
                        emissiveIntensity={0.35}
                        roughness={0.4}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Vindturbin med roterende blader (grønn teknologi).
function WindTurbine({ x, z }: { x: number; z: number }) {
    const blades = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (blades.current) blades.current.rotation.z += dt * 1.6;
    });
    return (
        <group position={[x, 0, z]}>
            <mesh position={[0, 1.4, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.12, 2.8, 8]} />
                <meshStandardMaterial color="#eef2f5" roughness={0.6} />
            </mesh>
            <group ref={blades} position={[0, 2.8, 0.1]}>
                {[0, 1, 2].map((i) => (
                    <mesh
                        key={i}
                        rotation={[0, 0, (i * Math.PI * 2) / 3]}
                        position={[0, 0.6, 0]}
                        castShadow
                    >
                        <boxGeometry args={[0.12, 1.3, 0.04]} />
                        <meshStandardMaterial color="#f4f8fb" roughness={0.5} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

export default Teknologibolgen3D;
