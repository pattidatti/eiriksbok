import * as THREE from 'three';
import type { LightingPresetName } from '../types';
import { registerMainSunLight, registerMainHemiLight } from '../../sceneUserData';

// Lighting-presets: én funksjon per preset som legger til ALT som trengs
// (sun, hemi, ambient, evt accent point/spot lights) og registrerer
// hovedlysene i scene.userData så TimeOfDaySystem kan plukke dem opp.
//
// Hvorfor: §16.1 i gamle BUILD_GAME_GUIDE.md beskriver at "scenen blir svart"
// hvis preset:'open' brukes uten lights. Dette erstatter den fallgruven -
// ingen agent trenger å huske å registrere sun + hemi, de får hele pakken.

export interface LightingResult {
    sun?: THREE.DirectionalLight;
    hemi?: THREE.HemisphereLight;
    ambient?: THREE.AmbientLight;
    accents?: THREE.Light[];
}

type Builder = (scene: THREE.Scene) => LightingResult;

function addSun(
    scene: THREE.Scene,
    color: number,
    intensity: number,
    pos: [number, number, number] = [10, 15, 5],
): THREE.DirectionalLight {
    const sun = new THREE.DirectionalLight(color, intensity);
    sun.position.set(...pos);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const s = sun.shadow.camera;
    s.left = s.bottom = -15;
    s.right = s.top = 15;
    s.near = 1;
    s.far = 40;
    scene.add(sun);
    registerMainSunLight(scene, sun);
    return sun;
}

function addHemi(
    scene: THREE.Scene,
    sky: number,
    ground: number,
    intensity: number,
): THREE.HemisphereLight {
    const hemi = new THREE.HemisphereLight(sky, ground, intensity);
    scene.add(hemi);
    registerMainHemiLight(scene, hemi);
    return hemi;
}

function addAmbient(scene: THREE.Scene, color: number, intensity: number): THREE.AmbientLight {
    const amb = new THREE.AmbientLight(color, intensity);
    scene.add(amb);
    return amb;
}

const BUILDERS: Record<LightingPresetName, Builder> = {
    'warm-interior': (scene) => ({
        sun: addSun(scene, 0xffe4b5, 1.2, [8, 12, 6]),
        hemi: addHemi(scene, 0xffeedd, 0xaa8866, 0.9),
        ambient: addAmbient(scene, 0xffffff, 0.4),
    }),
    'cold-interior': (scene) => ({
        sun: addSun(scene, 0xc0d8ff, 0.7, [5, 12, 8]),
        hemi: addHemi(scene, 0xb0c8e0, 0x505866, 0.7),
        ambient: addAmbient(scene, 0xffffff, 0.35),
    }),
    'forge-red': (scene) => {
        const hemi = addHemi(scene, 0x553322, 0x221108, 0.4);
        const amb = addAmbient(scene, 0xff7744, 0.3);
        const forge = new THREE.PointLight(0xff5522, 3.0, 14, 1.5);
        forge.position.set(0, 2.5, 0);
        forge.castShadow = true;
        scene.add(forge);
        return { hemi, ambient: amb, accents: [forge] };
    },
    'dim-candle': (scene) => {
        const hemi = addHemi(scene, 0x332211, 0x110805, 0.25);
        const amb = addAmbient(scene, 0xffddaa, 0.2);
        return { hemi, ambient: amb };
    },
    'prison-cell': (scene) => {
        // Svakt lys fra vindu + én candle. Dystert og bokstavelig mørkt.
        const sun = addSun(scene, 0xffeec0, 0.5, [-6, 14, -2]);
        const hemi = addHemi(scene, 0x6a5a4a, 0x1a1410, 0.35);
        const amb = addAmbient(scene, 0xffddbb, 0.25);
        const candle = new THREE.PointLight(0xffaa55, 1.6, 6, 2);
        candle.position.set(0, 1.5, 2);
        candle.castShadow = true;
        scene.add(candle);
        return { sun, hemi, ambient: amb, accents: [candle] };
    },
    chapel: (scene) => {
        const sun = addSun(scene, 0xfff4d0, 1.0, [0, 16, -8]);
        const hemi = addHemi(scene, 0xfff0e0, 0x806860, 0.6);
        const amb = addAmbient(scene, 0xffffff, 0.35);
        return { sun, hemi, ambient: amb };
    },
    'outdoor-day': (scene) => ({
        sun: addSun(scene, 0xfff4e0, 1.5, [12, 20, 8]),
        hemi: addHemi(scene, 0x88b8ff, 0x6a8050, 0.9),
        ambient: addAmbient(scene, 0xffffff, 0.3),
    }),
    'outdoor-dusk': (scene) => ({
        sun: addSun(scene, 0xff9a55, 0.9, [-12, 6, 2]),
        hemi: addHemi(scene, 0xff9a6a, 0x403a5a, 0.7),
        ambient: addAmbient(scene, 0xffccaa, 0.3),
    }),
    'outdoor-night': (scene) => ({
        hemi: addHemi(scene, 0x304868, 0x100818, 0.45),
        ambient: addAmbient(scene, 0x5a7aa8, 0.25),
    }),
};

/** Bygg alle lys for et preset. Returnerer referanser slik at callere kan tweake videre. */
export function applyLightingPreset(
    scene: THREE.Scene,
    preset: LightingPresetName
): LightingResult {
    const builder = BUILDERS[preset];
    if (!builder) {
        throw new Error(`[declarative] Ukjent lighting-preset: '${preset}'. Gyldige: ${Object.keys(BUILDERS).join(', ')}`);
    }
    return builder(scene);
}

export function isValidLightingPreset(name: string): name is LightingPresetName {
    return name in BUILDERS;
}
