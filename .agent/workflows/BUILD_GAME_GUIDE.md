# Håndbok: Lage nye historiske 3D-mini-spill

Dette dokumentet beskriver den komplette prosessen for å opprette et nytt historisk mini-spill med Eiriksbok sitt `GameEngine`-rammeverk.

**Referanseimplementasjoner:**
- **Watt Lab** (`src/games/watt-lab/`) - klassisk ett-rom-spill med samleobjekter og puzzle
- **Lindisfarne 793** (`src/games/lindisfarne-793/`) - utendørs fler-fase-spill med båt, strand og kloster, indre monolog, valg med konsekvens og variabel slutt

---

## 1. Arkitekturoversikt

```
GameConfig (MinSpillConfig.ts)
  └── setupScene(engine: GameEngineRef)   ← escape hatch for egne 3D-assets
        └── engine.scene.userData.collisionBoxes  ← registrer kollisjonsbokser her

GameEngine.ts          ← Three.js scene, renderer, animasjonsloop, input, AABB-kollisjon
  ├── WorldBuilder.ts      ← Bygger 'workshop'-preset (ett rom)
  ├── CharacterBuilder.ts  ← Toon-shaded NPC-er og samleobjekter
  ├── ParticleSystem.ts    ← Støv, gnister, damp
  ├── systems/             ← Gjenbrukbare subsystemer
  │   ├── MonologSystem.ts ← Indre stemme - ikke-blokkerende tekst med triggervolumer
  │   ├── OceanSystem.ts   ← Animert hav + skum-partikler for båt
  │   └── RoomSystem.ts    ← Deklarativ rom-bygging med auto-kollisjonsbokser
  └── builders/            ← Spill-spesifikke scene-byggere (gjenbrukbare)
      ├── CloisterBuilder.ts   ← Kloster med tre rom + korridor
      ├── BeachBuilder.ts      ← Strand, sti, klipper
      └── SeascapeBuilder.ts   ← Hav + himmel + langskip

GameCanvas.tsx         ← React-wrapper: monterer canvas, håndterer UI-state
  ├── DialogBox.tsx    ← Blokkerende NPC-dialog med valg
  ├── MonologBox.tsx   ← Ikke-blokkerende indre monolog (italic, fade)
  ├── PuzzleUI.tsx
  ├── GameHUD.tsx
  ├── TitleScreen.tsx
  └── EndScreen.tsx
```

Spilleren definerer alt via `GameConfig`. Ingen kode i `GameEngine.ts` trenger endres for nye spill.

---

## 2. Steg-for-steg

### Steg 1 - Opprett Config-filen

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
            characterType: 'scientist',   // 'scientist' | 'farmer' | 'noble' | 'monk'
            defaultEmotion: 'glad',       // startemosjonen
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

### Steg 2 - Opprett Assets-filen

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

### Steg 3 - Registrer i galleriet

**`src/pages/MiniGamesPage.tsx`** - legg til i `HISTORICAL_GAMES`:

```typescript
import { minSpillConfig } from '../games/mitt-spill/MinSpillConfig';
const HISTORICAL_GAMES: GameConfig[] = [wattLabConfig, minSpillConfig];
```

**`src/pages/GamePage.tsx`** - legg til i `GAME_REGISTRY`:

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
        // 'workshop' - ett lukket rom (vegger, tak, gulv). Bruker WorldBuilder.
        // 'open'     - ingen forhåndsbygd verden. Spillet bygger alt selv via setupScene.
        //              Bruk denne for utendørs-scener (hav, landskap, flere rom osv.).
        preset: 'workshop' | 'open';
        roomSize?: number;       // standard 20 (kun relevant for 'workshop')
        wallHeight?: number;     // standard 6 (kun relevant for 'workshop')
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
        // Karaktertyper styrer brynntykkelse, rynker og skjegg (se seksjon 10)
        characterType?: 'scientist' | 'farmer' | 'noble' | 'monk';
        defaultEmotion?: 'glad' | 'worried' | 'surprised' | 'triumphant';
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

    // Indre monolog (ikke-blokkerende). Noder kan trigges av posisjon eller programmatisk.
    monologs?: Record<string, MonologNode>;
    monologTriggers?: MonologTrigger[];

    // Streng, eller en funksjon som kan lese flagg og returnere variabel slutt-tekst.
    endText: string | ((engine: GameEngineRef) => string);
    setupScene?: (engine: GameEngineRef) => void;
}

interface MonologNode {
    id: string;
    lines: string[];           // vises sekvensielt
    lineDurationMs?: number;   // auto: 50ms/tegn (min 2500, maks 6000)
    once?: boolean;            // default true - spilles kun én gang
}

interface MonologTrigger {
    id: string;
    monologId: string;
    area: AABB2D;              // XZ-sone spiller må inn i
    requiresPhase?: string;    // valgfri gate
}
```

---

## 4. `GameEngineRef`-API (tilgjengelig i `setupScene`)

### 4.1 Grunnleggende (alle spill)

| Metode / felt | Type | Beskrivelse |
|---|---|---|
| `scene` | `THREE.Scene` | Legg til egne 3D-objekter her |
| `toonMat(color, opts?)` | `() => MeshToonMaterial` | Lag toon-shaded materiale |
| `config` | `GameConfig` | Tilgang til hele spillkonfigurasjonen |
| `animateReveal(group)` | `(Group) => void` | Skaler gruppe fra 0 til 1 med bounce |
| `startEngineAnimation()` | `() => void` | Starter bevegelig engine-animasjon (slutt-sekvens) |
| `openPuzzle()` | `() => void` | Åpner puzzle-UI |
| `openDialog(key)` | `(string) => void` | Åpner NPC-dialog programmatisk |
| `triggerEnd()` | `() => void` | Avslutter spillet, viser endText |
| `screenFlash()` | `() => void` | Hvit flash-effekt |
| `cameraShake(amount, duration)` | `(number, number) => void` | Kameraskjelving |
| `updateUI()` | `() => void` | Tvinger UI-oppdatering |
| `setEmotion(id, emotion, resetAfterMs?)` | `(string, Emotion, number?) => void` | Bytter NPC-ansikt med smooth morph (se seksjon 10) |
| `setCharacterMarkerVisible(id, visible)` | `(string, boolean) => void` | Manuell kontroll av gul NPC-markør (overstyrer motorens standardlogikk for dette NPC-id) |

### 4.2 Fler-fase-spill (utendørs / flere scener)

| Metode / felt | Type | Beskrivelse |
|---|---|---|
| `setPhase(phase)` | `(string) => void` | Bytter fase. Oppdaterer automatisk `questObjective` fra matching quest i config |
| `getPhase()` | `() => string` | Gjeldende fase |
| `setFlag<T>(key, value)` | `(string, T) => void` | Sett et spill-internt flagg (f.eks. valgkonsekvens) |
| `getFlag<T>(key)` | `(string) => T \| undefined` | Les flagg. Brukes bl.a. i `endText`-funksjoner for variabel slutt |
| `setPlayerMode(mode, opts?)` | `(PlayerMode, opts?) => void` | `'free'` = vanlig WASD. `'seated'` = låst til parent-gruppe (f.eks. båt) med opts `{ parent, offset }` |
| `teleportPlayer(x, y, z)` | `(number, number, number) => void` | Flytt spiller til world-posisjon. Løfter automatisk ut av evt. seat-parent |
| `getPlayerPosition()` | `() => { x, y, z }` | Spillers verdens-posisjon |
| `playMonolog(id)` | `(string) => void` | Spill indre monolog programmatisk (alternativ til posisjons-trigger) |
| `hasSeenMonolog(id)` | `(string) => boolean` | Har spilleren sett denne monologen? Brukes for å gate hendelser (f.eks. "først når X er observert") |
| `schedule(fn, delayMs)` | `(() => void, number) => void` | Som `setTimeout`, men kanselleres automatisk i `dispose()`. **Bruk alltid denne** i stedet for `setTimeout` direkte, ellers risikerer du kall på disposed engine |

---

## 5. Dialog-systemet

Dialogen er et tre av noder. Nøkkelregler:

- `next: 'nodeName'` - gå til neste node (kjør `action` før navigering)
- `next: null` - lukk dialog (kjør `action` i stedet)
- Noden `'intro'` åpnes automatisk når spilleren trykker E på NPC første gang
- Noden `'progress'` åpnes hvis spilleren prater med NPC midt i innsamlingsfasen
- Noden `'puzzleIntro'` åpnes automatisk når alle samleobjekter er hentet
- Noden `'puzzleWin'` åpnes automatisk 4 sekunder etter at puzzle er fullført

For `puzzleIntro` og `puzzleWin` - koble `choices[0].action` i `setupScene`:
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

## 10. Emosjonssystem

NPC-er med `characterType` får et karikatyr-ansikt som kan morphes mellom 4 emosjoner:

| Emosjon | Beskrivelse | Brukseksempel |
|---|---|---|
| `'glad'` | Smile, kinnskjær, løftede øyebryn | Startemosjonen / etter fullført oppgave |
| `'worried'` | Rynkede bryn (V-form), surmunn | Når noe går galt |
| `'surprised'` | Store øyne, åpen munn, løftede bryn | Når noe viktig avdekkes |
| `'triumphant'` | Bredt smil med tenner, armene i V | Ved seier / puzzle fullført |

`setEmotion(id, emotion, resetAfterMs?)` morphes over 400ms. Med `resetAfterMs` returnerer ansiktet automatisk til `defaultEmotion` etter angitt antall millisekunder.

```typescript
// I puzzle-callbacks (i Assets.ts):
config.puzzle.steps[0].onCorrect = () => {
    animateReveal(minGruppe);
    setEmotion('min-npc', 'surprised', 1500);  // surprised → glad etter 1.5s
};
config.puzzle.steps[2].onCorrect = () => {
    setTimeout(() => startEngineAnimation(), 800);
    setEmotion('min-npc', 'triumphant', 3000); // triumphant → glad etter 3s
};
```

**Karaktertyper** styrer brynntykkelse, rynker og skjegg:
- `'scientist'` - tykke bryn (2.2x), rynker under øynene, skjeggantydning
- `'farmer'` - medium bryn (1.4x), bred kjeve
- `'noble'` - tynne bryn (0.8x), smal kjeve
- `'monk'` - tynne rolige bryn (0.7x), rynker, ingen skjegg (egnet for munk/prest)

---

## 11. Fler-fase-spill (sammenhengende verden)

For spill som har flere scener (f.eks. båt → strand → innendørs), bruk `world.preset: 'open'` og bygg alt selv i `setupScene`. Motoren har tre gjenbrukbare byggere og systemer.

**Mønster:**

```typescript
world: { preset: 'open', backgroundColor: '#7a9ab8', fogDensity: 0.012 }
player: { startPosition: [0, 0, 0], colors: { ... } }  // blir overstyrt av setPlayerMode('seated')

// I setupScene:
const sea = buildSeascape(scene, toonMat);     // hav + båt
const beach = buildBeach(scene, toonMat, collisionBoxes);
const cloister = buildCloister(scene, toonMat, collisionBoxes);

// Start spilleren sittende i båten
engine.setPlayerMode('seated', { parent: sea.boat, offset: sea.playerSeat });
engine.setPhase('sailing');

// Fase-overganger basert på posisjon
scene.userData._customUpdate = (dt, time) => {
    const player = engine.getPlayerPosition();
    if (engine.getPhase() === 'landing' && player.z < -4) {
        engine.setPhase('approach');
    }
    // osv.
};
```

### 11.1 Rom-system (`systems/RoomSystem.ts`)

Deklarativ bygging av rom med vegger, åpninger og auto-genererte kollisjonsbokser. Lager veggsegmenter rundt hver åpning så du slipper å manuelt telle kollisjonsbokser.

```typescript
import { buildRoom, playerInRoom } from '../engine/systems/RoomSystem';

const room = buildRoom(scene, toonMat, {
    id: 'kapell',
    center: [0, -30],
    size: [10, 10],
    wallHeight: 4.5,
    openings: [{ side: 'S', offset: 0, width: 2.4 }],  // 'N' | 'S' | 'E' | 'W'
    floorColor: 0x5a4838,
    wallColor: 0x9a8968,
    hasRoof: true,  // default true, sett false for utendørs "rom"
}, collisionBoxes);

// Tak-dollhouse: skjul taket når spilleren er inne
if (room.roof) room.roof.visible = !playerInRoom(player, room);
```

Koordinatkonvensjon: `-Z = nord`, `+Z = sør` (matcher Three.js-kamera som standard ser mot -Z).

### 11.2 Hav + båt (`builders/SeascapeBuilder.ts`, `systems/OceanSystem.ts`)

`OceanSystem` er en CPU-animert `PlaneGeometry` med stablede sinusbølger - lett nok for Chromebook. Båten bygges som en `THREE.Group` med skrog, mast, seil, dragehode, årer, skjold.

```typescript
import { buildSeascape } from '../engine/builders/SeascapeBuilder';

const sea = buildSeascape(scene, toonMat);
// Returnerer: { ocean, foam, boat, crewSeats, playerSeat, boatStart, boatEnd }

// Båt-vugging i hver frame:
const tilt = sea.ocean.getWaveTilt(sea.boat.position.x, sea.boat.position.z);
sea.boat.rotation.z = tilt.roll * 0.35;
sea.boat.position.y = tilt.height * 0.5;

// Skjul hav når spilleren er innendørs (ytelse)
sea.ocean.setVisible(!inCloister);
sea.foam.setVisible(!inCloister);
```

### 11.3 Seated player (sittende spiller)

Når spilleren skal være passivt plassert på en båt, benk eller hest:

```typescript
// Gjør spilleren til barn av båten, posisjonert på setet
engine.setPlayerMode('seated', { parent: sea.boat, offset: [0, 0.8, -1] });

// WASD-bevegelse blokkeres automatisk. Muspek fortsatt fri (yaw/pitch).
// Båten kan bevege seg fritt; spilleren følger med.

// Senere - frigi og teleporter til land:
engine.setPlayerMode('free');
engine.teleportPlayer(0, 0, 4);
```

**Viktig**: NPCer som er barn av båten og skal bli stående rolig på sete-Y, må sette `userData.bobBase` så motorens y-animasjon lerper rundt riktig base:

```typescript
crew.sigurd.group.position.set(0, 0.8, -2);
crew.sigurd.group.userData.bobBase = 0.8;   // ellers bobber NPC-en ned til y=0
```

### 11.4 Proximity-filter (ekskludere NPCer)

Motoren plukker nærmeste NPC som "trykk E"-kandidat. For å ekskludere NPCer som allerede er ferdig-behandlet (f.eks. snakket med):

```typescript
scene.userData._proximityFilter = (id: string): boolean => {
    if (id === 'sigurd' && engine.getFlag('talkedChief')) return false;
    return true;  // true = inkluder, false = ekskluder
};
```

Dette lar "trykk E"-prompten hoppe til neste nærmeste NPC etter at dialogen er fullført.

---

## 12. Indre monolog (ikke-blokkerende tekst)

Motoren har et eget system for indre stemme / voice-over / observasjoner som IKKE skal blokkere bevegelse eller kreve input. Monologer vises italic nederst midt på skjermen med fade inn/ut per linje.

**Bruk når**: spilleren skal observere noe uten å stoppe opp (f.eks. "Jeg ser landet i horisonten"), reflektere over et valg, eller få en indirekte pedagogisk kommentar.

### 12.1 Definere monologer

```typescript
const minMonologer: Record<string, MonologNode> = {
    first_sight: {
        id: 'first_sight',
        lines: [
            'Der. Jeg ser det.',
            'En mørk stripe i horisonten.',
        ],
        once: true,  // default - spilles kun én gang
    },
};

// Triggervolumer (posisjons-basert)
const triggers: MonologTrigger[] = [
    {
        id: 't_first_sight',
        monologId: 'first_sight',
        area: { minX: -5, maxX: 5, minZ: 40, maxZ: 50 },
        requiresPhase: 'sailing',  // valgfri gate
    },
];

// I GameConfig:
monologs: minMonologer,
monologTriggers: triggers,
```

### 12.2 Programmatisk kontroll

```typescript
engine.playMonolog('first_sight');

// Gate en hendelse på at monologer er vist:
if (engine.hasSeenMonolog('library_book') && engine.hasSeenMonolog('library_discovery')) {
    // først NÅ skal Eadfrith-konfrontasjonen starte
}
```

### 12.3 Linje-varighet

Default: 50 ms per tegn, klampet til [2500, 6000] ms. Overstyr med `lineDurationMs` per node.

---

## 13. Valg med konsekvens + variabel slutt

Koble dialog-valg til flagg, og la `endText` være en funksjon som leser flagget:

```typescript
// I dialog-definisjon
dialog.eadfrith_response_spared.onEnd = () => {
    engine.setFlag('sparedEadfrith', true);
    engine.setPhase('aftermath_spared');
    engine.schedule(() => engine.triggerEnd(), 16000);
};

// I GameConfig
endText: (engine) => {
    const spared = engine.getFlag<boolean>('sparedEadfrith');
    return spared
        ? 'Du lot ham leve. Boken forble i klosteret.'
        : 'Raidet markerte starten på vikingtiden i vest.';
},
```

**Bruk alltid `engine.schedule` i stedet for `setTimeout`** for å unngå at callbacks fyrer etter at brukeren har navigert bort fra spillet.

---

## 14. Referanseimplementasjoner

### Watt Lab (ett-rom-spill)

| Fil | Innhold |
|---|---|
| `src/games/watt-lab/WattLabConfig.ts` | Komplett `GameConfig` med dialog, quest, puzzle og `characterType` |
| `src/games/watt-lab/WattLabAssets.ts` | Bygging av dampmaskin, esse, callback-kopling, `setEmotion`-kall |

### Lindisfarne 793 (fler-fase utendørs-spill med valg)

| Fil | Innhold |
|---|---|
| `src/games/lindisfarne-793/LindisfarneConfig.ts` | `GameConfig` med `preset: 'open'`, monologs, variabel `endText` |
| `src/games/lindisfarne-793/LindisfarneAssets.ts` | Syr sammen hav, båt, strand, kloster; faseoverganger, proximity-filter, NPC-seter |
| `src/games/lindisfarne-793/LindisfarneDialogs.ts` | Alle dialog-noder (Sigurd, veteran, Ulv, Eadfrith) med `{charId}_greeting`-navngiving |
| `src/games/lindisfarne-793/LindisfarneMonologs.ts` | Alle monolog-noder + triggervolumer |

### Motor-filer

| Fil | Innhold |
|---|---|
| `src/games/engine/types.ts` | Alle typer: `GameConfig`, `GameEngineRef`, `MonologNode`, `RoomDef`, `PlayerMode`, osv. |
| `src/games/engine/CharacterBuilder.ts` | `drawFace`, `lerpParams`, `EMOTION_PARAMS` - emosjonssystemets tegnelogikk |
| `src/games/engine/systems/MonologSystem.ts` | Indre monolog med triggere og programmatisk API |
| `src/games/engine/systems/OceanSystem.ts` | Animert hav + skum-system |
| `src/games/engine/systems/RoomSystem.ts` | Deklarativ rom-bygging med auto-kollisjon |
| `src/games/engine/builders/CloisterBuilder.ts` | Kloster-layout (kapell, korridor, bibliotek, sovesal) |
| `src/games/engine/builders/BeachBuilder.ts` | Strand, sti, klipper |
| `src/games/engine/builders/SeascapeBuilder.ts` | Hav + langskip |
| `src/games/engine/components/MonologBox.tsx` | Ikke-blokkerende monolog-UI |
| `src/pages/MiniGamesPage.tsx` | Galleriside - legg til spill her |
| `src/pages/GamePage.tsx` | `GAME_REGISTRY` - registrer spill-ID her |

---

## 15. Språkregler (kritisk for UI-tekst)

- Alt innhold på norsk bokmål, forståelig for 14-åring (jf. CLAUDE.md)
- Bruk alltid korrekte norske tegn: **å, ø, æ** (aldri aa, oe, ae)
- **ALDRI em-dash (—) eller tankestrek (–)**. Bruk bindestrek (-) i stedet
- Aktiv form fremfor passiv ("Harald samlet Norge", ikke "Norge ble samlet")
- Test hver setning: ville en 14-åring forstått dette uten hjelp?
