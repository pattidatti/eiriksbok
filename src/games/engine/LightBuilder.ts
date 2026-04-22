import * as THREE from 'three';
import type { LightConfig } from './types';

export interface HangingLightRef {
    light: THREE.SpotLight;
    update: (dt: number, elapsed: number) => void;
}

// Gradient-shader: V=1 ved spiss (nær kilden), V=0 ved bred ende → lysstråle-effekt
const coneVert = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
const coneFrag = `
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uOpacity;
    void main() {
        float fade = vUv.y * vUv.y;
        gl_FragColor = vec4(uColor, uOpacity * fade);
    }
`;

function coneShaderMat(color: number, opacity: number): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(color) },
            uOpacity: { value: opacity },
        },
        vertexShader: coneVert,
        fragmentShader: coneFrag,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
}

/**
 * Bygger en hengende SpotLight (peker rett ned) med:
 *   - snor + emissiv pære + glød-halo
 *   - shader-gradient lyskjegle (sterk ved kilden, fader ut)
 *   - støvpartikler som flyter sakte oppover i strålen
 *
 * Returnerer { light, update(dt, elapsed) } — kall update() fra scene-animasjonsloopen.
 */
export function buildHangingLight(scene: THREE.Scene, cfg: LightConfig): HangingLightRef {
    const [x, y, z] = cfg.position;
    const color = cfg.color ?? 0xffeedd;
    const intensity = cfg.intensity ?? 3.0;
    const distance = cfg.distance ?? 15;
    const decay = cfg.decay ?? 1.5;
    const angle = cfg.angle ?? 0.52;
    const penumbra = cfg.penumbra ?? 0.35;

    // ── SpotLight pekende rett ned ────────────────────────────────────────────
    const spot = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
    spot.position.set(x, y, z);
    spot.target.position.set(x, y - 10, z);
    if (cfg.castShadow) {
        spot.castShadow = true;
        spot.shadow.mapSize.set(512, 512);
    }
    scene.add(spot);
    scene.add(spot.target);

    if (cfg.showBulb === false) {
        return { light: spot, update: () => undefined };
    }

    const bulbY = y + 0.2;

    // Snor
    const cord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.0, 4),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    cord.position.set(x, y + 0.7, z);
    scene.add(cord);

    // Emissiv pære
    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 6),
        new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 8.0,
            roughness: 0.04,
            metalness: 0.1,
        })
    );
    bulb.position.set(x, bulbY, z);
    scene.add(bulb);

    // Glød-halo
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 10, 8),
        new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.28,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })
    );
    glow.position.set(x, bulbY, z);
    scene.add(glow);

    // ── Lysstråler: indre + ytre kjegle med shader-gradient ──────────────────
    // CylinderGeometry UV: V=0 bunn (bred/fjern), V=1 topp (spiss/nær kilden)
    const coneH = cfg.coneHeight ?? 4.0;
    const coneR = cfg.coneRadius ?? Math.tan(angle) * coneH; // matcher SpotLight-vinkelen
    const coneOp = cfg.coneOpacity ?? 0.18;

    const innerGeo = new THREE.CylinderGeometry(0.04, coneR, coneH, 24, 1, true);
    const innerCone = new THREE.Mesh(innerGeo, coneShaderMat(color, coneOp));
    innerCone.position.set(x, bulbY - coneH / 2, z);
    scene.add(innerCone);

    const outerGeo = new THREE.CylinderGeometry(0.02, coneR * 1.9, coneH * 0.8, 24, 1, true);
    const outerCone = new THREE.Mesh(outerGeo, coneShaderMat(color, coneOp * 0.3));
    outerCone.position.set(x, bulbY - (coneH * 0.8) / 2, z);
    scene.add(outerCone);

    // ── Støvpartikler i strålen ───────────────────────────────────────────────
    const N = 30;
    const posArr = new Float32Array(N * 3);
    const phases = new Float32Array(N); // 0..1 langs strålen (0=spiss/topp, 1=bunn/bred)
    const relRadii = new Float32Array(N); // 0..1 relativ radius
    const thetas = new Float32Array(N); // vinkel rundt aksen
    const speeds = new Float32Array(N); // oppover-hastighet (variabel)

    for (let i = 0; i < N; i++) {
        phases[i] = Math.random();
        relRadii[i] = Math.sqrt(Math.random()) * 0.8; // sqrt gir jevnere fordeling
        thetas[i] = Math.random() * Math.PI * 2;
        speeds[i] = 0.04 + Math.random() * 0.04;
        const t = phases[i];
        const r = relRadii[i] * Math.tan(angle) * coneH * t;
        posArr[i * 3] = x + Math.cos(thetas[i]) * r;
        posArr[i * 3 + 1] = bulbY - coneH * t;
        posArr[i * 3 + 2] = z + Math.sin(thetas[i]) * r;
    }

    const dustGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(posArr, 3);
    dustGeo.setAttribute('position', posAttr);

    const dustMat = new THREE.PointsMaterial({
        color,
        size: 0.022,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    function update(dt: number, elapsed: number): void {
        for (let i = 0; i < N; i++) {
            phases[i] -= speeds[i] * dt;
            if (phases[i] < 0) phases[i] += 1;
            const t = phases[i];
            const r = relRadii[i] * Math.tan(angle) * coneH * t;
            const theta = thetas[i] + elapsed * 0.06;
            posAttr.setXYZ(
                i,
                x + Math.cos(theta) * r,
                bulbY - coneH * t,
                z + Math.sin(theta) * r
            );
        }
        posAttr.needsUpdate = true;
    }

    return { light: spot, update };
}
