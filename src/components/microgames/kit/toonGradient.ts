import * as THREE from 'three';

// Delt firetrinns gråtonerampe for toon-shading (storybook-look). Cachet - én
// tekstur deles av alle mikrospill. Brukes som gradientMap på meshToonMaterial.
let _gradient: THREE.DataTexture | null = null;

export function toonGradientMap(): THREE.DataTexture {
    if (_gradient) return _gradient;
    const steps = new Uint8Array([90, 150, 205, 255]);
    const tex = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
    tex.needsUpdate = true;
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    _gradient = tex;
    return tex;
}
