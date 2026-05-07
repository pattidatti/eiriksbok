import type { GameConfig } from '../engine/types';
import { setupCaesarIdesScene } from './CaesarIdesAssets';

export const caesarIdesConfig: GameConfig = {
    id: 'caesar-ides',
    title: 'Mordet på Cæsar',
    subtitle: 'Roma, 15. mars 44 f.Kr.',
    subject: 'historie',
    description:
        'Du er Lucius Vorenus Cotta, ung senator. I dag skal senatet møtes i Pompey-teateret. ' +
        'Noe er galt - alle er anspente. Finn ut hvorfor, før dørene lukkes bak deg.',
    thumbnail: '/images/romerriket/caesar-ides-thumb.webp',

    learningGoals: [
        'Forklare minst to grunner senatorene mente Cæsar truet republikken.',
        'Sette mordet i kontekst som utløser for borgerkrigene og keiserdømmet.',
        'Beskrive hva Idus Martiae er og hvorfor datoen er historisk ikonisk.',
    ],
    curriculumTags: ['historie', 'antikken', 'romerriket', 'republikk', 'diktatur'],

    world: {
        preset: 'open',
        backgroundColor: '#8a7a5a',
        fogDensity: 0.003,
    },

    visual: {
        sky: 'procedural',
        timeOfDay: 0.62,
        colorGrading: 'warm',
        postProcessing: { bloom: { strength: 0.15, threshold: 0.85 }, exposure: 1.2 },
    },

    physics: {
        enabled: true,
        playerJump: true,
    },

    intro: {
        type: 'title',
        title: 'Idus Martiae',
        subtitle: '15. mars 44 f.Kr.',
        durationMs: 3200,
        fadeMs: 900,
        skippable: true,
    },

    player: {
        startPosition: [0, 0, 8],
        colors: {
            body: 0xd8c098,
            head: 0xc8a078,
            legs: 0xc0a878,
        },
    },

    // NPCer legges til deklarativt i setupScene via addNPC.
    characters: [],

    dialogs: {},

    items: [
        {
            id: 'artemidoros-brev',
            name: 'Brev fra Artemidoros',
            description:
                'En gresk lærer har skrevet ned navnene på mennene som vil drepe Cæsar. Kan gis til Cæsar.',
            icon: '📜',
            stackable: false,
        },
        {
            id: 'stilus',
            name: 'Skrivestift',
            description: 'Et spisst skriveredskap av jern. Konspiratørene brukte slike som våpen.',
            icon: '🖋️',
            stackable: false,
        },
    ],
    inventorySize: 4,

    quests: [
        {
            phase: 'street_arrival',
            objective: 'Finn veien til Senatet. Snakk med folk du møter underveis.',
        },
        {
            phase: 'meeting_conspirators',
            objective: 'Cassius og Brutus venter ved trappen. Hør hva de har å si.',
        },
        {
            phase: 'caesar_arrives',
            objective: 'Cæsar ankommer. Gå inn i Senatet sammen med de andre.',
        },
        {
            phase: 'assassination',
            objective: 'Hold deg tilbake. Se hva som skjer.',
        },
        {
            phase: 'aftermath',
            objective: 'Forlat salen.',
        },
    ],

    endText:
        '15. mars 44 f.Kr. ble Gaius Julius Cæsar drept i Pompey-teateret, under statuen av mannen ' +
        'han hadde beseiret. Senatorene trodde de hadde reddet republikken. I stedet utløste de ' +
        'tretten år med borgerkrig. Da støvet la seg, var det Cæsars adoptivsønn Octavian som sto ' +
        'igjen - og som keiser Augustus avskaffet han i praksis republikken de hadde drept for å ' +
        'bevare. Idus Martiae forble det sterkeste varselet i europeisk politisk historie: den som ' +
        'prøver å drepe en tyrann, kan ende opp med å gjøre ham udødelig.',

    setupScene: setupCaesarIdesScene,
};
