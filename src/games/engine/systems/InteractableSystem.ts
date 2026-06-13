import * as THREE from 'three';
import type { PickupOptions, InteractOptions } from '../types';
import type { PhysicsWorld } from './PhysicsWorld';
import type { ProjectileSystem } from './ProjectileSystem';
import { makeLabelSprite, makeGlowTexture } from '../TextureKit';

// Fase 8: utrustet launcher (spyd/bue/slynge). fire() spawner prosjektilet med den
// ferdig beregnede origin+velocity, så previewen matcher faktisk bane. Ammo telles her
// så HUD-en kan lese den.
export interface LauncherSlot {
    minForce: number;
    maxForce: number;
    upBias: number;
    chargeTimeMs: number;
    ammo: number;
    fire: (origin: THREE.Vector3, velocity: THREE.Vector3) => void;
    onAmmoEmpty?: () => void;
}

const PREVIEW_STEPS = 24;

interface PickupRecord {
    mesh: THREE.Mesh;
    opts: Required<Pick<PickupOptions, 'throwForce'>> & PickupOptions;
    originalParent: THREE.Object3D | null;
}

interface InteractRecord {
    mesh: THREE.Mesh;
    opts: InteractOptions & { radius: number };
    labelSprite: THREE.Sprite;
    labelCanvas: HTMLCanvasElement;
    labelCtx: CanvasRenderingContext2D;
    labelTexture: THREE.CanvasTexture;
    lastLabelText: string;
}

const _meshPos = new THREE.Vector3();
const _camRight = new THREE.Vector3();

/** Håndterer plukk/drop/kast av dynamiske objekter. E-tasten toggler pickup/drop,
 *  F-tasten kaster. GameEngine ringer tryHandleInteract()/tryHandleThrow() først
 *  slik at pickup-logikk vinner over dialog-triggering når spilleren holder et objekt. */
export class InteractableSystem {
    private pickups = new Map<THREE.Mesh, PickupRecord>();
    private held: PickupRecord | null = null;
    private interacts = new Map<THREE.Mesh, InteractRecord>();
    private physics: PhysicsWorld;
    private camera: THREE.Camera;
    private scene: THREE.Scene;
    private playerGroup: THREE.Group | null = null;
    private labelSprites = new Map<THREE.Mesh, THREE.Sprite>();

    // ── Fase 8: lad-og-kast + launcher + bue-preview ──
    private projectiles: ProjectileSystem | null = null;
    private charging = false;
    private chargeLevel = 0;       // 0..1
    private chargeTimeMs = 900;
    private chargeBaseForce = 8;
    private chargeMaxForce = 16;
    private chargeUpBias = 2;
    private chargePreviewEnabled = true;
    private launcher: LauncherSlot | null = null;
    private previewPoints: THREE.Points | null = null;
    private previewPositions = new Float32Array(PREVIEW_STEPS * 3);
    private previewRing: THREE.Mesh | null = null;

    constructor(physics: PhysicsWorld, camera: THREE.Camera, scene: THREE.Scene) {
        this.physics = physics;
        this.camera = camera;
        this.scene = scene;
    }

    setProjectileSystem(ps: ProjectileSystem): void {
        this.projectiles = ps;
    }

    // ── Launcher (spyd/bue/slynge) ──
    equipLauncher(slot: LauncherSlot): void {
        this.launcher = slot;
    }
    unequipLauncher(): void {
        this.cancelCharge();
        this.launcher = null;
    }
    isLauncherEquipped(): boolean {
        return this.launcher !== null;
    }
    getLauncherAmmo(): number | null {
        return this.launcher ? this.launcher.ammo : null;
    }

    // ── Charge (hold F = lad, slipp = kast/skyt) ──
    canCharge(): boolean {
        return (this.launcher !== null && this.launcher.ammo > 0) || !!this.held?.opts.charge;
    }

    beginCharge(): void {
        if (this.charging) return;
        if (this.launcher && this.launcher.ammo > 0) {
            this.chargeBaseForce = this.launcher.minForce;
            this.chargeMaxForce = this.launcher.maxForce;
            this.chargeUpBias = this.launcher.upBias;
            this.chargeTimeMs = this.launcher.chargeTimeMs;
            this.chargePreviewEnabled = true;
        } else if (this.held?.opts.charge) {
            const c = this.held.opts.charge;
            this.chargeBaseForce = this.held.opts.throwForce;
            this.chargeMaxForce = c.maxForce ?? 16;
            this.chargeUpBias = 2;
            this.chargeTimeMs = c.chargeTimeMs ?? 900;
            this.chargePreviewEnabled = c.preview !== false;
        } else {
            return;
        }
        this.charging = true;
        this.chargeLevel = 0;
    }

    releaseCharge(): void {
        if (!this.charging) return;
        this.charging = false;
        const level = this.chargeLevel;
        this.chargeLevel = 0;
        this.hidePreview();
        const force = this.chargeBaseForce + (this.chargeMaxForce - this.chargeBaseForce) * level;
        const { origin, velocity } = this.computeLaunch(force);
        if (this.launcher && this.launcher.ammo > 0) {
            this.launcher.fire(origin, velocity);
            this.launcher.ammo--;
            if (this.launcher.ammo <= 0) this.launcher.onAmmoEmpty?.();
        } else if (this.held?.opts.charge) {
            this.throwHeldWithVelocity(velocity);
        }
    }

    /** Avbryt lading rent (dialog/cinematic/mode-bytte). */
    cancelCharge(): void {
        if (!this.charging) return;
        this.charging = false;
        this.chargeLevel = 0;
        this.hidePreview();
    }

    isCharging(): boolean {
        return this.charging;
    }
    getCharge(): number | null {
        return this.charging ? this.chargeLevel : null;
    }

    // Spillerens "hånd": ved siden av spilleren i arm-høyde (samme som holdt-objekt),
    // ellers kamera-fallback. Brukes som start for både preview og kast.
    private getHandPosition(): THREE.Vector3 {
        if (this.playerGroup) {
            const playerPos = this.playerGroup.getWorldPosition(new THREE.Vector3());
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
            right.y = 0;
            if (right.lengthSq() > 0.001) right.normalize();
            return playerPos.addScaledVector(right, 0.5).add(new THREE.Vector3(0, 0.85, 0));
        }
        return this.camera.getWorldPosition(new THREE.Vector3());
    }

    private computeLaunch(force: number): { origin: THREE.Vector3; velocity: THREE.Vector3 } {
        const origin = this.getHandPosition();
        const dir = this.camera.getWorldDirection(new THREE.Vector3());
        const velocity = dir.multiplyScalar(force).add(new THREE.Vector3(0, this.chargeUpBias, 0));
        return { origin, velocity };
    }

    private throwHeldWithVelocity(velocity: THREE.Vector3): void {
        if (!this.held) return;
        const mesh = this.held.mesh;
        const worldPos = mesh.getWorldPosition(new THREE.Vector3());
        mesh.position.copy(worldPos);
        const body = this.physics.getBody(mesh);
        if (body) {
            body.setTranslation({ x: worldPos.x, y: worldPos.y, z: worldPos.z }, true);
            body.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
            // Spor den kastede bodyen så den kan treffe mål (Fase 8).
            this.projectiles?.trackThrownBody(
                () => {
                    const t = body.translation();
                    return new THREE.Vector3(t.x, t.y, t.z);
                },
                () => {},
            );
        }
        this.physics.setBodyEnabled(mesh, true);
        this.held.opts.onThrow?.();
        this.held = null;
    }

    setPlayerGroup(group: THREE.Group): void {
        this.playerGroup = group;
    }

    registerPickup(mesh: THREE.Mesh, opts: PickupOptions = {}): void {
        this.pickups.set(mesh, {
            mesh,
            opts: { throwForce: opts.throwForce ?? 8, ...opts },
            originalParent: mesh.parent,
        });
        // Alltid lag en label - standard 'Plukk opp (E)', kan overstyres via opts.label
        const sprite = makeLabelSprite(opts.label ?? 'Plukk opp (E)');
        sprite.visible = false;
        this.scene.add(sprite);
        this.labelSprites.set(mesh, sprite);
    }

    registerInteract(mesh: THREE.Mesh, opts: InteractOptions): void {
        const radius = opts.radius ?? 2.5;
        const cvs = document.createElement('canvas');
        cvs.width = 256;
        cvs.height = 56;
        const ctx = cvs.getContext('2d')!;
        const texture = new THREE.CanvasTexture(cvs);
        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(1.5, 0.33, 1);
        sprite.renderOrder = 999;
        sprite.visible = false;
        this.scene.add(sprite);
        const rec: InteractRecord = {
            mesh,
            opts: { ...opts, radius },
            labelSprite: sprite,
            labelCanvas: cvs,
            labelCtx: ctx,
            labelTexture: texture,
            lastLabelText: '',
        };
        this.interacts.set(mesh, rec);
    }

    unregisterInteract(mesh: THREE.Mesh): void {
        const rec = this.interacts.get(mesh);
        if (!rec) return;
        this.scene.remove(rec.labelSprite);
        rec.labelTexture.dispose();
        (rec.labelSprite.material as THREE.SpriteMaterial).dispose();
        this.interacts.delete(mesh);
    }

    /** Nærmeste registrerte interact-mesh innen dens radius fra origin, eller null. */
    getNearbyInteract(origin: THREE.Vector3): InteractRecord | null {
        let nearest: InteractRecord | null = null;
        let nearestDist = Infinity;
        for (const rec of this.interacts.values()) {
            rec.mesh.getWorldPosition(_meshPos);
            const d = origin.distanceTo(_meshPos);
            if (d < rec.opts.radius && d < nearestDist) {
                nearestDist = d;
                nearest = rec;
            }
        }
        return nearest;
    }

    /** Returnerer true hvis E ble konsumert (pickup eller drop).
     *  playerPos brukes for proximity-fallback (tredjepersonkamera er for langt unna). */
    tryHandleInteract(playerPos?: THREE.Vector3): boolean {
        if (this.held) {
            this.drop();
            return true;
        }
        const origin = this.camera.getWorldPosition(new THREE.Vector3());
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        // Raycast fra kamera - krever at spilleren sikter direkte på objektet
        const hit = this.physics.raycast(origin, dir, 2.5);
        if (hit.hit && hit.bodyHandle !== undefined) {
            for (const rec of this.pickups.values()) {
                const body = this.physics.getBody(rec.mesh);
                if (body && body.handle === hit.bodyHandle) {
                    this.pickup(rec.mesh);
                    return true;
                }
            }
        }
        // Fallback: nærmeste pickup innen 2.5m fra spillerposisjon (ikke kamera)
        const refPos = playerPos ?? origin;
        const nearest = this.getNearbyPickup(refPos, 2.5);
        if (nearest) {
            this.pickup(nearest);
            return true;
        }
        // Custom interactable (alter, dor, etc.) — sjekk etter pickups
        const nearInteract = this.getNearbyInteract(refPos);
        if (nearInteract) {
            nearInteract.opts.onInteract();
            return true;
        }
        return false;
    }

    /** Nærmeste registrerte pickup-mesh innen maxDist fra origin, eller null. */
    getNearbyPickup(origin: THREE.Vector3, maxDist: number): THREE.Mesh | null {
        let nearest: THREE.Mesh | null = null;
        let nearestDist = maxDist;
        for (const [mesh] of this.pickups) {
            mesh.getWorldPosition(_meshPos);
            const d = origin.distanceTo(_meshPos);
            if (d < nearestDist) {
                nearestDist = d;
                nearest = mesh;
            }
        }
        return nearest;
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

        if (rec.opts.toInventory) {
            // Direkte til inventar: fjern fra scene + physics, skjul label permanent
            this.removeLabel(mesh);
            rec.opts.onPickup?.();
            this.physics.removeMesh(mesh);
            mesh.removeFromParent();
            this.pickups.delete(mesh);
            return;
        }

        // Hold i hånd: deaktiver fysikk, skjul label mens objektet holdes
        const sprite = this.labelSprites.get(mesh);
        if (sprite) sprite.visible = false;
        this.physics.setBodyEnabled(mesh, false);
        this.held = rec;
        rec.opts.onPickup?.();
    }

    drop(): void {
        if (!this.held) return;
        const mesh = this.held.mesh;
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

    /** Oppdater holdt objekt, label-sprites og lade-preview. */
    update(dt = 0): void {
        // Fase 8: avanser ladning + bue-preview.
        if (this.charging) {
            this.chargeLevel = Math.min(1, this.chargeLevel + (dt * 1000) / this.chargeTimeMs);
            if (this.chargePreviewEnabled) this.updatePreview();
            else this.hidePreview();
        }

        const playerPos = new THREE.Vector3();
        if (this.playerGroup) this.playerGroup.getWorldPosition(playerPos);

        // Oppdater label-sprites: posisjon + synlighet basert på spilleravstand
        for (const [mesh, sprite] of this.labelSprites) {
            if (this.held?.mesh === mesh) continue; // skjult mens holdt
            mesh.getWorldPosition(_meshPos);
            sprite.position.set(_meshPos.x, _meshPos.y + 1.1, _meshPos.z);
            const dist = this.playerGroup ? playerPos.distanceTo(_meshPos) : Infinity;
            sprite.visible = dist < 4.5;
        }

        // Oppdater custom interactable labels
        for (const rec of this.interacts.values()) {
            rec.mesh.getWorldPosition(_meshPos);
            const dist = this.playerGroup ? playerPos.distanceTo(_meshPos) : Infinity;
            const showRadius = rec.opts.radius * 2;

            const rawLabel = typeof rec.opts.label === 'function'
                ? rec.opts.label()
                : (rec.opts.label ?? 'Trykk E');

            if (!rawLabel || dist >= showRadius) {
                rec.labelSprite.visible = false;
                continue;
            }

            rec.labelSprite.visible = true;
            rec.labelSprite.position.set(_meshPos.x, _meshPos.y + 1.2, _meshPos.z);

            if (rawLabel !== rec.lastLabelText) {
                rec.lastLabelText = rawLabel;
                this.drawInteractLabel(rec, rawLabel);
            }
        }

        if (!this.held) return;
        const mesh = this.held.mesh;

        // Tredjeperson: plasser ved spillerens høyre side i arm-høyde
        if (this.playerGroup) {
            this.playerGroup.getWorldPosition(playerPos);
            // Kameraets høyrevektor uten pitch — brukes for sideforskyvning
            _camRight.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
            _camRight.y = 0;
            if (_camRight.lengthSq() > 0.001) _camRight.normalize();
            const handPos = playerPos.clone();
            handPos.addScaledVector(_camRight, 0.5);
            handPos.y += 0.85;

            if (mesh.parent && mesh.parent !== this.scene) {
                const parentInv = new THREE.Matrix4().copy(mesh.parent.matrixWorld).invert();
                mesh.position.copy(handPos.applyMatrix4(parentInv));
            } else {
                mesh.position.copy(handPos);
            }
            // Roter lett mot kameraretning (yaw) uten pitch-helling
            const yaw = Math.atan2(
                this.camera.getWorldDirection(new THREE.Vector3()).x,
                this.camera.getWorldDirection(new THREE.Vector3()).z,
            );
            mesh.rotation.set(0.2, yaw, 0.15);
        } else {
            // Fallback: kamera-relativ (FPS-modus eller ingen spillergruppe)
            const offset = this.held.opts.holdOffset ?? [0, -0.25, -1.1];
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
    }

    // ── Ballistisk bue-preview ──
    // Sampler samme bane som det faktiske kastet (samme gravitasjon som Rapier),
    // stopper ved første raycast-treff og markerer landingspunktet med en ring.
    private ensurePreview(): void {
        if (!this.previewPoints) {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(this.previewPositions, 3));
            const mat = new THREE.PointsMaterial({
                map: makeGlowTexture({ innerColor: '#fff4d8', outerColor: '#ffb347' }),
                color: 0xffd27a,
                size: 0.22,
                transparent: true,
                opacity: 0.9,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true,
            });
            this.previewPoints = new THREE.Points(geo, mat);
            this.previewPoints.frustumCulled = false;
            this.previewPoints.renderOrder = 998;
            this.scene.add(this.previewPoints);
        }
        if (!this.previewRing) {
            this.previewRing = new THREE.Mesh(
                new THREE.RingGeometry(0.25, 0.34, 20),
                new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }),
            );
            this.previewRing.rotation.x = -Math.PI / 2;
            this.previewRing.renderOrder = 998;
            this.scene.add(this.previewRing);
        }
    }

    private updatePreview(): void {
        this.ensurePreview();
        const force = this.chargeBaseForce + (this.chargeMaxForce - this.chargeBaseForce) * this.chargeLevel;
        const { origin, velocity } = this.computeLaunch(force);
        const g = this.physics.gravity; // negativ
        const dtP = 0.07;
        let count = 0;
        let prev = origin.clone();
        let landing: THREE.Vector3 | null = null;
        for (let i = 0; i < PREVIEW_STEPS; i++) {
            const t = i * dtP;
            const cur = new THREE.Vector3(
                origin.x + velocity.x * t,
                origin.y + velocity.y * t + 0.5 * g * t * t,
                origin.z + velocity.z * t,
            );
            const seg = cur.clone().sub(prev);
            const segLen = seg.length();
            if (i > 0 && segLen > 1e-4) {
                const hit = this.physics.raycast(prev, seg.divideScalar(segLen), segLen);
                if (hit.hit) {
                    this.previewPositions[count * 3] = hit.point.x;
                    this.previewPositions[count * 3 + 1] = hit.point.y;
                    this.previewPositions[count * 3 + 2] = hit.point.z;
                    count++;
                    landing = hit.point.clone();
                    break;
                }
            }
            this.previewPositions[count * 3] = cur.x;
            this.previewPositions[count * 3 + 1] = cur.y;
            this.previewPositions[count * 3 + 2] = cur.z;
            count++;
            prev = cur;
        }
        const posAttr = this.previewPoints!.geometry.getAttribute('position') as THREE.BufferAttribute;
        posAttr.needsUpdate = true;
        this.previewPoints!.geometry.setDrawRange(0, count);
        this.previewPoints!.visible = true;
        if (landing && this.previewRing) {
            this.previewRing.position.set(landing.x, landing.y + 0.02, landing.z);
            this.previewRing.visible = true;
        } else if (this.previewRing) {
            this.previewRing.visible = false;
        }
    }

    private hidePreview(): void {
        if (this.previewPoints) this.previewPoints.visible = false;
        if (this.previewRing) this.previewRing.visible = false;
    }

    dispose(): void {
        if (this.previewPoints) {
            this.scene.remove(this.previewPoints);
            this.previewPoints.geometry.dispose();
            (this.previewPoints.material as THREE.PointsMaterial).map?.dispose();
            (this.previewPoints.material as THREE.Material).dispose();
            this.previewPoints = null;
        }
        if (this.previewRing) {
            this.scene.remove(this.previewRing);
            this.previewRing.geometry.dispose();
            (this.previewRing.material as THREE.Material).dispose();
            this.previewRing = null;
        }
        this.launcher = null;
        for (const sprite of this.labelSprites.values()) {
            this.scene.remove(sprite);
            (sprite.material as THREE.SpriteMaterial).map?.dispose();
            sprite.material.dispose();
        }
        this.labelSprites.clear();
        for (const rec of this.interacts.values()) {
            this.scene.remove(rec.labelSprite);
            rec.labelTexture.dispose();
            (rec.labelSprite.material as THREE.SpriteMaterial).dispose();
        }
        this.interacts.clear();
        this.pickups.clear();
        this.held = null;
    }

    private drawInteractLabel(rec: InteractRecord, text: string): void {
        const { labelCtx: ctx, labelCanvas: cvs, labelTexture } = rec;
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.shadowColor = 'rgba(0,0,0,0.95)';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#f0ddb8';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 30);
        ctx.shadowBlur = 0;
        labelTexture.needsUpdate = true;
    }

    private removeLabel(mesh: THREE.Mesh): void {
        const sprite = this.labelSprites.get(mesh);
        if (!sprite) return;
        this.scene.remove(sprite);
        (sprite.material as THREE.SpriteMaterial).map?.dispose();
        sprite.material.dispose();
        this.labelSprites.delete(mesh);
    }

}
