import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Outlines } from '@react-three/drei';
import * as THREE from 'three';
import { toonGradientMap } from './toonGradient';

// Signaturlook-komponenter: et tegneserieaktig toon-materiale og en kant. Begge
// valgfrie - bruk dem for den polerte, sammenhengende Eiriksbok-looken. GPU-billig
// og trygt på svake Chromebooks.

// Drop-in toon-materiale: <mesh><boxGeometry/><ToonMaterial color="#a8412f" /></mesh>
// Gir flat, koselig lavpoly-look som binder alle spill sammen visuelt.
export function ToonMaterial({
    color,
    ...rest
}: { color: string } & React.ComponentProps<'meshToonMaterial'>) {
    const gradientMap = useMemo(() => toonGradientMap(), []);
    return <meshToonMaterial color={color} gradientMap={gradientMap} {...rest} />;
}

// Tegneserie-kant rundt et mesh. Legg som siste barn i et <mesh>:
//   <mesh>...<KitOutline /></mesh>
// Bra for å fremheve valgte/klikkbare objekter (juicy og leselig).
export function KitOutline({
    thickness = 0.025,
    color = '#1f2937',
}: {
    thickness?: number;
    color?: string;
}) {
    return <Outlines thickness={thickness} color={color} />;
}

// Drop-in glødende materiale: emissivt og toneMapped={false} så det "lyser" over
// resten. Bra for ild, lamper, varsellys, magi, display.
//   <mesh><sphereGeometry/><GlowMaterial color="#ffb000" /></mesh>
export function GlowMaterial({
    color,
    intensity = 1.6,
    ...rest
}: { color: string; intensity?: number } & React.ComponentProps<'meshStandardMaterial'>) {
    return (
        <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={intensity}
            toneMapped={false}
            {...rest}
        />
    );
}

// Mykt additivt glød-skall rundt et objekt (halo uten PointLight). Promoterer
// det hand-rullede atmosfære-glød-mønsteret fra build-guiden. Legg som søsken,
// sentrert på objektet:
//   <group position={...}><Lampe /><GlowHalo color="#ffcc66" size={1.4} /></group>
export function GlowHalo({
    color,
    size = 1.4,
    opacity = 0.5,
    segments = 16,
}: {
    color: string;
    size?: number;
    opacity?: number;
    segments?: number;
}) {
    return (
        <mesh>
            <sphereGeometry args={[size, segments, segments]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    );
}

// Vann med EKTE vertex-bølger (animert via onBeforeCompile), ikke bare emissiv
// puls som WaterPlane. Bruk på et segmentert plan så det er vertekser å forskyve:
//   <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.02,0]}>
//       <planeGeometry args={[16, 30, 40, 40]} />
//       <WaterMaterial color="#3d7fa6" />
//   </mesh>
export function WaterMaterial({
    color = '#3d7fa6',
    waveHeight = 0.12,
    waveScale = 0.6,
    speed = 1,
    ...rest
}: {
    color?: string;
    waveHeight?: number;
    waveScale?: number;
    speed?: number;
} & React.ComponentProps<'meshStandardMaterial'>) {
    // Uniforms holdes i en ref så useFrame kan animere dem uten re-render.
    const uniforms = useRef({
        uTime: { value: 0 },
        uWaveHeight: { value: waveHeight },
        uWaveScale: { value: waveScale },
    });

    useFrame((_, dt) => {
        // Hold uniforms i sync med props (utenfor render) og driv tiden.
        uniforms.current.uWaveHeight.value = waveHeight;
        uniforms.current.uWaveScale.value = waveScale;
        uniforms.current.uTime.value += dt * speed;
    });

    return (
        <meshStandardMaterial
            color={color}
            roughness={0.3}
            metalness={0.15}
            emissive="#1e4d6b"
            emissiveIntensity={0.14}
            onBeforeCompile={(shader) => {
                shader.uniforms.uTime = uniforms.current.uTime;
                shader.uniforms.uWaveHeight = uniforms.current.uWaveHeight;
                shader.uniforms.uWaveScale = uniforms.current.uWaveScale;
                shader.vertexShader =
                    'uniform float uTime;\nuniform float uWaveHeight;\nuniform float uWaveScale;\n' +
                    shader.vertexShader.replace(
                        '#include <begin_vertex>',
                        `#include <begin_vertex>
                         float wv = sin(position.x * uWaveScale + uTime)
                                  * cos(position.y * uWaveScale * 0.8 + uTime * 1.3);
                         transformed.z += wv * uWaveHeight;`
                    );
            }}
            {...rest}
        />
    );
}
