import * as THREE from 'three';

// Fase 1.5: infrastruktur for 3D-LUT color grading som post-processing-pass.
// I Fase 1 leverer vi kun 'neutral' (identity-LUT programmatisk generert).
// Senere faser legger til ekte LUT-er som 3D-texture eller tile-basert 2D-texture.

const LUT_SIZE = 32;

export type LutPreset = 'neutral';

export function buildLut(preset: LutPreset): THREE.Data3DTexture {
    if (preset === 'neutral') return buildIdentityLut();
    // Fremtidige preset ('warm-dawn', 'cold-dusk', ...) lastes fra public/engine/luts/*.png
    // i Fase 6 og kan erstattes asynkront via en ny loader.
    return buildIdentityLut();
}

function buildIdentityLut(): THREE.Data3DTexture {
    const size = LUT_SIZE;
    const data = new Uint8Array(size * size * size * 4);
    let p = 0;
    for (let b = 0; b < size; b++) {
        for (let g = 0; g < size; g++) {
            for (let r = 0; r < size; r++) {
                data[p++] = Math.round((r / (size - 1)) * 255);
                data[p++] = Math.round((g / (size - 1)) * 255);
                data[p++] = Math.round((b / (size - 1)) * 255);
                data[p++] = 255;
            }
        }
    }
    const tex = new THREE.Data3DTexture(data, size, size, size);
    tex.format = THREE.RGBAFormat;
    tex.type = THREE.UnsignedByteType;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapR = THREE.ClampToEdgeWrapping;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
}
