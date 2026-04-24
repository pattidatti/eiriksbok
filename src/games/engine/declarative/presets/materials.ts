import * as THREE from 'three';
import type { MaterialPresetName } from '../types';

// Material-presets: gir en MeshStandardMaterial med riktig PBR-tuning per preset.
// Tanken er at AI-agenter skriver `material: 'stone'` istedenfor å vurdere
// roughness/metalness/color selv.
//
// Implementasjonen er bevisst enkel: farge + roughness/metalness. Hvis spillet trenger
// teksturer, kan builders fortsatt kalle engine.getTexture() separat, men default
// er rene farger som ser OK ut på Chromebook-kvalitet.

export interface MaterialSpec {
    color: number;
    roughness: number;
    metalness: number;
    // Valgfri sekundærfarge for dekorative tweaks (ubrukt i MVP).
    secondary?: number;
}

export const MATERIAL_PRESETS: Record<MaterialPresetName, MaterialSpec> = {
    wood:       { color: 0x8b5a2b, roughness: 0.85, metalness: 0.05 },
    brick:      { color: 0xa85c44, roughness: 0.95, metalness: 0.02 },
    stone:      { color: 0x9a948c, roughness: 0.92, metalness: 0.02 },
    iron:       { color: 0x5a5a5e, roughness: 0.45, metalness: 0.85 },
    fabric:     { color: 0x9c6a4a, roughness: 0.98, metalness: 0.0 },
    parchment:  { color: 0xe8d8b0, roughness: 0.9, metalness: 0.0 },
    grass:      { color: 0x6b8e3d, roughness: 0.98, metalness: 0.0 },
    water:      { color: 0x3a6a8c, roughness: 0.2, metalness: 0.1 },
    plaster:    { color: 0xd8c8a8, roughness: 0.88, metalness: 0.0 },
    thatch:     { color: 0xa8894a, roughness: 0.95, metalness: 0.0 },
    marble:     { color: 0xe8e4dc, roughness: 0.35, metalness: 0.05 },
    dirt:       { color: 0x5a432a, roughness: 0.96, metalness: 0.0 },
};

/** Bygg et MeshStandardMaterial fra et preset-navn. Caches ikke; callers kan cache selv. */
export function createMaterial(
    preset: MaterialPresetName,
    overrides?: Partial<MaterialSpec>
): THREE.MeshStandardMaterial {
    const spec = MATERIAL_PRESETS[preset];
    if (!spec) {
        throw new Error(`[declarative] Ukjent material-preset: '${preset}'. Gyldige: ${Object.keys(MATERIAL_PRESETS).join(', ')}`);
    }
    const merged = { ...spec, ...overrides };
    return new THREE.MeshStandardMaterial({
        color: merged.color,
        roughness: merged.roughness,
        metalness: merged.metalness,
    });
}

/** Validering brukt av ConfigValidator. */
export function isValidMaterialPreset(name: string): name is MaterialPresetName {
    return name in MATERIAL_PRESETS;
}
