import type { Group, Scene, MeshToonMaterial } from 'three';

export type SubjectId = 'historie' | 'norsk' | 'krle' | 'samfunnsfag' | 'musikk';

export type AABB2D = { minX: number; maxX: number; minZ: number; maxZ: number };

export type Emotion = 'glad' | 'worried' | 'surprised' | 'triumphant';
export type CharacterType = 'scientist' | 'farmer' | 'noble' | 'monk';

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
    characterType?: CharacterType;
    defaultEmotion?: Emotion;
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

export type WorldPreset = 'workshop' | 'longhouse' | 'harbor' | 'open' | 'custom';

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

// Player movement modes. 'free' = normal WASD. 'seated' = locked to a parent group (e.g. boat).
// 'scripted' = external code sets position each frame.
export type PlayerMode = 'free' | 'seated' | 'scripted';

export interface MonologNode {
    id: string;
    lines: string[];
    // Auto from line length when omitted (50ms/char, min 2500, max 6000).
    lineDurationMs?: number;
    once?: boolean;
}

export interface MonologTrigger {
    id: string;
    monologId: string;
    area: AABB2D;
    requiresPhase?: string;
}

// Deklarativ definisjon for et rom som RoomSystem bygger. Åpninger er hull i veggene.
export interface RoomOpening {
    side: 'N' | 'S' | 'E' | 'W';
    offset: number;
    width: number;
}

export interface RoomDef {
    id: string;
    center: [number, number];
    size: [number, number];
    wallHeight: number;
    openings?: RoomOpening[];
    floorColor?: number;
    wallColor?: number;
    roofColor?: number;
    hasRoof?: boolean;
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
    setEmotion: (id: string, emotion: Emotion, resetAfterMs?: number) => void;
    // Nye API-metoder for fler-fase-spill med valg og indre monolog
    setFlag: <T>(key: string, value: T) => void;
    getFlag: <T>(key: string) => T | undefined;
    setPlayerMode: (mode: PlayerMode, opts?: { parent?: Group; offset?: [number, number, number] }) => void;
    playMonolog: (id: string) => void;
    hasSeenMonolog: (id: string) => boolean;
    setPhase: (phase: string) => void;
    getPhase: () => string;
    openDialog: (key: string) => void;
    getPlayerPosition: () => { x: number; y: number; z: number };
    teleportPlayer: (x: number, y: number, z: number) => void;
    setCharacterMarkerVisible: (id: string, visible: boolean) => void;
    // Planlegg et kall som kanselleres automatisk hvis motoren disposes.
    // Bruk denne i stedet for setTimeout direkte i setupScene og dialog-actions.
    schedule: (callback: () => void, delayMs: number) => void;
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
    // Indre monolog (ikke-blokkerende tekst). Kan trigges via triggervolumer eller engine.playMonolog.
    monologs?: Record<string, MonologNode>;
    monologTriggers?: MonologTrigger[];
    // Streng, eller en funksjon som kan lese flagg og returnere variabel slutt-tekst.
    endText: string | ((engine: GameEngineRef) => string);
    // Aktiver debug-modus: viser kollisjonsbokser og fase/flagg i HUD.
    debug?: boolean;
    // Called once after engine initializes - add game-specific 3D and wire puzzle callbacks here
    setupScene?: (engine: GameEngineRef) => void;
}

export interface MonologUIState {
    id: string;
    lines: string[];
    currentLine: number;
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
    monolog: MonologUIState | null;
    ended: boolean;
    endText: string;
    showFlash?: boolean;
    paused?: boolean;
    debug?: { phase: string; flags: Record<string, unknown> };
}
