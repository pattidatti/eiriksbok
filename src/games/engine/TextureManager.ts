import * as THREE from 'three';

// Fase 2.1: enkel runtime texture-generator for PBR-materialer. Lager
// prosedyrale normal/roughness/AO-maps per material-preset, uten å kreve
// eksterne asset-filer. Ekte PNG/JPG-textures kan lastes inn i senere faser
// via samme API (engine.getTexture(id)) ved å erstatte buildTexture().

export type TextureKind = 'normal' | 'roughness' | 'ao';
export type TexturePreset = 'stone' | 'wood' | 'cloth' | 'metal' | 'soil' | 'leaf';

const CACHE = new Map<string, THREE.Texture>();

export function getProceduralTexture(preset: TexturePreset, kind: TextureKind): THREE.Texture {
    const key = `${preset}:${kind}`;
    const cached = CACHE.get(key);
    if (cached) return cached;
    const tex = buildTexture(preset, kind);
    CACHE.set(key, tex);
    return tex;
}

export function disposeTextureCache(): void {
    for (const tex of CACHE.values()) tex.dispose();
    CACHE.clear();
}

function buildTexture(preset: TexturePreset, kind: TextureKind): THREE.Texture {
    const SIZE = 256;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d')!;
    const img = ctx.createImageData(SIZE, SIZE);
    const data = img.data;
    fillTexture(data, SIZE, preset, kind);
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    if (kind === 'normal') {
        tex.colorSpace = THREE.NoColorSpace;
    } else {
        tex.colorSpace = THREE.NoColorSpace;
    }
    return tex;
}

// Deterministisk hash → 0-1 slik at samme (x,y) gir samme verdi per tekstur.
function hash(x: number, y: number, seed: number): number {
    let h = x * 374761393 + y * 668265263 + seed * 2147483647;
    h = (h ^ (h >>> 13)) * 1274126177;
    h = h ^ (h >>> 16);
    return ((h >>> 0) % 100000) / 100000;
}

// Lavpass-filtrert støy: gjennomsnitt av 3x3-naboer gir mykere pattern.
function smoothNoise(x: number, y: number, size: number, seed: number): number {
    let s = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            s += hash((x + dx + size) % size, (y + dy + size) % size, seed);
        }
    }
    return s / 9;
}

function fbm(x: number, y: number, size: number, seed: number, octaves: number): number {
    let sum = 0;
    let amp = 0.5;
    let freq = 1;
    for (let i = 0; i < octaves; i++) {
        sum += smoothNoise(Math.floor(x * freq) % size, Math.floor(y * freq) % size, size, seed + i) * amp;
        amp *= 0.5;
        freq *= 2;
    }
    return Math.max(0, Math.min(1, sum));
}

function fillTexture(data: Uint8ClampedArray, size: number, preset: TexturePreset, kind: TextureKind): void {
    // Per-preset tuning: frekvens, antall oktaver, og intensitet på normal-Z.
    const cfg: Record<TexturePreset, { freq: number; octaves: number; strength: number; seed: number }> = {
        stone:  { freq: 0.06,  octaves: 5, strength: 0.9, seed: 11 },
        wood:   { freq: 0.12,  octaves: 3, strength: 0.4, seed: 23 }, // lineært pattern — tweakes nedenfor
        cloth:  { freq: 0.25,  octaves: 2, strength: 0.3, seed: 37 },
        metal:  { freq: 0.08,  octaves: 3, strength: 0.15, seed: 47 },
        soil:   { freq: 0.09,  octaves: 6, strength: 1.0, seed: 59 },
        leaf:   { freq: 0.2,   octaves: 3, strength: 0.5, seed: 67 },
    };
    const { freq, octaves, strength, seed } = cfg[preset];

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            // Grunn-høydefelt — med preset-spesifikk deformasjon.
            let h: number;
            if (preset === 'wood') {
                // Åreringer: hoveddeformasjon langs én akse
                const rings = Math.sin((x + fbm(x, y, size, seed, 2) * 10) * freq * 2) * 0.5 + 0.5;
                const grain = fbm(x, y, size, seed, octaves);
                h = rings * 0.7 + grain * 0.3;
            } else if (preset === 'cloth') {
                // Veve-mønster — krysshøydefelt
                const weave = (Math.sin(x * 0.5) + Math.sin(y * 0.5)) * 0.25 + 0.5;
                h = weave * 0.6 + fbm(x, y, size, seed, 2) * 0.4;
            } else {
                h = fbm(x * freq * size, y * freq * size, size, seed, octaves);
            }

            if (kind === 'normal') {
                // Sobel-gradient → normal (x,y,z). z dominert av strength.
                const hl = sampleHeight(x - 1, y, size, preset, seed, freq, octaves);
                const hr = sampleHeight(x + 1, y, size, preset, seed, freq, octaves);
                const hu = sampleHeight(x, y - 1, size, preset, seed, freq, octaves);
                const hd = sampleHeight(x, y + 1, size, preset, seed, freq, octaves);
                const dx = (hr - hl) * strength;
                const dy = (hd - hu) * strength;
                // Normal i [0,1] — standard tangent-space encoding
                const nx = (-dx * 0.5) + 0.5;
                const ny = (-dy * 0.5) + 0.5;
                const nz = 1.0; // full Z, skaleres via shader ikke her
                data[i] = Math.round(nx * 255);
                data[i + 1] = Math.round(ny * 255);
                data[i + 2] = Math.round(nz * 255);
                data[i + 3] = 255;
            } else if (kind === 'roughness') {
                // Høydekart → roughness: daler er glattere (lavere), topper ruere (høyere)
                const r = Math.min(1, Math.max(0, 0.5 + (h - 0.5) * 0.7));
                const v = Math.round(r * 255);
                data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255;
            } else { // ao
                // Ambient occlusion: mørkere der høyden er lav (indikerer hulrom/sprekker)
                const ao = Math.min(1, 0.6 + h * 0.4);
                const v = Math.round(ao * 255);
                data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255;
            }
        }
    }
}

function sampleHeight(x: number, y: number, size: number, preset: TexturePreset, seed: number, freq: number, octaves: number): number {
    const xi = (x + size) % size;
    const yi = (y + size) % size;
    if (preset === 'wood') {
        const rings = Math.sin((xi + fbm(xi, yi, size, seed, 2) * 10) * freq * 2) * 0.5 + 0.5;
        const grain = fbm(xi, yi, size, seed, octaves);
        return rings * 0.7 + grain * 0.3;
    }
    if (preset === 'cloth') {
        const weave = (Math.sin(xi * 0.5) + Math.sin(yi * 0.5)) * 0.25 + 0.5;
        return weave * 0.6 + fbm(xi, yi, size, seed, 2) * 0.4;
    }
    return fbm(xi * freq * size, yi * freq * size, size, seed, octaves);
}
