// @ts-nocheck
import { forwardRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import * as THREE from 'three';

export const Glider = forwardRef<THREE.Group>((_, ref) => {
    // We assume ref is provided by parent (Scene)
    // If not, we could user internal ref, but Scene needs access.

    // Cast ref to mutable type for internal use if needed, but we just pass it to <group>
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

        // @ts-ignore
        if (ref && ref.current) {
            const targetX = state.mouse.x * 10;
            const targetY = state.mouse.y * 6;

            // @ts-ignore
            ref.current.position.x += (targetX - ref.current.position.x) * 0.1;
            // @ts-ignore
            ref.current.position.y += (targetY - ref.current.position.y) * 0.1;

            // @ts-ignore
            const tiltX = (targetX - ref.current.position.x) * 0.5;
            // @ts-ignore
            const tiltY = (targetY - ref.current.position.y) * 0.2;

            // @ts-ignore
            ref.current.rotation.z = -tiltX;
            // @ts-ignore
            ref.current.rotation.x = tiltY;
        }
    });

    return (
        <group ref={ref}>
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
            {/* Wings/Details could be added here */}
            <mesh position={[0, 0, 0.5]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.2, 0.2, 0.5]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    );
});
