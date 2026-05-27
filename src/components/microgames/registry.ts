import { lazy } from 'react';
import type { MicroGameEntry } from './types';

// Registry over alle mikro-spill. Hvert spill lazy-lastes — ingen tunge
// avhengigheter belaster bundle før eleven faktisk åpner et spill.
// Three.js-avhengige spill (3D) blir kun lastet når eleven åpner dem.

const GladiusDuel = lazy(() => import('./GladiusDuel'));
const Colosseum3D = lazy(() => import('./Colosseum3D'));

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
};

export function getMicroGame(id: string) {
    return MICRO_GAMES[id];
}
