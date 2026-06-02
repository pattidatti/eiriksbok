import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    SceneBanner,
    SceneBadge,
    WinScreen,
    GroundPlane,
    Figure,
    Burst,
    DataReadout,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill for km-11: hold grensene dine.
// Du står i sentrum på din egen grenselinje. Fem relasjoner står rundt deg, og
// jo nærmere de står, desto hardere lener de seg inn med et press som krysser en
// grense. Klikk hver for å holde grensa. De som respekterer den, blir stående
// hos deg. Gjengen som bare ga deg et ultimatum, forsvinner når du står for noe.
// Lyspære: det er vanskeligst å si nei til dem du står nærmest - men de som
// respekterer grensa di, er de ekte relasjonene.

interface Relation {
    id: string;
    label: string;
    request: string;
    closeness: number; // 0..1 - styrer hvor hardt de lener seg inn
    respects: boolean; // respekterer de grensa når du holder den?
    pos: [number, number, number];
    count: number; // antall figurer (gjengen er flere)
}

const RELATIONS: Relation[] = [
    {
        id: 'fremmed',
        label: 'Fremmed',
        request: 'Gi meg nummeret ditt.',
        closeness: 0.15,
        respects: true,
        pos: [-5.8, 0, 2.6],
        count: 1,
    },
    {
        id: 'klasse',
        label: 'Klassekamerat',
        request: 'Bli med og ert han i friminuttet.',
        closeness: 0.4,
        respects: true,
        pos: [4.7, 0, 2.9],
        count: 1,
    },
    {
        id: 'venn',
        label: 'Venn',
        request: 'Lån meg svarene på prøven.',
        closeness: 0.65,
        respects: true,
        pos: [-3.4, 0, 3.4],
        count: 1,
    },
    {
        id: 'beste',
        label: 'Bestevenn',
        request: 'Ikke si til foreldra dine at vi var der.',
        closeness: 0.85,
        respects: true,
        pos: [2.6, 0, 3.7],
        count: 1,
    },
    {
        id: 'gjeng',
        label: 'Gjengen du vil høre til',
        request: 'Drikk dette, ellers er du ikke med oss.',
        closeness: 1.0,
        respects: false,
        pos: [0, 0, 4.2],
        count: 3,
    },
];

const Grenselinja3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
    const [won, setWon] = useState(false);
    const [banner, setBanner] = useState<string | null>(
        'Klikk hver person og hold grensa di. Jo nærmere de står, desto hardere presser de.'
    );
    const [burst, setBurst] = useState(0);

    const count = held.filter(Boolean).length;

    const reset = () => {
        setHeld([false, false, false, false, false]);
        setWon(false);
        setBurst(0);
        setBanner('Klikk hver person og hold grensa di. Jo nærmere de står, desto hardere presser de.');
    };

    const hold = (i: number) => {
        if (held[i] || won) return;
        const next = [...held];
        next[i] = true;
        const rel = RELATIONS[i];
        const newCount = next.filter(Boolean).length;
        if (rel.respects) {
            sounds.play('correct');
        } else {
            sounds.play('drop');
        }
        setHeld(next);
        if (newCount === 5) {
            sounds.play('complete');
            setWon(true);
            setBurst((b) => b + 1);
            setBanner(null);
            onComplete({ score: 1, completed: true, artifact: { held: next } });
        } else if (rel.respects) {
            setBanner(`${rel.label} respekterte grensa di og ble stående hos deg.`);
        } else {
            setBanner(
                'Gjengen ga deg et ultimatum. Du holdt grensa - og de gikk. Et fellesskap som krever at du gir slipp på deg selv, var aldri trygt.'
            );
        }
    };

    return (
        <MicroGameScaffold
            title="Hold grensa di"
            subtitle="Det er lett å si nei til en fremmed - vanskeligere til dem du står nærmest"
            estimatedSeconds={110}
            onRetry={count > 0 || won ? reset : undefined}
            canvas={{
                idle: false,
                camera: { position: [0, 7.5, 13], fov: 44 },
                background: '#dbeafe',
                target: [0, 0.8, 1.5],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} />
                    <DataReadout items={[{ label: 'Grenser holdt', value: `${count}/5` }]} />
                    <SceneBadge corner="br">
                        {won ? 'Du holdt grensene dine' : 'Egne grenser'}
                    </SceneBadge>
                </>
            }
            scene={<BoundaryScene held={held} burst={burst} onHold={hold} />}
        >
            {won ? (
                <WinScreen title="Du holdt grensene dine!" onReplay={reset}>
                    Presset var sterkest fra dem du står nærmest - bestevennen og gjengen lente seg
                    hardest inn. De fire som respekterte grensa di, ble værende. Gjengen som bare
                    ville ha lydighet, forsvant da du sto for noe. Det er ikke et tap: et fellesskap
                    der du må gi slipp på deg selv for å være med, så deg aldri ordentlig.
                </WinScreen>
            ) : (
                <div className="flex items-center gap-3 px-1 py-1">
                    <span className="text-sm text-slate-600 font-medium whitespace-nowrap">
                        {count}/5 grenser holdt:
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-sky-600"
                            animate={{ width: `${(count / 5) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                        />
                    </div>
                    <span className="text-sm text-slate-500 whitespace-nowrap">
                        {5 - count} igjen
                    </span>
                </div>
            )}
        </MicroGameScaffold>
    );
};

// ============================================================
//  3D-SCENEN
// ============================================================

function BoundaryScene({
    held,
    burst,
    onHold,
}: {
    held: boolean[];
    burst: number;
    onHold: (i: number) => void;
}) {
    return (
        <group>
            <GroundPlane size={40} depth={30} color="#bcd3e8" />

            {/* Du - i sentrum, på din egen grenselinje */}
            <group position={[0, 0, 0]}>
                <Figure body="#2563eb" skin="#fcd9b8" />
                {/* Din boundary-ring på bakken */}
                <BoundaryRing />
            </group>

            {RELATIONS.map((rel, i) => (
                <Person key={rel.id} rel={rel} held={held[i]} onHold={() => onHold(i)} />
            ))}

            <Burst position={[0, 1.4, 0]} trigger={burst} color="#bae6fd" count={36} spread={4} />
        </group>
    );
}

// Din lysende grenselinje på bakken.
function BoundaryRing() {
    const ring = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (!ring.current) return;
        const s = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.04;
        ring.current.scale.setScalar(s);
    });
    return (
        <mesh ref={ring} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.75, 48]} />
            <meshStandardMaterial
                color="#38bdf8"
                emissive="#0ea5e9"
                emissiveIntensity={0.6}
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

// Én relasjon. Lener seg mot deg med en kraft som vokser med nærheten. Når du
// holder grensa: respektfulle blir stående og varme, gjengen trekker seg unna.
function Person({ rel, held, onHold }: { rel: Relation; held: boolean; onHold: () => void }) {
    const outer = useRef<THREE.Group>(null);
    const lean = useRef<THREE.Group>(null);
    const orb = useRef<THREE.Mesh>(null);
    const leanT = useRef(0);
    const exitT = useRef(0);

    const dir = useMemo(
        () => new THREE.Vector3(-rel.pos[0], 0, -rel.pos[2]).normalize(),
        [rel.pos]
    );
    // Akse i bakkeplanet vinkelrett på retningen mot sentrum - vi tipper toppen
    // av figuren denne veien så den lener seg inn mot deg.
    const axis = useMemo(() => new THREE.Vector3(dir.z, 0, -dir.x).normalize(), [dir]);
    const quat = useMemo(() => new THREE.Quaternion(), []);

    useFrame(({ clock }, dt) => {
        const t = clock.getElapsedTime();
        const baseLean = 0.1 + rel.closeness * 0.4;
        const target = held
            ? 0
            : baseLean + Math.sin(t * (1.4 + rel.closeness * 2)) * 0.07 * rel.closeness;
        leanT.current = damp(leanT.current, target, dt, 6);
        if (lean.current) {
            quat.setFromAxisAngle(axis, leanT.current);
            lean.current.quaternion.copy(quat);
        }

        // Gjengen (respects=false) trekker seg unna når grensa holdes.
        const leaving = held && !rel.respects;
        exitT.current = damp(exitT.current, leaving ? 1 : 0, dt, 2.2);
        if (outer.current) {
            const k = 1 + exitT.current * 1.5;
            outer.current.position.set(rel.pos[0] * k, 0, rel.pos[2] * k);
            outer.current.scale.setScalar(Math.max(0.0001, 1 - exitT.current));
        }

        if (orb.current) {
            const s = 0.9 + Math.sin(t * (2 + rel.closeness * 3)) * 0.18;
            orb.current.scale.setScalar(held ? 0 : s);
        }
    });

    const warm = held && rel.respects;
    const bodyColor = warm ? '#e0982f' : '#8a8f96';
    const orbRadius = 0.16 + rel.closeness * 0.22;

    // Figur-utlegg for gruppen.
    const offsets: [number, number, number][] =
        rel.count === 3
            ? [
                  [-0.42, 0, 0.1],
                  [0.42, 0, -0.1],
                  [0, 0, -0.35],
              ]
            : [[0, 0, 0]];

    return (
        <group ref={outer} position={rel.pos}>
            <group ref={lean}>
                {offsets.map((o, k) => (
                    <Figure key={k} position={o} body={bodyColor} skin="#e9c39a" />
                ))}

                {/* Press-orb over hodet - større og raskere jo nærmere de står */}
                <mesh ref={orb} position={[0, 1.15, 0]}>
                    <sphereGeometry args={[orbRadius, 16, 16]} />
                    <meshStandardMaterial
                        color="#f97316"
                        emissive="#ea580c"
                        emissiveIntensity={0.7}
                        transparent
                        opacity={0.85}
                    />
                </mesh>
            </group>

            {/* Liten grønn grensemarkør på bakken når de respekterer og blir */}
            {warm && (
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.5, 0.62, 32]} />
                    <meshStandardMaterial
                        color="#34d399"
                        emissive="#10b981"
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.9}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {!held && (
                <Hotspot
                    position={[0, 1.9, 0]}
                    onSelect={onHold}
                    label={`${rel.label}: «${rel.request}»`}
                    radius={0.5}
                />
            )}
        </group>
    );
}

export default Grenselinja3D;
