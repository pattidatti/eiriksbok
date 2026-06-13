import type { GameConfig, GameEngineRef } from '../engine/types';
import { LAYOUT } from './StiklestadMap';
import { PALETTE } from './StiklestadPalette';
import { setupStiklestadScene } from './StiklestadAssets';

// ─── Stiklestad 1030 - GameConfig ────────────────────────────────────────────
// Showcase for motorens Fase 8 (terreng, kits, interaksjonsverb). Innholdet og
// wiringen ligger i StiklestadAssets.setupScene.

export const stiklestadConfig: GameConfig = {
    id: 'stiklestad-1030',
    title: 'Stiklestad 1030',
    subtitle: 'Kongen som tapte slaget og vant landet',
    subject: 'historie',
    description:
        'Du er vannbærer i kong Olavs leir kvelden før slaget ved Stiklestad. Tren, lytt til mennene rundt bålene, og stå i skjoldborgen når bondehæren angriper.',
    thumbnail: '/images/vikingtiden/stiklestad-1030-thumb.webp',

    learningGoals: [
        'Eleven kan forklare hvorfor slaget ved Stiklestad sto: rikssamling og kristning mot bondehøvdinger støttet av Knut den mektige.',
        'Eleven kan forklare hvordan Olav Haraldsson ble Olav den hellige, og hva helgenkulten i Nidaros betydde.',
        'Eleven kan forklare hva kristningen endret i Norge.',
    ],
    curriculumTags: ['historie', 'vikingtiden', 'kristningen', 'rikssamling', 'olav-den-hellige'],

    world: {
        preset: 'open',
        backgroundColor: '#c7a98a',
        fogDensity: 0.0075,
    },

    visual: {
        sky: 'procedural',
        timeOfDay: 0.66,
        skyOptions: { turbidity: 7, rayleigh: 2.1 },
        postProcessing: 'auto',
    },

    physics: {
        enabled: true,
        playerJump: true,
    },

    // Sonetittel-intro (Fase 8) i stedet for intro-kortet.
    intro: {
        type: 'zone',
        title: 'Stiklestad',
        subtitle: '29. juli 1030',
        durationMs: 3400,
        fadeMs: 1000,
    },

    // Åpnings-cinematic som glir inn i spillerkontroll (Fase 8).
    openingCinematic: [
        { duration: 3.2, cameraPos: [44, 30, 96], lookAt: [0, 3, 40], fov: 56, transition: 'fade' },
        { duration: 2.6, cameraPos: [10, 5, 66], lookAt: [0, 2, 56], fov: 60, transition: 'glide' },
    ],
    openingCinematicEnd: { glideToPlayerMs: 1500 },

    player: {
        startPosition: LAYOUT.PLAYER_START,
        colors: {
            body: PALETTE.hirdBlue,
            head: PALETTE.skin,
            legs: PALETTE.ironDark,
        },
    },

    characters: [], // lagt til via addNPC i setupScene
    dialogs: {},     // merges via addNPC + Assets

    quests: [
        { phase: 'leiren', objective: 'Snakk med skalden Tormod og bli kjent i leiren.' },
        { phase: 'treningen', objective: 'Tren spydkast: treff blinkene på treningsbanen.' },
        { phase: 'kvelden', objective: 'Snakk med mennene ved de tre bålene før natten er over.' },
        { phase: 'slaget', objective: 'Stå i skjoldborgen og kast mot bondehæren. Hold linjen.' },
        { phase: 'etterspillet', objective: 'Se hva som ble igjen etter slaget.' },
    ],

    puzzle: {
        mode: 'mcq',
        steps: [
            {
                question: 'Hvorfor sto slaget ved Stiklestad?',
                hint: 'Tenk på hva Olav ville med Norge, og hvem som ville stoppe ham.',
                options: [
                    {
                        text: 'Olav ville samle Norge under én konge og én tro. Bondehøvdinger, støttet av Knut den mektige, ville ha ham bort.',
                        correct: true,
                        feedback: 'Riktig. Rikssamling og kristning sto mot de gamle høvdingene og Knuts gull.',
                    },
                    {
                        text: 'Olav ville plyndre klostre i England, og bøndene ville stoppe ham.',
                        correct: false,
                        feedback: 'Nei. Slaget sto om makten og troen i Norge, ikke om vikingtokt.',
                    },
                    {
                        text: 'Det var en strid om fiskerettigheter i Trondheimsfjorden.',
                        correct: false,
                        feedback: 'Nei. Striden gjaldt hvem som skulle styre landet og hvilken tro det skulle ha.',
                    },
                ],
            },
            {
                question: 'Hva skjedde med Olav etter at han falt?',
                hint: 'Et nederlag ble til noe større. Tenk på Nidaros.',
                options: [
                    {
                        text: 'Han ble dyrket som helgen - Olav den hellige - og det ble reist kirke over graven i Nidaros.',
                        correct: true,
                        feedback: 'Riktig. Folk valfartet til graven, og Olav ble Norges evige konge.',
                    },
                    {
                        text: 'Han ble glemt, og navnet hans ble aldri nevnt igjen.',
                        correct: false,
                        feedback: 'Tvert imot. Olav ble husket sterkere etter døden enn i livet.',
                    },
                    {
                        text: 'Han rømte til Danmark og ble konge der.',
                        correct: false,
                        feedback: 'Nei. Olav falt i slaget. Det var ettermælet hans som levde videre.',
                    },
                ],
            },
            {
                question: 'Hva endret kristningen i Norge?',
                hint: 'Tenk på makt, tro og hvordan landet ble styrt.',
                options: [
                    {
                        text: 'Landet ble samlet under én konge og én tro. Kirker erstattet blot, og kongemakten ble sterkere.',
                        correct: true,
                        feedback: 'Riktig. Kristningen bandt landet og kongemakten tettere sammen.',
                    },
                    {
                        text: 'Ingenting endret seg. Folk levde akkurat som før.',
                        correct: false,
                        feedback: 'Nei. Tro, lover og makt endret seg dypt over de neste hundreårene.',
                    },
                    {
                        text: 'Norge ble en del av Romerriket.',
                        correct: false,
                        feedback: 'Nei. Romerriket var borte for lengst. Endringen var en ny tro og en sterkere konge.',
                    },
                ],
            },
        ],
    },

    endText: (engine: GameEngineRef): string => {
        const base =
            'Olav Haraldsson tapte slaget ved Stiklestad. Men kort tid etter ble han dyrket som helgen, og Olav den hellige samlet Norge sterkere i døden enn han klarte i livet.';
        const syn = engine.getFlag<string>('elevens-syn');
        let linje = '';
        if (syn === 'tro') linje = ' Du valgte å huske troen han kjempet for - den som til slutt vant landet.';
        else if (syn === 'tvil') linje = ' Du valgte å huske tvilen til dem som ikke ville ha den nye troen. Også de var en del av historien.';
        else if (syn === 'ettermaele') linje = ' Du valgte å huske ettermælet - og det var nettopp fortellingen som gjorde Olav udødelig.';
        return base + linje;
    },

    setupScene: setupStiklestadScene,
};
