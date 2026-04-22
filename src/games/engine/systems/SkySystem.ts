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
    // Fase 2.4: IBL — prosedyral himmel rendres til PMREM envMap og settes som
    // scene.environment. Gir gratis reflekser på alle PBR-materialer.
    private pmrem: THREE.PMREMGenerator | null = null;
    private envMap: THREE.Texture | null = null;
    private iblEnabled = false;
    private lastIblSunDir = new THREE.Vector3();

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

    // Aktiverer IBL: prosedyral himmel bakes til envMap og settes på scenen.
    // Må kalles etter init() og får tak i renderer fra GameEngine.
    enableIbl(renderer: THREE.WebGLRenderer): void {
        this.pmrem = new THREE.PMREMGenerator(renderer);
        this.pmrem.compileEquirectangularShader();
        this.iblEnabled = true;
        this.regenerateEnvMap();
    }

    // Rebake envMap hvis solen har beveget seg vesentlig. Lettvekt-sjekk i
    // setSunDirection — full render av skyen er ~2-3ms på low-tier.
    private regenerateEnvMap(): void {
        if (!this.iblEnabled || !this.pmrem || !this.sky) return;
        // Bygg en midlertidig scene som bare inneholder skyen, render til envMap
        const tempScene = new THREE.Scene();
        tempScene.add(this.sky);
        const newMap = this.pmrem.fromScene(tempScene, 0.04).texture;
        tempScene.remove(this.sky);
        this.scene.add(this.sky);
        if (this.envMap) this.envMap.dispose();
        this.envMap = newMap;
        this.scene.environment = newMap;
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
        // IBL: rebake envMap hvis solen har beveget seg merkbart (>~5 grader).
        // dot(prev, new) < 0.995 ≈ 5.7° endring.
        if (this.iblEnabled) {
            const moved = this.lastIblSunDir.lengthSq() === 0
                || this.lastIblSunDir.dot(dir) < 0.995;
            if (moved) {
                this.lastIblSunDir.copy(dir);
                this.regenerateEnvMap();
            }
        }
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
        if (this.envMap) {
            this.envMap.dispose();
            this.envMap = null;
        }
        if (this.pmrem) {
            this.pmrem.dispose();
            this.pmrem = null;
        }
        if (this.iblEnabled) {
            this.scene.environment = null;
            this.iblEnabled = false;
        }
        if (this.previousBackground) {
            this.scene.background = this.previousBackground;
            this.previousBackground = null;
        }
    }
}
