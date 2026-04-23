import * as THREE from 'three';
import type { CSM } from 'three/addons/csm/CSM.js';
import type { QualityTier } from './PostProcessingSystem';

// Fase 2.3: cascaded shadow maps via three/addons/csm. Kun aktiv hvis
// GameConfig.visual.shadows === 'cascaded' OG high-tier OG open-preset.
// CSM erstatter scenens DirectionalLight med 3 lys (en per kaskade) og
// krever at hvert material i scenen settes opp via setupMaterial(mat).
export class ShadowSystem {
    private csm: CSM | null = null;
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private tier: QualityTier;
    private registeredMaterials = new WeakSet<THREE.Material>();
    // Eksisterende sol-lys dimmes når CSM er aktiv for å unngå dobbel belysning.
    // Vi lagrer original-intensitet slik at dispose() kan gjenopprette den.
    private replacedSun: THREE.DirectionalLight | null = null;
    private replacedSunIntensity = 1;
    private replacedSunCastShadow = false;

    constructor(scene: THREE.Scene, camera: THREE.Camera, tier: QualityTier) {
        this.scene = scene;
        this.camera = camera;
        this.tier = tier;
    }

    async init(lightDirection: THREE.Vector3, existingSun: THREE.DirectionalLight | null = null): Promise<void> {
        if (this.tier !== 'high') return;
        try {
            const { CSM } = await import('three/addons/csm/CSM.js');
            this.csm = new CSM({
                camera: this.camera,
                parent: this.scene,
                cascades: 3,
                // Dekker hele tree-LOD-rangen (150m på high-tier) slik at skyggen
                // ikke forsvinner før treet uansett er byttet til billboard.
                maxFar: 160,
                mode: 'practical',
                shadowMapSize: 2048,
                shadowBias: -0.00015,
                lightDirection: lightDirection.clone().normalize().multiplyScalar(-1),
                lightIntensity: 1.2,
                lightMargin: 80,
            });
            // Dim eksisterende sol-lys slik at CSM-lysene ikke dobler opp belysningen.
            // Vi beholder referansen slik at dispose() restaurer tilstanden.
            if (existingSun) {
                this.replacedSun = existingSun;
                this.replacedSunIntensity = existingSun.intensity;
                this.replacedSunCastShadow = existingSun.castShadow;
                existingSun.intensity = 0;
                existingSun.castShadow = false;
            }
        } catch (e) {
            console.warn('CSM load failed:', e);
        }
    }

    // Må kalles for hvert material som skal motta CSM-skygger. Vi holder et
    // WeakSet for å unngå dobbel-setup (trygt selv på delte/cachede materialer).
    registerMaterial(material: THREE.Material | THREE.Material[]): void {
        if (!this.csm) return;
        const mats = Array.isArray(material) ? material : [material];
        for (const m of mats) {
            if (this.registeredMaterials.has(m)) continue;
            this.csm.setupMaterial(m);
            // CSM.setupMaterial overskriver onBeforeCompile. Hvis materialet hadde
            // en egen shader-mod (f.eks. vind på løvverk) må den rekjedes på toppen,
            // ellers mistes den ved shader-kompilering.
            const userMod = (m.userData as Record<string, unknown>)?._shaderMod as
                | ((shader: THREE.WebGLProgramParametersWithUniforms) => void)
                | undefined;
            if (userMod) {
                const csmOnBefore = m.onBeforeCompile;
                m.onBeforeCompile = (shader, renderer) => {
                    csmOnBefore.call(m, shader, renderer);
                    userMod(shader);
                };
            }
            this.registeredMaterials.add(m);
        }
    }

    // Traverserer scenen og registrerer alle MeshStandardMaterial. Kjøres ved
    // init-ferdigstilling og etter at setupScene har lagt til spill-spesifikke assets.
    registerSceneMaterials(): void {
        if (!this.csm) return;
        this.scene.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            if (mesh.material) this.registerMaterial(mesh.material);
        });
    }

    setLightDirection(dir: THREE.Vector3): void {
        if (!this.csm) return;
        // CSM forventer retningen som "fra sol til scene" — negert sunDir.
        this.csm.lightDirection.copy(dir).normalize().multiplyScalar(-1);
    }

    update(): void {
        this.csm?.update();
    }

    isActive(): boolean {
        return this.csm !== null;
    }

    dispose(): void {
        if (this.replacedSun) {
            this.replacedSun.intensity = this.replacedSunIntensity;
            this.replacedSun.castShadow = this.replacedSunCastShadow;
            this.replacedSun = null;
        }
        if (this.csm) {
            this.csm.remove();
            this.csm.dispose();
            this.csm = null;
        }
    }
}
