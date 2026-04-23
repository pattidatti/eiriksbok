import * as THREE from 'three';
import type { GameConfig } from '../engine/types';
import { setupWattLabScene } from './WattLabAssets';

export const wattLabConfig: GameConfig = {
    id: 'watt-lab',
    title: 'Watts Laboratorium',
    subtitle: 'Dampmaskinens Fødsel · 1765',
    subject: 'historie',
    description:
        'Hjelp James Watt å fullføre oppfinnelsen som skal forandre verden. Gå rundt i verkstedet, samle deler, og løs gåten om separat kondensator.',
    thumbnail: '/images/industri/watt-lab-thumb.png',

    world: {
        preset: 'workshop',
        roomSize: 20,
        wallHeight: 6,
        backgroundColor: '#6b5544',
        fogDensity: 0.008,
    },

    visual: {
        sky: 'none',
        timeOfDay: 0.5,
        colorGrading: 'warm',
        postProcessing: {
            quality: 'auto',
            bloom: { strength: 0.45, threshold: 0.30, radius: 0.7 },
            exposure: 1.6,
        },
    },

    intro: {
        type: 'title',
        title: 'Watts Laboratorium',
        subtitle: 'Glasgow, Skottland · 1765',
        durationMs: 2500,
        fadeMs: 700,
        skippable: true,
    },

    lights: [
        {
            id: 'lamp-main',
            position: [0, 5.5, 0],
            color: 0xffeedd,
            intensity: 4,
            animation: 'flicker-soft',
            castShadow: true,
        },
        {
            id: 'lamp-forge',
            position: [-7, 5.5, -7],
            color: 0xff8844,
            intensity: 5,
            animation: 'flicker',
            castShadow: true,
            coneOpacity: 0.22,
        },
        {
            id: 'lamp-platform',
            position: [0, 5.5, -5],
            color: 0xffddcc,
            intensity: 3.5,
            animation: 'flicker-soft',
            castShadow: true,
        },
    ],

    physics: {
        enabled: true,
        playerJump: true,
    },

    player: {
        startPosition: [4, 0, 4],
        colors: { body: 0x3a5a7a, head: 0xf0c090, legs: 0x4a3020 },
    },

    characters: [
        {
            id: 'watt',
            name: 'James Watt',
            position: [2.5, 0, -3],
            colors: { body: 0x5a3a2a, head: 0xe8b888, legs: 0x3a2515 },
            characterType: 'scientist',
            defaultEmotion: 'glad',
            marker: true,
            extras: (g) => {
                const apron = new THREE.Mesh(
                    new THREE.BoxGeometry(0.52, 0.7, 0.05),
                    new THREE.MeshStandardMaterial({ color: 0xaa8855, roughness: 0.8, metalness: 0.0 })
                );
                apron.position.set(0, 0.85, 0.22); g.add(apron);
                const wig = new THREE.Mesh(
                    new THREE.SphereGeometry(0.3, 16, 16),
                    new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.8, metalness: 0.0 })
                );
                wig.position.y = 1.68; wig.scale.set(1, 0.75, 1.1); g.add(wig);
            },
        },
    ],

    collectibles: [
        { id: 'sylinder', name: 'Messingsylinder', position: [6, 1.2, -4], geometry: 'cylinder', color: 0xc8a04a },
        { id: 'ventil', name: 'Ventil', position: [-5, 1.2, -6], geometry: 'torus', color: 0x8b7355 },
        { id: 'kondensator', name: 'Kobberkondensator', position: [-7.5, 0.5, 5], geometry: 'cylinder', color: 0xb77a3e },
    ],

    quests: [
        { phase: 'intro', objective: 'Snakk med James Watt (trykk E).' },
        { phase: 'collecting', objective: 'Finn delene i verkstedet. Se etter de gule lysene.' },
        { phase: 'return', objective: 'Gå tilbake til Watt ved platformen!' },
        { phase: 'puzzle', objective: 'Bygg dampmaskinen steg for steg.' },
        { phase: 'puzzleWon', objective: 'Se hva dere har skapt! Snakk med Watt når du er klar.' },
    ],

    dialogs: {
        intro: {
            speaker: 'James Watt',
            text: 'Ah, endelig! Du må være den unge lærlingen fra universitetet. Jeg er James Watt, og jeg står fast. Newcomen-maskinen der borte sløser bort halvparten av dampen på å varme opp sylinderen igjen og igjen. Det er skandaløst ineffektivt!',
            choices: [
                { text: 'Hva er problemet egentlig?', next: 'problem' },
                { text: 'Hvordan kan jeg hjelpe?', next: 'help' },
            ],
        },
        problem: {
            speaker: 'James Watt',
            text: 'Se her: Hver gang dampen kondenseres inne i sylinderen, må vi varme opp hele sylinderen på nytt. Enorm sløsing av kull! Jeg har en idé - en separat kondensator! Jeg har bygget en platform der borte. Finn delene, så bygger vi maskinen sammen.',
            choices: [{ text: 'Jeg finner delene!', next: 'fetch' }],
        },
        help: {
            speaker: 'James Watt',
            text: 'Jeg trenger tre deler: en messingsylinder, en ventil, og - viktigst av alt - en kobberbeholder som kan fungere som separat kondensator. Let rundt i verkstedet. De bør være her et sted.',
            choices: [{ text: 'På saken!', next: 'fetch' }],
        },
        fetch: {
            speaker: 'James Watt',
            text: 'Utmerket! Let etter de gule lysene rundt delene. Kom tilbake til meg ved platformen når du har alle tre, så monterer vi maskinen foran dine egne øyne.',
            choices: [{ text: 'Greit.', next: null }],
            onEnd: () => {},
        },
        progress: {
            speaker: 'James Watt',
            text: () => 'Du er på vei! Fortsett å lete etter de resterende delene.',
            choices: [{ text: 'Jeg fortsetter.', next: null }],
        },
        puzzleIntro: {
            speaker: 'James Watt',
            text: 'Fantastisk! Se på platformen - vi skal bygge maskinen del for del. For hvert riktig svar dukker neste komponent opp. Hvilken rekkefølge skal dampen strømme?',
            choices: [
                {
                    text: 'La oss bygge!',
                    next: null,
                    action: () => {
                        // Settes dynamisk i setupScene
                    },
                },
            ],
        },
        puzzleWin: {
            speaker: 'James Watt',
            text: 'DET VIRKER! Ser du svinghjulet som går? Dampen kondenseres i den separate beholderen, sylinderen holder seg varm, og maskinen kan gå kontinuerlig! Dette vil mangedoble effektiviteten. Vi har nettopp forandret historien, min venn. Dampmaskinen er født!',
            choices: [
                {
                    text: 'Gratulerer, mester Watt!',
                    next: null,
                    action: () => {},
                },
            ],
        },
    },

    puzzle: {
        steps: [
            {
                question: 'Først: Hvor kommer dampen fra?',
                hint: 'Tenk på hva som varmer opp vannet til damp.',
                options: [
                    { text: '🔥 Dampkjelen (vann varmes til damp)', correct: true, feedback: 'Riktig! Kjelen produserer dampen.' },
                    { text: '❄ Kondensatoren', correct: false, feedback: 'Nei - kondensatoren er der dampen ENDER opp, ikke der den starter.' },
                ],
            },
            {
                question: 'Så: Hvor skal dampen jobbe?',
                hint: 'Dampen må presse noe for å gjøre nytte for seg.',
                options: [
                    { text: '⚙ Sylinderen med stempelet', correct: true, feedback: 'Nettopp! Dampen presser stempelet og gjør det mekaniske arbeidet.' },
                    { text: '📦 Rett tilbake til kjelen', correct: false, feedback: 'Det gir ingen mening - da ville dampen aldri gjort noe arbeid.' },
                ],
            },
            {
                question: 'Til slutt: Hvor skal dampen kondenseres?',
                hint: 'Dette er Watts store idé - kondenseringen må IKKE skje i sylinderen.',
                options: [
                    { text: '💧 Den separate kondensatoren', correct: true, feedback: 'GENIALT! Det er dette som er hele oppfinnelsen!' },
                    { text: '🔥 Inne i sylinderen', correct: false, feedback: 'Men det er jo nettopp problemet med Newcomen-maskinen! Sylinderen må holdes varm.' },
                ],
            },
        ],
    },

    monologs: {
        intro_narration: {
            id: 'intro_narration',
            lines: [
                'Glasgow, Skottland. 1765.',
                'Her i dette verkstedet er James Watt i ferd med å forandre historien.',
            ],
            once: true,
        },
        near_forge: {
            id: 'near_forge',
            lines: [
                'Essen brenner. Kjelen produserer damp.',
                'Men HELE sylinderen kjøles ned etterpå - halvparten av energien forsvinner i luft.',
                'Det er skandaløst sløsing. Det MÅ finnes en bedre måte.',
            ],
            once: true,
        },
        found_kondensator: {
            id: 'found_kondensator',
            lines: [
                'Kobberbeholderen.',
                'Hvis dampen kondenseres HER, utenfor sylinderen, trenger vi aldri kjøle ned sylinderen igjen.',
            ],
            once: true,
        },
        engine_running: {
            id: 'engine_running',
            lines: [
                'Den beveger seg.',
                'Svinghjulet snurrer. Stempelet pumper.',
                'For første gang kondenserer dampen UTENFOR sylinderen.',
                'Dette er starten på den industrielle revolusjonen.',
            ],
            once: true,
        },
    },

    monologTriggers: [
        {
            id: 't_forge',
            monologId: 'near_forge',
            area: { minX: -9.5, maxX: -4.5, minZ: -9.5, maxZ: -4.5 },
        },
        {
            id: 't_kondensator',
            monologId: 'found_kondensator',
            area: { minX: -9.5, maxX: -5.5, minZ: 3, maxZ: 7 },
            requiresPhase: 'collecting',
        },
    ],

    endText: 'Du har hjulpet James Watt å oppfinne den separate kondensatoren - forbedringen som gjorde dampmaskinen til motoren bak den industrielle revolusjonen.\n\nDet tok egentlig Watt over 10 år å perfeksjonere den, men i kveld klarte dere det sammen.',

    setupScene: setupWattLabScene,
};
