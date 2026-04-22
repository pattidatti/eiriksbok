import * as THREE from 'three';
import type { LightConfig } from './types';

/**
 * Bygger en hengende pærelampe: snor + lysende kule + glød-halo + lyskjegle + PointLight.
 *
 * cfg.position er der PointLight sitter.
 * Kule og snor henger 0.2–1.2 enheter over.
 * Kjegle peker nedover fra pæren (synlig lysstråle med additivt blending).
 */
export function buildHangingLight(scene: THREE.Scene, cfg: LightConfig): THREE.PointLight {
    const [x, y, z] = cfg.position;
    const color = cfg.color ?? 0xffeedd;
    const intensity = cfg.intensity ?? 3.0;
    const distance = cfg.distance ?? 15;
    const decay = cfg.decay ?? 1.5;

    const light = new THREE.PointLight(color, intensity, distance, decay);
    light.position.set(x, y, z);
    if (cfg.castShadow) {
        light.castShadow = true;
        light.shadow.mapSize.set(512, 512);
    }
    scene.add(light);

    if (cfg.showBulb !== false) {
        const bulbY = y + 0.2;
        const cordCenterY = y + 0.7;

        // Snor
        const cord = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 1.0, 4),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        cord.position.set(x, cordCenterY, z);
        scene.add(cord);

        // Selve pæren (tett emissiv kule)
        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 8, 6),
            new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: 6.0,
                roughness: 0.05,
                metalness: 0.2,
            })
        );
        bulb.position.set(x, bulbY, z);
        scene.add(bulb);

        // Glød-halo rundt pæren (additivt, myk sfære)
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.38, 10, 8),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.22,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            })
        );
        glow.position.set(x, bulbY, z);
        scene.add(glow);

        // Lyskjegle – synlig stråle nedover fra pæren
        const coneH = cfg.coneHeight ?? 3.2;
        const coneR = cfg.coneRadius ?? 1.25;
        const coneOpacity = cfg.coneOpacity ?? 0.07;

        // CylinderGeometry som truncated cone: liten topp, bred bunn
        // openEnded=true fjerner toppdeksel og bunndeksel (ren skall-effekt)
        const coneGeo = new THREE.CylinderGeometry(0.04, coneR, coneH, 20, 1, true);
        const coneMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: coneOpacity,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        // Apex (topp) skal ligge på bulbY; CylinderGeometry-senter er midt på høyden
        cone.position.set(x, bulbY - coneH / 2, z);
        scene.add(cone);
    }

    return light;
}
