import * as THREE from 'three';

// Fase 5.1: pre-lasting av GLTF-modeller definert i GameConfig.assets.defs.
// GLTFLoader og DRACOLoader lazy-importeres slik at spill uten assets ikke
// drar inn ~50 KB loader-kode.

export type AssetKind = 'gltf' | 'texture';

export interface AssetDef {
    id: string;
    url: string;
    kind?: AssetKind; // default utledes fra filending (.glb/.gltf → gltf, ellers texture)
}

export interface AssetsConfig {
    defs: AssetDef[];
    /** Bruker DRACO-komprimerte GLTF. Krever at decoder-filer ligger under public/draco/. */
    draco?: boolean;
}

type LoadedAsset = THREE.Group | THREE.Texture;

function inferKind(def: AssetDef): AssetKind {
    if (def.kind) return def.kind;
    return /\.(glb|gltf)$/i.test(def.url) ? 'gltf' : 'texture';
}

export class AssetLoader {
    private cache = new Map<string, LoadedAsset>();
    private ownedTextures = new Set<THREE.Texture>();
    private ownedMaterials = new Set<THREE.Material>();
    private ownedGeometries = new Set<THREE.BufferGeometry>();

    async preload(config: AssetsConfig, onProgress?: (pct: number) => void): Promise<void> {
        const defs = config.defs;
        if (!defs || defs.length === 0) return;

        // Lazy-import loaders. GLTFLoader er ES-module; SkeletonUtils trengs kun ved clone().
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const gltfLoader = new GLTFLoader();

        if (config.draco) {
            const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
            const draco = new DRACOLoader();
            draco.setDecoderPath('/draco/');
            gltfLoader.setDRACOLoader(draco);
        }

        const textureLoader = new THREE.TextureLoader();

        let done = 0;
        const total = defs.length;
        const reportProgress = () => onProgress?.(done / total);

        await Promise.all(defs.map(async (def) => {
            const kind = inferKind(def);
            try {
                if (kind === 'gltf') {
                    const gltf = await gltfLoader.loadAsync(def.url);
                    this.cache.set(def.id, gltf.scene);
                    this.trackResources(gltf.scene);
                } else {
                    const tex = await textureLoader.loadAsync(def.url);
                    tex.colorSpace = THREE.SRGBColorSpace;
                    this.cache.set(def.id, tex);
                    this.ownedTextures.add(tex);
                }
            } catch (err) {
                console.warn(`[AssetLoader] kunne ikke laste '${def.id}' (${def.url}):`, err);
            } finally {
                done++;
                reportProgress();
            }
        }));
    }

    private trackResources(root: THREE.Object3D): void {
        root.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            if (mesh.geometry) this.ownedGeometries.add(mesh.geometry);
            const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
            if (!mat) return;
            const mats = Array.isArray(mat) ? mat : [mat];
            for (const m of mats) {
                this.ownedMaterials.add(m);
                // Registrer også eventuelle bundne texturer
                for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap']) {
                    const tex = (m as unknown as Record<string, unknown>)[key];
                    if (tex instanceof THREE.Texture) this.ownedTextures.add(tex);
                }
            }
        });
    }

    get(id: string): LoadedAsset | null {
        return this.cache.get(id) ?? null;
    }

    /**
     * Klon en GLTF-scene. Bruker SkeletonUtils.clone når scenen har SkinnedMesh-er
     * slik at rigger deles riktig. For enkle modeller er vanlig .clone() mye raskere.
     */
    async clone(id: string): Promise<THREE.Object3D | null> {
        const asset = this.cache.get(id);
        if (!asset) return null;
        if (asset instanceof THREE.Texture) {
            return null; // Texturer klones ikke — bruk get() og bind til et eget material.
        }

        let hasSkinned = false;
        asset.traverse((obj) => {
            if ((obj as THREE.SkinnedMesh).isSkinnedMesh) hasSkinned = true;
        });
        if (hasSkinned) {
            const { clone: skeletonClone } = await import('three/examples/jsm/utils/SkeletonUtils.js');
            return skeletonClone(asset);
        }
        return asset.clone(true);
    }

    dispose(): void {
        for (const g of this.ownedGeometries) g.dispose();
        for (const m of this.ownedMaterials) m.dispose();
        for (const t of this.ownedTextures) t.dispose();
        this.ownedGeometries.clear();
        this.ownedMaterials.clear();
        this.ownedTextures.clear();
        this.cache.clear();
    }
}
