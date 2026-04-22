import * as THREE from 'three';
import type { PickupOptions } from '../types';
import type { PhysicsWorld } from './PhysicsWorld';

interface PickupRecord {
    mesh: THREE.Mesh;
    opts: Required<Pick<PickupOptions, 'throwForce'>> & PickupOptions;
    originalParent: THREE.Object3D | null;
}

/** Håndterer plukk/drop/kast av dynamiske objekter. E-tasten toggler pickup/drop,
 *  F-tasten kaster. GameEngine ringer tryHandleInteract()/tryHandleThrow() først
 *  slik at pickup-logikk vinner over dialog-triggering når spilleren holder et objekt. */
export class InteractableSystem {
    private pickups = new Map<THREE.Mesh, PickupRecord>();
    private held: PickupRecord | null = null;
    private holdHelper = new THREE.Object3D();  // ikke lagt til i scene; brukes for transform-beregninger
    private physics: PhysicsWorld;
    private camera: THREE.Camera;
    private scene: THREE.Scene;

    constructor(physics: PhysicsWorld, camera: THREE.Camera, scene: THREE.Scene) {
        this.physics = physics;
        this.camera = camera;
        this.scene = scene;
    }

    registerPickup(mesh: THREE.Mesh, opts: PickupOptions = {}): void {
        this.pickups.set(mesh, {
            mesh,
            opts: { throwForce: opts.throwForce ?? 8, ...opts },
            originalParent: mesh.parent,
        });
    }

    /** Returnerer true hvis E ble konsumert (pickup eller drop). */
    tryHandleInteract(): boolean {
        if (this.held) {
            this.drop();
            return true;
        }
        // Raycast fra kamera - hvis et pickupable objekt er innen 2.5m, plukk opp
        const origin = this.camera.getWorldPosition(new THREE.Vector3());
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        const hit = this.physics.raycast(origin, dir, 2.5);
        if (!hit.hit || hit.bodyHandle === undefined) return false;
        // Finn pickup-mesh hvis body matcher
        for (const rec of this.pickups.values()) {
            const body = this.physics.getBody(rec.mesh);
            if (body && body.handle === hit.bodyHandle) {
                this.pickup(rec.mesh);
                return true;
            }
        }
        return false;
    }

    /** Returnerer true hvis F ble konsumert (kast). No-op hvis ingenting holdes. */
    tryHandleThrow(): boolean {
        if (!this.held) return false;
        this.throwHeld();
        return true;
    }

    pickup(mesh: THREE.Mesh): void {
        const rec = this.pickups.get(mesh);
        if (!rec || this.held) return;
        // Deaktiver fysikk mens objektet holdes
        this.physics.setBodyEnabled(mesh, false);
        this.held = rec;
        rec.opts.onPickup?.();
    }

    drop(): void {
        if (!this.held) return;
        const mesh = this.held.mesh;
        // La objektet falle fra sin nåværende verdens-posisjon
        const worldPos = mesh.getWorldPosition(new THREE.Vector3());
        mesh.position.copy(worldPos);
        const body = this.physics.getBody(mesh);
        if (body) {
            body.setTranslation({ x: worldPos.x, y: worldPos.y, z: worldPos.z }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
        this.physics.setBodyEnabled(mesh, true);
        this.held.opts.onDrop?.();
        this.held = null;
    }

    throwHeld(force?: number): void {
        if (!this.held) return;
        const mesh = this.held.mesh;
        const throwForce = force ?? this.held.opts.throwForce;
        const worldPos = mesh.getWorldPosition(new THREE.Vector3());
        mesh.position.copy(worldPos);
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        const body = this.physics.getBody(mesh);
        if (body) {
            body.setTranslation({ x: worldPos.x, y: worldPos.y, z: worldPos.z }, true);
            body.setLinvel(
                { x: dir.x * throwForce, y: dir.y * throwForce + 2, z: dir.z * throwForce },
                true,
            );
        }
        this.physics.setBodyEnabled(mesh, true);
        this.held.opts.onThrow?.();
        this.held = null;
    }

    isHolding(): boolean {
        return this.held !== null;
    }

    /** Oppdater transform på holdt objekt så det følger kameraet. */
    update(): void {
        if (!this.held) return;
        const mesh = this.held.mesh;
        const offset = this.held.opts.holdOffset ?? [0, -0.25, -1.1];
        // Kameraets world matrix er alltid oppdatert i render-loopen
        this.holdHelper.matrix.identity();
        const localOffset = new THREE.Vector3(offset[0], offset[1], offset[2]);
        localOffset.applyQuaternion(this.camera.quaternion);
        const camPos = this.camera.getWorldPosition(new THREE.Vector3());
        const targetWorld = camPos.add(localOffset);

        if (mesh.parent && mesh.parent !== this.scene) {
            const parentInv = new THREE.Matrix4().copy(mesh.parent.matrixWorld).invert();
            mesh.position.copy(targetWorld.applyMatrix4(parentInv));
        } else {
            mesh.position.copy(targetWorld);
        }
        mesh.quaternion.copy(this.camera.quaternion);
    }

    dispose(): void {
        this.pickups.clear();
        this.held = null;
    }
}
