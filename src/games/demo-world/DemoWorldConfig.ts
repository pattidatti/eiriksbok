import type { GameConfig } from '../engine/types';
import { setupDemoWorldScene } from './DemoWorldAssets';

export const demoWorldConfig: GameConfig = {
    id: 'demo-world',
    title: 'Lysalvendalen',
    subtitle: 'Motor-demo · Full grafikk',
    subject: 'historie',
    description:
        'En åpen demoverden som viser fram hva spillmotoren kan: himmel, hav, vær, vegetasjon, fysikk, lys og indre monolog. Prat med Alvstein for en omvisning.',
    thumbnail: '',

    world: {
        preset: 'open',
        backgroundColor: '#a8c8e8',
        fogDensity: 0.005,
    },

    physics: {
        enabled: true,
        playerJump: true,
        gravity: -18,
    },

    visual: {
        postProcessing: {
            quality: 'auto',
            bloom: { strength: 0.4, threshold: 0.3, radius: 0.7 },
            exposure: 1.65,
            lut: 'neutral',
            // Fase 2.2: SSAO — kun aktiv på high-tier (placering i pipeline gater det)
            ssao: { enabled: true, kernelRadius: 0.5, minDistance: 0.005, maxDistance: 0.1 },
        },
        timeOfDay: 0.42,
        colorGrading: 'warm',
        sky: 'procedural',
        weather: { type: 'clear', intensity: 0 },
        fogDensityCurve: {
            night: 0.012,
            dawn: 0.016,
            day: 0.006,
            dusk: 0.018,
        },
        // Fase 2.3: Cascaded Shadow Maps — kun high-tier + open-preset
        shadows: 'cascaded',
        // Fase 2.5: volumetrisk lys / god rays — kun high-tier + open-preset
        volumetricLight: true,
    },

    player: {
        startPosition: [0, 1, 8],
        colors: { body: 0x3a5a7a, head: 0xf0c090, legs: 0x4a3020 },
    },

    characters: [
        {
            id: 'guide',
            name: 'Alvstein',
            position: [2, 0, 3],
            colors: { body: 0x5a3f66, head: 0xe8b888, legs: 0x3a2a4a },
            characterType: 'monk',
            defaultEmotion: 'glad',
            marker: true,
            showName: true,
        },
        {
            id: 'vandrer',
            name: 'Vandreren',
            position: [-6, 0, -2],
            colors: { body: 0x456a4a, head: 0xd4a88a, legs: 0x2a3520 },
            characterType: 'farmer',
            defaultEmotion: 'glad',
            showName: true,
        },
    ],

    npcRoutes: [
        {
            characterId: 'vandrer',
            waypoints: [
                [-6, -2],
                [-14, 4],
                [-8, 12],
                [4, 14],
                [12, 8],
                [16, -2],
                [8, -10],
                [-4, -8],
            ],
            mode: 'loop',
            speed: 1.1,
            pauseMs: 1400,
        },
    ],

    quests: [
        {
            phase: 'free',
            objective: 'Utforsk dalen. Prat med Alvstein (trykk E) for omvisning.',
        },
    ],

    dialogs: {
        guide_greeting: {
            speaker: 'Alvstein',
            text: 'Velkommen til Lysalvendalen! Her kan du se alt motoren vår kan gjøre. Hva vil du prøve?',
            choices: [
                { text: 'Vis meg hva motoren kan', next: 'tour_menu' },
                { text: 'Fortell om dalen', next: 'about' },
                { text: 'Jeg vil utforske selv', next: null },
            ],
            cameraFraming: 'speaker',
        },
        tour_menu: {
            speaker: 'Alvstein',
            text: 'Hva skal jeg vise deg nå?',
            choices: [
                { text: 'Skift vær', next: 'weather_menu' },
                { text: 'Skift tid på døgnet', next: 'time_menu' },
                { text: 'Fortell om dalen', next: 'about' },
                { text: 'Det holder, takk', next: null },
            ],
        },
        weather_menu: {
            speaker: 'Alvstein',
            text: 'Hvilket vær skal få råde?',
            choices: [
                { text: 'Klart og stille', next: 'tour_menu' },
                { text: 'Lett regn', next: 'tour_menu' },
                { text: 'Styrtregn og storm', next: 'tour_menu' },
                { text: 'Snøfall', next: 'tour_menu' },
                { text: 'Tett tåke', next: 'tour_menu' },
                { text: 'Tilbake', next: 'tour_menu' },
            ],
        },
        time_menu: {
            speaker: 'Alvstein',
            text: 'Hvilken tid vil du se?',
            choices: [
                { text: 'Morgengry', next: 'tour_menu' },
                { text: 'Middag', next: 'tour_menu' },
                { text: 'Ettermiddag', next: 'tour_menu' },
                { text: 'Solnedgang', next: 'tour_menu' },
                { text: 'Natt', next: 'tour_menu' },
                { text: 'Tilbake', next: 'tour_menu' },
            ],
        },
        about: {
            speaker: 'Alvstein',
            text: 'Alt du ser er bygd fra grunnen av. Himmelen regnes ut fra sola. Havet bølger i sanntid. Gress og banner vaier i vinden. Du kan plukke opp steiner med E og kaste dem med F. Løp rundt og se selv!',
            choices: [
                { text: 'Imponerende!', next: 'tour_menu' },
                { text: 'Takk, jeg utforsker', next: null },
            ],
        },
        vandrer_greeting: {
            speaker: 'Vandreren',
            text: 'Hei! Jeg går bare en runde i dalen. Vakkert her, er det ikke?',
            choices: [
                { text: 'Helt enig.', next: null },
                { text: 'Ha en fin tur.', next: null },
            ],
            cameraFraming: 'speaker',
        },
    },

    monologs: {
        m_spawn: {
            id: 'm_spawn',
            lines: [
                'Sollyset faller skrått over dalen.',
                'Gresset vaier - banneret suser.',
            ],
            once: true,
        },
        m_chapel: {
            id: 'm_chapel',
            lines: [
                'Stille. Lyset faller gjennom åpningen.',
                'Lyktene flakker - et levende mørke.',
            ],
            once: true,
        },
        m_bonfire: {
            id: 'm_bonfire',
            lines: [
                'Varmen slår mot deg. Flammene knitrer.',
                'Her kan du plukke opp steiner (E) og kaste dem (F).',
            ],
            once: true,
        },
        m_dock: {
            id: 'm_dock',
            lines: [
                'Bølgene slår mot pælene under bryggen.',
                'Båten vugger i takt med havet.',
            ],
            once: true,
        },
        m_forest: {
            id: 'm_forest',
            lines: [
                'Trærne rager over deg.',
                'Nålene rasler i vinden.',
            ],
            once: true,
        },
        m_stones: {
            id: 'm_stones',
            lines: [
                'Steinene står i ring.',
                'Noen reiste dem for lang tid siden.',
            ],
            once: true,
        },
    },

    monologTriggers: [
        { id: 't_spawn', monologId: 'm_spawn', area: { minX: -3, maxX: 3, minZ: 6, maxZ: 12 } },
        { id: 't_chapel', monologId: 'm_chapel', area: { minX: -23, maxX: -13, minZ: -22, maxZ: -14 } },
        { id: 't_bonfire', monologId: 'm_bonfire', area: { minX: 7, maxX: 13, minZ: -12, maxZ: -7 } },
        { id: 't_dock', monologId: 'm_dock', area: { minX: 52, maxX: 64, minZ: 3, maxZ: 8 } },
        { id: 't_forest', monologId: 'm_forest', area: { minX: -35, maxX: -22, minZ: -10, maxZ: 8 } },
        { id: 't_stones', monologId: 'm_stones', area: { minX: -11, maxX: -5, minZ: -22, maxZ: -16 } },
    ],

    endText: 'Du har utforsket Lysalvendalen.',
    setupScene: setupDemoWorldScene,
};
