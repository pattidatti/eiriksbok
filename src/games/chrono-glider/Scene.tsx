// @ts-nocheck
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';
import { Glider } from './components/Glider';
import { Tunnel } from './components/Tunnel';
import { Background } from './components/Background';
import { GateManager } from './components/GateManager';
import { useGameStore } from './store';
import { ProjectileManager } from './components/ProjectileManager';
import { ObjectManager } from './components/ObjectManager';
import { Boss } from './components/Boss';
import { EngineExhaust } from './components/EngineExhaust';

export function Scene() {
    const { gameState, speed } = useGameStore();
    const shipRef = useRef<THREE.Group>(null);
    const projectilesRef = useRef<{ id: number, x: number, y: number, z: number, life: number }[]>([]);

    useFrame((state) => {
        // Dynamic FOV based on speed
        const targetFov = gameState === 'playing' ? 60 + (speed - 10) * 2 : 60;
        const cam = state.camera as THREE.PerspectiveCamera;
        if (cam.isPerspectiveCamera) {
            cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov, 0.1);
            cam.updateProjectionMatrix();
        }
    });

    return (
        <>
            <Background />
            <Tunnel />

            {/* The Ship */}
            <Glider ref={shipRef} />
            <EngineExhaust shipRef={shipRef} />
            <ProjectileManager shipRef={shipRef} projectilesRef={projectilesRef} />

            {gameState === 'playing' && (
                <>
                    <GateManager />
                    <ObjectManager projectilesRef={projectilesRef} />
                    <Boss />
                </>
            )}
        </>
    );
}
