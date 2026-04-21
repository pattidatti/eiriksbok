import type { Group, Scene, MeshToonMaterial } from 'three';

export type SubjectId = 'historie' | 'norsk' | 'krle' | 'samfunnsfag' | 'musikk';

export type AABB2D = { minX: number; maxX: number; minZ: number; maxZ: number };

export interface DialogChoice {
    text: string;
    next: string | null;
    action?: () => void;
}

export interface DialogNode {
    speaker: string;
    text: string | (() => string);
    choices: DialogChoice[];
    onEnd?: () => void;
}

export interface PuzzleOption {
    text: string;
    correct: boolean;
    feedback: string;
}

export interface PuzzleStep {
    question: string;
    hint: string;
    options: PuzzleOption[];
    onCorrect?: () => void;
}

export interface CharacterColors {
    body: number;
    head: number;
    legs: number;
}

export interface CharacterConfig {
    id: string;
    name: string;
    position: [number, number, number];
    colors: CharacterColors;
    face?: 'happy' | 'excited';
    extras?: (group: Group) => void;
    marker?: boolean;
}

export interface CollectibleConfig {
    id: string;
    name: string;
    position: [number, number, number];
    geometry: 'cylinder' | 'torus' | 'sphere' | 'box';
    color: number;
}

export type WorldPreset = 'workshop' | 'longhouse' | 'harbor' | 'custom';

export interface WorldConfig {
    preset: WorldPreset;
    roomSize?: number;
    wallHeight?: number;
    backgroundColor?: string;
    fogDensity?: number;
}

export interface PlayerConfig {
    startPosition: [number, number, number];
    colors: CharacterColors;
}

// Minimal interface exposed to setupScene callbacks
export interface GameEngineRef {
    scene: Scene;
    toonMat: (color: number, opts?: Record<string, unknown>) => MeshToonMaterial;
    config: GameConfig;
    screenFlash: () => void;
    cameraShake: (amount: number, duration: number) => void;
    animateReveal: (group: Group) => void;
    startEngineAnimation: () => void;
    openPuzzle: () => void;
    triggerEnd: () => void;
    updateUI: () => void;
}

export interface GameConfig {
    id: string;
    title: string;
    subtitle: string;
    subject: SubjectId;
    description: string;
    thumbnail: string;
    world: WorldConfig;
    player: PlayerConfig;
    characters: CharacterConfig[];
    collectibles?: CollectibleConfig[];
    quests: { phase: string; objective: string }[];
    dialogs: Record<string, DialogNode>;
    puzzle?: { steps: PuzzleStep[] };
    endText: string;
    // Called once after engine initializes - add game-specific 3D and wire puzzle callbacks here
    setupScene?: (engine: GameEngineRef) => void;
}

export interface GameUIState {
    started: boolean;
    questObjective: string;
    questParts: { id: string; name: string; collected: boolean }[];
    showInteractPrompt: boolean;
    dialog: {
        visible: boolean;
        speaker: string;
        text: string;
        choices: string[];
    } | null;
    puzzle: {
        visible: boolean;
        stepIndex: number;
        stepLabels: string[];
        question: string;
        hint: string;
        feedback: string;
        options: string[];
    } | null;
    ended: boolean;
    endText: string;
}
