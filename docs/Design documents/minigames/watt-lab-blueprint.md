# Mini-spill Blueprint: Watts Laboratorium

> **Status:** `Built - retrospektiv` (dokumentert i etterkant, 2026-04-24)
> **ID:** `watt-lab`
> **Mappe:** `src/games/watt-lab/`
> **Estimert omfang:** `~750 linjer (Watt-lab-nivå er referansen)`

---

## 1. Pedagogisk kjerne

- **Fag:** `historie`
- **Målgruppe:** 8.-10. klasse. Forutsetter grunnleggende kjennskap til den industrielle revolusjonen.
- **Læreplankobling:** LK20 Samfunnsfag/Historie - "gjøre rede for industrialiseringen og virkningene for samfunnet".
- **Læringsmål:**
  1. Eleven kan forklare hvorfor den separate kondensatoren gjorde dampmaskinen mer effektiv.
  2. Eleven kan beskrive hvordan teknisk innovasjon oppsto i samspill mellom verksted-praksis og teoretisk forståelse.
  3. Eleven kan plassere James Watt i tid og knytte oppfinnelsen til den industrielle revolusjonens startfase.
- **Suksesskriterier:** Eleven fullfører 3-trinns puslespill om dampstrøm (kjele → sylinder → kondensator) og ser maskinen kjøre. Dialog med Watt forklarer prinsippet eksplisitt.
- **Hva kan IKKE læres i dette formatet?** Kronologisk oversikt over hele industrialiseringen eller økonomiske ringvirkninger - det hører til artikkel.

---

## 2. Narrativ kjerne

- **Setting:** James Watts verksted i Glasgow, Skottland, 1765. Halvmørkt verksted med esse, platform og verktøy.
- **Spillerens rolle:** Ung universitets-lærlinge som hjelper Watt å perfeksjonere separat kondensator.
- **Hovedspenning:** Watt trenger assistanse til å samle deler og løse hvordan damp skal flyte riktig gjennom maskinen før neste demonstrasjon.
- **Emosjonell bue:** Fra nysgjerrighet til mestring.

---

## 3. Mekanisk kjerne

- **Spill-type:** `quest-rom` (indoor, workshop-preset)
- **Quest-struktur:**

| Fase | Mål | Pedagogisk funksjon |
|---|---|---|
| 1 | Snakk med Watt | Introduserer problemet (ineffektiv Newcomen-maskin) |
| 2 | Samle tre deler | Eleven blir kjent med komponentene |
| 3 | Løs puslespill + se maskinen kjøre | Eleven ser prinsippet demonstrert |

- **NPCer:**
  - `watt` - James Watt (`scientist`, glad) - forklarer problem og løsning.
- **Nøkkel-items:** `messingsylinder`, `ventil`, `kobberkondensator`.
- **Valg som driver læring:** Begrenset - spillet er lineært. Puslespill-feedback forklarer *hvorfor* riktig rekkefølge er riktig.
- **Slutt-tekst:** Fast, beskriver hva eleven har sett.

---

## 4. Visuell kjerne

- **Miljø:** `interiør`
- **Tid på døgnet:** `0.5` (midt på dagen, men interiør er belysningsdominert)
- **Stemning:** Halvmørkt, metallisk, håndverkspreget.
- **Fargepalett:** Esse-glød `0xff8844`, lampelys `0xffeedd`, tre/messing-toner.
- **Periode-autentisitet:** Essefyr, tre-platform, messing-/kobberkomponenter, periodiske verktøy.

---

## 5. Teknisk skisse

- **Rom-dimensjoner:** `size: [20, 6, 20]` (workshop-preset, roomSize: 20)
- **Player startPosition:** `[4, 0, 4]` (godt innenfor sørvegg-clearance)
- **NPC-plassering:** `watt` ved verksted-platform
- **Dør/gating:** Ingen - lineær quest-flyt

---

## 6. Pedagogisk sjekkliste (retrospektiv)

- [x] Læringsmålene er konkrete
- [x] 14-åring forstår teksten
- [x] Valg har synlige konsekvenser (puslespill-feedback)
- [x] Suksesskriteriene kan observeres (maskinen kjører)
- [x] 3D-formatet er riktig verktøy (fysisk komponent-samling er håndgripelig)

## 7. Asset-notater

- **Thumbnail:** eksisterende i `public/images/games/watt-lab-thumb.webp` (hvis finnes).

---

## 8. Retro-refleksjon

- **Hva fungerer:** Tett fokus på én idé (separat kondensator). Puslespill-mekanikken tvinger eleven til å tenke på varme-strøm.
- **Hva kan forbedres:** Lineariteten gjør at eleven ikke tester hypoteser selv - kun klikker gjennom. En variant der eleven må velge mellom to løsninger (gammel vs ny maskin) hadde gitt dypere læring.
