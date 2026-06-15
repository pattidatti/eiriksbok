import * as THREE from 'three';
import type { GameEngineRef, MovingPlatformOptions } from '../../types';
import type { BuildResult } from '../types';
import { applyShadows } from './_util';

export interface AddMovingPlatformConfig {
    id: string;
    size: [number, number, number];  // boks-dimensjoner (sentrert geometri)
    from: [number, number, number];   // verdensposisjon A
    to: [number, number, number];     // verdensposisjon B
    period: number;                    // sekunder for full A→B→A-syklus
    easing?: 'linear' | 'sine';        // default 'sine'
    phase?: number;                    // 0..1 start-offset
    color?: number;                    // overflatefarge (default lys stein)
}

/**
 * Legg til en bevegelig plattform (heis/lift) som bærer spilleren mens hen går og
 * hopper på den. Plattform-meshen ligger i en gruppe ved origo; MovingPlatformSystem
 * driver mesh.position (= verdenskoordinat) hver frame, og GameEngine sørger for at
 * spilleren følger med (carry). Bruk sentrert boks-geometri.
 */
export function addMovingPlatform(
    engine: GameEngineRef,
    config: AddMovingPlatformConfig
): BuildResult {
    const [w, h, d] = config.size;
    const mat = new THREE.MeshStandardMaterial({
        color: config.color ?? 0x9c8a68,
        roughness: 0.85,
        metalness: 0.05,
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(config.from[0], config.from[1], config.from[2]);
    applyShadows(mesh, true, true);

    // Gruppe ved origo så mesh.position er verdenskoordinat (systemet driver mesh.position).
    const group = new THREE.Group();
    group.add(mesh);
    group.userData.declarativeId = config.id;
    engine.scene.add(group);

    const opts: MovingPlatformOptions = {
        from: config.from,
        to: config.to,
        period: config.period,
        easing: config.easing,
        phase: config.phase,
    };
    engine.addMovingPlatform(mesh, opts);

    return { group, primary: mesh };
}
