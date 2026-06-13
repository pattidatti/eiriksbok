import * as THREE from 'three';
import type { GameEngineRef } from '../../types';
import type {
    AddGlowSpriteConfig, AddCampfireConfig, AddWavingFlagConfig, AddZoneTitleConfig,
    AddLauncherConfig,
} from '../types';
import type { ProjectileVisual } from '../../systems/ProjectileSystem';
import { makeGlowTexture } from '../../TextureKit';
import { resolveY } from './_util';
import { addParticle, addAmbientAudio } from './media';

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
    const pos = resolveY(engine, config.pos);
    sprite.position.set(pos[0], pos[1], pos[2]);
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

/**
 * Ferdig bål: steinring + krysslagte stokker + glør + flammer + glød-sprite +
 * flickrende PointLight (animert av motoren, ALDRI i spill-loopen) + valgfri røyk
 * og knitre-lyd. Returnerer setLit(tent) for å tenne/slukke i runtime.
 */
export function addCampfire(
    engine: GameEngineRef,
    config: AddCampfireConfig,
): { group: THREE.Group; setLit: (lit: boolean) => void } {
    const scale = config.scale ?? 1;
    const pos = resolveY(engine, config.pos);
    const group = new THREE.Group();
    group.position.set(pos[0], pos[1], pos[2]);
    group.scale.setScalar(scale);
    group.name = `campfire-${config.id}`;

    // Steinring rundt bålgropen.
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6a6660, roughness: 1, metalness: 0 });
    const ringR = 0.7;
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), stoneMat);
        stone.position.set(Math.cos(a) * ringR, 0.08, Math.sin(a) * ringR);
        stone.rotation.set(Math.random(), Math.random(), Math.random());
        stone.castShadow = true;
        group.add(stone);
    }

    // Krysslagte stokker.
    const logMat = new THREE.MeshStandardMaterial({ color: 0x4a3322, roughness: 1, metalness: 0 });
    for (let i = 0; i < 3; i++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 6), logMat);
        log.rotation.set(Math.PI / 2, (i / 3) * Math.PI, 0);
        log.position.y = 0.12 + i * 0.04;
        log.castShadow = true;
        group.add(log);
    }

    // Glør-disk.
    const embers = new THREE.Mesh(
        new THREE.CircleGeometry(0.45, 12),
        new THREE.MeshStandardMaterial({ color: 0xff5522, emissive: 0xff3300, emissiveIntensity: 3, roughness: 1 }),
    );
    embers.rotation.x = -Math.PI / 2;
    embers.position.y = 0.06;
    group.add(embers);

    // Flamme-kjegler (statiske - flicker bor i lyset, ikke i geometrien).
    const flame1 = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 0.95, 7),
        new THREE.MeshStandardMaterial({ color: 0xff7722, emissive: 0xff4400, emissiveIntensity: 4, roughness: 1 }),
    );
    flame1.position.y = 0.55;
    group.add(flame1);
    const flame2 = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.55, 6),
        new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0xffaa22, emissiveIntensity: 5, roughness: 1 }),
    );
    flame2.position.y = 0.82;
    group.add(flame2);

    // Billig glød-halo via additiv sprite (i stedet for et nytt PointLight per bål).
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlowTexture({ innerColor: '#ffd58a', outerColor: '#ff6a1a' }),
        color: 0xffa64d,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: true,
    }));
    glow.scale.set(2.4, 2.4, 1);
    glow.position.y = 0.7;
    group.add(glow);

    engine.scene.add(group);

    // Ett flickrende PointLight, animert av motoren.
    const lightIntensity = config.light ?? 18;
    let light: THREE.PointLight | null = null;
    if (lightIntensity > 0) {
        light = new THREE.PointLight(0xff7722, lightIntensity, 14 * scale);
        light.position.set(pos[0], pos[1] + 1.4 * scale, pos[2]);
        engine.scene.add(light);
        engine.registerAnimatedLight(light, 'flicker', lightIntensity);
    }

    if (config.smoke !== false) {
        addParticle(engine, { id: `${config.id}-smoke`, preset: 'smoke', pos: [pos[0], pos[1] + 1.0 * scale, pos[2]], scale });
    }
    if (config.audio) {
        addAmbientAudio(engine, { id: `${config.id}-crackle`, audio: 'fire-crackle', pos: [pos[0], pos[1] + 0.5, pos[2]], radius: 9, volume: 0.5 });
    }

    const flameParts = [embers, flame1, flame2, glow];
    const setLit = (lit: boolean) => {
        for (const p of flameParts) p.visible = lit;
        if (light) light.visible = lit;
    };
    setLit(config.lit !== false);

    return { group, setLit };
}

// Delt vaie-shader for faner. uTime er per-material (oppdateres av kit-ens egen
// registerUpdate), waveSpeed/waveAmount + farger/striper er per-material uniforms.
const flagVertex = `
    uniform float uTime;
    uniform float uWaveSpeed;
    uniform float uWaveAmount;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        vec3 p = position;
        // Anchor mot venstre kant (uv.x = 0): nær stanga vaier den ikke.
        float anchor = smoothstep(0.0, 0.85, uv.x);
        float wave = sin(uv.x * 6.0 + uTime * uWaveSpeed) * uWaveAmount
                   + sin(uv.y * 5.0 + uTime * uWaveSpeed * 0.7) * uWaveAmount * 0.35;
        p.z += wave * anchor;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
`;
const flagFragment = `
    uniform vec3 uTop;
    uniform vec3 uBottom;
    uniform float uStripes;
    varying vec2 vUv;
    void main() {
        vec3 c = mix(uBottom, uTop, vUv.y);
        if (uStripes > 0.5) {
            float stripe = step(0.5, fract(vUv.x * uStripes));
            c = mix(c, c * 0.78, stripe * 0.35);
        }
        gl_FragColor = vec4(c, 1.0);
    }
`;

/**
 * Vaiende fane/banner på stang. Konsoliderer banner-mønsteret spillene før
 * håndrullet. Vaie-animasjonen kjøres internt - spill-loopen forblir ren.
 */
export function addWavingFlag(
    engine: GameEngineRef,
    config: AddWavingFlagConfig,
): { group: THREE.Group } {
    const [w, h] = config.size ?? [1.6, 1.0];
    const pos = resolveY(engine, config.pos);
    const group = new THREE.Group();
    group.position.set(pos[0], pos[1], pos[2]);
    group.name = `flag-${config.id}`;

    const top = new THREE.Color(config.colors?.top ?? 0xe03828);
    const bottom = new THREE.Color(config.colors?.bottom ?? 0xf29a40);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uWaveSpeed: { value: config.waveSpeed ?? 3 },
            uWaveAmount: { value: config.waveAmount ?? 0.12 },
            uTop: { value: top },
            uBottom: { value: bottom },
            uStripes: { value: config.stripes ?? 4 },
        },
        vertexShader: flagVertex,
        fragmentShader: flagFragment,
        side: THREE.DoubleSide,
    });

    const banner = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 14, 6), material);
    // Plasser fanen så venstre kant ligger ved stanga, øvre del øverst.
    banner.position.set(w / 2, h * 0.5, 0);
    group.add(banner);

    if (config.pole !== false) {
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 0.9, metalness: 0 });
        const poleH = h + 1.2;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, poleH, 8), poleMat);
        pole.position.set(0, poleH / 2 - 0.2, 0);
        pole.castShadow = true;
        group.add(pole);
    }

    engine.scene.add(group);
    engine.registerUpdate((_dt, elapsed) => {
        material.uniforms.uTime.value = elapsed;
    });

    return { group };
}

/**
 * Proximity-trigget sonetittel (Fase 8). Når spilleren går inn i `area` vises en
 * stor serif-tittel via engine.showZoneTitle. Bruk for stedsnavn ("Stiklestad").
 */
export function addZoneTitle(engine: GameEngineRef, config: AddZoneTitleConfig): void {
    const once = config.once !== false;
    let fired = false;
    engine.registerUpdate(() => {
        if (fired && once) return;
        const p = engine.getPlayerPosition();
        const inside =
            p.x >= config.area.minX && p.x <= config.area.maxX &&
            p.z >= config.area.minZ && p.z <= config.area.maxZ;
        if (inside && !fired) {
            fired = true;
            engine.showZoneTitle(config.title, { subtitle: config.subtitle, durationMs: config.durationMs });
        } else if (!inside && !once) {
            fired = false;
        }
    });
}

const LAUNCHER_DEFAULTS: Record<AddLauncherConfig['kind'], { force: number; upBias: number; visual: ProjectileVisual; label: string }> = {
    spear: { force: 18, upBias: 1.4, visual: 'spear', label: 'Ta spyd (E)' },
    bow:   { force: 26, upBias: 0.6, visual: 'arrow', label: 'Ta bue (E)' },
    sling: { force: 22, upBias: 1.8, visual: 'stone', label: 'Ta slynge (E)' },
};

/**
 * Våpenstativ (Fase 8). E utruster spilleren; deretter hold F = lad, slipp = skyt.
 * Limer charge-throw (C1) og ProjectileSystem (C2) sammen. Ett kast-verb for alt.
 */
export function addLauncher(engine: GameEngineRef, config: AddLauncherConfig): { group: THREE.Group } {
    const def = LAUNCHER_DEFAULTS[config.kind];
    const force = config.force ?? def.force;
    const ammoMax = config.ammo ?? 5;
    const pos = resolveY(engine, config.pos);

    // Enkelt stativ: et skråstilt våpen mot en kort stolpe.
    const group = new THREE.Group();
    group.position.set(pos[0], pos[1], pos[2]);
    if (config.rot) group.rotation.set(config.rot[0], config.rot[1], config.rot[2]);
    group.name = `launcher-${config.id}`;

    const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 1.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 0.9 }),
    );
    post.position.y = 0.6;
    post.castShadow = true;
    group.add(post);

    const weapon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6),
        new THREE.MeshStandardMaterial({ color: 0x7a5a36, roughness: 0.85 }),
    );
    weapon.position.set(0.1, 0.9, 0);
    weapon.rotation.z = 0.35;
    weapon.castShadow = true;
    group.add(weapon);

    engine.scene.add(group);

    const equip = () => {
        engine.equipLauncher({
            minForce: force * 0.45,
            maxForce: force,
            upBias: def.upBias,
            chargeTimeMs: 850,
            ammo: ammoMax,
            fire: (origin, velocity) => {
                engine.spawnProjectile({
                    from: origin,
                    velocity,
                    visual: def.visual,
                    onHit: (hit) => {
                        if (hit.target) config.onHitTarget?.();
                    },
                });
            },
            onAmmoEmpty: () => {
                config.onAmmoEmpty?.();
                engine.unequipLauncher();
            },
        });
    };

    engine.registerInteract(weapon, {
        label: def.label,
        radius: 2.4,
        onInteract: equip,
    });

    return { group };
}
