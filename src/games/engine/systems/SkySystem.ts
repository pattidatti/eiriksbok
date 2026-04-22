import * as THREE from 'three';

interface SkyLike extends THREE.Mesh {
    material: THREE.ShaderMaterial & {
        uniforms: {
            turbidity: { value: number };
            rayleigh: { value: number };
            mieCoefficient: { value: number };
            mieDirectionalG: { value: number };
            sunPosition: { value: THREE.Vector3 };
            up: { value: THREE.Vector3 };
        };
    };
}

export interface SkyOptions {
    turbidity?: number;
    rayleigh?: number;
    mieCoefficient?: number;
    mieDirectionalG?: number;
    scale?: number;
}

// Procedural sky basert på three/addons/objects/Sky. Lazy-loadet for å unngå at
// innendørs-spill trenger å laste shaderen.
export class SkySystem {
    private scene: THREE.Scene;
    private sky: SkyLike | null = null;
    private opts: Required<SkyOptions>;
    private sunPos = new THREE.Vector3(0, 50, 100);
    private pendingSunDir: THREE.Vector3 | null = null;
    private previousBackground: THREE.Color | THREE.Texture | null = null;

    constructor(scene: THREE.Scene, opts: SkyOptions = {}) {
        this.scene = scene;
        this.opts = {
            turbidity: opts.turbidity ?? 8,
            rayleigh: opts.rayleigh ?? 2.5,
            mieCoefficient: opts.mieCoefficient ?? 0.005,
            mieDirectionalG: opts.mieDirectionalG ?? 0.8,
            scale: opts.scale ?? 1500,
        };
    }

    async init(): Promise<void> {
        try {
            const { Sky } = await import('three/addons/objects/Sky.js');
            const sky = new Sky() as unknown as SkyLike;
            sky.scale.setScalar(this.opts.scale);
            const u = sky.material.uniforms;
            u.turbidity.value = this.opts.turbidity;
            u.rayleigh.value = this.opts.rayleigh;
            u.mieCoefficient.value = this.opts.mieCoefficient;
            u.mieDirectionalG.value = this.opts.mieDirectionalG;
            this.previousBackground = (this.scene.background as THREE.Color | THREE.Texture | null) ?? null;
            this.scene.add(sky);
            this.sky = sky;
            if (this.pendingSunDir) {
                this.setSunDirection(this.pendingSunDir);
                this.pendingSunDir = null;
            }
        } catch (e) {
            console.warn('SkySystem unavailable:', e);
        }
    }

    setSunDirection(dir: THREE.Vector3): void {
        if (!this.sky) {
            this.pendingSunDir = dir.clone();
            return;
        }
        // sunPosition forventes i samme retning som lyset (relativ posisjon på en kuleskall).
        this.sunPos.copy(dir).normalize().multiplyScalar(450);
        this.sky.material.uniforms.sunPosition.value.copy(this.sunPos);
    }

    isReady(): boolean {
        return this.sky !== null;
    }

    dispose(): void {
        if (this.sky) {
            this.scene.remove(this.sky);
            this.sky.geometry.dispose();
            (this.sky.material as THREE.Material).dispose();
            this.sky = null;
        }
        if (this.previousBackground) {
            this.scene.background = this.previousBackground;
            this.previousBackground = null;
        }
    }
}
