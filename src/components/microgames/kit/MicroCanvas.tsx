import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

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
}) => {
    const fogColor = fog?.color ?? background;
    return (
        <Canvas
            camera={{ position: camera.position ?? [13, 9.5, 13], fov: camera.fov ?? 38 }}
            gl={{ antialias: true }}
            dpr={[1, 2]}
            shadows
        >
            <color attach="background" args={[background]} />
            {fog && <fog attach="fog" args={[fogColor, fog.near, fog.far]} />}

            <ambientLight intensity={ambientIntensity} />
            <hemisphereLight args={['#fff3d6', '#5a7045', 0.4]} />
            <directionalLight
                position={sunPosition}
                intensity={sunIntensity}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />

            {children}

            {controls && (
                <OrbitControls
                    makeDefault
                    enableZoom={enableZoom}
                    enablePan={enablePan}
                    minPolarAngle={minPolarAngle}
                    maxPolarAngle={maxPolarAngle}
                    autoRotate={idle}
                    autoRotateSpeed={autoRotateSpeed}
                    target={target}
                />
            )}
        </Canvas>
    );
};
