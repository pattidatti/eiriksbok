import * as THREE from 'three';

export interface TexKit {
    tex: THREE.CanvasTexture;
    normalMap: THREE.CanvasTexture;
}

// Sobel-basert height-to-normal konvertering. Gir ekte normal maps fra canvas-data.
function heightToNormalCanvas(srcCtx: CanvasRenderingContext2D, w: number, h: number, strength: number): HTMLCanvasElement {
    const hData = srcCtx.getImageData(0, 0, w, h).data;
    const nm = document.createElement('canvas');
    nm.width = w; nm.height = h;
    const nmCtx = nm.getContext('2d')!;
    const nmData = nmCtx.createImageData(w, h);

    const s = (px: number, py: number): number => {
        const sx = ((px % w) + w) % w;
        const sy = ((py % h) + h) % h;
        return hData[(sy * w + sx) * 4] / 255;
    };

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const tl = s(x - 1, y - 1), t = s(x, y - 1), tr = s(x + 1, y - 1);
            const l = s(x - 1, y), r = s(x + 1, y);
            const bl = s(x - 1, y + 1), b = s(x, y + 1), br = s(x + 1, y + 1);

            const dx = (tr + 2 * r + br - tl - 2 * l - bl) * strength;
            const dy = (bl + 2 * b + br - tl - 2 * t - tr) * strength;
            const len = Math.sqrt(dx * dx + dy * dy + 1);

            const i = (y * w + x) * 4;
            nmData.data[i] = Math.round((-dx / len * 0.5 + 0.5) * 255);
            nmData.data[i + 1] = Math.round((-dy / len * 0.5 + 0.5) * 255);
            nmData.data[i + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
            nmData.data[i + 3] = 255;
        }
    }
    nmCtx.putImageData(nmData, 0, 0);
    return nm;
}

function buildKit(colorCanvas: HTMLCanvasElement, normalStrength: number): TexKit {
    const ctx = colorCanvas.getContext('2d')!;
    const nmCanvas = heightToNormalCanvas(ctx, colorCanvas.width, colorCanvas.height, normalStrength);

    const tex = new THREE.CanvasTexture(colorCanvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

    const normalMap = new THREE.CanvasTexture(nmCanvas);
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

    return { tex, normalMap };
}

// ── Canvas generators ────────────────────────────────────────────────────────

function makeWoodCanvas(size = 512): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d')!;

    x.fillStyle = '#6b4423';
    x.fillRect(0, 0, size, size);

    x.strokeStyle = '#2a1810';
    x.lineWidth = 1.5;
    for (let y = 0; y < size; y += 42) {
        x.beginPath();
        x.moveTo(0, y);
        x.lineTo(size, y);
        x.stroke();
    }
    for (let i = 0; i < 200; i++) {
        x.strokeStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
        x.lineWidth = 0.5 + Math.random();
        const gy = Math.random() * size;
        x.beginPath();
        x.moveTo(0, gy);
        x.bezierCurveTo(
            size * 0.3, gy + (Math.random() * 6 - 3),
            size * 0.7, gy + (Math.random() * 6 - 3),
            size, gy + (Math.random() * 4 - 2)
        );
        x.stroke();
    }
    // Kvistflekker
    for (let i = 0; i < 3; i++) {
        const kx = Math.random() * size;
        const ky = Math.random() * size;
        const r = 10 + Math.random() * 22;
        const g = x.createRadialGradient(kx, ky, 0, kx, ky, r);
        g.addColorStop(0, 'rgba(150,90,40,0.35)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g;
        x.fillRect(kx - r, ky - r, r * 2, r * 2);
    }
    return c;
}

function makeStoneCanvas(size = 512): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d')!;

    x.fillStyle = '#9a7d64';
    x.fillRect(0, 0, size, size);

    for (let i = 0; i < 600; i++) {
        const lum = 50 + Math.random() * 60;
        x.fillStyle = `rgba(${lum},${lum - 10},${lum - 20},${0.06 + Math.random() * 0.1})`;
        const s = 1 + Math.random() * 7;
        x.fillRect(Math.random() * size, Math.random() * size, s, s);
    }
    x.strokeStyle = 'rgba(45,30,18,0.3)';
    x.lineWidth = 2;
    for (let y = 0; y < size; y += 85) {
        x.beginPath();
        x.moveTo(0, y + Math.random() * 5);
        x.lineTo(size, y + Math.random() * 5);
        x.stroke();
    }
    for (let i = 0; i < 24; i++) {
        const sx = Math.random() * size;
        const sy = Math.random() * size;
        const r = 15 + Math.random() * 55;
        const g = x.createRadialGradient(sx, sy, 0, sx, sy, r);
        const bright = Math.random() > 0.5;
        g.addColorStop(0, bright ? 'rgba(255,220,180,0.06)' : 'rgba(0,0,0,0.05)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g;
        x.fillRect(sx - r, sy - r, r * 2, r * 2);
    }
    return c;
}

function makeFabricCanvas(size = 256): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d')!;

    x.fillStyle = '#c8a878';
    x.fillRect(0, 0, size, size);

    const sp = 7;
    for (let col = 0; col < size; col += sp) {
        x.strokeStyle = `rgba(80,58,28,${0.18 + Math.random() * 0.1})`;
        x.lineWidth = sp * 0.55;
        x.beginPath();
        x.moveTo(col, 0);
        x.lineTo(col, size);
        x.stroke();
    }
    for (let row = 0; row < size; row += sp) {
        x.strokeStyle = `rgba(100,72,36,${0.15 + Math.random() * 0.08})`;
        x.lineWidth = sp * 0.5;
        x.beginPath();
        x.moveTo(0, row);
        x.lineTo(size, row);
        x.stroke();
    }
    return c;
}

function makeDirtCanvas(size = 512): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d')!;

    x.fillStyle = '#6b4e2f';
    x.fillRect(0, 0, size, size);

    for (let i = 0; i < 900; i++) {
        const bright = Math.random() > 0.5;
        const a = 0.04 + Math.random() * 0.09;
        x.fillStyle = bright ? `rgba(180,140,90,${a})` : `rgba(0,0,0,${a})`;
        const s = 2 + Math.random() * 11;
        x.fillRect(Math.random() * size, Math.random() * size, s, s * (0.3 + Math.random() * 0.5));
    }
    for (let i = 0; i < 30; i++) {
        const px = Math.random() * size;
        const py = Math.random() * size;
        const r = 2 + Math.random() * 5;
        x.fillStyle = 'rgba(95,78,58,0.55)';
        x.beginPath();
        x.ellipse(px, py, r, r * 0.65, Math.random() * Math.PI, 0, Math.PI * 2);
        x.fill();
    }
    return c;
}

// ── Public API (lazy-cached per kit-type) ────────────────────────────────────

let _woodKit: TexKit | null = null;
let _stoneKit: TexKit | null = null;
let _fabricKit: TexKit | null = null;
let _dirtKit: TexKit | null = null;

export function woodKit(): TexKit {
    return (_woodKit ??= buildKit(makeWoodCanvas(), 3.5));
}

export function stoneKit(): TexKit {
    return (_stoneKit ??= buildKit(makeStoneCanvas(), 4.0));
}

export function fabricKit(): TexKit {
    return (_fabricKit ??= buildKit(makeFabricCanvas(), 2.5));
}

export function dirtKit(): TexKit {
    return (_dirtKit ??= buildKit(makeDirtCanvas(), 5.0));
}

export function makeLabelSprite(text: string, color = '#f0ddb8', fontSize = 24): THREE.Sprite {
    const cvs = document.createElement('canvas');
    cvs.width = 256;
    cvs.height = 56;
    const ctx = cvs.getContext('2d')!;
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 30);
    ctx.shadowBlur = 0;
    const tex = new THREE.CanvasTexture(cvs);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.5, 0.33, 1);
    sprite.renderOrder = 999;
    return sprite;
}

export function disposeTextureKit(): void {
    for (const kit of [_woodKit, _stoneKit, _fabricKit, _dirtKit]) {
        if (!kit) continue;
        kit.tex.dispose();
        kit.normalMap.dispose();
    }
    _woodKit = _stoneKit = _fabricKit = _dirtKit = null;
}
