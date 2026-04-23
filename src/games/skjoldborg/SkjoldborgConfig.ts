import type { GameConfig } from '../engine/types';
import { setupSkjoldborgScene } from './SkjoldborgAssets';

export const skjoldborgConfig: GameConfig = {
    id: 'skjoldborg',
    title: 'Skjoldborg',
    subtitle: 'Motor-demo II · Alle systemer',
    subject: 'historie',
    description:
        'Motordemo som viser alle nye systemer: rytme-aktiviteter, stealth-deteksjon, station-puzzle, dynamiske musikk-lag, vær-gameplay og opening cinematic. Ankommer en norrøn festningsby der et blot-ritual skal utføres.',
    thumbnail: '',

    intro: {
        type: 'title',
        title: 'Skjoldborg',
        subtitle: '793 e.Kr.',
        durationMs: 2500,
        fadeMs: 800,
        skippable: true,
    },

    openingCinematic: [
        { duration: 3, cameraPos: [0, 18, 30], lookAt: [0, 2, 0], fov: 55, transition: 'fade' },
        { duration: 3, cameraPos: [13.5, 2, -5.5], lookAt: [15.5, 0.5, -7.5], fov: 60, transition: 'cut' },
        { duration: 2.5, cameraPos: [-11, 2, -16], lookAt: [-14, 0.5, -18], fov: 60, transition: 'fade' },
    ],

    world: {
        preset: 'open',
        backgroundColor: '#e88a4a',
        fogDensity: 0.008,
    },

    physics: {
        enabled: true,
        playerJump: true,
        gravity: -18,
    },

    visual: {
        postProcessing: 'auto',
        timeOfDay: 0.75,
        colorGrading: 'dusk',
        sky: 'procedural',
        weather: { type: 'clear', intensity: 0 },
        fogDensityCurve: {
            night: 0.016,
            dawn: 0.012,
            day: 0.006,
            dusk: 0.014,
        },
        shadows: 'cascaded',
        volumetricLight: true,
    },

    player: {
        startPosition: [0, 1, 8],
        colors: { body: 0x3a5a7a, head: 0xf0c090, legs: 0x4a3020 },
    },

    characters: [
        {
            id: 'bjorg',
            name: 'Bjorg',
            position: [2, 0, 2],
            colors: { body: 0x6a4a2a, head: 0xe0a870, legs: 0x3a2510 },
            characterType: 'farmer',
            defaultEmotion: 'glad',
            marker: true,
            showName: true,
        },
        {
            id: 'helge',
            name: 'Smed-Helge',
            position: [15, 0, -6],
            colors: { body: 0x4a3a2a, head: 0xc89060, legs: 0x2a1a10 },
            characterType: 'scientist',
            defaultEmotion: 'glad',
            marker: false,
            showName: true,
        },
        {
            id: 'volven',
            name: 'Volven',
            position: [-13, 0, -16],
            colors: { body: 0x3a2a5a, head: 0xd4a8c0, legs: 0x1a1030 },
            characterType: 'monk',
            defaultEmotion: 'worried',
            marker: false,
            showName: true,
        },
        {
            id: 'vakt1',
            name: 'Vakt',
            position: [22, 0, -3],
            colors: { body: 0x5a5a4a, head: 0xd0a878, legs: 0x3a3a28 },
            characterType: 'noble',
            defaultEmotion: 'glad',
            showName: false,
        },
        {
            id: 'vakt2',
            name: 'Vakt',
            position: [26, 0, 2],
            colors: { body: 0x5a5a4a, head: 0xc89868, legs: 0x3a3a28 },
            characterType: 'noble',
            defaultEmotion: 'glad',
            showName: false,
        },
    ],

    npcRoutes: [
        {
            characterId: 'vakt1',
            waypoints: [
                [22, -5],
                [22, 6],
            ],
            mode: 'pingpong',
            speed: 0.9,
            pauseMs: 1200,
        },
        {
            characterId: 'vakt2',
            waypoints: [
                [28, -4],
                [24, 4],
                [28, 8],
            ],
            mode: 'pingpong',
            speed: 0.75,
            pauseMs: 1500,
        },
    ],

    npcBehaviors: [
        {
            characterId: 'vakt1',
            playerReaction: { distance: 3, behavior: 'face' },
        },
        {
            characterId: 'vakt2',
            playerReaction: { distance: 3, behavior: 'face' },
        },
        {
            characterId: 'bjorg',
            playerReaction: { distance: 6, behavior: 'approach', speedMultiplier: 0.8 },
        },
    ],

    items: [
        {
            id: 'schwert',
            name: 'Offersverd',
            description: 'Et gammelt sverd som skal ofres til gudene.',
            icon: '⚔️',
            stackable: false,
        },
        {
            id: 'horn',
            name: 'Mjod-horn',
            description: 'Et drikkehorn fylt med mjod til ritualet.',
            icon: '🍺',
            stackable: false,
        },
        {
            id: 'mynt',
            name: 'Gullmynt',
            description: 'En gullmynt - rikdom til gudene.',
            icon: '🪙',
            stackable: false,
        },
        {
            id: 'gullring',
            name: 'Gullring',
            description: 'En vakker ring funnet i vakt-sonen. Ikke nødvendig for ritualet.',
            icon: '💍',
            stackable: false,
        },
    ],
    inventorySize: 12,

    questDefs: [
        {
            id: 'q_hils',
            title: 'Hils på Bjorg',
            description: 'Festningsvakten Bjorg vet hva du trenger å gjøre. Finn ham ved porten.',
            objectives: [
                {
                    id: 'o_talk_bjorg',
                    label: 'Snakk med Bjorg',
                    condition: { npcTalkedTo: 'bjorg' },
                    marker: { attachTo: 'bjorg' },
                },
            ],
            rewardFlags: ['met_bjorg'],
        },
        {
            id: 'q_saml',
            title: 'Finn offergjenstander',
            description: 'Tre rituelle gjenstander ligger gjemt i festningen. Finn dem alle.',
            prerequisites: ['q_hils'],
            objectives: [
                {
                    id: 'o_schwert',
                    label: 'Finn offersverd',
                    condition: { itemCollected: 'schwert' },
                    marker: { pos: [18, 1.2, -14] },
                },
                {
                    id: 'o_horn',
                    label: 'Finn mjød-horn',
                    condition: { itemCollected: 'horn' },
                    marker: { pos: [-6, 1.2, -4] },
                },
                {
                    id: 'o_mynt',
                    label: 'Finn gullmynt',
                    condition: { itemCollected: 'mynt' },
                    marker: { pos: [6, 1.2, -22] },
                },
            ],
            rewardFlags: ['saml_complete'],
        },
        {
            id: 'q_smie',
            title: 'Smi blot-ringen',
            description: 'Smed-Helge kan smi en ring til ritualet. Finn smia og utfør hamrings-ritualet.',
            prerequisites: ['q_saml'],
            objectives: [
                {
                    id: 'o_smi',
                    label: 'Smi ringen i smia',
                    condition: { flag: 'ring_smidd' },
                    marker: { pos: [15, 1.5, -7] },
                },
            ],
            rewardFlags: ['ring_ready'],
        },
        {
            id: 'q_alter',
            title: 'Utfør blot-ritualet',
            description: 'Volven venter på deg i helligdommen. Plasser offersakene på alteret i rett rekkefølge.',
            prerequisites: ['q_smie'],
            objectives: [
                {
                    id: 'o_deliver',
                    label: 'Plasser offeret på alteret',
                    condition: { flag: 'offer_levert' },
                    marker: { pos: [-14, 1.5, -22] },
                },
            ],
            rewardFlags: ['ritual_ferdig'],
        },
    ],

    quests: [
        { phase: 'free', objective: 'Utforsk Skjoldborg. Finn Bjorg ved porten (E).' },
    ],

    detection: {
        guards: [
            {
                characterId: 'vakt1',
                visionAngleDeg: 110,
                visionDistance: 12,
                detectionRate: 0.3,
                decayRate: 0.2,
                detectedFlag: 'oppdaget',
            },
            {
                characterId: 'vakt2',
                visionAngleDeg: 100,
                visionDistance: 10,
                detectionRate: 0.25,
                decayRate: 0.18,
                detectedFlag: 'oppdaget',
            },
        ],
        showMeter: true,
    },

    puzzle: {
        mode: 'station',
        stationLabel: 'Plasser offersakene i rett rekkefølge',
        steps: [
            {
                question: 'Legg offersakene på alteret',
                hint: 'Tenk: rikdom først, drikk midten, kamp sist',
                options: [],
                ingredientSlots: ['mynt', 'horn', 'schwert'],
                slotLabels: ['Første offer', 'Andre offer', 'Tredje offer'],
                correctFeedback: 'Gudene er fornøyde! Ritualet er fullført.',
                incorrectFeedback: 'Feil rekkefølge - gudene er ikke tilfredse. Prøv igjen.',
            },
        ],
    },

    audio: {
        masterVolume: 0.7,
        tracks: [
            {
                id: 'wind',
                url: '/audio/skjoldborg/wind.mp3',
                kind: 'ambient',
                loop: true,
                volume: 0.3,
                trigger: 'onStart',
            },
            {
                id: 'birds',
                url: '/audio/skjoldborg/birds.mp3',
                kind: 'ambient',
                loop: true,
                volume: 0.2,
                trigger: 'onStart',
            },
            {
                id: 'fire',
                url: '/audio/skjoldborg/fire.mp3',
                kind: 'spatial',
                loop: true,
                volume: 0.7,
                position: [-6, 0.5, 6],
                maxDistance: 16,
                trigger: 'onStart',
            },
            {
                id: 'forge',
                url: '/audio/skjoldborg/forge.mp3',
                kind: 'spatial',
                loop: true,
                volume: 0.55,
                position: [16, 0, -8],
                maxDistance: 14,
                trigger: 'onStart',
            },
            {
                id: 'shrine',
                url: '/audio/skjoldborg/shrine.mp3',
                kind: 'spatial',
                loop: true,
                volume: 0.4,
                position: [-14, 2, -18],
                maxDistance: 12,
                trigger: 'onStart',
            },
        ],
    },

    onWeatherChange: (_from, to, engine) => {
        if (to === 'rain') {
            engine.setFlag('forge_hot', false);
            engine.playMonolog('m_regn_slukket');
        }
    },

    dialogs: {
        bjorg_greeting: [
            {
                speaker: 'Bjorg',
                text: 'Ritualet er fullført! Åsene er fornøyde. Vel gjort, fremmed.',
                condition: { flagsRequired: ['ritual_ferdig'] },
                choices: [{ text: 'Takk, Bjorg.', next: null }],
                cameraFraming: 'speaker',
            },
            {
                speaker: 'Bjorg',
                text: 'Du har smidd ringen! Nå trenger du bare å legge alt på alteret. Volven venter.',
                condition: { flagsRequired: ['ring_ready'], flagsExcluded: ['ritual_ferdig'] },
                choices: [
                    { text: 'Jeg går dit nå.', next: null },
                    { text: 'Vis meg rundt', next: 'bjorg_tour' },
                ],
                cameraFraming: 'speaker',
            },
            {
                speaker: 'Bjorg',
                text: 'Du har samlet alle offersakene. Gå til smia - Smed-Helge skal smi en ring til ritualet.',
                condition: { flagsRequired: ['saml_complete'], flagsExcluded: ['ring_ready'] },
                choices: [{ text: 'Jeg går til smia.', next: null }],
                cameraFraming: 'speaker',
            },
            {
                speaker: 'Bjorg',
                text: 'Tre rituelle gjenstander mangler. Finn sverd, horn og mynt spredt i festningen, så kan ritualet begynne.',
                condition: { flagsRequired: ['met_bjorg'], flagsExcluded: ['saml_complete'] },
                choices: [
                    { text: 'Jeg finner dem.', next: null },
                    { text: 'Hva slags ritual?', next: 'bjorg_om_blot' },
                    { text: 'Vis meg rundt', next: 'bjorg_tour' },
                ],
                cameraFraming: 'speaker',
            },
            {
                speaker: 'Bjorg',
                text: 'Fremmed! Kom deg inn. Skjoldborg forbereder et blot til Odin i kveld. Vi trenger hjelp til å samle offersakene.',
                choices: [
                    { text: 'Jeg hjelper gjerne.', next: null },
                    { text: 'Hva er et blot?', next: 'bjorg_om_blot' },
                    { text: 'Vis meg rundt', next: 'bjorg_tour' },
                ],
                cameraFraming: 'speaker',
            },
        ],
        bjorg_om_blot: {
            speaker: 'Bjorg',
            text: 'Et blot er et offer til gudene. Vi gir dem det kjæreste vi har - rikdom, drikk og stridskraft. Så sikrer vi Odins gunst for vinteren.',
            choices: [
                { text: 'Jeg forstår. Jeg hjelper.', next: null },
                { text: 'Vis meg rundt', next: 'bjorg_tour' },
            ],
        },
        bjorg_tour: {
            speaker: 'Bjorg',
            text: 'Hva vil du vite om?',
            choices: [
                { text: 'Skift vær', next: 'vaer_meny' },
                { text: 'Skift tid på døgnet', next: 'tid_meny' },
                { text: 'Fortell om festningen', next: 'bjorg_festning' },
                { text: 'Det holder, takk', next: null },
            ],
        },
        bjorg_festning: {
            speaker: 'Bjorg',
            text: 'Skjoldborg viser alle nye motor-systemer: rytme-smiing, stealth-deteksjon, station-puzzle, dynamisk musikk og værkallback. Vaktsonen øst for smia er valgfri - gå dit for å teste deteksjon.',
            choices: [
                { text: 'Imponerende!', next: 'bjorg_tour' },
                { text: 'Takk, jeg utforsker.', next: null },
            ],
        },
        vaer_meny: {
            speaker: 'Bjorg',
            text: 'Hvilket vær skal få råde?',
            choices: [
                { text: 'Klart', next: 'bjorg_tour' },
                { text: 'Lett regn', next: 'bjorg_tour' },
                { text: 'Snøfall', next: 'bjorg_tour' },
                { text: 'Tett tåke', next: 'bjorg_tour' },
                { text: 'Tilbake', next: 'bjorg_tour' },
            ],
        },
        tid_meny: {
            speaker: 'Bjorg',
            text: 'Hvilken tid vil du se?',
            choices: [
                { text: 'Morgengry', next: 'bjorg_tour' },
                { text: 'Midt på dag', next: 'bjorg_tour' },
                { text: 'Solnedgang', next: 'bjorg_tour' },
                { text: 'Natt', next: 'bjorg_tour' },
                { text: 'Tilbake', next: 'bjorg_tour' },
            ],
        },
        helge_greeting: [
            {
                speaker: 'Smed-Helge',
                text: 'Ringen er smidd! God jobb. Nå kan du ta den med til Volven.',
                condition: { flagsRequired: ['ring_smidd'] },
                choices: [{ text: 'Takk, Helge.', next: null }],
                cameraFraming: 'speaker',
            },
            {
                speaker: 'Smed-Helge',
                text: 'Du må varme smia først! Pump belgen - hold mellomrom - så kan vi begynne å smi.',
                condition: { flagsRequired: ['saml_complete'], flagsExcluded: ['forge_hot', 'ring_smidd'] },
                choices: [{ text: 'Forstår, jeg pumper.', next: null }],
                cameraFraming: 'speaker',
            },
            {
                speaker: 'Smed-Helge',
                text: 'Smia er varm. Nå kan du hamre! Gå bort til ambolten og trykk E.',
                condition: { flagsRequired: ['saml_complete', 'forge_hot'], flagsExcluded: ['ring_smidd'] },
                choices: [{ text: 'Jeg hamrer!', next: null }],
                cameraFraming: 'speaker',
            },
            {
                speaker: 'Smed-Helge',
                text: 'Smia er klar når du har alle tre offersakene. Kom tilbake da.',
                condition: { flagsExcluded: ['saml_complete'] },
                choices: [{ text: 'Greit.', next: null }],
                cameraFraming: 'speaker',
            },
        ],
        volven_greeting: [
            {
                speaker: 'Volven',
                text: 'Ritualet er fullført. Spiritene er tilfredse. Du har trent gudenes øre.',
                condition: { flagsRequired: ['offer_levert'] },
                choices: [{ text: 'En ære.', next: null }],
                cameraFraming: 'speaker',
            },
            {
                speaker: 'Volven',
                text: 'Alteret er klart. Plasser sakene i rett rekkefølge - mynt, horn, sverd. Rikdom først, drikk midten, kamp sist.',
                condition: { flagsRequired: ['ring_ready'], flagsExcluded: ['offer_levert'] },
                choices: [
                    { text: 'Jeg er klar.', next: null },
                    { text: 'Minn meg på rekkefølgen', next: 'volven_hint' },
                ],
                cameraFraming: 'speaker',
            },
            {
                speaker: 'Volven',
                text: 'Seidmagien er klar, men du mangler offersakene. Bring dem til meg når du har alle tre.',
                condition: { flagsExcluded: ['ring_ready'] },
                choices: [{ text: 'Jeg samler dem.', next: null }],
                cameraFraming: 'speaker',
            },
        ],
        volven_hint: {
            speaker: 'Volven',
            text: 'Først rikdom - gull til Odin. Deretter drikk - mjød til Tor. Til sist kamp - stål til Tyr. Slik hedrer vi alle tre.',
            choices: [{ text: 'Takk. Jeg er klar.', next: null }],
        },
    },

    monologs: {
        m_spawn: {
            id: 'm_spawn',
            lines: [
                'Skjoldborg, 793 e.Kr. Solnedgang.',
                'Et gammelt norrønt blot-ritual skal holdes i natt.',
                'Byfolket samler offersakene - og trenger hjelp.',
                'Gå bort til Bjorg ved porten. Trykk E for å snakke.',
            ],
            once: true,
        },
        m_smie: {
            id: 'm_smie',
            lines: ['Varmen slår mot deg fra essen.', 'Ambolten venter. Belgen må pumpes først.'],
            once: true,
        },
        m_helligdom: {
            id: 'm_helligdom',
            lines: ['Stille. Volven mumler seidvers.', 'Alteret gir lys i halvmørket.'],
            once: true,
        },
        m_steinring: {
            id: 'm_steinring',
            lines: ['Steinene står i ring.', 'Noen reiste dem langt tilbake i tid.'],
            once: true,
        },
        m_vakt_sone: {
            id: 'm_vakt_sone',
            lines: ['Vaktene patruljerer tett her.', 'Gå forsiktig - eller finn en annen vei.'],
            once: true,
        },
        m_brygge: {
            id: 'm_brygge',
            lines: ['Fjorden strekker seg nordover.', 'Langskipet dupper i bølgene.'],
            once: true,
        },
        m_regn_slukket: {
            id: 'm_regn_slukket',
            lines: ['Regnet slukker essen!', 'Pump belgen på nytt for å varme smia opp igjen.'],
            once: false,
        },
        m_belg_fail: {
            id: 'm_belg_fail',
            lines: ['Belgen ble ikke pumpet hardt nok.', 'Prøv igjen.'],
            once: false,
        },
        m_smi_fail: {
            id: 'm_smi_fail',
            lines: ['Hamrings-rytmen sprakk.', 'Helge rister på hodet - prøv en gang til.'],
            once: false,
        },
        m_oppdaget: {
            id: 'm_oppdaget',
            lines: ['Vakten oppdaget deg!', 'Du er merket - men ritualet kan fortsatt fullføres.'],
            once: true,
        },
    },

    monologTriggers: [
        { id: 't_spawn', monologId: 'm_spawn', area: { minX: -4, maxX: 4, minZ: 5, maxZ: 12 } },
        { id: 't_smie', monologId: 'm_smie', area: { minX: 12, maxX: 20, minZ: -12, maxZ: -4 } },
        { id: 't_helligdom', monologId: 'm_helligdom', area: { minX: -19, maxX: -9, minZ: -22, maxZ: -14 } },
        { id: 't_steinring', monologId: 'm_steinring', area: { minX: -2, maxX: 6, minZ: -24, maxZ: -16 } },
        { id: 't_vakt', monologId: 'm_vakt_sone', area: { minX: 18, maxX: 30, minZ: -8, maxZ: 10 } },
        { id: 't_brygge', monologId: 'm_brygge', area: { minX: 48, maxX: 58, minZ: 2, maxZ: 10 } },
    ],

    endText: (engine) =>
        engine.getFlag('oppdaget')
            ? 'Du ble oppdaget av vaktene, men fullførte blot-ritualet uansett. Åsene er milde.'
            : 'Du gjennomførte blot-ritualet uoppdaget. Åsene er fornøyde.',

    setupScene: setupSkjoldborgScene,
};
