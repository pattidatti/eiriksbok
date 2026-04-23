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
        └── mesh.userData.solid = true    ← Rapier-collider genereres automatisk

GameEngine.ts          ← Three.js scene, renderer, animasjonsloop, input, Rapier-fysikk
  ├── WorldBuilder.ts      ← Bygger 'workshop'-preset (ett rom)
  ├── CharacterBuilder.ts  ← Toon-shaded NPC-er og samleobjekter
  ├── LightBuilder.ts      ← buildHangingLight: SpotLight + shader-kjegle + støvpartikler
  ├── ParticleSystem.ts    ← Støv, gnister, damp
  ├── systems/             ← Gjenbrukbare subsystemer
  │   ├── PhysicsWorld.ts          ← Rapier3D: character controller, raycast, fixed timestep
  │   ├── InteractableSystem.ts    ← Pickup/drop (E) og kast (F) for dynamiske objekter
  │   ├── PostProcessingSystem.ts  ← EffectComposer: bloom, tone mapping, color grading
  │   ├── SkySystem.ts             ← Prosedyral himmel
  │   ├── TimeOfDaySystem.ts       ← Lerp 0-1 driver sol/ambient/sky-farge
  │   ├── WeatherSystem.ts         ← Regn, snø, tåke (overstyrer TOD-fog mens aktiv)
  │   ├── VegetationSystem.ts      ← Instansiert gress/siv/blomster/lyng/bregner/busker/trær med vind-shader
  │   ├── FaunaSystem.ts           ← Dekorative dyr: fuglflokker, sommerfugler, sau, kyr
  │   ├── DebugHudSystem.ts        ← Stats-samler for F3-overlay (FPS, drawcalls, materialer)
  │   ├── CameraDirector.ts        ← Dialog OTS-kamera (spring-punch, FOV, side-veksling), fade, cinematics
  │   ├── AIDirector.ts            ← Waypoint-vandring for NPCer
  │   ├── MonologSystem.ts         ← Indre stemme - ikke-blokkerende tekst + triggere
  │   ├── OceanSystem.ts           ← Animert hav + skum-partikler for båt
  │   └── RoomSystem.ts            ← Deklarativ rom-bygging (vegger markert som solid)
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
import type { GameEngineRef } from '../engine/types';

export function setupMinSpillScene(engine: GameEngineRef): void {
    const { scene, toonMat, config, animateReveal, startEngineAnimation, openPuzzle, triggerEnd } = engine;

    // --- Bygg egne 3D-objekter ---
    const minObjekt = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        toonMat(0x8b6f47)
    );
    minObjekt.position.set(0, 0.5, -5);
    minObjekt.visible = false;
    minObjekt.userData.solid = true;   // PhysicsWorld genererer collider automatisk
    scene.add(minObjekt);

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
        // Karaktertyper styrer brynntykkelse, rynker og skjegg (se seksjon 11)
        characterType?: 'scientist' | 'farmer' | 'noble' | 'monk';
        defaultEmotion?: 'glad' | 'worried' | 'surprised' | 'triumphant';
        marker?: boolean;        // viser gul pil over NPC
        showName?: boolean;      // viser navn-label over NPC
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
        cameraFraming?: 'wide';  // 'wide' deaktiverer OTS-kameraet for denne noden; utelatt = OTS aktivt
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

    // Deklarative innendørs-lyskilder (SpotLight + shader-kjegle + støvpartikler).
    // Bygges automatisk av motoren etter setupScene. Se seksjon 10.
    lights?: LightConfig[];

    // Indre monolog (ikke-blokkerende). Noder kan trigges av posisjon eller programmatisk.
    monologs?: Record<string, MonologNode>;
    monologTriggers?: MonologTrigger[];

    // Streng, eller en funksjon som kan lese flagg og returnere variabel slutt-tekst.
    endText: string | ((engine: GameEngineRef) => string);
    debug?: boolean;            // viser userData.solid-wireframes og fase/flagg i HUD
    setupScene?: (engine: GameEngineRef) => void;

    // ── Fase 1-3: visuelle systemer ─────────────────────────────────────────
    visual?: {
        // Fase 1.2: godtar enten en kvalitets-streng ('auto' | 'low' | 'medium' | 'high')
        // eller et fullt PostProcessingConfig-objekt med bloom/exposure/lut-knotter.
        postProcessing?:
            | 'auto' | 'low' | 'medium' | 'high'
            | {
                quality?: 'auto' | 'low' | 'medium' | 'high';
                bloom?: { strength?: number; threshold?: number; radius?: number };
                exposure?: number;    // tone mapping exposure, default 1.8
                lut?: string;          // Fase 1.5: LUT-preset ('neutral' i Fase 1)
              };
        timeOfDay?: number;           // 0-1, driver sol/ambient/sky-farge
        weather?: { type: 'clear' | 'rain' | 'fog' | 'snow'; intensity: number };
        colorGrading?: 'warm' | 'cold' | 'sepia' | 'neutral' | 'dawn' | 'dusk';
        sky?: 'procedural' | 'solid' | 'none';
        // Fase 1.3: tetthetskurve for fog over dagen. TimeOfDay driver fog-farge
        // og -tetthet når været er klart. WeatherSystem overstyrer ved rain/snow/fog.
        fogDensityCurve?: {
            night: number;   // ca. t = 0.0 / 1.0
            dawn: number;    // ca. t = 0.25
            day: number;     // ca. t = 0.5
            dusk: number;    // ca. t = 0.75
        };
        // Fase 2.3: skygge-modus. 'standard' (default) = enkel DirectionalLight.
        // 'cascaded' = three/addons CSM — krever world.preset='open' og high-tier.
        shadows?: 'standard' | 'cascaded';
        // Fase 2.5: volumetrisk lys / god rays. Kun world.preset='open' og high-tier.
        volumetricLight?: boolean;
    };

    // Fase 3: NPC-er følger waypoint-ruter styrt av AIDirector
    npcRoutes?: Array<{
        characterId: string;
        waypoints: [number, number][];  // x,z
        mode: 'loop' | 'pingpong' | 'once';
        speed?: number;
        pauseMs?: number;
    }>;

    // ── Fase 4: fysikk (Rapier3D) ───────────────────────────────────────────
    physics?: {
        enabled?: boolean;              // default true
        gravity?: number;               // default -18
        playerJump?: boolean;           // default true
        playerFallDamage?: boolean;     // default false
        fallDamageThreshold?: number;   // m/s, default 12
        onPlayerFallDamage?: (velocity: number) => void;
    };

    // ── Fase 4.1: quest-system ──────────────────────────────────────────────
    questDefs?: Array<{
        id: string;
        title: string;
        description: string;
        objectives: Array<{
            id: string;
            label: string;
            condition: {
                flag?: string;                    // flagget må være truthy
                itemCollected?: string;           // item-id lagt til i inventar
                npcTalkedTo?: string;             // character-id spilt dialog med
                positionNear?: { pos: [number, number, number]; radius: number };
            };
            marker?: { attachTo?: string; pos?: [number, number, number] };
        }>;
        prerequisites?: string[];                 // andre quests som må fullføres først
        rewardFlags?: string[];                   // flagg som settes ved fullføring
    }>;

    // ── Fase 4.2: inventar ──────────────────────────────────────────────────
    items?: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;           // emoji eller URL til PNG
        stackable?: boolean;
        maxStack?: number;
    }>;
    inventorySize?: number;     // default 16

    // ── Fase 4.3: reaktiv NPC-atferd ────────────────────────────────────────
    npcBehaviors?: Array<{
        characterId: string;
        playerReaction?: {
            distance: number;   // trigger-avstand i meter
            behavior: 'approach' | 'flee' | 'face' | 'alert';
            speedMultiplier?: number;
            setFlag?: string;
        };
    }>;

    // ── Fase 4.4: kondisjonell dialog ───────────────────────────────────────
    // dialogs[key] kan nå være en liste av varianter — første matching velges.
    // Eksempel:
    //   dialogs: {
    //     greeting: [
    //       { speaker: 'X', text: 'Du har snakket med meg før', condition: { flagsRequired: ['talkedToX'] } },
    //       { speaker: 'X', text: 'Hei, fremmede' },  // fallback uten condition
    //     ]
    //   }

    // ── Fase 4.5: weather → gameplay ────────────────────────────────────────
    // onWeatherChange kalles når været endrer seg. 'wet'-flag settes automatisk
    // ved rain/snow/fog. Lys med mesh.userData._extinguishInRain slukkes i regn.
    onWeatherChange?: (from: WeatherType, to: WeatherType, engine: GameEngineRef) => void;

    // ── Fase 3.1: deklarativ audio ──────────────────────────────────────────
    audio?: {
        masterVolume?: number;  // 0..1, default 1
        tracks?: Array<{
            id: string;
            url: string;
            kind: 'ambient' | 'spatial';
            volume?: number;
            loop?: boolean;
            position?: [number, number, number];  // for spatial
            attachTo?: string;                    // character id — følger NPC
            maxDistance?: number;
            trigger: 'onStart' | { flag: string } | { phase: string };
        }>;
    };

    // ── Fase 5: intro-sekvens ────────────────────────────────────────────────
    intro?: {
        type: 'fade' | 'title' | 'none';
        title?: string;
        subtitle?: string;
        durationMs?: number;        // hvor lenge tittelen vises (default 2500)
        fadeMs?: number;            // fade-inn-varighet (default 700)
        skippable?: boolean;        // vis Skip-knapp (default true)
    };
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
| `toonMat(color, opts?)` | `() => MeshStandardMaterial` | Material-shortcut (navnet er historisk - returnerer standard PBR-materiale) |
| `sceneMat(color, opts?)` | `() => MeshStandardMaterial` | Material med presets (`'stone'`, `'wood'`, `'metal'`, osv.) |
| `config` | `GameConfig` | Tilgang til hele spillkonfigurasjonen |
| `getQualityTier()` | `() => 'low'\|'medium'\|'high'` | Tier valgt ved oppstart. Auto-terskler: `low` = cores≤4 eller dpr<1.5 (Chromebook); `high` = cores≥10 og dpr≥1.5 (XPS/MacBook Pro); ellers `medium`. Kan overstyres av bruker i SettingsMenu (gjelder neste oppstart). |
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

### 4.2 Lys og visuelle effekter

| Metode | Type | Beskrivelse |
|---|---|---|
| `registerAnimatedLight(light, animation, baseIntensity?)` | `(Light, LightAnimation, number?) => void` | Registrer SpotLight/PointLight for motor-animasjon (`'flicker'`, `'flicker-soft'`, `'pulse'`). Brukes for lys opprettet imperativt i `setupScene`. |
| `setBloom(strength)` | `(number) => void` | Sett bloom-styrke. **Innendørs:** strength `0.4-0.55`, threshold `0.25-0.35`. **Utendørs/dagslys:** strength `0.2-0.25`, threshold `0.6-0.7` (kun lyspunkter glorer). Lav threshold + høy strength gir hvitvasket bilde i sterkt lys. Chromebook (low-tier) kjorer uten bloom. |

### 4.3 Fler-fase-spill (utendørs / flere scener)

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

### 4.4 Tid, vær og vegetasjon (Fase 1-3)

| Metode | Type | Beskrivelse |
|---|---|---|
| `setTimeOfDay(t)` | `(number) => void` | 0-1. Driver sol-retning/farge, ambient-farge, sky-tint |
| `getSunDirection()` | `() => Vector3` | Nåværende sol-retning (brukes f.eks. for custom shadere) |
| `setWeather(state)` | `({type, intensity}) => void` | `'clear'\|'rain'\|'fog'\|'snow'` × intensitet 0-1 |
| `addVegetationPatch(area, density, type?)` | `(AABB2D, number, VegetationType) => void` | Instansiert vegetasjon i en region. Typer: `'grass'\|'reeds'\|'flowers'\|'heather'\|'wildflowers'\|'ferns'\|'bush'` |
| `addTree(pos, type?)` | `([x,y,z], 'pine'\|'oak'\|'birch') => void` | Enkelttre med vind-animasjon |
| `addBirdFlock(center, opts?)` | `([x,y,z], {count?, radius?, altitude?, altitudeSpread?}) => void` | Fuglflokk som sirkler over et punkt. Altitude = hoyde i meter (default 18) |
| `addButterfly(center, opts?)` | `([x,y,z], {count?, radius?, color?}) => void` | Sommerfugler som flakser i et omrade (color = hex, default 0xff9933) |
| `addAnimalGroup(kind, bounds, opts?)` | `('sheep'\|'cow', AABB2D, {count?}) => void` | Sau eller kyr som vandrer og beiter innenfor AABB |
| `assignRoute(cfg)` | `(NpcRouteConfig) => void` | Gi en NPC en waypoint-rute (AIDirector) |

### 4.5 Kamera og intro (Fase 2 + 5)

| Metode | Type | Beskrivelse |
|---|---|---|
| `setCameraFraming(framing, target?)` | `('speaker'\|'wide', Vector3?) => void` | Manuell overstyring av dialog-kamera. `'wide'` deaktiverer OTS-effekten. |
| `playCinematic(shots)` | `(CinematicShot[]) => Promise<void>` | Kamera-timeline; stub i dag, utvides når et spill krever det |
| `fadeToBlack(ms?)` / `fadeFromBlack(ms?)` | `(number?) => Promise<void>` | DOM-overlay-fade via CameraDirector |
| `skipIntro()` | `() => void` | Hopp over aktiv intro-sekvens |

**Dialog OTS-kamera (automatisk):**
Alle dialoger aktiverer automatisk et over-the-shoulder (OTS) kamera sa lenge speakerens karakter-ID finnes i scenen:
- **NPC-side** (standard): kamera bak spilleren, NPC-en i fokus - brukes nar NPC snakker (<=1 valg)
- **Spiller-side**: kamera bak NPC-en, spilleren i fokus - brukes automatisk ved reelle valg-noder (>1 valg)
- **FOV** snevres fra normal (~60 deg) til 45 deg for tele-effekt nar dialog apnes
- **Overgang inn**: underdamped spring-animasjon (~12% overshoot) gir "punch"-snap pa ~0.35 sek
- **Overgang ut**: hardt klipp tilbake til gameplay-kamera nar dialog lukkes

For a deaktivere OTS pa en enkelt node: sett `cameraFraming: 'wide'` pa den noden.

### 4.6 Fysikk og interaksjon (Fase 4)

| Metode | Type | Beskrivelse |
|---|---|---|
| `registerPickup(mesh, opts?)` | `(Mesh, PickupOptions?) => void` | Marker et objekt som plukkbart. Må ha `userData.solid=true, dynamic=true, pickupable=true`. E plukker opp/slipper; F kaster |
| `isHoldingItem()` | `() => boolean` | Holder spilleren et objekt akkurat nå? |
| `dropHeldItem()` | `() => void` | Slipp holdt objekt (ingen impuls) |
| `throwHeldItem(force?)` | `(number?) => void` | Kast holdt objekt i kamera-retning (default force 8) |
| `registerInteract(mesh, opts)` | `(Mesh, InteractOptions) => void` | Statisk interaksjonspunkt (alter, dor, hendel). Viser floating label; E utloser `onInteract`. Mesh trenger ikke physics. |
| `unregisterInteract(mesh)` | `(Mesh) => void` | Fjern et registrert interaksjonspunkt og rydd opp label-sprite. Kall inne i `onInteract` nar interaksjonen er brukt opp. |

`PickupOptions`: `{ holdOffset?: [x,y,z]; throwForce?: number; label?: string; onPickup?; onDrop?; onThrow?; toInventory?: { itemId, count? } }`

`InteractOptions`: `{ label?: string | (() => string); radius?: number; onInteract: () => void }`

**Eksempel - alter som krever 3 gjenstander:**
```typescript
engine.registerInteract(altarMesh, {
    radius: 2.5,
    label: () => {
        const n = engine.itemCount('myitem');
        return n >= 3 ? 'Plasser gjenstander (E)' : `Trenger gjenstander (${n}/3)`;
    },
    onInteract: () => {
        if (engine.itemCount('myitem') < 3) { engine.playMonolog('hint'); return; }
        engine.removeItem('myitem', 3);
        engine.setFlag('done', true);
        engine.screenFlash();
        engine.unregisterInteract(altarMesh);
        engine.playMonolog('success');
    },
});
```

---

## 5. Dialog-systemet

Dialogen er et tre av noder. Nøkkelregler:

- `next: 'nodeName'` - gå til neste node (kjør `action` før navigering)
- `next: null` - lukk dialog (kjør `action` i stedet)

**Navngiving av NPC-dialog (kritisk):**

| Spilltype | Konvensjon | Eksempel |
|-----------|------------|---------|
| Enkelt-NPC-spill | `intro` | `dialogs: { intro: [...] }` |
| **Fler-NPC-spill** | **`{charId}_greeting`** | `bjorg_greeting`, `helge_greeting`, `volven_greeting` |

Motoren leter alltid etter `{charId}_greeting` når E trykkes nær en karakter. For enkelt-NPC-spill (Watt Lab-stil) faller den tilbake til `intro`/`progress`/`puzzleIntro`. For alle spill med to eller flere NPCer **må** hvert NPC-dialog hete `{charId}_greeting` — ellers skjer ingenting når spilleren trykker E.

- Noden `'progress'` åpnes hvis spilleren prater med primær-NPC midt i innsamlingsfasen (enkelt-NPC-spill)
- Noden `'puzzleIntro'` åpnes automatisk når alle samleobjekter er hentet
- Noden `'puzzleWin'` åpnes automatisk 4 sekunder etter at puzzle er fullført

**OTS-kamera i dialog:** Kameraet bytter automatisk side basert på antall valg. NPC-kamera (<=1 valg) vises når NPC snakker; spiller-kamera (>1 valg) vises når spilleren skal velge. Ingen konfigurasjon nødvendig - se seksjon 4.5 for detaljer.

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

## 7. Kollisjon (Rapier3D-fysikk, Fase 4+)

Kollisjon håndteres automatisk av `PhysicsWorld` (Rapier3D). Hvert objekt som skal være solid merkes med `mesh.userData.solid = true` — motoren traverserer scenen etter init og genererer colliders.

```typescript
const bord = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1, 2.5), toonMat(0x8b5a2b));
bord.position.set(0, 0.5, -5);
bord.userData.solid = true;   // PhysicsWorld gir den en cuboid-collider
scene.add(bord);
```

**Hint via userData** (alle valgfrie):

| Felt | Verdi | Effekt |
|---|---|---|
| `solid` | `true` | Gi objektet en static collider (default cuboid fra boundingBox) |
| `colliderShape` | `'cuboid' \| 'cylinder' \| 'capsule' \| 'sphere' \| 'trimesh'` | Overstyr shape (trimesh er kostbart - bruk kun for kompleks terreng) |
| `dynamic` | `true` | Gjør objektet til en dynamisk rigid body (må ha `mass`) |
| `mass` | `number` | Masse for dynamic bodies (kg) |
| `friction` | `0..1` | Default 0.7 |
| `restitution` | `0..1` | Default 0 (ingen sprett) |
| `climbable` | `true` | Sensor-volume for stiger - spilleren klatrer med W/S når overlappende |
| `pickupable` | `true` | Kombiner med `dynamic=true` og `engine.registerPickup(mesh)` for plukk/kast |

**Gulv må eksplisitt markeres solid** - det finnes ingen auto-ground. Plasser en stor flat boks med `userData.solid = true` i y=0.

Båter/plattformer spilleren *sitter på* (`setPlayerMode('seated')`) skal **ikke** være solide - physics-body-en deaktiveres i seated-modus og scripted animasjon styrer transform.

AABB2D og `scene.userData.collisionBoxes` er fjernet i Fase 4 - ikke bruk.

---

## 8. Input-referanse

| Tast | Effekt |
|---|---|
| WASD | Bevegelse |
| Muspek | Kamerarotasjon (pointer lock aktivt) |
| Space | Hopp (når `physics.playerJump` er på) |
| E | Interaksjon med NPC / samleobjekt / plukk opp / slipp |
| F | Kast holdt objekt |
| 1-9 | Velg dialog-alternativ eller puzzle-svar |
| Klikk på canvas | Aktiverer pointer lock (muselåsing) |

Pointer lock deaktiveres automatisk når dialog eller puzzle åpner, slik at HTML-knapper er klikkbare.

---

## 9. Per-frame egne oppdateringer

Registrer egne update-funksjoner på `scene.userData`:

```typescript
// Generell per-frame hook - for gress, vann, trær, ild, lys, osv.
// dt = delta-tid (sekunder), elapsed = total kjøretid (sekunder)
scene.userData._customUpdate = (dt: number, elapsed: number) => {
    waterMat.uniforms.uTime.value = elapsed;
    lightRef.update(dt, elapsed);   // oppdater støvpartikler
};

// Spesifikt for Watt Lab-mønsteret:
scene.userData._forgeUpdate     = (dt: number) => { ... };  // esse-animasjon
scene.userData._engineRunUpdate = (dt: number) => { ... };  // motoranimasjon (etter startEngineAnimation)
```

`GameEngine` kaller alle disse automatisk hvert frame hvis de er satt. Bruk alltid `elapsed` (ikke akkumulert `dt`) for sinusbølger og shader-uniforms.

> **Ikke bruk `_customUpdate` for interaksjonslevering.** Mønsteret `if (itemCount >= N && Math.hypot(dx, dz) < 2.0)` gir null feedback til spilleren og er stum ved feil. Bruk `engine.registerInteract(mesh, opts)` i stedet — se seksjon 19.9.

---

## 10. Lyssystem (innendørs lyskilder)

Motoren bruker `THREE.SpotLight` (peker rett ned) som den faktiske lyskilden, kombinert med synlig shader-gradient-kjegle og 30 støvpartikler som flyter oppover i strålen for volumetrisk effekt.

> **Teknisk bakgrunn:** `THREE.PointLight` lyser i alle retninger og skaper ingen synlige stråler. SpotLight er fysisk korrekt for en hengende pære og lar den visuelle kjegelen matche det faktiske lyset eksakt.

### 10.1 Deklarativt (anbefalt - i GameConfig)

```typescript
lights: [
    {
        id: 'lykt-1',
        position: [2, 4.5, -3],      // SpotLight-posisjon. Pæren henger 0.2 enheter over.
        color: 0xff9944,             // standard 0xffeedd (varm hvit)
        intensity: 5,                // standard 3.0
        distance: 12,                // rekkevidde (0 = uendelig); standard 15
        decay: 1.5,                  // lysfalloff; standard 1.5
        animation: 'flicker-soft',   // 'steady' | 'flicker' | 'flicker-soft' | 'pulse'
        angle: 0.52,                 // SpotLight-åpning i radianer; standard 0.52 (~30 grader)
        penumbra: 0.35,              // myk kant (0 = skarp); standard 0.35
        coneHeight: 4.0,             // lengde på synlig lysstråle; standard 4.0
        coneOpacity: 0.18,           // synlighet av strålen; standard 0.18
        castShadow: true,            // ALLTID true for lys inne i lukkede rom (se §16.10)
    },
]
```

Motoren bygger automatisk: SpotLight med target rett ned, snor, emissiv kule, glød-halo, indre og ytre shader-kjegle, og støvpartikler. Animasjon og partikkeloppdatering skjer i motorloopen.

**`coneRadius` trenger aldri settes** - beregnes automatisk fra `angle` og `coneHeight` slik at den visuelle kjegelen matcher det faktiske lyset.

### 10.2 Imperativt (fra setupScene)

Bruk `buildHangingLight` direkte når lysposisjon avhenger av dynamisk terreng eller romgeometri:

```typescript
import { buildHangingLight, type HangingLightRef } from '../engine/LightBuilder';

const ref: HangingLightRef = buildHangingLight(engine.scene, {
    id: 'min-lykt',
    position: [x, terrainY + 5.8, z],
    color: 0xff6622,
    intensity: 8,
});

// Registrer for motor-animasjon (valgfritt):
engine.registerAnimatedLight(ref.light, 'flicker');

// VIKTIG: kall ref.update fra _customUpdate for at støvpartikler skal animere:
scene.userData._customUpdate = (dt, elapsed) => {
    ref.update(dt, elapsed);
};
```

### 10.3 Bloom-tuning

```typescript
// I GameConfig.visual.postProcessing:
bloom: { strength: 0.22, threshold: 0.65, radius: 0.6 }  // utendørs/dagslys
bloom: { strength: 0.45, threshold: 0.30, radius: 0.7 }  // innendørs/mørkt
```

| Scenario | strength | threshold | radius |
|---|---|---|---|
| Utendørs dagslys | 0.2-0.25 | 0.6-0.7 | 0.5-0.6 |
| Innendørs | 0.4-0.55 | 0.25-0.35 | 0.7 |

**Advarsel:** `threshold < 0.4` i en lys utendørs-scene gir hvitvasket bilde - nesten alle piksler bidrar til bloom. Øk threshold til minimum 0.6 for dagslys-scener.

Effekt kun på medium/high-tier. Chromebook (low) kjorer uten bloom - sørg for at scenen ser bra ut uten.

### 10.4 Animasjonstyper

| `animation` | Beskrivelse |
|---|---|
| `'steady'` | Fast intensitet, ingen animasjon |
| `'flicker'` | Urolig ild-flimring (bål, fakkel) |
| `'flicker-soft'` | Myk gass-lampe-puls (anbefalt for elektrisk lys) |
| `'pulse'` | Langsom sinus-puls - 0.8 Hz |

### 10.5 Ytelsesregler

- **Alle SpotLights inne i lukkede rom MÅ ha `castShadow: true`** — uten det blør lyset gjennom veggene (se §16.10). `LightBuilder` setter automatisk `shadow.mapSize.set(512, 512)`, `shadow.camera.far = distance` og `shadow.bias = -0.001`. I rom med 4+ lys: alle trenger `castShadow: true` — for ytelse, bruk `shadow.mapSize.set(256, 256)` på de svakeste.
- 5-6 SpotLights per scene er trygt. Over 10 kan gi ytelsesproblemer på Chromebook.
- Støvpartikler (30 per lampe) er billige - CPU-oppdatert BufferGeometry

---

## 11. Emosjonssystem

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

## 12. Fler-fase-spill (sammenhengende verden)

For spill som har flere scener (f.eks. båt → strand → innendørs), bruk `world.preset: 'open'` og bygg alt selv i `setupScene`. Motoren har tre gjenbrukbare byggere og systemer.

**Mønster:**

```typescript
world: { preset: 'open', backgroundColor: '#7a9ab8', fogDensity: 0.012 }
player: { startPosition: [0, 0, 0], colors: { ... } }  // blir overstyrt av setPlayerMode('seated')

// I setupScene:
const sea = buildSeascape(scene, toonMat);     // hav + båt
const beach = buildBeach(scene, toonMat);      // strand, sti, klipper (auto-solid)
const cloister = buildCloister(scene, toonMat); // kloster med 4 rom (auto-solid)

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

### 12.1 Rom-system (`systems/RoomSystem.ts`)

Deklarativ bygging av rom med vegger og åpninger. Hver vegg-mesh merkes automatisk med `userData.solid = true` slik at Rapier genererer colliders.

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
});

// Tak-dollhouse: skjul taket når spilleren er inne
if (room.roof) room.roof.visible = !playerInRoom(player, room);
```

`buildRoom` returnerer `innerBounds: AABB2D` — det eksakte gulvfotavtrykket til rommet. Bruk dette til å hindre at prosedyrelt plasserte objekter (gress, steiner, trær) havner innendørs:

```typescript
// Bygg alle rom FØR du plasserer gress/scatter
const romA = buildRoom(scene, toonMat, { ... });
const romB = buildRoom(scene, toonMat, { ... });

// Samle innerBounds, sjekk mot dem i plasseringssløyfen
const roomBounds = [romA.innerBounds, romB.innerBounds];

for (let i = 0; i < count; i++) {
    const x = ..., z = ...;
    if (roomBounds.some(b => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ)) continue;
    // plasser objektet
}
```

**Rekkefølge i `setupScene`:** bygg rom → samle `innerBounds` → plasser gress/scatter.

Koordinatkonvensjon: `-Z = nord`, `+Z = sør` (matcher Three.js-kamera som standard ser mot -Z).

### 12.2 Hav + båt (`builders/SeascapeBuilder.ts`, `systems/OceanSystem.ts`)

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

### 12.3 Seated player (sittende spiller)

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

### 12.4 Proximity-filter (ekskludere NPCer)

Motoren plukker nærmeste NPC som "trykk E"-kandidat. For å ekskludere NPCer som allerede er ferdig-behandlet (f.eks. snakket med):

```typescript
scene.userData._proximityFilter = (id: string): boolean => {
    if (id === 'sigurd' && engine.getFlag('talkedChief')) return false;
    return true;  // true = inkluder, false = ekskluder
};
```

Dette lar "trykk E"-prompten hoppe til neste nærmeste NPC etter at dialogen er fullført.

---

## 13. Indre monolog (ikke-blokkerende tekst)

Motoren har et eget system for indre stemme / voice-over / observasjoner som IKKE skal blokkere bevegelse eller kreve input. Monologer vises italic nederst midt på skjermen med fade inn/ut per linje.

**Bruk når**: spilleren skal observere noe uten å stoppe opp (f.eks. "Jeg ser landet i horisonten"), reflektere over et valg, eller få en indirekte pedagogisk kommentar.

### 13.1 Definere monologer

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

### 13.2 Programmatisk kontroll

```typescript
engine.playMonolog('first_sight');

// Gate en hendelse på at monologer er vist:
if (engine.hasSeenMonolog('library_book') && engine.hasSeenMonolog('library_discovery')) {
    // først NÅ skal Eadfrith-konfrontasjonen starte
}
```

### 13.3 Linje-varighet

Default: 50 ms per tegn, klampet til [2500, 6000] ms. Overstyr med `lineDurationMs` per node.

---

## 14. Valg med konsekvens + variabel slutt

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

## 15. Referanseimplementasjoner

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
| `src/games/engine/types.ts` | Alle typer: `GameConfig`, `GameEngineRef`, `LightConfig`, `MonologNode`, `RoomDef`, osv. |
| `src/games/engine/LightBuilder.ts` | `buildHangingLight` - SpotLight + shader-kjegle + støvpartikler. Eksporterer `HangingLightRef`. |
| `src/games/engine/CharacterBuilder.ts` | `drawFace`, `lerpParams`, `EMOTION_PARAMS` - emosjonssystemets tegnelogikk |
| `src/games/engine/SceneMat.ts` | Material-presets: stein, tre, stoff, metall, vann, jord (kalibrerte PBR-roughness-verdier) |
| `src/games/engine/TextureKit.ts` | Canvas-genererte texturer + Sobel normal maps: `woodKit()`, `stoneKit()`, `fabricKit()`, `dirtKit()`. Eksporterer også `makeLabelSprite(text, color?, fontSize?)` — bruk denne for alle 3D-label-sprites i egne spill, aldri lag lokale kopier. |
| `src/games/engine/prefabs/PropKit.ts` | Historiske rekvisitter: `barrel`, `crate`, `sack`, `chest`, `cauldron`, `scroll`, `anvil`, `well` |
| `src/games/engine/prefabs/LightPropKit.ts` | Selvregistrerende lys-props: `campfire`, `wallTorch`, `brazier`, `candle` — tar `engine: GameEngineRef` |
| `src/games/engine/prefabs/FurnitureKit.ts` | Interiørmøbler: `bed`, `table`, `chair`, `pew`, `altar` |
| `src/games/engine/systems/PhysicsWorld.ts` | Rapier3D-wrapper: character controller, raycast, fixed timestep |
| `src/games/engine/systems/InteractableSystem.ts` | Pickup/drop (E) og kast (F) for dynamiske objekter |
| `src/games/engine/systems/PostProcessingSystem.ts` | EffectComposer med tier-valg: bloom, tone mapping, color grading |
| `src/games/engine/systems/SkySystem.ts` | Prosedyral himmel koblet til TimeOfDay |
| `src/games/engine/systems/TimeOfDaySystem.ts` | Lerp 0-1 driver sol/ambient/sky-farge |
| `src/games/engine/systems/WeatherSystem.ts` | Regn, snø, tåke (partikler + fog override) |
| `src/games/engine/systems/VegetationSystem.ts` | InstancedMesh-vegetasjon med vind-shader |
| `src/games/engine/systems/CameraDirector.ts` | Dialog-framing, fade, cinematics |
| `src/games/engine/systems/AIDirector.ts` | Waypoint-vandring for NPCer |
| `src/games/engine/systems/MonologSystem.ts` | Indre monolog med triggere og programmatisk API |
| `src/games/engine/systems/OceanSystem.ts` | Animert hav + skum-system |
| `src/games/engine/systems/RoomSystem.ts` | Deklarativ rom-bygging (vegger markert solid for Rapier) |
| `src/games/engine/builders/CloisterBuilder.ts` | Kloster-layout (kapell, korridor, bibliotek, sovesal) |
| `src/games/engine/builders/BeachBuilder.ts` | Strand, sti, klipper |
| `src/games/engine/builders/SeascapeBuilder.ts` | Hav + langskip |
| `src/games/engine/components/MonologBox.tsx` | Ikke-blokkerende monolog-UI |
| `src/pages/MiniGamesPage.tsx` | Galleriside - legg til spill her |
| `src/pages/GamePage.tsx` | `GAME_REGISTRY` - registrer spill-ID her |

---

## 16. Vanlige fallgruver (les før du bygger)

Disse feilene er lette å gjøre og vanskelige å diagnostisere. Gå gjennom sjekklisten i 16.7 før første testkjøring.

### 16.1 Preset `'open'` trenger egen sol og hemisfære

`GameEngine.buildScene()` oppretter kun `AmbientLight` automatisk. For `preset: 'open'` lager motoren verken sol (DirectionalLight) eller hemisfærelys - `TimeOfDaySystem` står uten noe å drive, og scenen blir nesten svart. Himmelen (SkySystem) ser riktig ut, men det er ingen lyskilde som treffer terrenget.

**Løsning:** I starten av `setupScene`, legg til sol + hemi og registrer dem slik at `TimeOfDaySystem` kan styre intensitet og farge:

```ts
const sun = new THREE.DirectionalLight(0xfff5e0, 2.4);
sun.position.set(60, 90, 40);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 200;
sun.shadow.camera.left = -70;    // tilpass til gangbart område
sun.shadow.camera.right = 70;
sun.shadow.camera.top = 70;
sun.shadow.camera.bottom = -70;
sun.shadow.bias = -0.0005;
scene.add(sun);
scene.userData._mainSunLight = sun;     // ← KRITISK: uten dette driver ikke TOD solen

const hemi = new THREE.HemisphereLight(0x9ec6e8, 0x3d5a2d, 0.9);
hemi.position.set(0, 50, 0);
scene.add(hemi);
scene.userData._mainHemiLight = hemi;   // ← KRITISK: uten dette mangler himmelbidraget
```

Intensitetene overstyres hver frame av `TimeOfDaySystem` basert på `visual.timeOfDay`, så basisverdien er bare utgangspunktet. Tilpass `shadow.camera`-boksen til størrelsen på ditt gangbare område.

**Unntak:** `buildSeascape` og enkelte andre builders setter `_mainSunLight` selv - da trenger du ikke gjøre det igjen.

### 16.2 `RoomSystem.buildRoom` gir tak kun synlig innenfra

`buildRoom` (`systems/RoomSystem.ts`) bygger tak som `PlaneGeometry.rotateX(Math.PI/2)`. Det plasserer normalen pekende nedover `(0, -1, 0)`. Kombinert med default `side: FrontSide` er taket bare synlig fra UNDER (innsiden). Sett utenfra ser bygget ut som en vegg-boks uten tak.

Dette er med vilje for dollhouse-oppførsel (skjul tak når spilleren er inne), men for frittstående bygninger som sees fra utsiden gir det et åpenbart glitch.

**Løsning - bygg saltak selv:**

```ts
const room = buildRoom(scene, toonMat, { /* ... */ });
if (room.roof) room.roof.visible = false;

const cx = -18, cz = -18;   // match room.center
const chW = 10, chD = 9;    // match room.size
const wallH = 5;             // match room.wallHeight
const peakH = 2.2;
const overhang = 0.5;
const halfW = chW / 2 + overhang;
const slopeLen = Math.sqrt(halfW * halfW + peakH * peakH);
const tilt = Math.atan2(peakH, halfW);

const roofMat = new THREE.MeshStandardMaterial({
    color: 0x3a2818, roughness: 0.92, side: THREE.DoubleSide,
});
const slopeE = new THREE.Mesh(
    new THREE.BoxGeometry(slopeLen, 0.12, chD + 2 * overhang), roofMat);
slopeE.rotation.z = -tilt;
slopeE.position.set(cx + Math.cos(tilt) * halfW * 0.5, wallH + peakH / 2, cz);
scene.add(slopeE);
// Gjenta speilvendt for slopeW. Legg til to gavler (Shape + ShapeGeometry) og en mønekam.
```

Komplett eksempel: `src/games/demo-world/DemoWorldAssets.ts` (chapel-blokken).

### 16.3 Prosedyrale plasseringer må ekskludere bygg

`engine.addTree`, `engine.addVegetationPatch`, og manuelle randomiseringsløkker plasserer objekter hvor du ber dem. Hvis plassering-området overlapper et rom eller en bygning, lander objekter INNE i veggene.

**Løsning:** Samle bygge-bounds og sjekk mot dem i plasseringsløkken:

```ts
const room = buildRoom(scene, toonMat, { /* ... */ });
const buildingBounds: AABB2D[] = [
    room.innerBounds,                                    // rom fra buildRoom
    { minX: -12, maxX: -4, minZ: -23, maxZ: -15 },      // andre strukturer
    { minX: -7,  maxX: -1, minZ: 1,   maxZ: 7 },        // flaggstenger/benker med buffer
];
const insideAnyBuilding = (x: number, z: number) =>
    buildingBounds.some(b => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ);

let placed = 0, attempts = 0;
while (placed < 26 && attempts < 80) {
    attempts++;
    const x = -36 + rng() * 22;
    const z = -24 + rng() * 38;
    if (insideAnyBuilding(x, z)) continue;
    engine.addTree([x, 0, z], 'pine');
    placed++;
}
```

Husk også manuelt plasserte objekter (flaggstenger, benker): trær i nærheten må ha avstand større enn foliage-radius. Treprofiler i `VegetationSystem.ts`:

| Type | foliageRadius | foliageHeight |
|---|---|---|
| `pine` | 1.2 | 3.0 |
| `oak` | 1.6 | 2.0 |
| `birch` | 1.2 | 1.8 |

### 16.4 `OceanSystem`-bølger kan klippe gjennom land

`OceanSystem` lager et `PlaneGeometry(size, size)` sentrert på `center`. Bølgene har amplitude opptil ~0.7 m (sum av de tre sinuskomponentene i `OceanSystem.WAVES`). Hvis havplanet overlapper solid land OG `ocean.mesh.position.y` er høyere enn `land_top - 0.7`, vil bølgetopper stige opp gjennom bakken eller inn i bygninger.

**Løsning - bruk begge verktøy:**

**A. Krymp havplanet så det ikke overlapper land-bokser:**
```ts
const ocean = new OceanSystem(scene, toonMat, {
    center: [80, 0],   // flytt senter ut fra land
    size: 180,         // krymp så plane ikke strekker seg inn under land
});
```

**B. Senk havnivået så maks bølgetopp ligger godt under bakkenivå:**
```ts
ocean.mesh.position.y = -1.1;    // maks bølgetopp = -1.1 + 0.7 = -0.4 (trygt under y=0)
```

Når havnivået senkes må `FoamSystem`-origin og båt-base-Y oppdateres tilsvarende:

```ts
const foam = new FoamSystem(scene, () => ({ x: dockEndX, y: -0.9, z: 5 }), 60);
const boatBaseY = -1.0;   // båt delvis nedsenket i nytt vannivå
boatGroup.position.y = boatBaseY + oceanTilt.height * 0.5;  // i _customUpdate
```

Plasser båter og flytende objekter i områder der havet er VISUELT synlig - altså der ingen solide land-bokser (ground, beach) dekker området. Land-bokser er ugjennomsiktige og skjuler havet under dem.

### 16.5 Dynamiske objekter trenger demping

Rapier3D har `linearDamping = 0` og `angularDamping = 0` som default. Et objekt som får en dytt beholder all bevegelsesenergi for alltid. Spesielt sfæriske colliders ruller evig siden rullefriksjon er neglisjerbar i Rapier.

**Løsning:** Sett demping på alle dynamiske objekter, og unngå sfæriske colliders for pickups:

```ts
stone.userData.solid = true;
stone.userData.dynamic = true;
stone.userData.mass = 2;
stone.userData.pickupable = true;
stone.userData.colliderShape = 'cuboid';    // ikke 'sphere' - ruller evig
stone.userData.friction = 0.9;
stone.userData.linearDamping = 1.2;         // stanser drift etter dytt
stone.userData.angularDamping = 2.4;        // stanser rotasjon etter dytt
```

Typiske verdier:
- Stein/tre: `linearDamping: 1.0-1.5`, `angularDamping: 2.0-3.0`
- Lette objekter (fjær, papir): høyere demping (2-4)
- Ball/hjul som SKAL rulle: `angularDamping: 0.2-0.5`, friksjon lavere

### 16.6 Gulv må eksplisitt merkes solide

Det finnes ingen auto-ground i motoren. For `preset: 'open'` må du lage et solid underlag selv, ellers faller spilleren evig gjennom verden etter at fysikk-systemet har initialisert.

```ts
const ground = new THREE.Mesh(
    new THREE.BoxGeometry(110, 1, 110),
    new THREE.MeshStandardMaterial({ color: 0x3e6b2a, roughness: 0.95 }),
);
ground.position.set(0, -0.5, 0);        // topp ved y=0
ground.receiveShadow = true;
ground.userData.solid = true;            // ← uten dette faller spilleren gjennom
scene.add(ground);
```

### 16.7 `PlaneGeometry` uten segmenter gjor normal-maps usynlige

`PlaneGeometry(w, h)` lager kun 4 hjornepunkter. Three.js beregner tangentrom per vertex - med 4 punkter er hele flaten en uniform tangentvektor, og normal-maps produserer ingen synlig relieff. Alle paneler vil se identiske og flate ut uavhengig av materialinnstillingene.

```ts
// Feil - normal/roughness-maps har ingen effekt
new THREE.PlaneGeometry(1.5, 1.5)

// Riktig - 16x16 segmenter gir nok punkter for tangentromberegning
new THREE.PlaneGeometry(1.5, 1.5, 16, 16)
```

Regelen gjelder alle flate plan-geometrier som bruker `normalMap`, `roughnessMap` eller `aoMap` - vegger, skilt, gulvfliser, display-paneler. `BoxGeometry` og `SphereGeometry` har egne segmentparametere og er ikke pavirket av dette.

I tillegg: normal-maps er avhengige av at lys treffer flaten fra en vinkel. Jevnt hemisfaerlys alene er ikke nok - legg til et `PointLight` eller `SpotLight` naer veggen for at relieffet skal synes.

### 16.8 Sjekkliste før første testkjøring

Gå gjennom listen før du starter `npm run dev` på et nytt `open`-preset-spill:

- [ ] `DirectionalLight` lagt til scene og registrert som `scene.userData._mainSunLight`
- [ ] `HemisphereLight` lagt til scene og registrert som `scene.userData._mainHemiLight`
- [ ] Gulv-mesh har `userData.solid = true` og topp ved forventet y-nivå
- [ ] Alle rom fra `buildRoom` som sees utenfra har tak bygd manuelt (eller `room.roof.visible = false` og annen løsning)
- [ ] Prosedyrale plasseringer (`addTree`, `addVegetationPatch`, egne løkker) ekskluderer bygge-bounds
- [ ] Manuelt plasserte objekter (benker, flaggstenger) har trær med tilstrekkelig avstand (foliage-radius)
- [ ] Hvis `OceanSystem` brukes: havplanet overlapper ikke solide bygg, eller havnivået er senket under maks bølgetopp
- [ ] `FoamSystem`-origin-y og båt-base-y matcher faktisk havnivå
- [ ] Båter og flytende objekter er plassert i åpent synlig hav, ikke skjult bak land eller strand
- [ ] Dynamiske pickupable objekter har `linearDamping` + `angularDamping` satt, og bruker `cuboid`-collider (ikke `sphere`)
- [ ] Interaksjonspunkter (alter, dor, hendel) bruker `engine.registerInteract` - ikke manuell proximity-logikk i `_customUpdate`
- [ ] Monolog-trigger-områder matcher faktiske verdenskoordinater etter eventuell relokering
- [ ] Hvis `ssao.enabled: true`: `kernelRadius ≤ 0.15` og `maxDistance ≤ 0.05` for utendørs spill med karakterer
- [ ] Alle SpotLights inne i lukkede rom har `castShadow: true` (se §16.10)
- [ ] Alle dør-meshes mot `buildRoom`-åpninger har høyde `wallHeight - 0.6` og sentrum `(wallHeight - 0.6) / 2` (se §16.11)
- [ ] Terreng og vegger har `castShadow`/`receiveShadow` satt eksplisitt (se §16.12)
- [ ] Skrå geometri (ramper, bakker) bruker riktig fortegn på `rotation.x` (se §16.13)
- [ ] Dialog med `cameraFraming: 'speaker'` er ikke blokkert av mast eller annen stor geometri mellom kamera og NPC (se §16.14)
- [ ] Alle norske tekststrenger (dialog, monolog, quest-titler, endText) er sjekket for manglende å/ø/æ — søk etter ` pa `, ` ma `, ord som slutter på `fort`/`forst` (se §19 for full liste)
- [ ] Fler-NPC-spill: alle NPC-er har dialog-nøkkel `{charId}_greeting` (ikke `_intro` eller annet — se §5)

---

### 16.9 SSAO-halos rundt karakterer og sprites

**Symptom:** Mork halo-ring rundt NPC-er, spilleren eller floating labels nar high-tier er aktivt.

**Årsak:** `ssao.kernelRadius` for stor. SSAO sampler skjermrom-omgivelser - et stort kernel sprenger utenfor geometriens kanter og lager falske skyggekanter mot bakgrunnen. Sprites som mangler `depthTest: false` gar inn i SSAO-prepasset som solid geometri og far egne halos.

**Løsning:**
```typescript
// I GameConfig.visual.postProcessing:
ssao: { enabled: true, kernelRadius: 0.12, minDistance: 0.001, maxDistance: 0.05 }
```

For sprites opprettet manuelt (utenom `engine.registerPickup`/`engine.registerInteract`): bruk alltid `makeLabelSprite()` fra TextureKit, eller sett eksplisitt:
```typescript
sprite.material.depthTest = false;
sprite.renderOrder = 999;
```

### 16.10 Innendørs SpotLight uten `castShadow` blør gjennom vegger

`THREE.SpotLight` (og `PointLight`) uten `castShadow: true` beregner belysning som om ingen geometri eksisterer mellom lyskilden og overflaten. Et lys med `distance: 14` inne i et 10×9-rom lyser opp terrenget, trærne og NPCene utenfor bygningen - veggene er usynlige for lysmotoren.

**Løsning:** Bruk alltid `castShadow: true` for lys inne i lukkede rom:

```ts
buildHangingLight(scene, {
    // ...
    castShadow: true,   // ← alltid for innendørs lys
});
```

`LightBuilder` setter automatisk `shadow.camera.far = distance` og `shadow.bias = -0.001` når `castShadow: true`. Disse er kritiske: uten `shadow.camera.far = distance` bruker Three.js default `far=500`, noe som sløser oppløsning og gir dårlig skygge-kvalitet.

**Diagnosesteg:** Stå utenfor bygningen og skru av solen (`engine.setTimeOfDay(0.03)` for natt). Er det fortsatt varmt glød fra innendørslysene på utsiden av veggene? Da mangler `castShadow: true`.

**Low-quality tier:** `renderer.shadowMap.enabled = false` på Chromebook low-tier — shadows rendres ikke uavhengig av flagget. Lys-bleeding er akseptabel på low-tier; det er ikke synlig på 1366×768-skjermene.

---

### 16.11 Dørgeometri må fylle RoomSystem-åpningen eksakt

`buildRoom` lager en lintel (overligger) over åpninger: 0.6 enheter høy, plassert øverst i veggen (`y = wallHeight - 0.6` til `y = wallHeight`). Åpningens faktiske spillbare høyde er `wallHeight - 0.6`. En dør-mesh kortere enn dette gir en synlig glipe mellom dørtoppen og lintelens underkant.

**Riktig formel:**

```ts
const LINTEL_H = 0.6;                        // konstant fra RoomSystem
const doorH = chamberWallH - LINTEL_H;       // f.eks. 3.2 - 0.6 = 2.6
const doorW = openingWidth;                  // match openings[].width

const chamberDoor = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, doorH, doorW),
    doorMat,
);
chamberDoor.position.set(wallX, doorH / 2, openingZ);  // senter = doorH/2
```

Husk å oppdatere animasjoner som bruker start-y: start alltid fra `doorH / 2`, ikke en hardkodet verdi.

```ts
// Åpne-animasjon - skyv ned i bakken:
chamberDoor.position.y = (doorH / 2) - cellarDoorOpenAnim * (doorH / 2 + 0.5);
```

Komplett eksempel: `src/games/demo-world/DemoWorldAssets.ts` (chamberDoor-blokken).

---

### 16.12 Terreng og vegger viser ingen skygger

**Symptom:** Solen er synlig og kaster lys, men ingen mesh kaster eller mottar skygge.

**Årsak:** Three.js setter `Mesh.castShadow` og `Mesh.receiveShadow` til `false` som standard. Motoren aktiverer shadow maps på solen (via `SeascapeBuilder` og `buildRoom`), men traverserer ikke scenen og opt-er inn meshes automatisk — det ville vært for dyrt som en global operasjon.

**Løsning:** Sett flaggene eksplisitt på meshes som er visuelle nok til å ha skygge-effekt:

```typescript
// Terreng
beach.receiveShadow = true;
ramp.castShadow = true;
ramp.receiveShadow = true;
plateau.castShadow = true;
plateau.receiveShadow = true;

// Vegger og bygg
wall.castShadow = true;
wall.receiveShadow = true;

// Gulv (kun mottar)
floor.receiveShadow = true;
```

**Tommelfingerregel:**
- Flater spilleren går på → `receiveShadow = true`
- Vegger, tårn, store objekter → begge `true`
- Små detalj-meshes (knapper, bøker) → kan sløyfes

Innendørs SpotLights trenger i tillegg `castShadow: true` på selve lyset (se §16.10).

---

### 16.13 Ramp-rotasjon: feil fortegn snur stigningsretningen

**Symptom:** Rampen stiger i feil retning — spieleren faller ned der bakken skal gå opp.

**Årsak:** Three.js `rotation.x` er ikke-intuitiv for nordgående ramper (negativ Z = nord):

| `rotation.x` | +Z-enden (sør) | -Z-enden (nord) |
|---|---|---|
| `+vinkel` | senkes (strandnivå) | heves (platånivå) ✓ |
| `-vinkel` | heves (feil) | senkes (feil) ✗ |

**Regel:** For en ramp der spilleren går nordover (mot -Z) og opp, bruk **positivt fortegn**:

```typescript
const rampAngle = Math.atan2(høydeforskjell, horisontalLengde); // alltid positiv

ramp.rotation.x = rampAngle;   // ✓ sørenden ned, nordenden opp
// ramp.rotation.x = -rampAngle; ✗ omvendt — ikke gjør dette
```

Husk at skrå geometri alltid krever `colliderShape: 'trimesh'` for at Rapier skal bruke riktig kolliderform:

```typescript
ramp.userData.solid = true;
ramp.userData.colliderShape = 'trimesh'; // uten dette brukes AABB-kuboid som ikke fungerer på skrå
```

---

### 16.14 `cameraFraming: 'speaker'` blokkert av geometri mellom kamera og NPC

**Symptom:** Under dialog ser spilleren bare en mast, vegg eller annet objekt i stedet for NPC-en som snakker.

**Årsak:** OTS-kameraet posisjonerer seg *bak* spilleren og sikter mot NPC-en. Eventuelle meshes mellom disse to punktene — typisk skipets mast og seil — er ikke gjennomsiktige og blokkerer synet.

**Konkrete situasjoner:**
- Dialog ombord på skip: masten (lokal z=0) er mellom kameraet (bak spilleren) og mannskapet (fremme). Spesielt ille med bred `PlaneGeometry`-seil.
- Dialog rett foran en vegg der veggen strekker seg bak spilleren.

**Løsninger:**

1. **Unngå `cameraFraming: 'speaker'`** i disse situasjonene og bruk standard `'wide'` (eller utelat `cameraFraming` — `'wide'` er default).

2. **Skjul blokkerende meshes** under dialogen via `onEnd`/start-hook:
```typescript
// Finn seil-meshes én gang etter buildSeascape()
const sailMeshes: THREE.Mesh[] = [];
for (const child of sea.boat.children) {
    if (child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) {
        sailMeshes.push(child);
    }
}
// I _customUpdate eller dialog-callback:
for (const m of sailMeshes) m.visible = !dialogOpen;
```

3. **Flytt NPC bak masten** (til spillersiden) slik at kameralinjen er fri.

**Generell regel:** Sjekk alltid kameralinjen manuelt i første testkjøring ved å trigge dialogen og rotere kameraet — ikke stol på at OTS-vinkelen er fri.

---

## 17. Fauna og utvidet vegetasjon

### 17.1 FaunaSystem - dekorative dyr

`FaunaSystem` initialiseres automatisk (lazy) nar du kaller `addBirdFlock`, `addButterfly` eller `addAnimalGroup` fra `setupScene`. Systemet har ingen fysikk-integrasjon - dyrene er rent visuelle.

**Fuglflokker**

```typescript
// Flokk som sirkler over et punkt pa hoyde 22m med radius 18m
engine.addBirdFlock([0, 0, 0], { altitude: 22, radius: 18 });

// Hoy, stram sirkelbane
engine.addBirdFlock([-25, 0, -10], { altitude: 30, radius: 12, altitudeSpread: 3 });
```

Fuglen er en enkel kryss-form (to kryss-plan). Tier-antall: low=6, medium=12, high=18 per flokk. Flokken forsvinner nar kamera er >60m unna (low), >120m (medium), >200m (high).

**Sommerfugler**

```typescript
// Oransje sommerfugler nær blomsterpatch
engine.addButterfly([10, 0, 8], { radius: 5 });

// Rosa sommerfugler med storre vandringsomrade
engine.addButterfly([3, 0, 14], { color: 0xffaadd, radius: 8 });
```

Sommerfugler flakser 0.4-1.8m over bakken i Lissajous-monster. CPU-animert vinge-flap (rotation.z). Tier-antall: low=4, medium=8, high=14.

**Beitedyr (sau og ku)**

```typescript
// Saueflokk i et omrade
engine.addAnimalGroup('sheep', { minX: -5, maxX: 22, minZ: 5, maxZ: 28 });

// Kyr med eksplisitt antall
engine.addAnimalGroup('cow', { minX: 15, maxX: 45, minZ: -18, maxZ: 10 }, { count: 3 });
```

Dyrene vandrer og beiter (70/30 tilstandsmaskin). Vegg-refleksjon holder dem innenfor AABB. Tier-antall: sau low=3/medium=5/high=8, ku low=2/medium=4/high=6.

**Kyr pa high-tier** far horn automatisk. Pa medium+ tier har ku svart flekk.

### 17.2 Utvidede vegetasjonstyper

`addVegetationPatch` stotter na sju typer:

| Type | Utseende | Typisk bruk |
|---|---|---|
| `'grass'` | Gront gress | Overalt |
| `'reeds'` | Hoge siv | Vann-nær |
| `'flowers'` | Lyse-rosa blomster | Enger |
| `'heather'` | Lilla/rosa lyng | Heiomrader |
| `'wildflowers'` | Rod-oransje villblomster | Skogkanter |
| `'ferns'` | Hoge gronne bregner | Under trær / skog |
| `'bush'` | Kompakt busk | Skogsrand, steinurer |

```typescript
engine.addVegetationPatch({ minX: -40, maxX: -22, minZ: -12, maxZ: 8 }, 1.4, 'heather');
engine.addVegetationPatch({ minX: 8, maxX: 22, minZ: 12, maxZ: 28 }, 0.7, 'ferns');
engine.addVegetationPatch({ minX: -8, maxX: 6, minZ: 6, maxZ: 18 }, 1.0, 'wildflowers');
engine.addVegetationPatch({ minX: 5, maxX: 15, minZ: -5, maxZ: 5 }, 0.6, 'bush');
```

Alle typer bruker samme vind-shader. Ingen geometri-endring - kun fargevariant.

### 17.3 Fallgruver

- **Dyr i vegger**: `addAnimalGroup` plasserer dyr tilfeldig innenfor AABB ved start. Solide Rapier-colliders pavirker IKKE dyrene (de har ingen rigid body). Sett derfor `bounds` til apent terreng uten bygninger inni.
- **Fugler for lave**: `altitude` er absolutt Y-verdi (verdenskoordinat). Sett hoyt nok sa de ikke klipper gjennom trær eller aker.
- **Sommerfugler pa feil hoyde**: `center` Y-komponenten er basen - sommerfugler spawner 0.4-1.8m OVER denne. Sett `center[1] = 0` for bakke-niva.

---

## 19. Språkregler (kritisk for UI-tekst)

- Alt innhold på norsk bokmål, forståelig for 14-åring (jf. CLAUDE.md)
- Bruk alltid korrekte norske tegn: **å, ø, æ** (aldri aa, oe, ae)
- **ALDRI em-dash (—) eller tankestrek (–)**. Bruk bindestrek (-) i stedet
- Aktiv form fremfor passiv ("Harald samlet Norge", ikke "Norge ble samlet")
- Test hver setning: ville en 14-åring forstått dette uten hjelp?

**Vanlige AI-genereringsfeil — søk eksplisitt etter disse før ferdigstilling:**

| Feil form | Riktig |
|-----------|--------|
| pa, paa | på |
| ma | må |
| ra, ga | rå, gå |
| forst, forste | først, første |
| nodvendig | nødvendig |
| rekkefylge | rekkefølge |
| fornyde | fornøyde |
| fullfort, fullforte | fullført, fullførte |
| gjennomforte, gjennomfores | gjennomførte, gjennomføres |
| kjareste | kjæreste |
| forstar | forstår |
| var (vær-relatert) | vær |
| dognet | døgnet |
| Snofalt | Snøfall |
| take (tåke-relatert) | tåke |
| ost (retning) | øst |
| ore | øre |
| aere | ære |
| mjod | mjød |
| bolgene | bølgene |
| halvmorket | halvmørket |
| Royk | Røyk |
| Asene | Åsene |

Raskeste søk: se etter ` pa `, ` ma `, ` ra `, ` ga ` (med mellomrom) og ord som slutter på `fort`, `forst`, `fores` der ø er forventet.

---

## 18. Fase 5-funksjoner (assets, save/load, LOD)

Disse funksjonene er opt-in og kjører uten endringer for eksisterende spill.

### 18.1 GLTF-assets

Deklarer modeller i `GameConfig.assets.defs`. Motoren preloader dem før `startGame()` resolverer:

```ts
const config: GameConfig = {
    // ...
    assets: {
        defs: [
            { id: 'cart',   url: '/models/cart.glb' },
            { id: 'anvil',  url: '/models/anvil.glb' },
        ],
        draco: false,  // sett true hvis modellene er DRACO-komprimert
    },
};
```

Bruk via `engine.cloneAsset(id)` (returnerer Promise fordi SkeletonUtils for riggede modeller lastes lazy). `engine.getAsset(id)` returnerer rå-referansen - bruk kun hvis du ikke trenger klon.

**DRACO**: Hvis `draco: true`, kopier decoder-filene til `public/draco/` (fra `node_modules/three/examples/jsm/libs/draco/`). `GLTFLoader` lastes lazy - spill uten `assets` drar ikke inn loader-koden.

### 18.2 Save/load

Aktiveres automatisk for alle spill (bruker `GameConfig.id` som nøkkel). Spiller ser "Lagre", "Last inn" og "Slett lagring" i pause-menyen. Auto-save hvert 30s + debounced på `setFlag`/umiddelbart på `setPhase`.

**Hva som persistes automatisk**: phase, flagg, inventar, quest-progresjon, NPC-rute-indekser + posisjoner, spiller-pos + yaw, time-of-day, vær.

**Hva som IKKE persistes**: spill-spesifikk verden-state som ikke går via flagg (f.eks. prosedyralt plasserte objekter som åpnes/lukkes). All persistent gameplay-state må være flagg-basert.

**Versjonering**: Save-objekter har `version: 1`. Ved schema-endring: bump versjonen - eldre saves returnerer `null` fra `load()` og spilleren starter friskt.

### 18.3 LOD for vegetasjon

Helautomatisk. `engine.addTree([x,y,z], type)` oppretter nå en `THREE.LOD` med tre nivåer:
- **0-25m** (high): full vind-shader-foliage
- **25-60m**: simpler geometri uten shader
- **60m+**: sprite-billboard (cached per `TreeType`)

`addVegetationPatch(...)` kulles helt utenfor tier-avhengig radius. Grenser er tier-justert: low er mer aggressiv enn high.

Ingen konfigurasjon trengs - gir deg 500+ trær på Chromebook uten å fryse FPS.

---

## 19. Fase 4-6 API-er (gameplay-fundament)

Disse systemene er opt-in. Deklarer dem i `GameConfig`, så håndterer motoren resten - inkludert UI, save/load-persistens og worldspace-markører.

### 19.1 Quest-system

Tre quester koblet i kjede (`q_greet` → `q_runes` → `q_deliver`) brukes i Lysalvendalen som referanse:

```ts
questDefs: [
    {
        id: 'q_greet',
        title: 'Hils på Alvstein',
        description: 'Snakk med munken nede ved spawn.',
        objectives: [{
            id: 'o_talk',
            label: 'Snakk med Alvstein',
            condition: { npcTalkedTo: 'guide' },
            marker: { attachTo: 'guide' },  // gul diamant følger NPCen
        }],
        rewardFlags: ['greeted_alvstein'],
    },
    {
        id: 'q_runes',
        title: 'De tre runesteinene',
        description: '...',
        prerequisites: ['q_greet'],
        objectives: [
            { id: 'o_r1', label: '...', condition: { flag: 'rune_circle_picked' }, marker: { pos: [-8, 1.2, -19] } },
            { id: 'o_r2', label: '...', condition: { flag: 'rune_fire_picked' },   marker: { pos: [10, 1.2, -10] } },
            { id: 'o_r3', label: '...', condition: { flag: 'rune_forest_picked' }, marker: { pos: [-30, 1.2, 0] } },
        ],
        rewardFlags: ['runes_complete'],
    },
],
```

**Condition-typer** (én må stemme per objective):
- `flag: 'X'` - flagget er truthy
- `itemCollected: 'X'` - itemet er i inventaret
- `npcTalkedTo: 'X'` - spilleren har trykket E nær NPCen (uavhengig av dialog-utfall)
- `positionNear: { pos: [x,y,z], radius }` - spilleren er i nærheten

**Auto-flow**:
- Quest med `prerequisites` starter `locked`. Når alle prereqs er `completed`, motoren flytter den til `active` neste tick.
- Når alle objectives er ferdig, status → `completed` og `rewardFlags` settes.
- Spilleren ser quest-loggen ved å trykke **J**.

**Manuelle hooks** (fra dialog-actions eller customUpdate):
- `engine.startQuest(id)` - aktiver en låst quest direkte (ignorerer prereqs)
- `engine.completeObjective(qId, oId)` - marker objective ferdig manuelt

### 19.2 Inventar

```ts
items: [{ id: 'runestone', name: 'Runestein', description: '...', icon: '🪨', stackable: true, maxStack: 3 }],
inventorySize: 12,
```

Spilleren ser inventaret med **I**-tasten. API:
- `engine.addItem(id, count?)`, `engine.removeItem(id, count?)`
- `engine.hasItem(id)`, `engine.itemCount(id)`

**Pickup-direkte-til-inventar (Fase 6)**: hvis du registrerer et fysisk objekt som pickup med `toInventory`, hopper motoren over hold-i-hånd-fasen og fjerner mesh + collider med en gang:

```ts
engine.registerPickup(rune, {
    toInventory: { itemId: 'runestone', count: 1 },
    onPickup: () => {
        engine.setFlag('rune_circle_picked', true);  // for quest-condition
        // ev. fjern visuelle effekter (ringer, partikler) her
    },
});
```

`onPickup` fyrer FØR mesh fjernes, men det fysiske objektet er borte umiddelbart etterpå - ingen drop/throw.

### 19.3 Kondisjonell dialog

Dialog-noder kan være en LISTE av varianter. Motoren velger første variant hvor `condition` matcher; en variant uten condition er fallback (legg den sist):

```ts
dialogs: {
    guide_greeting: [
        {
            speaker: 'Alvstein',
            text: 'Du har plassert steinene! Kjelleren er åpen.',
            condition: { flagsRequired: ['cellar_unlocked'] },
            choices: [{ text: 'Takk!', next: null }],
        },
        {
            speaker: 'Alvstein',
            text: 'Du har funnet alle tre! Bring dem til alteret.',
            condition: { flagsRequired: ['runes_complete'], flagsExcluded: ['runes_delivered'] },
            choices: [{ text: 'Skal bli.', next: null }],
        },
        {
            speaker: 'Alvstein',
            text: 'Velkommen til Lysalvendalen! Vil du finne runesteinene?',
            choices: [{ text: 'Ja', next: null }],  // fallback (uten condition)
        },
    ],
},
```

**Condition-felt** (alle valgfrie, AND-kombinert):
- `flagsRequired: string[]` - alle må være truthy
- `flagsExcluded: string[]` - alle må være falsy
- `questCompleted: string[]` - alle quest-IDene må ha status `completed`
- `itemInInventory: string[]` - alle items må finnes

### 19.4 Spatial og ambient audio

```ts
audio: {
    masterVolume: 0.7,
    tracks: [
        { id: 'wind',  url: '/audio/wind.mp3',  kind: 'ambient', loop: true, volume: 0.4, trigger: 'onStart' },
        { id: 'fire',  url: '/audio/fire.mp3',  kind: 'spatial', loop: true, volume: 0.8,
          position: [10, 0.5, -10], maxDistance: 18, trigger: 'onStart' },
        { id: 'sting', url: '/audio/sting.mp3', kind: 'ambient', volume: 1.0,
          trigger: { flag: 'boss_appeared' } },
    ],
},
```

**Trigger-varianter**: `'onStart'` | `{ flag: 'X' }` (fyrer når flagget først blir truthy) | `{ phase: 'X' }` (fyrer når setPhase matcher). Spatial lyder følger `position` eller `attachTo: 'characterId'`.

**Manuelle one-shots**: `engine.playOneShot(url, { position?, volume? })`. AudioSystem logger en advarsel ved fetch-feil og fortsetter spillet uforstyrret - manglende lydfiler er ikke fatalt.

### 19.5 NPC-atferd (reaktive)

```ts
npcBehaviors: [
    { characterId: 'vandrer', playerReaction: { distance: 4, behavior: 'face' } },
    { characterId: 'guard',   playerReaction: { distance: 6, behavior: 'approach', speedMultiplier: 1.8 } },
],
```

Behavior-typer: `approach` | `flee` | `face` | `alert`. Hysterese på 1.5× distance forhindrer flicker. Sett `setFlag` for å trigge en quest-condition første gang reaksjonen fyrer.

### 19.6 PBR-materialer

**IBL (Image Based Lighting)** er automatisk aktivt:
- `workshop`-preset: `RoomEnvironment` bakes til env-map ved oppstart - alle PBR-materialer reflekterer omgivelseslys uten ekstra kode.
- `open`-preset + high-tier: `SkySystem` håndterer IBL fra prosedyral himmel (uendret).

**TextureKit** - canvas-genererte texturer med matching Sobel normal maps. Bruk i egne builders:

```ts
import { woodKit, stoneKit, fabricKit, dirtKit } from '../engine/TextureKit';

const wood = woodKit();
wood.tex.repeat.set(4, 4);
wood.normalMap.repeat.set(4, 4);
const gulvMat = toonMat(0x7a5030, { map: wood.tex, normalMap: wood.normalMap });
```

Tilgjengelige kits: `woodKit()`, `stoneKit()`, `fabricKit()`, `dirtKit()`. Alle returnerer `{ tex, normalMap }`.

**`makeLabelSprite(text, color?, fontSize?)`** - eneste godkjente måte å lage 3D-label-sprites på. Tekst-kun, ingen bakgrunnsramme, lesbar via canvas `shadowBlur`. Setter alltid `depthTest: false` og `renderOrder: 999` - uten dette vil SSAO-prepasset behandle sprites som solid geometri og lage svarte halos. Aldri lag lokale kopier av denne logikken i spill-filer.

```ts
import { makeLabelSprite } from '../engine/TextureKit';

const label = makeLabelSprite('Runestein', '#f5e9c8', 28);
label.position.set(x, y + 1.2, z);
scene.add(label);
```

`engine.registerPickup` og `engine.registerInteract` kaller denne internt — du trenger den bare for dekorative labels utenfor interaksjons-systemet.

**`engine.getTexture(preset, kind)`** - eldre API via `TextureManager`, fortsatt gyldig for config-nivå tekstur-tilgang:

```ts
const panelMat = engine.sceneMat(0x9a9088, {
    preset: 'stone',
    normalMap:    engine.getTexture('stone', 'normal'),
    roughnessMap: engine.getTexture('stone', 'roughness'),
    mapRepeat: [2, 2],
});
```

Tilgjengelige presets: `stone | wood | cloth | metal | leaf | water | soil`.

### 19.7 Prefab-biblioteker

Tre ferdigbygde biblioteker for historiske scener. Alle props har korrekt `userData.solid` og `colliderShape`.

**PropKit** - rekvisitter (tar `toonMat`, returnerer `THREE.Group`):
```ts
import { barrel, crate, sack, chest, cauldron, scroll, anvil, well } from '../engine/prefabs/PropKit';

const b = barrel(engine.toonMat);
b.position.set(3, 0, -5);
engine.scene.add(b);
```

**LightPropKit** - selvregistrerende lys-props (tar `engine`, returnerer `{ group }`):
```ts
import { campfire, wallTorch, brazier, candle } from '../engine/prefabs/LightPropKit';

// Lys og flamme-animasjon registreres automatisk — bare plasser gruppen
const { group } = campfire(engine);
group.position.set(0, 0, -8);
```

**FurnitureKit** - interiørmøbler (tar `toonMat`, returnerer `THREE.Group`):
```ts
import { bed, table, chair, pew, altar } from '../engine/prefabs/FurnitureKit';

const t = table(engine.toonMat, 2.0, 1.0); // w, d valgfri
t.position.set(-4, 0, 2);
engine.scene.add(t);
```

### 19.8 Weather → Gameplay

```ts
onWeatherChange: (from, to, engine) => {
    if (to === 'rain' || to === 'snow') engine.setFlag('player_wet', true);
    if (to === 'clear') engine.setFlag('player_wet', false);
},
```

Motoren setter også `wet`-flag automatisk og slukker lys merket `mesh.userData._extinguishInRain = true` ved rain/snow.

### 19.8 Statisk geometri som låses opp i runtime (Fase 6)

For dører/blokker som starter solid og åpnes etter en quest:

```ts
const door = new THREE.Mesh(geo, mat);
door.userData.solid = true;  // får static collider ved physics-init
scene.add(door);

// Senere, fra customUpdate eller dialog-action:
if (engine.getFlag('door_unlocked')) {
    engine.removeStaticCollider(door);  // fjerner collideren
    door.removeFromParent();             // eller animer den vekk visuelt
}
```

Bruk dette sparsomt - prefer å designe verdenen slik at solide objekter ikke trenger å forsvinne. Kall `removeStaticCollider` én gang per mesh.

### 19.9 Custom interaksjonspunkter (`registerInteract`)

For statiske objekter spilleren kan interagere med via E-tasten - alter, hendler, portaler, bokser, skilt. Krever ingen physics-oppsett.

```ts
engine.registerInteract(mesh, {
    radius: 2.5,           // E-radius og label-synlighetsradius (x2). Default 2.5
    label: () => {         // Funksjon = dynamisk tekst per frame
        const n = engine.itemCount('coin');
        return n >= 3 ? 'Legg inn mynter (E)' : `Trenger mynter (${n}/3)`;
    },
    onInteract: () => {
        if (engine.itemCount('coin') < 3) {
            engine.playMonolog('m_need_coins');  // hint, ikke stum avvisning
            return;
        }
        engine.removeItem('coin', 3);
        engine.setFlag('gate_paid', true);
        engine.screenFlash();
        engine.unregisterInteract(mesh);   // rydder opp label + sprite
        engine.playMonolog('m_gate_opened');
    },
});
```

**Noekkelregler**:
- `label` kan vaere `string` (fast) eller `() => string` (dynamisk). Canvas tegnes kun pa nytt nar teksten endrer seg.
- Tom streng fra `label()` skjuler label-spriten automatisk.
- Kall `engine.unregisterInteract(mesh)` nar interaksjonen er brukt opp - rydder Three.js sprite + texture.
- `engine.completeObjective(qId, oId)` inne i `onInteract` krever at questen er `active`. Sett heller et flagg med `engine.setFlag` og la quest-systemets `condition: { flag }` ta seg av resten automatisk.
- **Ikke bruk** `_customUpdate` med manuelle avstandsberegninger og `itemCount`-sjekker for dette - det er stum proximity-logikk uten feedback. Bruk alltid `registerInteract`.

Referanseimplementasjon: alteret i Lysalvendalen (`src/games/demo-world/DemoWorldAssets.ts`).

---

## 20. Best practices ("Dette burde du bruke i et nytt spill")

Sjekkliste hentet fra fasene 1-6. Følg disse, og motoren oppfører seg som forventet på Chromebook + high-end både.

**Verden + lys (`world.preset: 'open'`)**:
- Registrer alltid `scene.userData._mainSunLight` (DirectionalLight) og `_mainHemiLight` (HemisphereLight). Uten disse blir scenen nesten svart selv om SkySystem ser riktig ut.
- Aktiver `visual.shadows: 'cascaded'` + `visual.volumetricLight: true` for utendørs high-tier-spill.
- Sett `visual.fogDensityCurve` (night/dawn/day/dusk) for naturlig dag/natt-tåke.

**Markering av geometri**:
- Bruk `markSolid(mesh)`, `markClimbable(mesh)`, `markPickupable(mesh, opts)` fra `engine/sceneUserData` i stedet for direkte `mesh.userData.solid = true`. Typene fanger opp tastefeil.
- Pickupable objekter må ha `colliderShape: 'cuboid'` (sphere ruller evig i Rapier) og `linearDamping`/`angularDamping` over 0.

**Interaksjon**:
- Bruk `engine.registerInteract(mesh, opts)` for alt som skal reagere pa E-tasten (alter, dorer, hendler). Aldri manuell proximity-logikk i `_customUpdate`.
- Gi alltid visuell feedback nar spilleren prover en interaksjon uten a oppfylle betingelsen - `engine.playMonolog('hint')` er nok.
- Kall `engine.unregisterInteract(mesh)` nar interaksjonen er gjort - ellers klikkar spilleren E pa et objekt som ikke lenger reagerer logisk.

**Per-frame-arbeid**:
- Bruk `engine.schedule(callback, ms)` i stedet for `setTimeout` i setupScene/dialog-actions. Da kanselleres callbacken automatisk hvis spillet disposes underveis.
- Bruk `engine.registerAnimatedLight(light, animation)` i stedet for å oppdatere `light.intensity` selv - motoren batcher animasjonene.
- Hold eksplisitte arrays over per-frame-meshes (f.eks. svaiende ringer) heller enn å traverse hele scenen i `_customUpdate`.

**State**:
- All persistent gameplay-state må gå via `engine.setFlag(key, value)`. Save-systemet plukker bare opp flagg, inventar, quester, NPC-ruter, vær og time-of-day - ingen scene-objekter.
- Hvis du må huske at en mesh er fjernet, sett et flag og rebuild scenen tilsvarende ved load.

**Dialog**:
- Gi NPCer `marker: true` på `CharacterConfig` slik at quest-markører kan feste seg via `marker: { attachTo: 'characterId' }`.
- Bruk array-variant av dialog-noder med `condition` for narrative gjenbesøk - unngå å maintain duplisert dialog i kode.

**Audio**:
- Ikke hardkod lyd i en `setupScene`-callback. Bruk `audio.tracks` i config slik at save/load og pause virker som forventet.
- Hold spatial-tracks under 8 stk samtidig (Chromebook har 8-kanals OpenAL-grense de facto).
