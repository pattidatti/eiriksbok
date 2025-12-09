// @ts-nocheck
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';

function MovingGrid() {
    const gridRef = useRef<any>(null);
    const { speed, gameState } = useGameStore();

    useFrame((_, delta) => {
        if (gameState === 'menu') {
            if (gridRef.current) gridRef.current.position.z += 5 * delta;
        } else if (gameState === 'playing') {
            if (gridRef.current) gridRef.current.position.z += speed * delta;
        }

        // Reset position to loop infinitely
        if (gridRef.current && gridRef.current.position.z > 10) {
            gridRef.current.position.z -= 20;
        }
    });

    return (
        <gridHelper
            ref={gridRef}
            args={[100, 50, 0x4f46e5, 0x000000]} // Changed color to indigo/black for cooler look
            position={[0, -5, -40]}
            rotation={[0, 0, 0]}
        />
    );
}

export function Tunnel() {
    return (
        <group>
            {/* Floor Grid */}
            <MovingGrid />

            {/* Ceiling Grid (Mirrored) */}
            <group position={[0, 10, 0]}>
                <MovingGrid />
            </group>
        </group>
    );
}
