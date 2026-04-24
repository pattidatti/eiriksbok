// Scene-oppsett for Blueprint-spillet. Kun deklarative builder-kall - ingen raw Three.js.
//
// Dette er malen for hvordan setupScene skal skrives i nye spill. Legg merke til:
//   - Ingen `new THREE.Mesh(...)` eller `scene.add(...)`
//   - Ingen `userData.solid = true` manuelt (builders gjør det)
//   - Ingen `castShadow`/`receiveShadow` (builders setter sane defaults)
//   - Dialog-IDer følger konvensjonen `{npcId}_greeting` for fler-NPC-spill
//   - Null-checks er ikke nødvendig fordi builders aldri returnerer null

import type { GameEngineRef } from '../engine/types';
import {
    buildRoom,
    addProp,
    addPickup,
    addNPC,
    addMonolog,
    addPuzzleSlot,
    addAmbientAudio,
} from '../engine/declarative';

export function setupBlueprintScene(engine: GameEngineRef): void {
    // ─── Rom: fengsels-celle ─────────────────────────────────────────────────
    // Steinvegger og -gulv, svakt lys. Dør mot nord (til utsiden), vindu mot øst.
    // Døren er låst til Sokrates har tatt et valg.
    buildRoom(engine, {
        id: 'prison-cell',
        size: [8, 3.5, 8],
        floor: 'stone',
        walls: 'stone',
        ceiling: 'stone',
        lights: 'prison-cell',
        doors: [{ wall: 'north', offset: 0, width: 1.4, openFlag: 'door-unlocked' }],
        windows: [{ wall: 'east', offset: 0, width: 1.2, height: 1.2 }],
    });

    // ─── Møbler ──────────────────────────────────────────────────────────────
    // Benken Sokrates sitter på.
    addProp(engine, {
        id: 'sokrates-bench',
        model: 'bench',
        pos: [-1.5, 0, -3],
        rot: [0, Math.PI / 2, 0],
    });

    // Et lite bord med bøker.
    addProp(engine, {
        id: 'table',
        model: 'table',
        pos: [2, 0, -2.5],
    });
    addProp(engine, {
        id: 'book1',
        model: 'book',
        pos: [1.7, 0.86, -2.5],
        rot: [0, 0.3, 0],
    });
    addProp(engine, {
        id: 'book2',
        model: 'scroll',
        pos: [2.2, 0.86, -2.4],
    });

    // Et stearinlys ved bordet.
    addProp(engine, {
        id: 'candle',
        model: 'candle',
        pos: [2, 0.86, -2.7],
    });

    // En amfora på gulvet (dekor).
    addProp(engine, {
        id: 'amphora',
        model: 'amphora',
        pos: [3.3, 0, 2.5],
    });

    // ─── Gjenstander spilleren kan plukke opp ────────────────────────────────
    // Beger med gift: plasseres på altar → drikk gift-slutt.
    addPickup(engine, {
        id: 'pickup-gift',
        itemId: 'giftbeger',
        model: 'cup',
        pos: [2.0, 0.9, -2.5],
        label: 'Plukk opp giftbeger (E)',
        audioOnPickup: 'pickup-tool',
    });

    // Repstige: plasseres ved vinduet → flukt-slutt.
    addPickup(engine, {
        id: 'pickup-rep',
        itemId: 'repstige',
        model: 'rope',
        pos: [-3, 0.1, -3],
        label: 'Plukk opp repstige (E)',
        audioOnPickup: 'pickup-tool',
    });

    // ─── Altar med puzzle-slot (drikk gift) ──────────────────────────────────
    addProp(engine, {
        id: 'altar',
        model: 'altar',
        pos: [0, 0, -3.5],
    });
    addPuzzleSlot(engine, {
        id: 'altar-slot',
        pos: [0, 0.5, -3.5],
        accepts: ['giftbeger'],
        label: 'Drikk giften (E)',
        visualHint: 'marker',
        onPlaced: () => {
            engine.setFlag('drakk-gift', true);
            engine.setPhase('valgt');
            engine.schedule(() => engine.triggerEnd(), 2500);
        },
    });

    // ─── Vindu-slot (bruk repstige) ──────────────────────────────────────────
    addPuzzleSlot(engine, {
        id: 'window-slot',
        pos: [3.8, 1.2, 0],
        accepts: ['repstige'],
        label: 'Fest repstigen (E)',
        visualHint: 'marker',
        onPlaced: () => {
            engine.setFlag('brukte-repstige', true);
            engine.setFlag('door-unlocked', true);
            engine.setPhase('valgt');
            engine.schedule(() => engine.triggerEnd(), 2500);
        },
    });

    // ─── NPC: Sokrates ───────────────────────────────────────────────────────
    // Han sitter på benken (logisk, ikke bokstavelig). Dialogene bruker
    // konvensjonen {npcId}_greeting slik at motoren åpner riktig dialog.
    addNPC(engine, {
        id: 'sokrates',
        name: 'Sokrates',
        characterType: 'monk',
        pos: [-1.5, 0, -2.7],
        emotion: 'worried',
        questMarker: true,
        dialogs: {
            sokrates_greeting: [
                {
                    speaker: 'Sokrates',
                    text: 'Du har tatt et valg, har du ikke? Gjenferdet du så i øynene mine er borte nå.',
                    condition: { flagsRequired: ['drakk-gift'] },
                    choices: [{ text: '...', next: null }],
                },
                {
                    speaker: 'Sokrates',
                    text: 'Så du velger livet framfor loven. Kanskje har jeg fortjent dette.',
                    condition: { flagsRequired: ['brukte-repstige'] },
                    choices: [{ text: '...', next: null }],
                },
                {
                    speaker: 'Sokrates',
                    text: 'Min venn, jeg har tenkt lenge. Athen dømte meg. Loven er loven, ' +
                        'selv om dommen er urettferdig. Hva sier du?',
                    choices: [
                        {
                            text: 'Hvorfor flykter du ikke? Kriton har ordnet alt.',
                            next: 'sokrates_defend',
                        },
                        {
                            text: 'Hvordan kan du være så rolig?',
                            next: 'sokrates_calm',
                        },
                        { text: 'Vi snakkes.', next: null },
                    ],
                },
            ],
            sokrates_defend: {
                speaker: 'Sokrates',
                text: 'Hvis jeg flykter, bryter jeg den avtalen jeg har med Athen. Hele livet har ' +
                    'jeg bodd her, mottatt utdanning, oppdratt barn. Å flykte nå ville være å ' +
                    'svikte alt det. Men - velg du.',
                choices: [{ text: 'Jeg må tenke.', next: null }],
            },
            sokrates_calm: {
                speaker: 'Sokrates',
                text: 'Å dø er enten å sovne uten drømmer, eller å våkne i en ny verden. Begge ' +
                    'deler er godt. Det er ikke døden jeg frykter - det er å leve uten integritet.',
                choices: [{ text: 'Jeg forstår.', next: null }],
            },
        },
    });

    // ─── NPC: Kriton ─────────────────────────────────────────────────────────
    addNPC(engine, {
        id: 'kriton',
        name: 'Kriton',
        characterType: 'noble',
        pos: [1.5, 0, 1.5],
        emotion: 'worried',
        dialogs: {
            kriton_greeting: {
                speaker: 'Kriton',
                text: 'Jeg har repstige med meg - bak i hjørnet. Og vaktene er bestukket. ' +
                    'Sokrates må bare bestemme seg. Overtaler du ham?',
                choices: [
                    {
                        text: 'Hvorfor er det så viktig at han flykter?',
                        next: 'kriton_urge',
                    },
                    { text: 'Han sier han vil følge loven.', next: 'kriton_dismay' },
                    { text: 'Takk. Jeg tenker.', next: null },
                ],
            },
            kriton_urge: {
                speaker: 'Kriton',
                text: 'Han er min venn. Jeg kan ikke la ham dø for en urettferdig dom. Athen gjorde ' +
                    'ham til syndebukk - filosofer truer ingen, men de truer maktens fortellinger.',
                choices: [{ text: 'Jeg forstår.', next: null }],
            },
            kriton_dismay: {
                speaker: 'Kriton',
                text: 'Jeg vet. Han er sta. Men tenk: loven er urettferdig. Er det ikke da riktig å ' +
                    'bryte den? Filosofien selv lever videre bare hvis han lever.',
                choices: [{ text: 'Det er et vanskelig valg.', next: null }],
            },
        },
    });

    // ─── Monolog ved vinduet ─────────────────────────────────────────────────
    addMonolog(engine, {
        id: 'window-thought',
        lines: [
            'Athen våkner utenfor. Jeg hører fiskere, barn, liv som fortsetter.',
            'Kan jeg forsvare å dø når livet er så rikt?',
            'Men hva er et liv uten de prinsippene det bygger på?',
        ],
        once: true,
        trigger: { type: 'proximity', pos: [3.5, 1.0, 0], radius: 1.5 },
    });

    // ─── Monolog ved døra ────────────────────────────────────────────────────
    addMonolog(engine, {
        id: 'door-thought',
        lines: [
            'Døra er låst. Valget mitt må tas først.',
            'Hvilken vei - altaret eller vinduet?',
        ],
        once: false,
        trigger: { type: 'proximity', pos: [0, 1.0, -3.9], radius: 1.5 },
    });

    // ─── Ambient lyd ─────────────────────────────────────────────────────────
    // Hvis audio-preset ikke har registrert URL, blir dette en stille no-op.
    addAmbientAudio(engine, {
        id: 'wind',
        audio: 'wind-indoor',
        volume: 0.3,
        loop: true,
    });

    // ─── Start-fase ──────────────────────────────────────────────────────────
    engine.setPhase('intro');
}
