import type { GameConfig } from '../engine/types';
import { setupDemoWorldScene } from './DemoWorldAssets';

export const demoWorldConfig: GameConfig = {
    id: 'demo-world',
    title: 'Lysalvendalen',
    subtitle: 'Motor-demo · Full grafikk',
    subject: 'historie',
    description:
        'En åpen demoverden som viser fram hva spillmotoren kan: himmel, hav, vær, vegetasjon, fysikk, lys, quester, inventar og indre monolog. Prat med Alvstein for å starte runeleting.',
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
            // Fase 2.2: SSAO - kun aktiv på high-tier (placering i pipeline gater det)
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
        // Fase 2.3: Cascaded Shadow Maps - kun high-tier + open-preset
        shadows: 'cascaded',
        // Fase 2.5: volumetrisk lys / god rays - kun high-tier + open-preset
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

    // Fase 4.3: vandreren snur seg mot spilleren når du kommer nær.
    npcBehaviors: [
        {
            characterId: 'vandrer',
            playerReaction: { distance: 4, behavior: 'face' },
        },
    ],

    quests: [
        {
            phase: 'free',
            objective: 'Utforsk dalen. Prat med Alvstein (trykk E) for omvisning.',
        },
    ],

    // Fase 4.2: inventar.
    items: [
        {
            id: 'runestone',
            name: 'Runestein',
            description: 'En av tre tapte runesteiner. Alvstein vil ha dem til alteret.',
            icon: '🪨',
            stackable: true,
            maxStack: 3,
        },
    ],
    inventorySize: 12,

    // Fase 4.1: quest-kjede. Tre quester som låses opp i rekkefølge.
    questDefs: [
        {
            id: 'q_greet',
            title: 'Hils på Alvstein',
            description: 'Hils på munken nede ved spawn. Han har en oppgave til deg.',
            objectives: [
                {
                    id: 'o_talk',
                    label: 'Snakk med Alvstein',
                    condition: { npcTalkedTo: 'guide' },
                    marker: { attachTo: 'guide' },
                },
            ],
            rewardFlags: ['greeted_alvstein'],
        },
        {
            id: 'q_runes',
            title: 'De tre runesteinene',
            description: 'Tre runesteiner ligger spredt i dalen. Plukk dem opp (E).',
            prerequisites: ['q_greet'],
            objectives: [
                {
                    id: 'o_r1',
                    label: 'Runestein i steinringen',
                    condition: { flag: 'rune_circle_picked' },
                    marker: { pos: [-8, 1.2, -19] },
                },
                {
                    id: 'o_r2',
                    label: 'Runestein ved bålet',
                    condition: { flag: 'rune_fire_picked' },
                    marker: { pos: [10, 1.2, -10] },
                },
                {
                    id: 'o_r3',
                    label: 'Runestein i skogen',
                    condition: { flag: 'rune_forest_picked' },
                    marker: { pos: [-30, 1.2, 0] },
                },
            ],
            rewardFlags: ['runes_complete'],
        },
        {
            id: 'q_deliver',
            title: 'Bring runesteinene til kapellet',
            description: 'Plasser de tre steinene på alteret i kapellet.',
            prerequisites: ['q_runes'],
            objectives: [
                {
                    id: 'o_alter',
                    label: 'Plasser steinene på alteret',
                    condition: { flag: 'runes_delivered' },
                    marker: { pos: [-18, 1.5, -21] },
                },
            ],
            rewardFlags: ['cellar_unlocked'],
        },
    ],

    // Fase 3.1: ambient + spatial audio. Lydfiler er valgfrie - AudioSystem
    // logger en advarsel til konsollen hvis fetch feiler, og spillet kjører
    // upåvirket. Legg til faktiske .mp3-filer i public/audio/demo-world/ når de
    // er klare. Stiene under er forberedt for det.
    audio: {
        masterVolume: 0.7,
        tracks: [
            { id: 'wind', url: '/audio/demo-world/wind.mp3', kind: 'ambient', loop: true, volume: 0.35, trigger: 'onStart' },
            { id: 'birds', url: '/audio/demo-world/birds.mp3', kind: 'ambient', loop: true, volume: 0.25, trigger: 'onStart' },
            { id: 'fire', url: '/audio/demo-world/fire.mp3', kind: 'spatial', loop: true, volume: 0.8, position: [10, 0.5, -10], maxDistance: 18, trigger: 'onStart' },
            { id: 'waves', url: '/audio/demo-world/waves.mp3', kind: 'spatial', loop: true, volume: 0.6, position: [60, 0, 5], maxDistance: 40, trigger: 'onStart' },
            { id: 'chapel_amb', url: '/audio/demo-world/chapel_drone.mp3', kind: 'spatial', loop: true, volume: 0.45, position: [-18, 2, -18], maxDistance: 14, trigger: 'onStart' },
        ],
    },

    dialogs: {
        // Fase 4.4: kondisjonell dialog. Første variant hvor condition matcher velges;
        // den siste varianten (uten condition) er fallback for nye spillere.
        guide_greeting: [
            {
                speaker: 'Alvstein',
                text: 'Du har plassert steinene! Det hemmelige kammeret nord-øst i dalen er åpnet. Gå inn og se selv.',
                condition: { flagsRequired: ['cellar_unlocked'] },
                choices: [{ text: 'Takk!', next: null }],
                cameraFraming: 'speaker',
            },
            {
                speaker: 'Alvstein',
                text: 'Du har funnet alle tre steinene! Bring dem til alteret inne i kapellet.',
                condition: { flagsRequired: ['runes_complete'], flagsExcluded: ['runes_delivered'] },
                choices: [{ text: 'Skal bli.', next: null }],
                cameraFraming: 'speaker',
            },
            {
                speaker: 'Alvstein',
                text: 'Tre runesteiner ligger spredt i dalen - en i steinringen, en ved bålet, en dypt i skogen. Plukk dem opp og bring dem til alteret.',
                condition: { flagsRequired: ['greeted_alvstein'], flagsExcluded: ['runes_complete'] },
                choices: [
                    { text: 'Jeg leter.', next: null },
                    { text: 'Vis meg dalen', next: 'tour_menu' },
                ],
                cameraFraming: 'speaker',
            },
            {
                speaker: 'Alvstein',
                text: 'Velkommen til Lysalvendalen! Tre gamle runesteiner ligger spredt i dalen. Vil du hjelpe meg å finne dem?',
                choices: [
                    { text: 'Ja, jeg leter etter dem', next: null },
                    { text: 'Vis meg hva motoren kan', next: 'tour_menu' },
                    { text: 'Fortell om dalen', next: 'about' },
                ],
                cameraFraming: 'speaker',
            },
        ],
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
            text: 'Alt du ser er bygd fra grunnen av. Himmelen regnes ut fra sola. Havet bølger i sanntid. Gress og banner vaier i vinden. Du kan plukke opp steiner med E og kaste dem med F. Trykk J for questlogg, I for inventar.',
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
        m_alter_delivered: {
            id: 'm_alter_delivered',
            lines: [
                'Steinene synker ned i alteret.',
                'En lyd - som en lås som åpnes - kommer fra trappa bak.',
            ],
            once: true,
        },
        m_gallery: {
            id: 'm_gallery',
            lines: [
                'Seks paneler. Hver overflate er et eget materiale.',
                'Gå nær - se hvordan lyset spiller på normal- og roughness-mappene.',
            ],
            once: true,
        },
        m_cellar: {
            id: 'm_cellar',
            lines: [
                'Et stille kammer. En lysstråle siger inn fra et vindu i taket.',
                'Speilet på veggen fanger himmelen utenfor.',
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
        { id: 't_gallery', monologId: 'm_gallery', area: { minX: -34, maxX: -22, minZ: 2, maxZ: 7 } },
        { id: 't_cellar', monologId: 'm_cellar', area: { minX: -1.5, maxX: 3.5, minZ: -10, maxZ: -6 } },
    ],

    endText: 'Du har utforsket Lysalvendalen.',
    setupScene: setupDemoWorldScene,
};
