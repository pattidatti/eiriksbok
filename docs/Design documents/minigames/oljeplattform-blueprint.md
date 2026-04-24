# Mini-spill Blueprint: Oljeplattformen

> **Status:** `Built`
> **ID:** `oljeplattform`
> **Mappe:** `src/games/oljeplattform/`
> **Estimert omfang:** `Watt-lab-nivå (~750 linjer)`

---

## 1. Pedagogisk kjerne

- **Fag:** `samfunnsfag` (med historiske koblinger)
- **Målgruppe:** 8.-10. klasse. Eleven har hørt om oljeeventyret, men vet ikke *hvordan* olje faktisk kommer opp fra havbunnen og blir til noe vi kan bruke.
- **Læreplankobling:** LK20 Samfunnsfag - "utforske og drøfte korleis menneska forstår seg sjølve og omverda og ta del i demokratiske prosessar"; "reflektere over korleis geografiske forhold har prega samfunnsutviklinga i Noreg". Olje/gass som grunnlag for norsk velferd.
- **Læringsmål:**
  1. Eleven kan beskrive de tre hovedtrinnene i oljeproduksjon på plattform: **brønnhode → separator → eksport**.
  2. Eleven kan forklare hvorfor olje og gass må skilles før det sendes i land, og hvorfor overskuddsgass fakles av.
  3. Eleven kan plassere Ekofisk og norsk oljevirksomhet i tid (sent 1960-tall → i dag) og forklare hvorfor plattformene ble et bilde på Norges nye velstand.
- **Suksesskriterier:** Eleven fullfører 3-stasjon-quest i riktig rekkefølge (brønnhode-trykk → separator-prosess → eksport-pumpe). Dialogen med Gunnar eksplisitt forklarer hvorfor gassen må skilles ut. Sluttscenen viser flammetårnet tenne og oljen pumpes ut i røret - visuell bekreftelse på at eleven "fikk den i gang".
- **Hva kan IKKE læres i dette formatet?** Økonomiske ringvirkninger, oljefondet, klimadebatt, utviklingen av oljepolitikken. Det hører til artikkel.

---

## 2. Narrativ kjerne

- **Setting:** Ekofisk-feltet i Nordsjøen, tidlig 1980-tall. Sen ettermiddag, solen på vei ned, oljen farger havet rosa-oransje. Plattform-dekket er av stål, med gule striper og rustflekker. Havet ligger omtrent 20 meter under dekket.
- **Spillerens rolle:** Ny teknisk assistent på sin første helikoptertur offshore. 19 år, har akkurat fullført lærlingtid på Stavanger.
- **Hovedspenning:** Gunnar, skiftleder, skal vise deg "hele reisen" - fra havbunnen til tankskipet - før det kommer fersk bemanning med kveldens helikopter. Før skiftet slutter skal du ha startet eksport-pumpen selv.
- **Emosjonell bue:** Fra beundrende usikkerhet til stolt mestring. (Man *gjør* noe på plattformen, ikke bare ser på.)

---

## 3. Mekanisk kjerne

- **Spill-type:** `hybrid` - utendørs plattform-dekk (open-preset) med 3 interaktive stasjoner. Mer lineært enn Lindisfarne, mindre enn Watt-lab i rom-tetthet, men visuelt større. Ingen fiender, ingen fysikk-puzzle - fokus på observasjon og dialog.
- **Quest-struktur:**

| Fase | Mål | Pedagogisk funksjon |
|---|---|---|
| 1 | Snakk med Gunnar ved helikopterdekket. Gå til **brønnhode** og les av trykkmåleren. | Introduserer: oljen kommer opp med høyt naturlig trykk fra reservoaret. |
| 2 | Gå til **separator-kolonnen** og inspiser panelet. Snakk med Gunnar om hvorfor strømmen må deles i tre (olje, gass, vann). | Eleven anvender forrige info: den strømmen som kom opp er *ikke* bare olje. |
| 3 | Gå til **eksport-pumpen** og trekk spaken. Se flammetårnet tenne, pumpen starte, oljen gå i røret. | Eleven ser konsekvensen: gassen fakles, oljen går mot land. Systemet fungerer. |

- **NPCer:**
  - `gunnar` - Gunnar Risa, 54, skiftleder (`worker` eller `scientist` - pragmatisk, rolig, stolt av yrket). Følger ikke spilleren aktivt, men har dialog tilgjengelig ved hver stasjon. Står ved helikopterdekket i starten, flytter til kontrollrom-panel mellom fase 2 og 3 (via `npc.setPosition` trigger).
- **Nøkkel-interaktable (ikke bærbare items - stasjoner):**
  - `wellhead` - Brønnhode: ventil-tre med rød/grønne lys og trykkmåler.
  - `separator` - Separator-kolonne: høy sylinder med tre utgangsrør (merket OLJE/GASS/VANN).
  - `export-lever` - Stor rød spak ved eksport-panelet. Gated bak `flag:visited-separator`.
  - `flare-stack` - Flammetårn: non-interactable, men tenner visuelt når `export-lever` aktiveres.
- **Valg som driver læring:** Hovedsakelig lineært, men én subtil valg: etter fase 2 kan eleven snakke med Gunnar om **"hva skjer om vi ikke skiller ut gassen?"**. Svaret forklarer trykkrisiko og hvorfor fakling finnes - setter flagg `understands-flaring` som endrer sluttekst.
- **Slutt-tekst:**
  - Default: "Flammetårnet lyser opp havet bak deg. Den første oljen du selv har sendt mot land er på vei. Gunnar klapper deg på skulderen. 'Velkommen offshore.'"
  - Hvis `understands-flaring`: Samme pluss: "Du vet nå hvorfor flammen brenner - den holder plattformen trygg. Ingenting her er tilfeldig."

---

## 4. Visuell kjerne

- **Miljø:** `utendørs` (plattform-dekk, hav rundt)
- **Tid på døgnet:** `0.8` (sent i solnedgang - varm oransje himmel, lange skygger, havet lyser)
- **Stemning:** Storslått, industrielt, stillferdig-stolt. Ikke truende, ikke idyllisk - arbeidsmessig vakkert.
- **Fargepalett:**
  - Stål-grå `#5a6068` (hoveddekk, rekkverk)
  - Industri-gul `#d4a83a` (stripemarkering, hjelmer, kraner)
  - Signal-rød `#c23a2a` (eksport-spak, nødbrytere, flammetårn-base)
  - Solnedgang-oransje `#e87043` (himmelrefleks, fakkel-glød)
  - Hav-blåsvart `#1a2838` (sjø under dekket)
- **Periode-autentisitet (tidlig 1980-tall):**
  - Rød/hvit-malte hjelmer og oransje overaller (ikke moderne HMS-hvit)
  - Analoge trykkmålere med viser (ikke digitale displays)
  - Store, chunky industri-ventiler i stål, ikke strømlinjeformet moderne design
  - Rustflekker og saltpreg på dekket - ikke blankt
  - Et eldre Sikorsky-silhuett på helikopterdekket (valgfritt prop)
- **Moodboard:**
  - Foto av Ekofisk-komplekset fra Norsk Oljemuseum (https://www.norskolje.museum.no)
  - "Nordsjø-arbeideren" - bildearkiv fra Aker/Phillips 1970-80
  - Film: *Nordsjøen* (2021) - bare visuell referanse for dekks-geometri og flammetårn

---

## 5. Teknisk skisse

- **Rom-dimensjoner:** `size: [28, 10, 36]` - stort utendørs dekk. Høyde 10 m gir luft til flammetårnet. `preset: 'open'` (ingen tak/vegger, bare gulv + hav-backdrop).
- **Player startPosition:** `[4, 0, 4]` (ved helikopterdekket i sør-vestre hjørne, 4m fra sørkant)
- **Stasjons-layout (fugleperspektiv):**

  ```
  N (nord, eksport)
  ┌─────────────────────────┐
  │           FLAMMETÅRN    │
  │             ║           │
  │  EKSPORT-PANEL (spak)   │
  │  (z ≈ -14)              │
  │                         │
  │  SEPARATOR-KOLONNE      │
  │  (z ≈ -6)               │
  │                         │
  │  BRØNNHODE (ventil-tre) │
  │  (z ≈ 2)                │
  │                         │
  │  HELIKOPTERDEKK + Gunnar│
  │  (z ≈ 12, player start) │
  └─────────────────────────┘
  S (sør)
  ```

  Spilleren går naturlig sørfra og nordover gjennom de tre stasjonene. Havet omgir dekket på alle sider.

- **NPC-plassering:**
  - `gunnar` start: `[6, 0, 10]` (ved helikopterdekket)
  - `gunnar` fase 3: `[-4, 0, -12]` (ved eksport-panelet) - settes via `npc.moveTo` når separator-dialog lukkes
- **Interaktable-plassering:**
  - `wellhead`: `[0, 0, 2]` - sentralt på dekket
  - `separator`: `[2, 0, -6]` - litt østforskjøvet, høy sylinder (4m)
  - `export-lever`: `[-4, 0, -14]` - vestlig side, på vegg-panel
  - `flare-stack`: `[10, 0, -14]` - langt øst, masten 8m høy, flamme på toppen
- **Dialog-stammer:**
  - **Gunnar ved helikopterdekket (intro):** "Så du er den nye. Greit. Oljen kommer ikke hit av seg selv - den må hentes opp, renses og sendes i land. Tre trinn. Jeg viser deg. Begynn ved brønnhodet der borte."
    - [Hva er brønnhodet?]
    - [Hva skal jeg gjøre?]
  - **Ved brønnhode:** "Trykkmåleren viser om reservoaret nede trykker hardt nok til at oljen kommer opp av seg selv. Her trenger vi ikke pumpe fra bunnen - havet av olje under oss *presser* seg opp."
  - **Ved separator:** "Det som kommer opp er ikke bare olje. Det er olje, gass og saltvann - alt blandet. Separatoren skiller dem. Oljen går i ett rør, gassen i et annet, vannet renses og slippes ut."
    - [Hvorfor må de skilles?]  → setter `understands-flaring` hvis spurt
  - **Ved eksport-spak:** "Nå er oljen ren nok. Trekk den spaken, så går den i røret mot Teesside. Og hør - når du gjør det, tennes flammetårnet. Det brenner overskuddsgassen vi ikke kan sende i land. Det er ikke sløsing, det er sikkerhet."
- **Låste dører / gating:**
  - `wellhead` interact setter flag `visited-wellhead`
  - `separator` krever `visited-wellhead` (Gunnar sier "Ikke hopp over brønnhodet - du må forstå *hvorfor* oljen kommer opp før du ser *hva* som kommer opp.")
  - `export-lever` krever `visited-separator`
  - Ved interaksjon med `export-lever`: spiller sluttsekvens - flammetårn tennes (partikkeleffekt + emissive glow), kort monolog, endText.

---

## 6. Pedagogisk sjekkliste

- [x] Læringsmålene er konkrete og etterprøvbare (3 trinn med egen dialog og stasjon)
- [x] En 14-åring forstår all tekst (ingen faguttrykk uten forklaring - "reservoar", "fakle", "separator" forklares i dialog)
- [x] Valg har synlige konsekvenser (faklings-spørsmålet endrer sluttekst; eksport-spaken endrer verden visuelt)
- [x] Suksesskriteriene kan observeres (flammetårnet tenner, endText oppsummerer læring)
- [x] 3D-formatet er riktig verktøy (å *gå* langs oljestrømmen gir romlig forståelse som artikkel ikke kan)

---

## 7. Asset-notater

- **Thumbnail:** AI-prompt: *"A highly realistic 4K cinematic photograph of a Norwegian offshore oil platform in the North Sea at sunset, 1980s era. Orange flare stack burning against a pink-orange sky, steel deck with yellow safety stripes, a single worker in orange coveralls silhouetted against the flare. Wide-angle shot from deck level, dramatic lighting, 16:9 ratio."*
- **Spesielle modeller/props som må lages (primitive-basert i builder-API):**
  - Flammetårn: høy sylinder (mast) + partikkel-flamme-system på toppen. Ser på eksisterende fire/particle-systemer i engine.
  - Brønnhode-"juletre": 3-4 stablede ventil-hjul i stål, rød topp, trykkmåler-skive med viser.
  - Separator-kolonne: vertikal sylinder ~4m, 3 rør som går ut (merket OLJE/GASS/VANN med tekst-decals eller fargekoder).
  - Eksport-spak: rød spak på grått panel, stor nok til å se tydelig.
  - Hav: flat plan med animert normal-map eller bølge-shader om tilgjengelig i engine, ellers flat emissive-dempet mørk blå.
  - Rekkverk rundt dekket: stål-rør i to høyder, standard primitive.
- **Ambient lyd (valgfritt):** Lavt havsus, konstant mekanisk brumming, vind. Flamme-whoosh når den tennes.

---

## 8. Avklaringer (bekreftet)

1. **Helikopter:** faktisk modell (rød/hvit Sikorsky-inspirert, primitiv-sammensatt på helidekket).
2. **Slitasje:** nytt og stolt - ingen rust.
3. **Hjelm-POV:** droppet.
