import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Glider } from './components/Glider';
import { Tunnel } from './components/Tunnel';
import { Background } from './components/Background';
import { GateManager } from './components/GateManager';
import { useGameStore } from './store';
import { ProjectileManager } from './components/ProjectileManager';
import { ObjectManager } from './components/ObjectManager';
import { Boss } from './components/Boss';

export function Scene() {
    const { gameState, speed } = useGameStore();

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
            <Glider />
            <ProjectileManager />
            {gameState === 'playing' && (
                <>
                    <GateManager />
                    <ObjectManager />
                    <Boss />
                </>
            )}
        </>
    );
}
