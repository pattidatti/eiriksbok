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
            engine.playMonolog('exp-activated');
            // Gi spilleren noen sekunder til å se flammetårnet før slutt-tekst.
            engine.schedule(() => engine.triggerEnd(), 5000);
        },
    });

    // ─── FLAMMETÅRN (flare stack) ────────────────────────────────────────────
    // Høy tynn mast med en evig brennende flamme på toppen. Flammen er alltid på
    // siden plattformer alltid fakler noe gass - men vi intensiverer den
    // visuelt ved endgame via schedule + partikkel-scale.
    const flareX = 13, flareZ = -13;
    // Masten (4 horisontale ringer på 8 meter)
    addProp(engine, {
        id: 'flare-mast',
        model: { primitive: 'cylinder', size: [0.35, 8.0], color: 0x5a5a62 },
        pos: [flareX, 4.0, flareZ],
        material: 'iron',
    });
    // Ringer rundt masten (visuelt)
    for (let i = 0; i < 4; i++) {
        addProp(engine, {
            id: `flare-ring-${i}`,
            model: { primitive: 'cylinder', size: [0.55, 0.15], color: 0xd4a83a },
            pos: [flareX, 1.5 + i * 1.8, flareZ],
            solid: false,
        });
    }
    // Flamme-base (emissive oransje sfære)
    addProp(engine, {
        id: 'flare-flame-core',
        model: { primitive: 'sphere', size: [0.9, 0.9, 0.9], color: 0xff7020 },
        pos: [flareX, 8.5, flareZ],
        solid: false,
        castShadow: false,
    });
    // Evig flamme-partikkel
    addParticle(engine, {
        id: 'flare-flame',
        preset: 'torch-flame',
        pos: [flareX, 8.5, flareZ],
        scale: 3.0,
    });
    // Røyk over flammen
    addParticle(engine, {
        id: 'flare-smoke',
        preset: 'smoke',
        pos: [flareX, 10.5, flareZ],
        scale: 2.5,
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
