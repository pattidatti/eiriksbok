# BUILD_GAME_GUIDE.md

**Cookbook for å lage mini-spill til Eiriksbok.** Dette er en oppskrift, ikke en encyklopedi. Følg stegene. Ikke improvisér.

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
    dialogs: {
        sokrates_greeting: { speaker: 'Sokrates', text: 'Hei.', choices: [{ text: 'Hei', next: null }] },
    },
});
```

**Dialog-konvensjon for fler-NPC-spill**: bruk `{npcId}_greeting`, `{npcId}_progress` osv. Motoren åpner `sokrates_greeting` automatisk når spilleren trykker E på Sokrates.

**Variants**: en dialog-verdi kan være array. Da sorteres fallback (uten condition) automatisk sist.

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

`pickup-tool`, `pickup-paper`, `puzzle-win`, `puzzle-fail`, `dialog-open`, `door-open`, `door-locked`, `footstep-wood`, `footstep-stone`, `fire-crackle`, `wind-indoor`, `chains-rattle`, `water-drip`

**Merk**: De fleste audio-presets har ikke registrert URL i MVP. De blir stille no-ops. For å registrere, oppdater `AUDIO_PRESETS` i `src/games/engine/declarative/presets/audio.ts`.

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

---

## 7. Quality Gates

Kopier denne sjekklisten til PR-beskrivelsen din. Alle punkter skal være ✓.

- [ ] `npm run build` passerer uten TypeScript-feil
- [ ] `npm run dev` kjører; åpne spillet, **konsollen er tom for warnings** (eller bare dokumenterte presets-URL-mangler)
- [ ] Ingen raw `new THREE.*` eller `scene.add` i `*Assets.ts` (unntak: `addRawMesh` i dokumenterte edge-cases)
- [ ] Alle dialog-IDer følger `{npcId}_*`-konvensjonen for fler-NPC-spill
- [ ] Alle `itemId`-referanser matcher `config.items`
- [ ] Alle flagg-referanser er dokumentert (det er klart hvor hver flag settes)
- [ ] Spilleren kan gjennomføre minst én sluttvariant fra start til `endText`
- [ ] Alle valg-stier leder til minst én slutt (ingen dead-ends)
- [ ] Norsk tekst bruker riktige tegn (å/ø/æ), korrekt grammatikk
- [ ] Tekst er forståelig for en 14-åring
- [ ] Thumbnail viser spillet i galleriet (eller tom string er dokumentert ok)
- [ ] Save/reload fungerer: spill litt, lukk, åpne igjen - state er intakt
- [ ] Null tom-scene-bug: hvis spilleren starter på et uventet sted, sjekk `player.startPosition`
- [ ] Audio-kall krasjer ikke når preset-URL er null (skal være stille no-op)
- [ ] Ingen synlig FPS-drop under normal bruk på Chromebook (1366x768)

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
