import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    GroundPlane,
    SceneBanner,
    SceneBadge,
    DragHint,
    SceneFact,
    WinScreen,
    SceneSlider,
    DataReadout,
    damp,
    useAmbience,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til artikkelen om spanskesyken. Eleven ser smitten spre seg hus
// for hus gjennom en liten by i 1918, og bremser den ved å skru på tiltak:
// stenge skolen, stenge kirken og isolere de syke. Dra tidsspaken og se
// forskjellen. Lyspæra: jo flere tiltak, desto kortere kommer smitten - byer
// som handlet tidlig mistet langt færre mennesker enn byer som ventet.
// Mekanikken ER poenget: å kutte kontakt stopper en epidemi.

const SPACING = 2.3;
const REACH = 7.6; // hvor langt smitten når ved full tid uten tiltak
const BLOCK = 2.6; // hvor mye hvert tiltak holder smitten tilbake

interface House {
    x: number;
    z: number;
    dist: number; // rutenett-avstand fra det første syke huset
    source: boolean;
}

// 4x4 rutenett med hus. Smitten starter i hjørnet (rad 0, kol 0).
const HOUSES: House[] = (() => {
    const list: House[] = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            list.push({
                x: (c - 1.5) * SPACING,
                z: (r - 1.5) * SPACING,
                dist: r + c,
                source: r === 0 && c === 0,
            });
        }
    }
    return list;
})();

const MEASURES = [
    { id: 'skole', label: 'Steng skolen', pos: [-1.6, 1.3, 5.4] as [number, number, number] },
    { id: 'kirke', label: 'Steng kirken', pos: [4.8, 1.6, -0.4] as [number, number, number] },
    {
        id: 'isoler',
        label: 'Isoler de syke',
        pos: [-3.4, 1.2, -3.4] as [number, number, number],
    },
];

const SmittenIByen3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const ambience = useAmbience('wind');
    const [measures, setMeasures] = useState<Set<string>>(new Set());
    const [time, setTime] = useState(0);
    const [banner, setBanner] = useState<string | null>(
        'Klikk tiltakene i byen, dra så tidsspaken og se smitten spre seg.'
    );
    const [fact, setFact] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const m = measures.size;
    const front = time * REACH - m * BLOCK;
    const sick = HOUSES.filter((h) => h.dist <= front || h.source).length;
    const healthy = HOUSES.length - sick;

    const reset = () => {
        setMeasures(new Set());
        setTime(0);
        setDone(false);
        setFact(null);
        setBanner('Klikk tiltakene i byen, dra så tidsspaken og se smitten spre seg.');
    };

    const toggleMeasure = (id: string) => {
        if (done) return;
        ambience.start();
        setMeasures((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
        });
        sounds.play('correct');
    };

    // Avgjør utfall når tiden er kjørt helt fram.
    useEffect(() => {
        if (done) return;
        if (time < 0.96) return;
        if (m >= 2 && healthy >= 9) {
            setDone(true);
            setBanner(null);
            setFact(null);
            sounds.play('complete');
            setTimeout(() => onComplete({ score: 1, completed: true }), 300);
        } else if (m === 0) {
            setBanner('Uten tiltak ble nesten hele byen syk. Skru på tiltak og dra tiden tilbake.');
            setFact(
                'Slik gikk det i byer som ventet for lenge. Smitten spredte seg fra hus til hus til alle var rammet.'
            );
        } else {
            setBanner('Smitten kom for langt. Legg til flere tiltak og prøv igjen.');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [time, m, healthy]);

    const onTime = (v: number) => {
        if (done) return;
        setTime(v);
        ambience.start();
        if (v > 0.1 && m === 0)
            setBanner('Se hvor fort den sprer seg! Skru på tiltak for å bremse den.');
        else if (v > 0.1) setBanner(null);
    };

    const idle = time < 0.02 && m === 0;

    return (
        <MicroGameScaffold
            title="Stopp smitten i byen"
            subtitle="Skru på tiltak og dra tidsspaken - se hvor langt spanskesyken når med og uten tiltak"
            estimatedSeconds={150}
            onRetry={m > 0 || time > 0.02 ? reset : undefined}
            canvas={{
                idle,
                camera: { position: [0, 11, 13], fov: 42 },
                background: '#cdd6dd',
                light: 'overcast',
                fog: { near: 22, far: 50 },
                target: [0, 0.4, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">{done ? 'Byen reddet' : 'En norsk by - 1918'}</SceneBadge>
                    {!done && (
                        <DataReadout
                            corner="bl"
                            items={[
                                { label: 'Friske hus', value: healthy },
                                { label: 'Syke hus', value: sick },
                                { label: 'Tiltak', value: m, unit: '/ 3' },
                            ]}
                        />
                    )}
                    <DragHint show={idle} corner="bc">
                        Dra tidsspaken under vinduet
                    </DragHint>
                </>
            }
            scene={
                <Town
                    front={front}
                    measures={measures}
                    onMeasure={toggleMeasure}
                    done={done}
                />
            }
        >
            <div className="flex flex-col gap-3">
                {!done ? (
                    <>
                        <SceneSlider
                            label="La tiden gå (ukene som passerer)"
                            min={0}
                            max={1}
                            step={0.01}
                            value={time}
                            onChange={onTime}
                            valueLabel={(v) => `Uke ${Math.round(v * 8)}`}
                        />
                        <p className="text-sm text-slate-600 leading-snug">
                            Klikk de tre tiltakene i byen, og dra spaken for å la ukene gå. Klarer du
                            å holde minst{' '}
                            <span className="font-bold text-emerald-700">9 hus friske</span> til
                            slutten?
                        </p>
                        {fact && <SceneFact>{fact}</SceneFact>}
                    </>
                ) : (
                    <WinScreen title="Byen slapp billig unna!" onReplay={reset}>
                        Ved å stenge skolen og kirken og isolere de syke kuttet du smitteveiene, og
                        de fleste husene holdt seg friske. Det var nettopp dette som skjedde i 1918:
                        byer som stengte samlingssteder tidlig, mistet langt færre mennesker enn byer
                        som ventet. Å kutte kontakt er det sterkeste våpenet mot en epidemi.
                    </WinScreen>
                )}
            </div>
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function Town({
    front,
    measures,
    onMeasure,
    done,
}: {
    front: number;
    measures: Set<string>;
    onMeasure: (id: string) => void;
    done: boolean;
}) {
    return (
        <group>
            <GroundPlane size={40} depth={36} color="#9aa886" />

            {/* Husene i rutenettet */}
            {HOUSES.map((h, i) => (
                <HouseMesh key={i} house={h} infected={h.source || h.dist <= front} />
            ))}

            {/* Samlingsbygg: skole og kirke */}
            <Schoolhouse closed={measures.has('skole')} />
            <Church closed={measures.has('kirke')} />
            {/* Sykehustelt der de syke isoleres */}
            <SickTent active={measures.has('isoler')} />

            {/* Tiltaks-hotspots */}
            {!done &&
                MEASURES.filter((meas) => !measures.has(meas.id)).map((meas) => (
                    <Hotspot
                        key={meas.id}
                        position={meas.pos}
                        onSelect={() => onMeasure(meas.id)}
                        label={meas.label}
                        radius={0.55}
                        color="#0e7490"
                    />
                ))}
        </group>
    );
}

// Ett hus som demper fargen fra friskt (lyst) til sykt (rødt).
function HouseMesh({ house, infected }: { house: House; infected: boolean }) {
    const body = useRef<THREE.MeshStandardMaterial>(null);
    const marker = useRef<THREE.Group>(null);
    const sick = useRef(0);
    const healthy = new THREE.Color('#e6dcc4');
    const ill = new THREE.Color('#b23b30');

    useFrame((_, dt) => {
        sick.current = damp(sick.current, infected ? 1 : 0, dt, 3);
        if (body.current) body.current.color.lerpColors(healthy, ill, sick.current);
        if (marker.current) {
            const s = Math.max(sick.current, 0.001);
            marker.current.scale.setScalar(s);
            marker.current.position.y = 1.5 + sick.current * 0.1;
        }
    });

    return (
        <group position={[house.x, 0, house.z]}>
            {/* kropp */}
            <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.2, 1.1, 1.2]} />
                <meshStandardMaterial ref={body} color="#e6dcc4" roughness={0.95} flatShading />
            </mesh>
            {/* tak */}
            <mesh position={[0, 1.35, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[1.0, 0.7, 4]} />
                <meshStandardMaterial color="#6b4a35" roughness={1} flatShading />
            </mesh>
            {/* syk-markør: rød glødekule over taket */}
            <group ref={marker} position={[0, 1.5, 0]} scale={0.001}>
                <mesh>
                    <sphereGeometry args={[0.22, 12, 12]} />
                    <meshStandardMaterial
                        color="#ef4444"
                        emissive="#b91c1c"
                        emissiveIntensity={0.6}
                        toneMapped={false}
                    />
                </mesh>
            </group>
            {house.source && (
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.9, 1.1, 24]} />
                    <meshBasicMaterial color="#b91c1c" />
                </mesh>
            )}
        </group>
    );
}

// Skolen - et lengre bygg. Når den stenges kommer en bom foran døra.
function Schoolhouse({ closed }: { closed: boolean }) {
    return (
        <group position={[-1.6, 0, 5.4]}>
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.0, 1.5, 1.6]} />
                <meshStandardMaterial color={closed ? '#94a3a8' : '#d8c8a0'} roughness={0.95} flatShading />
            </mesh>
            <mesh position={[0, 1.75, 0]} castShadow>
                <boxGeometry args={[3.2, 0.5, 1.8]} />
                <meshStandardMaterial color="#7a5740" roughness={1} flatShading />
            </mesh>
            <Closed show={closed} y={0.7} />
        </group>
    );
}

// Kirken - bygg med tårn. Bom foran når den stenges.
function Church({ closed }: { closed: boolean }) {
    return (
        <group position={[4.8, 0, -0.4]}>
            <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.8, 1.6, 2.6]} />
                <meshStandardMaterial color={closed ? '#94a3a8' : '#d8d2c4'} roughness={0.95} flatShading />
            </mesh>
            <mesh position={[0, 2.0, 1.0]} castShadow>
                <boxGeometry args={[0.9, 1.4, 0.9]} />
                <meshStandardMaterial color={closed ? '#8a979c' : '#cdc6b6'} roughness={1} flatShading />
            </mesh>
            <mesh position={[0, 3.0, 1.0]} castShadow>
                <coneGeometry args={[0.7, 1.0, 4]} />
                <meshStandardMaterial color="#6b4a35" roughness={1} flatShading />
            </mesh>
            <Closed show={closed} y={0.7} />
        </group>
    );
}

// Sykehustelt der de syke isoleres - vises når tiltaket er aktivt.
function SickTent({ active }: { active: boolean }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        const s = damp(ref.current.scale.x, active ? 1 : 0.001, dt, 4);
        ref.current.scale.setScalar(Math.max(s, 0.001));
    });
    return (
        <group ref={ref} position={[-3.4, 0, -3.4]} scale={0.001}>
            <mesh position={[0, 0.55, 0]} castShadow>
                <coneGeometry args={[1.1, 1.3, 4]} />
                <meshStandardMaterial color="#e8ece9" roughness={1} flatShading />
            </mesh>
            {/* rødt kors */}
            <mesh position={[0, 0.7, 0.78]}>
                <boxGeometry args={[0.5, 0.14, 0.03]} />
                <meshStandardMaterial color="#d33" />
            </mesh>
            <mesh position={[0, 0.7, 0.78]}>
                <boxGeometry args={[0.14, 0.5, 0.03]} />
                <meshStandardMaterial color="#d33" />
            </mesh>
        </group>
    );
}

// En "stengt"-bom som spretter opp foran et bygg.
function Closed({ show, y }: { show: boolean; y: number }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (!ref.current) return;
        const s = damp(ref.current.scale.y, show ? 1 : 0.001, dt, 6);
        ref.current.scale.y = Math.max(s, 0.001);
    });
    return (
        <group ref={ref} position={[0, y, 1.4]} scale={[1, 0.001, 1]}>
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2.2, 0.18, 0.18]} />
                <meshStandardMaterial color="#c2410c" />
            </mesh>
        </group>
    );
}

export default SmittenIByen3D;
