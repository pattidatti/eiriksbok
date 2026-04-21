# Håndbok: Lage nye historiske 3D-mini-spill

Dette dokumentet beskriver den komplette prosessen for å opprette et nytt historisk mini-spill med Eiriksbok sitt `GameEngine`-rammeverk. Referanseimplementasjon: **Watt Lab** (`src/games/watt-lab/`).

---

## 1. Arkitekturoversikt

```
GameConfig (MinSpillConfig.ts)
  └── setupScene(engine: GameEngineRef)   ← escape hatch for egne 3D-assets
        └── engine.scene.userData.collisionBoxes  ← registrer kollisjonsbokser her

GameEngine.ts          ← Three.js scene, renderer, animasjonsloop, input, AABB-kollisjon
  ├── WorldBuilder.ts  ← Bygger rom fra preset, registrerer romkollisjon automatisk
  ├── CharacterBuilder.ts  ← Toon-shaded NPC-er og samleobjekter
  └── ParticleSystem.ts   ← Støv, gnister, damp

GameCanvas.tsx         ← React-wrapper: monterer canvas, håndterer UI-state
  ├── DialogBox.tsx
  ├── PuzzleUI.tsx
  ├── GameHUD.tsx
  ├── TitleScreen.tsx
  └── EndScreen.tsx
```

Spilleren definerer alt via `GameConfig`. Ingen kode i `GameEngine.ts` trenger endres for nye spill.

---

## 2. Steg-for-steg

### Steg 1 — Opprett Config-filen

`src/games/[game-id]/[GameId]Config.ts`

```typescript
import { setupMinSpillScene } from './MinSpillAssets';
import type { GameConfig } from '../engine/types';

export const minSpillConfig: GameConfig = {
    id: 'mitt-spill',           // matcher URL-segmentet
    title: 'Mitt Spill',
    subtitle: 'Undertittel · År',
    subject: 'historie',
    description: 'Kort beskrivelse for galleriet.',
    thumbnail: '/images/emne/mitt-spill-thumb.webp',

    world: { preset: 'workshop', roomSize: 20, wallHeight: 6, backgroundColor: '#6b5544', fogDensity: 0.008 },
    player: { startPosition: [4, 0, 4], colors: { body: 0x3a5a7a, head: 0xf0c090, legs: 0x4a3020 } },

    characters: [
        {
            id: 'min-npc',
            name: 'Navn',
            position: [2, 0, -3],
            colors: { body: 0x5a3a2a, head: 0xe8b888, legs: 0x3a2515 },
            face: 'excited',
            marker: true,
        },
    ],

    collectibles: [
        { id: 'gjenstand1', name: 'Gjenstandsnavn', position: [6, 1.2, -4], geometry: 'cylinder', color: 0xc8a04a },
    ],

    quests: [
        { phase: 'intro',      objective: 'Snakk med NPC (trykk E).' },
        { phase: 'collecting', objective: 'Finn gjenstandene i rommet.' },
        { phase: 'return',     objective: 'Gå tilbake til NPC!' },
        { phase: 'puzzle',     objective: 'Løs gåten.' },
        { phase: 'puzzleWon',  objective: 'Snakk med NPC når du er klar.' },
    ],

    dialogs: {
        intro: {
            speaker: 'Navn',
            text: 'Introduksjon...',
            choices: [
                { text: 'Hva er problemet?', next: 'problem' },
                { text: 'Hvordan hjelper jeg?', next: 'help' },
            ],
        },
        // ... flere dialog-noder
        puzzleIntro: {
            speaker: 'Navn',
            text: 'La oss løse gåten!',
            choices: [{ text: 'La oss starte!', next: null, action: () => {} }],
            // action settes dynamisk i setupScene: choices[0].action = () => openPuzzle()
        },
        puzzleWin: {
            speaker: 'Navn',
            text: 'Fantastisk! Vi klarte det!',
            choices: [{ text: 'Gratulerer!', next: null, action: () => {} }],
            // action settes dynamisk i setupScene: choices[0].action = () => triggerEnd()
        },
    },

    puzzle: {
        steps: [
            {
                question: 'Spørsmål 1?',
                hint: 'Hint til spørsmål 1.',
                options: [
                    { text: 'Riktig svar', correct: true,  feedback: 'Riktig! Forklaring.' },
                    { text: 'Feil svar',   correct: false, feedback: 'Nei, fordi...' },
                ],
            },
        ],
    },

    endText: 'Avsluttende tekst vist på slutt-skjermen.',
    setupScene: setupMinSpillScene,
};
```

---

### Steg 2 — Opprett Assets-filen

`src/games/[game-id]/[GameId]Assets.ts`

```typescript
import * as THREE from 'three';
import type { GameEngineRef, AABB2D } from '../engine/types';

export function setupMinSpillScene(engine: GameEngineRef): void {
    const { scene, toonMat, config, animateReveal, startEngineAnimation, openPuzzle, triggerEnd } = engine;

    // --- Bygg egne 3D-objekter ---
    const minObjekt = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        toonMat(0x8b6f47)
    );
    minObjekt.position.set(0, 0.5, -5);
    minObjekt.visible = false;
    scene.add(minObjekt);

    // --- Registrer kollisjonsbokser ---
    const boxes = scene.userData.collisionBoxes as AABB2D[];
    // Formel: center ± (half_extent + 0.4)
    // Eks: objekt ved (0, -5), BoxGeometry(4, _, 2) → halfX=2, halfZ=1
    boxes.push({ minX: -2.4, maxX: 2.4, minZ: -6.4, maxZ: -3.6 });

    // --- Kople dialog-actions ---
    if (config.dialogs.puzzleIntro?.choices[0]) {
        config.dialogs.puzzleIntro.choices[0].action = () => openPuzzle();
    }
    if (config.dialogs.puzzleWin?.choices[0]) {
        config.dialogs.puzzleWin.choices[0].action = () => triggerEnd();
    }

    // --- Kople puzzle-callbacks ---
    if (config.puzzle) {
        config.puzzle.steps[0].onCorrect = () => {
            animateReveal(minObjekt as unknown as THREE.Group);
        };
        // Siste steg: kall startEngineAnimation() for å starte bevegelig animasjon
        config.puzzle.steps[config.puzzle.steps.length - 1].onCorrect = () => {
            minObjekt.visible = true;
            setTimeout(() => startEngineAnimation(), 800);
        };
    }

    // --- Egne per-frame oppdateringer (valgfritt) ---
    scene.userData._customUpdate = (dt: number) => {
        // Eks: roter et objekt
        minObjekt.rotation.y += dt * 0.5;
    };
}
```

---

### Steg 3 — Registrer i galleriet

**`src/pages/MiniGamesPage.tsx`** — legg til i `HISTORICAL_GAMES`:

```typescript
import { minSpillConfig } from '../games/mitt-spill/MinSpillConfig';
const HISTORICAL_GAMES: GameConfig[] = [wattLabConfig, minSpillConfig];
```

**`src/pages/GamePage.tsx`** — legg til i `GAME_REGISTRY`:

```typescript
import { minSpillConfig } from '../games/mitt-spill/MinSpillConfig';
const GAME_REGISTRY: Record<string, GameConfig> = {
    'watt-lab': wattLabConfig,
    'mitt-spill': minSpillConfig,
};
```

---

## 3. Komplett `GameConfig`-skjema

```typescript
interface GameConfig {
    id: string;                  // URL-segment, f.eks. 'watt-lab'
    title: string;
    subtitle: string;            // "Undertittel · År"
    subject: 'historie' | 'norsk' | 'krle' | 'samfunnsfag' | 'musikk';
    description: string;
    thumbnail: string;           // '/images/emne/spill-thumb.webp'

    world: {
        preset: 'workshop';      // kun 'workshop' er implementert
        roomSize?: number;       // standard 20
        wallHeight?: number;     // standard 6
        backgroundColor?: string;
        fogDensity?: number;
    };

    player: {
        startPosition: [number, number, number];
        colors: { body: number; head: number; legs: number };
    };

    characters: Array<{
        id: string;
        name: string;
        position: [number, number, number];
        colors: { body: number; head: number; legs: number };
        face?: 'happy' | 'excited';
        marker?: boolean;        // viser gul pil over NPC
        extras?: (group: THREE.Group) => void;  // legg til klær, frisyrer, osv.
    }>;

    collectibles?: Array<{
        id: string;
        name: string;
        position: [number, number, number];
        geometry: 'cylinder' | 'torus' | 'sphere' | 'box';
        color: number;
    }>;

    quests: Array<{
        phase: string;           // 'intro' | 'collecting' | 'return' | 'puzzle' | 'puzzleWon'
        objective: string;
    }>;

    dialogs: Record<string, {
        speaker: string;
        text: string | (() => string);
        choices: Array<{
            text: string;
            next: string | null;  // null = lukk dialog
            action?: () => void;
        }>;
        onEnd?: () => void;
    }>;

    puzzle?: {
        steps: Array<{
            question: string;
            hint: string;
            options: Array<{
                text: string;
                correct: boolean;
                feedback: string;
            }>;
            onCorrect?: () => void;  // callback for 3D-reveal
        }>;
    };

    endText: string;
    setupScene?: (engine: GameEngineRef) => void;
}
```

---

## 4. `GameEngineRef`-API (tilgjengelig i `setupScene`)

| Metode / felt | Type | Beskrivelse |
|---|---|---|
| `scene` | `THREE.Scene` | Legg til egne 3D-objekter her |
| `toonMat(color, opts?)` | `() => MeshToonMaterial` | Lag toon-shaded materiale |
| `config` | `GameConfig` | Tilgang til hele spillkonfigurasjonen |
| `animateReveal(group)` | `(Group) => void` | Skaler gruppe fra 0 til 1 med bounce |
| `startEngineAnimation()` | `() => void` | Starter bevegelig engine-animasjon (slutt-sekvens) |
| `openPuzzle()` | `() => void` | Åpner puzzle-UI |
| `triggerEnd()` | `() => void` | Avslutter spillet, viser endText |
| `screenFlash()` | `() => void` | Hvit flash-effekt |
| `cameraShake(amount, duration)` | `(number, number) => void` | Kameraskjelving |
| `updateUI()` | `() => void` | Tvinger UI-oppdatering |

---

## 5. Dialog-systemet

Dialogen er et tre av noder. Nøkkelregler:

- `next: 'nodeName'` — gå til neste node (kjør `action` før navigering)
- `next: null` — lukk dialog (kjør `action` i stedet)
- Noden `'intro'` åpnes automatisk når spilleren trykker E på NPC første gang
- Noden `'progress'` åpnes hvis spilleren prater med NPC midt i innsamlingsfasen
- Noden `'puzzleIntro'` åpnes automatisk når alle samleobjekter er hentet
- Noden `'puzzleWin'` åpnes automatisk 4 sekunder etter at puzzle er fullført

For `puzzleIntro` og `puzzleWin` — koble `choices[0].action` i `setupScene`:
```typescript
config.dialogs.puzzleIntro.choices[0].action = () => openPuzzle();
config.dialogs.puzzleWin.choices[0].action  = () => triggerEnd();
```

---

## 6. Puzzle-systemet

- Hvert steg vises sekvensielt. Feil svar → vis feedback, prøv igjen på samme steg.
- Riktig svar → `onCorrect()` kalles, deretter neste steg.
- Etter siste steg: quest går til `'puzzleWon'`, deretter `puzzleWin`-dialog etter 4 sekunder.
- Bruk `animateReveal(group)` i `onCorrect` for å vise 3D-deler steg for steg.
- Bruk `startEngineAnimation()` i siste `onCorrect` for bevegelig avslutning (delay 800ms anbefales).

---

## 7. Kollisjonsbokser (AABB2D)

Motoren bruker 2D AABB (XZ-planet). `WorldBuilder` registrerer automatisk benker og fat. Egne objekter må registreres manuelt i `setupScene`:

```typescript
const boxes = engine.scene.userData.collisionBoxes as AABB2D[];

// Formel: center_x ± (half_width + 0.4),  center_z ± (half_depth + 0.4)
// Eksempel: BoxGeometry(4.5, _, 2.5) ved posisjon (0, -5):
//   halfX = 4.5/2 = 2.25 → 2.25 + 0.4 = 2.65
//   halfZ = 2.5/2 = 1.25 → 1.25 + 0.4 = 1.65
boxes.push({ minX: -2.65, maxX: 2.65, minZ: -6.65, maxZ: -3.35 });
```

Spillerradius er alltid **0.4 enheter**. Legg til denne radiusen på alle sider av hinderet.

For roterte objekter (ry = π/2): bytt om X og Z i half-extent-beregningen.

---

## 8. Input-referanse

| Tast | Effekt |
|---|---|
| WASD | Bevegelse |
| Muspek | Kamerarotasjon (pointer lock aktivt) |
| E | Interaksjon med NPC / samleobjekt |
| 1-9 | Velg dialog-alternativ eller puzzle-svar |
| Klikk på canvas | Aktiverer pointer lock (muselåsing) |

Pointer lock deaktiveres automatisk når dialog eller puzzle åpner, slik at HTML-knapper er klikkbare.

---

## 9. Per-frame egne oppdateringer

Registrer egne update-funksjoner på `scene.userData`:

```typescript
// Enkel oppdatering
scene.userData._customUpdate = (dt: number) => { ... };

// Spesifikt for Watt Lab-mønsteret:
scene.userData._forgeUpdate     = (dt: number) => { ... };  // esse-animasjon
scene.userData._engineRunUpdate = (dt: number) => { ... };  // motoranimasjon (etter startEngineAnimation)
```

`GameEngine` kaller disse automatisk hvert frame hvis de er satt.

---

## 10. Referanseimplementasjon

| Fil | Innhold |
|---|---|
| `src/games/watt-lab/WattLabConfig.ts` | Komplett `GameConfig` med dialog, quest, puzzle |
| `src/games/watt-lab/WattLabAssets.ts` | Bygging av dampmaskin, esse, callback-kopling, kollisjonsbokser |
| `src/games/engine/types.ts` | Alle typer: `GameConfig`, `GameEngineRef`, `AABB2D`, osv. |
| `src/pages/MiniGamesPage.tsx` | Galleriside — legg til spill her |
| `src/pages/GamePage.tsx` | `GAME_REGISTRY` — registrer spill-ID her |
