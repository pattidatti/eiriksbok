import * as THREE from 'three';
import type { ParticlePresetName } from '../types';

// Partikkel-presets. Hver returnerer et oppdaterings-objekt med mesh og
// update-callback som kalleren kobler til engine.registerUpdate.
//
// Bevisst enkelt: én sprite-cluster per preset, Web-GL-billig. For avanserte
// effekter kan spillet bruke ParticleSystem-klassen direkte (se engine/ParticleSystem.ts).

export interface ParticleResult {
    group: THREE.Group;
    update: (dt: number, elapsed: number) => void;
}

type Factory = (scale: number) => ParticleResult;

function makeSpriteCluster(
    color: number,
    count: number,
    radius: number,
    rise: number,
    scale: number,
): ParticleResult {
    const group = new THREE.Group();
    const mat = new THREE.SpriteMaterial({ color, transparent: true, opacity: 0.7, depthWrite: false });
    type Particle = { sprite: THREE.Sprite; seed: number; offset: THREE.Vector3 };
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
        const sprite = new THREE.Sprite(mat.clone());
        const s = (0.08 + Math.random() * 0.15) * scale;
        sprite.scale.set(s, s, s);
        const offset = new THREE.Vector3(
            (Math.random() - 0.5) * radius * 2,
            Math.random() * 0.2,
            (Math.random() - 0.5) * radius * 2,
        );
        sprite.position.copy(offset);
        group.add(sprite);
        particles.push({ sprite, seed: Math.random() * 1000, offset });
    }
    const update = (dt: number, elapsed: number) => {
        void dt;
        for (const p of particles) {
            const t = ((elapsed + p.seed) % 2.5) / 2.5;
            p.sprite.position.y = p.offset.y + t * rise * scale;
            p.sprite.position.x = p.offset.x + Math.sin((elapsed + p.seed) * 2) * 0.05 * scale;
            (p.sprite.material as THREE.SpriteMaterial).opacity = 0.7 * (1 - t);
        }
    };
    return { group, update };
}

const FACTORIES: Record<ParticlePresetName, Factory> = {
    steam:       (s) => makeSpriteCluster(0xdddddd, 8, 0.25, 1.2, s),
    smoke:       (s) => makeSpriteCluster(0x444444, 10, 0.3, 1.5, s),
    dust:        (s) => makeSpriteCluster(0xaa9966, 6, 0.4, 0.6, s),
    sparks:      (s) => makeSpriteCluster(0xffaa22, 5, 0.15, 0.8, s),
    'candle-glow': (s) => makeSpriteCluster(0xffcc66, 3, 0.08, 0.3, s),
    'torch-flame': (s) => makeSpriteCluster(0xff7722, 4, 0.1, 0.5, s),
};

export function createParticle(preset: ParticlePresetName, scale: number = 1): ParticleResult {
    const factory = FACTORIES[preset];
    if (!factory) {
        throw new Error(`[declarative] Ukjent particle-preset: '${preset}'. Gyldige: ${Object.keys(FACTORIES).join(', ')}`);
    }
    return factory(scale);
}

export function isValidParticlePreset(name: string): name is ParticlePresetName {
    return name in FACTORIES;
}
