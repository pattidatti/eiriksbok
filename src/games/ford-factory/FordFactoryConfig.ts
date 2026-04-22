import type { GameConfig } from '../engine/types';
import { setupFordFactoryScene } from './FordFactoryAssets';
import { fordFactoryDialogs } from './FordFactoryDialogs';
import { fordFactoryMonologs, fordFactoryTriggers } from './FordFactoryMonologs';

// Koordinatoversikt:
//   Spillerens start: (0, 0, 10) - entré i sør
//   Samlebånd:        x = -8 til +8, z = 0 (løper vest til øst)
//   Arbeidere:        z = -1.2, ved hver stasjon
//   Stasjons-posisjoner (fra vest til øst):
//     chassis    x = -7
//     motor      x = -2
//     hjul       x = +2
//     karosseri  x = +7
//   Sorensen (formann): (x = -10, z = 5) - mellom entré og båndet
export const fordFactoryConfig: GameConfig = {
    id: 'ford-factory',
    title: "Fords Fabrikk",
    subtitle: 'Samlebåndets Fødsel · 1908-1914',
    subject: 'historie',
    description:
        'Du er Henry Ford. Hjelp Charles Sorensen å bygge det første samlebåndet, og se hvordan Model T forandret verden - og arbeiderne.',
    thumbnail: '/images/industri/ford-factory-thumb.png',

    world: {
        preset: 'open',
        backgroundColor: '#7a6e60',
        fogDensity: 0.012,
    },

    player: {
        startPosition: [0, 0, 10],
        colors: {
            body: 0x1a2a3a, // mørk dress
            head: 0xe8c4a0,
            legs: 0x1a1a1a,
        },
    },

    characters: [
        {
            id: 'sorensen',
            name: 'Charles Sorensen',
            position: [-10, 0, 5],
            colors: { body: 0x5a4a3a, head: 0xe0b890, legs: 0x2a2015 },
            characterType: 'scientist',
            defaultEmotion: 'worried',
            marker: true,
        },
        // Arbeidere ved hver stasjon. Disse er ikke interaktive (proximity-filter
        // ekskluderer dem fra "trykk E"-logikken), men synlige for atmosfæren.
        {
            id: 'worker_chassis',
            name: 'Arbeider',
            position: [-7, 0, -1.2],
            colors: { body: 0x4a3a2a, head: 0xd4a474, legs: 0x2a2015 },
            characterType: 'farmer',
            defaultEmotion: 'worried',
            marker: false,
        },
        {
            id: 'worker_motor',
            name: 'Arbeider',
            position: [-2, 0, -1.2],
            colors: { body: 0x3a3a3a, head: 0xe0b890, legs: 0x2a2015 },
            characterType: 'farmer',
            defaultEmotion: 'worried',
            marker: false,
        },
        {
            id: 'worker_wheels',
            name: 'Arbeider',
            position: [2, 0, -1.2],
            colors: { body: 0x5a4a3a, head: 0xd4a474, legs: 0x2a2015 },
            characterType: 'farmer',
            defaultEmotion: 'worried',
            marker: false,
        },
        {
            id: 'worker_body',
            name: 'Arbeider',
            position: [7, 0, -1.2],
            colors: { body: 0x3a2a2a, head: 0xe0b890, legs: 0x2a2015 },
            characterType: 'farmer',
            defaultEmotion: 'worried',
            marker: false,
        },
        // Stasjonspunkter — vises kun i 'placing'-fasen. Gir spilleren E-interaksjon
        // direkte ved gulvmarkørene i stedet for å velge via Sorensens meny.
        {
            id: 'station_chassis',
            name: 'Chassis-stasjon',
            position: [-7, 0, -2.2],
            colors: { body: 0x6a5a3a, head: 0xd4a474, legs: 0x2a2015 },
            characterType: 'farmer',
            marker: true,
        },
        {
            id: 'station_motor',
            name: 'Motor-stasjon',
            position: [-2, 0, -2.2],
            colors: { body: 0x6a5a3a, head: 0xd4a474, legs: 0x2a2015 },
            characterType: 'farmer',
            marker: true,
        },
        {
            id: 'station_wheels',
            name: 'Hjul-stasjon',
            position: [2, 0, -2.2],
            colors: { body: 0x6a5a3a, head: 0xd4a474, legs: 0x2a2015 },
            characterType: 'farmer',
            marker: true,
        },
        {
            id: 'station_body',
            name: 'Karosseri-stasjon',
            position: [7, 0, -2.2],
            colors: { body: 0x6a5a3a, head: 0xd4a474, legs: 0x2a2015 },
            characterType: 'farmer',
            marker: true,
        },
    ],

    quests: [
        { phase: 'intro', objective: 'Snakk med Charles Sorensen (trykk E).' },
        { phase: 'placing', objective: 'Gå til de merkede posisjonene og trykk E for å plassere stasjonene.' },
        { phase: 'running_1913', objective: 'Gå rundt og observer. Snakk med Sorensen for å gå videre.' },
        { phase: 'year_1914', objective: 'Det er 1914. Snakk med Sorensen om situasjonen.' },
    ],

    dialogs: fordFactoryDialogs,
    monologs: fordFactoryMonologs,
    monologTriggers: fordFactoryTriggers,

    endText: (engine) => {
        const fiveDollar = engine.getFlag<boolean>('fiveDollarDay');
        const base =
            'Samlebåndet senket monteringstiden fra 12 timer til 93 minutter. Prisen på en Model T falt fra 850 dollar i 1908 til 260 dollar i 1925.\n\n' +
            'Ford bygget 15 millioner Model T fra 1908 til 1927. For første gang kunne vanlige familier ha bil.\n\n' +
            'Men samlebåndet spredte seg til hele verden. Arbeidet ble delt i bittesmå håndgrep. Arbeiderne ble raskere - og mer utbrukt.';
        if (fiveDollar) {
            return (
                base +
                '\n\nFem dollar-dagen kom i 1914. Ford halverte arbeidstimene og doblet lønnen. Turnoveren stupte. Arbeiderne kunne endelig kjøpe bilene de bygget.'
            );
        }
        return base;
    },

    setupScene: setupFordFactoryScene,
};
