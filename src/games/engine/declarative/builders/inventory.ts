import * as THREE from 'three';
import type { GameEngineRef } from '../../types';
import type { AddPickupConfig, AddPuzzleSlotConfig, BuildResult, AudioPresetName } from '../types';
import { createModel, isValidModelPreset, getAudioUrl } from '../presets';
import { applyShadows, applyTransform, markPhysics, resolveY } from './_util';

function buildModelMesh(model: AddPickupConfig['model']) {
    if (typeof model === 'string') {
        if (!isValidModelPreset(model)) {
            throw new Error(`[addPickup] Ukjent model-preset: '${model}'.`);
        }
        return createModel(model);
    }
    // Custom primitive - delegate to simpler path
    const group = new THREE.Group();
    let geom: THREE.BufferGeometry;
    if (model.primitive === 'box') {
        geom = new THREE.BoxGeometry(...(model.size as [number, number, number]));
    } else if (model.primitive === 'cylinder') {
        const [r, h] = model.size as [number, number];
        geom = new THREE.CylinderGeometry(r, r, h, 16);
    } else {
        const r = (model.size as number[])[0];
        geom = new THREE.SphereGeometry(r, 16, 16);
    }
    const mesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: model.color ?? 0xaaaaaa }));
    group.add(mesh);
    return { group, primary: mesh, suggestedColliderShape: 'cuboid' as const, halfExtents: [0.2, 0.2, 0.2] as [number, number, number], defaultMaterial: 'wood' as const };
}

function playAudioPreset(engine: GameEngineRef, preset: AudioPresetName | undefined): void {
    if (!preset) return;
    const url = getAudioUrl(preset);
    if (!url) return; // stille fallback hvis preset ikke har registrert fil
    engine.playOneShot(url, { volume: 0.7 });
}

/**
 * Legg til en gjenstand spilleren kan plukke opp. Itemet legges direkte i inventaret
 * (ingen hold-i-hånda). Validerer at itemId finnes i GameConfig.items - throw ved ukjent.
 */
export function addPickup(
    engine: GameEngineRef,
    config: AddPickupConfig
): BuildResult {
    // Valider itemId mot config.items
    const itemDef = engine.config.items?.find((i) => i.id === config.itemId);
    if (!itemDef) {
        throw new Error(
            `[addPickup] itemId '${config.itemId}' er ikke definert i GameConfig.items. ` +
            `Legg til en ItemDef for '${config.itemId}' i config.items før addPickup kalles.`
        );
    }

    const result = buildModelMesh(config.model);
    applyTransform(result.group, resolveY(engine, config.pos), config.rot);
    applyShadows(result.group, true, true);

    // Pickup-meshes er dynamic så PhysicsWorld gir dem en body (så de kan plukkes opp).
    markPhysics(result.primary as THREE.Mesh, {
        solid: true,
        dynamic: true,
        colliderShape: 'cuboid',
        mass: 0.3,
    });

    result.group.userData.declarativeId = config.id;
    engine.scene.add(result.group);

    engine.registerPickup(result.primary as THREE.Mesh, {
        label: config.label ?? `Plukk opp ${itemDef.name} (E)`,
        toInventory: { itemId: config.itemId, count: config.count ?? 1 },
        onPickup: () => {
            playAudioPreset(engine, config.audioOnPickup ?? 'pickup-tool');
            config.onPickup?.();
        },
    });

    return result;
}

/**
 * Legg til en puzzle-slot: et sted der spilleren kan plassere gjenstander fra inventaret.
 * Når spilleren trykker E i nærheten og har et akseptert item, blir itemet fjernet fra
 * inventaret og onPlaced kalles.
 */
export function addPuzzleSlot(
    engine: GameEngineRef,
    config: AddPuzzleSlotConfig
): BuildResult {
    // Validér accepts mot config.items
    for (const itemId of config.accepts) {
        const def = engine.config.items?.find((i) => i.id === itemId);
        if (!def) {
            throw new Error(
                `[addPuzzleSlot] itemId '${itemId}' i accepts[] er ikke definert i GameConfig.items.`
            );
        }
    }

    const group = new THREE.Group();
    // Visuell hint
    let marker: THREE.Mesh | null = null;
    if (config.visualHint !== 'none') {
        if (config.visualHint === 'outline') {
            marker = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.04, 0.4),
                new THREE.MeshBasicMaterial({ color: 0xffd45a, transparent: true, opacity: 0.35 })
            );
            marker.position.y = 0.02;
        } else {
            // 'marker' default: gul pil peker ned
            marker = new THREE.Mesh(
                new THREE.ConeGeometry(0.15, 0.3, 8),
                new THREE.MeshBasicMaterial({ color: 0xffd45a, transparent: true, opacity: 0.7 })
            );
            marker.position.y = 1.3;
            marker.rotation.z = Math.PI;
        }
        group.add(marker);
    }
    applyTransform(group, config.pos, config.rot);
    group.userData.declarativeId = config.id;
    engine.scene.add(group);

    // Usynlig hit-mesh for interact-raycast
    const hit = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.6, 0.8),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.position.set(config.pos[0], config.pos[1] + 0.3, config.pos[2]);
    markPhysics(hit, { solid: true });
    engine.scene.add(hit);

    let filled = false;

    engine.registerInteract(hit, {
        label: () => {
            if (filled) return '';
            const held = config.accepts.find((id) => engine.hasItem(id));
            return held ? `Plasser ${engine.config.items?.find((i) => i.id === held)?.name ?? held} (E)` : (config.label ?? 'Plasser (E)');
        },
        radius: 2.2,
        onInteract: () => {
            if (filled) return;
            const candidate = config.accepts.find((id) => engine.hasItem(id));
            if (!candidate) return;
            engine.removeItem(candidate, 1);
            filled = true;
            if (marker) marker.visible = false;
            playAudioPreset(engine, config.audioOnPlaced ?? 'puzzle-win');
            config.onPlaced(candidate);
        },
    });

    return { group, primary: hit };
}
