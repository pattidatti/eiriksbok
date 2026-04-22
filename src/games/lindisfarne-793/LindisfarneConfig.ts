import type { GameConfig } from '../engine/types';
import { setupLindisfarneScene } from './LindisfarneAssets';
import { lindisfarneDialogs } from './LindisfarneDialogs';
import { lindisfarneMonologs, lindisfarneTriggers } from './LindisfarneMonologs';

export const lindisfarneConfig: GameConfig = {
    id: 'lindisfarne-793',
    title: 'Lindisfarne 793',
    subtitle: 'Det første raidet',
    subject: 'historie',
    description:
        'Du er Torstein, en ung viking på vei til Lindisfarne. Det du gjør der, bestemmer du selv.',
    thumbnail: '/images/vikingtiden/lindisfarne-thumb.png',

    world: {
        preset: 'open',
        backgroundColor: '#7a9ab8',
        fogDensity: 0.012,
    },

    visual: {
        sky: 'procedural',
        timeOfDay: 0.72,        // sen ettermiddag - varmt sollys ved ankomst
        colorGrading: 'dawn',
        postProcessing: 'auto',
    },

    intro: {
        type: 'title',
        title: 'Lindisfarne',
        subtitle: '8. juni 793',
        durationMs: 3000,
        fadeMs: 1000,
        skippable: true,
    },

    npcRoutes: [
        // Eadfrith vandrer rolig mellom skrivepulten og bokhylla i biblioteket
        {
            characterId: 'eadfrith',
            waypoints: [
                [-8, -22],
                [-6, -23],
                [-9, -21],
            ],
            mode: 'pingpong',
            speed: 0.6,
            pauseMs: 1800,
        },
    ],

    player: {
        startPosition: [0, 0, 0], // blir overstyrt av setupScene (seated i båten)
        colors: {
            body: 0x5a4428, // brunt skinn
            head: 0xd4a574, // hudfarge
            legs: 0x3a2e1e, // mørk bukse
        },
    },

    // Tre NPCer i båten + Eadfrith i biblioteket. Posisjoner settes dynamisk i setupScene
    // (mannskapet plasseres som barn av båten, Eadfrith i biblioteket).
    characters: [
        {
            id: 'sigurd',
            name: 'Høvding Sigurd',
            position: [0, 0, 0],
            colors: { body: 0x8a2a1a, head: 0xd4a574, legs: 0x3a2e1e },
            characterType: 'noble',
            defaultEmotion: 'triumphant',
            marker: true,
        },
        {
            id: 'veteran',
            name: 'Den eldre',
            position: [0, 0, 0],
            colors: { body: 0x4a4038, head: 0xb8956a, legs: 0x2a221a },
            characterType: 'scientist',
            defaultEmotion: 'worried',
            marker: true,
        },
        {
            id: 'ulv',
            name: 'Ulv',
            position: [0, 0, 0],
            colors: { body: 0x6a8a4a, head: 0xd4a574, legs: 0x3a4028 },
            characterType: 'farmer',
            defaultEmotion: 'glad',
            marker: true,
        },
        {
            id: 'eadfrith',
            name: 'Broder Eadfrith',
            position: [-8, 0, -22],
            colors: { body: 0x3a2e1e, head: 0xe8c4a0, legs: 0x2a1f14 },
            characterType: 'monk',
            defaultEmotion: 'worried',
            marker: false,
        },
    ],

    quests: [
        { phase: 'sailing', objective: 'Snakk med hvert mannskapsmedlem før vi lander.' },
        { phase: 'landing', objective: 'Gå opp stien til klosteret.' },
        { phase: 'approach', objective: 'Finn veien gjennom klosterporten.' },
        { phase: 'cloister', objective: 'Utforsk klosteret. Kapell, bibliotek og sovesal.' },
        { phase: 'confrontation', objective: 'En munk står foran deg.' },
        { phase: 'aftermath_spared', objective: 'Gå tilbake til båten.' },
        { phase: 'aftermath_killed', objective: 'Gå tilbake til båten.' },
        { phase: 'return_boat', objective: 'Se tilbake.' },
    ],

    dialogs: lindisfarneDialogs,
    monologs: lindisfarneMonologs,
    monologTriggers: lindisfarneTriggers,

    endText: (engine) => {
        const spared = engine.getFlag<boolean>('sparedEadfrith');
        if (spared) {
            return 'Du lot Eadfrith leve. Boken forble i klosteret. Ryktet om raidet nådde hele Europa, men ett lite manuskript overlevde i en munks hender. Noen ganger endrer en liten beslutning hva som ikke går tapt.';
        }
        return 'Raidet på Lindisfarne i juni 793 rystet det kristne Europa. Munken Alkuin skrev: "Aldri før har en slik redsel rammet Britannia." Det var starten på vikingtiden i vest.';
    },

    setupScene: setupLindisfarneScene,
};
