import * as THREE from 'three';
import type RAPIER_NS from '@dimforge/rapier3d-compat';

// Lazy handle til Rapier-modulen. Settes etter PhysicsWorld.create() har awaitet init.
type RapierModule = typeof RAPIER_NS;
let RAPIER: RapierModule | null = null;

export type ColliderShape = 'auto' | 'cuboid' | 'trimesh' | 'cylinder' | 'capsule' | 'sphere';

// Konvensjon for hint på mesh.userData. Motoren leser disse når scenen traverseres.
export interface SolidUserData {
    solid?: boolean;
    colliderShape?: ColliderShape;
    dynamic?: boolean;
    mass?: number;
    friction?: number;
    restitution?: number;
    climbable?: boolean;
    pickupable?: boolean;
    // Bevegelig plattform: hopp over i den statiske importøren (egen kinematisk body).
    kinematicPlatform?: boolean;
    // Demping på dynamiske bodies - uten disse ruller/drifter objekter evig.
    linearDamping?: number;
    angularDamping?: number;
}

export interface CharacterControllerHandle {
    body: RAPIER_NS.RigidBody;
    collider: RAPIER_NS.Collider;
    controller: RAPIER_NS.KinematicCharacterController;
    radius: number;
    halfHeight: number;
}

export interface RaycastHit {
    hit: boolean;
    toi: number;
    point: THREE.Vector3;
    bodyHandle?: number;
}

export interface KinematicPlatformHandle {
    mesh: THREE.Object3D;
    body: RAPIER_NS.RigidBody;
    bodyHandle: number;
}

const FIXED_DT = 1 / 60;
const MAX_SUBSTEPS = 5;

export class PhysicsWorld {
    readonly world: RAPIER_NS.World;
    readonly gravity: number;

    // Alle statiske + dynamiske bodies vi har lagt til fra Three.js-meshes
    private meshToBody = new WeakMap<THREE.Object3D, RAPIER_NS.RigidBody>();
    // Dynamiske: vi synkroniserer mesh-transform fra body hver frame
    private dynamics: { mesh: THREE.Object3D; body: RAPIER_NS.RigidBody }[] = [];
    // Sensorer for ladders (climbable)
    private climbables: RAPIER_NS.Collider[] = [];
    // Kinematiske bevegelige plattformer (heiser/lifter som bærer spilleren)
    private platforms: KinematicPlatformHandle[] = [];

    private accumulator = 0;

    static async create(gravity = -18): Promise<PhysicsWorld> {
        if (!RAPIER) {
            RAPIER = await import('@dimforge/rapier3d-compat');
            await RAPIER.init();
        }
        return new PhysicsWorld(gravity);
    }

    private constructor(gravity: number) {
        if (!RAPIER) throw new Error('Rapier not initialized');
        this.gravity = gravity;
        this.world = new RAPIER.World({ x: 0, y: gravity, z: 0 });
    }

    // ── Statisk scene-import ─────────────────────────────────────────────────

    /** Traverserer scenen og oppretter statiske/dynamiske bodies fra alle meshes
     *  med userData.solid = true. Kjører én gang etter at scenen er bygget. */
    addStaticFromScene(root: THREE.Object3D): void {
        root.updateMatrixWorld(true);
        const queue: THREE.Object3D[] = [root];
        while (queue.length) {
            const obj = queue.pop()!;
            const ud = obj.userData as SolidUserData;
            // Bevegelige plattformer får en egen kinematisk body via createKinematicPlatform.
            if (ud.kinematicPlatform) continue;
            if (ud.solid && obj instanceof THREE.Mesh) {
                if (ud.dynamic) {
                    this.addDynamicMesh(obj);
                } else {
                    this.addStaticMesh(obj);
                }
            }
            for (const child of obj.children) queue.push(child);
        }
    }

    addStaticMesh(mesh: THREE.Mesh): RAPIER_NS.RigidBody | null {
        return this.addMesh(mesh, false);
    }

    addDynamicMesh(mesh: THREE.Mesh): RAPIER_NS.RigidBody | null {
        return this.addMesh(mesh, true);
    }

    private addMesh(mesh: THREE.Mesh, dynamic: boolean): RAPIER_NS.RigidBody | null {
        if (!RAPIER) return null;
        if (this.meshToBody.has(mesh)) return this.meshToBody.get(mesh)!;
        const ud = mesh.userData as SolidUserData;

        mesh.updateWorldMatrix(true, false);
        const worldPos = new THREE.Vector3();
        const worldQuat = new THREE.Quaternion();
        const worldScale = new THREE.Vector3();
        mesh.matrixWorld.decompose(worldPos, worldQuat, worldScale);

        // Beregn lokale halvdimensjoner fra geometriens boundingBox
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const bb = mesh.geometry.boundingBox!;
        const localCenter = new THREE.Vector3().addVectors(bb.min, bb.max).multiplyScalar(0.5);
        const localSize = new THREE.Vector3().subVectors(bb.max, bb.min);
        const half = new THREE.Vector3(
            (localSize.x * worldScale.x) / 2,
            (localSize.y * worldScale.y) / 2,
            (localSize.z * worldScale.z) / 2,
        );

        // Hvis bbox-senter ≠ mesh origo, juster rigid body-posisjon med rotert offset
        const centerOffset = localCenter.clone().multiply(worldScale).applyQuaternion(worldQuat);
        const bodyPos = worldPos.clone().add(centerOffset);

        // Body
        const climbable = ud.climbable === true;
        const bodyDesc = climbable
            ? RAPIER.RigidBodyDesc.fixed()
            : dynamic
                ? RAPIER.RigidBodyDesc.dynamic()
                : RAPIER.RigidBodyDesc.fixed();
        bodyDesc.setTranslation(bodyPos.x, bodyPos.y, bodyPos.z);
        bodyDesc.setRotation({ x: worldQuat.x, y: worldQuat.y, z: worldQuat.z, w: worldQuat.w });
        if (dynamic) {
            // Sane defaults: uten damping ruller objekter evig (gammel fallgruve §16.5).
            // Eksplisitte verdier i userData overstyrer.
            bodyDesc.setLinearDamping(ud.linearDamping ?? 0.3);
            bodyDesc.setAngularDamping(ud.angularDamping ?? 0.3);
        }
        const body = this.world.createRigidBody(bodyDesc);

        // Collider
        const shape = ud.colliderShape ?? 'auto';
        const colliderDesc = this.buildColliderDesc(mesh, shape, half);
        if (!colliderDesc) {
            this.world.removeRigidBody(body);
            return null;
        }
        colliderDesc.setFriction(ud.friction ?? 0.7);
        colliderDesc.setRestitution(ud.restitution ?? 0.0);
        if (dynamic && ud.mass !== undefined) {
            colliderDesc.setDensity(ud.mass / (half.x * half.y * half.z * 8 || 1));
        }
        if (climbable) {
            colliderDesc.setSensor(true);
        }
        const collider = this.world.createCollider(colliderDesc, body);

        if (climbable) this.climbables.push(collider);

        this.meshToBody.set(mesh, body);
        if (dynamic) {
            this.dynamics.push({ mesh, body });
        }
        return body;
    }

    private buildColliderDesc(
        mesh: THREE.Mesh,
        shape: ColliderShape,
        half: THREE.Vector3,
    ): RAPIER_NS.ColliderDesc | null {
        if (!RAPIER) return null;
        const hx = Math.max(0.02, half.x);
        const hy = Math.max(0.02, half.y);
        const hz = Math.max(0.02, half.z);

        if (shape === 'trimesh') {
            const geo = mesh.geometry;
            const pos = geo.attributes.position;
            if (!pos) return null;
            const verts = new Float32Array(pos.count * 3);
            for (let i = 0; i < pos.count; i++) {
                verts[i * 3] = pos.getX(i);
                verts[i * 3 + 1] = pos.getY(i);
                verts[i * 3 + 2] = pos.getZ(i);
            }
            let idx: Uint32Array;
            if (geo.index) {
                idx = new Uint32Array(geo.index.array);
            } else {
                idx = new Uint32Array(pos.count);
                for (let i = 0; i < pos.count; i++) idx[i] = i;
            }
            return RAPIER.ColliderDesc.trimesh(verts, idx);
        }

        if (shape === 'cylinder') {
            const r = Math.max(hx, hz);
            return RAPIER.ColliderDesc.cylinder(hy, r);
        }

        if (shape === 'capsule') {
            const r = Math.max(hx, hz);
            const capsuleHalf = Math.max(0.01, hy - r);
            return RAPIER.ColliderDesc.capsule(capsuleHalf, r);
        }

        if (shape === 'sphere') {
            const r = Math.max(hx, hy, hz);
            return RAPIER.ColliderDesc.ball(r);
        }

        // 'auto' | 'cuboid'
        return RAPIER.ColliderDesc.cuboid(hx, hy, hz);
    }

    /** Registrer et prosedyralt terreng som en statisk heightfield-collider.
     *  Heightfield > trimesh: O(1)-høyde-queries og ingen BVH-bygging (billig på
     *  Chromebook). `heights` MÅ være kolonne-major (se TerrainSystem.getHeightsColumnMajor):
     *  heights[col * rows + row]. Feltet sentreres i origo og spenner sizeX×sizeZ meter.
     *  Høydeverdiene er i meter (y-skala = 1), så fysikk-overflaten matcher mesh-Y-en direkte.
     *
     *  Orientering (verifisert empirisk med engangs-raycast-harness mot getHeight): kolonne-
     *  major-pakkingen til TerrainSystem gir et fysikk-felt som ligger nøyaktig under det
     *  visuelle. NB: heights.length MÅ være (nrows+1)*(ncols+1) = rows*cols, derfor nrows = rows-1. */
    addHeightfield(
        heights: Float32Array,
        rows: number,
        cols: number,
        sizeX: number,
        sizeZ: number,
    ): RAPIER_NS.RigidBody | null {
        if (!RAPIER) return null;
        const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0, 0);
        const body = this.world.createRigidBody(bodyDesc);
        const scale = { x: sizeX, y: 1, z: sizeZ };
        const colliderDesc = RAPIER.ColliderDesc.heightfield(rows - 1, cols - 1, heights, scale)
            .setFriction(0.9)
            .setRestitution(0);
        this.world.createCollider(colliderDesc, body);
        return body;
    }

    removeMesh(mesh: THREE.Object3D): void {
        const body = this.meshToBody.get(mesh);
        if (!body) return;
        this.world.removeRigidBody(body);
        this.meshToBody.delete(mesh);
        const idx = this.dynamics.findIndex((d) => d.mesh === mesh);
        if (idx >= 0) this.dynamics.splice(idx, 1);
        const pidx = this.platforms.findIndex((p) => p.mesh === mesh);
        if (pidx >= 0) this.platforms.splice(pidx, 1);
    }

    // ── Bevegelige plattformer (kinematiske) ───────────────────────────────────

    /** Lag en kinematisk position-based body fra en mesh (sentrert geometri antas).
     *  Spillerens character-controller kolliderer korrekt mot denne og rapporterer
     *  grounded når hen står oppå. Carry (at spilleren følger plattformen) håndteres
     *  i GameEngine via getCarryDelta + raycast. */
    createKinematicPlatform(mesh: THREE.Mesh): KinematicPlatformHandle | null {
        if (!RAPIER) return null;
        if (this.meshToBody.has(mesh)) return null;
        const ud = mesh.userData as SolidUserData;

        mesh.updateWorldMatrix(true, false);
        const worldPos = new THREE.Vector3();
        const worldQuat = new THREE.Quaternion();
        const worldScale = new THREE.Vector3();
        mesh.matrixWorld.decompose(worldPos, worldQuat, worldScale);

        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const bb = mesh.geometry.boundingBox!;
        const localCenter = new THREE.Vector3().addVectors(bb.min, bb.max).multiplyScalar(0.5);
        const localSize = new THREE.Vector3().subVectors(bb.max, bb.min);
        const half = new THREE.Vector3(
            (localSize.x * worldScale.x) / 2,
            (localSize.y * worldScale.y) / 2,
            (localSize.z * worldScale.z) / 2,
        );
        const centerOffset = localCenter.clone().multiply(worldScale).applyQuaternion(worldQuat);
        const bodyPos = worldPos.clone().add(centerOffset);

        const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
            .setTranslation(bodyPos.x, bodyPos.y, bodyPos.z)
            .setRotation({ x: worldQuat.x, y: worldQuat.y, z: worldQuat.z, w: worldQuat.w });
        const body = this.world.createRigidBody(bodyDesc);

        const colliderDesc = this.buildColliderDesc(mesh, ud.colliderShape ?? 'cuboid', half);
        if (!colliderDesc) {
            this.world.removeRigidBody(body);
            return null;
        }
        colliderDesc.setFriction(ud.friction ?? 0.9);
        this.world.createCollider(colliderDesc, body);

        this.meshToBody.set(mesh, body);
        const handle: KinematicPlatformHandle = { mesh, body, bodyHandle: body.handle };
        this.platforms.push(handle);
        return handle;
    }

    setPlatformTranslation(handle: KinematicPlatformHandle, x: number, y: number, z: number): void {
        handle.body.setNextKinematicTranslation({ x, y, z });
    }

    getPlatformByBodyHandle(bodyHandle: number): KinematicPlatformHandle | undefined {
        return this.platforms.find((p) => p.bodyHandle === bodyHandle);
    }

    getBody(mesh: THREE.Object3D): RAPIER_NS.RigidBody | undefined {
        return this.meshToBody.get(mesh);
    }

    setBodyEnabled(mesh: THREE.Object3D, enabled: boolean): void {
        const body = this.meshToBody.get(mesh);
        if (!body) return;
        body.setEnabled(enabled);
    }

    // ── Character controller ──────────────────────────────────────────────────

    createCharacterController(radius: number, halfHeight: number, startY = 1): CharacterControllerHandle {
        if (!RAPIER) throw new Error('Rapier not initialized');
        const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, startY, 0);
        const body = this.world.createRigidBody(bodyDesc);

        // Capsule collider - halfHeight er her halvparten av SYLINDER-delen (uten halvkuler).
        const capHalf = Math.max(0.05, halfHeight - radius);
        const colliderDesc = RAPIER.ColliderDesc.capsule(capHalf, radius).setFriction(0.5);
        const collider = this.world.createCollider(colliderDesc, body);

        const controller = this.world.createCharacterController(0.02);
        controller.enableAutostep(0.3, 0.15, true);
        controller.enableSnapToGround(0.4);
        controller.setApplyImpulsesToDynamicBodies(true);
        controller.setMaxSlopeClimbAngle(Math.PI / 4);

        return { body, collider, controller, radius, halfHeight };
    }

    /** Kjør character-controlleren for ønsket forflytning. EXCLUDE_SENSORS gjør at
     *  klatre-sensorer (og andre sensorer) ikke blokkerer spilleren - ellers ville
     *  spilleren stoppe FORAN stigesensoren og aldri komme inn i den for å klatre. */
    computeCharacterMovement(cc: CharacterControllerHandle, desired: THREE.Vector3): { x: number; y: number; z: number } {
        if (!RAPIER) return { x: 0, y: 0, z: 0 };
        cc.controller.computeColliderMovement(cc.collider, desired, RAPIER.QueryFilterFlags.EXCLUDE_SENSORS);
        return cc.controller.computedMovement();
    }

    // ── Query-API ─────────────────────────────────────────────────────────────

    /** Returnerer true hvis en climbable-sensor overlapper en sfære i point. */
    isOverlappingClimbable(point: THREE.Vector3, radius = 0.5): boolean {
        if (this.climbables.length === 0) return false;
        const p = { x: point.x, y: point.y, z: point.z };
        let overlap = false;
        this.world.intersectionsWithPoint(p, (collider) => {
            if (this.climbables.includes(collider)) {
                overlap = true;
                return false; // stopp
            }
            return true;
        });
        if (overlap) return true;
        // Fallback: sjekk om noen climbable-sensor er innen radius
        for (const c of this.climbables) {
            const t = c.translation();
            const dx = t.x - point.x;
            const dy = t.y - point.y;
            const dz = t.z - point.z;
            if (dx * dx + dy * dy + dz * dz < radius * radius * 4) return true;
        }
        return false;
    }

    raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxToi = 100, excludeBody?: RAPIER_NS.RigidBody): RaycastHit {
        if (!RAPIER) return { hit: false, toi: 0, point: origin.clone() };
        const normDir = dir.clone().normalize();
        const ray = new RAPIER.Ray(
            { x: origin.x, y: origin.y, z: origin.z },
            { x: normDir.x, y: normDir.y, z: normDir.z },
        );
        const hit = this.world.castRay(
            ray,
            maxToi,
            true,
            undefined,
            undefined,
            undefined,
            excludeBody,
        );
        if (!hit) return { hit: false, toi: 0, point: origin.clone() };
        const point = new THREE.Vector3(
            origin.x + normDir.x * hit.timeOfImpact,
            origin.y + normDir.y * hit.timeOfImpact,
            origin.z + normDir.z * hit.timeOfImpact,
        );
        const body = hit.collider.parent();
        return {
            hit: true,
            toi: hit.timeOfImpact,
            point,
            bodyHandle: body?.handle,
        };
    }

    /** Kort XZ-raycast brukt til kamera-clamp. Returnerer t (0..1) langs segment
     *  hvis truffet, ellers 1. */
    raycastSegmentXZ(from: THREE.Vector3, to: THREE.Vector3): number {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dz = to.z - from.z;
        const len = Math.hypot(dx, dy, dz);
        if (len < 1e-4) return 1;
        const dir = new THREE.Vector3(dx / len, dy / len, dz / len);
        const hit = this.raycast(from, dir, len);
        if (!hit.hit) return 1;
        return Math.max(0, hit.toi / len);
    }

    // ── Loop ──────────────────────────────────────────────────────────────────

    step(dt: number): { stepped: boolean; substeps: number } {
        this.accumulator += Math.min(dt, 0.25);
        let substeps = 0;
        while (this.accumulator >= FIXED_DT && substeps < MAX_SUBSTEPS) {
            this.world.step();
            this.accumulator -= FIXED_DT;
            substeps++;
        }
        // Unngå spiral-av-dødshjul: hvis vi nådde taket, nullstill accumulator
        if (substeps === MAX_SUBSTEPS) this.accumulator = 0;
        return { stepped: substeps > 0, substeps };
    }

    /** Synkroniser dynamiske mesh-transform fra physics-body. */
    syncMeshes(): void {
        for (const d of this.dynamics) {
            const t = d.body.translation();
            const r = d.body.rotation();
            // Hvis meshen har en forelder som IKKE er scenen, må vi konvertere world → local
            if (d.mesh.parent) {
                const parentWorldInv = new THREE.Matrix4().copy(d.mesh.parent.matrixWorld).invert();
                const localPos = new THREE.Vector3(t.x, t.y, t.z).applyMatrix4(parentWorldInv);
                d.mesh.position.copy(localPos);
                const worldQuat = new THREE.Quaternion(r.x, r.y, r.z, r.w);
                const parentQuat = new THREE.Quaternion().setFromRotationMatrix(d.mesh.parent.matrixWorld).invert();
                d.mesh.quaternion.multiplyQuaternions(parentQuat, worldQuat);
            } else {
                d.mesh.position.set(t.x, t.y, t.z);
                d.mesh.quaternion.set(r.x, r.y, r.z, r.w);
            }
        }
    }

    resetAccumulator(): void {
        this.accumulator = 0;
    }

    getBodyCount(): number {
        // Rapier's bodies store eksponerer .len() i nyere versjoner; vi feiler trygt til 0.
        const bodies = (this.world as unknown as { bodies?: { len?: () => number } }).bodies;
        if (bodies && typeof bodies.len === 'function') {
            return bodies.len();
        }
        return this.dynamics.length;
    }

    dispose(): void {
        this.dynamics.length = 0;
        this.climbables.length = 0;
        this.platforms.length = 0;
        this.world.free();
    }
}
