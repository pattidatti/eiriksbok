# Mini-spill Blueprint: Skjoldborg

> **Status:** `Built - retrospektiv` (dokumentert i etterkant, 2026-04-24)
> **ID:** `skjoldborg`
> **Mappe:** `src/games/skjoldborg/`
> **Estimert omfang:** `Motor-demo, ikke primært et læringsspill`

> **Merknad:** Skjoldborg er primært en **demo av motor-systemer** (rytme, stealth, puzzle, vær, dynamisk musikk). Det har pedagogisk innhold, men ble designet for å vise hva motoren kan. Retrospektivet dokumenterer hvordan læringen leveres de-facto.

---

## 1. Pedagogisk kjerne

- **Fag:** `historie`
- **Målgruppe:** 8.-10. klasse. Kjennskap til vikingtiden hjelper.
- **Læreplankobling:** LK20 Historie - "gjøre rede for vikingtiden", LK20 KRLE - "norrøn religion og verdensbilde".
- **Læringsmål:**
  1. Eleven kan beskrive et blot - norrønt offerritual - med offergaver og symbolikk.
  2. Eleven kan nevne Odin og volvens rolle i norrøn religion.
  3. Eleven kan knytte rituell orden og rekkefølge til norrøn sakralitet.
- **Suksesskriterier:** Eleven samler tre offergaver, deltar i hamring ved essen, og legger gavene i riktig rekkefølge på alteret. Dialog med Volven forklarer betydningen.
- **Hva kan IKKE læres i dette formatet?** Norrøn kosmologi i dybde, sammenligning med andre religioner, historiske variasjoner mellom regioner.

---

## 2. Narrativ kjerne

- **Setting:** Norrøn festningsby ("skjoldborg"), ca. 793 e.Kr., solnedgang.
- **Spillerens rolle:** Fremmed som ankommer for å delta i blot-ritual til Odin.
- **Hovedspenning:** Eleven må navigere byen, samle rituelle gaver, unngå vaktenes oppmerksomhet, og fullføre ritualet.
- **Emosjonell bue:** Fra fremmed til innvidd.

---

## 3. Mekanisk kjerne

- **Spill-type:** `hybrid` (utendørs + rytme-aktivitet + puzzle-station + stealth)
- **Quest-struktur:**

| Fase | Mål | Pedagogisk/demo-funksjon |
|---|---|---|
| 1 | Møt Bjorg ved porten | Introduksjon til blot |
| 2 | Samle tre offergaver | Lære hva som ofres og hvorfor |
| 3 | Pump belg + hamring hos smed | Rytme-aktivitet (demo) + håndverk |
| 4 | Legg gaver på alter i riktig rekkefølge | Rituell presisjon (puzzle-station) |

- **NPCer:**
  - `bjorg` - Bjorg (`farmer`, glad) - porter-vakt og guide
  - `helge` - Smed-Helge (`scientist`, glad) - smed ved essen
  - `volven` - Volven (`monk`, worried) - ritualist
  - `vakt1`, `vakt2` - Vakter (`noble`, glad) - stealth-motstand
- **Nøkkel-items:** `offersverd` (kamp), `mjod-horn` (drikk), `gullmynt` (rikdom).
- **Valg som driver læring:** Rekkefølgen i puzzle-station er pedagogisk poeng.
- **Slutt-tekst:** Bekreftelse av vellykket blot.

---

## 4. Visuell kjerne

- **Miljø:** `utendørs`
- **Tid på døgnet:** `0.75` (solnedgang)
- **Stemning:** Hellig, varm gyllen, høytidelig.
- **Fargepalett:** Solnedgang `0xe88a4a`, volumetrisk lys, brennende essefyr.
- **Periode-autentisitet:** Skjoldborg-arkitektur, rituelle gjenstander, smed-esse.

---

## 5. Teknisk skisse

- **Rom-dimensjoner:** Open preset (utendørs).
- **Player startPosition:** `[0, 1, 8]`
- **Dør/gating:** Porten til helligdommen åpnes via quest-progresjon.
- **Detection:** Vakter har vision cones og deteksjonsmåler.

---

## 6. Pedagogisk sjekkliste (retrospektiv)

- [x] Læringsmålene er konkrete
- [x] 14-åring forstår teksten
- [~] Valg har konsekvenser (begrenset - primært rekkefølge-basert)
- [x] Suksesskriteriene kan observeres (ritual fullføres)
- [~] 3D-formatet er riktig verktøy (delvis - motor-demo-fokuset dilutes pedagogikken)

---

## 7. Retro-refleksjon

- **Hva fungerer:** Rytme-aktiviteten i smia er kroppslig og minneverdig. Stealth-elementet skaper spenning.
- **Hva kan forbedres:** Demo-fokuset gjør at pedagogikken konkurrerer med mekanikk-demoen. Et fremtidig blot-spill bør fokusere tettere på ett ritual og dets betydning.
