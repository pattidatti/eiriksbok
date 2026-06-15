import * as THREE from 'three';
import type { GameEngineRef } from '../engine/types';
import { addNPC, addMonolog, addPickup, addPuzzleSlot, addMovingPlatform } from '../engine/declarative';
import { markSolid, markClimbable, registerMainSunLight, registerMainHemiLight } from '../engine/sceneUserData';

export function setupKatedralbyggerenScene(engine: GameEngineRef): void {
    const { scene, toonMat } = engine;

    // ── Lys (dagslys; per BUILD_GAME_GUIDE §6.1) ─────────────────────────────
    const sun = new THREE.DirectionalLight(0xfff3e0, 2.4);
    sun.position.set(40, 80, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 200;
    sun.shadow.camera.left = -40;
    sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -20;
    sun.shadow.bias = -0.0005;
    scene.add(sun);
    registerMainSunLight(scene, sun);

    const hemi = new THREE.HemisphereLight(0xbcd6ee, 0x6a5b44, 1.1);
    hemi.position.set(0, 60, 0);
    scene.add(hemi);
    registerMainHemiLight(scene, hemi);

    // ── Bakke ────────────────────────────────────────────────────────────────
    const ground = new THREE.Mesh(
        new THREE.BoxGeometry(60, 1, 60),
        toonMat(0x7d8a5e, { roughness: 1 }),
    );
    ground.position.set(0, -0.5, -5);
    ground.receiveShadow = true;
    markSolid(ground);
    scene.add(ground);

    // Helper: solid stein-/treboks i scenen.
    const stone = (id: string, pos: [number, number, number], size: [number, number, number], color = 0x9c8f76) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(...size), toonMat(color, { roughness: 0.9 }));
        m.position.set(...pos);
        m.castShadow = true;
        m.receiveShadow = true;
        m.userData.declarativeId = id;
        markSolid(m);
        scene.add(m);
        return m;
    };

    // Helper: dekorativ (ikke-solid) boks.
    const decor = (pos: [number, number, number], size: [number, number, number], color: number) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(...size), toonMat(color, { roughness: 0.85 }));
        m.position.set(...pos);
        m.castShadow = true;
        scene.add(m);
        return m;
    };

    // ── Katedralvegg (bakteppe) ──────────────────────────────────────────────
    decor([0, 11, -18.5], [24, 24, 1.5], 0xb7ad97);  // høy steinvegg bak stillaset
    decor([-10, 8, -11], [1.2, 16, 14], 0xb0a690);   // sidekontrefort vest
    decor([10, 8, -11], [1.2, 16, 14], 0xb0a690);    // sidekontrefort øst

    // ── Steg 1: Stige opp til stillas-plattform A (topp y=4) ─────────────────
    // Plattform A: z 0.25..5.75, topp y4. Stigen står SØR for A (z=6.3) med klaring,
    // så spilleren ikke kolliderer med plattformens underside under klatringen.
    stone('plat-a', [0, 3.85, 3.0], [6, 0.3, 5.5], 0xa89a7e);

    const ladderX = 0;
    const ladderZ = 6.3;
    decor([ladderX - 0.45, 2, ladderZ], [0.12, 4.2, 0.12], 0x5a3f22);
    decor([ladderX + 0.45, 2, ladderZ], [0.12, 4.2, 0.12], 0x5a3f22);
    for (let i = 0; i < 8; i++) {
        decor([ladderX, 0.4 + i * 0.5, ladderZ], [1.0, 0.08, 0.12], 0x6b4a28);
    }
    // Klatre-sensor (usynlig): dyp nok i z + høy nok i y til at auto-avstigningen
    // bærer spilleren helt opp på plattform A. Spenner y 0..4.8, z 5.2..6.8.
    const ladderSensor = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 4.8, 1.6),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    ladderSensor.position.set(ladderX, 2.4, 6.0);
    markClimbable(ladderSensor);
    scene.add(ladderSensor);

    // ── Steg 2: Hopp over hullet til plattform B (topp y=4) ──────────────────
    // B: z -4.5..-0.5. Gap A(z0.25)→B(z-0.5) = 0.75m.
    stone('plat-b', [0, 3.85, -2.5], [5, 0.3, 4], 0xa89a7e);

    // ── Steg 3: Mantle opp på den høye steinblokken C (topp y=5.4) ───────────
    // Tykk blokk (spenner y 4.0..5.4) så bryst-raycasten treffer fasaden. Sørfasade
    // z=-5.5; gap fra B(z-4.5) = 1.0m, og kanten ligger 1.4m over B - midt i mantle-båndet.
    stone('ledge-c', [0, 4.7, -7], [5, 1.4, 3], 0x8f836b);

    // ── Steg 4: Stein-heis (bevegelig plattform) C → topp-plattform D ────────
    // from = nede ved C-topp (y5.4), to = oppe ved D (y10.4).
    addMovingPlatform(engine, {
        id: 'stein-heis',
        size: [3, 0.4, 3],
        from: [0, 5.4, -10],
        to: [0, 10.4, -10],
        period: 9,
        easing: 'sine',
        color: 0x7a6a4c,
    });
    // Tau/bom over heisen (dekor)
    decor([0, 12.4, -10], [0.15, 0.15, 4], 0x4a3520);

    // ── Toppen: plattform D + byggmester + levering ──────────────────────────
    // D: z -16.5..-11.5, topp y10.6. Heisens topp (y10.6) flukter med D.
    stone('plat-d', [0, 10.45, -14], [7, 0.3, 5], 0xa89a7e);

    // Signatur: en lysende lykt på toppen (emissiv, synlig på avstand)
    const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffcf6b, emissive: 0xffb13a, emissiveIntensity: 3 }),
    );
    lantern.position.set(2.8, 11.3, -13);
    scene.add(lantern);
    const lanternPost = decor([2.8, 10.9, -13], [0.1, 0.8, 0.1], 0x3a2a18);
    lanternPost.castShadow = false;

    // ── Steg 0: mejselen på bakken ───────────────────────────────────────────
    addPickup(engine, {
        id: 'pickup-mejsel',
        itemId: 'mejsel',
        model: { primitive: 'box', size: [0.5, 0.12, 0.12], color: 0x8a8d92 },
        pos: [1.5, 0.4, 8.0],
        label: 'Plukk opp mejselen (E)',
        onPickup: () => {
            engine.setPhase('klatre');
        },
    });

    // ── Levering: puzzle-slot på toppen ──────────────────────────────────────
    addPuzzleSlot(engine, {
        id: 'levering',
        pos: [-1.5, 11.0, -14],
        accepts: ['mejsel'],
        label: 'Gi mejselen til byggmesteren (E)',
        visualHint: 'marker',
        onPlaced: () => {
            engine.setFlag('levert', true);
            engine.setPhase('levert');
            engine.schedule(() => engine.triggerEnd(), 2500);
        },
    });

    // ── Byggmester på toppen ─────────────────────────────────────────────────
    addNPC(engine, {
        id: 'byggmester',
        name: 'Byggmester Gunnar',
        characterType: 'scientist',
        pos: [1.2, 10.6, -14.5],
        emotion: 'glad',
        questMarker: true,
        dialogs: {
            byggmester_greeting: [
                {
                    speaker: 'Byggmester Gunnar',
                    text: 'Endelig! Legg mejselen på benken ved siden av meg, så fortsetter vi arbeidet.',
                    condition: { flagsRequired: ['levert'] },
                    choices: [{ text: '...', next: null }],
                },
                {
                    speaker: 'Byggmester Gunnar',
                    text: 'Der er du, lærling. Har du mejselen min? Jeg kan ikke hugge en eneste ' +
                        'stein til uten den. Legg den på benken her oppe.',
                    choices: [
                        { text: 'Hvordan reiser dere en så høy kirke?', next: 'byggmester_om' },
                        { text: 'Jeg har den - vent litt.', next: null },
                    ],
                },
            ],
            byggmester_om: {
                speaker: 'Byggmester Gunnar',
                text: 'Stein for stein, lærling. Vi bygger stillas av tre, heiser stein med taljer, ' +
                    'og klatrer høyere for hvert år. En domkirke tar tiår å reise - noen ganger ' +
                    'lengre enn et menneskeliv.',
                choices: [{ text: 'Imponerende.', next: null }],
            },
        },
    });

    // ── Onboarding-monolog ved start ─────────────────────────────────────────
    addMonolog(engine, {
        id: 'intro',
        lines: [
            'Byggmesteren venter på mejselen sin helt øverst i stillaset.',
            'Jeg klatrer stiger med W, hopper med mellomrom, og drar meg opp på kanter ' +
                'ved å trykke mellomrom mens jeg presser meg framover i lufta.',
            'Jeg kan trykke C for å se i førsteperson.',
        ],
        once: true,
        trigger: { type: 'proximity', pos: [0, 1, 9], radius: 4 },
    });

    engine.setPhase('intro');
}
