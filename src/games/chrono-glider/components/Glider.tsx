// @ts-nocheck
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import { useGameStore } from '../store'; // Correct path

export function Glider() {
    const meshRef = useRef<any>(null);
    const { gameState, setBoosting, fireProjectile, isBoosting } = useGameStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing') return;
            if (e.code === 'KeyW') setBoosting(true);
            if (e.code === 'Space') fireProjectile();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'KeyW') setBoosting(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState, setBoosting, fireProjectile]);

    useFrame((state) => {
        if (gameState !== 'playing') return;

        if (meshRef.current) {
            const targetX = state.mouse.x * 10;
            const targetY = state.mouse.y * 6;

            meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.1;
            meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;

            const tiltX = (targetX - meshRef.current.position.x) * 0.5;
            const tiltY = (targetY - meshRef.current.position.y) * 0.2;

            meshRef.current.rotation.z = -tiltX;
            meshRef.current.rotation.x = tiltY;
        }
    });

    return (
        <group ref={meshRef}>
            <Trail
                width={isBoosting ? 2.5 : 1.5}
                length={isBoosting ? 12 : 8}
                color={isBoosting ? '#ffaa00' : '#00ffff'}
                decay={isBoosting ? 4 : 3}
                local={false}
                stride={0}
                interval={1}
            >
                {/* Visual Representation of the Glider - A sleek paper plane shape */}
                {/* Body */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.5, 2, 4]} />
                    <meshStandardMaterial
                        color={isBoosting ? "#ffaa00" : "#00d8ff"}
                        emissive={isBoosting ? "#ff4400" : "#004466"}
                        emissiveIntensity={isBoosting ? 2 : 1}
                        roughness={0.4}
                        metalness={0.8}
                    />
                </mesh>
            </Trail>
        </group>
    );
}
