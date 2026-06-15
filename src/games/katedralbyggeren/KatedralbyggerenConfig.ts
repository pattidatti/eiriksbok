// Katedralbyggeren - referansespill for platforming-verbene (Del D).
//
// En ung steinhugger-lærling skal bringe byggmesterens mejsel opp til toppen av
// stillaset på en katedral under bygging (~1200-tallet). Banen er vertikal og viser
// alle de nye traverserings-verbene:
//   - Stige (klatring)        - hold W ved stigen
//   - Hull mellom stillasbord - hopp (coyote-time + variabel høyde + apex-tuning)
//   - Høy kant                - Space + frem i lufta = mantle/kantgrep
//   - Stein-heis              - bevegelig plattform som bærer deg opp
//   - C                       - bytt mellom 1.- og 3.-person

import type { GameConfig } from '../engine/types';
import { setupKatedralbyggerenScene } from './KatedralbyggerenAssets';

export const katedralbyggerenConfig: GameConfig = {
    id: 'katedralbyggeren',
    title: 'Katedralbyggeren',
    subtitle: 'En domkirke under bygging, ~1200-tallet',
    subject: 'historie',
    thumbnail: '',
    description:
        'Du er steinhugger-lærling på en stor domkirke. Byggmesteren venter på mejselen sin ' +
        'helt øverst i stillaset. Klatre stiger, hopp mellom stillasbordene, dra deg opp på ' +
        'kanter og ri steinheisen til topps. Trykk C for å bytte mellom tredje- og førsteperson.',

    world: {
        preset: 'open',
        backgroundColor: '#acc4d8',
        fogDensity: 0.006,
    },

    player: {
        startPosition: [0, 0, 10],
        colors: {
            body: 0x6b4a2a,
            head: 0xe0bd9a,
            legs: 0x3a2c1c,
        },
    },

    characters: [],
    dialogs: {},

    items: [
        {
            id: 'mejsel',
            name: 'Byggmesterens mejsel',
            description: 'Et solid jernmejsel. Byggmesteren venter på det øverst i stillaset.',
            icon: '🔨',
            stackable: false,
        },
    ],
    inventorySize: 4,

    quests: [
        { phase: 'intro', objective: 'Finn byggmesterens mejsel nede på bakken.' },
        { phase: 'klatre', objective: 'Klatre til topps i stillaset med mejselen.' },
        { phase: 'levert', objective: 'Mejselen er levert.' },
    ],

    endText: (engine) => {
        if (engine.getFlag('levert')) {
            return (
                'Byggmesteren tar imot mejselen med et nikk. "Bra klatret, lærling. En domkirke ' +
                'som denne reises stein for stein, av folk som tør å gå høyt." Under deg brer ' +
                'byen seg ut, og spiret peker mot himmelen - et arbeid som skal stå i hundrevis av år.'
            );
        }
        return 'Mejselen ligger fortsatt et sted i stillaset.';
    },

    setupScene: setupKatedralbyggerenScene,
};
