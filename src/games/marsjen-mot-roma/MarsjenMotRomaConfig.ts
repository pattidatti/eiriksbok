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
    ],

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
