import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color } from 'three';
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
            args={[100, 50, 0xffffff, 0x222222]}
            position={[0, -5, -40]}
            rotation={[0, 0, 0]}
        />
    );
}

function StarField() {
    // Simple particles moving past
    const starsRef = useRef<any>(null);
    const { speed, gameState } = useGameStore();

    useFrame((_, delta) => {
        if (!starsRef.current) return;
        const s = gameState === 'playing' ? speed : 2;
        starsRef.current.rotation.z += 0.05 * delta;
        starsRef.current.position.z += s * 2 * delta;
        if (starsRef.current.position.z > 20) {
            starsRef.current.position.z -= 100;
        }
    });

    return (
        <points ref={starsRef} position={[0, 0, -80]}>
            <sphereGeometry args={[40, 64, 64]} />
            <pointsMaterial color="#ffffff" size={0.2} transparent opacity={0.6} />
        </points>
    )

}

export function Tunnel() {
    return (
        <group>
            <color attach="background" args={['#0a0a2a']} />
            <fog attach="fog" args={['#0a0a2a', 5, 60]} />

            {/* Floor Grid */}
            <MovingGrid />

            {/* Ceiling Grid (Mirrored) */}
            <group position={[0, 10, 0]}>
                <MovingGrid />
            </group>

            <StarField />

            {/* Ambient Light */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
        </group>
    );
}
