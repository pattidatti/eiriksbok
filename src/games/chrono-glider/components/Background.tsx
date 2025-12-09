// @ts-nocheck
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useGameStore, LEVEL_PALETTES } from '../store';
import * as THREE from 'three';

export function Background() {
    const starsRef = useRef<any>(null);
    const { level } = useGameStore();

    const palette = LEVEL_PALETTES[(level - 1) % LEVEL_PALETTES.length];

    useFrame((_, delta) => {
        if (starsRef.current) {
            starsRef.current.rotation.z += delta * 0.05;
            starsRef.current.rotation.x += delta * 0.02;
        }
    });

    return (
        <group>
            {/* Deep space stars */}
            <Stars
                ref={starsRef}
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />

            {/* Fog for depth perception - Dynamic color based on level */}
            {/* We can use <fog color={...} /> but React Three Fiber 'attach="fog"' ensures it attaches to scene.fog */}
            {/* To animate color, we might need a ref to fog or just let React handle re-render update which is fine for level transitions */}
            <fog attach="fog" args={[palette.fog, 5, 80]} />

            {/* Ambient light for base visibility */}
            <ambientLight intensity={0.4} />

            {/* Directional light from "sun" or forward */}
            <directionalLight position={[0, 10, 5]} intensity={1} color={palette.accent} />
        </group>
    );
}
