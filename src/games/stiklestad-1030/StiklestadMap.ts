import * as THREE from 'three';
import type { GameEngineRef } from '../engine/types';
import { buildTerrain, addProp, addCampfire, addWavingFlag, addGlowSprite } from '../engine/declarative';
import { registerMainSunLight, registerMainHemiLight, markSolid } from '../engine/sceneUserData';
import { PALETTE } from './StiklestadPalette';

// ─── Stiklestad 1030 - kart (geometri) ───────────────────────────────────────
// Bygger terrenget (Pakke A), leiren, kongens banner og bålene (Pakke B kits).
// All gameplay-wiring (NPC-er, hær, kamp, faser) skjer i StiklestadAssets.
// Sør = +z (leiren, der spilleren starter). Nord = -z (bondehæren bak ryggen).

export const LAYOUT = {
    TERRAIN_SIZE: 180,
    // Leir (flatt platå i sør)
    CAMP_CENTER: [0, 50] as [number, number],
    CAMP_RADIUS: 22,
    PLAYER_START: [0, 2, 56] as [number, number, number],
    // Ryggen (kamp-linjen) - åsrygg tvers over midten
    RIDGE_FROM: [-55, 4] as [number, number],
    RIDGE_TO: [55, 4] as [number, number],
    RIDGE_Z: 4,
    // Fase-porter (spillerens z)
    GATE_RIDGE_Z: 16, // går spilleren nord for denne, starter slaget
    // Hæren bak ryggen
    ENEMY_AREA: { minX: -46, maxX: 46, minZ: -66, maxZ: -22 },
    ENEMY_MARCH: [
        [0, 0, -68],
        [0, 0, 6],
    ] as [number, number, number][],
    // NPC-er
    TORMOD_POS: [-6, 'terrain', 52] as [number, number | 'terrain', number],
    OLAV_POS: [5, 'terrain', 57] as [number, number | 'terrain', number],
    HIRD_POS: [-9, 'terrain', 47] as [number, number | 'terrain', number],
    BONDE_POS: [10, 'terrain', 46] as [number, number | 'terrain', number],
    OLAV_RIDGE_POS: [3, 'terrain', 10] as [number, number | 'terrain', number],
    // Bål (tre samtaler om kvelden)
    FIRE_TRO: [-9, 48] as [number, number],
    FIRE_TVIL: [10, 47] as [number, number],
    FIRE_ETTERMAELE: [-6, 53] as [number, number],
    // Treningsbane (øst i leiren)
    LAUNCHER_POS: [30, 'terrain', 53] as [number, number | 'terrain', number],
    TRAIN_TARGETS: [
        [25, 41],
        [30, 39],
        [35, 41],
    ] as [number, number][],
} as const;

export interface MapRefs {
    sun: THREE.DirectionalLight;
    hemi: THREE.HemisphereLight;
    // Bål med setLit-kontroll (slukkes i etterspillet).
    campfires: { setLit: (lit: boolean) => void }[];
}

export function buildStiklestadMap(engine: GameEngineRef): MapRefs {
    // ── Terreng (Pakke A) ────────────────────────────────────────────────────
    buildTerrain(engine, {
        id: 'stiklestad-terreng',
        size: LAYOUT.TERRAIN_SIZE,
        seed: 1030,
        noise: { amplitude: 2.5, frequency: 0.018, octaves: 3 },
        features: [
            { type: 'flatten', center: LAYOUT.CAMP_CENTER, radius: LAYOUT.CAMP_RADIUS, falloff: 14 },
            { type: 'ridge', from: LAYOUT.RIDGE_FROM, to: LAYOUT.RIDGE_TO, width: 30, height: 7, falloff: 15 },
            { type: 'rim', innerRadius: 78, height: 22, falloff: 38 },
        ],
        paint: [{ center: LAYOUT.CAMP_CENTER, radius: 16, color: PALETTE.path, strength: 0.6 }],
        palette: {
            grass: PALETTE.grass,
            grassDry: PALETTE.grassDry,
            rock: PALETTE.rock,
            rockDark: PALETTE.rockDark,
        },
        lights: 'outdoor-dusk',
    });

    // ── Lys (dusk-presets alene er svake - boost manuelt, §6.1) ───────────────
    // Klassisk skumringskontrast: VARM sol mot KJØLIG himmelfyll. Uten denne
    // kontrasten vaskes alt til en flat oransje grøt (særlig på lav tier uten bloom).
    const hemi = new THREE.HemisphereLight(0xaec0da, PALETTE.grass, 1.35);
    engine.scene.add(hemi);
    registerMainHemiLight(engine.scene, hemi);

    const sun = new THREE.DirectionalLight(0xffdca0, 1.8);
    sun.position.set(-60, 38, 40);
    sun.castShadow = true;
    engine.scene.add(sun);
    registerMainSunLight(engine.scene, sun);

    // Svakt kjølig ambient så skyggesidene ikke blir helt svarte på lav tier.
    engine.scene.add(new THREE.AmbientLight(0x6a7488, 0.35));

    // ── Leir-gress (vegetasjon følger terrenget automatisk) ───────────────────
    engine.addVegetationPatch(
        { minX: -40, maxX: 40, minZ: 20, maxZ: 75 },
        0.18,
        'heather',
    );

    // ── Telt rundt leir-senteret (kjegler) ───────────────────────────────────
    const tentAngles = [0.3, 1.2, 2.1, 3.0, 3.9, 4.8, 5.6];
    tentAngles.forEach((a, i) => {
        const r = 13 + (i % 2) * 3;
        const x = LAYOUT.CAMP_CENTER[0] + Math.cos(a) * r;
        const z = LAYOUT.CAMP_CENTER[1] + Math.sin(a) * r;
        buildTent(engine, x, z, 0.9 + (i % 3) * 0.15);
    });

    // ── Palisade-stokker langs sør-kanten av leiren ──────────────────────────
    for (let i = -7; i <= 7; i++) {
        const x = i * 2.4;
        const z = LAYOUT.CAMP_CENTER[1] + 18;
        addProp(engine, {
            id: `palisade-${i}`,
            model: { primitive: 'cylinder', size: [0.16, 2.2], color: PALETTE.woodDark },
            pos: [x, 'terrain', z],
            castShadow: true,
        });
    }

    // ── Kongens banner: kors-standard i midten + to vaiende vimpler ───────────
    // Korset er Olavs merke (den kristne kongen). Vimplene gir bevegelse.
    buildKongsbanner(engine, 8, 56);     // kongens standard ved teltet (synlig i leiren)
    buildKongsbanner(engine, 1, 12);     // standard på ryggen (der linjen formes)
    addWavingFlag(engine, {
        id: 'olavsvimpel-1',
        pos: [-5, 'terrain', 58],
        size: [1.6, 1.0],
        colors: { top: PALETTE.bannerRed, bottom: PALETTE.bannerGold },
        stripes: 0,
        waveSpeed: 2.4,
    });
    addWavingFlag(engine, {
        id: 'olavsvimpel-2',
        pos: [6, 'terrain', 59],
        size: [1.5, 0.95],
        colors: { top: PALETTE.bannerRed, bottom: PALETTE.bannerGold },
        stripes: 0,
        waveSpeed: 2.8,
    });

    // ── Tre bål (kits, Pakke B). Returner setLit for å slukke i etterspillet ──
    const fires: [string, [number, number], number][] = [
        ['baal-tro', LAYOUT.FIRE_TRO, 1.2],
        ['baal-tvil', LAYOUT.FIRE_TVIL, 1.2],
        ['baal-ettermaele', LAYOUT.FIRE_ETTERMAELE, 1.35],
    ];
    const campfires = fires.map(([id, p, scale], i) => {
        const fire = addCampfire(engine, { id, pos: [p[0], 'terrain', p[1]], scale, audio: i === 0 });
        // Ekstra varm glød-halo så bålet leser tydelig på lav tier (ingen bloom der).
        const fy = engine.getTerrainHeight(p[0], p[1]);
        addGlowSprite(engine, { id: `${id}-halo`, pos: [p[0], fy + 0.8, p[1]], color: PALETTE.glow, size: 3.4 * scale, intensity: 0.9, pulse: { amount: 0.12, speed: 2.4 } });
        return fire;
    });
    // Fakler ved banneret (billig glød via additiv sprite).
    addGlowSprite(engine, { id: 'fakkel-1', pos: [-4, 2.0, 57], color: PALETTE.glow, size: 1.8, pulse: { amount: 0.1, speed: 3 } });
    addGlowSprite(engine, { id: 'fakkel-2', pos: [6, 2.0, 58], color: PALETTE.glow, size: 1.8, pulse: { amount: 0.12, speed: 2.6 } });

    // ── Noen tønner/kister i leiren ──────────────────────────────────────────
    addProp(engine, { id: 'tonne-1', model: 'barrel', pos: [-12, 'terrain', 55] });
    addProp(engine, { id: 'kiste-1', model: 'chest', pos: [12, 'terrain', 56] });
    addProp(engine, { id: 'tonne-2', model: 'barrel', pos: [14, 'terrain', 52] });

    return { sun, hemi, campfires };
}

// Raw kjegletelt (modell-presetene har ingen kjegle). Plasseres på terrenget.
function buildTent(engine: GameEngineRef, x: number, z: number, scale: number): void {
    const y = engine.getTerrainHeight(x, z);
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.scale.setScalar(scale);

    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(1.7, 2.4, 7),
        new THREE.MeshStandardMaterial({ color: PALETTE.tentCloth, roughness: 0.95, metalness: 0 }),
    );
    roof.position.y = 1.2;
    roof.castShadow = true;
    roof.receiveShadow = true;
    markSolid(roof, { shape: 'cylinder' });
    group.add(roof);

    // Stang som stikker opp av toppen.
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.6, 5),
        new THREE.MeshStandardMaterial({ color: PALETTE.woodDark }),
    );
    pole.position.y = 2.6;
    group.add(pole);

    engine.scene.add(group);
}

// Kongsbanner: høy stang + rødt tøy med Olavs gull-kors (canvas-tekstur). En lett
// sway gir liv uten å duplisere vaie-shaderen. Korset er den kristne kongens merke.
function buildKongsbanner(engine: GameEngineRef, x: number, z: number): void {
    const y = engine.getTerrainHeight(x, z);
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const poleH = 4.0;
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.07, poleH, 7),
        new THREE.MeshStandardMaterial({ color: PALETTE.woodDark, roughness: 0.9 }),
    );
    pole.position.y = poleH / 2;
    pole.castShadow = true;
    markSolid(pole, { shape: 'cylinder' });
    group.add(pole);

    // Finial på toppen.
    const knob = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 7),
        new THREE.MeshStandardMaterial({ color: PALETTE.bannerGold, metalness: 0.4, roughness: 0.5 }),
    );
    knob.position.y = poleH + 0.05;
    group.add(knob);

    // Kors-tøyet (canvas-tekstur: rødt felt + gull nordisk kors).
    const cv = document.createElement('canvas');
    cv.width = 96; cv.height = 128;
    const ctx = cv.getContext('2d')!;
    const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');
    ctx.fillStyle = hex(PALETTE.bannerRed);
    ctx.fillRect(0, 0, 96, 128);
    ctx.fillStyle = hex(PALETTE.bannerGold);
    ctx.fillRect(30, 0, 20, 128);   // vertikal korsarm (nordisk: forskjøvet mot stanga)
    ctx.fillRect(0, 50, 96, 20);    // horisontal korsarm
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;

    const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 2.0),
        new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.95, metalness: 0 }),
    );
    cloth.position.set(0.82, poleH - 1.2, 0); // henger ut til siden av stanga
    cloth.castShadow = true;
    group.add(cloth);

    engine.scene.add(group);

    // Lett sway (rotasjon rundt stanga) - billig liv, ingen shader.
    engine.registerUpdate((_dt, t) => {
        cloth.rotation.y = Math.sin(t * 0.8 + x) * 0.12;
    });
}
