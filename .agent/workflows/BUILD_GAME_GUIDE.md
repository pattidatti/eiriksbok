# BUILD_GAME_GUIDE.md

**Cookbook for å lage mini-spill til Eiriksbok.** Dette er en oppskrift, ikke en encyklopedi. Følg stegene. Ikke improvisér.

> **FØR du starter bygging:** les eller lag Blueprint først.
> Se `.agent/workflows/plan_minigame.md` og `docs/Design documents/minigames/README.md`.
> Spill uten godkjent blueprint er en prototype, ikke et produksjonsklart spill.

---

## 1. 3-stegs-oppskrift

Før du leser resten: gjør disse tre stegene. 90 % av spill trenger ikke mer.

### Steg 1 - Kopier blueprint

```bash
cp -r src/games/blueprint-quest src/games/ditt-nye-spill
```

Rename filene og eksportene. Tre filer i mappen:

- `BlueprintQuestConfig.ts` → `DittNyeSpillConfig.ts` (eksport `dittNyeSpillConfig`)
- `BlueprintQuestAssets.ts` → `DittNyeSpillAssets.ts` (eksport `setupDittNyeSpillScene`)
- `README.md` - oppdater innhold

### Steg 2 - Endre disse feltene

I `*Config.ts`:

| Felt | Hva du endrer |
|---|---|
| `id` | unik string-ID, samme som mappenavn, brukes i URL |
| `title`, `subtitle`, `description` | vises i galleriet |
| `subject` | `'historie' \| 'norsk' \| 'krle' \| 'samfunnsfag' \| 'musikk'` |
| `items` | gjenstander spilleren kan bære (itemDefs) |
| `quests` | fase-navn + oppdragstekst per fase |
| `endText` | funksjon som returnerer slutt-tekst basert på flagg |

I `*Assets.ts`:

- Endre `buildRoom`-config (rom-størrelse, materialer, lys-preset, dører, vinduer)
- Endre `addProp`-kall (hvilke møbler, hvor)
- Endre `addPickup`-kall (gjenstander i rommet)
- Endre `addNPC`-kall med dialog-innhold
- Endre `addMonolog`-triggere
- Endre `addPuzzleSlot`-logikk hvis du har puzzles

### Steg 3 - Registrer og test

I `src/pages/MiniGamesPage.tsx`: legg `dittNyeSpillConfig` til `HISTORICAL_GAMES`.
I `src/pages/GamePage.tsx`: legg `[id]: dittNyeSpillConfig` til `GAME_REGISTRY`.

Kjør `npm run dev`. Åpne `http://localhost:5173/oving/spill`. **Konsollen må være tom for warnings.**

Gå gjennom `§7 Quality Gates`. Hvis alle er ✓, er spillet ferdig.

---

## 2. Pre-Flight Checklist

Før `npm run dev` første gang:

- [ ] **FATAL** - `config.id` er unik (ikke overlapper andre spill)
- [ ] **FATAL** - Alle `addPickup.itemId` finnes i `config.items`
- [ ] **FATAL** - Alle `characterType` er `'scientist' | 'farmer' | 'noble' | 'monk'`
- [ ] **FATAL** - Dialog-variants-arrays har fallback-node (motoren sorterer automatisk, men minst én variant uten `condition` må finnes)
- [ ] **CRITICAL** - Fler-NPC-spill bruker `{npcId}_greeting`-konvensjon
- [ ] **CRITICAL** - `addNPC` er kalt før noen dialog-actions refererer NPCen
- [ ] **CRITICAL** - Låste dører har `openFlag` satt, og minst én puzzle/dialog setter flagget
- [ ] **INFO** - `thumbnail` peker til et bilde i `public/images/` (ok å være tom string)
- [ ] **INFO** - All tekst er på norsk bokmål med riktige tegn (å/ø/æ)
- [ ] **CRITICAL** - `player.startPosition` er **minst 2m fra veggen bak spilleren**. Tredjeperson-kameraet følger ~3m bak; står spilleren nær sørveggen, havner kameraet utenfor rommet og scenen blir usynlig. Plasser spilleren nær midten av rommet (f.eks. `[0, 0, 0]` i et 8x8-rom).
- [ ] **INFO** - `buildRoom.size[1]` (høyde) er **minst 4m**. Lavere tak gir kamera-klipping når spilleren ser ned (kameraet svinger opp og treffer taket). Motoren clamper automatisk mot tak-collider, men romsligere tak ser bedre ut.

ConfigValidator kaster FATAL og logger CRITICAL/INFO automatisk. Men sjekklisten hjelper deg før du kjører.

---

## 3. Builder-katalog

Alle builders importeres fra `@/games/engine/declarative`:

```ts
import {
    buildRoom, buildOutdoor,
    addProp, addInteractable, addDoor, addRawMesh,
    addPickup, addPuzzleSlot,
    addNPC, addMonolog,
    addAmbientAudio, addParticle,
} from '../engine/declarative';
```

### 3.1 `buildRoom(engine, config)`

Lukket rom med vegger, gulv, tak, lys, evt dører/vinduer.

```ts
buildRoom(engine, {
    id: 'workshop',
    size: [10, 4, 8],          // bredde, høyde, dybde
    floor: 'wood',
    walls: 'plaster',
    ceiling: 'wood',
    lights: 'warm-interior',
    doors: [{ wall: 'north', offset: 0, openFlag: 'door-unlocked' }],
    windows: [{ wall: 'east', width: 1.2 }],
});
```

**Når bruke**: alle innendørs-spill. Default-valget.

**Vanlige feil**: ingen - builder setter alt. Men hvis du ikke får lys, sjekk at `lights`-preset er gyldig.

### 3.2 `buildOutdoor(engine, config)`

Sirkulær utendørs-arena med bakke, grense, lys.

```ts
buildOutdoor(engine, {
    id: 'field', radius: 30, ground: 'grass', lights: 'outdoor-day',
});
```

**Når bruke**: utendørs-spill, fler-fase-spill med åpne områder.

### 3.3 `addProp(engine, config)`

Statisk eller dynamisk objekt. Default: statisk, solid, skygge.

```ts
addProp(engine, { id: 'anvil', model: 'anvil', pos: [2, 0, 3] });

// Dynamisk (kan dyttes):
addProp(engine, {
    id: 'crate', model: 'crate', pos: [0, 1, 0],
    dynamic: { mass: 3 },
});
```

**Når bruke**: alle møbler, dekor, interaktive strukturer uten E-key.

**Vanlige feil**: å sette `solid: false` på en mesh spilleren skal stå på eller dytte - hold `solid: true` (default) med mindre det er rent visuelt.

### 3.4 `addPickup(engine, config)`

Gjenstand spilleren kan plukke opp til inventar.

```ts
addPickup(engine, {
    id: 'cup', itemId: 'poison-cup', model: 'cup', pos: [-2, 1, 0],
    audioOnPickup: 'pickup-tool',
});
```

**Overflatehøyder** — `pos.y` er posisjonen til *modell-gruppen*, ikke objektets topp. For å plassere et item på en møbel-overflate, bruk disse verdiene (møbel-gruppen plassert på bakken, y=0 som referanse):

| Møbel (`model:`) | Topphøyde (world y) | Anbefalt pickup y |
|---|---|---|
| `table` | 0.86 | 0.9 |
| `bench` | 0.49 | 0.55 |
| `chair` | 0.54 | 0.6 |
| `chest` | 0.55 | 0.6 |
| `lectern` | 1.27 | 1.35 |
| `altar` | 1.04 | 1.1 |
| gulv (ingen møbel) | 0.0 | 0.05–0.1 |

**Eksempel**: scroll på bord → `addPickup({ model: 'scroll', pos: [5, 0.9, -5] })`, bord → `addProp({ model: 'table', pos: [5, 0, -5] })`.

**Når bruke**: alle items som skal til inventar.

**Vanlige feil**: `itemId` ikke i `config.items` → validator kaster FATAL.

### 3.5 `addPuzzleSlot(engine, config)`

Sted der spilleren kan plassere items fra inventar.

```ts
addPuzzleSlot(engine, {
    id: 'altar-slot', pos: [0, 0.5, -3], accepts: ['poison-cup'],
    onPlaced: (id) => { engine.setFlag('drank', true); },
});
```

**Når bruke**: plasser-puzzle (plasser A på B).

**Vanlige feil**: `accepts`-liste matcher ikke `config.items` → validator kaster FATAL.

### 3.6 `addInteractable(engine, config)`

E-key-trigger på et objekt.

```ts
addInteractable(engine, {
    id: 'lever', model: 'cube', pos: [0, 1, 0], prompt: 'Dra spaken (E)',
    onInteract: () => engine.setFlag('lever-pulled', true),
});
```

**Når bruke**: spaker, knapper, bokhyller, hvor-som-helst E-trykk skal utløse kode.

### 3.7 `addDoor(engine, config)`

Frittstående dør med valgfri lås.

```ts
addDoor(engine, {
    id: 'exit', pos: [0, 0, 5],
    lockedUntilFlag: 'has-key',
    onLockedAttempt: () => engine.playMonolog('locked-door-thought'),
});
```

### 3.8 `addNPC(engine, config)`

Karakter med dialog, emosjon, marker.

```ts
addNPC(engine, {
    id: 'sokrates', name: 'Sokrates', characterType: 'monk',
    pos: [0, 0, -2], emotion: 'worried', questMarker: true,
    portrait: '🧙',
    dialogs: {
        sokrates_greeting: { speaker: 'Sokrates', text: 'Hei.', choices: [{ text: 'Hei', next: null }] },
    },
});
```

**Dialog-konvensjon for fler-NPC-spill**: bruk `{npcId}_greeting`, `{npcId}_progress` osv. Motoren åpner `sokrates_greeting` automatisk når spilleren trykker E på Sokrates.

**`portrait`-glyfen** (valgfri emoji): vises i portrett-ruten til venstre i dialogboksen (Portrett lower-third-layouten). Settes per NPC i `addNPC`/`config.characters`, eller per replikk via `portrait` på en enkelt `DialogNode` (node-nivå overstyrer karakter-nivå). Utelates den, faller motoren tilbake i denne rekkefølgen: `characterType`-emoji (`scientist`→🧑‍🔬, `farmer`→🧑‍🌾, `noble`→🤴, `monk`→🧙) → emotion-ansikt → 🙂. Emotion (`emotion` på `DialogNode`) tinter i tillegg rammen/aksenten rundt boksen. Velg en glyf som matcher figuren, ikke bare characterType-modellen (f.eks. en lysalv modellert som `monk` passer bedre med 🧝).

**Variants**: en dialog-verdi kan være array. Da sorteres fallback (uten condition) automatisk sist.

**`talkable`-flagget** (default `true`): Styrer *kun* om navnelabelen vises over hodet på NPC-en. Det blokkerer **ikke** E-key-interaksjon — dialogen åpnes uansett hvis spilleren er nær nok. Bruk `talkable: false` kun for NPCer som skal være visuelt anonyme (ingen navn over hodet), ikke for å forhindre dialog.

**NPC-bevegelse etter dialog** — bruk `engine.assignRoute` i `onEnd` eller `action` for å la en NPC bevege seg etter et dialog-valg. Uten dette vil NPC-en stå stille selv om dialogen sier "Følg meg":

```ts
caesar_greeting: {
    speaker: 'Cæsar',
    text: 'Følg meg inn.',
    choices: [{ text: 'Ja.', next: null }],
    onEnd: () => {
        engine.assignRoute({
            characterId: 'caesar',
            waypoints: [[0, -14], [0, -23]],  // [x, z]-par
            mode: 'once',    // stopper ved siste waypoint
            speed: 0.9,      // m/s
        });
    },
},
```

`mode: 'loop'`/`'pingpong'` for patrol. `onComplete` kalles når `'once'`-ruten er ferdig.

### 3.9 `addMonolog(engine, config)`

Indre monolog med trigger.

```ts
addMonolog(engine, {
    id: 'window-thought',
    lines: ['Vinden blåser inn.', 'Athen venter utenfor.'],
    trigger: { type: 'proximity', pos: [3, 1, 0], radius: 1.5 },
});
```

**Trigger-typer**: `proximity` (gå inn i boks), `onPhase` (fase bytter), `onFlag` (flagg settes), `manual` (kun via `engine.playMonolog(id)`).

### 3.10 `addAmbientAudio(engine, config)`

Bakgrunnslyd. Stille no-op hvis preset-URL er null.

```ts
addAmbientAudio(engine, { id: 'wind', audio: 'wind-indoor', volume: 0.3 });
```

### 3.10b `addCrowd(engine, config)` - instansierte folkemengder

Hundrevis til ~2000 lavpoly-mennesker i ÉN draw call per sti-segment (CrowdSystem).
Bruk denne for hærer, marsjer og folkemengder - ALDRI individuelle figurer i løkke.
Gang-animasjonen skjer i vertex-shaderen; CPU-kostnaden per frame er kun uniforms.

```ts
// Marsjerende kolonne: flyter langs en polylinje med conveyor-wrap
addCrowd(engine, {
    id: 'kolonne',
    count: 650,                 // FØR tier-skalering (low ×0.35, high ×1.0)
    mode: 'march',
    path: [[-5.8, 0, 75], [-5.8, 0, -5]],  // strekk stien dypt inn i tåka!
    width: 2.6,
    speed: 1.1,
    palette: { shirts: [0x26262a, 0x1f1f23], skin: 0xc89868, caps: 0x121216, pants: 0x1c1c20 },
});
// Stående mengde
addCrowd(engine, { id: 'torgfolk', count: 120, mode: 'static', area: { minX: -10, maxX: 10, minZ: 0, maxZ: 12 } });

// Runtime-styring (f.eks. per fase):
engine.setCrowdSpeed('kolonne', 0);       // kolonnen STOPPER (gang-anim dør mykt)
engine.setCrowdVisible('kolonne', false);
```

**Fallgruver**: (1) march-stier wrapper instanser fra slutt til start - begge ender må
ligge i tåke/utenfor synsvidde, ellers ser eleven figurer poppe. (2) Crowd-figurer har
ingen kollisjon og kaster ikke skygge (depth-pass kjenner ikke shader-displacementen).
(3) Hero-figurer nær kamera (linse-mål, navngitte personer) lages fortsatt manuelt.

### 3.11 `addParticle(engine, config)`

Partikkel-effekt.

```ts
addParticle(engine, { id: 'forge-smoke', preset: 'smoke', pos: [0, 1, 0] });
```

### 3.12 `addRawMesh(engine, config)` - escape hatch

**Du skal svært sjelden trenge denne.** For edge-cases som ikke kan uttrykkes deklarativt. Du tar selv ansvar for shadow/physics.

```ts
addRawMesh(engine, { mesh: myCustomMesh, solid: true });
```

### 3.13 `engine.playSequence(steps)` - klimaks/cinematics uten schedule-kjeder

Deklarativ tidslinje som erstatter nestede `engine.schedule()`-kjeder. `at` = ms fra
sekvensstart, `after` = ms etter at forrige steg ble FERDIG (default `after: 0`).
`wait: true` på monolog/cinematic venter til de er ferdige før neste steg.

```ts
engine.playSequence([
    { after: 700, monolog: 'venter', wait: true },
    { after: 500, do: () => { kongen.position.set(-2, 0, -16); } },
    { after: 0, cinematic: [{ duration: 4, cameraPos: [9, 3.5, -8], lookAt: [-2, 1.1, -16], fov: 50, transition: 'fade' }], wait: true },
    { after: 400, do: () => { engine.setPhase('seieren'); } },
]);
```

**Skip-semantikk** (viktig): `handle.skip()` dropper gjenstående ventetider, monologer
og cinematics - men `do`-steg KJØRES alltid (de bærer state: setFlag/setPhase/triggerEnd).
Legg derfor visuell opprydding (fadeFromBlack, flytte aktører) i `do`-steg.
Sekvenser kanselleres automatisk ved dispose. Se `engine/utils/SequenceRunner.ts`.

---

### 3.14 `buildTerrain(engine, config)` - prosedyralt terreng (Fase 8)

Erstatter den flate bakke-boksen med ekte, kupert terreng: ett vertex-farget mesh +
Rapier-heightfield + height-queries. Kall den FØR du plasserer noe på bakken.

```ts
buildTerrain(engine, {
    id: 'stiklestad-terreng',
    size: 180,                 // kvadratisk side i meter
    seed: 7,
    noise: { amplitude: 3, frequency: 0.02, octaves: 3 },
    features: [
        { type: 'flatten', center: [0, 60], radius: 22 },   // leir-platting
        { type: 'plateau', center: [0, 0], radius: 30, height: 7 }, // utsiktsrygg
        { type: 'rim', innerRadius: 70, height: 25 },        // fjellring i horisonten
    ],
    paint: [{ center: [0, 30], radius: 8, color: 0x6a5a3a }], // tråkket sti
    palette: { grass: 0x6b8a4a, rock: 0x6a6470 },
    lights: 'outdoor-dusk',
});
```

**`'terrain'`-sentinel**: i pos-felt kan Y-en være strengen `'terrain'` i stedet for et
tall - da snappes objektet til bakkehøyden. Virker på `addProp`, `addPickup`, `addNPC`,
`addInteractable`, `addParticle`, `addGlowSprite`:

```ts
addProp(engine, { id: 'stein', model: 'crate', pos: [12, 'terrain', -4] });
```

Crowds: sett `snapToTerrain: true` på `addCrowd` (static sampler høyden per figur; march
løfter path-punktene - fortett punktene over kuperte rygger). NPC-ruter, vegetasjon og
gress følger bakken automatisk når et terreng finnes.

**Krav/fallgruver:**
- `player.startPosition.y` MÅ ligge OVER terrenget der spilleren spawner (ellers havner
  kapselen inne i bakken). Bruk `getTerrainHeight` mentalt: leiren ligger på `flatten`-høyden.
- Heightfield-collideren støtter ikke overheng/grotter - bruk props for det.
- Bratte flater (normal.y < `slopeRockThreshold`, default 0.75 ≈ 41°) males som stein.
  Character-controllerens maks-helning er 45°, så veldig bratte rygger blir uframkommelige.
- `engine.getTerrainHeight(x, z)` gir bakkehøyden i runtime (f.eks. for å plassere effekter).

### 3.15 Kits - bål, faner, sonetitler (Fase 8)

Ferdigmonterte visuelle byggesteiner som konsoliderer mønstre spillene før håndrullet hver
for seg. **All animasjon (flicker, vaiing, fade) kjøres internt i kit-en** - legg ALDRI
sinus-animasjon av bål/faner i spillets egen update-loop (gammel duplisert jank, se §8.17).

```ts
addCampfire(engine, { id: 'leirbaal', pos: [0, 'terrain', 58], scale: 1.1, audio: true });
addWavingFlag(engine, { id: 'olavsfane', pos: [-3, 'terrain', 56], colors: { top: 0x7a1f1f, bottom: 0xc23b22 } });
addGlowSprite(engine, { id: 'fakkel-glow', pos: [4, 1.6, 50], color: 0xffa64d, pulse: { amount: 0.1, speed: 3 } });

// Sonetittel når spilleren går inn i et område (som MonologTrigger, men for stedsnavn):
addZoneTitle(engine, { id: 'sone-rygg', area: { minX: -20, maxX: 20, minZ: -10, maxZ: 10 }, title: 'Ryggen', subtitle: '29. juli 1030' });
```

- `addCampfire` returnerer `setLit(boolean)` for å tenne/slukke. Bruker ett flickrende
  PointLight (animert av motoren) + glød-sprite + valgfri røyk og knitre-lyd.
- `engine.showZoneTitle(title, { subtitle?, durationMs? })` kan også kalles direkte ved
  fase-skifter. `IntroConfig.type: 'zone'` gir en sonetittel-intro i stedet for intro-kortet.

**Cinematic-glide** (Fase 8): `CinematicShot.transition: 'glide'` lerper mykt fra forrige
shot. `GameConfig.openingCinematicEnd: { glideToPlayerMs }` lar åpnings-cinematicen gli inn
i spillerkontroll i stedet for å kutte:

```ts
openingCinematic: [
    { duration: 3, cameraPos: [20, 14, 40], lookAt: [0, 2, 0], fov: 55 },
    { duration: 2.5, cameraPos: [4, 2, 8], lookAt: [0, 1.6, 0], transition: 'glide' },
],
openingCinematicEnd: { glideToPlayerMs: 1400 },
```

### 3.16 Interaksjonsverb - lad-og-kast, prosjektiler, mål (Fase 8)

Ett kast-verb for alt: **E = ta/bruk, hold F = lad, slipp F = kast/skyt.** Ingen ny tast.

```ts
// 1) Kastbar stein (charge-throw): hold F for å lade, slipp for å kaste med bue-preview.
addPickup(engine, {
    id: 'kaste-stein', itemId: 'stein', model: 'sphere', pos: [3, 'terrain', 2],
});
engine.registerPickup(mesh, { throwForce: 8, charge: { maxForce: 16, chargeTimeMs: 900 } });

// 2) Blink (mål) med reaksjon ved treff:
addTarget(engine, { id: 'blink-1', pos: [0, 'terrain', -18], reactions: ['knock'], resetAfterMs: 2500, onHit: () => engine.setFlag('traff', true) });

// 3) Våpenstativ: E = utrust spyd, deretter hold F = lad, slipp = skyt prosjektil mot blinken.
addLauncher(engine, { id: 'spyd-stativ', kind: 'spear', pos: [6, 'terrain', 0], ammo: 5, onHitTarget: () => engine.setFlag('traff', true) });

// 4) Manuelt prosjektil (analytisk bane, ikke Rapier-body):
engine.spawnProjectile({ from, velocity, visual: 'arrow', onHit: (hit) => { if (hit.target) score++; } });
```

- Charge-previewen viser en ballistisk bue (samme gravitasjon som Rapier) + landingsring,
  så det spilleren ser er det faktiske treffpunktet. HUD viser ladnings-meter + ammo.
- `addTarget`-reaksjoner: `flash` (emissiv puls), `knock` (veltes), `shatter` (fragmenter, 2s).
  Disse er visuelle - målet er en proximity-sone, ikke en fysikk-body.
- Prosjektiler er pool-et (32 per visual) og bruker raycast per steg (deterministisk treff,
  ingen body-churn). Vanlige holdte-objekt-kast spores også mot mål.
- Lading kanselleres automatisk ved dialog/cinematic/pause/ikke-fri modus.

---

## 4. Preset-katalog

### 4.1 Material-presets

| Preset | Bruk |
|---|---|
| `wood` | tre-gulv, møbler |
| `brick` | murstein, amforaer |
| `stone` | fjell, slott-vegger |
| `iron` | metall-detaljer, redskaper |
| `fabric` | gardiner, sekker, klær |
| `parchment` | bøker, pergament, stearinlys |
| `grass` | gress-bakke |
| `water` | vann-overflate |
| `plaster` | indre vegger |
| `thatch` | stråtak |
| `marble` | tempel, altar |
| `dirt` | jord, gårdsplass |

### 4.2 Lighting-presets

| Preset | Bruk |
|---|---|
| `warm-interior` | vanlig innendørs-scene (default) |
| `cold-interior` | steinkjellere, is-grotter |
| `forge-red` | smie, lavarom |
| `dim-candle` | mystikk, okkult, mørkt bibliotek |
| `prison-cell` | fangehull, isolasjon |
| `chapel` | kirke, hellig rom |
| `outdoor-day` | utendørs midt på dagen |
| `outdoor-dusk` | solnedgang |
| `outdoor-night` | nattscene |

### 4.3 Model-presets

Grunnformer: `cube`, `sphere`, `cylinder`

Møbler: `bench`, `chair`, `table`, `chest`, `lectern`, `barrel`, `crate`

Belysning: `candle`, `torch`, `lantern`

Gjenstander: `book`, `scroll`, `cup`, `amphora`, `sack`, `rope`

Verktøy: `hammer`, `anvil`, `quill`

Arkitektur: `door`, `window-bars`, `pillar`, `altar`

Hvis du trenger noe som ikke finnes: bruk `{ primitive: 'box' | 'cylinder' | 'sphere', size: [...], color: 0x... }` som custom model. Eller bruk `addRawMesh` for komplekse ting.

### 4.4 Audio-presets

`pickup-tool`, `pickup-paper`, `puzzle-win`, `puzzle-fail`, `dialog-open`, `door-open`, `door-locked`, `footstep-wood`, `footstep-stone`, `fire-crackle`, `wind-indoor`, `chains-rattle`, `water-drip`, `rain`, `wind-outdoor`, `crowd-murmur`, `thunder`, `drum-hit`, `shutter-click`

**Alle presets har lyd**: de syntetiseres prosedyralt via `proc:`-URL-skjemaet
(`src/games/engine/systems/ProceduralAudio.ts`) - ingen lydfiler trengs. En `proc:`-URL
kan også brukes direkte i `engine.playOneShot('proc:thunder')` og kan parametriseres:
`'proc:blip-pickup?base=440&gain=0.3'`. Bytt gjerne en preset til en ekte fil-URL i
`AUDIO_PRESETS` senere - call-sites er uendret.

**Sanntidsstyrt lyd** (følger spill-state):

```ts
const steps = engine.startProceduralSound('march-footsteps', { bpm: 116, intensity: 0.5 });
steps?.setParam('intensity', 0);   // stillhet når kolonnen stopper
const murmur = engine.startProceduralSound('crowd-murmur-live', { intensity: 0.6 });
```

**Ambient med kontroll** (`engine.playAmbient` returnerer en handle async):

```ts
let rain: AudioHandle | null = null;
void engine.playAmbient('proc:rain', { volume: 0.45, fadeIn: 1.5 }).then((h) => { rain = h; });
// senere: rain?.setVolume(0); rain?.stop(2);
```

### 4.5 Particle-presets

`steam`, `smoke`, `dust`, `sparks`, `candle-glow`, `torch-flame`

---

## 5. Naming Conventions

Følg disse konvensjonene **uten unntak**. De gjør koden konsistent og unngår hele klasser av bugs.

| Type | Konvensjon | Eksempel |
|---|---|---|
| Spill-ID | kebab-case, mappenavn = spill-id | `sokrates-fengsel`, `watt-lab` |
| Dialog-ID (fler-NPC) | `{npcId}_{variant}` | `sokrates_greeting`, `kriton_urge` |
| Dialog-ID (enkelt-NPC) | `greeting`, `progress`, `puzzleIntro`, `puzzleWin` | - |
| Fase-navn | kebab-case, narrative beats | `intro`, `collecting`, `resolved` |
| Flag-navn | kebab-case, past tense | `drakk-gift`, `door-unlocked`, `kriton-overtalt` |
| Item-ID | kebab-case | `gift-beger`, `repstige`, `hammer` |
| Builder-ID | beskrivende, unik i spillet | `sokrates-bench`, `altar-slot` |

### 5.1 Filstruktur per spill

Et spill består minimum av to filer, tre eller fire hvis innholdet er stort:

| Fil | Når kreves den | Innhold |
|---|---|---|
| `<Navn>Config.ts` | alltid | `GameConfig`-objektet (id, items, quests, endText, metadata) |
| `<Navn>Assets.ts` | alltid | `setupScene`-callback med builder-kall |
| `<Navn>Dialogs.ts` | **3+ NPCer ELLER 10+ dialog-noder** | `export const *Dialogs: Record<string, DialogNode \| DialogNode[]>` |
| `<Navn>Monologs.ts` | **5+ monolog-noder ELLER 3+ monolog-triggers** | `export const *Monologs` og trigger-array |
| `<Navn>Flags.ts` | valgfritt, men anbefalt fra 5+ flagg | `defineFlags({...})` - typed flag-navn (se §10 og `src/games/engine/builders/defineFlags.ts`) |

**Terskel for splitting:** hvis dialog-innholdet i `Assets.ts` passerer ~100 linjer, flytt til separat fil. Da er det lettere å oppdatere tekst uten å forstyrre scene-oppbygging.

**Eksempler i repo:**
- Enkelt (inline): `src/games/blueprint-quest/`, `src/games/watt-lab/`, `src/games/skjoldborg/`
- Splittet: `src/games/lindisfarne-793/` (4 filer), `src/games/ford-factory/` (4 filer)

Bruk samme filstruktur konsekvent innenfor ett spill - ikke bland inline og split-av-noen.

### 5.2 Type-sikre flagg-navn (`defineFlags`)

Flagg-navn er strenger. En typo i `engine.setFlag('drakk-gigt', true)` vs `condition: { flagsRequired: ['drakk-gift'] }` kompilerer OK, men condition matcher aldri. Feilen oppdages først under playtest.

**Løsning:** definér flagg som const-map via `defineFlags` og referér navnene gjennom objektet. TypeScript fanger typos på kompileringstid.

```ts
// DittSpillFlags.ts
import { defineFlags, type FlagValue } from '@/games/engine/dsl';

export const FLAGS = defineFlags({
    HAS_CYLINDER: 'watt-has-cylinder',
    HAS_VALVE:    'watt-has-valve',
    ENGINE_BUILT: 'watt-engine-built',
});
export type Flag = FlagValue<typeof FLAGS>;

// I Config.ts eller setupScene:
engine.setFlag(FLAGS.HAS_CYLINDER, true);    // ✓ typo-trygt
engine.getFlag(FLAGS.HAS_VALVE);             // ✓
// engine.setFlag(FLAGS.HAS_CYLNDER, true);  // ✗ compile-error

// I dialog-condition:
condition: { flagsRequired: [FLAGS.ENGINE_BUILT] }   // ✓
```

**Runtime-garantier:** `defineFlags` throw-er hvis to nøkler peker på samme flagg-verdi (duplikat-bug) eller hvis map-en er tom.

**Når kreves det?** Ikke obligatorisk for små spill (≤3 flagg, lineær flyt). Anbefalt fra 5+ flagg og for alle spill med variabel slutt / låste dører / fler-fase narrative.

---

## 6. Symptom → Root Cause

| Symptom | Årsak | Løsning |
|---|---|---|
| Scene er helt svart | Manglende lys | Sett `lights`-preset i `buildRoom`/`buildOutdoor` |
| Ser kun en vegg / nesten svart ved start | Kamera havner utenfor rommet | `player.startPosition` er for nær en vegg. Flytt spilleren mot midten (minst 2m fra veggen bak) |
| Scene forsvinner når jeg vinkler kameraet ned | Kamera klipper gjennom taket | `buildRoom` setter collider på taket, men hvis `size[1]` er < 4m kan kameraet fortsatt treffe. Hev romhøyden |
| Spiller faller gjennom gulvet | `solid: false` på gulv (bør aldri skje med buildRoom) | Sjekk at du bruker buildRoom - ikke lag gulv manuelt |
| Gjenstand ruller evig etter dytt | Dynamic body uten damping | Motor setter 0.3 som default fra og med nå; hvis fortsatt problem, sett `dynamic.linearDamping: 0.5` |
| Dialog åpner seg ikke | Dialog-ID matcher ikke NPC-konvensjon | Bruk `{npcId}_greeting` |
| Pickup feiler stille | `itemId` ikke i `config.items` | Validator kaster FATAL nå. Legg til ItemDef |
| Dialog-variant blir aldri valgt | Fallback-rekkefølge | Motor sorterer automatisk - men sjekk at fallback finnes |
| Puzzle-slot aksepterer ingenting | `accepts`-liste inneholder ukjent itemId | Validator kaster FATAL |
| Låst dør åpnes aldri | Intet kall til `engine.setFlag('door-unlocked', true)` | Sjekk at puzzle onPlaced setter flagget |
| Scene henger på loading | `config.assets` som ikke eksisterer | Fjern `assets`-defs eller last URL |
| NPC-en er usynlig | Ugyldig `characterType` | Bruk `'scientist' | 'farmer' | 'noble' | 'monk'` |
| Gjenstand er statisk, vil ikke plukkes opp | Glemt `addPickup`, brukte `addProp` | Bytt til `addPickup` |
| Scene er for mørk på tross av `outdoor-dusk`/`outdoor-night` | Dusk/natt-presets alene er *svake* | Legg til manuell `HemisphereLight` (int ≥1.0) + `DirectionalLight` (int ≥1.4) i setupScene. Se §6.1 |
| Emissive/glødende objekt (flamme, lampe, display) ser grått/brunt ut | `addProp` med `primitive` gir kun `MeshStandardMaterial` uten emissive | Lag meshen med raw THREE: `new THREE.MeshStandardMaterial({ emissive: 0xff6020, emissiveIntensity: 3 })`. Se §6.1 |
| Quest-markør over NPC forsvinner ikke etter dialog | `questMarker: true` er *startverdi*, ikke automatisk livssyklus | Kall `engine.setCharacterMarkerVisible(id, false)` i dialogens `onEnd` eller i interactable-handleren som markerer fasen ferdig |
| Spiller kan ikke hoppe | `physics.playerJump` er `false` | Sett `playerJump: true` i GameConfig.physics. Spesielt viktig for utendørs-spill |
| Kommer ikke opp på en høy kant (1-2m over hodehøyde-spranget) | Kanten er for høy for et rent hopp; karakteren skal *gripe* den | Kantgrep er automatisk (auto-mantle): hold W inn mot kanten og hopp - karakteren drar seg opp. Kanttoppen må være `riseMin..riseMax` (0.6-2.2m) over føttene og ha takklaring. Juster `physics.mantle.{reach,riseMin,riseMax}` ved behov; sett `physics.mantle.auto:false` for manuell Space-i-lufta |
| Stort objekt (mast, tårn) er ikke synlig fra andre ender av dekket | For lavt/tynt | Master ≥12m, flammer/lys ≥5m diameter, emissive + punktlys for distansesynlighet |
| `primitive: 'sphere'` gir TS-feil «Source has 1 element(s)» | Type krever 3-tuple selv om kommentar sier `[r]` | Bruk `size: [r, r, r]` |

---

## 6.1 Utendørs/skumrings-sjekkliste

`outdoor-dusk`, `outdoor-night` og `preset: 'open'` gir **svært svak** basebelysning. Et dekk/felt som bare bruker disse presetene ser nær svart ut. For alle utendørs-spill med `timeOfDay < 0.3` eller `> 0.7`:

- [ ] **Minst én `HemisphereLight`** som fill (int ≥1.0) — gir grunnlys slik at objekter ikke drukner i skygge.
- [ ] **Minst én `DirectionalLight`** (int ≥1.4) som «måne»/sol-fill hvis scenen har signatur-objekter som må leses på avstand.
- [ ] **Lamper/lyskastere som synlige objekter**, ikke bare lyskilder. Bygg mast + arm + boks-hus + emissive front-glass + `SpotLight` inne i huset. Eksempel: `src/games/oljeplattform/OljeplattformAssets.ts` (`addFloodlight`-helper).
- [ ] **Emissive signatur-objekter** (flammer, varsellys, spak-skilt) må bruke raw THREE.Mesh + `MeshStandardMaterial({ emissive, emissiveIntensity: 2-5 })`. `addProp` støtter ikke dette.
- [ ] **Signatur-objekter dimensjoneres for synlighet**: Master ≥12m. Flammer ≥5m høye. Emissive materialer ≥2.5 intensitet. Punktlys på flammer ≥100 intensitet, distanse ≥30m.
- [ ] **Distanse-test**: stå ved motsatt ende av scenen ved spill-start. Er hovedobjektene gjenkjennelige som det de skal være?

**Anti-eksempel (det jeg gjorde først i oljeplattform-spillet):**
```ts
// Mast 8m med 0.9m "flamme"-sfære, color 0xff7020 (ingen emissive).
// Resultat: en brun klump på toppen av en stang. Umulig å se på avstand.
```

**Riktig:**
```ts
// Mast 15m + tre emissive kjegler i stigende opacity + PointLight int 180.
// Lagt inn pulserende animasjon via registerUpdate for liv.
```

---

## 6.2 Art direction (Fase 8)

Et spill ser «elegant» ut når fargene er disiplinerte og scenen er komponert - ikke når
det er mange lys. Følg disse prinsippene:

- **Én palett per spill.** Samle scene-objektfargene i en `Palette.ts`:
  `export const PALETTE = { gold: 0xd4a017, blood: 0x7a1f1f, iron: 0x4c4654, ... } satisfies GamePalette`.
  Bruk PALETTE-konstantene overalt i stedet for løse hex-tall. Det gir et sammenhengende
  fargespråk og gjør det trivielt å justere stemningen. **INGEN LUT/color-grading** - alle
  spill deler den globale looken; paletten styrer kun objektfarger.
- **Silhuetter mot en fog-matchet himmel.** Sett `visual.skyOptions` (turbidity/rayleigh) så
  himmelen matcher tåkefargen. Fjerne figurer/fjell blir da rene silhuetter - billig dybde.
  Solnedgang: `timeOfDay: 0.7+` + `skyOptions: { turbidity: 12, rayleigh: 3.5 }`.
- **Glød via sprites, ikke mange PointLights.** Bruk `addGlowSprite`/`addCampfire` for bål,
  fakler, vinduer og magi. Hvert ekstra PointLight koster på lav tier; en additiv sprite er
  nesten gratis. Reserver PointLights til de få lyskildene som faktisk må kaste lys.
- **Fog som komposisjonsverktøy.** Tåke skjuler kartkanten, gjør crowds «uendelige» og
  fokuserer blikket. La kolonner/fjell forsvinne inn i tåka i stedet for å ende brått.
- **flatShading + vertex-farger** (terreng) gir en bevisst fasettert, illustrativ look som
  er billigere enn texturer og matcher motorens øvrige stil.

---

## 6.3 Automatisk LOW-baseline (Fase 9)

På lav-tier (Chromebook-baseline) er ekte skygger, bloom og post-prosessering AV. Motoren
kompenserer nå **automatisk** med tre billige grep så scenene ikke ser flate ut. Du trenger
ikke gjøre noe — dette gjelder alle spill bygget med de deklarative builderne:

- **Blob-kontaktskygge.** `addProp`, `addInteractable`, `addDoor` og NPC-er (`addNPC`) får et
  mykt gradient-plan lagt under seg når motoren kjører på low-tier (`getQualityTier() === 'low'`).
  Det grunner objektene mot bakken så de ikke "flyter". På medium/high gjør ekte skygger jobben,
  så blobben legges ikke til. Logikken bor i `declarative/builders/_util.ts` (`addGroundShadow`).
  - Den hoppes over for objekter som ikke hviler på bakken (bunn > 0.4 m over terreng/gulv), så
    vegg-fakler, vindusgitter og hyller får ingen feilplassert blob.
  - `addPickup` får **ikke** blob (itemet forsvinner inn i inventaret ved opplukking).
- **Vertex-AO i rom.** `buildRoom` baker en lett ambient-okklusjon inn i vertex-fargene: vegger
  mørknes nær gulvet og gulvet mørknes mot kantene. Gir dybde i hjørner uten shadow maps. Bakt
  én gang, null runtime-kost, og virker på alle tier.
- **Gradient-himmeldome.** Scener som ikke bruker `sky: 'procedural'` får en billig vertikal
  gradient-dome (`systems/SkyDome.ts`) i stedet for flat bakgrunnsfarge. Horisontfargen settes
  lik fogfargen, så fjerne objekter blir rene silhuetter. I lukkede rom er domen occludert (gratis).

**Hva betyr dette for deg som bygger spill?** Du får penere lav-tier-scener uten ekstra arbeid.
Bygg fortsatt med disipinert `Palette.ts` og fog-matchet himmel (§6.2) — baselinen erstatter ikke
god art direction, den hever bunnlinjen.

---

## 7. Quality Gates

Kopier denne sjekklisten til PR-beskrivelsen din. Alle punkter skal være ✓.

**Pedagogisk grunnlag:**
- [ ] Blueprint finnes i `docs/Design documents/minigames/[id]-blueprint.md` og er markert `Approved`
- [ ] `config.learningGoals` matcher blueprintens læringsmål (1-3 konkrete mål)
- [ ] Suksesskriteriene fra blueprinten kan observeres i spillet (dialog, quest, endText)
- [ ] `config.curriculumTags` peker på LK20-kompetansemål fra blueprinten

**Teknisk kvalitet:**
- [ ] `npm run build` passerer uten TypeScript-feil
- [ ] `npm run dev` kjører; åpne spillet, **konsollen er tom for warnings** (eller bare dokumenterte presets-URL-mangler)
- [ ] `ConfigValidator` rapporterer ingen CRITICAL-issues (INFO kan ignoreres etter vurdering)
- [ ] Ingen raw `new THREE.*` eller `scene.add` i `*Assets.ts` (unntak: `addRawMesh` i dokumenterte edge-cases)
- [ ] Alle dialog-IDer følger `{npcId}_*`-konvensjonen for fler-NPC-spill
- [ ] Alle `itemId`-referanser matcher `config.items`
- [ ] Alle flagg-referanser er dokumentert (det er klart hvor hver flag settes)
- [ ] Spilleren kan gjennomføre minst én sluttvariant fra start til `endText`
- [ ] Alle valg-stier leder til minst én slutt (ingen dead-ends)

**Språk og innhold:**
- [ ] Norsk tekst bruker riktige tegn (å/ø/æ), korrekt grammatikk
- [ ] Tekst er forståelig for en 14-åring
- [ ] Thumbnail viser spillet i galleriet (eller tom string er dokumentert ok)

**Robusthet:**
- [ ] Save/reload fungerer: spill litt, lukk, åpne igjen - state er intakt
- [ ] Null tom-scene-bug: hvis spilleren starter på et uventet sted, sjekk `player.startPosition`
- [ ] Audio-kall krasjer ikke når preset-URL er null (skal være stille no-op)
- [ ] Ingen synlig FPS-drop under normal bruk på Chromebook (1366x768)

> **Hva ConfigValidator fanger automatisk:** duplikate IDer, ugyldig `characterType`,
> dialog-array uten fallback, quest-prerequisites som peker på ikke-eksisterende quest,
> route/behavior/detection som refererer ukjent character, spawn utenfor rom,
> kamera-bak-vegg (tredjeperson), deklarative flagg-inkonsistenser.
> **Hva den IKKE fanger** (må verifiseres manuelt): låste dører der flagget aldri settes
> i noen dialog-action, `setPhase`/`triggerEnd`-kjeder som stopper opp, flagg-typos
> i action-callbacks (disse kompilerer men matcher aldri).

---

## 8. Common AI Mistakes

### 8.1 Bruker raw Three.js i setupScene

**Feil:**
```ts
const mesh = new THREE.Mesh(...);
mesh.userData.solid = true;
engine.scene.add(mesh);
```

**Riktig:**
```ts
addProp(engine, { id: 'thing', model: 'crate', pos: [0, 0, 0] });
```

### 8.2 Dialog-ID uten NPC-prefix i fler-NPC-spill

**Feil:**
```ts
dialogs: { greeting: {...}, progress: {...} }   // hvilken NPC?
```

**Riktig:**
```ts
dialogs: {
    sokrates_greeting: {...}, sokrates_progress: {...},
    kriton_greeting: {...}, kriton_progress: {...},
}
```

### 8.3 Glemmer å legge item i config.items

**Feil:**
```ts
addPickup(engine, { itemId: 'poison', ... });  // ikke i config.items
```

Validator kaster FATAL. Legg til:
```ts
items: [{ id: 'poison', name: 'Gift', description: '...', stackable: false }]
```

### 8.4 Setter flagg i dialog uten å kjøre triggerEnd

**Feil:**
```ts
choices: [{ text: 'Drikk', action: () => engine.setFlag('drakk', true) }]
// slutt-tekst vises aldri
```

**Riktig:**
```ts
choices: [{ text: 'Drikk', action: () => {
    engine.setFlag('drakk', true);
    engine.setPhase('valgt');
    engine.schedule(() => engine.triggerEnd(), 2000);
}}]
```

### 8.5 Bruker setTimeout i stedet for engine.schedule

**Feil:**
```ts
setTimeout(() => engine.triggerEnd(), 2000);  // lekker hvis motor disposes
```

**Riktig:**
```ts
engine.schedule(() => engine.triggerEnd(), 2000);
```

### 8.6 Overstyrer material uten å vite det

**Feil:**
```ts
addProp(engine, { model: 'bench', material: 'iron' });  // tre-benk i jern?
```

Model-preseter har default-materialer. Overstyr kun hvis du er sikker.

### 8.7 Dialog-variants uten fallback

**Feil:**
```ts
sokrates_greeting: [
    { speaker: 'S.', text: '...', condition: { flagsRequired: ['a'] }, choices: [...] },
    { speaker: 'S.', text: '...', condition: { flagsRequired: ['b'] }, choices: [...] },
]
// ingen fallback - hvis verken a eller b, stalle
```

**Riktig:** legg til en variant uten `condition` - motoren sorterer automatisk sist.

### 8.8 NPC-er defineres i config.characters mens addNPC kalles

**Feil:**
```ts
config: { characters: [sokratesCfg] }
setupScene: (engine) => addNPC(engine, { id: 'sokrates', ... })  // dobbelt!
```

Velg ett sted. Anbefaling: la `config.characters: []` være tom, bruk `addNPC` i setupScene.

### 8.9 Feil plassering av player.startPosition

Det finnes to varianter av denne bommen:

**Variant A - utenfor rommet:** `player.startPosition: [20, 0, 20]` mens rommet går fra -4 til 4 → spiller spawner utenfor veggene.

**Variant B - for nær vegg (camera clip):** `player.startPosition: [0, 0, 3.5]` i et 8x8-rom (vegg ved Z=4) → spiller er teknisk innenfor, men tredjeperson-kameraet står ~3m bak ved Z~6, utenfor rommet. Resultat: scenen er nesten usynlig ved start.

**Riktig:** Plasser spilleren nær midten. Minst 2m fra veggen bak spilleren (som regel sørveggen, siden kameraet starter sør for spilleren). For et 8x8-rom: `[0, 0, 0]` eller `[0, 0, 0.5]` er trygt.

### 8.10 Låst dør uten noe som setter flagget

**Feil:**
```ts
doors: [{ wall: 'north', openFlag: 'escaped' }]
// ingen puzzle eller dialog setter 'escaped'
```

Validator oppdager ikke dette ennå. Dobbelsjekk at hver låst dør har minst én mekanisme som låser den opp.

### 8.11 `primitive: 'sphere'` med 1-element size-array

**Feil:**
```ts
addProp(engine, { model: { primitive: 'sphere', size: [0.9], color: 0xff7020 }, pos: [0,1,0] });
// TS-feil: Source has 1 element(s) but target requires 3.
```

**Riktig:**
```ts
addProp(engine, { model: { primitive: 'sphere', size: [0.9, 0.9, 0.9], color: 0xff7020 }, pos: [0,1,0] });
```

Typen krever `Vec3 | [number, number]` selv om kode-kommentaren i `declarative/types.ts` sier `[radius]`. Runtime bruker `size[0]` som radius, men typesystemet krever tuple-lengde ≥2.

### 8.12 Blanding av `DialogNode.onEnd` og `DialogChoice.action`

**Feil:**
```ts
gunnar_flaring: {
    speaker: 'Gunnar',
    text: '...',
    action: () => engine.setFlag('x', true),   // ✗ action hører til DialogChoice, ikke DialogNode
    choices: [...]
}
```

**Riktig:**
```ts
// Node-nivå (fires når hele dialogen lukkes):
gunnar_flaring: {
    speaker: 'Gunnar', text: '...',
    onEnd: () => engine.setFlag('x', true),
    choices: [...]
}

// Choice-nivå (fires når spilleren velger akkurat det):
choices: [{ text: 'Ja', next: null, action: () => engine.setFlag('x', true) }]
```

### 8.13 Usynlig 0.01m-hitbox for `addInteractable`

**Anti-pattern:**
```ts
addInteractable(engine, {
    id: 'lever-interact',
    model: { primitive: 'box', size: [0.01, 0.01, 0.01], color: 0x000000 },
    pos: [...],
    onInteract: () => {...},
});
// Resultat: en 1cm svart kube midt i scenen som collider. Fungerer, men hacky.
```

**Riktig:** plasser `addInteractable` på det faktiske visuelle objektet (gi interactable-meshen en synlig model som *er* spaken/panelet/ventilen). Eller bygg det visuelle med `addProp`-kjeder og bruk `engine.registerInteract(mesh, {...})` på den mest sentrale meshen. Se §9.4.

### 8.14 Glemmer `setCharacterMarkerVisible` etter dialog

`questMarker: true` i `addNPC` setter startverdi. Markøren forsvinner *ikke* automatisk når spilleren snakker med NPC-en. Motoren vet ikke når du anser NPC-en som «ferdig-snakket-med».

**Riktig:** kall `engine.setCharacterMarkerVisible(npcId, false)` i `onEnd` på intro-dialogen, eller i den interactable/puzzle-handleren som markerer neste fase av quest. Sett den til `true` igjen hvis NPC-en får nytt å si senere.

### 8.15 Glemmer `playerJump: true` ved høydeforskjeller

Default `physics.playerJump` er `false`. Spillet trenger **eksplisitt `playerJump: true`** i `GameConfig.physics` i disse tilfellene:

- Utendørs/åpne verden (`preset: 'open'`)
- Spill med trappeplatå, forhøyet gulv eller hevede overflater
- Enhver scene der spilleren må klatre > ~0.1m for å komme videre

Hvis spilleren møter en usynlig vegg der det visuelt ser ut som en lav kant, er manglende `playerJump: true` den vanligste årsaken.

Sett `playerJump: false` kun i *strengt* interiør-spill der bakken er helt flat og hopp aldri trengs.

**Bevegelsesfart og kantgrep (mantle):** `GameConfig.physics` styrer også horisontal fart og
automatisk kantgrep:

```ts
physics: {
    playerJump: true,
    walkSpeed: 6,   // default 6 (m/s)
    runSpeed: 11,   // default 11 (m/s, Shift)
    mantle: {
        auto: true,     // default true - karakteren griper en kant automatisk når den
                        //   hopper inn mot den; ingen ekstra tastetrykk
        reach: 0.8,     // hvor langt foran kanten registreres (m)
        riseMin: 0.6,   // kanttopp må være minst så høyt over føttene (under = "flatt")
        riseMax: 2.2,   // ... og høyst så høyt (over = for høy å dra seg opp på)
    },
}
```

Auto-grip lar eleven komme opp på kanter som er for høye for et rent hopp (1-2m): hold W inn mot
kanten og hopp, så drar karakteren seg opp av seg selv. Alle feltene er valgfrie - utelat
`physics`/`mantle` helt for standardoppførselen. Sett `mantle.auto:false` hvis et spill heller
vil ha manuelt kantgrep (Space-i-lufta inn mot kanten).

### 8.16 Dialog-tekst lover NPC-handling som aldri skjer

Klassisk feil: NPC sier "Følg meg" eller "Jeg henter det" i dialog, men ingen kode flytter NPC-en. Dialogen slutter og NPC-en står stille — spilleren vet ikke at de skal gå selv.

**Riktig**: Kall `engine.assignRoute` (NPC beveger seg) eller `engine.setPlayerMode` (spilleren låses til å følge NPC-en) i `onEnd`/`action`:

```ts
// NPC leder spilleren et sted
onEnd: () => {
    engine.assignRoute({
        characterId: 'guide-npc',
        waypoints: [[0, 0], [0, -20]],
        mode: 'once',
        speed: 1.2,
    });
},

// Alternativ: spilleren "låses" til å følge NPC-en
onEnd: () => {
    engine.setPlayerMode('scripted', { followCharacterId: 'guide-npc', followSpeed: 1.2 });
},
```

Hvis NPC-en ikke trenger å bevege seg: endre dialog-teksten til "Gå inn" / "Jeg venter her" i stedet for "Følg meg".

### 8.17 Håndrullet flicker/vaiing i spillets update-loop (Fase 8)

Eldre spill duplikerte samme bål-flicker og fane-vaiing i sin egen `registerUpdate`:

```ts
// FEIL: sinus-animasjon av bål/fane i spill-koden (duplisert i 3+ spill, lett å få ut av synk)
engine.registerUpdate((_dt, t) => {
    fireLight.intensity = 18 + Math.sin(t * 13) * 4;
    banner.material.uniforms.uTime.value = t;
});
```

**Riktig:** bruk kit-ene - de eier animasjonen internt:

```ts
addCampfire(engine, { id: 'baal', pos: [0, 'terrain', 0] });   // flicker bor i motoren
addWavingFlag(engine, { id: 'fane', pos: [-3, 'terrain', 0] }); // vaiing bor i kit-en
```

Regelen: flicker/vaiing/puls hører hjemme i motoren (`registerAnimatedLight`, kits), ALDRI i
spillets update-loop. Da kan de ikke komme ut av synk og spill-koden forblir deklarativ.

---

## 8b. Loop-spillbare vs kredittrull-spill

Før du kaller `engine.triggerEnd()`: spør om spillet virkelig er *ferdig*, eller om spilleren kanskje vil utforske litt til.

**Kredittrull (`triggerEnd`):** Spillet har en klar definitiv slutt. Ingen grunn til å fortsette. Eksempel: Sokrates har drukket gift. `endText` vises på slutt-skjermen.

**Loop-spillbart (ingen `triggerEnd`):** Hovedquest fullført, men verden er interessant å utforske etterpå. Eksempel: Oljeplattformen — etter eksport-spaken trekkes, brenner flammetårnet og spilleren kan gå rundt, snakke med Gunnar igjen, se systemet i drift.

For loop-spillbare spill:
1. **Ikke kall `triggerEnd`**. Lag i stedet en serie `addMonolog`-feiringer med `engine.schedule`-delay mellom seg.
2. Sett `config.endText` til en kort fallback-streng — vises kun hvis motoren trigger slutt via pause-meny.
3. Oppdater siste quest-phase sin `objective` til noe som «Utforsk plattformen — din første jobb er gjort.» så spilleren vet at fortsettelse er OK.
4. La `questMarker`-flyten forsvinne permanent ved siste flagg.

**Tommelfingel:** Hvis det finnes meningsfull aktivitet (dialog-varianter, områder å utforske, visuell transformasjon) etter hovedhandlingen, velg loop-spillbart. Mini-spill i Eiriksbok skal føles som *plasser*, ikke *filmer*.

---

## 9. Deep-dive (lav-nivå API)

*Du skal svært sjelden trenge dette. Hvis du gjør det: vurder om use-casen er så vanlig at en ny builder burde legges til.*

### 9.1 Direkte mesh-registrering

Hvis du MÅ bygge en mesh manuelt:

```ts
const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
mesh.receiveShadow = true;
mesh.userData.solid = true;                   // for fysikk
mesh.userData.colliderShape = 'cuboid';       // eller 'cylinder' | 'sphere' | 'trimesh'
engine.scene.add(mesh);
```

Eller bruk `addRawMesh`:
```ts
addRawMesh(engine, { mesh, solid: true });
```

### 9.2 Per-frame update

```ts
engine.registerUpdate((dt, elapsed) => {
    // kjøres hver frame
});
```

### 9.3 Timed callback (disposes-safe)

```ts
engine.schedule(() => { /* ... */ }, 3000);   // 3 sekunder
```

### 9.4 Physics runtime-fjerning

```ts
engine.removeStaticCollider(mesh);            // fjerner Rapier-body
```

### 9.5 Direct audio

```ts
engine.playOneShot('/sounds/custom.mp3', { volume: 0.7, position: [0, 1, 0] });
engine.playAmbient('/sounds/ambient.mp3', { loop: true, fadeIn: 1.5 });
```

### 9.6 Cinematic / kamera

Se `src/games/engine/systems/CameraDirector.ts`. Deklarativ API dekker ikke dette - skriv inline.

### 9.7 Fullstendig API-referanse

`src/games/engine/types.ts` - `GameEngineRef`-interfacet. Alle metodene er der.

---

## 10. Referanser

- **Blueprint-spill**: `src/games/blueprint-quest/` - kopier denne
- **Watt-Lab**: `src/games/watt-lab/` - større eksempel (legacy-arkitektur, men fungerer)
- **Declarative API**: `src/games/engine/declarative/README.md`
- **Engine types**: `src/games/engine/types.ts`
- **CLAUDE.md**: `/CLAUDE.md` og `eiriksbok/CLAUDE.md` for prosjekt-konvensjoner

---

## Endringslogg

Denne guiden ble omskrevet fra grunnen av sammen med innføringen av deklarative builders. Gammel guide er tilgjengelig i git-historikk.
