import * as THREE from 'three';
import type { PhysicsWorld } from './PhysicsWorld';

// ─── ProjectileSystem (Fase 8) ───────────────────────────────────────────────
// Lette prosjektiler (stein/spyd/pil/snøball) med ANALYTISK integrasjon + raycast
// forrige→ny posisjon per frame - IKKE Rapier-bodies. Det gir:
//   - identisk bane som charge-throw-previewen (samme gravitasjon)
//   - deterministisk tunneling-fangst (raycast langs hele steget)
//   - ingen body-churn (pool per visual, gjenbrukes)
// Mål registreres som proximity-soner (ikke body-handles), så de virker uavhengig
// av når Rapier-fysikken blir klar.

export type ProjectileVisual = 'stone' | 'spear' | 'arrow' | 'snowball';

export interface ProjectileSpawnOptions {
    from: THREE.Vector3;
    velocity: THREE.Vector3;
    // Gravitasjon (m/s²). Default = fysikkverdenens gravitasjon langs -Y.
    gravity?: THREE.Vector3;
    visual?: ProjectileVisual | THREE.Object3D;
    // Roter visualet mot fartsretningen (spyd/pil). Default true for spear/arrow.
    alignToVelocity?: boolean;
    // Spinn rundt egen akse (rad/s). Default 0 (8 for stone/snowball).
    spin?: number;
    // Maks levetid i sekunder før prosjektilet ryddes. Default 6.
    maxLifeSec?: number;
    // Kalles ved første treff (mål, bakke eller vegg). hit.target er satt hvis et mål ble truffet.
    onHit?: (hit: { point: THREE.Vector3; target: ProjectileTargetRecord | null }) => void;
}

export interface ProjectileTargetRecord {
    id: string;
    center: THREE.Vector3;
    radius: number;
    onHit: (record: ProjectileTargetRecord) => void;
}

interface Projectile {
    mesh: THREE.Object3D;
    visualKey: string;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    gravity: THREE.Vector3;
    life: number;
    maxLife: number;
    spin: number;
    alignToVelocity: boolean;
    onHit?: ProjectileSpawnOptions['onHit'];
    active: boolean;
}

interface TrackedBody {
    getPos: () => THREE.Vector3;
    prev: THREE.Vector3;
    onHit: (record: ProjectileTargetRecord) => void;
    life: number;
}

const _seg = new THREE.Vector3();
const _toC = new THREE.Vector3();
const _proj = new THREE.Vector3();

// Korteste avstand fra punkt c til linjesegment a→b.
function distPointToSegment(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): number {
    _seg.subVectors(b, a);
    const lenSq = _seg.lengthSq() || 1;
    _toC.subVectors(c, a);
    const t = Math.max(0, Math.min(1, _toC.dot(_seg) / lenSq));
    _proj.copy(a).addScaledVector(_seg, t);
    return _proj.distanceTo(c);
}

function buildVisualMesh(kind: ProjectileVisual): THREE.Object3D {
    switch (kind) {
        case 'spear': {
            const g = new THREE.Group();
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.025, 0.025, 1.4, 6),
                new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.9 }),
            );
            shaft.rotation.x = Math.PI / 2; // langs +Z
            const tip = new THREE.Mesh(
                new THREE.ConeGeometry(0.05, 0.22, 6),
                new THREE.MeshStandardMaterial({ color: 0x9aa3ab, metalness: 0.6, roughness: 0.4 }),
            );
            tip.position.z = 0.8;
            tip.rotation.x = Math.PI / 2;
            g.add(shaft, tip);
            return g;
        }
        case 'arrow': {
            const g = new THREE.Group();
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.012, 0.012, 0.8, 5),
                new THREE.MeshStandardMaterial({ color: 0x7a5a36, roughness: 0.9 }),
            );
            shaft.rotation.x = Math.PI / 2;
            g.add(shaft);
            return g;
        }
        case 'snowball':
            return new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 10, 8),
                new THREE.MeshStandardMaterial({ color: 0xf2f6fb, roughness: 1 }),
            );
        case 'stone':
        default:
            return new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.13, 0),
                new THREE.MeshStandardMaterial({ color: 0x807a72, roughness: 1 }),
            );
    }
}

export class ProjectileSystem {
    private scene: THREE.Scene;
    private physics: PhysicsWorld;
    private active: Projectile[] = [];
    private pools = new Map<string, THREE.Object3D[]>();
    private targets = new Map<string, ProjectileTargetRecord>();
    private tracked: TrackedBody[] = [];
    private gravityDefault: THREE.Vector3;

    constructor(scene: THREE.Scene, physics: PhysicsWorld) {
        this.scene = scene;
        this.physics = physics;
        this.gravityDefault = new THREE.Vector3(0, physics.gravity, 0);
    }

    registerTarget(record: ProjectileTargetRecord): void {
        this.targets.set(record.id, record);
    }

    removeTarget(id: string): void {
        this.targets.delete(id);
    }

    /** Spor en allerede kastet Rapier-body (vanlig holdt-objekt-kast) mot mål, så
     *  også fysiske kast kan treffe blinker. onHit fyres når bodyen passerer et mål. */
    trackThrownBody(getPos: () => THREE.Vector3, onHit: (record: ProjectileTargetRecord) => void): void {
        this.tracked.push({ getPos, prev: getPos().clone(), onHit, life: 0 });
    }

    spawnProjectile(opts: ProjectileSpawnOptions): void {
        const visual = opts.visual ?? 'stone';
        const visualKey = typeof visual === 'string' ? visual : 'custom';
        let mesh: THREE.Object3D;
        if (typeof visual === 'string') {
            const pool = this.pools.get(visualKey);
            mesh = pool && pool.length > 0 ? pool.pop()! : buildVisualMesh(visual);
        } else {
            mesh = visual;
        }
        mesh.visible = true;
        mesh.position.copy(opts.from);
        this.scene.add(mesh);

        const defaultAlign = visual === 'spear' || visual === 'arrow';
        const defaultSpin = visual === 'stone' || visual === 'snowball' ? 8 : 0;
        this.active.push({
            mesh,
            visualKey,
            pos: opts.from.clone(),
            vel: opts.velocity.clone(),
            gravity: opts.gravity ? opts.gravity.clone() : this.gravityDefault.clone(),
            life: 0,
            maxLife: opts.maxLifeSec ?? 6,
            spin: opts.spin ?? defaultSpin,
            alignToVelocity: opts.alignToVelocity ?? defaultAlign,
            onHit: opts.onHit,
            active: true,
        });
    }

    update(dt: number): void {
        // Analytiske prosjektiler.
        for (const p of this.active) {
            if (!p.active) continue;
            const from = p.pos.clone(); // posisjon før dette steget (segment-start)
            p.vel.addScaledVector(p.gravity, dt);
            p.pos.addScaledVector(p.vel, dt);
            p.life += dt;
            // 1) Mål-treff (proximity langs steget) - har prioritet.
            let targetHit: ProjectileTargetRecord | null = null;
            for (const t of this.targets.values()) {
                if (distPointToSegment(from, p.pos, t.center) <= t.radius) {
                    targetHit = t;
                    break;
                }
            }
            if (targetHit) {
                targetHit.onHit(targetHit);
                p.onHit?.({ point: p.pos.clone(), target: targetHit });
                this.recycle(p);
                continue;
            }
            // 2) Bakke/vegg-treff via raycast langs steget.
            const dir = new THREE.Vector3().subVectors(p.pos, from);
            const dist = dir.length();
            if (dist > 1e-4) {
                dir.divideScalar(dist);
                const hit = this.physics.raycast(from, dir, dist);
                if (hit.hit) {
                    p.pos.copy(hit.point);
                    p.mesh.position.copy(p.pos);
                    p.onHit?.({ point: p.pos.clone(), target: null });
                    this.recycle(p);
                    continue;
                }
            }
            // 3) Oppdater visual.
            p.mesh.position.copy(p.pos);
            if (p.alignToVelocity && p.vel.lengthSq() > 0.01) {
                const look = new THREE.Vector3().copy(p.pos).add(p.vel);
                p.mesh.lookAt(look);
            } else if (p.spin) {
                p.mesh.rotation.x += p.spin * dt;
                p.mesh.rotation.y += p.spin * 0.6 * dt;
            }
            if (p.life > p.maxLife || p.pos.y < -60) this.recycle(p);
        }
        // Rydd inaktive fra listen.
        if (this.active.some((p) => !p.active)) {
            this.active = this.active.filter((p) => p.active);
        }

        // Sporede fysiske kast: sjekk segment mot mål.
        for (const tb of this.tracked) {
            tb.life += dt;
            const cur = tb.getPos();
            for (const t of this.targets.values()) {
                if (distPointToSegment(tb.prev, cur, t.center) <= t.radius) {
                    t.onHit(t);
                    tb.onHit(t);
                    tb.life = 999; // marker for fjerning
                    break;
                }
            }
            tb.prev.copy(cur);
        }
        if (this.tracked.some((tb) => tb.life > 8)) {
            this.tracked = this.tracked.filter((tb) => tb.life <= 8);
        }
    }

    private recycle(p: Projectile): void {
        p.active = false;
        this.scene.remove(p.mesh);
        if (p.visualKey !== 'custom') {
            const pool = this.pools.get(p.visualKey) ?? [];
            if (pool.length < 32) {
                p.mesh.visible = false;
                pool.push(p.mesh);
                this.pools.set(p.visualKey, pool);
                return;
            }
        }
        // Custom eller full pool: dispose helt.
        this.disposeMesh(p.mesh);
    }

    private disposeMesh(obj: THREE.Object3D): void {
        obj.traverse((o) => {
            const m = o as THREE.Mesh;
            if (m.geometry) m.geometry.dispose();
            const mat = (m as { material?: THREE.Material | THREE.Material[] }).material;
            if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((x) => x.dispose());
        });
    }

    dispose(): void {
        for (const p of this.active) {
            this.scene.remove(p.mesh);
            this.disposeMesh(p.mesh);
        }
        this.active = [];
        for (const pool of this.pools.values()) {
            for (const mesh of pool) this.disposeMesh(mesh);
        }
        this.pools.clear();
        this.targets.clear();
        this.tracked = [];
    }
}
