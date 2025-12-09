import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useGameStore } from '../store';
import * as THREE from 'three';

export function Boss() {
    const { currentEventIndex } = useGameStore();
    const groupRef = useRef<THREE.Group>(null);
    const [hp, setHp] = useState(100);
    const [active, setActive] = useState(false);

    // Trigger boss every 5 events?
    useEffect(() => {
        if (currentEventIndex > 0 && currentEventIndex % 5 === 0) {
            setActive(true);
            setHp(100);
        } else {
            setActive(false);
        }
    }, [currentEventIndex]);

    useFrame((state) => {
        if (!active || !groupRef.current) return;

        // Hover animation
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 1;
        groupRef.current.rotation.y += 0.01;

        // Move towards player slowly? Or static in front?
        // Let's keep it static at z = -20
    });

    if (!active) return null;

    return (
        <group ref={groupRef} position={[0, 2, -30]}>
            {/* Boss Mesh - Big Pyramid */}
            <mesh>
                <coneGeometry args={[3, 5, 4]} />
                <meshStandardMaterial color="#8800ff" emissive="#440088" />
            </mesh>

            {/* Eyes */}
            <mesh position={[-1, 1, 1.5]}>
                <sphereGeometry args={[0.5]} />
                <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
            </mesh>
            <mesh position={[1, 1, 1.5]}>
                <sphereGeometry args={[0.5]} />
                <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
            </mesh>

            <Text position={[0, 4, 0]} fontSize={1} color="red">
                BOSS BATTLE!
            </Text>
        </group>
    );
}
