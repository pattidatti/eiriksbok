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
};

export function getMicroGame(id: string) {
    return MICRO_GAMES[id];
}
