// @ts-nocheck
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';

export function Glider() {
    const meshRef = useRef<any>(null);
    const { gameState } = useGameStore();

    useFrame((state) => {
        if (gameState !== 'playing') return;

        // Smoothly interpolate position to mouse position
        // Mouse x and y are normalized (-1 to 1). We map this to our game play area (e.g., -5 to 5)
        // We add a slight offset effectively "dragging" the glider

        if (meshRef.current) {
            const targetX = state.mouse.x * 10; // Wider range
            const targetY = state.mouse.y * 6;  // Height range

            // Lerp for smooth movement
            meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.1;
            meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;

            // Banking effect (rotation) based on movement
            const tiltX = (targetX - meshRef.current.position.x) * 0.5; // Roll
            const tiltY = (targetY - meshRef.current.position.y) * 0.2; // Pitch

            meshRef.current.rotation.z = -tiltX;
            meshRef.current.rotation.x = tiltY;
        }
    });

    return (
        <group ref={meshRef}>
            {/* Visual Representation of the Glider - A sleek paper plane shape */}
            {/* Body */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.5, 2, 4]} />
                <meshStandardMaterial color="#00d8ff" emissive="#004466" roughness={0.4} metalness={0.8} />
            </mesh>
            {/* Wings/Trails could be added here */}
        </group>
    );
}
