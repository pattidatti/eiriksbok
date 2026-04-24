// Blueprint-spill: Sokrates i fengselet
//
// Dette er den kanoniske "blueprint"-implementasjonen for mini-spill i Eiriksbok.
// Formålet er å demonstrere alle kjerne-systemer (rom, NPC, dialog, inventar, puzzle,
// monolog, fase, flagg, variabel slutt) ved hjelp av den deklarative builder-APIen,
// UTEN å skrive noe raw Three.js i spill-koden.
//
// Kopier denne mappen for å starte et nytt mini-spill. Endre:
//   - id, title, subtitle, subject, description, thumbnail
//   - items i config.items
//   - scene-bygging i BlueprintQuestAssets.ts
//   - dialogs, monolog-linjer, fase-logikk
//
// Kjør deretter npm run dev og test gjennom Pre-Flight Checklist og Quality Gates
// i BUILD_GAME_GUIDE.md.

import type { GameConfig } from '../engine/types';
import { setupBlueprintScene } from './BlueprintQuestAssets';

export const blueprintQuestConfig: GameConfig = {
    id: 'sokrates-fengsel',
    title: 'Sokrates i fengselet',
    subtitle: 'Athen, 399 f.Kr.',
    subject: 'krle',
    description:
        'Sokrates er dømt til døden. Vennen hans Kriton kommer for å hjelpe ham å flykte. ' +
        'Hva skal Sokrates velge: å drikke gift og følge loven, eller å flykte og leve videre?',
    thumbnail: '',

    world: {
        preset: 'custom',
        roomSize: 10,
        wallHeight: 4,
        backgroundColor: '#1a1510',
        fogDensity: 0.015,
    },

    player: {
        startPosition: [0, 0, 3.5],
        colors: {
            body: 0x4a3a28,
            head: 0xd8b898,
            legs: 0x2a2018,
        },
    },

    // NPC-er registreres deklarativt fra setupScene via addNPC. De trenger IKKE stå
    // her. Vi lar characters være tom - motoren validerer ikke at den er ikke-tom.
    characters: [],

    // Dialog-innhold registreres deklarativt via addNPC (per-NPC-dialog-map).
    // Vi lar dialogs være tom her - addNPC merger inn alt.
    dialogs: {},

    // Inventar-items som pickups kan referere til. MÅ matche itemId i addPickup.
    items: [
        {
            id: 'giftbeger',
            name: 'Beger med skarntyde',
            description: 'Giften som Athens domstol har dømt Sokrates til å drikke.',
            icon: '🍷',
            stackable: false,
        },
        {
            id: 'repstige',
            name: 'Repstige',
            description: 'Kriton har ordnet denne. Fest den i vinduet for å flykte.',
            icon: '🪢',
            stackable: false,
        },
    ],
    inventorySize: 4,

    // Quest-lignende fase-progresjon:
    //   intro     → spilleren kan utforske og prate
    //   valgt     → spilleren har gjort et valg (drukket gift ELLER brukt repstige)
    quests: [
        { phase: 'intro', objective: 'Snakk med Sokrates og Kriton. Hva skal du gjøre?' },
        { phase: 'valgt', objective: 'Valget er tatt.' },
    ],

    // Variabel slutt basert på hvilken flag som ble satt.
    endText: (engine) => {
        if (engine.getFlag('drakk-gift')) {
            return (
                'Sokrates drakk skarntyden med rolig hånd. Han fulgte Athens lover til siste stund, ' +
                'fordi han mente at å bryte dem ville være å bryte avtalen mellom borger og stat. ' +
                'Valget hans ble et symbol for filosofisk integritet: å dø for sine prinsipper heller ' +
                'enn å leve i motsetning til dem.'
            );
        }
        if (engine.getFlag('brukte-repstige')) {
            return (
                'Sokrates klatret ut vinduet i nattens mørke, og Kriton hjalp ham til sikkerhet ' +
                'utenfor Athen. Han levde - men prisen var høy. Han hadde brutt med loven han selv ' +
                'hadde forsvart hele livet. Var livet i eksil verdt mer enn prinsippene?'
            );
        }
        return 'Sokrates sitter i fengselet. Han har ikke bestemt seg ennå.';
    },

    setupScene: setupBlueprintScene,
};
