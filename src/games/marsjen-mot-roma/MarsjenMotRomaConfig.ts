import type { GameConfig, GameEngineRef } from '../engine/types';
import { setupMarsjenMotRomaScene } from './MarsjenMotRomaAssets';

export const marsjenMotRomaConfig: GameConfig = {
    id: 'marsjen-mot-roma',
    title: 'Marsjen mot Roma',
    subtitle: 'Bløffen som ble til et diktatur',
    subject: 'historie',
    description:
        'Roma, oktober 1922. Du er en ung journalist som følger tusenvis av svartskjorter mot ' +
        'hovedstaden. Er dette en revolusjon - eller noe annet? Se nærmere, samle bevis, og finn ' +
        'ut hvordan Mussolini egentlig tok makten.',
    thumbnail: '/images/mellomkrigstiden/marsjen-mot-roma-thumb.webp',

    learningGoals: [
        'Forklare hvordan Mussolini gikk fra sosialist til fascist og hvordan han fikk makten i 1922.',
        'Beskrive de viktigste kjennetegnene ved fascismen (ultranasjonalisme, sterk leder, vold som virkemiddel).',
        'Forklare hvorfor «marsjen mot Roma» var en bløff, og hvordan kongen og eliten lot demokratiet falle.',
    ],
    curriculumTags: ['historie', 'mellomkrigstiden', 'fascisme', 'mussolini', 'italia', 'demokrati'],

    world: {
        preset: 'open',
        backgroundColor: '#9a9aa0',
        fogDensity: 0.015, // tett nok til at kolonnen forsvinner i begge ender → «tusenvis»
    },

    visual: {
        sky: 'procedural',
        timeOfDay: 0.42, // lav start; atmosfære-buen hever/senker dette per fase
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
        // Høy etablering: leiren i regnet, byporten og palass-silhuetten i tåka
        { duration: 3.2, cameraPos: [0, 26, 46], lookAt: [0, 2, -6], fov: 50, transition: 'fade' },
        // Lavt i kolonnen: svartskjortene marsjerer på veien mot porten
        { duration: 2.6, cameraPos: [-4.5, 1.7, 23], lookAt: [2, 1.2, 14], fov: 62, transition: 'cut' },
        // Gjennom portbuen: bygata og Quirinale-silhuetten lengst nede
        { duration: 2.6, cameraPos: [0, 4.5, 16.5], lookAt: [0, 3, -28], fov: 55, transition: 'cut' },
        // Sperringen: hæren venter der gata munner ut i piazzaen
        { duration: 2.2, cameraPos: [8.5, 3, -5.5], lookAt: [0, 1.6, -2], fov: 58, transition: 'cut' },
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
        // ─── Notater (samles via Sannhetens linse + nøkkeldialoger) ───────────────
        {
            id: 'notat-haeren-kledning',
            name: 'Notat: Hæren er en kledning',
            description:
                'På avstand i tåka så de ut som en disiplinert hær. På nært hold: en ' +
                'gjennomvåt gutt med kosteskaft og ingen støvler. Skrekken er et kostyme.',
            icon: '📝',
            stackable: false,
        },
        {
            id: 'notat-darlig-bevaepnet',
            name: 'Notat: Dårlig bevæpnet',
            description:
                'Jaktrifler, staur og noen få ekte gevær. Hæren kunne ha knust hele kolonnen ' +
                'på en time. Marsjen er militært sett maktesløs.',
            icon: '📝',
            stackable: false,
        },
        {
            id: 'notat-propaganda',
            name: 'Notat: Propagandaen taler til magen',
            description:
                '«Enten med oss, eller mot oss.» Plakaten har ingen nyanser - bare en sterk ' +
                'leder, en fiende, og en følelse. Den trenger ikke være sann for å virke.',
            icon: '📝',
            stackable: false,
        },
        {
            id: 'notat-volden',
            name: 'Notat: Volden er politikken',
            description:
                'Et utbrent trykkeri. Svartskjortene brant det fordi det trykte feil avis - og ' +
                'politiet så en annen vei. Vold er ikke et problem for dem; det er metoden.',
            icon: '📝',
            stackable: false,
        },
        {
            id: 'notat-fascismens-natur',
            name: 'Notat: Fascismens kjerne',
            description:
                'Nasjonen over individet. Én sterk leder, ikke et prateparlament. Handling ' +
                'framfor kompromiss. Frihet og rettigheter foraktes som svakhet.',
            icon: '📝',
            stackable: false,
        },
        {
            id: 'notat-haeren-lammet',
            name: 'Notat: Den ekte hæren er lammet',
            description:
                'Soldatene har ekte gevær og kunne stoppet alt. Men de venter på en ordre fra ' +
                'kongen som aldri kommer. Uten ordre er hæren bare tilskuere.',
            icon: '📝',
            stackable: false,
        },
        {
            id: 'notat-elitens-svik',
            name: 'Notat: Eliten ønsket ham velkommen',
            description:
                'En rik fabrikkeier heier på pøblene. Hvorfor? Fascisten knuser streikene og ' +
                'lar ham beholde fabrikken - ulikt kommunisten. En kald kalkyle: makt mot vern.',
            icon: '📝',
            stackable: false,
        },
    ],
    inventorySize: 12,

    quests: [
        {
            phase: 'samling',
            objective: 'Svartskjortene samler seg i regnet. Snakk med dem - og se nærmere på «hæren».',
        },
        {
            phase: 'marsjen',
            objective: 'Følg marsjen. Samle bevis: se forbi det de vil at du skal se.',
        },
        {
            phase: 'bloeffen',
            objective: 'Hæren har sperret veien. Snakk med offiseren og industrieieren.',
        },
        {
            phase: 'telegrafen',
            objective: 'Forsiden står. Lever den på telegrafkontoret ved sidetorget.',
        },
        {
            phase: 'kongens-valg',
            objective: 'Saken er sendt. Alt avgjøres nå av ett valg i palasset.',
        },
        {
            phase: 'seieren',
            objective: 'Soldatene trekker seg. Gå med kolonnen inn i Roma.',
        },
        {
            phase: 'puzzleWon',
            objective: 'Forsiden står. Nå må den ut til verden - finn telegrafkontoret.',
        },
    ],

    // ─── Syntese-finale: bygg forsidesaken av bevisene du selv samlet ─────────────
    // Station-mode: plasser det skarpeste notatet under hver påstand. requiresItems
    // garanterer at de tre svar-notatene er samlet (via obligatoriske beats), så
    // openPuzzle aldri åpner for tidlig og soft-låser. step.onCorrect wires i Assets
    // til telegraf-fasen: spilleren leverer selv forsiden og velger overskrift.
    // Fallback hvis station-mode føles for vrient for målgruppen: bytt til mode:'mcq'
    // og gjenopprett de tre flervalgs-spørsmålene fra git-historikken (commit før v2).
    puzzle: {
        mode: 'station',
        stationLabel: 'Skriv forsidesaken: plasser det skarpeste beviset under hver påstand',
        requiresItems: ['notat-darlig-bevaepnet', 'notat-fascismens-natur', 'notat-elitens-svik'],
        steps: [
            {
                question: 'Tre påstander skal stå på forsiden. Hvilket notat beviser hver av dem best?',
                hint:
                    'Slot 1: hva gjorde marsjen militært maktesløs? Slot 2: hva er fascismens ' +
                    'kjerne? Slot 3: hvorfor ønsket de rike Mussolini velkommen?',
                options: [],
                ingredientSlots: [
                    'notat-darlig-bevaepnet',
                    'notat-fascismens-natur',
                    'notat-elitens-svik',
                ],
                slotLabels: [
                    'Hæren kunne knust marsjen på en time',
                    'Fascismens sanne kjerne',
                    'Hvorfor eliten ønsket Mussolini velkommen',
                ],
                correctFeedback:
                    'Forsiden står. Du har bevist det selv: en militært maktesløs bløff, en ' +
                    'voldelig ideologi, og en elite som åpnet døra. Nå avgjøres alt i palasset.',
                incorrectFeedback:
                    'Ikke helt. Les notatene dine igjen: hvilket bevis passer skarpest under ' +
                    'hver påstand? Tenk militær makt, ideologiens kjerne, og elitens kalkyle.',
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
        const headline = engine.getFlag<boolean>('overskrift_bloeff')
            ? '«Bløffen ingen våget å stanse»'
            : engine.getFlag<boolean>('overskrift_vold')
              ? '«Volden er politikken deres»'
              : engine.getFlag<boolean>('overskrift_elite')
                ? '«Eliten åpnet døren for ham»'
                : null;
        const headlinePart = headline
            ? ` Forsiden din - ${headline} - rakk aldri å stoppe noe. Men den ble stående som et vitnesbyrd om hva som egentlig skjedde.`
            : '';
        const comparison = engine.getFlag<boolean>('compared_communism')
            ? ' Og du så forskjellen Conti pekte på: både fascisme og kommunisme forakter ' +
              'individets frihet og bruker vold - men der kommunismen ville ta eiendommen hans, ' +
              'lot fascismen ham beholde den mot lydighet. Derfor valgte eliten fascismen.'
            : '';
        const observer =
            ' Du så alt med egne øyne. Du skrev det ned, ord for ord. Men ingen av dem som kunne ' +
            'ha stoppet det, ville. Det var aldri din makt å endre denne dagen - bare å se den klart.';
        const reflection =
            ' Spør deg selv: finnes det bevegelser i dag som lover orden og storhet - mot at du ' +
            'gir opp litt frihet?';
        return base + headlinePart + comparison + observer + reflection;
    },

    setupScene: setupMarsjenMotRomaScene,
};
