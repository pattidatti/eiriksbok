import * as THREE from 'three';
import type { MaterialPreset, SceneMatOpts, ColorGrading } from './types';

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
    if (opts.transparent !== undefined) params.transparent = opts.transparent;
    if (opts.opacity !== undefined) params.opacity = opts.opacity;
    if (opts.side !== undefined) params.side = opts.side as THREE.Side;
    if (opts.emissive !== undefined) params.emissive = new THREE.Color(opts.emissive);
    if (opts.emissiveIntensity !== undefined) params.emissiveIntensity = opts.emissiveIntensity;

    return new THREE.MeshStandardMaterial(params);
}
