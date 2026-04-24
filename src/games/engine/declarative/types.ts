// Declarative high-level builder API for mini-games.
//
// Hovedmål: gjøre det umulig å gjøre de vanlige feilene når et nytt spill lages.
// AI-agenter skriver deklarativ konfig-objekter, ikke raw Three.js-kode. Builders
// under hood setter shadows, fysikk, materialer og registrerer interaksjoner med
// riktige defaults.
//
// Bruk: importer funksjonene fra '@/games/engine/declarative' og kall dem fra
// GameConfig.setupScene med engine-referansen som første argument.

import type { Emotion, DialogNode } from '../types';

// ─── Preset-navn (se presets/*.ts for definisjoner) ──────────────────────────

export type MaterialPresetName =
    | 'wood' | 'brick' | 'stone' | 'iron' | 'fabric'
    | 'parchment' | 'grass' | 'water' | 'plaster' | 'thatch'
    | 'marble' | 'dirt';

export type LightingPresetName =
    | 'warm-interior' | 'cold-interior' | 'forge-red' | 'dim-candle'
    | 'outdoor-day' | 'outdoor-dusk' | 'outdoor-night' | 'chapel'
    | 'prison-cell';

export type ModelPresetName =
    // Grunnformer
    | 'cube' | 'sphere' | 'cylinder'
    // Møbler
    | 'bench' | 'chair' | 'table' | 'chest' | 'lectern' | 'barrel' | 'crate'
    // Belysning
    | 'candle' | 'torch' | 'lantern'
    // Bøker / gjenstander
    | 'book' | 'scroll' | 'cup' | 'amphora' | 'sack' | 'rope'
    // Verktøy
    | 'hammer' | 'anvil' | 'quill'
    // Arkitektur
    | 'door' | 'window-bars' | 'pillar' | 'altar';

export type AudioPresetName =
    | 'pickup-tool' | 'pickup-paper' | 'puzzle-win' | 'puzzle-fail'
    | 'dialog-open' | 'door-open' | 'door-locked'
    | 'footstep-wood' | 'footstep-stone'
    | 'fire-crackle' | 'wind-indoor' | 'chains-rattle' | 'water-drip';

export type ParticlePresetName =
    | 'steam' | 'smoke' | 'dust' | 'sparks' | 'candle-glow' | 'torch-flame';

// ─── Felles typer ────────────────────────────────────────────────────────────

export type Vec3 = [number, number, number];
export type Euler3 = [number, number, number];

// Rom-vegg. Brukes for dør-plassering.
export type RoomWall = 'north' | 'south' | 'east' | 'west';

// ─── buildRoom ───────────────────────────────────────────────────────────────

export interface RoomDoorSpec {
    // Hvilken vegg åpningen skal kuttes i
    wall: RoomWall;
    // Offset langs veggen (meter fra senter). 0 = midt på vegg.
    offset?: number;
    // Åpningens bredde (meter). Default 1.4.
    width?: number;
    // Åpningens høyde (meter). Default wallHeight - 0.6 (lar takbjelken være igjen).
    height?: number;
    // Hvis satt: døren er LUKKET til flagget er truthy. Fysikk-collider fjernes automatisk.
    openFlag?: string;
}

export interface BuildRoomConfig {
    // Unik ID for rommet (brukes i scene-hierarki og quest-markers).
    id: string;
    // Rom-senter på XZ-planet. Default [0, 0].
    center?: [number, number];
    // [bredde, høyde, dybde] i meter.
    size: [number, number, number];
    // Materiale-presets. Default: floor=wood, walls=plaster, ceiling=wood.
    floor?: MaterialPresetName;
    walls?: MaterialPresetName;
    ceiling?: MaterialPresetName | 'none'; // 'none' = ingen tak (utendørs-indre-rom)
    // Belysning. Default 'warm-interior'. Setter sun+hemi+accent automatisk.
    lights?: LightingPresetName;
    // Åpninger i veggene. Default [].
    doors?: RoomDoorSpec[];
    // Vinduer (lys slipper inn, ingen fysisk åpning).
    windows?: { wall: RoomWall; offset?: number; width?: number; height?: number }[];
}

// ─── buildOutdoor ────────────────────────────────────────────────────────────

export interface BuildOutdoorConfig {
    id: string;
    // Bakke-radius fra origo. Default 40.
    radius?: number;
    // Bakkepreset. Default 'grass'.
    ground?: MaterialPresetName;
    // Grense-vegger rundt kanten (usynlige, kun kollisjon). Default true.
    boundary?: boolean;
    // Belysning. Default 'outdoor-day'.
    lights?: LightingPresetName;
    // Sky-modus. Default 'procedural'.
    sky?: 'procedural' | 'solid' | 'none';
}

// ─── addProp ─────────────────────────────────────────────────────────────────

export interface AddPropConfig {
    id: string;
    // Preset-navn eller custom primitive.
    model: ModelPresetName | {
        primitive: 'box' | 'cylinder' | 'sphere';
        size: Vec3 | [number, number]; // box: xyz, cylinder: [radius, height], sphere: [radius]
        color?: number;
    };
    pos: Vec3;
    rot?: Euler3;
    scale?: number | Vec3;
    // Overstyr preset-materialet. Default: modellens innebygde materiale.
    material?: MaterialPresetName;
    // Default true for alle props.
    castShadow?: boolean;
    receiveShadow?: boolean;
    // Default true: blir kollisjons-solid. Sett false for dekorasjoner.
    solid?: boolean;
    // Default undefined (statisk). Sett for å gjøre propen til en dynamisk fysikk-body.
    dynamic?: {
        mass?: number;            // default 2
        linearDamping?: number;   // default 0.3
        angularDamping?: number;  // default 0.3
    };
}

// ─── addPickup ───────────────────────────────────────────────────────────────

export interface AddPickupConfig {
    id: string;
    // itemId som skal legges i inventaret. MÅ eksistere i GameConfig.items, ellers throw.
    itemId: string;
    // Antall som legges til. Default 1.
    count?: number;
    model: ModelPresetName | AddPropConfig['model'];
    pos: Vec3;
    rot?: Euler3;
    // Flytende tekst over objektet. Default "Plukk opp (E)".
    label?: string;
    // Audio-preset som spilles ved pickup. Default 'pickup-tool'.
    audioOnPickup?: AudioPresetName;
    // Kalles etter at itemet er lagt i inventar.
    onPickup?: () => void;
}

// ─── addPuzzleSlot ───────────────────────────────────────────────────────────

export interface AddPuzzleSlotConfig {
    id: string;
    pos: Vec3;
    rot?: Euler3;
    // Item-IDer som kan plasseres her. Hvis spilleren har en av disse i hånda og
    // trykker E innenfor radius, blir den plassert. Må matche itemId i GameConfig.items.
    accepts: string[];
    // Kalles når et akseptert item blir plassert. itemId er det som ble plassert.
    onPlaced: (itemId: string) => void;
    // Visuell hint. 'outline' = spøkelsesramme. 'marker' = gul pil. Default 'marker'.
    visualHint?: 'outline' | 'marker' | 'none';
    // Valgfri etikett. Default 'Plasser (E)'.
    label?: string;
    // Audio ved vellykket plassering. Default 'puzzle-win'.
    audioOnPlaced?: AudioPresetName;
}

// ─── addInteractable ─────────────────────────────────────────────────────────

export interface AddInteractableConfig {
    id: string;
    model: ModelPresetName | AddPropConfig['model'];
    pos: Vec3;
    rot?: Euler3;
    // Flytende etikett. Default "Bruk (E)".
    prompt?: string;
    // Radius for E-key. Default 2.5.
    radius?: number;
    // Hver gang spilleren trykker E.
    onInteract: () => void;
}

// ─── addDoor ─────────────────────────────────────────────────────────────────
// Dette er et STANDALONE dør-objekt (ikke et hull i en buildRoom-vegg). Bruk
// buildRoom.doors[] for åpninger i eksisterende vegger. addDoor er for frittstående
// døråpninger i outdoor-scener eller koblinger mellom rom.

export interface AddDoorConfig {
    id: string;
    pos: Vec3;
    rot?: Euler3;
    // [bredde, høyde, tykkelse]. Default [1.2, 2.0, 0.15].
    size?: Vec3;
    material?: MaterialPresetName;
    // Hvis satt: døren er låst til flagget er truthy.
    lockedUntilFlag?: string;
    // Hvis satt: bruk dette flagget som "er åpen?"-tilstand. Default: alltid åpen ved interact.
    openFlag?: string;
    // Kalles når spilleren prøver å åpne en låst dør.
    onLockedAttempt?: () => void;
    // Audio ved åpning. Default 'door-open'.
    audioOnOpen?: AudioPresetName;
}

// ─── addNPC ──────────────────────────────────────────────────────────────────

export type CharacterTypePresetName = 'scientist' | 'farmer' | 'noble' | 'monk';

export interface AddNPCConfig {
    id: string;
    name: string;
    // Må være en gyldig CharacterType. Throw ved ugyldig verdi.
    characterType: CharacterTypePresetName;
    pos: Vec3;
    // Default farger: hudlik, enkel klesdrakt basert på characterType.
    colors?: {
        body?: number;
        head?: number;
        legs?: number;
    };
    // Dialog-innhold. Key = dialog-ID som brukes med engine.openDialog.
    // For fler-NPC-spill: bruk konvensjon `${npcId}_greeting`, `${npcId}_progress`.
    // Hvis en key er array av DialogNode: første variant hvor condition matcher brukes
    // (fallback uten condition må være SIST).
    dialogs?: Record<string, DialogNode | DialogNode[]>;
    // Default emosjon ved spawn.
    emotion?: Emotion;
    // Vis gul markør over hodet (for quest-objektiver). Default false.
    questMarker?: boolean;
    // Dialog-IDen som åpnes når spilleren trykker E på NPCen. Default: `${id}_greeting` hvis definert,
    // ellers 'greeting'. Må matche en nøkkel i dialogs.
    greetingDialog?: string;
    // Kan NPCen snakkes med? Default true. Sett false for stumme NPCer / statister.
    talkable?: boolean;
}

// ─── addMonolog ──────────────────────────────────────────────────────────────

export interface AddMonologConfig {
    id: string;
    // Linjer som vises én etter én.
    lines: string[];
    // Auto fra linje-lengde hvis ikke satt (50ms/char, 2500-6000).
    lineDurationMs?: number;
    // Default true: spilles kun første gang triggeren utløses.
    once?: boolean;
    // Når skal monologen utløses?
    trigger:
        | { type: 'proximity'; pos: Vec3; radius?: number; requiresPhase?: string }
        | { type: 'onPhase'; phase: string }
        | { type: 'onFlag'; flag: string }
        | { type: 'manual' }; // kun via engine.playMonolog(id)
}

// ─── addAmbientAudio ─────────────────────────────────────────────────────────

export interface AddAmbientAudioConfig {
    id: string;
    // Audio-preset-navn ELLER direkte URL.
    audio: AudioPresetName | { url: string };
    // Hvis satt: spatial lyd. Ellers global ambient.
    pos?: Vec3;
    radius?: number; // max-distance for spatial, default 15
    volume?: number; // 0..1, default 0.5
    loop?: boolean;  // default true
    // Når skal den starte? Default 'onStart'.
    trigger?: 'onStart' | { flag: string } | { phase: string };
}

// ─── addParticle ─────────────────────────────────────────────────────────────

export interface AddParticleConfig {
    id: string;
    preset: ParticlePresetName;
    pos: Vec3;
    // Skala-multiplier. Default 1.
    scale?: number;
}

// ─── Builder-resultat ────────────────────────────────────────────────────────
// Alle builders returnerer et objekt som lar deg gjøre manuelle justeringer
// hvis nødvendig (sjelden - ideelt skal config-objektet dekke alt).

import type { Group, Mesh, Object3D } from 'three';

export interface BuildResult {
    readonly group: Group;
    // Escape hatch: direkte adgang til underliggende mesh for advanced tweaks.
    readonly primary?: Mesh | Object3D;
}

// ─── Escape hatch ────────────────────────────────────────────────────────────
// For tilfeller som ikke kan uttrykkes deklarativt (svært sjeldne).
// Bruker tar selv ansvar for userData.solid, shadows, og registrering.

export interface AddRawMeshConfig {
    mesh: Mesh;
    solid?: boolean;           // default false - må settes eksplisitt
    castShadow?: boolean;      // default true
    receiveShadow?: boolean;   // default true
}
