import * as THREE from 'three';
import type { GameEngineRef } from '../../types';
import type { AddGlowSpriteConfig } from '../types';
import { makeGlowTexture } from '../../TextureKit';

// ─── Eleganse-kits ───────────────────────────────────────────────────────────
// Ferdigmonterte visuelle byggesteiner som konsoliderer mønstre spillene før
// håndrullet hver for seg (glød, bål, faner). All animasjon (flicker, puls,
// vaiing) registreres internt - spillets update-loop skal ALDRI inneholde
// sinus-animasjon av disse.

/**
 * Additiv glød-sprite: billig «bloom» per objekt uten PointLight. Bruk denne
 * for alt som skal gløde på avstand (bål, fakler, magi, vinduer) - en sprite
 * koster nesten ingenting, mens hvert ekstra PointLight koster på lav tier.
 */
export function addGlowSprite(
    engine: GameEngineRef,
    config: AddGlowSpriteConfig,
): { sprite: THREE.Sprite } {
    const size = config.size ?? 1.5;
    const intensity = config.intensity ?? 0.8;
    const mat = new THREE.SpriteMaterial({
        map: makeGlowTexture(),
        color: config.color,
        transparent: true,
        opacity: intensity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: true,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.name = `glow-${config.id}`;
    sprite.scale.set(size, size, 1);
    sprite.position.set(config.pos[0], config.pos[1], config.pos[2]);
    engine.scene.add(sprite);

    const pulse = config.pulse;
    if (pulse) {
        engine.registerUpdate((_dt, elapsed) => {
            const s = size * (1 + Math.sin(elapsed * pulse.speed) * pulse.amount);
            sprite.scale.set(s, s, 1);
        });
    }
    return { sprite };
}
