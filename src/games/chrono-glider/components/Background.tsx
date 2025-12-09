import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';

export function Background() {
    const starsRef = useRef<any>();
    const { speed, gameState } = useGameStore();

    useFrame((state, delta) => {
        if (starsRef.current) {
            // Rotate stars to simulate movement/roll
            starsRef.current.rotation.z += delta * 0.05;

            // Move stars backwards to simulate forward motion
            // Since Stars component is infinite, simple rotation is often enough, 
            // but let's try to oscillate or move them to feel like a tunnel.
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

            {/* Fog for depth perception - color matches the slate-900 bg (approx) */}
            <fog attach="fog" args={['#0f172a', 5, 80]} />

            {/* Ambient light for base visibility */}
            <ambientLight intensity={0.4} />

            {/* Directional light from "sun" or forward */}
            <directionalLight position={[0, 10, 5]} intensity={1} />
        </group>
    );
}
