import * as THREE from 'three';
import type { GameEngineRef } from '../../types';
import type {
    AddPropConfig, AddInteractableConfig, AddDoorConfig, AddRawMeshConfig,
    BuildResult, ModelPresetName,
} from '../types';
import { createModel, createMaterial, isValidModelPreset } from '../presets';
import { applyShadows, applyTransform, markPhysics } from './_util';

/** Bygg en mesh fra AddPropConfig.model (preset eller custom primitive). */
function buildMeshFromModelSpec(
    model: AddPropConfig['model']
): { group: THREE.Group; primary: THREE.Mesh; defaultShape: 'cuboid' | 'cylinder' | 'sphere' } {
    if (typeof model === 'string') {
        if (!isValidModelPreset(model)) {
            throw new Error(`[addProp] Ukjent model-preset: '${model}'.`);
        }
        const result = createModel(model as ModelPresetName);
        return {
            group: result.group,
            primary: result.primary as THREE.Mesh,
            defaultShape: (result.suggestedColliderShape as 'cuboid' | 'cylinder' | 'sphere') ?? 'cuboid',
        };
    }
    // Custom primitive
    const group = new THREE.Group();
    let geom: THREE.BufferGeometry;
    let shape: 'cuboid' | 'cylinder' | 'sphere' = 'cuboid';
    if (model.primitive === 'box') {
        const [x, y, z] = (model.size as [number, number, number]);
        geom = new THREE.BoxGeometry(x, y, z);
        shape = 'cuboid';
    } else if (model.primitive === 'cylinder') {
        const [r, h] = (model.size as [number, number]);
        geom = new THREE.CylinderGeometry(r, r, h, 16);
        shape = 'cylinder';
    } else if (model.primitive === 'sphere') {
        const r = (model.size as number[])[0];
        geom = new THREE.SphereGeometry(r, 16, 16);
        shape = 'sphere';
    } else {
        throw new Error(`[addProp] Ukjent primitive: '${String(model.primitive)}'.`);
    }
    const mat = new THREE.MeshStandardMaterial({
        color: model.color ?? 0x888888, roughness: 0.8, metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geom, mat);
    group.add(mesh);
    return { group, primary: mesh, defaultShape: shape };
}

/** Legg til en statisk eller dynamisk prop i scenen med sane defaults. */
export function addProp(
    engine: GameEngineRef,
    config: AddPropConfig
): BuildResult {
    const { group, primary, defaultShape } = buildMeshFromModelSpec(config.model);

    if (config.material) {
        primary.material = createMaterial(config.material);
    }

    applyTransform(group, config.pos, config.rot, config.scale);
    applyShadows(group, config.castShadow ?? true, config.receiveShadow ?? true);

    if (config.solid !== false) {
        markPhysics(primary, {
            solid: true,
            dynamic: !!config.dynamic,
            colliderShape: defaultShape,
            mass: config.dynamic?.mass,
            linearDamping: config.dynamic?.linearDamping,
            angularDamping: config.dynamic?.angularDamping,
        });
    }

    group.userData.declarativeId = config.id;
    engine.scene.add(group);

    return { group, primary };
}

/** Legg til et E-key-interagerbart objekt med flytende etikett. */
export function addInteractable(
    engine: GameEngineRef,
    config: AddInteractableConfig
): BuildResult {
    const { group, primary } = buildMeshFromModelSpec(config.model);

    applyTransform(group, config.pos, config.rot);
    applyShadows(group, true, true);

    // Interactables er vanligvis statiske - kolliderer for å kunne treffes av raycast.
    markPhysics(primary, { solid: true });

    group.userData.declarativeId = config.id;
    engine.scene.add(group);

    engine.registerInteract(primary, {
        label: config.prompt ?? 'Bruk (E)',
        radius: config.radius ?? 2.5,
        onInteract: config.onInteract,
    });

    return { group, primary };
}

/**
 * Frittstående dør-objekt med valgfri låsing. For åpninger i buildRoom-vegger,
 * bruk buildRoom.doors[] i stedet.
 */
export function addDoor(
    engine: GameEngineRef,
    config: AddDoorConfig
): BuildResult {
    const [w, h, t] = config.size ?? [1.2, 2.0, 0.15];
    const mat = createMaterial(config.material ?? 'wood');
    const group = new THREE.Group();
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), mat);
    slab.position.y = h / 2;
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);
    const handle = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        createMaterial('iron')
    );
    handle.position.set(w * 0.4, h / 2, t / 2 + 0.01);
    group.add(handle);

    applyTransform(group, config.pos, config.rot);
    markPhysics(slab, { solid: true, colliderShape: 'cuboid' });
    group.userData.declarativeId = config.id;
    engine.scene.add(group);

    const isLocked = () => {
        if (!config.lockedUntilFlag) return false;
        return !engine.getFlag(config.lockedUntilFlag);
    };

    engine.registerInteract(slab, {
        label: () => isLocked() ? 'Låst' : (config.openFlag && engine.getFlag(config.openFlag) ? 'Lukk (E)' : 'Åpne (E)'),
        radius: 2.2,
        onInteract: () => {
            if (isLocked()) {
                config.onLockedAttempt?.();
                return;
            }
            if (config.openFlag) {
                const open = !engine.getFlag(config.openFlag);
                engine.setFlag(config.openFlag, open);
                if (open) {
                    engine.removeStaticCollider(slab);
                    group.visible = false;
                }
            } else {
                engine.removeStaticCollider(slab);
                group.visible = false;
            }
        },
    });

    return { group, primary: slab };
}

/**
 * Escape hatch: legg til en forhåndsbygget mesh. Bruker tar selv ansvar for
 * userData.solid og shadow-flags. Skal svært sjelden brukes - foretrekk addProp.
 */
export function addRawMesh(
    engine: GameEngineRef,
    config: AddRawMeshConfig
): BuildResult {
    const mesh = config.mesh;
    if (config.castShadow !== false) mesh.castShadow = true;
    if (config.receiveShadow !== false) mesh.receiveShadow = true;
    if (config.solid) markPhysics(mesh, { solid: true });
    engine.scene.add(mesh);
    return { group: new THREE.Group().add(mesh) as THREE.Group, primary: mesh };
}
