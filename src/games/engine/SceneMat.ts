import * as THREE from 'three';
import type { MaterialPreset, SceneMatOpts, ColorGrading } from './types';

// Shared material cache (Fase 1.1). Populert i createSceneMat og GameEngine.toonMat.
// Eksponert for debug-HUD og for dispose-hygiene.
const materialCache = new Map<string, THREE.MeshStandardMaterial>();

export function getMaterialCacheSize(): number {
    return materialCache.size;
}

export function disposeMaterialCache(): void {
    for (const mat of materialCache.values()) mat.dispose();
    materialCache.clear();
}

function cacheKey(color: number, opts: SceneMatOpts, grading: ColorGrading | undefined): string | null {
    // Hopp over cache hvis noe texture er satt — textures har identitet som ikke er hashbar trygt.
    if (opts.map !== undefined) return null;
    if (opts.normalMap !== undefined) return null;
    if (opts.roughnessMap !== undefined) return null;
    if (opts.metalnessMap !== undefined) return null;
    if (opts.aoMap !== undefined) return null;
    return [
        color,
        opts.preset ?? '',
        opts.roughness ?? '',
        opts.metalness ?? '',
        opts.emissive ?? '',
        opts.emissiveIntensity ?? '',
        opts.transparent ?? '',
        opts.opacity ?? '',
        opts.side ?? '',
        grading ?? '',
    ].join('|');
}

const PRESETS: Record<MaterialPreset, { roughness: number; metalness: number }> = {
    stone:  { roughness: 0.95, metalness: 0.0 },
    wood:   { roughness: 0.85, metalness: 0.0 },
    cloth:  { roughness: 0.92, metalness: 0.0 },
    metal:  { roughness: 0.40, metalness: 0.85 },
    leaf:   { roughness: 0.68, metalness: 0.0 },
    water:  { roughness: 0.20, metalness: 0.0 },
    soil:   { roughness: 1.00, metalness: 0.0 },
};

// Color-grading shifts color HSL slightly so all materials in a scene get a tint
// uten at vi må endre hvert eneste materialdef.
function applyGrading(color: THREE.Color, grading: ColorGrading | undefined): THREE.Color {
    if (!grading || grading === 'neutral') return color;
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);
    switch (grading) {
        case 'warm':
            hsl.h = (hsl.h + 0.02) % 1;
            hsl.s = Math.min(1, hsl.s * 1.05);
            break;
        case 'cold':
            hsl.h = (hsl.h - 0.04 + 1) % 1;
            hsl.s = Math.max(0, hsl.s * 0.92);
            break;
        case 'sepia':
            hsl.h = 0.08;
            hsl.s = 0.35;
            hsl.l = Math.min(1, hsl.l * 1.05);
            break;
        case 'dawn':
            hsl.h = (hsl.h + 0.03) % 1;
            hsl.s = Math.min(1, hsl.s * 1.08);
            hsl.l = Math.min(1, hsl.l * 1.04);
            break;
        case 'dusk':
            hsl.h = (hsl.h + 0.05) % 1;
            hsl.s = Math.min(1, hsl.s * 1.1);
            hsl.l = Math.max(0, hsl.l * 0.95);
            break;
    }
    color.setHSL(hsl.h, hsl.s, hsl.l);
    return color;
}

export function createSceneMat(
    color: number,
    opts: SceneMatOpts = {},
    grading?: ColorGrading,
): THREE.MeshStandardMaterial {
    const key = cacheKey(color, opts, grading);
    if (key !== null) {
        const cached = materialCache.get(key);
        if (cached) return cached;
    }

    const preset = opts.preset ? PRESETS[opts.preset] : { roughness: 0.8, metalness: 0.0 };
    const roughness = opts.roughness ?? preset.roughness;
    const metalness = opts.metalness ?? preset.metalness;

    const baseColor = new THREE.Color(color);
    applyGrading(baseColor, grading);

    const params: THREE.MeshStandardMaterialParameters = {
        color: baseColor,
        roughness,
        metalness,
    };
    if (opts.map !== undefined) params.map = opts.map as THREE.Texture;
    if (opts.normalMap !== undefined) params.normalMap = opts.normalMap as THREE.Texture;
    if (opts.roughnessMap !== undefined) params.roughnessMap = opts.roughnessMap as THREE.Texture;
    if (opts.metalnessMap !== undefined) params.metalnessMap = opts.metalnessMap as THREE.Texture;
    if (opts.aoMap !== undefined) params.aoMap = opts.aoMap as THREE.Texture;
    if (opts.transparent !== undefined) params.transparent = opts.transparent;
    if (opts.opacity !== undefined) params.opacity = opts.opacity;
    if (opts.side !== undefined) params.side = opts.side as THREE.Side;
    if (opts.emissive !== undefined) params.emissive = new THREE.Color(opts.emissive);
    if (opts.emissiveIntensity !== undefined) params.emissiveIntensity = opts.emissiveIntensity;

    const mat = new THREE.MeshStandardMaterial(params);
    if (opts.mapRepeat) {
        const [rx, ry] = opts.mapRepeat;
        for (const t of [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap, mat.aoMap]) {
            if (t) {
                t.wrapS = THREE.RepeatWrapping;
                t.wrapT = THREE.RepeatWrapping;
                t.repeat.set(rx, ry);
            }
        }
    }
    if (key !== null) materialCache.set(key, mat);
    return mat;
}

// Enkel toon-ish MeshStandardMaterial for bakoverkompatibilitet med det gamle toonMat-API-et.
// Inngår i samme cache som createSceneMat når argumentene er identiske.
export function createToonLikeMat(
    color: number,
    opts: Record<string, unknown> = {},
): THREE.MeshStandardMaterial {
    const sceneOpts: SceneMatOpts = {
        roughness: typeof opts.roughness === 'number' ? opts.roughness : 0.8,
        metalness: typeof opts.metalness === 'number' ? opts.metalness : 0.0,
    };
    if (typeof opts.transparent === 'boolean') sceneOpts.transparent = opts.transparent;
    if (typeof opts.opacity === 'number') sceneOpts.opacity = opts.opacity;
    if (typeof opts.side === 'number') sceneOpts.side = opts.side;
    if (typeof opts.emissive === 'number') sceneOpts.emissive = opts.emissive;
    if (typeof opts.emissiveIntensity === 'number') sceneOpts.emissiveIntensity = opts.emissiveIntensity;
    if (opts.map !== undefined) sceneOpts.map = opts.map;
    if (opts.normalMap !== undefined) sceneOpts.normalMap = opts.normalMap;
    if (opts.roughnessMap !== undefined) sceneOpts.roughnessMap = opts.roughnessMap;
    if (opts.metalnessMap !== undefined) sceneOpts.metalnessMap = opts.metalnessMap;
    if (opts.aoMap !== undefined) sceneOpts.aoMap = opts.aoMap;
    if (Array.isArray(opts.mapRepeat) && opts.mapRepeat.length === 2) {
        sceneOpts.mapRepeat = opts.mapRepeat as [number, number];
    }
    return createSceneMat(color, sceneOpts, undefined);
}
