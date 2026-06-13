import * as THREE from 'three';
import type { GameEngineRef } from '../../types';
import type { BuildTerrainConfig } from '../types';
import { TerrainSystem } from '../../systems/TerrainSystem';
import { applyLightingPreset } from '../presets';
import { markPhysics } from './_util';

// ─── buildTerrain (Fase 8) ───────────────────────────────────────────────────
// Bygger ett prosedyralt terreng: vertex-farget mesh i scenen + Rapier-heightfield
// (registreres av motoren når fysikken er klar) + height-queries via engine.getTerrainHeight.
//
// Bruk 'terrain'-sentinelen i pos-felt (f.eks. addProp pos: [x, 'terrain', z]) for å
// snappe objekter til bakken. NB: spillerens startPosition.y MÅ ligge over terrenget,
// ellers spawner kapselen inne i bakken.

export function buildTerrain(
    engine: GameEngineRef,
    config: BuildTerrainConfig,
): { terrain: TerrainSystem; mesh: THREE.Mesh } {
    const tier = engine.getQualityTier();
    const terrain = new TerrainSystem(tier);
    const mesh = terrain.build(config);
    mesh.userData.declarativeId = config.id;
    // Terreng-meshen skal IKKE markeres solid: kollisjonen håndteres av heightfield-
    // collideren (billigere enn en trimesh), ikke av addStaticFromScene.
    engine.scene.add(mesh);

    // Koble til motoren: aktiverer getTerrainHeight + heightfield-registrering i initPhysics.
    engine.attachTerrain(terrain);

    // Usynlige kollisjons-vegger langs kartkanten så spilleren ikke går utfor.
    if (config.boundary !== false) {
        const half = config.size / 2;
        const wallH = Math.max(8, terrain.getMaxHeight() + 8) * 2;
        const t = 0.5;
        const edges: { pos: [number, number, number]; size: [number, number, number] }[] = [
            { pos: [0, 0, -half], size: [config.size, wallH, t] }, // nord
            { pos: [0, 0, half], size: [config.size, wallH, t] }, // sør
            { pos: [-half, 0, 0], size: [t, wallH, config.size] }, // vest
            { pos: [half, 0, 0], size: [t, wallH, config.size] }, // øst
        ];
        for (let i = 0; i < edges.length; i++) {
            const e = edges[i];
            const wall = new THREE.Mesh(
                new THREE.BoxGeometry(e.size[0], e.size[1], e.size[2]),
                new THREE.MeshBasicMaterial({ visible: false }),
            );
            wall.position.set(e.pos[0], e.pos[1], e.pos[2]);
            wall.name = `terrain-boundary-${i}`;
            markPhysics(wall, { solid: true, colliderShape: 'cuboid' });
            engine.scene.add(wall);
        }
    }

    applyLightingPreset(engine.scene, config.lights ?? 'outdoor-day');

    return { terrain, mesh };
}
