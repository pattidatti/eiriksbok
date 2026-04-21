import * as THREE from 'three';

interface Particle {
    mesh: THREE.Mesh;
    life: number;
    maxLife: number;
    vx: number;
    vy: number;
    vz: number;
}

export class DustSystem {
    private geometry: THREE.BufferGeometry;
    private positions: Float32Array;
    private velocities: Float32Array;
    private readonly count: number;
    private readonly roomSize: number;
    private readonly wallHeight: number;

    constructor(scene: THREE.Scene, count = 250, roomSize = 20, wallHeight = 6) {
        this.count = count;
        this.roomSize = roomSize;
        this.wallHeight = wallHeight;

        this.positions = new Float32Array(count * 3);
        this.velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            this.positions[i * 3] = (Math.random() - 0.5) * roomSize;
            this.positions[i * 3 + 1] = Math.random() * wallHeight;
            this.positions[i * 3 + 2] = (Math.random() - 0.5) * roomSize;
            this.velocities[i * 3] = (Math.random() - 0.5) * 0.1;
            this.velocities[i * 3 + 1] = 0.02 + Math.random() * 0.04;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xffeedd,
            size: 0.06,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        scene.add(new THREE.Points(this.geometry, mat));
    }

    update(dt: number): void {
        const pos = this.positions;
        const vel = this.velocities;
        const hw = this.roomSize / 2;

        for (let i = 0; i < this.count; i++) {
            pos[i * 3] += vel[i * 3] * dt;
            pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
            pos[i * 3 + 2] += vel[i * 3 + 2] * dt;

            vel[i * 3] += (Math.random() - 0.5) * 0.02;
            vel[i * 3 + 2] += (Math.random() - 0.5) * 0.02;
            vel[i * 3] *= 0.99;
            vel[i * 3 + 2] *= 0.99;

            if (pos[i * 3 + 1] > this.wallHeight) pos[i * 3 + 1] = 0;
            if (Math.abs(pos[i * 3]) > hw) pos[i * 3] *= -0.5;
            if (Math.abs(pos[i * 3 + 2]) > hw) pos[i * 3 + 2] *= -0.5;
        }

        this.geometry.attributes.position.needsUpdate = true;
    }
}

export class SparkSystem {
    private sparks: Particle[] = [];

    constructor(scene: THREE.Scene, count = 25) {
        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.025, 4, 4),
                new THREE.MeshBasicMaterial({ color: 0xff8833 })
            );
            mesh.visible = false;
            scene.add(mesh);
            this.sparks.push({ mesh, life: 0, maxLife: 0, vx: 0, vy: 0, vz: 0 });
        }
    }

    update(dt: number, sourceX: number, sourceZ: number): void {
        for (const s of this.sparks) {
            s.life -= dt;
            if (s.life <= 0) {
                if (Math.random() < 0.15) {
                    s.mesh.visible = true;
                    s.mesh.position.set(
                        sourceX + (Math.random() - 0.5) * 0.8,
                        1.8,
                        sourceZ + (Math.random() - 0.5) * 0.8
                    );
                    s.vx = (Math.random() - 0.5) * 1.5;
                    s.vy = 2 + Math.random() * 2;
                    s.vz = (Math.random() - 0.5) * 1.5;
                    s.maxLife = 0.5 + Math.random() * 0.8;
                    s.life = s.maxLife;
                } else {
                    s.mesh.visible = false;
                }
            } else {
                s.mesh.position.x += s.vx * dt;
                s.mesh.position.y += s.vy * dt;
                s.mesh.position.z += s.vz * dt;
                s.vy -= 3 * dt;
                const t = s.life / s.maxLife;
                (s.mesh.material as THREE.MeshBasicMaterial).opacity = t;
                s.mesh.scale.setScalar(t * 0.8 + 0.2);
            }
        }
    }
}

export class SteamSystem {
    private particles: Array<{
        mesh: THREE.Mesh;
        life: number;
        maxLife: number;
        vx: number;
        vy: number;
    }> = [];

    constructor(scene: THREE.Group | THREE.Scene, count = 35) {
        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
            );
            mesh.visible = false;
            scene.add(mesh);
            this.particles.push({ mesh, life: 0, maxLife: 0, vx: 0, vy: 0 });
        }
    }

    update(
        dt: number,
        speed: number,
        hasBoiler: boolean,
        hasCondenser: boolean,
        boilerX: number,
        condenserX: number
    ): void {
        for (const p of this.particles) {
            p.life -= dt;
            if (p.life <= 0) {
                const src = Math.random();
                if (src < 0.5 && hasBoiler) {
                    p.mesh.position.set(boilerX, 1.9, (Math.random() - 0.5) * 0.3);
                    p.vx = 0.5 + Math.random() * 0.3;
                    p.vy = 0.2 + Math.random() * 0.4;
                } else if (hasCondenser) {
                    p.mesh.position.set(condenserX + (Math.random() - 0.5) * 0.3, 1.5, (Math.random() - 0.5) * 0.2);
                    p.vx = (Math.random() - 0.5) * 0.2;
                    p.vy = 0.5 + Math.random() * 0.5;
                } else {
                    p.mesh.visible = false;
                    continue;
                }
                p.maxLife = 1.5 + Math.random() * 0.5;
                p.life = p.maxLife;
                p.mesh.visible = true;
                p.mesh.scale.setScalar(0.3 + Math.random() * 0.3);
            } else {
                p.mesh.position.x += p.vx * dt;
                p.mesh.position.y += p.vy * dt;
                const t = p.life / p.maxLife;
                (p.mesh.material as THREE.MeshBasicMaterial).opacity = t * 0.6 * speed;
                p.mesh.scale.multiplyScalar(1 + dt * 0.5);
            }
        }
    }
}
