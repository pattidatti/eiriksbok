import * as THREE from 'three';
import type { GameEngineRef, AABB2D } from '../engine/types';
import { buildRoom } from '../engine/systems/RoomSystem';

// ── Deterministic PRNG (Mulberry32) ──────────────────────────────────────────

function mulberry32(seed: number): () => number {
    return function () {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ── Terrain noise ─────────────────────────────────────────────────────────────

function smoothstep(t: number): number {
    return t * t * (3 - 2 * t);
}

function gradNoise(x: number, z: number): number {
    const ix = Math.floor(x),
        iz = Math.floor(z);
    const fx = x - ix,
        fz = z - iz;

    function g(nx: number, nz: number): [number, number] {
        const a = Math.sin(nx * 1271.7 + nz * 3389.3) * 43758.5453;
        return [Math.cos(a * 6.2831), Math.sin(a * 6.2831)];
    }

    const [g00x, g00z] = g(ix, iz);
    const [g10x, g10z] = g(ix + 1, iz);
    const [g01x, g01z] = g(ix, iz + 1);
    const [g11x, g11z] = g(ix + 1, iz + 1);

    const ux = smoothstep(fx),
        uz = smoothstep(fz);
    const n00 = g00x * fx + g00z * fz;
    const n10 = g10x * (fx - 1) + g10z * fz;
    const n01 = g01x * fx + g01z * (fz - 1);
    const n11 = g11x * (fx - 1) + g11z * (fz - 1);

    return (
        (1 +
            n00 * (1 - ux) * (1 - uz) +
            n10 * ux * (1 - uz) +
            n01 * (1 - ux) * uz +
            n11 * ux * uz) *
        0.5
    );
}

function fbm(x: number, z: number): number {
    let v = 0,
        amp = 0.5,
        freq = 1.0;
    for (let i = 0; i < 5; i++) {
        v += amp * gradNoise(x * freq, z * freq);
        amp *= 0.5;
        freq *= 2.0;
    }
    return v; // ~0..1
}

function getTerrainY(x: number, z: number): number {
    let h = (fbm(x * 0.09, z * 0.09) - 0.5) * 3.0; // roughly -1.5..1.5

    // Depression near water [16, 12]
    const wdx = x - 16,
        wdz = z - 12;
    const waterDist = Math.sqrt(wdx * wdx + wdz * wdz);
    h -= Math.max(0, 1.0 - waterDist / 12.0) * 2.4;

    // Flat plateau around house complex [-16, -2]
    const hdx = x - -16,
        hdz = z - -2;
    const houseDist = Math.sqrt(hdx * hdx + hdz * hdz);
    if (houseDist < 10) {
        const blend = smoothstep(Math.min(1, Math.max(0, (houseDist - 6) / 4)));
        h *= blend;
    }

    return Math.max(-1.3, h);
}

// ── Grass ─────────────────────────────────────────────────────────────────────

function isGrassExcluded(x: number, z: number): boolean {
    // House zone
    if (x > -25 && x < -5 && z > -7 && z < 4) return true;
    // Forest zone
    if (x > -22 && x < 2 && z < -8 && z > -34) return true;
    // Water zone
    const wdx = x - 16,
        wdz = z - 12;
    if (Math.sqrt(wdx * wdx + wdz * wdz) < 13) return true;
    // Terrain edge
    if (Math.abs(x) > 37 || Math.abs(z) > 37) return true;
    return false;
}

function buildGrassMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        side: THREE.DoubleSide,
        vertexShader: `
            uniform float uTime;
            attribute vec3 aOffset;
            attribute float aPhase;
            varying float vH;
            void main() {
                float h = clamp(position.y / 0.35, 0.0, 1.0);
                float sway = sin(uTime * 1.8 + aPhase) * 0.12 * h * h;
                vec3 pos = position;
                pos.x += sway;
                vH = h;
                gl_Position = projectionMatrix * viewMatrix * vec4(pos + aOffset, 1.0);
            }
        `,
        fragmentShader: `
            varying float vH;
            void main() {
                vec3 col = mix(vec3(0.22, 0.44, 0.15), vec3(0.42, 0.68, 0.26), vH);
                gl_FragColor = vec4(col, 1.0);
            }
        `,
    });
}

function buildGrassMesh(mat: THREE.ShaderMaterial): THREE.Mesh {
    const baseGeo = new THREE.PlaneGeometry(0.08, 0.35, 1, 3);
    // Shift vertices so blade base sits at y=0
    const basePos = baseGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < basePos.count; i++) {
        basePos.setY(i, basePos.getY(i) + 0.175);
    }

    const maxCount = 3000;
    const offsets = new Float32Array(maxCount * 3);
    const phases = new Float32Array(maxCount);
    const rng = mulberry32(7);

    let placed = 0;
    let attempts = 0;
    while (placed < maxCount && attempts < maxCount * 15) {
        attempts++;
        const x = (rng() - 0.5) * 72;
        const z = (rng() - 0.5) * 72;
        if (isGrassExcluded(x, z)) continue;
        offsets[placed * 3] = x;
        offsets[placed * 3 + 1] = getTerrainY(x, z);
        offsets[placed * 3 + 2] = z;
        phases[placed] = rng() * Math.PI * 2;
        placed++;
    }

    const iGeo = new THREE.InstancedBufferGeometry();
    iGeo.index = baseGeo.index;
    iGeo.setAttribute('position', baseGeo.attributes.position);
    iGeo.setAttribute('uv', baseGeo.attributes.uv);
    iGeo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets.slice(0, placed * 3), 3));
    iGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases.slice(0, placed), 1));
    iGeo.instanceCount = placed;

    const mesh = new THREE.Mesh(iGeo, mat);
    mesh.frustumCulled = false;
    return mesh;
}

// ── Trees ─────────────────────────────────────────────────────────────────────

interface TreeRef {
    crown: THREE.Mesh;
    phase: number;
}

function buildTree(
    scene: THREE.Scene,
    toonMat: (c: number, o?: Record<string, unknown>) => THREE.MeshToonMaterial,
    x: number,
    z: number,
    scale: number,
    conifer: boolean,
    collisionBoxes: AABB2D[]
): TreeRef {
    const y = getTerrainY(x, z);
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const trunkH = 1.2 * scale;
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, trunkH, 6),
        toonMat(0x5c3d1a)
    );
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    group.add(trunk);

    let crown: THREE.Mesh;
    if (conifer) {
        crown = new THREE.Mesh(
            new THREE.ConeGeometry(0.88 * scale, 2.2 * scale, 7),
            toonMat(0x2d6a2d)
        );
        crown.position.y = trunkH + 0.9 * scale;
    } else {
        crown = new THREE.Mesh(
            new THREE.SphereGeometry(0.88 * scale, 8, 6),
            toonMat(0x3a7a3a)
        );
        crown.position.y = trunkH + 0.65 * scale;
    }
    crown.castShadow = true;
    group.add(crown);
    scene.add(group);

    const r = 0.22 * scale + 0.4;
    collisionBoxes.push({ minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r });

    return { crown, phase: Math.random() * Math.PI * 2 };
}

function buildForest(
    scene: THREE.Scene,
    toonMat: (c: number, o?: Record<string, unknown>) => THREE.MeshToonMaterial,
    collisionBoxes: AABB2D[]
): TreeRef[] {
    const refs: TreeRef[] = [];
    const rng = mulberry32(42);

    // Dense cluster
    for (let i = 0; i < 34; i++) {
        const angle = rng() * Math.PI * 2;
        const r = 3 + rng() * 14;
        const x = -9 + Math.cos(angle) * r;
        const z = -20 + Math.sin(angle) * r;
        if (Math.abs(x) > 38 || Math.abs(z) > 38) continue;
        // Keep away from house
        const hdx = x - -16,
            hdz = z - -2;
        if (Math.sqrt(hdx * hdx + hdz * hdz) < 9) continue;
        const scale = 0.8 + rng() * 0.6;
        refs.push(buildTree(scene, toonMat, x, z, scale, rng() > 0.35, collisionBoxes));
    }

    // Scattered trees around the meadow
    for (let i = 0; i < 10; i++) {
        const x = (rng() - 0.5) * 62;
        const z = (rng() - 0.5) * 62;
        if (x > -25 && x < -4 && z > -8 && z < 5) continue;
        const wdx = x - 16,
            wdz = z - 12;
        if (Math.sqrt(wdx * wdx + wdz * wdz) < 14) continue;
        if (Math.abs(x) > 36 || Math.abs(z) > 36) continue;
        const scale = 0.6 + rng() * 0.8;
        refs.push(buildTree(scene, toonMat, x, z, scale, rng() > 0.5, collisionBoxes));
    }

    return refs;
}

// ── Campfire ──────────────────────────────────────────────────────────────────

interface FireRefs {
    flame1: THREE.Mesh;
    flame2: THREE.Mesh;
    light1: THREE.PointLight;
    light2: THREE.PointLight;
    baseY: number;
}

function buildCampfire(
    scene: THREE.Scene,
    toonMat: (c: number, o?: Record<string, unknown>) => THREE.MeshToonMaterial
): FireRefs {
    const cx = 7,
        cz = -22;
    const baseY = getTerrainY(cx, cz);

    const group = new THREE.Group();
    group.position.set(cx, baseY, cz);

    // Logs arranged in a star pattern
    const logRng = mulberry32(77);
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + logRng() * 0.3;
        const log = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.09, 0.95, 6),
            toonMat(0x6b3a20)
        );
        log.position.set(Math.cos(angle) * 0.22, 0.1, Math.sin(angle) * 0.22);
        log.rotation.z = Math.PI / 4;
        log.rotation.y = angle;
        log.castShadow = true;
        group.add(log);
    }

    // Ember bed
    const embers = new THREE.Mesh(
        new THREE.CircleGeometry(0.2, 8),
        new THREE.MeshStandardMaterial({
            color: 0xff4400,
            emissive: 0xff2200,
            emissiveIntensity: 2.5,
            roughness: 1.0,
        })
    );
    embers.rotation.x = -Math.PI / 2;
    embers.position.y = 0.02;
    group.add(embers);

    // Main flame
    const flame1 = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.55, 7),
        new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 3.5,
            roughness: 1.0,
        })
    );
    flame1.position.y = 0.28;
    group.add(flame1);

    // Inner bright flame
    const flame2 = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.32, 6),
        new THREE.MeshStandardMaterial({
            color: 0xffcc00,
            emissive: 0xffaa00,
            emissiveIntensity: 5.0,
            roughness: 1.0,
        })
    );
    flame2.position.y = 0.48;
    group.add(flame2);

    scene.add(group);

    const light1 = new THREE.PointLight(0xff6600, 14, 14);
    light1.position.set(cx, baseY + 0.8, cz);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xff9900, 5, 7);
    light2.position.set(cx, baseY + 1.3, cz);
    scene.add(light2);

    return { flame1, flame2, light1, light2, baseY };
}

// ── Shore rocks ───────────────────────────────────────────────────────────────

function buildShoreRocks(
    scene: THREE.Scene,
    _toonMat: (c: number, o?: Record<string, unknown>) => THREE.MeshToonMaterial
): void {
    const rng = mulberry32(99);
    const rockMat = new THREE.MeshStandardMaterial({
        color: 0x7a7a7a,
        roughness: 0.95,
        metalness: 0.0,
        flatShading: true,
    });
    const positions: [number, number][] = [
        [10, 8], [11, 18], [18, 6], [22, 10], [20, 18], [14, 22], [8, 14], [23, 15],
    ];
    for (const [rx, rz] of positions) {
        const x = rx + (rng() - 0.5) * 1.5;
        const z = rz + (rng() - 0.5) * 1.5;
        const y = getTerrainY(x, z);
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28 + rng() * 0.22, 0), rockMat);
        rock.position.set(x, y + 0.1, z);
        rock.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
        rock.castShadow = true;
        scene.add(rock);
    }
}

// ── Main setup ────────────────────────────────────────────────────────────────

export function setupDemoWorldScene(engine: GameEngineRef): void {
    const { scene, toonMat } = engine;
    const collisionBoxes = scene.userData.collisionBoxes as AABB2D[];

    scene.userData.getTerrainY = getTerrainY;

    // ── Lighting ──────────────────────────────────────────────────────────────
    const sun = new THREE.DirectionalLight(0xfff5e0, 3.8);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 150;
    sun.shadow.camera.left = -65;
    sun.shadow.camera.right = 65;
    sun.shadow.camera.top = 65;
    sun.shadow.camera.bottom = -65;
    scene.add(sun);

    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x3d5a2d, 1.2));
    scene.add(new THREE.AmbientLight(0xfff0d0, 0.4));

    // ── Terrain ───────────────────────────────────────────────────────────────
    const terrainGeo = new THREE.PlaneGeometry(80, 80, 100, 100);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrainPos = terrainGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < terrainPos.count; i++) {
        terrainPos.setY(i, getTerrainY(terrainPos.getX(i), terrainPos.getZ(i)));
    }
    terrainPos.needsUpdate = true;
    terrainGeo.computeVertexNormals();

    const terrainMesh = new THREE.Mesh(
        terrainGeo,
        new THREE.MeshStandardMaterial({ color: 0x4a7a35, roughness: 0.9, metalness: 0.0 })
    );
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // ── Water ─────────────────────────────────────────────────────────────────
    const waterGeo = new THREE.CircleGeometry(11, 64);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        vertexShader: `
            uniform float uTime;
            varying vec2 vUv;
            varying float vH;
            void main() {
                vUv = uv;
                vec3 p = position;
                p.y += sin(p.x * 0.85 + uTime * 1.3) * 0.055
                     + sin(p.z * 0.65 + uTime * 1.0) * 0.045;
                vH = p.y;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            varying float vH;
            uniform float uTime;
            void main() {
                vec3 deep = vec3(0.06, 0.28, 0.44);
                vec3 shallow = vec3(0.28, 0.62, 0.72);
                vec2 c = vUv - 0.5;
                float edge = smoothstep(0.5, 0.0, length(c));
                vec3 col = mix(deep, shallow, edge * 0.7 + 0.1);
                float crest = smoothstep(0.03, 0.06, vH);
                col = mix(col, vec3(0.65, 0.82, 0.90), crest * 0.35);
                float shimmer = sin(vUv.x * 28.0 + uTime * 3.8) * sin(vUv.y * 22.0 + uTime * 3.2) * 0.06;
                col = clamp(col + shimmer, 0.0, 1.0);
                gl_FragColor = vec4(col, 0.84);
            }
        `,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(16, getTerrainY(16, 12) + 0.06, 12);
    scene.add(waterMesh);

    // ── Grass ─────────────────────────────────────────────────────────────────
    const grassMat = buildGrassMaterial();
    scene.add(buildGrassMesh(grassMat));

    // ── House with two rooms ──────────────────────────────────────────────────
    buildRoom(
        scene,
        toonMat,
        {
            id: 'romA',
            center: [-13, -2],
            size: [8, 6],
            wallHeight: 3,
            floorColor: 0xc8a86a,
            wallColor: 0xe8d8b0,
            roofColor: 0x8b4513,
            hasRoof: true,
            openings: [
                { side: 'S', offset: 0, width: 1.6 },
                { side: 'W', offset: 0, width: 1.2 },
            ],
        },
        collisionBoxes
    );

    buildRoom(
        scene,
        toonMat,
        {
            id: 'romB',
            center: [-19.5, -2],
            size: [5, 5],
            wallHeight: 3,
            floorColor: 0xb89060,
            wallColor: 0xe0d0a0,
            roofColor: 0x7a3a10,
            hasRoof: true,
            openings: [{ side: 'E', offset: 0, width: 1.2 }],
        },
        collisionBoxes
    );

    // ── Forest and trees ──────────────────────────────────────────────────────
    const treeRefs = buildForest(scene, toonMat, collisionBoxes);

    // ── Campfire ──────────────────────────────────────────────────────────────
    const fireRefs = buildCampfire(scene, toonMat);

    // ── Shore rocks ───────────────────────────────────────────────────────────
    buildShoreRocks(scene, toonMat);

    // ── Fix NPC Y position to terrain ─────────────────────────────────────────
    for (const child of scene.children) {
        if (child instanceof THREE.Group && child.userData.npcId === 'bonden') {
            child.position.y = getTerrainY(child.position.x, child.position.z);
            break;
        }
    }

    // ── Teleport player to correct terrain height ──────────────────────────────
    engine.teleportPlayer(0, getTerrainY(0, 0) + 0.1, 0);

    // ── Per-frame animation hook ───────────────────────────────────────────────
    scene.userData._customUpdate = (_dt: number, elapsed: number) => {
        waterMat.uniforms.uTime.value = elapsed;
        grassMat.uniforms.uTime.value = elapsed;

        for (const { crown, phase } of treeRefs) {
            crown.rotation.z = Math.sin(elapsed * 0.8 + phase) * 0.015;
            crown.rotation.x = Math.sin(elapsed * 0.6 + phase * 1.3) * 0.01;
        }

        const flicker = Math.sin(elapsed * 5.3) * 0.5 + 0.5;
        const flicker2 = Math.sin(elapsed * 4.1 + 1.2) * 0.5 + 0.5;
        fireRefs.flame1.scale.set(0.9 + flicker * 0.3, 0.8 + flicker * 0.4, 0.9 + flicker * 0.3);
        fireRefs.flame2.scale.set(0.7 + flicker2 * 0.4, 0.6 + flicker2 * 0.5, 0.7 + flicker2 * 0.4);
        fireRefs.flame1.position.y = 0.28 + flicker * 0.14;
        fireRefs.flame2.position.y = 0.48 + flicker2 * 0.18;
        fireRefs.light1.intensity = 11 + flicker * 7;
        fireRefs.light2.intensity = 3 + flicker2 * 4;
    };
}
