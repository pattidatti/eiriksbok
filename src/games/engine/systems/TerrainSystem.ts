import * as THREE from 'three';

// ─── Prosedyralt terreng (Fase 8) ────────────────────────────────────────────
// Høydefunksjon (seeded value-noise + deklarative features) evalueres inn i et
// Float32Array-grid som er ÉN KILDE TIL SANNHET for tre forbrukere:
//   1. Den visuelle meshen (PlaneGeometry med vertex-farger + flatShading)
//   2. Fysikk-heightfielden (PhysicsWorld.addHeightfield - O(1)-queries)
//   3. getHeight(x, z) (bilineær interpolasjon - props/NPC-er/spawn på bakken)
// Slik er spiller, props og raycasts alltid konsistente med det øyet ser.
//
// Vertex-farger males i lag: gress/tørt gress via lavfrekvent noise → stein på
// bratte normaler → valgfrie høydebånd → paint-soner (stier, tråkket jord) sist.

export interface TerrainPalette {
    grass: number;
    grassDry?: number; // blandes inn med lavfrekvent noise (default = grass)
    rock?: number; // brukt der normal.y < slopeRockThreshold
    rockDark?: number; // mørk stein-variant (noise-valgt)
}

export interface TerrainFeature {
    type: 'plateau' | 'valley' | 'flatten' | 'rim' | 'ridge';
    // plateau/valley/flatten: sirkulær sone rundt center.
    center?: [number, number];
    radius?: number;
    // ridge: åsrygg langs et linjesegment fra→to med gitt bredde.
    from?: [number, number];
    to?: [number, number];
    width?: number;
    // rim: fjellring fra innerRadius og utover mot kartkanten.
    innerRadius?: number;
    // Overgangssone i meter. Default 12 (rim: 40).
    falloff?: number;
    // plateau/ridge: høyde som LEGGES TIL. valley: trekkes fra.
    // flatten: målhøyden terrenget flates mot (default 0). rim: topphøyde.
    height?: number;
}

export interface PaintZone {
    center: [number, number];
    radius: number;
    color: number;
    falloff?: number; // default radius * 0.5
    // Styrke 0..1. Default 0.85.
    strength?: number;
}

export interface TerrainConfig {
    // Kvadratisk side i meter.
    size: number;
    // Grid-oppløsning FØR tier-skalering (low ×0.5, medium ×0.75). Default 128.
    segments?: number;
    seed?: number;
    noise?: { amplitude?: number; frequency?: number; octaves?: number };
    features?: TerrainFeature[];
    paint?: PaintZone[];
    palette?: TerrainPalette;
    // normal.y under denne → stein. Default 0.75 (≈41° helning).
    slopeRockThreshold?: number;
    // Valgfrie høydebånd (f.eks. snø over y=30). Males over basisfargen.
    heightBands?: { y: number; color: number }[];
    // Fasettert demo-look. Default true.
    flatShading?: boolean;
    // Escape hatch: full kontroll over høyden. Overstyrer noise + features.
    // NB: heightfield-collideren støtter ikke overheng/grotter.
    heightFn?: (x: number, z: number) => number;
    material?: { roughness?: number };
}

const DEFAULT_PALETTE: Required<TerrainPalette> = {
    grass: 0x6b8a4a,
    grassDry: 0x8a9a52,
    rock: 0x6a6470,
    rockDark: 0x4c4654,
};

function smooth(t: number): number {
    return t * t * (3 - 2 * t);
}
function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
}
// smoothstep fra a til b - håndterer a > b (synkende kant).
function sstep(a: number, b: number, t: number): number {
    return smooth(clamp01((t - a) / (b - a)));
}
function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

// Avstand fra punkt til linjesegment (XZ-planet).
function segmentDist(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
    const dx = bx - ax;
    const dz = bz - az;
    const lenSq = dx * dx + dz * dz || 1;
    const t = clamp01(((px - ax) * dx + (pz - az) * dz) / lenSq);
    return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

export class TerrainSystem {
    private tier: 'low' | 'medium' | 'high';
    private cfg: TerrainConfig | null = null;
    private heights: Float32Array = new Float32Array(0);
    private gridSide = 0; // antall vertekser per side (segments + 1)
    private size = 0;
    private mesh: THREE.Mesh | null = null;
    private geometry: THREE.BufferGeometry | null = null;
    private noiseSeed = 0;

    constructor(tier: 'low' | 'medium' | 'high') {
        this.tier = tier;
    }

    // ── Seeded value-noise (deterministisk - samme seed gir samme terreng) ────
    private hash(x: number, z: number): number {
        const h = Math.sin(x * 127.1 + z * 311.7 + this.noiseSeed * 0.1731) * 43758.5453;
        return h - Math.floor(h);
    }

    private noise2(x: number, z: number): number {
        const xi = Math.floor(x);
        const zi = Math.floor(z);
        const xf = x - xi;
        const zf = z - zi;
        const a = this.hash(xi, zi);
        const b = this.hash(xi + 1, zi);
        const c = this.hash(xi, zi + 1);
        const d = this.hash(xi + 1, zi + 1);
        const u = smooth(xf);
        const v = smooth(zf);
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }

    private fbm(x: number, z: number, octaves: number): number {
        let sum = 0;
        let amp = 0.6;
        let freq = 1;
        for (let o = 0; o < octaves; o++) {
            sum += this.noise2(x * freq + o * 7.13, z * freq + o * 3.71) * amp;
            amp *= 0.45;
            freq *= 2.3;
        }
        return sum;
    }

    // ── Høydefunksjon: noise + features ───────────────────────────────────────
    private evalHeight(x: number, z: number): number {
        const cfg = this.cfg!;
        if (cfg.heightFn) return cfg.heightFn(x, z);

        const n = cfg.noise ?? {};
        const amp = n.amplitude ?? 3;
        const freq = n.frequency ?? 0.02;
        const octaves = n.octaves ?? 3;
        let h = (this.fbm(x * freq, z * freq, octaves) - 0.5) * 2 * amp;

        for (const f of cfg.features ?? []) {
            const falloff = f.falloff ?? (f.type === 'rim' ? 40 : 12);
            if (f.type === 'rim') {
                const inner = f.innerRadius ?? this.size * 0.38;
                const d = Math.hypot(x, z);
                const k = sstep(inner, inner + falloff, d);
                // Noise-variert fjellring så silhuetten ikke blir en perfekt sirkel
                h += k * (f.height ?? 25) * (0.65 + this.fbm(x * 0.012 + 31, z * 0.012 + 17, 2) * 0.7);
                continue;
            }
            if (f.type === 'ridge') {
                const from = f.from ?? [0, 0];
                const to = f.to ?? [10, 0];
                const halfW = (f.width ?? 14) / 2;
                const d = segmentDist(x, z, from[0], from[1], to[0], to[1]);
                h += sstep(halfW + falloff, halfW, d) * (f.height ?? 6);
                continue;
            }
            const c = f.center ?? [0, 0];
            const r = f.radius ?? 15;
            const d = Math.hypot(x - c[0], z - c[1]);
            const k = sstep(r + falloff, r, d);
            if (f.type === 'plateau') h += k * (f.height ?? 6);
            else if (f.type === 'valley') h -= k * (f.height ?? 4);
            else h = lerp(h, f.height ?? 0, k * 0.92); // flatten
        }
        return h;
    }

    // ── Bygging ───────────────────────────────────────────────────────────────
    build(cfg: TerrainConfig): THREE.Mesh {
        this.cfg = cfg;
        this.size = cfg.size;
        this.noiseSeed = cfg.seed ?? 1;
        const tierScale = this.tier === 'low' ? 0.5 : this.tier === 'medium' ? 0.75 : 1;
        const segments = Math.max(48, Math.round((cfg.segments ?? 128) * tierScale));
        this.gridSide = segments + 1;

        // 1) Evaluer høyde-gridet. Indeksering: heights[i * gridSide + j]
        //    der i = z-indeks (z fra -size/2 til +size/2), j = x-indeks.
        this.heights = new Float32Array(this.gridSide * this.gridSide);
        const step = this.size / segments;
        const half = this.size / 2;
        for (let i = 0; i < this.gridSide; i++) {
            const z = -half + i * step;
            for (let j = 0; j < this.gridSide; j++) {
                const x = -half + j * step;
                this.heights[i * this.gridSide + j] = this.evalHeight(x, z);
            }
        }

        // 2) Visuell mesh: PlaneGeometry rotert til XZ, verteks-Y fra gridet.
        const geo = new THREE.PlaneGeometry(this.size, this.size, segments, segments);
        geo.rotateX(-Math.PI / 2);
        const pos = geo.attributes.position;
        for (let v = 0; v < pos.count; v++) {
            pos.setY(v, this.getHeight(pos.getX(v), pos.getZ(v)));
        }
        geo.computeVertexNormals();

        // 3) Vertex-farger (etter normals - slope-regelen leser normal.y).
        const colors = new Float32Array(pos.count * 3);
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.paintAllVertices(geo);

        const mat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            flatShading: cfg.flatShading ?? true,
            roughness: cfg.material?.roughness ?? 0.95,
            metalness: 0,
        });
        this.geometry = geo;
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.name = 'terrain';
        this.mesh.receiveShadow = true;
        return this.mesh;
    }

    // Maler ALLE vertekser (basis + slope + bånd + paint). Kalles ved bygging
    // og av paintCircle (runtime-maling, f.eks. tråkket jord etter et slag).
    private paintAllVertices(geo: THREE.BufferGeometry): void {
        const cfg = this.cfg!;
        const pal = { ...DEFAULT_PALETTE, ...(cfg.palette ?? {}) };
        if (cfg.palette && cfg.palette.grassDry === undefined) pal.grassDry = cfg.palette.grass;
        const pos = geo.attributes.position;
        const normal = geo.attributes.normal;
        const colorAttr = geo.attributes.color as THREE.BufferAttribute;
        const threshold = cfg.slopeRockThreshold ?? 0.75;

        const col = new THREE.Color();
        const grass = new THREE.Color(pal.grass);
        const grassDry = new THREE.Color(pal.grassDry);
        const rock = new THREE.Color(pal.rock);
        const rockDark = new THREE.Color(pal.rockDark);
        const bandCol = new THREE.Color();
        const paintCol = new THREE.Color();

        for (let v = 0; v < pos.count; v++) {
            const x = pos.getX(v);
            const y = pos.getY(v);
            const z = pos.getZ(v);
            // Basis: gress blandet med tørt gress via lavfrekvent noise
            const n = this.fbm(x * 0.05, z * 0.05, 2);
            col.copy(grass).lerp(grassDry, clamp01(n));
            // Stein på bratte flater (myk overgang rundt terskelen)
            const ny = normal.getY(v);
            const rockMix = sstep(threshold + 0.08, threshold - 0.08, ny);
            if (rockMix > 0) col.lerp(n > 0.5 ? rock : rockDark, rockMix);
            // Høydebånd (f.eks. snø)
            for (const band of cfg.heightBands ?? []) {
                const k = sstep(band.y - 1.5, band.y + 1.5, y);
                if (k > 0) col.lerp(bandCol.setHex(band.color), k);
            }
            // Paint-soner sist (stier, tråkket jord, brannflekker)
            for (const zone of cfg.paint ?? []) {
                const d = Math.hypot(x - zone.center[0], z - zone.center[1]);
                const fall = zone.falloff ?? zone.radius * 0.5;
                const k = sstep(zone.radius + fall, zone.radius - fall * 0.2, d);
                if (k > 0) col.lerp(paintCol.setHex(zone.color), k * (zone.strength ?? 0.85));
            }
            colorAttr.setXYZ(v, col.r, col.g, col.b);
        }
        colorAttr.needsUpdate = true;
    }

    /** Mal en ny sone i runtime (legges til config.paint og males om). */
    paintCircle(zone: PaintZone): void {
        if (!this.cfg || !this.geometry) return;
        this.cfg.paint = [...(this.cfg.paint ?? []), zone];
        this.paintAllVertices(this.geometry);
    }

    /** Terrenghøyde ved (x, z) - bilineær interpolasjon over gridet.
     *  Utenfor terrenget clampes til nærmeste kant. */
    getHeight(x: number, z: number): number {
        if (this.gridSide === 0) return 0;
        const half = this.size / 2;
        const segments = this.gridSide - 1;
        const fx = clamp01((x + half) / this.size) * segments;
        const fz = clamp01((z + half) / this.size) * segments;
        const j0 = Math.min(Math.floor(fx), segments - 1);
        const i0 = Math.min(Math.floor(fz), segments - 1);
        const tx = fx - j0;
        const tz = fz - i0;
        const g = this.gridSide;
        const h00 = this.heights[i0 * g + j0];
        const h01 = this.heights[i0 * g + j0 + 1];
        const h10 = this.heights[(i0 + 1) * g + j0];
        const h11 = this.heights[(i0 + 1) * g + j0 + 1];
        return lerp(lerp(h00, h01, tx), lerp(h10, h11, tx), tz);
    }

    /** Maks terrenghøyde (for boundary-vegger og skygge-kamera). */
    getMaxHeight(): number {
        let max = -Infinity;
        for (let i = 0; i < this.heights.length; i++) max = Math.max(max, this.heights[i]);
        return max === -Infinity ? 0 : max;
    }

    getSize(): number {
        return this.size;
    }

    /** Høyde-grid pakket KOLONNE-MAJOR slik Rapiers heightfield forventer:
     *  heights[j * gridSide + i] der j = x-indeks (kolonne), i = z-indeks (rad).
     *  Se PhysicsWorld.addHeightfield. */
    getHeightsColumnMajor(): { heights: Float32Array; rows: number; cols: number } {
        const g = this.gridSide;
        const out = new Float32Array(g * g);
        for (let i = 0; i < g; i++) {
            for (let j = 0; j < g; j++) {
                out[j * g + i] = this.heights[i * g + j];
            }
        }
        return { heights: out, rows: g, cols: g };
    }

    getMesh(): THREE.Mesh | null {
        return this.mesh;
    }

    dispose(): void {
        this.geometry?.dispose();
        if (this.mesh) (this.mesh.material as THREE.Material).dispose();
        this.mesh = null;
        this.geometry = null;
        this.heights = new Float32Array(0);
        this.gridSide = 0;
    }
}
