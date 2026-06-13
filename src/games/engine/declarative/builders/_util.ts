import * as THREE from 'three';
import type { SolidUserData } from '../../systems/PhysicsWorld';
import type { GameEngineRef } from '../../types';
import type { Vec3, Euler3, TVec3 } from '../types';

/** Fase 8: gjør om en TVec3 til en numerisk Vec3 ved å bytte 'terrain'-sentinelen
 *  mot engine.getTerrainHeight(x, z) (+ valgfri yOffset). En ren tall-Y går rett
 *  gjennom. Kall denne i builders FØR applyTransform når pos-feltet er en TVec3. */
export function resolveY(engine: GameEngineRef, pos: TVec3, yOffset = 0): Vec3 {
    const y = pos[1] === 'terrain' ? engine.getTerrainHeight(pos[0], pos[2]) + yOffset : pos[1];
    return [pos[0], y, pos[2]];
}

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

/**
 * Fase 9 (LOW-baseline): falsk kontaktskygge ("blob shadow").
 *
 * På lav-tier er `renderer.shadowMap.enabled = false`, så objekter mangler den
 * kontaktskyggen som ellers grunner dem mot bakken — de ser ut til å "flyte".
 * Denne helperen legger et flatt, mykt gradient-plan rett under et objekt. Det er
 * nesten gratis (delt materiale/tekstur per scene, ingen ekstra lys, ingen fysikk)
 * og kalles automatisk av addProp/addInteractable/addDoor/addNPC KUN når motoren
 * kjører på low-tier (på medium/high gir ekte skygge samme effekt).
 */
function getBlobShadowMaterial(scene: THREE.Scene): THREE.MeshBasicMaterial {
    const existing = scene.userData._blobShadowMat as THREE.MeshBasicMaterial | undefined;
    if (existing) return existing;

    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(0,0,0,0.50)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.26)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        opacity: 0.7,
        color: 0x000000,
    });
    scene.userData._blobShadowMat = mat;
    return mat;
}

/**
 * Lag en blob-skygge-mesh (et flatt gradient-plan i XZ) med gitt radius. Ikke
 * posisjonert — kalleren plasserer den. Deler materiale/tekstur per scene.
 */
export function createBlobShadow(scene: THREE.Scene, radius: number): THREE.Mesh {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(radius * 2, radius * 2),
        getBlobShadowMaterial(scene)
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = -1;
    mesh.userData._blobShadow = true;
    return mesh;
}

/**
 * Legg automatisk en blob-skygge under et allerede transformert objekt. No-op
 * med mindre motoren er på low-tier (ekte skygger dekker medium/high). `group`
 * må være ferdig transformert (applyTransform kalt) men trenger ikke være lagt
 * til scenen ennå — blobben legges i scenen ved objektets verdens-fotavtrykk.
 */
export function addGroundShadow(
    engine: GameEngineRef,
    group: THREE.Object3D,
    opts: { scale?: number } = {}
): void {
    if (engine.getQualityTier() !== 'low') return;

    const box = new THREE.Box3().setFromObject(group);
    if (box.isEmpty() || !isFinite(box.min.y)) return;

    const cx = (box.min.x + box.max.x) / 2;
    const cz = (box.min.z + box.max.z) / 2;

    // Bare grunne objekter som faktisk hviler på bakken. Vegg-monterte/flytende
    // props (fakler, vindusgitter, hyller) skal ikke få en blob på gulvet under seg.
    const groundY = engine.getTerrainHeight(cx, cz);
    if (box.min.y - groundY > 0.4) return;

    const sx = box.max.x - box.min.x;
    const sz = box.max.z - box.min.z;
    const radius = (Math.max(sx, sz) * 0.62 + 0.12) * (opts.scale ?? 1);
    if (radius <= 0) return;

    const blob = createBlobShadow(engine.scene, radius);
    blob.position.set(cx, groundY + 0.02, cz);
    engine.scene.add(blob);
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
