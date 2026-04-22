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

    constructor(scene: THREE.Scene, camera: THREE.Camera, tier: QualityTier) {
        this.scene = scene;
        this.camera = camera;
        this.tier = tier;
    }

    async init(lightDirection: THREE.Vector3): Promise<void> {
        if (this.tier !== 'high') return;
        try {
            const { CSM } = await import('three/addons/csm/CSM.js');
            this.csm = new CSM({
                camera: this.camera,
                parent: this.scene,
                cascades: 3,
                maxFar: 120,
                mode: 'practical',
                shadowMapSize: 2048,
                shadowBias: -0.00015,
                lightDirection: lightDirection.clone().normalize().multiplyScalar(-1),
                lightIntensity: 1.2,
                lightMargin: 80,
            });
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
        if (this.csm) {
            this.csm.remove();
            this.csm.dispose();
            this.csm = null;
        }
    }
}
