import * as THREE from 'three';
import type { SolidUserData, ColliderShape } from './systems/PhysicsWorld';

// Fase 3.5: Typed helpers for scene/mesh userData. Erstatter magic strings med
// enkle funksjoner som sender riktig type-informasjon. Eksisterende kode som
// fortsatt skriver `mesh.userData.solid = true` direkte fungerer uendret —
// disse hjelperne er en opt-in kodetydeliggjøring.

export interface SolidOptions {
    shape?: ColliderShape;
    dynamic?: boolean;
    mass?: number;
    friction?: number;
    restitution?: number;
    linearDamping?: number;
    angularDamping?: number;
}

/** Marker et mesh som kollisjons-solid for PhysicsWorld. */
export function markSolid(mesh: THREE.Object3D, opts: SolidOptions = {}): void {
    const ud = mesh.userData as SolidUserData;
    ud.solid = true;
    if (opts.shape !== undefined) ud.colliderShape = opts.shape;
    if (opts.dynamic !== undefined) ud.dynamic = opts.dynamic;
    if (opts.mass !== undefined) ud.mass = opts.mass;
    if (opts.friction !== undefined) ud.friction = opts.friction;
    if (opts.restitution !== undefined) ud.restitution = opts.restitution;
    if (opts.linearDamping !== undefined) ud.linearDamping = opts.linearDamping;
    if (opts.angularDamping !== undefined) ud.angularDamping = opts.angularDamping;
}

/** Marker et mesh som klatrbar (stige/vegg). */
export function markClimbable(mesh: THREE.Object3D): void {
    const ud = mesh.userData as SolidUserData;
    ud.solid = true;
    ud.climbable = true;
}

/** Marker et mesh som plukkbar. InteractableSystem håndterer resten. */
export function markPickupable(mesh: THREE.Object3D): void {
    const ud = mesh.userData as SolidUserData;
    ud.solid = true;
    ud.pickupable = true;
    ud.dynamic = true;
}

// ─── Scene-level userData (shared state mellom GameEngine og builders) ──

export interface SceneUserDataFields {
    _mainSunLight?: THREE.DirectionalLight;
    _mainHemiLight?: THREE.HemisphereLight;
    _customUpdate?: (dt: number, time: number) => void;
}

/** Registrer sol-lys slik at TimeOfDaySystem plukker det opp automatisk. */
export function registerMainSunLight(scene: THREE.Scene, light: THREE.DirectionalLight): void {
    (scene.userData as SceneUserDataFields)._mainSunLight = light;
}

/** Registrer hemisphere-lys slik at TimeOfDaySystem plukker det opp. */
export function registerMainHemiLight(scene: THREE.Scene, light: THREE.HemisphereLight): void {
    (scene.userData as SceneUserDataFields)._mainHemiLight = light;
}

/** Koble en per-frame update-callback for scene-spesifikke animasjoner. */
export function registerCustomUpdate(scene: THREE.Scene, fn: (dt: number, time: number) => void): void {
    (scene.userData as SceneUserDataFields)._customUpdate = fn;
}
