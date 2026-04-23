import * as THREE from 'three';

interface WaveComponent {
    amplitude: number;
    frequency: number; // 1/enhet
    speed: number;     // rad/sek
    dirX: number;
    dirZ: number;
    phase: number;
}

// Tre stablede sinusbølger som gir organisk hav. Lett nok for Chromebook.
const WAVES: WaveComponent[] = [
    { amplitude: 0.35, frequency: 0.12, speed: 0.7, dirX: 1.0, dirZ: 0.2, phase: 0.0 },
    { amplitude: 0.22, frequency: 0.25, speed: 1.1, dirX: -0.4, dirZ: 1.0, phase: 1.3 },
    { amplitude: 0.12, frequency: 0.5, speed: 1.9, dirX: 0.7, dirZ: -0.7, phase: 2.7 },
];

export interface OceanOptions {
    size?: number;       // verden-enheter per side
    segments?: number;   // vertex-oppløsning per side
    color?: number;
    center?: [number, number];
}

export class OceanSystem {
    mesh: THREE.Mesh;
    private scene: THREE.Scene;
    private geometry: THREE.PlaneGeometry;
    private basePositions: Float32Array;
    private time = 0;
    private segments: number;
    private size: number;

    constructor(scene: THREE.Scene, toonMat: (c: number, o?: Record<string, unknown>) => THREE.MeshStandardMaterial, opts: OceanOptions = {}) {
        this.scene = scene;
        this.size = opts.size ?? 200;
        this.segments = opts.segments ?? 64;
        const color = opts.color ?? 0x2b4a66;

        this.geometry = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments);
        this.geometry.rotateX(-Math.PI / 2);

        const pos = this.geometry.attributes.position.array as Float32Array;
        this.basePositions = new Float32Array(pos.length);
        this.basePositions.set(pos);

        const material = toonMat(color, { transparent: false });
        this.mesh = new THREE.Mesh(this.geometry, material);
        this.mesh.position.set(opts.center?.[0] ?? 0, -0.1, opts.center?.[1] ?? 0);
        this.mesh.receiveShadow = true;
        scene.add(this.mesh);
    }

    // Analytisk bølgehøyde - brukes både av vertex-oppdatering og båt-vugging.
    getWaveHeight(x: number, z: number): number {
        let h = 0;
        for (const w of WAVES) {
            const d = w.dirX * x + w.dirZ * z;
            h += w.amplitude * Math.sin(d * w.frequency + this.time * w.speed + w.phase);
        }
        return h;
    }

    update(dt: number): void {
        this.time += dt;
        const pos = this.geometry.attributes.position.array as Float32Array;
        const base = this.basePositions;
        const cx = this.mesh.position.x;
        const cz = this.mesh.position.z;
        for (let i = 0; i < pos.length; i += 3) {
            const x = base[i] + cx;
            const z = base[i + 2] + cz;
            pos[i + 1] = base[i + 1] + this.getWaveHeight(x, z);
        }
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeVertexNormals();
    }

    // Brukt av båt: returner yaw+roll som følger bølgeflaten.
    getWaveTilt(x: number, z: number, spacing = 3): { roll: number; pitch: number; height: number } {
        const h = this.getWaveHeight(x, z);
        const hL = this.getWaveHeight(x - spacing, z);
        const hR = this.getWaveHeight(x + spacing, z);
        const hF = this.getWaveHeight(x, z - spacing);
        const hB = this.getWaveHeight(x, z + spacing);
        const roll = Math.atan2(hR - hL, spacing * 2) * 0.6;
        const pitch = Math.atan2(hB - hF, spacing * 2) * 0.6;
        return { roll, pitch, height: h };
    }

    setVisible(v: boolean): void {
        this.mesh.visible = v;
    }

    dispose(): void {
        this.scene.remove(this.mesh);
        this.geometry.dispose();
        const mat = this.mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) {
            for (const m of mat) m.dispose();
        } else {
            mat.dispose();
        }
    }
}

// Enkel skumskyer-system - små hvite partikler langs båtens skrog.
export class FoamSystem {
    private points: THREE.Points;
    private scene: THREE.Scene;
    private particles: { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; maxLife: number }[] = [];
    private geometry: THREE.BufferGeometry;
    private positions: Float32Array;
    private getOrigin: () => { x: number; y: number; z: number };

    constructor(scene: THREE.Scene, getOrigin: () => { x: number; y: number; z: number }, max = 80) {
        this.scene = scene;
        this.getOrigin = getOrigin;
        this.positions = new Float32Array(max * 3);
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.18,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true,
            depthWrite: false,
        });
        this.points = new THREE.Points(this.geometry, mat);
        scene.add(this.points);
        for (let i = 0; i < max; i++) {
            this.particles.push({ x: 0, y: -5, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1 });
        }
    }

    update(dt: number): void {
        const origin = this.getOrigin();
        const spawnRate = 0.4; // sannsynlighet per frame
        for (const p of this.particles) {
            if (p.life > 0) {
                p.life -= dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt - 0.5 * dt;
                p.z += p.vz * dt;
            } else if (Math.random() < spawnRate * dt * 30) {
                // Respawn nær båt
                const ang = Math.random() * Math.PI * 2;
                const r = 1.2 + Math.random() * 0.5;
                p.x = origin.x + Math.cos(ang) * r;
                p.y = origin.y + 0.2;
                p.z = origin.z + Math.sin(ang) * r;
                p.vx = Math.cos(ang) * 0.5;
                p.vy = 0.3 + Math.random() * 0.3;
                p.vz = Math.sin(ang) * 0.5;
                p.maxLife = 0.8 + Math.random() * 0.5;
                p.life = p.maxLife;
            }
        }
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.positions[i * 3] = p.x;
            this.positions[i * 3 + 1] = p.life > 0 ? p.y : -1000;
            this.positions[i * 3 + 2] = p.z;
        }
        this.geometry.attributes.position.needsUpdate = true;
    }

    setVisible(v: boolean): void {
        this.points.visible = v;
    }

    dispose(): void {
        this.scene.remove(this.points);
        this.geometry.dispose();
        const mat = this.points.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) {
            for (const m of mat) m.dispose();
        } else {
            mat.dispose();
        }
        this.particles = [];
    }
}
