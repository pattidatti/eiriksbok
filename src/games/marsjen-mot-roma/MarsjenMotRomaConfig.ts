import type { GameConfig, GameEngineRef } from '../engine/types';
import { setupMarsjenMotRomaScene } from './MarsjenMotRomaAssets';

export const marsjenMotRomaConfig: GameConfig = {
    id: 'marsjen-mot-roma',
    title: 'Marsjen mot Roma',
    subtitle: 'Bløffen som ble til et diktatur',
    subject: 'historie',
    description:
        'Roma, oktober 1922. Du er en ung journalist som følger tusenvis av svartskjorter mot ' +
        'hovedstaden. Er dette en revolusjon - eller noe annet? Finn ut hvordan Mussolini ' +
        'egentlig tok makten.',
    thumbnail: '/images/mellomkrigstiden/marsjen-mot-roma-thumb.webp',

    learningGoals: [
        'Forklare hvordan Mussolini gikk fra sosialist til fascist og hvordan han fikk makten i 1922.',
        'Beskrive de viktigste kjennetegnene ved fascismen (ultranasjonalisme, sterk leder, vold som virkemiddel).',
        'Forklare hvorfor «marsjen mot Roma» var en bløff, og hvordan kongen og eliten lot demokratiet falle.',
    ],
    curriculumTags: ['historie', 'mellomkrigstiden', 'fascisme', 'mussolini', 'italia', 'demokrati'],

    world: {
        preset: 'open',
        backgroundColor: '#8a8a92',
        fogDensity: 0.012,
    },

    visual: {
        sky: 'procedural',
        timeOfDay: 0.45,
        postProcessing: 'auto',
    },

    physics: {
        enabled: true,
        playerJump: true,
    },

    intro: {
        type: 'title',
        title: 'Marsjen mot Roma',
        subtitle: 'Italia, oktober 1922',
        durationMs: 3200,
        fadeMs: 900,
        skippable: true,
    },

    openingCinematic: [
        { duration: 3, cameraPos: [0, 22, 40], lookAt: [0, 0, 10], fov: 52, transition: 'fade' },
        { duration: 2.5, cameraPos: [-3, 1.8, 22], lookAt: [0, 1, 10], fov: 65, transition: 'cut' },
        { duration: 2.5, cameraPos: [0, 4, 18], lookAt: [0, 2, -20], fov: 55, transition: 'cut' },
        { duration: 2, cameraPos: [8, 3, -8], lookAt: [0, 1.5, -6], fov: 60, transition: 'cut' },
    ],

    player: {
        startPosition: [0, 0, 28],
        colors: {
            body: 0x6a6258, // grå frakk
            head: 0xd8b48c,
            legs: 0x3a342c,
        },
    },

    // NPCer legges til deklarativt i setupScene via addNPC (dialogene merges inn
    // i config.dialogs der). Monologene registreres i setupScene via registerMonolog.
    characters: [],

    dialogs: {},

    items: [
        {
            id: 'presskort',
            name: 'Pressekort',
            description:
                'Ditt journalistkort. Det lar deg bevege deg fritt langs marsjen og stille ' +
                'spørsmål de færreste tør å stille.',
            icon: '📰',
            stackable: false,
        },
        {
            id: 'fascist-program',
            name: 'Fascistenes program',
            description:
                'Et krøllete flyveblad fra 1919. Programmet spriker i alle retninger: mot ' +
                'kapitalisme, mot sosialisme, for nasjonen, for handling. Ingen sammenhengende ' +
                'idé - bare en vilje til makt.',
            icon: '📄',
            stackable: false,
        },
    ],
    inventorySize: 4,

    quests: [
        {
            phase: 'samling',
            objective: 'Svartskjortene samler seg i regnet. Snakk med dem og finn ut hvorfor de marsjerer.',
        },
        {
            phase: 'marsjen',
            objective: 'Følg marsjen mot Roma. Se hva svartskjortene tror på - og hva de gjør.',
        },
        {
            phase: 'bloeffen',
            objective: 'Hæren har sperret veien. Snakk med offiseren og industrieieren.',
        },
        {
            phase: 'kongens-valg',
            objective: 'Vent. Alt avhenger nå av ett valg i palasset.',
        },
        {
            phase: 'seieren',
            objective: 'Soldatene trekker seg. Gå inn i Roma.',
        },
        {
            phase: 'puzzleWon',
            objective: 'Du har skrevet ned det viktigste. Nå venter historiens dom.',
        },
    ],

    puzzle: {
        steps: [
            {
                question: 'Kaptein Renzi sa at marsjen var en "bløff". Hva mente han med det?',
                hint: 'Tenk på hva du så: hvem bar våpen, og hva kunne hæren ha gjort.',
                options: [
                    {
                        text: 'Svartskjortene var dårlig bevæpnet og hæren kunne knust dem på timer.',
                        correct: true,
                        feedback: 'Riktig. Marsjen var et skuespill - ekte militærmakt ville ha stoppet den umiddelbart.',
                    },
                    {
                        text: 'Mussolini var egentlig ikke til stede under marsjen.',
                        correct: false,
                        feedback: 'Nei - Mussolini var i Milano og ventet på resultatet. Men det var ikke det Renzi pekte på.',
                    },
                    {
                        text: 'Svartskjortene løy om å ville ta Roma.',
                        correct: false,
                        feedback: 'De mente det alvorlig nok - men Renzi siktet til den militære realiteten.',
                    },
                ],
            },
            {
                question: 'Gino beskrev fascismens kjennetegn. Hvilke tre passer best?',
                hint: 'Husk hva Gino sa om nasjonen, lederen og demokratiet.',
                options: [
                    {
                        text: 'Nasjonen over individet, sterk leder, vold som akseptabelt virkemiddel.',
                        correct: true,
                        feedback: 'Riktig. Ultranasjonalisme, lederkult og vold er kjernen i fascismen.',
                    },
                    {
                        text: 'Individets frihet, folkets representasjon, fredelig kamp.',
                        correct: false,
                        feedback: 'Det er liberaldemokratiets verdier - det fascismen bekjemper.',
                    },
                    {
                        text: 'Klassekamp, kollektivt eierskap, internasjonal solidaritet.',
                        correct: false,
                        feedback: 'Det er sosialistiske verdier. Fascismen er nasjonalistisk, ikke internasjonalistisk.',
                    },
                ],
            },
            {
                question: 'Hvorfor støttet Signor Conti - en rik fabrikkeier - Mussolini?',
                hint: 'Hva fryktet Conti mest, og hva lovde fascismen ham?',
                options: [
                    {
                        text: 'Fascismen ville knuse streikene og beskytte hans eiendom, mot at han adlød staten.',
                        correct: true,
                        feedback: 'Riktig. Eliten valgte fascismen fordi den beskyttet privat eiendom - ulikt kommunismen.',
                    },
                    {
                        text: 'Han trodde Mussolini var en ærlig mann som ville gjenopprette demokratiet.',
                        correct: false,
                        feedback: 'Conti var ikke naiv - han gjorde en kald kalkyle. Makt mot beskyttelse.',
                    },
                    {
                        text: 'Han ble tvunget av svartskjortene til å støtte dem.',
                        correct: false,
                        feedback: 'Nei - eliten valgte dette frivillig. Det er det som gjør det så tragisk.',
                    },
                ],
            },
        ],
    },

    endText: (engine: GameEngineRef): string => {
        const base =
            'Marsjen mot Roma var en bløff - dårlig bevæpnede menn i regnet som aldri trengte å ' +
            'kjempe. Likevel vant de. Kong Viktor Emanuel III nektet å signere unntakstilstanden ' +
            'som ville sluppet hæren løs, og eliten ønsket Mussolini velkommen som et vern mot ' +
            'venstresiden. Det ble et statskupp kledd i legalitet: utnevnt av kongen, godkjent av ' +
            'parlamentet - men bygd på vold og trusler. Demokratiet begikk ikke selvmord her. Det ' +
            'ble myrdet av dem som skulle ha beskyttet det. Italia ble malen. Tre år senere var ' +
            'Mussolini diktator - «Il Duce». Og andre fulgte etter.';
        const comparison = engine.getFlag<boolean>('compared_communism')
            ? ' Og du så forskjellen Conti pekte på: både fascisme og kommunisme forakter ' +
              'individets frihet og bruker vold - men der kommunismen ville ta eiendommen hans, ' +
              'lot fascismen ham beholde den mot lydighet. Derfor valgte eliten fascismen.'
            : '';
        const reflection =
            ' Spør deg selv: finnes det bevegelser i dag som lover orden og storhet - mot at du ' +
            'gir opp litt frihet?';
        return base + comparison + reflection;
    },

    setupScene: setupMarsjenMotRomaScene,
};
