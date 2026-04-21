import type { MonologNode, MonologTrigger } from '../engine/types';

// Indre monolog - Torsteins stemme gjennom hele spillet. Trigges av posisjon, fase, eller dialog-action.
// Språk: 14-åring-forståelig bokmål. Ingen em-dash, ingen tankestrek - kun bindestrek.
export const lindisfarneMonologs: Record<string, MonologNode> = {
    // ───── Introduksjon i båten (trigges av spillstart) ─────
    intro_boat: {
        id: 'intro_boat',
        lines: [
            'Havet er flatt i dag.',
            'Jeg heter Torstein. Det er første gang jeg er så langt hjemmefra.',
            'Sigurd sier øya heter Lindisfarne. Jeg vet ikke hva navnet betyr.',
        ],
        once: true,
    },

    // Utløses av spillets første blikk på land
    first_sight_of_island: {
        id: 'first_sight_of_island',
        lines: [
            'Der. Jeg ser den.',
            'En mørk stripe i horisonten. Lavere enn jeg trodde.',
        ],
        once: true,
    },

    // ───── Strand-fasen ─────
    landing_smell: {
        id: 'landing_smell',
        lines: [
            'Lukt av tang og fisk.',
            'Beina mine skjelver litt. Jeg har vært på sjøen i to dager.',
        ],
        once: true,
    },
    climbing_path: {
        id: 'climbing_path',
        lines: [
            'Stien er smal. Noen har gått den mange ganger.',
            'De andre er foran meg. Jeg hører ikke hva de sier.',
        ],
        once: true,
    },
    gate_open: {
        id: 'gate_open',
        lines: [
            'Porten står åpen.',
            'De har ingen vakt.',
            'De trodde ingen kom.',
        ],
        once: true,
    },

    // ───── Kloster ─────
    chapel_silence: {
        id: 'chapel_silence',
        lines: [
            'Det var noen som sang her.',
            'Nå er det stille.',
            'De må ha stoppet da vi kom.',
        ],
        once: true,
    },
    chapel_altar: {
        id: 'chapel_altar',
        lines: [
            'Et bord med et kors. Sølvbegre ved siden av.',
            'Dette er vel der de snakker med guden sin.',
            'Han ser ikke ut til å svare.',
        ],
        once: true,
    },
    library_discovery: {
        id: 'library_discovery',
        lines: [
            'Bøker. Mange bøker.',
            'Jeg har sett bøker før, men aldri så mange på ett sted.',
        ],
        once: true,
    },
    library_book: {
        id: 'library_book',
        lines: [
            'Én av dem ligger åpen.',
            'Bokstavene har gullkant. Et dyr er tegnet rundt en bokstav.',
            'Noen har brukt lang tid på dette.',
        ],
        once: true,
    },
    dormitory_realization: {
        id: 'dormitory_realization',
        lines: [
            'Små senger. Seks stykker.',
            'Dette er der de sover.',
        ],
        once: true,
    },
    dormitory_personal: {
        id: 'dormitory_personal',
        lines: [
            'Et par sko ved siden av en seng. Slitte.',
            'En tresleiv. En kam.',
            'Dette er ikke bare et kloster. Det er et hjem.',
        ],
        once: true,
    },

    // ───── Etter møte med Eadfrith ─────
    after_choice_spared: {
        id: 'after_choice_spared',
        lines: [
            'Han stod der. Jeg gikk.',
            'Jeg vet ikke hva de andre vil si.',
        ],
        once: true,
    },
    after_choice_killed: {
        id: 'after_choice_killed',
        lines: [
            'Det gikk fort.',
            'Han så ikke bort.',
        ],
        once: true,
    },

    // ───── Epilog - tilbake i båten ─────
    epilog_boat_spared: {
        id: 'epilog_boat_spared',
        lines: [
            'Jeg holder et lite kors i hånda.',
            'Det er ikke verdt noe. Det er bare tre.',
            'Ulv har et gullbeger. Sigurd ler.',
            'Jeg holder korset. Jeg vet ikke hvorfor.',
        ],
        once: true,
    },
    epilog_boat_killed: {
        id: 'epilog_boat_killed',
        lines: [
            'Jeg holder boken i hånda.',
            'Den er tyngre enn den ser ut.',
            'De andre skal krangle om gullet. De lar meg ha boken.',
            'Jeg kan ikke lese den. Jeg vet ikke hva jeg skal med den.',
        ],
        once: true,
    },
};

// AABB-triggere. Koordinater matcher layouten i builders/SeascapeBuilder.ts, BeachBuilder.ts og CloisterBuilder.ts.
// Husk at spiller-world-posisjon brukes (i seated-mode = båtens posisjon).
export const lindisfarneTriggers: MonologTrigger[] = [
    // Fase 'landing' - straks spiller teleporteres til strand
    {
        id: 't_landing_smell',
        monologId: 'landing_smell',
        area: { minX: -10, maxX: 10, minZ: 0, maxZ: 6 },
        requiresPhase: 'landing',
    },

    // Fase 'approach' - når spiller går oppover stien
    {
        id: 't_climbing',
        monologId: 'climbing_path',
        area: { minX: -2.5, maxX: 2.5, minZ: -10, maxZ: -4 },
        requiresPhase: 'approach',
    },
    {
        id: 't_gate',
        monologId: 'gate_open',
        area: { minX: -2.5, maxX: 2.5, minZ: -19, maxZ: -17 },
        requiresPhase: 'approach',
    },

    // Klosterrom - trigges uansett hvilken fase (free exploration)
    {
        id: 't_chapel_silence',
        monologId: 'chapel_silence',
        area: { minX: -4.5, maxX: 4.5, minZ: -32, maxZ: -29 },
    },
    {
        id: 't_chapel_altar',
        monologId: 'chapel_altar',
        area: { minX: -1.5, maxX: 1.5, minZ: -34, maxZ: -32.5 },
    },
    {
        id: 't_library_discovery',
        monologId: 'library_discovery',
        area: { minX: -11, maxX: -5, minZ: -24, maxZ: -20 },
    },
    {
        id: 't_library_book',
        monologId: 'library_book',
        area: { minX: -9.5, maxX: -7.5, minZ: -22.5, maxZ: -21 },
    },
    {
        id: 't_dormitory_realize',
        monologId: 'dormitory_realization',
        area: { minX: 4.5, maxX: 11.5, minZ: -25, maxZ: -19 },
    },
    {
        id: 't_dormitory_personal',
        monologId: 'dormitory_personal',
        area: { minX: 9, maxX: 10.2, minZ: -21.5, maxZ: -20.5 },
    },
];
