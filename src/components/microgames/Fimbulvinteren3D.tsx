import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    MicroGameScaffold,
    Hotspot,
    SceneSlider,
    SceneQuiz,
    StepTracker,
    Particles,
    Burst,
    Building,
    Tree,
    Person,
    Hill,
    GroundPlane,
    InstancedField,
    SceneBanner,
    SceneBadge,
    DataReadout,
    WinScreen,
    SceneFact,
    useShake,
    useStage,
    damp,
} from './kit';
import { useStepSounds } from '../../hooks/useStepSounds';
import type { MicroGameProps } from './types';

// 536 - Fimbulvinteren. Et stage-drevet scenespill om klimakatastrofen i 536.
// Eleven utloser et vulkanutbrudd, drar et stovsky-slor over himmelen og ser
// hele verdenen reagere: solen dovner, himmelen graner, avlingene visner og det
// snor om sommeren. Lyspaera: det var ikke solen som dode - et slor av vulkanstov
// stengte sollyset ute i flere ar, og kulda kan ha tatt halve Norges befolkning.
//
// Mekanikken ER pedagogikken: hver lenke i arsakskjeden er noe eleven gjor og ser.
// Scenen leser bare `stage` og `veil` og demper alt mykt mot mal utledet av dem.

// Modul-niva farger (gjenbrukt scratch unngar allokering hver frame).
const C_SKY = new THREE.Color('#9fc6e6');
const C_SKY_DARK = new THREE.Color('#585240');
const C_SUN = new THREE.Color('#fff0b0');
const C_SUN_DULL = new THREE.Color('#b7b0a0');
const C_CROP = new THREE.Color('#6f9a3e');
const C_CROP_DEAD = new THREE.Color('#90835e');
const C_GROUND = new THREE.Color('#7aa84f');
const C_GROUND_DEAD = new THREE.Color('#8c8160');
const _scratch = new THREE.Color();

interface SceneProps {
    stage: number;
    veil: number; // 0-100 fra slideren
    erupted: boolean;
    onErupt: () => void;
    onInspectField: () => void;
}

function Scene536({ stage, veil, erupted, onErupt, onInspectField }: SceneProps) {
    const { ref: shakeRef, shake } = useShake();
    const sounds = useStepSounds();

    const skyMat = useRef<THREE.MeshBasicMaterial>(null);
    const veilMat = useRef<THREE.MeshBasicMaterial>(null);
    const sunMat = useRef<THREE.MeshStandardMaterial>(null);
    const sunHalo = useRef<THREE.MeshBasicMaterial>(null);
    const sunGroup = useRef<THREE.Group>(null);
    const cropMat = useRef<THREE.MeshStandardMaterial>(null);
    const groundMat = useRef<THREE.MeshStandardMaterial>(null);
    const witherCur = useRef(0);

    useFrame((_, dt) => {
        const veilT = Math.min(1, veil / 100);
        const k = Math.min(1, dt * 3);

        if (skyMat.current) {
            _scratch.copy(C_SKY).lerp(C_SKY_DARK, veilT);
            skyMat.current.color.lerp(_scratch, k);
        }
        if (veilMat.current) {
            veilMat.current.opacity = damp(veilMat.current.opacity, veilT * 0.55, dt, 3);
        }
        if (sunMat.current) {
            sunMat.current.emissiveIntensity = damp(
                sunMat.current.emissiveIntensity,
                2.2 - veilT * 1.9,
                dt,
                3
            );
            _scratch.copy(C_SUN).lerp(C_SUN_DULL, veilT);
            sunMat.current.color.lerp(_scratch, k);
            sunMat.current.emissive.lerp(_scratch, k);
        }
        if (sunHalo.current) {
            sunHalo.current.opacity = damp(sunHalo.current.opacity, 0.5 * (1 - veilT * 0.92), dt, 3);
        }
        if (sunGroup.current) {
            const s = damp(sunGroup.current.scale.x, 1 - veilT * 0.22, dt, 3);
            sunGroup.current.scale.setScalar(s);
        }

        // Avlingene visner forst nar stage naar 2 (etter at sloret er fullt).
        witherCur.current = damp(witherCur.current, stage >= 2 ? 1 : 0, dt, 1.1);
        if (cropMat.current) {
            _scratch.copy(C_CROP).lerp(C_CROP_DEAD, witherCur.current);
            cropMat.current.color.lerp(_scratch, k);
        }
        if (groundMat.current) {
            _scratch.copy(C_GROUND).lerp(C_GROUND_DEAD, witherCur.current);
            groundMat.current.color.lerp(_scratch, k);
        }
    });

    return (
        <group ref={shakeRef}>
            {/* Himmelkuppel - graner nar sloret tykner */}
            <mesh>
                <sphereGeometry args={[62, 24, 16]} />
                <meshBasicMaterial ref={skyMat} color="#9fc6e6" side={THREE.BackSide} fog={false} />
            </mesh>
            {/* Stov-slor: mork halvgjennomsiktig kuppel som demper alt */}
            <mesh>
                <sphereGeometry args={[56, 24, 16]} />
                <meshBasicMaterial
                    ref={veilMat}
                    color="#4a4332"
                    side={THREE.BackSide}
                    transparent
                    opacity={0}
                    depthWrite={false}
                    fog={false}
                />
            </mesh>

            {/* Solen - dovner og krymper bak sloret */}
            <group ref={sunGroup} position={[-10, 13, -22]}>
                <mesh>
                    <sphereGeometry args={[1.7, 20, 20]} />
                    <meshStandardMaterial
                        ref={sunMat}
                        color="#fff0b0"
                        emissive="#fff0b0"
                        emissiveIntensity={2.2}
                        toneMapped={false}
                    />
                </mesh>
                <mesh>
                    <sphereGeometry args={[3.4, 20, 20]} />
                    <meshBasicMaterial
                        ref={sunHalo}
                        color="#ffe9a8"
                        transparent
                        opacity={0.5}
                        side={THREE.BackSide}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            </group>

            {/* Bakken og garden */}
            <GroundPlane size={70} depth={60} color="#7aa84f" />
            {/* Egen bakkeflate vi kan farge (visner) oppa standardbakken */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 4]} receiveShadow>
                <planeGeometry args={[40, 26]} />
                <meshStandardMaterial ref={groundMat} color="#7aa84f" roughness={1} />
            </mesh>

            <Building position={[-7, 0, -1]} body="#7c5a3a" roof="#3f2a1c" w={3.2} h={1.6} d={2.2} />
            <Tree position={[-11, 0, 2]} leaf="#3f6b39" seed={3} />
            <Tree position={[7.5, 0, 3]} leaf="#42703b" seed={9} />
            <Person position={[3.5, 0, 4.5]} pose={stage >= 2 ? 'sit' : 'idle'} body="#5a4632" hat="hood" />

            {/* Kornakeren - InstancedField med delt materiale vi farger */}
            <InstancedField
                count={70}
                area={[22, 12]}
                center={[0, 0, 4]}
                y={0.45}
                minScale={0.7}
                maxScale={1.15}
                seed={42}
                geometry={<coneGeometry args={[0.16, 0.9, 5]} />}
                material={<meshStandardMaterial ref={cropMat} color="#6f9a3e" roughness={1} />}
            />

            {/* Vulkanen i det fjerne */}
            <group position={[12, 0, -24]}>
                <Hill radius={5} height={6.5} color="#5a4a44" seed={5} />
                <mesh position={[0, 6.2, 0]}>
                    <sphereGeometry args={[0.9, 12, 12]} />
                    <meshStandardMaterial
                        color={erupted ? '#ff7a18' : '#6b554c'}
                        emissive={erupted ? '#ff4500' : '#000000'}
                        emissiveIntensity={erupted ? 1.6 : 0}
                        toneMapped={false}
                    />
                </mesh>
                {erupted && (
                    <>
                        <Particles
                            preset="embers"
                            center={[0, 7, 0]}
                            area={[2.5, 2.5]}
                            height={9}
                            count={26}
                        />
                        <Particles
                            preset="dust"
                            center={[0, 9, 0]}
                            area={[6, 6]}
                            height={8}
                            count={30}
                        />
                    </>
                )}
                <Burst position={[0, 7, 0]} trigger={erupted ? 1 : 0} color="#ff8a3c" count={30} />
            </group>

            {/* Sno om sommeren nar krisa har slatt inn */}
            {stage >= 2 && <Particles preset="snow" area={[26, 22]} height={16} count={80} />}

            {/* Steg 0: klikk vulkanen for a utlose utbruddet */}
            {stage === 0 && (
                <Hotspot
                    position={[12, 8.5, -24]}
                    onSelect={() => {
                        shake(0.7);
                        sounds.play('correct');
                        onErupt();
                    }}
                    label="Utlos utbruddet"
                    radius={0.9}
                />
            )}

            {/* Steg 2: klikk den visne akeren */}
            {stage === 2 && (
                <Hotspot
                    position={[0, 1.6, 5]}
                    onSelect={() => {
                        sounds.play('advance');
                        onInspectField();
                    }}
                    label="Se pa akeren"
                    radius={0.9}
                />
            )}
        </group>
    );
}

export default function Fimbulvinteren3D({ onComplete, onRetry }: MicroGameProps) {
    const { stage, goTo, reset: resetStage } = useStage(3);
    const [veil, setVeil] = useState(0);
    const [erupted, setErupted] = useState(false);
    const [won, setWon] = useState(false);
    const sounds = useStepSounds();

    const veilT = Math.min(1, veil / 100);
    const sollys = Math.round(100 - veilT * 82);
    const tempFall = (veilT * 2.5).toFixed(1);

    const reset = () => {
        resetStage();
        setVeil(0);
        setErupted(false);
        setWon(false);
        onRetry?.();
    };

    const handleVeil = (v: number) => {
        setVeil(v);
        // Nar sloret er nesten fullt, slar krisa inn: ga til steg 2 (avlingene).
        if (v >= 95 && stage === 1) {
            setVeil(100);
            goTo(2);
            sounds.play('sceneChange');
        }
    };

    const banner =
        won
            ? null
            : stage === 0
              ? 'Et vulkanutbrudd er pa vei. Trykk pa vulkanen.'
              : stage === 1
                ? 'Dra spaken og se stovskyen legge seg over himmelen.'
                : stage === 2
                  ? 'Avlingene visner og det snor om sommeren. Klikk pa akeren.'
                  : 'Hva trodde folk i Norden at de opplevde?';

    return (
        <MicroGameScaffold
            title="536 - Fimbulvinteren"
            subtitle="Aret da solen forsvant"
            estimatedSeconds={140}
            onRetry={reset}
            scene={
                <Scene536
                    stage={stage}
                    veil={veil}
                    erupted={erupted}
                    onErupt={() => {
                        setErupted(true);
                        goTo(1);
                    }}
                    onInspectField={() => goTo(3)}
                />
            }
            canvas={{
                idle: stage === 0 && !erupted,
                camera: { position: [0, 6, 17], fov: 44 },
                target: [0, 2, -3],
                background: '#9fc6e6',
                light: 'day',
            }}
            overlays={
                <>
                    <SceneBanner message={banner} wide />
                    <DataReadout
                        corner="bl"
                        items={[
                            { label: 'Sollys', value: sollys, unit: '%' },
                            { label: 'Temperatur', value: `-${tempFall}`, unit: '°C' },
                        ]}
                    />
                    <SceneBadge corner="br">536 e.Kr.</SceneBadge>
                </>
            }
        >
            <div className="space-y-3">
                <StepTracker current={won ? 3 : stage} total={3} />

                {stage === 0 && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Et eller flere voldsomme vulkanutbrudd slynget enorme mengder aske hoyt opp i
                        atmosfaeren. Trykk pa vulkanen i bildet for a sette katastrofen i gang.
                    </p>
                )}

                {stage === 1 && (
                    <SceneSlider
                        label="Stovskyen brer seg (535 til 540)"
                        min={0}
                        max={100}
                        value={veil}
                        onChange={handleVeil}
                        valueLabel={(v) => `${Math.round(v)} %`}
                    />
                )}

                {stage === 2 && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Sollyset ble svekket i over et ar. Uten varme modnet ikke kornet, og det kom
                        sno midt pa sommeren. Klikk pa akeren i bildet for a se naermere.
                    </p>
                )}

                {stage === 3 && !won && (
                    <SceneQuiz
                        question="Hva trodde folk i Norden at de opplevde?"
                        options={[
                            'Fimbulvinteren - varselet om Ragnarok',
                            'En vanlig kald vinter',
                            'En solformorkelse som snart gikk over',
                        ]}
                        answerIndex={0}
                        explanation="I norron tro var Fimbulvinteren tre vintre uten sommer imellom - et tegn pa at verdens ende naermet seg. Forskere mener minnet om de harde arene etter 536 kan ha farget akkurat denne myten."
                        onResult={(correct) => {
                            if (correct && !won) {
                                setWon(true);
                                sounds.play('complete');
                                onComplete({ score: 1, completed: true });
                            } else if (!correct) {
                                sounds.play('incorrect');
                            }
                        }}
                    />
                )}

                {won && (
                    <>
                        <WinScreen title="Du fulgte hele arsakskjeden." onReplay={reset}>
                            Det var ikke solen som dode. Et slor av vulkanstov stengte sollyset ute i
                            flere ar. Kulda drepte avlingene, og kanskje halve Norges befolkning. Folk
                            kalte de morke arene Fimbulvinteren.
                        </WinScreen>
                        <SceneFact>
                            Sommeren 536 var en av de kaldeste pa 1500 ar. Arringer i traer fra Irland
                            til Chile viser at krisa var global, og i Skandinavia ble hele garder
                            forlatt.
                        </SceneFact>
                    </>
                )}
            </div>
        </MicroGameScaffold>
    );
}
