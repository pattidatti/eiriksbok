import * as THREE from 'three';
import type { SolidUserData } from '../../systems/PhysicsWorld';
import type { Vec3, Euler3 } from '../types';

/** Sett shadow-flagg rekursivt. Default: cast=true, receive=true. */
export function applyShadows(
    obj: THREE.Object3D,
    cast = true,
    receive = true
): void {
    obj.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
            o.castShadow = cast;
            o.receiveShadow = receive;
        }
    });
}

/** Sett transform på en gruppe fra pos/rot/scale-spec. */
export function applyTransform(
    obj: THREE.Object3D,
    pos: Vec3,
    rot?: Euler3,
    scale?: number | Vec3
): void {
    obj.position.set(pos[0], pos[1], pos[2]);
    if (rot) obj.rotation.set(rot[0], rot[1], rot[2]);
    if (scale !== undefined) {
        if (typeof scale === 'number') obj.scale.setScalar(scale);
        else obj.scale.set(scale[0], scale[1], scale[2]);
    }
}

/** Marker et mesh som solid for PhysicsWorld med sane defaults for dynamic. */
export function markPhysics(
    mesh: THREE.Mesh,
    opts: {
        solid?: boolean;
        dynamic?: boolean;
        colliderShape?: 'cuboid' | 'cylinder' | 'sphere' | 'trimesh';
        mass?: number;
        linearDamping?: number;
        angularDamping?: number;
    } = {}
): void {
    const ud = mesh.userData as SolidUserData;
    if (opts.solid !== false) ud.solid = true;
    if (opts.colliderShape) ud.colliderShape = opts.colliderShape;
    if (opts.dynamic) {
        ud.dynamic = true;
        ud.mass = opts.mass ?? 2;
        // Default-damping unngår "ruller-evig"-fallgruven. Kan overstyres.
        ud.linearDamping = opts.linearDamping ?? 0.3;
        ud.angularDamping = opts.angularDamping ?? 0.3;
    }
}
