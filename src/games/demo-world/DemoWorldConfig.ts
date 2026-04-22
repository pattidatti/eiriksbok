import type { GameConfig } from '../engine/types';
import { setupDemoWorldScene } from './DemoWorldAssets';

export const demoWorldConfig: GameConfig = {
    id: 'demo-world',
    title: 'Demoverdenen',
    subtitle: 'Grafikkdemo · Åpen verden',
    subject: 'historie',
    description:
        'En åpen verden med vann, skog, hus og bål. Brukes til å teste engine-funksjoner og grafikkoppgraderinger.',
    thumbnail: '',

    world: {
        preset: 'open',
        backgroundColor: '#a8c8e8',
        fogDensity: 0.007,
    },

    player: {
        startPosition: [0, 1, 0],
        colors: { body: 0x3a5a7a, head: 0xf0c090, legs: 0x4a3020 },
    },

    characters: [
        {
            id: 'bonden',
            name: 'Bonden',
            position: [-11, 0, 0],
            colors: { body: 0x7a5c2e, head: 0xd4a574, legs: 0x4a3520 },
            characterType: 'farmer',
            defaultEmotion: 'glad',
            marker: true,
        },
    ],

    quests: [{ phase: 'free', objective: 'Utforsk verdenen fritt.' }],

    dialogs: {
        bonden_greeting: {
            speaker: 'Bonden',
            text: 'Velkommen hit! Her kan du gå rundt og utforske alt.',
            choices: [
                { text: 'Hva er her å se?', next: 'bonden_2' },
                { text: 'Takk, jeg utforsker!', next: null },
            ],
        },
        bonden_2: {
            speaker: 'Bonden',
            text: 'Skogen bak huset har et bål langt inne. Og det er et vann nedover i bakken mot øst.',
            choices: [{ text: 'Takk!', next: null }],
        },
    },

    monologs: {
        vann: {
            id: 'vann',
            lines: ['Vannet glitrer i lyset. Rolig og stille.'],
            once: true,
        },
        skog: {
            id: 'skog',
            lines: ['Trærne tårner seg opp rundt deg. Det lukter mose og jord.'],
            once: true,
        },
        baal: {
            id: 'baal',
            lines: ['Bålet sprekker og knaser. Varmen treffer deg fra lang avstand.'],
            once: true,
        },
    },

    monologTriggers: [
        { id: 't_vann', monologId: 'vann', area: { minX: 10, maxX: 22, minZ: 6, maxZ: 18 } },
        { id: 't_skog', monologId: 'skog', area: { minX: -8, maxX: 3, minZ: -13, maxZ: -7 } },
        { id: 't_baal', monologId: 'baal', area: { minX: 4, maxX: 10, minZ: -25, maxZ: -19 } },
    ],

    endText: 'Du har utforsket demoverdenen.',

    setupScene: setupDemoWorldScene,
};
