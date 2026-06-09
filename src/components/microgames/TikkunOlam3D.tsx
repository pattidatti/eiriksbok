import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    GroundPlane,
    Building,
    Figure,
    Tree,
    SceneBanner,
    SceneBadge,
    DataReadout,
    WinScreen,
    Burst,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// Mikrospill til "Sentrale trekk i Jødedommen".
// Kjerneideen eleven skal kjenne på kroppen: Tikkun Olam - å reparere verden -
// er ikke et ideal, det er en forpliktelse. Jødedommen er en handlingsreligion.
// Fire skader i en liten Jerusalem-by venter på reparasjon. Eleven klikker hver
// spot og ser verdenen lyse opp bit for bit. Først når alle fire er reparert,
// er verden hel igjen.

interface RepairInfo {
    id: string;
    label: string;
    done: string;
    position: [number, number, number];
    burstColor: string;
}

const REPAIRS: RepairInfo[] = [
    {
        id: 'mat',
        label: 'Gi mat til den sultne',
        done: '"Tzedakah" - du ga mat. Å hjelpe andre er en plikt, ikke veldedighet.',
        position: [-3.8, 0, 2.6],
        burstColor: '#f59e0b',
    },
    {
        id: 'bro',
        label: 'Reparer den ødelagte veien',
        done: '"Pikuach nefesh" - å rydde veien kan redde et liv. Ferdig reparert.',
        position: [3.6, 0, 1.0],
        burstColor: '#d97706',
    },
    {
        id: 'lys',
        label: 'Tenn Shabbat-lyset',
        done: 'Lyset er tent. Shabbat begynner - en hel dag satt av til Gud og hvile.',
        position: [0.5, 0, -3.2],
        burstColor: '#eab308',
    },
    {
        id: 'tre',
        label: 'Plant et nytt tre',
        done: '"Bal tashhit" - ikke ødelegg unødvendig. Treet er plantet. Verden er grønnere.',
        position: [-2.8, 0, -2.4],
        burstColor: '#16a34a',
    },
];

const TikkunOlam3D: React.FC<MicroGameProps> = ({ onComplete }) => {
    const sounds = useStepSounds();
    const [repaired, setRepaired] = useState<string[]>([]);
    const [won, setWon] = useState(false);
    const [banner, setBanner] = useState<string | null>(
        'Fire steder i byen trenger reparasjon. Klikk hvert symbol for å utføre Tikkun Olam.'
    );
    const [burst, setBurst] = useState(0);
    const [burstColor, setBurstColor] = useState('#f59e0b');

    const reset = () => {
        setRepaired([]);
        setWon(false);
        setBanner(
            'Fire steder i byen trenger reparasjon. Klikk hvert symbol for å utføre Tikkun Olam.'
        );
    };

    const repair = (r: RepairInfo) => {
        if (won || repaired.includes(r.id)) return;
        sounds.play('correct');
        setBurstColor(r.burstColor);
        setBurst((b) => b + 1);
        const next = [...repaired, r.id];
        setRepaired(next);
        if (next.length >= REPAIRS.length) {
            setBanner(null);
            sounds.play('complete');
            setWon(true);
            onComplete({ score: 1, completed: true, artifact: { repaired: next } });
        } else {
            setBanner(r.done);
        }
    };

    const count = repaired.length;

    return (
        <MicroGameScaffold
            title="Tikkun Olam - Reparer verden"
            subtitle="Fire steder i Jerusalem trenger din hjelp. Klikk hvert symbol og utfør din forpliktelse."
            estimatedSeconds={120}
            onRetry={count > 0 || won ? reset : undefined}
            canvas={{
                idle: !won && count === 0,
                camera: { position: [0, 7, 11], fov: 44 },
                background: '#f5e6c8',
                target: [0, 0, 0],
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <SceneBadge corner="br">{won ? 'Verden reparert' : 'Jerusalem'}</SceneBadge>
                    <DataReadout
                        corner="bl"
                        items={[{ label: 'Reparert', value: `${count}/${REPAIRS.length}` }]}
                    />
                </>
            }
            scene={
                <JerusalemScene repaired={repaired} burst={burst} burstColor={burstColor} onRepair={repair} />
            }
        >
            <div className="grid grid-cols-2 gap-2">
                {REPAIRS.map((r) => {
                    const done = repaired.includes(r.id);
                    return (
                        <div
                            key={r.id}
                            className={`rounded-xl border p-2.5 transition-all duration-300 ${
                                done
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-slate-50 border-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-1.5">
                                <span
                                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-500 ${
                                        done ? 'bg-emerald-400' : 'bg-slate-300'
                                    }`}
                                    style={done ? { boxShadow: '0 0 6px #34d399' } : undefined}
                                />
                                <span
                                    className={`text-xs font-medium leading-snug ${
                                        done ? 'text-emerald-700' : 'text-slate-500'
                                    }`}
                                >
                                    {r.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {won && (
                <div className="mt-3">
                    <WinScreen title="Tikkun Olam!" onReplay={reset}>
                        Du reparerte verden - én handling om gangen. Det er kjernen i jødisk etikk:
                        verden ble skapt ufullstendig, og hvert menneske har ansvar for å fullføre
                        den. Mitzvot er ikke bare regler - de er det konkrete uttrykket for pakten
                        mellom Gud og folket.
                    </WinScreen>
                </div>
            )}
        </MicroGameScaffold>
    );
};

export default TikkunOlam3D;

// ============================================================
//  3D-SCENEN
// ============================================================

function JerusalemScene({
    repaired,
    burst,
    burstColor,
    onRepair,
}: {
    repaired: string[];
    burst: number;
    burstColor: string;
    onRepair: (r: RepairInfo) => void;
}) {
    const progress = repaired.length / REPAIRS.length;

    return (
        <group>
            <AmbientLight progress={progress} />
            <directionalLight position={[6, 10, 4]} intensity={1.1} castShadow />

            {/* Bakkeflate - varm sandstein */}
            <GroundPlane size={36} depth={28} color="#c4a56b" />

            {/* Mye bygningsvolum - Jerusalem-inspirert */}
            <Building position={[-1.5, 0, -1]} body="#c8a96e" roof="#8b6914" w={2.2} h={1.6} d={1.8} />
            <Building position={[1.8, 0, -1.5]} body="#b8945a" roof="#7a5c0e" w={1.6} h={2.1} d={1.4} />
            <Building position={[0.2, 0, -4.5]} body="#d4b070" roof="#9a7420" w={3.5} h={1.2} d={2.0} />
            <Building position={[-4.5, 0, -0.5]} body="#c09050" roof="#805010" w={1.4} h={1.4} d={1.2} />
            <Building position={[4.5, 0, -2]} body="#bb8a4e" roof="#7c5c14" w={1.8} h={1.8} d={1.6} />
            <Building position={[-0.5, 0, 1.5]} body="#c4a060" roof="#8c6c18" w={1.2} h={0.9} d={1.0} />

            {/* Figurer i scenen */}
            <Figure position={[-3.8, 0, 2.0]} body={repaired.includes('mat') ? '#92400e' : '#78716c'} />
            <Figure position={[3.2, 0, 2.5]} body="#a8713a" />

            {/* Tre - visner eller blomstrer */}
            <Tree
                position={[-2.8, 0, -2.4]}
                leaf={repaired.includes('tre') ? '#16a34a' : '#94a3b8'}
            />

            {/* Reparasjons-hotspots */}
            {REPAIRS.map((r) => {
                const done = repaired.includes(r.id);
                if (done) return null;
                return (
                    <Hotspot
                        key={r.id}
                        position={[r.position[0], 1.2, r.position[2]]}
                        onSelect={() => onRepair(r)}
                        label={r.label}
                    />
                );
            })}

            <Burst position={[0, 2, 0]} trigger={burst} color={burstColor} count={28} spread={4.5} />
        </group>
    );
}

// Lyset demper seg mykt mot mål basert på progresjon
function AmbientLight({ progress }: { progress: number }) {
    const ref = useRef<THREE.AmbientLight>(null);
    useFrame((_, dt) => {
        if (ref.current) {
            const target = 0.45 + progress * 0.8;
            ref.current.intensity = damp(ref.current.intensity, target, dt, 2);
        }
    });
    return <ambientLight ref={ref} intensity={0.45} color="#ffe9c8" />;
}
