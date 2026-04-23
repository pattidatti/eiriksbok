import * as THREE from 'three';
import type { AABB2D, AnimalKind } from '../types';
import type { QualityTier } from './PostProcessingSystem';

// ─── Interne typer ───────────────────────────────────────────────────────────

interface BirdFlockEntry {
    mesh: THREE.InstancedMesh;
    count: number;
    center: THREE.Vector3;
    radius: number;
    altitude: number;
    altitudeSpread: number;
    phaseOffsets: Float32Array;
    speedOffsets: Float32Array;
}

interface ButterflyEntry {
    mesh: THREE.InstancedMesh;
    count: number;
    center: THREE.Vector3;
    radius: number;
    phaseOffsets: Float32Array;
    heightOffsets: Float32Array;
    material: THREE.MeshBasicMaterial;
}

interface AnimalState {
    wanderAngle: number;
    wanderTimer: number;
    speed: number;
    grazingTimer: number;
}

interface AnimalEntry {
    kind: AnimalKind;
    groups: THREE.Group[];
    states: AnimalState[];
    bounds: AABB2D;
}

// ─── Culling-grenser (kvadrert avstand) ──────────────────────────────────────

const CULL_SQ: Record<QualityTier, { bird: number; butterfly: number; animal: number }> = {
    low:    { bird: 3600,  butterfly: 625,  animal: 1600  },
    medium: { bird: 14400, butterfly: 2500, animal: 6400  },
    high:   { bird: 40000, butterfly: 6400, animal: 19600 },
};

// ─── Hjelpefunksjon for kryss-geometri (fugler) ──────────────────────────────

function buildBirdGeo(): THREE.BufferGeometry {
    // To kryss-plan: ett i XZ (vingespenn), ett i XY (kroppsprofil)
    const hw = 0.20; // halv bredde vingespenn
    const hh = 0.06; // halv hoyde vingespenn
    const bw = 0.06; // halv bredde kropp
    const bh = 0.075; // halv hoyde kropp

    // Verts: 4 per plan, 8 totalt
    // Plan 1 (XZ-plan - vingeplan)
    // Plan 2 (XY-plan - kropp)
    const positions = new Float32Array([
        // Plan 1 (XZ): y varierer litt for vingestilling
        -hw,  hh, 0,   hw,  hh, 0,   hw, -hh, 0,   -hw, -hh, 0,
        // Plan 2 (XY): z varierer
        -bw, bh, 0,   bw, bh, 0,   bw, -bh, 0,   -bw, -bh, 0,
    ]);

    const normals = new Float32Array([
        // Plan 1: normal peker opp/ned
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
        // Plan 2: normal peker inn/ut
        0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    ]);

    const uvs = new Float32Array([
        0, 1,  1, 1,  1, 0,  0, 0,
        0, 1,  1, 1,  1, 0,  0, 0,
    ]);

    const indices = new Uint16Array([
        // Plan 1 - to trekanter (begge sider)
        0, 1, 2,  0, 2, 3,
        2, 1, 0,  3, 2, 0,
        // Plan 2
        4, 5, 6,  4, 6, 7,
        6, 5, 4,  7, 6, 4,
    ]);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('normal',   new THREE.BufferAttribute(normals, 3));
    geo.setAttribute('uv',       new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    return geo;
}

// ─── Sommerfugl-geometri ─────────────────────────────────────────────────────

function buildButterflyGeo(): THREE.BufferGeometry {
    // Venstre vinge: tiltet 30 grader ut til venstre
    // Hoyre vinge: speilet
    const W = 0.22;
    const H = 0.16;
    const tilt = Math.sin(Math.PI / 6); // 30 graders tilt i Y

    const positions = new Float32Array([
        // Venstre vinge (4 hjorner, tiltet i YZ)
        -W, tilt * H,  -H,
        0,  0,           0,
        0,  0,           H,
        -W, tilt * H,   H * 0.1,

        // Hoyre vinge (speilet)
        W, tilt * H,  -H,
        0, 0,           0,
        0, 0,           H,
        W, tilt * H,   H * 0.1,
    ]);

    const normals = new Float32Array([
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    ]);

    const uvs = new Float32Array([
        0, 0,  0.5, 1,  0.5, 0,  0, 1,
        1, 0,  0.5, 1,  0.5, 0,  1, 1,
    ]);

    const indices = new Uint16Array([
        0, 1, 2,  0, 2, 3,  2, 1, 0,  3, 2, 0,
        4, 5, 6,  4, 6, 7,  6, 5, 4,  7, 6, 4,
    ]);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('normal',   new THREE.BufferAttribute(normals, 3));
    geo.setAttribute('uv',       new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    return geo;
}

// ─── Tilfeldig verdi ─────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

// ─── FaunaSystem ─────────────────────────────────────────────────────────────

export class FaunaSystem {
    private scene: THREE.Scene;
    private tier: QualityTier;
    private time = 0;
    private frameCount = 0;
    private cullSq: { bird: number; butterfly: number; animal: number };

    private flocks: BirdFlockEntry[] = [];
    private butterflies: ButterflyEntry[] = [];
    private animals: AnimalEntry[] = [];

    // Gjenbrukbare hjelpeobjekter - unnga allokering i update-loppa
    private tmpPos = new THREE.Vector3();
    private tmpQuat = new THREE.Quaternion();
    private tmpScale = new THREE.Vector3(1, 1, 1);
    private tmpMat = new THREE.Matrix4();

    // Delte materialer (cachet som klassefelt)
    private sheepBodyMat = new THREE.MeshLambertMaterial({ color: 0xeeeee0 });
    private cowBodyMat   = new THREE.MeshLambertMaterial({ color: 0xeeeedd });
    private birdMat      = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });

    private birdGeo: THREE.BufferGeometry;
    private butterflyGeo: THREE.BufferGeometry;

    constructor(scene: THREE.Scene, tier: QualityTier) {
        this.scene = scene;
        this.tier = tier;
        this.cullSq = CULL_SQ[tier];
        this.birdGeo = buildBirdGeo();
        this.butterflyGeo = buildButterflyGeo();
    }

    // ── Tier-baserte standardantall ───────────────────────────────────────────

    private tierBirds(override?: number): number {
        if (override !== undefined) return Math.min(override, 30);
        return this.tier === 'low' ? 6 : this.tier === 'medium' ? 12 : 18;
    }

    private tierButterflies(override?: number): number {
        if (override !== undefined) return Math.min(override, 20);
        return this.tier === 'low' ? 4 : this.tier === 'medium' ? 8 : 14;
    }

    private tierAnimals(kind: AnimalKind, override?: number): number {
        if (override !== undefined) return Math.min(override, 12);
        if (kind === 'sheep') return this.tier === 'low' ? 3 : this.tier === 'medium' ? 5 : 8;
        return this.tier === 'low' ? 2 : this.tier === 'medium' ? 4 : 6;
    }

    // ── Offentlig API ─────────────────────────────────────────────────────────

    addBirdFlock(
        center: [number, number, number],
        opts?: { count?: number; radius?: number; altitude?: number; altitudeSpread?: number }
    ): void {
        const count = this.tierBirds(opts?.count);
        const radius = opts?.radius ?? 12;
        const altitude = opts?.altitude ?? 18;
        const altitudeSpread = opts?.altitudeSpread ?? 2;

        const mesh = new THREE.InstancedMesh(this.birdGeo, this.birdMat, count);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.castShadow = false;
        this.scene.add(mesh);

        const phaseOffsets = new Float32Array(count);
        const speedOffsets = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            phaseOffsets[i] = (i / count) * Math.PI * 2 + rand(0, 0.4);
            speedOffsets[i] = rand(0.8, 1.2);
        }

        this.flocks.push({
            mesh,
            count,
            center: new THREE.Vector3(...center),
            radius,
            altitude,
            altitudeSpread,
            phaseOffsets,
            speedOffsets,
        });
    }

    addButterfly(
        center: [number, number, number],
        opts?: { count?: number; radius?: number; color?: number }
    ): void {
        const count = this.tierButterflies(opts?.count);
        const radius = opts?.radius ?? 5;
        const color = opts?.color ?? 0xff9933;

        const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
        const mesh = new THREE.InstancedMesh(this.butterflyGeo, mat, count);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.castShadow = false;
        this.scene.add(mesh);

        const phaseOffsets = new Float32Array(count);
        const heightOffsets = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            phaseOffsets[i] = rand(0, Math.PI * 2);
            heightOffsets[i] = rand(0.4, 1.8);
        }

        this.butterflies.push({
            mesh,
            count,
            center: new THREE.Vector3(...center),
            radius,
            phaseOffsets,
            heightOffsets,
            material: mat,
        });
    }

    addAnimalGroup(kind: AnimalKind, bounds: AABB2D, opts?: { count?: number }): void {
        const count = this.tierAnimals(kind, opts?.count);
        const groups: THREE.Group[] = [];
        const states: AnimalState[] = [];

        for (let i = 0; i < count; i++) {
            const group = kind === 'sheep' ? this.buildSheep() : this.buildCow();
            // Plasser tilfeldig innenfor AABB
            group.position.set(
                rand(bounds.minX, bounds.maxX),
                0,
                rand(bounds.minZ, bounds.maxZ)
            );
            group.rotation.y = rand(0, Math.PI * 2);
            this.scene.add(group);
            groups.push(group);

            states.push({
                wanderAngle: rand(0, Math.PI * 2),
                wanderTimer: rand(4, 12),
                speed: rand(0.3, 0.7),
                grazingTimer: 0,
            });
        }

        this.animals.push({ kind, groups, states, bounds });
    }

    // ── Bygging av dyr ────────────────────────────────────────────────────────

    private buildSheep(): THREE.Group {
        const group = new THREE.Group();
        const bodyMat = this.sheepBodyMat;

        // Kropp
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.55), bodyMat);
        body.position.set(0, 0.4, 0);
        body.castShadow = true;
        group.add(body);

        // Hode (litt morkt for kontrast)
        const headMat = new THREE.MeshLambertMaterial({ color: 0xbbbbaa });
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.3), headMat);
        head.position.set(0, 0.58, 0.36);
        group.add(head);

        // 4 bein
        const legMat = new THREE.MeshLambertMaterial({ color: 0x888878 });
        const legGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.35, 5);
        const legPositions: [number, number, number][] = [
            [-0.22, 0.175, -0.18],
            [ 0.22, 0.175, -0.18],
            [-0.22, 0.175,  0.18],
            [ 0.22, 0.175,  0.18],
        ];
        for (const pos of legPositions) {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(...pos);
            group.add(leg);
        }

        return group;
    }

    private buildCow(): THREE.Group {
        const group = new THREE.Group();
        const bodyMat = this.cowBodyMat;

        // Kropp
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.65, 0.7), bodyMat);
        body.position.set(0, 0.55, 0);
        body.castShadow = true;
        group.add(body);

        // Svart flekk (medium+ tier)
        if (this.tier !== 'low') {
            const patchMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
            const patch = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.72), patchMat);
            patch.position.set(rand(-0.2, 0.2), 0.56, 0);
            group.add(patch);
        }

        // Hode
        const headMat = new THREE.MeshLambertMaterial({ color: 0xddddcc });
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.35, 0.42), headMat);
        head.position.set(0, 0.76, 0.54);
        group.add(head);

        // Horn (kun high-tier)
        if (this.tier === 'high') {
            const hornMat = new THREE.MeshLambertMaterial({ color: 0xddccaa });
            const hornGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.22, 4);
            for (const side of [-1, 1]) {
                const horn = new THREE.Mesh(hornGeo, hornMat);
                horn.position.set(side * 0.15, 0.95, 0.5);
                horn.rotation.z = side * 0.4;
                group.add(horn);
            }
        }

        // 4 bein
        const legMat = new THREE.MeshLambertMaterial({ color: 0x776655 });
        const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.55, 5);
        const legPositions: [number, number, number][] = [
            [-0.35, 0.275, -0.25],
            [ 0.35, 0.275, -0.25],
            [-0.35, 0.275,  0.25],
            [ 0.35, 0.275,  0.25],
        ];
        for (const pos of legPositions) {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(...pos);
            group.add(leg);
        }

        return group;
    }

    // ── Oppdatering per frame ─────────────────────────────────────────────────

    update(dt: number, camera?: THREE.Camera): void {
        this.time += dt;
        this.frameCount++;

        const camPos = camera ? (camera as THREE.PerspectiveCamera).position : null;

        this.updateFlocks(camPos);
        this.updateButterflies(camPos);
        this.updateAnimals(dt, camPos);
    }

    private updateFlocks(camPos: THREE.Vector3 | null): void {
        const t = this.time;
        for (const flock of this.flocks) {
            // Culling
            if (camPos) {
                const dx = camPos.x - flock.center.x;
                const dz = camPos.z - flock.center.z;
                flock.mesh.visible = dx * dx + dz * dz < this.cullSq.bird;
            }
            if (!flock.mesh.visible) continue;

            for (let i = 0; i < flock.count; i++) {
                const phase = flock.phaseOffsets[i] + t * flock.speedOffsets[i] * 0.5;
                const x = flock.center.x + Math.cos(phase) * flock.radius;
                const z = flock.center.z + Math.sin(phase) * flock.radius * 0.6;
                const y = flock.altitude + Math.sin(phase * 2 + flock.phaseOffsets[i]) * flock.altitudeSpread;

                this.tmpPos.set(x, y, z);

                // Rotasjon: fuglnesen peker i bevegelsesretning
                const vx = -Math.sin(phase) * flock.speedOffsets[i];
                const vz =  Math.cos(phase) * flock.speedOffsets[i] * 0.6;
                const heading = Math.atan2(vx, vz);
                this.tmpQuat.setFromEuler(new THREE.Euler(0, heading, 0));

                this.tmpMat.compose(this.tmpPos, this.tmpQuat, this.tmpScale);
                flock.mesh.setMatrixAt(i, this.tmpMat);
            }
            flock.mesh.instanceMatrix.needsUpdate = true;
        }
    }

    private updateButterflies(camPos: THREE.Vector3 | null): void {
        const t = this.time;
        for (const bf of this.butterflies) {
            // Culling
            if (camPos) {
                const dx = camPos.x - bf.center.x;
                const dz = camPos.z - bf.center.z;
                bf.mesh.visible = dx * dx + dz * dz < this.cullSq.butterfly;
            }
            if (!bf.mesh.visible) continue;

            for (let i = 0; i < bf.count; i++) {
                const phase = bf.phaseOffsets[i];
                // Lissajous-sti for naturlig vandring
                const ox = Math.sin(t * 0.4 + phase) * bf.radius * 0.9;
                const oz = Math.cos(t * 0.27 + phase * 0.7) * bf.radius;
                const x = bf.center.x + ox;
                const z = bf.center.z + oz;
                // Vinge-flap: rotasjon rundt Z-aksen
                const flap = Math.sin(t * 6.0 + phase) * 0.65;
                const y = bf.center.y !== undefined ? bf.center.y + bf.heightOffsets[i] : bf.heightOffsets[i];

                this.tmpPos.set(x, y, z);
                this.tmpQuat.setFromEuler(new THREE.Euler(0, Math.atan2(ox, oz) + Math.PI, flap));
                this.tmpMat.compose(this.tmpPos, this.tmpQuat, this.tmpScale);
                bf.mesh.setMatrixAt(i, this.tmpMat);
            }
            bf.mesh.instanceMatrix.needsUpdate = true;
        }
    }

    private updateAnimals(dt: number, camPos: THREE.Vector3 | null): void {
        // Low-tier: oppdater hvert andre frame
        const skipFrame = this.tier === 'low' && this.frameCount % 2 !== 0;

        for (const entry of this.animals) {
            // Culling basert pa flokk-senter (AABB-midtpunkt)
            if (camPos) {
                const cx = (entry.bounds.minX + entry.bounds.maxX) * 0.5;
                const cz = (entry.bounds.minZ + entry.bounds.maxZ) * 0.5;
                const dx = camPos.x - cx;
                const dz = camPos.z - cz;
                const vis = dx * dx + dz * dz < this.cullSq.animal;
                for (const g of entry.groups) g.visible = vis;
                if (!vis) continue;
            }

            if (skipFrame) continue;

            for (let i = 0; i < entry.groups.length; i++) {
                const group = entry.groups[i];
                const state = entry.states[i];
                const { bounds } = entry;

                if (state.grazingTimer > 0) {
                    // Beiter - sta stille
                    state.grazingTimer -= dt;
                    continue;
                }

                if (state.wanderTimer <= 0) {
                    // Velg ny tilstand
                    if (Math.random() < 0.7) {
                        state.grazingTimer = rand(3, 8);
                        state.speed = 0;
                    } else {
                        state.wanderAngle = rand(0, Math.PI * 2);
                        state.speed = rand(0.4, 0.8);
                    }
                    state.wanderTimer = rand(4, 12);
                }

                state.wanderTimer -= dt;

                if (state.speed === 0) continue;

                // Flytt i wanderAngle-retning
                const dx = Math.sin(state.wanderAngle) * state.speed * dt;
                const dz = Math.cos(state.wanderAngle) * state.speed * dt;
                let nx = group.position.x + dx;
                let nz = group.position.z + dz;

                // Vegg-refleksjon
                if (nx < bounds.minX || nx > bounds.maxX) {
                    state.wanderAngle = Math.PI - state.wanderAngle;
                    nx = Math.max(bounds.minX, Math.min(bounds.maxX, nx));
                }
                if (nz < bounds.minZ || nz > bounds.maxZ) {
                    state.wanderAngle = -state.wanderAngle;
                    nz = Math.max(bounds.minZ, Math.min(bounds.maxZ, nz));
                }

                group.position.x = nx;
                group.position.z = nz;

                // Glatt rotasjon mot bevegelsesretning
                const targetY = Math.atan2(dx, dz);
                let diff = targetY - group.rotation.y;
                // Normaliser til -pi..pi
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                group.rotation.y += diff * Math.min(1, dt * 3);
            }
        }
    }

    // ── Opprydding ────────────────────────────────────────────────────────────

    dispose(): void {
        for (const flock of this.flocks) {
            this.scene.remove(flock.mesh);
            flock.mesh.geometry.dispose();
        }
        for (const bf of this.butterflies) {
            this.scene.remove(bf.mesh);
            bf.mesh.geometry.dispose();
            bf.material.dispose();
        }
        for (const entry of this.animals) {
            for (const group of entry.groups) {
                this.scene.remove(group);
                group.traverse((obj) => {
                    if (obj instanceof THREE.Mesh) {
                        obj.geometry.dispose();
                        if (!Array.isArray(obj.material)) obj.material.dispose();
                    }
                });
            }
        }
        this.flocks = [];
        this.butterflies = [];
        this.animals = [];

        // Cachet materialer
        this.sheepBodyMat.dispose();
        this.cowBodyMat.dispose();
        this.birdMat.dispose();
        this.birdGeo.dispose();
        this.butterflyGeo.dispose();
    }
}
