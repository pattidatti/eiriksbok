// Scene-oppsett for Oljeplattform-spillet.
//
// En Ekofisk-inspirert nordsjø-plattform ved solnedgang. Dekket er et stort
// jern-"gulv" bygget via buildOutdoor. Oppå dekket står tre stasjoner (brønnhode,
// separator, eksport-panel), en flammetårn-mast med evig brennende fakkel, et
// boretårn i silhuett, helikopterdekk med helikopter, og rekkverk rundt kanten.
//
// Narrativ flyt:
//   1) Gunnar introduserer oppdraget.
//   2) Spilleren interagerer med brønnhodet → flag 'visited-wellhead', fase 'started'.
//   3) Spilleren interagerer med separatoren → flag 'visited-separator', fase 'knows-flow'.
//   4) Spilleren trekker eksport-spaken → fase 'done', triggerEnd.
//
// Alt gating er flagg-basert. Hver interactable sjekker forrige flagg før dialog
// som forklarer det pedagogiske poenget.

import * as THREE from 'three';
import type { GameEngineRef } from '../engine/types';
import {
    buildOutdoor,
    addProp,
    addInteractable,
    addNPC,
    addMonolog,
    addParticle,
    addAmbientAudio,
} from '../engine/declarative';

export function setupOljeplattformScene(engine: GameEngineRef): void {
    // ─── Dekk + himmel + sol ─────────────────────────────────────────────────
    // buildOutdoor gir oss et sirkulært jern-dekk (steel color), usynlige grense-
    // vegger som hindrer at spilleren faller av, og outdoor-dusk-lys-preset.
    buildOutdoor(engine, {
        id: 'platform-deck',
        radius: 22,
        ground: 'iron',
        boundary: true,
        lights: 'outdoor-dusk',
        sky: 'procedural',
    });

    // ─── Visuelt hav under dekket ────────────────────────────────────────────
    // En stor, mørk blå sirkel langt nedenfor dekket. Ikke-solid, kun visuelt
    // bakteppe som får dekket til å se ut som det henger over havet.
    addProp(engine, {
        id: 'sea-backdrop',
        model: { primitive: 'cylinder', size: [90, 0.4], color: 0x1a2838 },
        pos: [0, -6, 0],
        material: 'water',
        solid: false,
        castShadow: false,
        receiveShadow: false,
    });

    // ─── Plattform-bein (visuelle søyler som forsvinner ned i havet) ─────────
    const legPositions: Array<[number, number]> = [
        [15, 15], [-15, 15], [15, -15], [-15, -15],
    ];
    for (let i = 0; i < legPositions.length; i++) {
        const [x, z] = legPositions[i];
        addProp(engine, {
            id: `leg-${i}`,
            model: { primitive: 'cylinder', size: [1.2, 14], color: 0x6a6a70 },
            pos: [x, -7, z],
            material: 'iron',
            solid: false,
        });
    }

    // ─── Rekkverk rundt dekket ───────────────────────────────────────────────
    // Åtte lange gule rør på kanten. Visuelt markerer kanten. De usynlige
    // boundary-veggene fra buildOutdoor håndterer selve kollisjonen.
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 21;
        const z = Math.sin(angle) * 21;
        // Stolper
        addProp(engine, {
            id: `rail-post-${i}`,
            model: { primitive: 'cylinder', size: [0.08, 1.1], color: 0xd4a83a },
            pos: [x, 0.55, z],
            solid: false,
        });
    }
    // Horisontale rekkverk-bånd - tolv segmenter.
    for (let i = 0; i < 12; i++) {
        const a1 = (i / 12) * Math.PI * 2;
        const a2 = ((i + 1) / 12) * Math.PI * 2;
        const x1 = Math.cos(a1) * 21;
        const z1 = Math.sin(a1) * 21;
        const x2 = Math.cos(a2) * 21;
        const z2 = Math.sin(a2) * 21;
        const mx = (x1 + x2) / 2;
        const mz = (z1 + z2) / 2;
        const len = Math.hypot(x2 - x1, z2 - z1);
        const yaw = Math.atan2(x2 - x1, z2 - z1);
        addProp(engine, {
            id: `rail-bar-${i}-upper`,
            model: { primitive: 'box', size: [0.08, 0.08, len], color: 0xd4a83a },
            pos: [mx, 1.05, mz],
            rot: [0, yaw, 0],
            solid: false,
        });
        addProp(engine, {
            id: `rail-bar-${i}-lower`,
            model: { primitive: 'box', size: [0.08, 0.08, len], color: 0xd4a83a },
            pos: [mx, 0.5, mz],
            rot: [0, yaw, 0],
            solid: false,
        });
    }

    // ─── Plattform-lyskastere (industri-floodlights på master) ──────────────
    // Hver lyskaster består av en stålmast, en horisontal arm, et boks-formet
    // lampehus og et lysende (emissive) front-"glass". Inne i husetet sitter en
    // kraftig THREE.SpotLight som faktisk lyser. Raw Three.js her er dokumentert
    // escape hatch (BUILD_GAME_GUIDE §9.1) - det finnes ingen lys-builder.
    const addFloodlight = (
        idPrefix: string,
        base: [number, number],        // [x, z] - mastens fot på dekket
        poleHeight: number,            // meter
        armYaw: number,                // hvilken retning armen peker (radianer, 0 = +X)
        armLength: number,             // meter ut fra masten
        target: [number, number, number], // hvor lyset skal treffe
        color: number,
        intensity: number,
        angle: number,
    ) => {
        const [bx, bz] = base;
        // Fot-plate
        const baseMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.12, 0.7),
            new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.8 }),
        );
        baseMesh.position.set(bx, 0.06, bz);
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        engine.scene.add(baseMesh);
        // Mast
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.12, poleHeight, 12),
            new THREE.MeshStandardMaterial({ color: 0x5a5a62, roughness: 0.6, metalness: 0.3 }),
        );
        pole.position.set(bx, poleHeight / 2, bz);
        pole.castShadow = true;
        engine.scene.add(pole);
        // Arm (horisontal rørstump)
        const armMid: [number, number, number] = [
            bx + Math.cos(armYaw) * (armLength / 2),
            poleHeight - 0.1,
            bz + Math.sin(armYaw) * (armLength / 2),
        ];
        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, armLength, 10),
            new THREE.MeshStandardMaterial({ color: 0x5a5a62, roughness: 0.6, metalness: 0.3 }),
        );
        arm.position.set(armMid[0], armMid[1], armMid[2]);
        arm.rotation.z = Math.PI / 2;
        arm.rotation.y = -armYaw;
        arm.castShadow = true;
        engine.scene.add(arm);
        // Lampehus (boks) på enden av armen
        const housingPos: [number, number, number] = [
            bx + Math.cos(armYaw) * armLength,
            poleHeight - 0.2,
            bz + Math.sin(armYaw) * armLength,
        ];
        const housing = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.5, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.7, metalness: 0.4 }),
        );
        housing.position.set(housingPos[0], housingPos[1], housingPos[2]);
        // Roter hus så "front" peker mot target
        const dx = target[0] - housingPos[0];
        const dz = target[2] - housingPos[2];
        const hy = target[1] - housingPos[1];
        const housingYaw = Math.atan2(dx, dz);
        const housingPitch = Math.atan2(hy, Math.hypot(dx, dz));
        housing.rotation.y = housingYaw;
        housing.rotation.x = housingPitch;
        housing.castShadow = true;
        engine.scene.add(housing);
        // Lysende glassfront på lampehuset - emissive, så det faktisk gløder.
        const lens = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.4, 0.05),
            new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 2.5,
                roughness: 0.3,
            }),
        );
        lens.position.copy(housing.position);
        // Flytt lensen litt framover (mot target) fra husets senter
        const fwd = new THREE.Vector3(
            Math.sin(housingYaw) * Math.cos(housingPitch),
            Math.sin(housingPitch),
            Math.cos(housingYaw) * Math.cos(housingPitch),
        );
        lens.position.addScaledVector(fwd, 0.26);
        lens.rotation.copy(housing.rotation);
        engine.scene.add(lens);
        // Selve SpotLight-en, plassert i husets senter, peker mot target
        const spot = new THREE.SpotLight(color, intensity, 50, angle, 0.4, 1.0);
        spot.position.set(housingPos[0], housingPos[1], housingPos[2]);
        spot.target.position.set(target[0], target[1], target[2]);
        spot.castShadow = true;
        spot.shadow.mapSize.set(1024, 1024);
        spot.shadow.camera.near = 0.5;
        spot.shadow.camera.far = 50;
        spot.userData._oljeplattformLight = idPrefix;
        engine.scene.add(spot);
        engine.scene.add(spot.target);
        // Synlig lyskjegle: en transparent cone-mesh som antyder lysstrålen i
        // sen-skumrings-atmosfære (volumetrisk-feel på billig måte).
        const coneLen = 8;
        const coneRad = Math.tan(angle) * coneLen;
        const cone = new THREE.Mesh(
            new THREE.ConeGeometry(coneRad, coneLen, 16, 1, true),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.08,
                side: THREE.DoubleSide,
                depthWrite: false,
            }),
        );
        // Cone default: spiss opp (+Y). Vi vil at den peker langs (target - pos).
        const dir = new THREE.Vector3(
            target[0] - housingPos[0],
            target[1] - housingPos[1],
            target[2] - housingPos[2],
        ).normalize();
        cone.position.set(
            housingPos[0] + dir.x * coneLen / 2,
            housingPos[1] + dir.y * coneLen / 2,
            housingPos[2] + dir.z * coneLen / 2,
        );
        // Juster rotasjon så cone-aksen matcher dir
        const up = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().negate());
        cone.quaternion.copy(quat);
        engine.scene.add(cone);
    };

    // Fire dedikerte arbeidslyskastere rundt stasjonene.
    // Brønnhodet - varm oransje fra sør-øst
    addFloodlight(
        'flood-wellhead',
        [3.5, 1.5], 5.5, Math.PI, 1.5,
        [0, 1.2, -2], 0xffb878, 120, Math.PI / 5,
    );
    // Separator - kald blåhvit fra øst
    addFloodlight(
        'flood-separator',
        [9, -6], 6.5, Math.PI, 2.0,
        [5, 2, -6], 0xe0eaff, 110, Math.PI / 5,
    );
    // Eksport-panel - varm gul-hvit fra nord
    addFloodlight(
        'flood-export',
        [-6, -13], 5.0, Math.PI / 2, 1.8,
        [-6, 1.4, -9], 0xffe4b8, 110, Math.PI / 5,
    );
    // Helidekket - bred hvit fra mast-toppen i hjørnet
    addFloodlight(
        'flood-heli',
        [15, 15], 8.0, Math.atan2(12 - 15, 10 - 15), 1.2,
        [10, 0.5, 12], 0xfff5e0, 130, Math.PI / 4.5,
    );

    // Ekstra fill-belysning: 6 røde varsellys rundt dekket-kanten
    // (små emissive-sfærer med svak point-light, typisk for plattform-rigger).
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 12;
        const x = Math.cos(angle) * 21;
        const z = Math.sin(angle) * 21;
        const warn = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0xff2010,
                emissive: 0xff2010,
                emissiveIntensity: 3,
            }),
        );
        warn.position.set(x, 1.3, z);
        engine.scene.add(warn);
        const warnLight = new THREE.PointLight(0xff4020, 8, 6, 2);
        warnLight.position.set(x, 1.3, z);
        engine.scene.add(warnLight);
    }

    // Ekstra ambient fill for dekket som helhet (mindre mørk grunntone).
    const deckFill = new THREE.HemisphereLight(0xfff0d8, 0x1a2838, 1.2);
    deckFill.position.set(0, 12, 0);
    engine.scene.add(deckFill);

    // Sterkere hoved-"mån-"lys ovenfra som basebelysning, siden outdoor-dusk alene
    // er svært svak.
    const fillTop = new THREE.DirectionalLight(0xffdab0, 1.4);
    fillTop.position.set(20, 25, 15);
    fillTop.castShadow = false; // unngå dobbel-skygge-beregning, sola tar det
    engine.scene.add(fillTop);

    // ─── Gule dekk-striper (rundt sentrum) ───────────────────────────────────
    // Industri-gul sikkerhetsmaling. Ren dekorasjon.
    for (let i = 0; i < 4; i++) {
        const angle = i * (Math.PI / 2) + Math.PI / 4;
        const x = Math.cos(angle) * 9;
        const z = Math.sin(angle) * 9;
        addProp(engine, {
            id: `deck-stripe-${i}`,
            model: { primitive: 'box', size: [4, 0.03, 0.4], color: 0xd4a83a },
            pos: [x, 0.015, z],
            rot: [0, angle, 0],
            solid: false,
            castShadow: false,
        });
    }

    // ─── BRØNNHODE (wellhead / juletre) ──────────────────────────────────────
    // Stablet ventil-"juletre" med fire ventilhjul og en rød toppkupel.
    // Plassering: midt-nord av dekket.
    const wellheadX = 0, wellheadZ = -2;
    // Grunnplate
    addProp(engine, {
        id: 'wellhead-base',
        model: { primitive: 'box', size: [1.6, 0.25, 1.6], color: 0x4a4a50 },
        pos: [wellheadX, 0.13, wellheadZ],
        material: 'iron',
    });
    // Hoved-sylinder (stammen på juletreet)
    addProp(engine, {
        id: 'wellhead-stem',
        model: { primitive: 'cylinder', size: [0.35, 1.8], color: 0x5a5a62 },
        pos: [wellheadX, 1.15, wellheadZ],
        material: 'iron',
    });
    // Ventil-hjul (4 stk, sidestilt)
    for (let i = 0; i < 4; i++) {
        const h = 0.5 + i * 0.35;
        const side = i % 2 === 0 ? 1 : -1;
        addProp(engine, {
            id: `wellhead-wheel-${i}`,
            model: { primitive: 'cylinder', size: [0.28, 0.08], color: 0xc23a2a },
            pos: [wellheadX + side * 0.5, h, wellheadZ],
            rot: [0, 0, Math.PI / 2],
            material: 'iron',
            solid: false,
        });
    }
    // Rød toppkupel
    addProp(engine, {
        id: 'wellhead-cap',
        model: { primitive: 'sphere', size: [0.42, 0.42, 0.42], color: 0xc23a2a },
        pos: [wellheadX, 2.15, wellheadZ],
        material: 'iron',
    });
    // Trykkmåler-skive foran
    addProp(engine, {
        id: 'wellhead-gauge',
        model: { primitive: 'cylinder', size: [0.22, 0.06], color: 0xf0e8d8 },
        pos: [wellheadX, 1.3, wellheadZ + 0.4],
        rot: [Math.PI / 2, 0, 0],
        solid: false,
    });
    // E-key interaksjon
    addInteractable(engine, {
        id: 'wellhead-interact',
        model: { primitive: 'box', size: [0.01, 0.01, 0.01], color: 0x000000 },
        pos: [wellheadX, 1.4, wellheadZ],
        prompt: 'Les av trykkmåleren (E)',
        radius: 2.5,
        onInteract: () => {
            if (engine.getFlag('visited-wellhead')) {
                engine.playMonolog('wellhead-seen');
                return;
            }
            engine.setFlag('visited-wellhead', true);
            engine.setPhase('started');
            engine.updateUI();
            engine.setCharacterMarkerVisible('gunnar', false);
            engine.playMonolog('wellhead-first');
        },
    });

    // ─── SEPARATOR-KOLONNE ───────────────────────────────────────────────────
    // Høy vertikal sylinder (4 m) med tre utgangsrør merket OLJE / GASS / VANN.
    const sepX = 5, sepZ = -6;
    // Grunnplate
    addProp(engine, {
        id: 'sep-base',
        model: { primitive: 'box', size: [2.2, 0.2, 2.2], color: 0x4a4a50 },
        pos: [sepX, 0.1, sepZ],
        material: 'iron',
    });
    // Hoved-kolonne
    addProp(engine, {
        id: 'sep-column',
        model: { primitive: 'cylinder', size: [0.75, 4.0], color: 0x8a8a90 },
        pos: [sepX, 2.2, sepZ],
        material: 'iron',
    });
    // Topp-kuppel
    addProp(engine, {
        id: 'sep-top',
        model: { primitive: 'sphere', size: [0.75, 0.75, 0.75], color: 0x8a8a90 },
        pos: [sepX, 4.2, sepZ],
        material: 'iron',
        solid: false,
    });
    // Tre utgangsrør - olje (svart), gass (gul), vann (blå)
    const outlets: Array<{ color: number; y: number; dx: number; dz: number }> = [
        { color: 0x1a1a1a, y: 3.3, dx: 1.3, dz: 0 },   // olje - svart
        { color: 0xd4a83a, y: 2.6, dx: -1.3, dz: 0 },  // gass - gul
        { color: 0x3a6aa8, y: 1.4, dx: 0, dz: 1.3 },   // vann - blå
    ];
    for (let i = 0; i < outlets.length; i++) {
        const o = outlets[i];
        const len = 1.4;
        const yaw = Math.atan2(o.dx, o.dz);
        addProp(engine, {
            id: `sep-outlet-${i}`,
            model: { primitive: 'cylinder', size: [0.15, len], color: o.color },
            pos: [sepX + o.dx * 0.5, o.y, sepZ + o.dz * 0.5],
            rot: [Math.PI / 2, yaw, 0],
            material: 'iron',
            solid: false,
        });
    }
    // Kontroll-panel foran separatoren
    addProp(engine, {
        id: 'sep-panel',
        model: { primitive: 'box', size: [1.2, 0.9, 0.2], color: 0x3a3a40 },
        pos: [sepX, 1.1, sepZ + 1.2],
        material: 'iron',
    });
    // Panel-display (lysere firkant)
    addProp(engine, {
        id: 'sep-display',
        model: { primitive: 'box', size: [0.8, 0.4, 0.05], color: 0x50c8d8 },
        pos: [sepX, 1.3, sepZ + 1.3],
        solid: false,
    });
    // E-key
    addInteractable(engine, {
        id: 'sep-interact',
        model: { primitive: 'box', size: [0.01, 0.01, 0.01], color: 0x000000 },
        pos: [sepX, 1.2, sepZ + 1.2],
        prompt: 'Inspiser separator-panelet (E)',
        radius: 2.5,
        onInteract: () => {
            if (!engine.getFlag('visited-wellhead')) {
                engine.playMonolog('sep-too-early');
                return;
            }
            if (engine.getFlag('visited-separator')) {
                engine.playMonolog('sep-seen');
                return;
            }
            engine.setFlag('visited-separator', true);
            engine.setPhase('knows-flow');
            engine.updateUI();
            // Vis Gunnar-markør igjen - han har nytt å si om fakling.
            engine.setCharacterMarkerVisible('gunnar', true);
            engine.playMonolog('sep-first');
        },
    });

    // ─── EKSPORT-PANEL + SPAK ────────────────────────────────────────────────
    const expX = -6, expZ = -9;
    // Panel-vegg
    addProp(engine, {
        id: 'exp-panel',
        model: { primitive: 'box', size: [2.5, 1.8, 0.25], color: 0x4a4a50 },
        pos: [expX, 1.0, expZ],
        material: 'iron',
    });
    // Skilt over spaken (rød, tekst-uten-tekst)
    addProp(engine, {
        id: 'exp-sign',
        model: { primitive: 'box', size: [1.0, 0.35, 0.05], color: 0xc23a2a },
        pos: [expX, 1.7, expZ + 0.15],
        solid: false,
    });
    // Spak-base
    addProp(engine, {
        id: 'exp-lever-base',
        model: { primitive: 'box', size: [0.4, 0.25, 0.4], color: 0x2a2a30 },
        pos: [expX, 1.0, expZ + 0.4],
        solid: false,
    });
    // Selve spaken (stor, rød)
    addProp(engine, {
        id: 'exp-lever',
        model: { primitive: 'cylinder', size: [0.08, 0.7], color: 0xc23a2a },
        pos: [expX, 1.35, expZ + 0.4],
        rot: [Math.PI / 5, 0, 0],
        material: 'iron',
        solid: false,
    });
    // Spak-knott (ball på toppen)
    addProp(engine, {
        id: 'exp-lever-knob',
        model: { primitive: 'sphere', size: [0.14, 0.14, 0.14], color: 0xe04a38 },
        pos: [expX, 1.65, expZ + 0.6],
        solid: false,
    });
    // E-key
    addInteractable(engine, {
        id: 'exp-interact',
        model: { primitive: 'box', size: [0.01, 0.01, 0.01], color: 0x000000 },
        pos: [expX, 1.2, expZ + 0.4],
        prompt: 'Trekk eksport-spaken (E)',
        radius: 2.5,
        onInteract: () => {
            if (!engine.getFlag('visited-wellhead')) {
                engine.playMonolog('exp-too-early-wellhead');
                return;
            }
            if (!engine.getFlag('visited-separator')) {
                engine.playMonolog('exp-too-early-separator');
                return;
            }
            if (engine.getFlag('export-started')) return;
            engine.setFlag('export-started', true);
            engine.setPhase('done');
            engine.updateUI();
            engine.setCharacterMarkerVisible('gunnar', false);
            // Dekket rister når pumpen starter - kraftig, lang shake.
            engine.cameraShake(0.8, 2.5);
            engine.schedule(() => engine.cameraShake(0.5, 1.5), 1800);
            engine.playMonolog('exp-activated');
            // Feiring-sekvens spilles in-game som monologer. Ingen triggerEnd -
            // spilleren skal fritt kunne gå rundt etterpå.
            engine.schedule(() => engine.playMonolog('exp-congrats'), 7000);
            engine.schedule(() => {
                if (engine.getFlag('understands-flaring')) {
                    engine.playMonolog('exp-flaring-reflection');
                }
            }, 15000);
        },
    });

    // ─── FLAMMETÅRN (flare stack) ────────────────────────────────────────────
    // Høy mast (15m) med en stor, tydelig brennende flamme på toppen. Flammen
    // må være synlig fra hvor som helst på dekket - derfor emissive-materialer,
    // punktlys og flere lag av oransje glød. Raw Three.js (escape hatch §9.1)
    // fordi addProp ikke støtter emissive og vi trenger PointLight.
    const flareX = 14, flareZ = -14;
    const mastHeight = 15;
    const flameBaseY = mastHeight; // flammen sitter rett over mast-toppen
    // Masten
    addProp(engine, {
        id: 'flare-mast',
        model: { primitive: 'cylinder', size: [0.5, mastHeight], color: 0x4a4a52 },
        pos: [flareX, mastHeight / 2, flareZ],
        material: 'iron',
    });
    // Ringer rundt masten (visuelt, hver 2.5 m)
    for (let i = 0; i < 6; i++) {
        addProp(engine, {
            id: `flare-ring-${i}`,
            model: { primitive: 'cylinder', size: [0.7, 0.18], color: 0xd4a83a },
            pos: [flareX, 1.5 + i * 2.3, flareZ],
            solid: false,
        });
    }
    // Fakkel-munnstykke (et litt tykkere "skjørt" på toppen av masten)
    addProp(engine, {
        id: 'flare-nozzle',
        model: { primitive: 'cylinder', size: [0.9, 1.2], color: 0x3a3a42 },
        pos: [flareX, mastHeight - 0.3, flareZ],
        material: 'iron',
        solid: false,
    });

    // ── Flammen: tre emissive kjegler/sfærer i forskjellige størrelser ──
    // Base: stor lys-gul kjerne (mest intens)
    const flameCore = new THREE.Mesh(
        new THREE.ConeGeometry(1.3, 3.8, 16),
        new THREE.MeshStandardMaterial({
            color: 0xffd070,
            emissive: 0xffb040,
            emissiveIntensity: 4.5,
            transparent: true,
            opacity: 0.95,
        }),
    );
    flameCore.position.set(flareX, flameBaseY + 1.9, flareZ);
    flameCore.userData._flareCore = true;
    engine.scene.add(flameCore);

    // Midt-lag: oransje, litt bredere og høyere
    const flameMid = new THREE.Mesh(
        new THREE.ConeGeometry(1.8, 5.2, 16),
        new THREE.MeshStandardMaterial({
            color: 0xff8030,
            emissive: 0xff6020,
            emissiveIntensity: 3.5,
            transparent: true,
            opacity: 0.75,
        }),
    );
    flameMid.position.set(flareX, flameBaseY + 2.6, flareZ);
    flameMid.userData._flareMid = true;
    engine.scene.add(flameMid);

    // Ytterlag: mørk-rød glød som spres ut
    const flameOuter = new THREE.Mesh(
        new THREE.ConeGeometry(2.6, 7.0, 16),
        new THREE.MeshStandardMaterial({
            color: 0xff4018,
            emissive: 0xe03010,
            emissiveIntensity: 2.5,
            transparent: true,
            opacity: 0.35,
            depthWrite: false,
        }),
    );
    flameOuter.position.set(flareX, flameBaseY + 3.5, flareZ);
    flameOuter.userData._flareOuter = true;
    engine.scene.add(flameOuter);

    // ── Animasjon: flammen vaier og pulserer ──
    engine.registerUpdate((_dt, elapsed) => {
        const t = elapsed;
        const wobble = Math.sin(t * 3.5) * 0.05 + 1.0;
        const sway = Math.sin(t * 2.2) * 0.12;
        flameCore.scale.set(wobble, wobble * (1 + Math.sin(t * 4) * 0.08), wobble);
        flameCore.rotation.z = sway * 0.3;
        flameMid.scale.set(
            wobble * 1.02,
            wobble * (1 + Math.sin(t * 3.3 + 1) * 0.06),
            wobble * 1.02,
        );
        flameMid.rotation.z = sway * 0.5;
        flameOuter.scale.set(
            1 + Math.sin(t * 2.1) * 0.08,
            1 + Math.sin(t * 1.8) * 0.05,
            1 + Math.sin(t * 2.1) * 0.08,
        );
        flameOuter.rotation.z = sway * 0.7;
    });

    // Kraftig punktlys i flammen - lyser opp himmelen og dekket rundt.
    const flareLight = new THREE.PointLight(0xff7030, 180, 45, 1.6);
    flareLight.position.set(flareX, flameBaseY + 2.5, flareZ);
    flareLight.castShadow = true;
    flareLight.shadow.mapSize.set(512, 512);
    flareLight.shadow.camera.near = 0.5;
    flareLight.shadow.camera.far = 45;
    engine.scene.add(flareLight);
    // La lyset pulse lett sammen med flammen.
    engine.registerUpdate((_dt, elapsed) => {
        flareLight.intensity = 160 + Math.sin(elapsed * 4.1) * 25 + Math.sin(elapsed * 7.3) * 15;
    });

    // Røyk-partikkel over flammen (bred, driver oppover).
    addParticle(engine, {
        id: 'flare-smoke',
        preset: 'smoke',
        pos: [flareX, flameBaseY + 7.5, flareZ],
        scale: 4.0,
    });
    // Gnist-partikkel fra flamme-basen.
    addParticle(engine, {
        id: 'flare-sparks',
        preset: 'sparks',
        pos: [flareX, flameBaseY + 0.5, flareZ],
        scale: 2.0,
    });

    // ─── BORETÅRN (derrick) - visuelt tårn i silhuett ────────────────────────
    // Pyramidalt stål-skjelett. Kun visuelt, ingen interaksjon.
    const derX = -13, derZ = -8;
    // Fire bein som krymper mot toppen - vi approksimerer med vertikale pillarer
    // i hjørnene av en 4x4 base, og en spiss sylinder på toppen.
    const derCorners: Array<[number, number]> = [
        [derX - 2, derZ - 2], [derX + 2, derZ - 2],
        [derX - 2, derZ + 2], [derX + 2, derZ + 2],
    ];
    for (let i = 0; i < derCorners.length; i++) {
        const [x, z] = derCorners[i];
        addProp(engine, {
            id: `derrick-leg-${i}`,
            model: { primitive: 'box', size: [0.25, 10, 0.25], color: 0x6a6a70 },
            pos: [x, 5, z],
            material: 'iron',
            solid: false,
        });
    }
    // Toppspiss
    addProp(engine, {
        id: 'derrick-top',
        model: { primitive: 'cylinder', size: [0.3, 1.5], color: 0xc23a2a },
        pos: [derX, 10.7, derZ],
        solid: false,
    });
    // Kryssbånd midt på (to X-er per side, vi gjør det enkelt med horisontale bånd)
    for (let i = 0; i < 4; i++) {
        const h = 2 + i * 2;
        addProp(engine, {
            id: `derrick-band-n-${i}`,
            model: { primitive: 'box', size: [4.2, 0.12, 0.12], color: 0x6a6a70 },
            pos: [derX, h, derZ - 2],
            solid: false,
        });
        addProp(engine, {
            id: `derrick-band-s-${i}`,
            model: { primitive: 'box', size: [4.2, 0.12, 0.12], color: 0x6a6a70 },
            pos: [derX, h, derZ + 2],
            solid: false,
        });
        addProp(engine, {
            id: `derrick-band-e-${i}`,
            model: { primitive: 'box', size: [0.12, 0.12, 4.2], color: 0x6a6a70 },
            pos: [derX + 2, h, derZ],
            solid: false,
        });
        addProp(engine, {
            id: `derrick-band-w-${i}`,
            model: { primitive: 'box', size: [0.12, 0.12, 4.2], color: 0x6a6a70 },
            pos: [derX - 2, h, derZ],
            solid: false,
        });
    }
    // Blinkende rødt lys på toppen (visuelt - bare en sfære)
    addProp(engine, {
        id: 'derrick-warning-light',
        model: { primitive: 'sphere', size: [0.22, 0.22, 0.22], color: 0xff3020 },
        pos: [derX, 11.8, derZ],
        solid: false,
        castShadow: false,
    });

    // ─── HELIKOPTER-DEKK + HELIKOPTER ────────────────────────────────────────
    const heliX = 10, heliZ = 12;
    // Hev selve heli-dekket litt (en gul sirkel med stor H)
    addProp(engine, {
        id: 'helideck-circle',
        model: { primitive: 'cylinder', size: [4.5, 0.1], color: 0xd4a83a },
        pos: [heliX, 0.05, heliZ],
        solid: false,
    });
    // "H"-merket (tre bokser)
    addProp(engine, {
        id: 'helideck-h-left',
        model: { primitive: 'box', size: [0.5, 0.03, 2.2], color: 0x2a2a2a },
        pos: [heliX - 1.0, 0.11, heliZ],
        solid: false,
        castShadow: false,
    });
    addProp(engine, {
        id: 'helideck-h-right',
        model: { primitive: 'box', size: [0.5, 0.03, 2.2], color: 0x2a2a2a },
        pos: [heliX + 1.0, 0.11, heliZ],
        solid: false,
        castShadow: false,
    });
    addProp(engine, {
        id: 'helideck-h-bar',
        model: { primitive: 'box', size: [2.5, 0.03, 0.5], color: 0x2a2a2a },
        pos: [heliX, 0.11, heliZ],
        solid: false,
        castShadow: false,
    });

    // Selve helikopteret (Sikorsky-inspirert, rød/hvit)
    // Kropp
    addProp(engine, {
        id: 'heli-body',
        model: { primitive: 'box', size: [1.8, 1.3, 3.2], color: 0xd83a2a },
        pos: [heliX, 1.35, heliZ],
        material: 'iron',
        solid: false,
    });
    // Kabinvindu (lysere stripe)
    addProp(engine, {
        id: 'heli-window',
        model: { primitive: 'box', size: [1.82, 0.5, 1.6], color: 0x2a3848 },
        pos: [heliX, 1.7, heliZ + 0.6],
        solid: false,
    });
    // Hvit stripe
    addProp(engine, {
        id: 'heli-stripe',
        model: { primitive: 'box', size: [1.85, 0.25, 3.22], color: 0xf0f0e8 },
        pos: [heliX, 1.05, heliZ],
        solid: false,
    });
    // Halebom
    addProp(engine, {
        id: 'heli-tail',
        model: { primitive: 'box', size: [0.35, 0.35, 3.0], color: 0xd83a2a },
        pos: [heliX, 1.7, heliZ - 2.8],
        solid: false,
    });
    // Halefinne
    addProp(engine, {
        id: 'heli-fin',
        model: { primitive: 'box', size: [0.1, 1.0, 0.7], color: 0xd83a2a },
        pos: [heliX, 2.1, heliZ - 4.1],
        solid: false,
    });
    // Halerotor
    addProp(engine, {
        id: 'heli-tail-rotor',
        model: { primitive: 'cylinder', size: [0.55, 0.05], color: 0x2a2a2a },
        pos: [heliX + 0.15, 2.1, heliZ - 4.1],
        rot: [0, 0, Math.PI / 2],
        solid: false,
    });
    // Hovedrotor (stor flat skive)
    addProp(engine, {
        id: 'heli-rotor-hub',
        model: { primitive: 'cylinder', size: [0.25, 0.3], color: 0x2a2a2a },
        pos: [heliX, 2.25, heliZ],
        solid: false,
    });
    addProp(engine, {
        id: 'heli-rotor-blades',
        model: { primitive: 'box', size: [6.5, 0.06, 0.4], color: 0x1a1a1a },
        pos: [heliX, 2.42, heliZ],
        solid: false,
        castShadow: false,
    });
    // Meier
    addProp(engine, {
        id: 'heli-skid-l',
        model: { primitive: 'cylinder', size: [0.08, 3.0], color: 0x3a3a3a },
        pos: [heliX - 0.8, 0.4, heliZ],
        rot: [Math.PI / 2, 0, 0],
        solid: false,
    });
    addProp(engine, {
        id: 'heli-skid-r',
        model: { primitive: 'cylinder', size: [0.08, 3.0], color: 0x3a3a3a },
        pos: [heliX + 0.8, 0.4, heliZ],
        rot: [Math.PI / 2, 0, 0],
        solid: false,
    });

    // ─── NPC: Gunnar (skiftleder) ────────────────────────────────────────────
    addNPC(engine, {
        id: 'gunnar',
        name: 'Gunnar',
        characterType: 'farmer', // ingen offshore-preset - farmer gir robust arbeider-profil
        pos: [3, 0, 6],
        colors: {
            body: 0xd06020,   // oransje overall
            head: 0xe8b898,
            legs: 0x2a2a2a,
        },
        emotion: 'glad',
        questMarker: true,
        dialogs: {
            gunnar_greeting: [
                // Variant 4: etter spak trukket - gratulasjons-linje
                {
                    speaker: 'Gunnar',
                    text:
                        'Der gikk det. Flammetårnet brenner, pumpen går, oljen er på vei til ' +
                        'Teesside. Ikke verst for første dag.',
                    condition: { flagsRequired: ['export-started'] },
                    choices: [{ text: 'Takk for i dag.', next: null }],
                },
                // Variant 3: etter separator
                {
                    speaker: 'Gunnar',
                    text:
                        'Du har sett begge to - både brønnhodet og separatoren. Nå er det bare ' +
                        'å starte eksport-pumpen. Spaken står borte ved det røde panelet. ' +
                        'Trekk den, så går oljen i røret.',
                    condition: {
                        flagsRequired: ['visited-separator'],
                        flagsExcluded: ['export-started'],
                    },
                    onEnd: () => {
                        engine.setCharacterMarkerVisible('gunnar', false);
                    },
                    choices: [
                        { text: 'Hvorfor må gassen fakles?', next: 'gunnar_flaring' },
                        { text: 'Skal gjøre det.', next: null },
                    ],
                },
                // Variant 2: etter brønnhode
                {
                    speaker: 'Gunnar',
                    text:
                        'Bra, du har lest trykket. Neste er separatoren - den høye kolonnen ' +
                        'der borte. Det som kommer opp av brønnen er ikke bare olje. Gå og se.',
                    condition: {
                        flagsRequired: ['visited-wellhead'],
                        flagsExcluded: ['visited-separator'],
                    },
                    choices: [{ text: 'Skal bli.', next: null }],
                },
                // Variant 1: intro (fallback)
                {
                    speaker: 'Gunnar',
                    text:
                        'Så du er den nye. Greit. Oljen kommer ikke hit av seg selv - den må ' +
                        'hentes opp, renses, og sendes i land. Tre trinn. Jeg viser deg. ' +
                        'Begynn ved brønnhodet der borte - den røde greia i midten.',
                    onEnd: () => {
                        // Spilleren har hørt briefen - fjern markøren slik at fokus går videre.
                        engine.setCharacterMarkerVisible('gunnar', false);
                    },
                    choices: [
                        { text: 'Hva er brønnhodet?', next: 'gunnar_what_wellhead' },
                        { text: 'Hvorfor er vi her ute?', next: 'gunnar_why_here' },
                        { text: 'Jeg går og ser.', next: null },
                    ],
                },
            ],
            gunnar_what_wellhead: {
                speaker: 'Gunnar',
                text:
                    'Et juletre av ventiler som sitter rett over borehullet. Gjennom det går ' +
                    'alt - olje, gass, saltvann - opp fra reservoaret to tusen meter under ' +
                    'havbunnen. Vi styrer trykket med ventilene.',
                choices: [{ text: 'Skjønner.', next: null }],
            },
            gunnar_why_here: {
                speaker: 'Gunnar',
                text:
                    'Ekofisk-feltet. Amerikanerne fant det i sekstini. Ingen trodde det ville ' +
                    'gi noe særlig - men se på oss nå. Norge er blitt en oljenasjon. Og alt ' +
                    'starter med at noen må stå her og passe på at oljen flyter riktig.',
                choices: [{ text: 'Det høres stort ut.', next: null }],
            },
            gunnar_flaring: {
                speaker: 'Gunnar',
                text:
                    'Bra spørsmål. Gassen som kommer opp kan vi ikke alltid sende i land - ' +
                    'infrastrukturen mangler, eller trykket blir for høyt. Hvis vi ikke brenner ' +
                    'den av, bygger trykket seg opp til noe ryker. Flammetårnet er sikkerheten ' +
                    'vår. Sløsing, ja - men alternativet er verre.',
                onEnd: () => {
                    engine.setFlag('understands-flaring', true);
                },
                choices: [{ text: 'Det gir mening.', next: null }],
            },
        },
    });

    // ─── MONOLOGER (stasjons-forklaringer) ───────────────────────────────────
    addMonolog(engine, {
        id: 'wellhead-first',
        lines: [
            'Trykkmåleren peker mot rødt-gul. Reservoaret under oss trykker hardt.',
            'Oljen kommer opp av seg selv - vi pumper ikke fra bunnen. Det er havet ' +
                'av olje som presser seg opp gjennom brønnen.',
            'To tusen meter ned. Millioner av år gammel olje. Og den vil ut.',
        ],
        once: true,
        trigger: { type: 'manual' },
    });
    addMonolog(engine, {
        id: 'wellhead-seen',
        lines: ['Trykket er stabilt. Ingenting nytt å lese her.'],
        once: false,
        trigger: { type: 'manual' },
    });
    addMonolog(engine, {
        id: 'sep-first',
        lines: [
            'Displayet viser tre strømmer: OLJE, GASS, VANN.',
            'Det som kom opp av brønnen var ikke bare olje. Det var olje, naturgass ' +
                'og saltvann - alt blandet sammen i én strøm.',
            'Separatoren deler dem. Hver går i sitt eget rør. Oljen mot eksport-pumpen. ' +
                'Gassen mot flammetårnet eller land. Vannet renses og slippes tilbake til havet.',
        ],
        once: true,
        trigger: { type: 'manual' },
    });
    addMonolog(engine, {
        id: 'sep-seen',
        lines: ['Alle tre strømmer ser stabile ut.'],
        once: false,
        trigger: { type: 'manual' },
    });
    addMonolog(engine, {
        id: 'sep-too-early',
        lines: [
            'Gunnar sa jeg skulle starte ved brønnhodet.',
            'Jeg må forstå hva som kommer opp, før jeg ser hva som blir skilt ut.',
        ],
        once: false,
        trigger: { type: 'manual' },
    });
    addMonolog(engine, {
        id: 'exp-too-early-wellhead',
        lines: ['Spaken sitter fast. Jeg må besøke brønnhodet og separatoren først.'],
        once: false,
        trigger: { type: 'manual' },
    });
    addMonolog(engine, {
        id: 'exp-too-early-separator',
        lines: ['Ennå ikke. Jeg har ikke sett separatoren enda.'],
        once: false,
        trigger: { type: 'manual' },
    });
    addMonolog(engine, {
        id: 'exp-activated',
        lines: [
            'Spaken går tungt ned. Jeg kjenner en dyp vibrasjon gjennom dekket.',
            'Pumpene starter. Oljen går i røret mot Teesside, tre hundre kilometer unna.',
            'Bak meg lyser flammetårnet opp himmelen.',
        ],
        once: true,
        trigger: { type: 'manual' },
    });
    addMonolog(engine, {
        id: 'exp-congrats',
        lines: [
            'Flammetårnet lyser opp havet bak meg.',
            'Den første oljen jeg selv har sendt mot land er på vei gjennom røret til Teesside.',
            'Gunnar klapper meg på skulderen. "Velkommen offshore."',
            'Jeg har sett de tre trinnene: brønnhodet henter oljen opp, separatoren skiller ' +
                'den fra gass og vann, og eksport-røret sender den i land.',
        ],
        once: true,
        trigger: { type: 'manual' },
    });
    addMonolog(engine, {
        id: 'exp-flaring-reflection',
        lines: [
            'Jeg vet nå hvorfor flammen brenner. Den holder plattformen trygg - ' +
                'overskuddsgassen har ingen annen vei å gå.',
            'Ingenting her er tilfeldig.',
        ],
        once: true,
        trigger: { type: 'manual' },
    });

    // ─── Ambient lyd ─────────────────────────────────────────────────────────
    // Hvis preset-URLene ikke er registrert, blir dette stille no-ops.
    addAmbientAudio(engine, {
        id: 'wind',
        audio: 'wind-indoor',
        volume: 0.25,
        loop: true,
    });
    addAmbientAudio(engine, {
        id: 'fire-flare',
        audio: 'fire-crackle',
        pos: [13, 8.5, -13],
        radius: 20,
        volume: 0.4,
        loop: true,
    });

    // ─── Start-fase ──────────────────────────────────────────────────────────
    engine.setPhase('intro');
}
