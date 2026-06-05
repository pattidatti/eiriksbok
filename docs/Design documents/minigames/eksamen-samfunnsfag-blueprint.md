# Mini-spill Blueprint: Muntlig eksamen i samfunnsfag

> **Status:** `Approved`
> **ID:** `eksamen-samfunnsfag`
> **Mappe:** `src/games/eksamen-samfunnsfag/`
> **Estimert omfang:** `Watt-lab/caesar-nivå (~800 linjer)`

---

## 1. Pedagogisk kjerne

- **Fag:** `samfunnsfag`
- **Målgruppe:** 10. trinn, rett før muntlig eksamen. Eleven har lest eksamensartiklene (`/samfunnskunnskap/eksamen/muntlig` og modellsvaret), men har aldri kjent på selve situasjonen.
- **Læreplankobling:** Samfunnsfag etter 10. trinn: utforske og presentere samfunnsfaglige spørsmål med kilder; reflektere over hvordan makt og styringsformer endrer seg. (Knyttes til kompetansemålene som ligger bak `km-1-metode`.)
- **Læringsmål:**
  1. Eleven kan bygge en presentasjon rundt en skarp problemstilling i stedet for å ramse opp et tema.
  2. Eleven kan bruke etos, patos og logos bevisst, og forklare hvorfor autokrati ofte vokser innenfra (Roma og Weimar).
  3. Eleven kan møte oppfølgingsspørsmål i en fagsamtale, også spørsmål utenfor det man forberedte.
- **Suksesskriterier:** Observeres i valgene: eleven velger problemstilling framfor manus-opplesning, sammenligner Roma og Weimar punkt for punkt, nevner at makten ble tatt med lovlige midler i en krise, viser til kilder, og svarer på sensors breddespørsmål om dagens norske demokrati. `endText` gir karakter 2-6 med konkret tilbakemelding bygd på hvilke flagg som er satt.
- **Hva kan IKKE læres i dette formatet?** Selve fagstoffet i dybden (det hører hjemme i artiklene). Spillet trener *eksamenshåndverket og situasjonen*, ikke memorering av fakta.

---

## 2. Narrativ kjerne

- **Setting:** En norsk skole på eksamensdag(ene) i juni. Tre soner: klasserommet (trekke fag), forberedelsesrommet, og eksamensrommet. Varmt dagslys gjennom vinduene.
- **Spillerens rolle:** En avgangselev på 10. trinn som skal opp til muntlig eksamen i samfunnsfag - fra trekning til framføring.
- **Hovedspenning:** Hvor godt framføringen går, avhenger av hvor godt du brukte forberedelsesdagen. Og sensor graver alltid litt utenfor det du forberedte.
- **Emosjonell bue:** Fra nervøsitet til mestring.

---

## 3. Mekanisk kjerne

- **Spill-type:** `quest-rom` (dialog-drevet, som caesar-ides). Ett langt rom delt i tre soner med skillevegger og låste dører - én sone per "eksamensdag".
- **Quest-struktur (de tre dagene):**

| Fase | Sone | Mål | Pedagogisk funksjon |
|---|---|---|---|
| `trekke-fag` | A: Klasserom | Trekk faget hos læreren (du får samfunnsfag + temaet). | Rammer inn eksamensgangen; senker terskel |
| `trekke-oppgave` | B: Forberedelse | Les oppgaven og forbered deg (kilder, problemstilling, sammenligning, manus). | Selvstendig arbeid; forberedelsen avgjør del 3 |
| `framfore` | C: Eksamensrom | Hils på faglærer, hold presentasjonen, svar på sensor. | Eleven anvender og drøfter, også utenfor det forberedte |

**Forberedelse → framføring (kjernesløyfe):** Det du forbereder i sone B låser opp de sterke grepene i sone C. Uten forberedt problemstilling/sammenligning/kilder blir åpningen vag, sammenligningen rotete og kilde-grepet tomt (dialog-varianter som leser execution-flagget). Slik kjenner eleven at forberedelsesdagen er det som avgjør karakteren.

- **NPCer:**
  - `faglarer` - Faglærer Berg (`noble`) - kjenner eleven, oppmuntrende. Rammer inn eksamen og leder presentasjonsfasen.
  - `sensor` - Sensor (`scientist`) - ekstern, nøytral. Leder fagsamtalen med gradvis vanskeligere spørsmål.
- **Nøkkel-items:** Ingen. Spillet er rent dialog-drevet (ingen pickups/inventar).
- **Valg som driver læring (flagg):**
  - Åpning: `apnet_tese` (skarp problemstilling) vs `leste_manus` (svak).
  - Innhold: `brukte_sammenligning` (Roma↔Weimar punkt for punkt).
  - Kjernepoeng: `lovlig_makt` (makt tatt innenfra, lovlig, i krise) vs misoppfatning ("angrep utenfra").
  - Virkemiddel: `brukte_logos` / `brukte_patos` / `brukte_etos`, `viste_kilder`.
  - Fagsamtale: `q1_riktig` (fakta), `q2_riktig` (forståelse), `q3_riktig` (drøfting), `q4_riktig` (bredde - dagens norske demokrati, utenfor presentasjonen).
- **Slutt-tekst(er):** `endText`-funksjon teller sterke presentasjonsgrep + riktige svar -> karakter 2-6 med konkret, konstruktiv tilbakemelding (hva satt, hva manglet) og en "Les mer"-henvisning til eksamensartiklene.

---

## 4. Visuell kjerne

- **Miljø:** `interiør`
- **Tid på døgnet:** `timeOfDay 0.5` (lys formiddag), `colorGrading: 'warm'`
- **Stemning:** Lyst, rolig, litt høytidelig. Ikke mørkt eller truende - eksamen skal kjennes overkommelig.
- **Fargepalett:** tregulv `#b9925a`, lyse pussvegger `#e6ddcd`, grønn tavle `#2f4a3a`, varmt trebord `#6a4a2e`, dagslys-aksent `#ffe6b0`.
- **Periode-autentisitet (nåtid):** sensorbord med to stoler, kateter/talerstol foran, grønn tavle eller whiteboard, vindu med dagslys, en vannkaraffel på bordet. Ingen anakronismer (det er et vanlig norsk klasserom).
- **Moodboard:** typisk norsk ungdomsskole-klasserom rigget for muntlig eksamen.

### Teknisk skisse

- **Rom-dimensjoner:** `size: [10, 4, 10]`, `floor: 'wood'`, `walls: 'plaster'`, `lights: 'warm-interior'`, ett vindu (østvegg), én dør (sørvegg).
- **Player startPosition:** `[0, 0, 2]` (minst 2m fra sørveggen ved z=5; kamera følger bak - scenen er synlig ved start).
- **NPCer:**
  - `faglarer` - "Faglærer Berg" - `noble` - `position: [-1.4, 0, -3.4]` (bak sensorbordet, venstre).
  - `sensor` - "Sensor" - `scientist` - `position: [1.4, 0, -3.4]` (bak sensorbordet, høyre).
- **Nøkkel-items:** ingen.
- **Dialog-stammer:**
  - `faglarer_greeting`: "Velkommen. Du trakk Makt og styringsformer. Ta den tiden du trenger - så er det din tur." Valg: [Begynn presentasjonen] / [Jeg er litt nervøs].
  - `sensor_greeting` (fallback): "Hold presentasjonen din først, så tar vi samtalen etterpå." | (variant, `presentasjon_ferdig`): "Takk for presentasjonen. Da har jeg noen spørsmål."
- **Gating (flag -> konsekvens):**
  - `presentasjon_ferdig` -> sensor åpner fagsamtalen; faglærer-markør av, sensor-markør på.
  - `fagsamtale_ferdig` -> `registerUpdate` planlegger `triggerEnd()` -> `endText`.

### Signatur-visuelle elementer

| Element | Minimum-høyde | Emissive? | Animert? | Lys-kilde? |
|---|---|---|---|---|
| Sensorbord (table) + 2 stoler | std. møbel | Nei | Nei | - |
| Kateter / talerstol (lectern) | 1.27m std. | Nei | Nei | - |
| Tavle (box-primitiv, grønn) | 1.2m x 2.5m på vegg | Nei | Nei | - |
| Vindu (buildRoom window) | std. | Nei (slipper dagslys inn) | Nei | dagslys |

Interiør med `warm-interior`-preset gir nok lys; ingen emissive/skumrings-rigg trengs (jf. BUILD_GAME_GUIDE §6.1 gjelder kun skumring/utendørs).

### Pedagogisk sjekkliste

- [x] Læringsmålene er konkrete og etterprøvbare.
- [x] All tekst er forståelig for en 14-åring (bokmål, riktige tegn).
- [x] Valgene har synlige konsekvenser (NPC-reaksjon + karakter i `endText`).
- [x] Suksesskriteriene kan observeres (dialogvalg + `endText`).
- [x] Spillet utnytter situasjonen/3D-formatet (eksamensrommet), ikke bare en quiz - det er et bedre supplement til artikkelen enn en ny artikkel.

### Visuell sjekkliste

- [x] Dimensjoner: rom 10x4x10m; tavle 2.5x1.2m på nordvegg bak kateteret.
- [x] Emissive-plan: ingen (rent dagslys-interiør).
- [x] Animasjon: ingen påkrevd (mulig liten NPC-emosjonsendring som respons).
- [x] Lys-plan: `warm-interior` + vindu. Ingen skumrings-rigg nødvendig.
- [x] Distanse-test: bord, kateter og tavle er store og midt i rommet, godt synlige fra spawn ved z=2.

### Slutt-modell

`Kredittrull (triggerEnd)`. Eksamen har en definitiv slutt: eleven får sin "karakter". `endText` er en funksjon som leser flagg og gir karakter 2-6 med tilbakemelding. Ikke loop-spillbart - når sensoren er ferdig, er eksamen over.
