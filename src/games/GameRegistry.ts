import React from 'react';

// Game Types
export interface GameDefinition {
    id: string;
    title: string;
    description: string;
    icon: string;
    path: string; // Route path
    thumbnail?: string;
    isMinigame: boolean; // True if it's a small overlay game, False if full page
}

export const GAMES: Record<string, GameDefinition> = {
    'timeline-td': {
        id: 'timeline-td',
        title: 'Tidslinje Forsvar',
        description: 'Forsvar historien mot mørkets krefter i dette Tower Defense spillet.',
        icon: '🛡️',
        path: '/spill/timeline-td',
        isMinigame: false
    },
    'chrono-glider': {
        id: 'chrono-glider',
        title: 'Chrono Glider',
        description: 'Naviger gjennom tidens strømmer.',
        icon: '✈️',
        path: '/spill/chrono-glider',
        isMinigame: false
    },
    'concept-snake': {
        id: 'concept-snake',
        title: 'Konsept Slange',
        description: 'Samle historiske begreper.',
        icon: '🐍',
        path: '/spill/concept-snake',
        isMinigame: false
    },
    'word-sorter': {
        id: 'word-sorter',
        title: 'Ord Sortering',
        description: 'Sorter hendelser i riktig rekkefølge.',
        icon: '📚',
        path: '/spill/word-sorter',
        isMinigame: false
    }
};

export const MINIGAMES: Record<string, GameDefinition> = {
    'WORK': { id: 'WORK', title: 'Jordbruk', description: 'Dyrk jorden for korn.', icon: '🌾', path: '', isMinigame: true },
    'CHOP': { id: 'CHOP', title: 'Skogbruk', description: 'Hogg trær for tømmer.', icon: '🪓', path: '', isMinigame: true },
    'MINE': { id: 'MINE', title: 'Gruvedrift', description: 'Utvinn jern fra fjellet.', icon: '⛏️', path: '', isMinigame: true },
    'CRAFT': { id: 'CRAFT', title: 'Håndverk', description: 'Smi verktøy og våpen.', icon: '⚒️', path: '', isMinigame: true },
    'MILL': { id: 'MILL', title: 'Mølle', description: 'Kvern korn til mel.', icon: '⚙️', path: '', isMinigame: true },
    'DEFEND': { id: 'DEFEND', title: 'Forsvar', description: 'Beskytt landsbyen mot angrep.', icon: '⚔️', path: '', isMinigame: true },
    'EXPLORE': { id: 'EXPLORE', title: 'Utforskning', description: 'Kartlegg ukjente områder.', icon: '🗺️', path: '', isMinigame: true },
    'PATROL': { id: 'PATROL', title: 'Patrulje', description: 'Hold ro og orden.', icon: '🛡️', path: '', isMinigame: true },
    'QUARRY': { id: 'QUARRY', title: 'Steinbrudd', description: 'Hugg stein til bygging.', icon: '🪨', path: '', isMinigame: true },
    'FORAGE': { id: 'FORAGE', title: 'Sanking', description: 'Samle mat fra naturen.', icon: '🍓', path: '', isMinigame: true },
};
