---
description: Lag et rikt, direkte-interaktivt 3D-mikrospill som kjører inline i en artikkel eller læringssti. Bruk dette når spillet skal bo MIDT i innholdet (ikke fullskjerm), bygd på interaksjons-toolkitet i src/components/microgames/kit/.
---

# Skill: Build Micro-Game

Bruk denne skillet når du skal lage et **mikrospill** - et lett, selvstendig 3D-spill som kjører
**inline** i en artikkel eller et læringsstisteg. Et mikrospill er en kort, romlig "aha"-opplevelse
på 1-3 minutter der eleven **interagerer direkte med en 3D-verden**: klikker objekter, drar dem på
plass, justerer en spak, og ser verdenen forvandle seg.

---

## Mikrospill vs. den tunge 3D-motoren - velg riktig spor

| | Mikrospill (dette sporet) | Full 3D-motor (`src/games/engine/`) |
|---|---|---|
| **Bor** | Inline i artikkel/sti | Egen rute `/oving/spill/:id` |
| **Stack** | React + R3F (`@react-three/fiber` + `drei`) + toolkit | Rå Three.js + Rapier3D WASM |
| **Vekt** | Lett, lazy-lastet, Chromebook-vennlig | Tung (~1 MB WASM), fullskjerm, pointer-lock |
| **Lengde** | 1-3 min | 10-20 min |
| **Guide** | Denne fila | `.agent/workflows/BUILD_GAME_GUIDE.md` |

Skal spillet ligge midt i en artikkel? → mikrospill. Skal det være en egen verden å gå rundt i? →
full motor. **Embed aldri den tunge motoren i en artikkel.**

---

## Kjernefilosofi: rik, direkte interaksjon - ikke bare knapper

Et mikrospill er en **levende 3D-verden eleven manipulerer**, ikke et bilde med tre knapper ved
siden av. De tidligste mikrospillene var alle samme tynne form ("trykk tre knapper etter
hverandre"). Det er ÉN gyldig byggekloss, men ikke målet. Sikt høyere:

- **La eleven ta i verdenen.** Klikk objekter direkte, dra ting på plass, juster en spak og se
  konsekvensen i sanntid. Toolkitet (`src/components/microgames/kit/`) gjør dette trivielt og
  Chromebook-trygt - bruk det.
- **Bygg en verden, ikke en modell.** Lag-på-lag prosedyrale mesher: terreng, hus, figurer,
  kjøretøy, vann, røyk. Lavpoly og billig - men en scene, ikke ett objekt. `kit/scene-parts`
  har ferdige deler (`Building`, `Figure`, `Tree`, `WaterPlane`, `Smoke`, `GroundPlane`).
- **La eleven endre tilstanden, og animer konsekvensen.** Den sterkeste mekanikken: et grep → en
  synlig forvandling → en aha. Driv scenen av enkel tilstand (`useStage` eller en slider-verdi) og
  la hvert delobjekt dempe (`damp`) mykt mot mål utledet av tilstanden.
- **Sikt mot lyspæra i selve interaksjonen.** Mekanikken ER pedagogikken. I flaggskipet
  `VikingShip3D` bygger eleven skipet selv - klinker bordganger, reiser masten, og morfer skroget
  mellom langskip og knarr - og kjenner dermed på kroppen hvorfor klinkbygging + kjøl gjorde det
  samme håndverket til både krigsskip og handelsskip.

### Knapper og 3D-klikk utelukker ikke hverandre

Direkte 3D-interaksjon er nå førsteklasses og **oppmuntres**. Men kombiner gjerne: en
`SceneSlider`/`ChoiceRow` under vinduet sammen med klikkbare objekter og drag i scenen. Bruk det som
passer læringsmålet. Den gamle regelen "unngå 3D-klikk, bruk bare knapper" gjelder ikke lenger -
toolkitet løser trackpad-problemet (se under).

### Velg en iscenesettelse som matcher emnet - ikke standard-dioramaet

Toolkitets default-deler (`GroundPlane` + `Building`/`Tree`/`Figure`) gjør det lett å lage en bygd
på en grønn åker. Det er riktig for et konkret sted (en vikinghavn, en fabrikk), men for abstrakte
eller kosmiske emner (tid, tro, ideer, verdensrommet) ser «noen greier ute på en åker» billig og
malplassert ut. **Bestem iscenesettelsen før du fyller den med deler:** hva er den naturlige scenen
for dette emnet? En klode som svever i kosmos? Et objekt i et tomt rom? En lysstråle i mørket? Velg
staging som bærer emnet, så blir resten immersivt nesten gratis. Se `TidensFormer3D` - eskatologi som
en levende klode i et lysende kosmos, ikke en haug på en plen.

---

## Interaksjons-toolkitet (`src/components/microgames/kit/`)

Importer alt fra `./kit`. Dette er den autoritative verktøykassa - bygg nye spill på den.

### Oppsett & layout
- **`MicroGameScaffold`** - standardoppsettet: lys ramme + 3D-vindu i FULL bredde + kontroller UNDER
  vinduet (aldri oppå scenen). Gir den polerte layouten gratis.
  ```tsx
  <MicroGameScaffold
      title="Bygg vikingskipet" subtitle="..." estimatedSeconds={160} onRetry={reset}
      scene={<MyScene stage={stage} />}
      canvas={{ idle: stage === 0, camera: { position: [9,7,11], fov: 40 }, background: '#bfe0f2' }}
      overlays={<><SceneBanner message={banner} /><SceneBadge>{era}</SceneBadge></>}
  >
      <ChoiceRow items={...} onSelect={...} />   {/* kontroller under vinduet */}
  </MicroGameScaffold>
  ```
- **`MicroCanvas`** - standardisert R3F-Canvas (lys, skygger, fog, OrbitControls-preset). Håndhever
  delt visuell look (ingen LUT). Bruk via scaffold, eller direkte hvis du trenger egen layout.

### Direkte 3D-interaksjon (kjernen i "rik interaksjon")
- **`Interactive`** - gjør ethvert 3D-objekt klikkbart med innebygd juice (pekefinger, scale-spring,
  valgfri forstørret klikkflate `hitArea` for trygg trackpad-treffing). Render-prop gir deg
  tilstanden så du kan farge mesh-ene:
  ```tsx
  <Interactive onSelect={pick} state={chosen ? 'correct' : 'idle'} hitArea={[1.5,1.5,1.5]}>
      {(s) => <mesh><boxGeometry/><meshStandardMaterial color={s==='hover'?'#fbbf24':'#888'} /></mesh>}
  </Interactive>
  ```
- **`Hotspot`** - flytende, kamera-vendt klikkmarkør i 3D-rom. Stor tap-target + pulse + valgfri
  etikett. Bruk for "klikk her"-punkter uten at eleven må treffe en liten mesh presist.
  ```tsx
  <Hotspot position={[0,1.3,0]} onSelect={addPlank} label="Klink bordgangen" />
  ```
- **`Draggable`** - dra et objekt langs bakkeplanet (generøs trackpad-toleranse, valgfri
  `snap`/`bounds`, skrur av kamerarotasjon under draget). Gi draggable-objekter en **romslig usynlig
  gripeflate** (et `meshBasicMaterial transparent opacity={0}`-barn) så de er lette å ta tak i.
  ```tsx
  <Draggable position={[-5,0,4]} bounds={{minX:-7,maxX:4}} snap={1} onDrop={(p)=>place(p)}>
      <mesh><boxGeometry args={[1.4,1.2,8]} /><meshBasicMaterial transparent opacity={0} /></mesh>
      <KeelLog />
  </Draggable>
  ```

### Input-widgets under vinduet
- **`ChoiceRow`** - vannrett rad med valgkort (done/active/locked). **`StepTracker`** - "Steg X av N".
- **`SceneSlider`** - kontinuerlig spak som styrer scene-tilstand i sanntid (vannstand, år, bredde).
  Helt annen interaksjon enn diskrete knapper - bruk den for "morf og se".
- **`ToolPalette`** - velg verktøy, klikk så i 3D for å bruke det (plassere, rive).

### Output-overlegg (oppå scenen, `overlays`-slot)
- **`SceneBanner`** (transient toppmelding), **`SceneBadge`** (hjørne-etikett), **`DragHint`**
  (idle-hint), **`SceneFact`** (faktakort under), **`WinScreen`** (trofé + reset/gå-videre).

### Hjelpere
- **`damp(cur, target, dt, speed)`** / **`dampV3`** - myk demping mot mål i `useFrame`. Fundamentet
  for animasjon uten fysikk.
- **`useStage(total)`** - liten fler-stegs tilstandsmaskin (`stage`, `advance`, `reset`, `atEnd`).

---

## Avanserte lag - gjør spillet unikt, immersivt og vanedannende

Toolkitet har fem lag til som løfter et mikrospill fra «funker» til «wow». Bruk det
som tjener læringsmålet - ikke alt på en gang.

### Signaturlook (visuelt imponerende)
- **`THEMES`** - era-paletter (`viking`, `roman`, `industrial`, `egypt`). Mat `sky`/`fog`
  til `MicroCanvas` og bruk fargene i scene-parts, så hvert emne får distinkt identitet.
- **`ToonMaterial`** - flat, tegneserieaktig storybook-look: `<mesh><boxGeometry/><ToonMaterial color="#a8412f" /></mesh>`.
- **`KitOutline`** - tegneserie-kant; legg som siste barn i et `<mesh>` for å fremheve valgte objekter.
- **Kontaktskygge + vignette** er på automatisk via `MicroCanvas`/`MicroGameScaffold` (slå av med `canvas={{ contactShadows: false }}`).
- **Egen himmel-gradient.** `MicroCanvas` tar bare én bakgrunnsfarge. For en filmatisk himmel: legg en
  stor `sphereGeometry` (radius ~60) med `side={THREE.BackSide}`, `fog={false}` og en `CanvasTexture`
  med en vertikal gradient (kjølig topp -> varm horisont). Holder seg lys og respekterer lys-stil-regelen.
- **Atmosfære-glød.** En litt større kule rundt et objekt med `meshBasicMaterial` (`transparent`,
  `side={THREE.BackSide}`, `blending={THREE.AdditiveBlending}`, `depthWrite={false}`) gir en myk halo.
  La fargen `damp`e med tilstanden for å vise liv/forfall/forvandling.
- **Dybde uten mørke.** Drivende skybanker (store, flate, halvgjennomsiktige kuler) og svake lys-
  partikler («motes») gir rom og atmosfære mens scenen forblir lys. **Dramaet skal komme fra at *emnet*
  forandrer seg** (verden brenner, byen vokser), ikke fra en mørk UI - mørkt tema krever eksplisitt ønske.
- **Liv i ro.** `useIdleMotion` (svev) pluss en langsom egenrotasjon på hovedobjektet gjør at verdenen
  lever selv før eleven gjør noe.

### Game-feel / juice (gøy + vanedannende)
- **`useShake()`** - trauma-basert rist; fest `ref` til en `<group>` rundt scenen, kall `shake(0.7)` ved treff.
- **`usePop()`** - spring-pop på skala; `pop()` ved suksess/plassering.
- **`Burst`** - instanserte suksess-partikler; avfyres når `trigger`-tallet endres: `<Burst position={[0,2,0]} trigger={winCount} />`.
- **`useScore()` + `ScoreHUD`** - combo/streak/stjerner. `hit()`/`miss()` -> synlig progresjon og belønning.
- **Magnetisk snap** på `Draggable`: `snapPoints={[[x,z],...]}` + `onSnap` gir tilfredsstillende plassering.
- **`ease`** - easing-funksjoner (outCubic, outBack, outElastic...) for håndlagde tweens.

### Lyd & kamera (immersjon)
- **`useAmbience(preset)`** - ambient lydbed (`waves`/`wind`/`forge`/`crowd`/`forest`). Kall `start()` fra en
  brukerhandling (nettlesere blokkerer autostart). Hold volumet lavt - lyd skal bekrefte, ikke dominere.
- **`CameraRig`** - cinematisk kamera. Innflyvnings-mønster (unngår å sloss med OrbitControls): start kameraet
  langt unna (`canvas.camera.position`), hold `canvas.controls={false}` til `<CameraRig active={!introDone} onArrive={() => setIntroDone(true)} />` er framme, slå så på controls. (VikingShip3D gjør dette.)
- **`useIdleMotion()`** - rolig vugging/svai så verdenen lever selv når eleven ikke gjør noe.

### Pedagogisk kraft (lærerik)
- **`DataReadout`** - live tall som endrer seg mens eleven drar/justerer; gjør årsak-virkning synlig.
- **`SceneQuiz`** - ett-spørsmåls aha-sjekk som kan kobles til scoring (`onResult`).
- **`CompareToggle`** - veksle mellom to tilstander (for/etter, A/B) og se forskjellen direkte.
- **`useHintEscalation({ active, resetKey })`** - eskalerer hint hvis eleven står fast; bruk nivået til å fremheve neste hotspot. `resetKey` (f.eks. `stage`) nullstiller ved framgang.

### Rikdom & unikhet
- **`InstancedField`** - spre hundrevis av kopier (skog, folkemengde, åker, steinur) billig: `<InstancedField count={120} geometry={<coneGeometry .../>} material={<meshStandardMaterial .../>} />`.
- **Flere scene-parts:** `Rock`, `Fire` (flakkende, lyser opp), `Banner` (vaiende), `Gear` (roterende tannhjul, `spin`).

### Robusthet & forfatterstøtte
- **Preview-rute:** test et mikrospill isolert på `/mikrospill` (galleri) og `/mikrospill/<id>` - uten å embedde i en artikkel. Bruk dette når du bygger.
- **Perf-guard:** `MicroCanvas` senker oppløsningen automatisk på svake Chromebooks, og hever den igjen.
- **`prefers-reduced-motion`** respekteres (ingen auto-rotasjon). Kontrollene under vinduet er tastatur-tilgjengelige; gi alltid en knapp/slider-vei i tillegg til rene 3D-klikk der det er mulig.

### Mekanikk-arketyper - bryt ut av «klikk tre ting»
Velg en form som matcher emnet, ikke alltid den samme:
- **Bygg/monter** (VikingShip): dra deler på plass, klikk for å føye til, se det reise seg.
- **Rute/naviger:** legg en vei/forbindelse fra A til B (handelsrute, kabel, akvedukt).
- **Balanser/finn likevekt:** en slider/spak søker et optimalt punkt (pris, vannstand, dose).
- **Sorter-i-3D:** dra objekter i riktige soner/bøtter (kategorier, tidsperioder).
- **Årsakskjede:** utløs en sekvens (dominoer, kjedereaksjon) og se konsekvensen.
- **Grav-fram/avdekk:** fjern lag for å avsløre noe under (arkeologi, geologi).
- **Dyrk/simuler over tid:** la en prosess utvikle seg (befolkning, økosystem, by).
- **Sikt/bane:** juster vinkel/kraft og se en kastebane (katapult, kanon).
- **Modell-sammenlikning (morf-og-se):** representer en abstrakt idé romlig og veksle mellom to
  modeller (`CompareToggle`), så samme system spilles ut ulikt under hver. Eks: samme verden under
  sirkulær vs. lineær tid (`TidensFormer3D`).

---

## Fallgruver (React + R3F i kit-spill)

- **Les aldri `ref.current` under render for å utlede props til mesh-er.** Tidsmarkør, fase og
  lignende som endrer seg i `useFrame` lever i refs - leser du dem i render-kroppen, re-rendrer ikke
  scenen, og ESLint stopper deg (`react-hooks/refs`). Speil i stedet verdien til `useState` fra
  `useFrame`, men kun når den faktisk endrer seg (sammenlikn mot forrige), så du ikke setter state hver
  frame.
- **Ikke muter en `let` inni `useMemo`.** En typisk pseudo-random-generator (`let s; s = ...`) brytes av
  `react-hooks/immutability`. Legg RNG-en som en ren funksjon på modulnivå (se `InstancedField`) og
  kall den i `useMemo`.
- **Animér tilstand med `damp`, driv av én kilde.** Hold sannheten i ett tall (fase / `t` / slider) og
  la hvert delobjekt `damp`e mot mål utledet av den - ikke spre tilstanden utover mange refs.

---

## Design Law (arves fra interaktive komponenter)

- **Lys stil alltid.** `MicroGameScaffold`/`MicroGameFrame` gir amber/lys ramme. Ingen mørk base.
- **Én pedagogisk kjerne.** Definer lyspære-øyeblikket før du koder. Én ting eleven skal forstå.
- **Fem-sekunders-regelen.** Eleven vet hva de skal gjøre innen 5 sek. Ingen velkomstmodal. Bruk
  `DragHint` og en `SceneBanner` til å lose dem i gang.
- **Juicy feedback.** Umiddelbar respons på hvert grep (`Interactive`/`Hotspot` gir det gratis),
  myke `damp`-overganger, spring-finale (`WinScreen`), reset alltid tilgjengelig (`onRetry`).
- **Rik, men lesbar interaksjon.** Sikt mot flere måter å ta i verdenen på (klikk + dra + spak +
  fler-stegs), men hold hver enkelt åpenbar. Mekanikken skal være læringsmålet, ikke pynt.
- **Norsk for en 14-åring.** Korte setninger. Riktige tegn (å, ø, æ). Ingen em-dash/tankestrek.
- **Unik mekanikk.** Ikke kopier et eksisterende spills mekanikk; bygg en ny, tilpasset læringsmålet.
- **Chromebook-først (~1366×768).** Toolkitet løser trackpad-utfordringen: `Hotspot` gir store mål,
  `Interactive`/`Draggable` har generøse klikk-/gripeflater og hover-cursor. Du kan derfor trygt
  bruke direkte 3D-interaksjon - men gi alltid store nok mål, og vurder en knapp/slider under vinduet
  som alternativ vei der det passer.

---

## Slik bygger du ett

1. **Opprett spillet:** `src/components/microgames/<Navn>.tsx`.
   - Default-eksporter en komponent som tar `MicroGameProps` (`{ onComplete, onRetry?, ... }` fra
     `./types`).
   - Bygg scenen på toolkitet: `MicroGameScaffold` + `scene`-tre med `Interactive`/`Hotspot`/
     `Draggable` og `kit/scene-parts`, kontroller under vinduet.
   - Kall `onComplete({ score, completed: true, artifact? })` når spillet er vunnet.
   - Lyd via `useStepSounds()` (`play('correct' | 'advance' | 'complete' | 'drop' | 'pick' | ...)`).

2. **Registrer i registeret** (EKSAKT - dette er det som hindrer "fant ikke spillet"-feil):
   I `src/components/microgames/registry.ts`:
   - Legg til `const <Navn> = lazy(() => import('./<Navn>'));` øverst.
   - Legg en entry i `MICRO_GAMES` med en **kebab-case `id`** (f.eks. `'vikingskip-3d'`), `title`,
     `description`, `estimatedSeconds`, `loader: () => import('./<Navn>')`, og
     `Component: <Navn> as never`. `id`-en er det `gameId` du bruker i innholdet.

3. **Bruk i innhold** - to veier, samme registry, samme `id`:
   - **I en artikkel** (via `ComponentRegistry` → `MicroGameBlock`):
     ```json
     { "type": "component", "name": "MicroGame", "props": { "gameId": "<id>" } }
     ```
   - **I et læringssti-steg** (via `MicroGameStep`):
     ```json
     { "type": "microgame", "microGameId": "<id>", "microGameProps": { } }
     ```

Ingen endring i `ComponentRegistry.tsx` trengs per spill - broen `MicroGame` slår opp `gameId` i
registeret. Du registrerer kun i `registry.ts`.

---

## Sjekkliste før du er ferdig

- [ ] Iscenesettelsen matcher emnet (ikke standard grønn-åker-diorama uten grunn)
- [ ] Bygd på `kit/` (`MicroGameScaffold` + minst én direkte 3D-interaksjon: `Interactive`/`Hotspot`/`Draggable`)
- [ ] Lys ramme, 3D-vindu i full bredde, kontroller under vinduet (ikke oppå scenen)
- [ ] Lyspære-øyeblikket er tydelig og oppnådd; mekanikken ER pedagogikken
- [ ] Rik interaksjon - ikke bare en knapperad. Eleven tar i verdenen.
- [ ] Chromebook-trygt: store nok klikk-/gripeflater (`hitArea`, romslig usynlig gripeboks på draggables)
- [ ] Juicy: umiddelbar respons, myke `damp`-overganger, spring-finale (`WinScreen`), reset (`onRetry`)
- [ ] `onComplete` kalles ved seier
- [ ] Lazy-registrert i `MICRO_GAMES` med kebab-case `id` = `gameId` i innholdet
- [ ] Norsk for 14-åring, riktige tegn, ingen em-dash
- [ ] Testet inline i en ekte artikkel på ~1366×768 (hele flyten gjennomspilt)
- [ ] `npx tsc -b` + `npm run lint` rent

**Referanse-standard:**
- `src/components/microgames/VikingShip3D.tsx` - **flaggskipet**. Viser hele bredden av toolkitet:
  `Draggable` (dra kjølen på plass), `Hotspot` (klink bordgangene, reis masten), `SceneSlider` (morf
  langskip ↔ knarr), fler-stegs forvandling, `CameraRig` (cinematisk innflyvning), `useAmbience`
  (bølgelyd), `Burst` (feiringspartikler ved sjøsetting), pluss kontaktskygge/vignette automatisk.
  Bruk denne som mal for et rikt, direkte-interaktivt byggespill med alle de avanserte lagene.
- `src/components/microgames/Hamskiftet3D.tsx` - **stage-drevet scenespill**: en levende bygd som
  forvandles gjennom tre reformer (knapp-input via `ChoiceRow`-mønsteret, 3D som skuespill). God mal
  når kjernen er "valg → forvandling".
- `src/components/microgames/TidensFormer3D.tsx` - **abstrakt idé, immersiv iscenesettelse**:
  eskatologiens sirkulær-vs-lineær-tid som en levende klode i et lysende kosmos. Mal for å representere
  et abstrakt konsept romlig (`CompareToggle` + tidsdrevet forvandling), med egen himmel-gradient,
  atmosfære-glød og «drama fra emnet, ikke fra mørk UI».
- `TheodosianWalls3D.tsx` / `Colosseum3D.tsx` - enklere "inspiser objektet"-form, fortsatt gyldig for
  små romlige aha-er (eldre kode, ikke bygd på `kit/` enda).
