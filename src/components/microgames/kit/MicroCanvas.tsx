import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerformanceMonitor, ContactShadows } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';

// Standardisert R3F-Canvas for mikrospill. Kapsler lyssetting, skygger, fog,
// bakgrunn og en trygg OrbitControls-preset slik at ALLE mikrospill får samme
// visuelle look (lys, lavpoly, varm sol) uten å gjenta ~40 linjer per spill.
//
// Bevisst likt på tvers av spill: ingen LUT/color grading, samme sol-vinkel og
// hemisfærelys. Bytt heller bakgrunn/fog per scene enn lysrigg.
//
//   <MicroCanvas idle={stage === 0} camera={{ position: [13, 9.5, 13], fov: 38 }}>
//       <MyValley stage={stage} />
//   </MicroCanvas>
//
// Chromebook-vennlig (alle mikrospill arver dette):
//  - Render-loopen FRYSES når spillet er utenfor skjermen (IntersectionObserver).
//    Et spill langt nede i en lang artikkel skal ikke male GPU-en mens eleven
//    leser noe annet. Tilstanden beholdes - vi pauser bare frames.
//  - Konservativt skygge-/DPR-budsjett. PerformanceMonitor hever DPR igjen når
//    maskinen har rom, men vi starter alltid lavt for å unngå startspiken.

export interface MicroCanvasProps {
    children: React.ReactNode;
    // Kamera-startposisjon og fov. Default er en behagelig isometrisk-aktig vinkel.
    camera?: { position?: [number, number, number]; fov?: number };
    // Bakgrunnsfarge (himmel). Settes både som clear color og scene-bakgrunn.
    background?: string;
    // Fog [near, far] i samme farge-familie som bakgrunnen. null = av.
    fog?: { color?: string; near: number; far: number } | null;
    // Roter sakte av seg selv mens eleven ikke har gjort noe (idle-tilstand).
    idle?: boolean;
    autoRotateSpeed?: number;
    // OrbitControls. Som standard: ingen zoom/pan (Chromebook), kun rotasjon
    // innenfor trygge polar-vinkler så man aldri ser under bakken.
    enableZoom?: boolean;
    enablePan?: boolean;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    target?: [number, number, number];
    // Solstyrke og -posisjon kan finjusteres, men har gode defaults.
    sunPosition?: [number, number, number];
    sunIntensity?: number;
    ambientIntensity?: number;
    // Slå av OrbitControls helt (f.eks. hvis spillet styrer kamera selv).
    controls?: boolean;
    // Myk kontaktskygge under scenen - billig dybde/forankring. Sett false for å slå av.
    contactShadows?: boolean;
    // Y-nivå for kontaktskyggen (vanligvis bakkenivå 0).
    shadowY?: number;
}

export const MicroCanvas: React.FC<MicroCanvasProps> = ({
    children,
    camera = { position: [13, 9.5, 13], fov: 38 },
    background = '#bfe0f2',
    fog = { near: 26, far: 50 },
    idle = false,
    autoRotateSpeed = 0.45,
    enableZoom = false,
    enablePan = false,
    minPolarAngle = Math.PI / 7,
    maxPolarAngle = Math.PI / 2.4,
    target = [0, 0.5, 0],
    sunPosition = [10, 16, 8],
    sunIntensity = 1.15,
    ambientIntensity = 0.62,
    controls = true,
    contactShadows = true,
    shadowY = 0,
}) => {
    const fogColor = fog?.color ?? background;
    // Reduserer oppløsning automatisk hvis bildeflyten faller (svake Chromebooks),
    // og hever den igjen når det er rom. Starter på 1 - den billigste - og lar
    // PerformanceMonitor klatre til maks 1.5 først når maskinen viser at den
    // tåler det. (Tidligere [1, 2] ga en startspike som veltet billige maskiner.)
    const [dpr, setDpr] = useState<number | [number, number]>(1);
    // Respekter prefers-reduced-motion: ingen auto-rotasjon for de som ber om ro.
    const reduce = useReducedMotion();

    // Frys render-loopen når spillet er utenfor skjermen. Alle mikrospill bruker
    // useFrame (kontinuerlig animasjon), så uten dette maler hvert mountet spill
    // GPU-en i 60 fps for alltid - også scrollet ut av syne. Det er den største
    // enkeltårsaken til at viftefrie Chromebooker struper og krasjer fanen.
    const wrapRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(true);
    useEffect(() => {
        const el = wrapRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;
        const io = new IntersectionObserver(
            ([entry]) => setActive(entry.isIntersecting),
            // Litt margin så loopen er varm idet vinduet rulles inn i syne.
            { rootMargin: '200px 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
            <Canvas
                camera={{ position: camera.position ?? [13, 9.5, 13], fov: camera.fov ?? 38 }}
                gl={{ antialias: true }}
                dpr={dpr}
                // 'always' mens synlig, 'never' fryser loopen uten å rive ned
                // konteksten - tilstand og siste frame beholdes.
                frameloop={active ? 'always' : 'never'}
                shadows
            >
                <PerformanceMonitor
                    onDecline={() => setDpr(1)}
                    onIncline={() => setDpr([1, 1.5])}
                    flipflops={3}
                    onFallback={() => setDpr(1)}
                />
                <color attach="background" args={[background]} />
                {fog && <fog attach="fog" args={[fogColor, fog.near, fog.far]} />}

                <ambientLight intensity={ambientIntensity} />
                <hemisphereLight args={['#fff3d6', '#5a7045', 0.4]} />
                <directionalLight
                    position={sunPosition}
                    intensity={sunIntensity}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                    shadow-camera-left={-20}
                    shadow-camera-right={20}
                    shadow-camera-top={20}
                    shadow-camera-bottom={-20}
                />

                {children}

                {contactShadows && (
                    <ContactShadows
                        position={[0, shadowY + 0.01, 0]}
                        opacity={0.38}
                        scale={42}
                        blur={2.4}
                        far={14}
                        resolution={512}
                        color="#1e293b"
                    />
                )}

                {controls && (
                    <OrbitControls
                        makeDefault
                        enableZoom={enableZoom}
                        enablePan={enablePan}
                        minPolarAngle={minPolarAngle}
                        maxPolarAngle={maxPolarAngle}
                        autoRotate={idle && !reduce}
                        autoRotateSpeed={autoRotateSpeed}
                        target={target}
                    />
                )}
            </Canvas>
        </div>
    );
};
