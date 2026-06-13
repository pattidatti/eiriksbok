# Stiklestad 1030 - byggeplan (mini-spill, Fase 8-showcase)

Kort kickoff-plan for å bygge spillet i en ny chat. Spillet skal vise frem **alt** det nye
i motorens Fase 8 (terreng, kits, interaksjonsverb). Les `.agent/workflows/BUILD_GAME_GUIDE.md`
§3.14-3.16 + §6.2 FØR du begynner, og `docs/motor-update.md` "Leveranse Fase 8" for API-ene.

---

## Premiss

Spilleren er en 14 år gammel **vannbærer/budbringer** i kong Olavs leir kvelden før og under
slaget ved Stiklestad, 29. juli 1030. **Tormod Kolbrunarskald** (skalden) er mentor og forteller.
Eleven har ingen makt over selve utfallet, men er midt i kampen: bærer spyd til skjoldborgen,
kaster mot den angripende bondehæren og ser slaget på nært hold. **Slaget skal inneholde vold** -
nærkamp, skjoldborg som brister, sårede menn og Olavs fall vist på skjermen. Hold det historisk og
alvorlig (en ekte tragedie), ikke utbrodert gørr - tilpasset en 14-åring i skolesammenheng.

**Læringsmål** (`config.learningGoals`, skal matche denne planen):
1. Hvorfor slaget sto: rikssamling + kristning (Olav) mot bondehøvdinger + Knut den mektige.
2. Olav Haraldsson blir Olav den hellige - helgenkulten og Nidaros.
3. Hva kristningen endret i Norge.

## Språk- og innholdskrav (ufravikelig)
Bokmål, forståelig for en 14-åring. Korte, aktive setninger. Riktige norske tegn (å/ø/æ).
**Aldri em-dash/tankestrek** - bruk bindestrek. Hver replikk på egen linje. Sammenligninger
sparsomt. Lys glassmorphism i UI; spillets dempede skumringspalett er bevisst.

---

## Filstruktur (`src/games/stiklestad-1030/`)
- `StiklestadPalette.ts` - `export const PALETTE = {...} satisfies GamePalette` (sen-juli-kveld:
  gull, lyng, jern, blodrød). **Referanseimplementasjon for GamePalette-konvensjonen.**
- `StiklestadMap.ts` - `buildTerrain`-konfig + LAYOUT-konstanter (mønster fra `MarsjenMotRomaMap.ts`).
- `StiklestadConfig.ts` - `GameConfig` (player, quests, puzzle, intro, openingCinematic(+End), audio).
- `StiklestadAssets.ts` - `setupScene`-wiring: kart, kits, NPC-er, mål/launcher, atmosfære-bue.
- `StiklestadDialogs.ts`, `StiklestadMonologs.ts`.
- Blueprint: `docs/Design documents/minigames/stiklestad-1030-blueprint.md` (skriv først).
- **Registrer**: `GAME_REGISTRY` (`src/pages/GamePage.tsx`) + `HISTORICAL_GAMES` (`src/pages/MiniGamesPage.tsx`).

---

## Kart (Pakke A - terreng)
`buildTerrain(engine, { id, size: 180, seed, ... })` med:
- `features`: `flatten` (leiren, sør) + `plateau` h=7 (gangbar **rygg** tvers over midten = utsiktspunkt)
  + `rim` (fjellring i horisonten). `paint`-sone for tråkket leirjord.
- `palette` fra `StiklestadPalette`. `lights: 'outdoor-dusk'`.
- `visual.skyOptions` (dusk, fog-matchet) + `timeOfDay` 0.70 som faller mot 0.45 i slag-fasen.
- Alt plasseres med **`'terrain'`-sentinel** i pos (`[x, 'terrain', z]`), så telt, bål, faner,
  NPC-er og stativ snapper til bakken. `player.startPosition.y` MÅ ligge over leir-platået.

## De 5 fasene (hver knytter en Fase 8-feature)

| Fase | Innhold | Fase 8-feature |
|---|---|---|
| `leiren` | Spilleren våkner ved bålet. Tormod introduserer striden. | **zone-intro** (`IntroConfig.type:'zone'` "Stiklestad - 29. juli 1030") + **openingCinematic med `openingCinematicEnd.glideToPlayerMs`** (kameraet glir fra leir-vista inn i spilleren). 3× **`addCampfire`** + 2× **`addWavingFlag`** (Olavs korsmerke). |
| `treningen` | Øv spydkast på blinker mens dialog forklarer hvorfor bøndene reiser seg. | **`addLauncher`** (kind:'spear') + 3× **`addTarget`** (`reactions:['knock']`, `resetAfterMs`). Vis **charge-throw** (hold F = lad, bue-preview). |
| `kvelden` | Tre bål-samtaler: tro, tvil, ettermæle. Valgene farger slutt-teksten. | Bål-samtaler via NPC-dialog; sett flagg som `endText`-funksjonen leser. `addZoneTitle` ved overgang. |
| `slaget` | Skjoldborgen møter bondehæren på ryggen. Spilleren kaster spyd mot angriperne mens nærkampen raser; menn faller på begge sider; Olav rammes og faller. | **`addCrowd` static (~600) + march-kolonne med `snapToTerrain:true`** (angripende hær følger ryggen). **Charge-throw/`addLauncher` brukes i ekte kamp** mot fiende-mål. `cameraShake`/`screenFlash` ved sammenstøt. Vær/lys/lyd-bue (`setWeather`/`setTimeOfDay`/trommer + kampstøy). **Volden vises** - alvorlig, ikke utbrodert. |
| `etterspillet` | Tidshopp: stille dal, en pilegrim, jærtegn, Nidaros. MCQ kvitterer læringsmålene. | `playSequence`/cinematic + **station- eller mcq-puzzle** som syntese. Bål slukkes (`setLit(false)`). |

---

## Fase 8-feature-sjekkliste (spillet skal bruke ALT dette)
- [ ] **A** `buildTerrain` (rygg/leir/fjellring), `'terrain'`-sentinel på all plassering, `getTerrainHeight` ved behov.
- [ ] **A** `addCrowd` med `snapToTerrain: true` (bondehæren - static + march på ryggen).
- [ ] **B** `GamePalette` (`StiklestadPalette.ts`), `visual.skyOptions` (dusk/fog-matchet).
- [ ] **B** `addCampfire` (×3), `addWavingFlag` (×2), `addGlowSprite` (fakler), `addZoneTitle`.
- [ ] **B** `IntroConfig.type: 'zone'` + `openingCinematic` med `transition:'glide'` + `openingCinematicEnd`.
- [ ] **C** `addLauncher` (spyd) + `addTarget` (×3, knock + reset), `PickupOptions.charge` på kaste-økser.
- [ ] Quest/`questDefs`, `puzzle` (syntese), `audio.tracks` (regn/vind/trommer/togfri klokke), monologer.

## Verifisering
1. `npm run dev` → `/oving/spill/stiklestad-1030`. Spill gjennom alle 5 faser.
2. Bekreft: terreng-kollisjon holder (ingen gjennomfall), NPC-er/crowd følger bakken, charge-throw-
   previewen treffer der spydet lander, blinkene velter + resetter, glide-intro lander uten kamera-hopp.
3. Lav tier (`getQualityTier()→'low'`): 30+ fps i `slaget` (crowd + terreng samtidig).
4. `npx tsc -b` + `npx eslint src/games` grønt. Screenshots til `.screenshots/` (slett etter bruk).
5. Avslutt artikkelen/spillet med quiz-syntese (fast landing).
