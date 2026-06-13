import * as THREE from 'three';
import type { GameEngineRef } from '../../types';
import type { AddTargetConfig } from '../types';
import { resolveY } from './_util';

// ─── addTarget (Fase 8) ──────────────────────────────────────────────────────
// Bygger en blink (halmskive på stolpe) og registrerer den som et prosjektil-mål.
// Ved treff kjøres valgte reaksjoner: flash (emissiv puls), knock (veltes), shatter
// (sprekker i fragmenter). Returnerer reset() for å gjenoppbygge målet manuelt.

const FACE_HEIGHT = 1.2; // høyde fra bakken til skivesenter

export function addTarget(
    engine: GameEngineRef,
    config: AddTargetConfig,
): { group: THREE.Group; reset: () => void } {
    const pos = resolveY(engine, config.pos);
    const radius = config.radius ?? 0.55;
    const reactions = config.reactions ?? ['flash'];

    const group = new THREE.Group();
    group.position.set(pos[0], pos[1], pos[2]);
    group.name = `target-${config.id}`;

    // Stolpe.
    const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.07, FACE_HEIGHT - 0.3, 6),
        new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 0.9 }),
    );
    post.position.y = (FACE_HEIGHT - 0.3) / 2;
    post.castShadow = true;
    group.add(post);

    // Halmskive med konsentriske ringer (bullseye). Står vertikalt, ser langs Z.
    const faceGroup = new THREE.Group();
    faceGroup.position.y = FACE_HEIGHT;
    const ringColors = [0xd8c48a, 0xffffff, 0xc23b22, 0xffffff, 0xc23b22];
    const flashMats: THREE.MeshStandardMaterial[] = [];
    for (let i = 0; i < ringColors.length; i++) {
        const r = radius * (1 - i / ringColors.length);
        const mat = new THREE.MeshStandardMaterial({
            color: ringColors[i],
            roughness: 0.85,
            emissive: 0xffd27a,
            emissiveIntensity: 0,
        });
        flashMats.push(mat);
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.08 - i * 0.01, 18), mat);
        disc.rotation.x = Math.PI / 2; // sirkelflate mot ±Z
        disc.position.z = i * 0.012;
        disc.castShadow = i === 0;
        faceGroup.add(disc);
    }
    group.add(faceGroup);
    engine.scene.add(group);

    // Animasjons-state, drevet av én registerUpdate-closure.
    let flashT = 0;
    let knockT = -1; // -1 = inaktiv
    const fragments: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
    let hit = false;

    engine.registerUpdate((dt) => {
        if (flashT > 0) {
            flashT = Math.max(0, flashT - dt);
            const k = flashT / 0.4;
            for (const m of flashMats) m.emissiveIntensity = k * 1.6;
        }
        if (knockT >= 0) {
            knockT = Math.min(1, knockT + dt * 2.2);
            group.rotation.x = -1.25 * easeOut(knockT);
        }
        if (fragments.length) {
            const grav = engine.config.physics?.gravity ?? -18;
            for (const f of fragments) {
                f.life += dt;
                f.vel.y += grav * dt; // fall
                f.mesh.position.addScaledVector(f.vel, dt);
                f.mesh.rotation.x += dt * 4;
                f.mesh.rotation.z += dt * 3;
                const mat = f.mesh.material as THREE.MeshStandardMaterial;
                mat.opacity = Math.max(0, 1 - f.life / 2);
            }
            // Rydd ferdige fragmenter.
            for (let i = fragments.length - 1; i >= 0; i--) {
                if (fragments[i].life >= 2) {
                    const f = fragments[i];
                    group.remove(f.mesh);
                    f.mesh.geometry.dispose();
                    (f.mesh.material as THREE.Material).dispose();
                    fragments.splice(i, 1);
                }
            }
        }
    });

    const record = {
        id: config.id,
        center: new THREE.Vector3(pos[0], pos[1] + FACE_HEIGHT, pos[2]),
        radius,
        onHit: () => {
            if (hit) return;
            hit = true;
            engine.removeProjectileTarget(config.id);
            // Treff-feedback: kraftig dunk på treffpunktet + hitmarker + lett shake, så
            // spilleren tydelig kjenner at skuddet satt (i tillegg til reaksjonene under).
            engine.playOneShot('proc:drum-hit', { position: [record.center.x, record.center.y, record.center.z], volume: 0.6 });
            engine.flashHitMarker();
            engine.cameraShake(0.08, 0.16);
            if (reactions.includes('flash')) flashT = 0.4;
            if (reactions.includes('knock')) knockT = 0;
            if (reactions.includes('shatter')) doShatter();
            config.onHit?.();
            if (config.resetAfterMs) engine.schedule(reset, config.resetAfterMs);
        },
    };
    engine.addProjectileTarget(record);

    function doShatter(): void {
        faceGroup.visible = false;
        for (let i = 0; i < 8; i++) {
            const frag = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.12, 0.06),
                new THREE.MeshStandardMaterial({ color: 0xd8c48a, roughness: 0.9, transparent: true, opacity: 1 }),
            );
            frag.position.set((Math.random() - 0.5) * 0.4, FACE_HEIGHT + (Math.random() - 0.5) * 0.4, 0);
            group.add(frag);
            fragments.push({
                mesh: frag,
                vel: new THREE.Vector3((Math.random() - 0.5) * 3, 1 + Math.random() * 2, 1 + Math.random() * 2),
                life: 0,
            });
        }
    }

    function reset(): void {
        hit = false;
        flashT = 0;
        knockT = -1;
        group.rotation.x = 0;
        faceGroup.visible = true;
        for (const m of flashMats) m.emissiveIntensity = 0;
        engine.addProjectileTarget(record);
    }

    return { group, reset };
}

function easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}
