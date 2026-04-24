// Oljeplattformen - Ekofisk-inspirert mini-spill.
//
// Eleven er ny teknisk assistent på en norsk oljeplattform i Nordsjøen, tidlig
// 1980-tall. Skiftlederen Gunnar viser hvordan oljen reiser fra havbunnen, via
// brønnhodet, gjennom separatoren og til eksport-røret. Målet er at eleven skal
// forstå de tre trinnene: BRØNNHODE → SEPARATOR → EKSPORT.
//
// Blueprint: docs/Design documents/minigames/oljeplattform-blueprint.md

import type { GameConfig } from '../engine/types';
import { setupOljeplattformScene } from './OljeplattformAssets';

export const oljeplattformConfig: GameConfig = {
    id: 'oljeplattform',
    title: 'Oljeplattformen',
    subtitle: 'Ekofisk, Nordsjøen · Tidlig 1980-tall',
    subject: 'samfunnsfag',
    description:
        'Din første dag offshore. Skiftleder Gunnar skal vise deg hvordan oljen reiser ' +
        'fra havbunnen til tankskipet: gjennom brønnhodet, separatoren og eksport-røret. ' +
        'Før helikopteret kommer med kveldens bemanning skal du ha startet eksport-pumpen selv.',
    thumbnail: '',

    learningGoals: [
        'Eleven kan beskrive de tre hovedtrinnene i oljeproduksjon: brønnhode, separator, eksport.',
        'Eleven kan forklare hvorfor olje og gass må skilles, og hvorfor overskuddsgass fakles.',
        'Eleven kan plassere norsk oljevirksomhet i tid og forstå hvorfor Ekofisk var så viktig.',
    ],
    curriculumTags: [
        'samfunnsfag-geografiske-forhold-norge',
        'samfunnsfag-oljeeventyret',
    ],

    world: {
        preset: 'open',
        backgroundColor: '#e4906a',
        fogDensity: 0.004,
    },

    physics: {
        enabled: true,
        playerJump: false,
        gravity: -18,
    },

    visual: {
        postProcessing: 'auto',
        timeOfDay: 0.82,
        colorGrading: 'dusk',
        sky: 'procedural',
        weather: { type: 'clear', intensity: 0 },
        shadows: 'cascaded',
        volumetricLight: true,
    },

    player: {
        // Spilleren spawner på dekket, sør for stasjonene. Dekk-overflaten er ved y=0
        // siden buildOutdoor-bakken fungerer som dekket.
        startPosition: [0, 0.5, 10],
        colors: {
            body: 0xd06020,   // oransje overall
            head: 0xe8b898,
            legs: 0x2a2a2a,
        },
    },

    characters: [],
    dialogs: {},

    // Ingen inventar-items - spillet er interaktable-drevet (ingen ting bæres).
    items: [],
    inventorySize: 0,

    quests: [
        {
            phase: 'intro',
            objective: 'Snakk med Gunnar, så gå til brønnhodet og les av trykkmåleren.',
        },
        {
            phase: 'started',
            objective: 'Gå til separator-kolonnen og inspiser panelet.',
        },
        {
            phase: 'knows-flow',
            objective: 'Gå til eksport-panelet og trekk spaken for å starte produksjonen.',
        },
        {
            phase: 'done',
            objective: 'Du har fått systemet i gang.',
        },
    ],

    endText: (engine) => {
        const understandsFlaring = engine.getFlag('understands-flaring');
        const base =
            'Flammetårnet lyser opp havet bak deg. Den første oljen du selv har sendt ' +
            'mot land er på vei gjennom røret til Teesside. Gunnar klapper deg på skulderen. ' +
            '"Velkommen offshore."';
        if (understandsFlaring) {
            return (
                base +
                '\n\nDu vet nå hvorfor flammen brenner. Den holder plattformen trygg - ' +
                'overskuddsgassen har ingen annen vei å gå. Ingenting her er tilfeldig.'
            );
        }
        return (
            base +
            '\n\nDu har sett de tre trinnene: brønnhodet henter oljen opp, separatoren ' +
            'skiller den fra gass og vann, og eksport-røret sender den i land.'
        );
    },

    setupScene: setupOljeplattformScene,
};
