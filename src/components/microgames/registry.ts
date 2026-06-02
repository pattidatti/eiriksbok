import { lazy } from 'react';
import type { MicroGameEntry } from './types';

// Registry over alle mikro-spill. Hvert spill lazy-lastes — ingen tunge
// avhengigheter belaster bundle før eleven faktisk åpner et spill.
// Three.js-avhengige spill (3D) blir kun lastet når eleven åpner dem.

const GladiusDuel = lazy(() => import('./GladiusDuel'));
const Colosseum3D = lazy(() => import('./Colosseum3D'));
const TheodosianWalls3D = lazy(() => import('./TheodosianWalls3D'));
const Hamskiftet3D = lazy(() => import('./Hamskiftet3D'));
const VikingShip3D = lazy(() => import('./VikingShip3D'));
const IngenmanslandMG = lazy(() => import('./IngenmanslandMG'));
const TidensFormer3D = lazy(() => import('./TidensFormer3D'));
const DampmaskinHjerte3D = lazy(() => import('./DampmaskinHjerte3D'));
const Falanksen3D = lazy(() => import('./Falanksen3D'));
const OlympiaDiskos3D = lazy(() => import('./OlympiaDiskos3D'));

export const MICRO_GAMES: Record<string, MicroGameEntry & { Component: React.LazyExoticComponent<React.ComponentType<unknown>> }> = {
    'gladius-duell': {
        id: 'gladius-duell',
        title: 'Gladius-duell',
        description:
            'Turbasert sverdduell mot en romersk gladiator. Lær å lese motstanderens trekk.',
        estimatedSeconds: 180,
        loader: () => import('./GladiusDuel'),
        Component: GladiusDuel as never,
    },
    'colosseum-3d': {
        id: 'colosseum-3d',
        title: 'Roter Colosseum',
        description:
            'Bla rundt Colosseum i 3D og klikk de fire etasjene i riktig byggerekkefølge.',
        estimatedSeconds: 120,
        loader: () => import('./Colosseum3D'),
        Component: Colosseum3D as never,
    },
    'teodosianmuren': {
        id: 'teodosianmuren',
        title: 'Teodosianmuren',
        description:
            'Roter Konstantinopels trippelmur i 3D, finn de fire forsvarslagene, og se Mehmet 2.s kanon knuse muren i 1453.',
        estimatedSeconds: 120,
        loader: () => import('./TheodosianWalls3D'),
        Component: TheodosianWalls3D as never,
    },
    'hamskiftet-3d': {
        id: 'hamskiftet-3d',
        title: 'Det store hamskiftet',
        description:
            'Forvandle en norsk bygd i 3D: bygg jernbanen, kjøp slåmaskinen, og se husmennene dra til Amerika og byen.',
        estimatedSeconds: 150,
        loader: () => import('./Hamskiftet3D'),
        Component: Hamskiftet3D as never,
    },
    'vikingskip-3d': {
        id: 'vikingskip-3d',
        title: 'Bygg vikingskipet',
        description:
            'Bygg et vikingskip i 3D: dra kjølen på plass, klink bordgangene, reis masten, og form skroget til langskip eller knarr.',
        estimatedSeconds: 160,
        loader: () => import('./VikingShip3D'),
        Component: VikingShip3D as never,
    },
    'ingenmannsland-mg': {
        id: 'ingenmannsland-mg',
        title: 'Maskingevær ved Somme',
        description:
            'Forsvar en britisk skyttergrav i 3D: skyt soldater som løper over ingenmannsland og kjenn på kroppen hvorfor Vestfronten stivnet.',
        estimatedSeconds: 130,
        loader: () => import('./IngenmanslandMG'),
        Component: IngenmanslandMG as never,
    },
    'tidens-former-3d': {
        id: 'tidens-former-3d',
        title: 'Tidens to former',
        description:
            'Kjenn på eskatologiens kjerne i 3D: la en verden løpe gjennom skapelse, blomstring, forfall og undergang - og se hvordan tidshjulet (sirkulær tid) føder den på ny, mens tidspilen (lineær tid) ender i ett evig punktum.',
        estimatedSeconds: 150,
        loader: () => import('./TidensFormer3D'),
        Component: TidensFormer3D as never,
    },
    'dampmaskin-hjerte-3d': {
        id: 'dampmaskin-hjerte-3d',
        title: 'Dampmaskinens hjerte',
        description:
            'Kjoer en dampmaskin i 3D: pump gruva med spaken, sett inn Watts separate kondensator, og kjenn paa kroppen hvorfor den holdt sylinderen varm og sparte tre fjerdedeler av kullet.',
        estimatedSeconds: 150,
        loader: () => import('./DampmaskinHjerte3D'),
        Component: DampmaskinHjerte3D as never,
    },
    'falanksen-3d': {
        id: 'falanksen-3d',
        title: 'Bygg falanksen',
        description:
            'Still opp en gresk hoplitt-falanks i 3D: plasser mennene, skyv skjoldene tett sammen, og stå imot fiendens angrep. Kjenn hvorfor skjoldmuren var så sterk.',
        estimatedSeconds: 140,
        loader: () => import('./Falanksen3D'),
        Component: Falanksen3D as never,
    },
    'olympia-diskos-3d': {
        id: 'olympia-diskos-3d',
        title: 'Diskos paa Olympia',
        description:
            'Kast diskos paa Olympias hellige stadion i 3D: still inn vinkel og kraft, se kastebanen, og slaa rekorden for aa vinne olivenkransen. Oppdag at diskosen flyr lengst ved rundt 45 grader.',
        estimatedSeconds: 140,
        loader: () => import('./OlympiaDiskos3D'),
        Component: OlympiaDiskos3D as never,
    },
};

export function getMicroGame(id: string) {
    return MICRO_GAMES[id];
}
