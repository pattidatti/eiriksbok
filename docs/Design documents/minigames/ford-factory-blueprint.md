# Mini-spill Blueprint: Fords Fabrikk

> **Status:** `Built - retrospektiv` (dokumentert i etterkant, 2026-04-24)
> **ID:** `ford-factory`
> **Mappe:** `src/games/ford-factory/`
> **Estimert omfang:** `Mellomstort`

---

## 1. Pedagogisk kjerne

- **Fag:** `historie`
- **Målgruppe:** 8.-10. klasse. Forutsetter kjennskap til den andre industrielle revolusjonen.
- **Læreplankobling:** LK20 Samfunnsfag/Historie - "gjøre rede for hvordan teknologisk og økonomisk utvikling har påvirket samfunnet i moderne tid".
- **Læringsmål:**
  1. Eleven kan forklare hvordan samlebåndet revolusjonerte bilindustrien gjennom arbeidsdeling og flyt.
  2. Eleven kan beskrive at innovasjonen skjedde i samspill mellom Henry Ford og Charles Sorensen - ikke av én mann alene.
  3. Eleven kan reflektere over spenningen mellom produktivitet og arbeidsforhold (inkl. $5-dagen i 1914).
- **Suksesskriterier:** Eleven plasserer fire stasjoner i riktig rekkefølge, observerer drift (1913), og gjennomfører dialog om $5-dagen.
- **Hva kan IKKE læres i dette formatet?** Økonomisk teori (taylorisme), videre utvikling av fabrikkhistorie, fagforeningskamper - hører til artikkel.

---

## 2. Narrativ kjerne

- **Setting:** Highland Park-fabrikken i Detroit, 1908-1914.
- **Spillerens rolle:** Henry Ford i dialog med Charles Sorensen om å implementere samlebåndet.
- **Hovedspenning:** Hvordan organisere produksjonen for å skalere fra tradisjonell montering til moderne samlebånd.
- **Emosjonell bue:** Fra teknisk problem til etisk dilemma.

---

## 3. Mekanisk kjerne

- **Spill-type:** `quest-rom` (åpen fabrikkhall, men lineær progresjon)
- **Quest-struktur:**

| Fase | Mål | Pedagogisk funksjon |
|---|---|---|
| 1 | Møt Charles Sorensen | Introduserer innovatøren bak samlebåndet |
| 2 | Plasser fire stasjoner i rekkefølge (chassis, motor, hjul, karosseri) | Eleven opplever flyt-prinsippet |
| 3 | Observer drift 1913 | Ser resultatet |
| 4 | Dialog om $5-dag og arbeiderkår (1914) | Etisk refleksjon |

- **NPCer:**
  - `sorensen` - Charles Sorensen (`scientist`, worried) - den virkelige innovatøren
  - Fire arbeidere (`farmer`, worried) - visuelt framtredende ved hver stasjon, ikke interaktive
- **Nøkkel-items:** Ingen - fokus på stasjonspunkter og plassering.
- **Valg som driver læring:** Dialog om $5-dagen har valg med konsekvenser for end-text.
- **Slutt-tekst:** Variabel basert på om eleven prioriterer effektivitet eller arbeiderkår.

---

## 4. Visuell kjerne

- **Miljø:** `hybrid` (åpen fabrikkhall)
- **Tid på døgnet:** `0.35` (tidlig morgen, lampelys dominerer)
- **Stemning:** Industri-monumental, sepia-preget, både fremskritts-stolt og kaldt.
- **Fargepalett:** Gråtoner `0x2e2a26`, sepia-grading, varme lysstråler gjennom høye vinduer.
- **Periode-autentisitet:** Highland Park-arkitektur, Model-T-deler, tidsriktig verneutstyr (eller mangel på det).

---

## 5. Teknisk skisse

- **Rom-dimensjoner:** Open preset (fabrikkhall).
- **Player startPosition:** `[0, 0, 10]`
- **Samlebånd:** Langs x-aksen (-8 til +8).
- **Dør/gating:** Fase-gating via stasjon-plassering og dialog-progresjon.

---

## 6. Pedagogisk sjekkliste (retrospektiv)

- [x] Læringsmålene er konkrete
- [x] 14-åring forstår teksten
- [x] Valg har synlige konsekvenser ($5-dagen-dialog)
- [x] Suksesskriteriene kan observeres (samlebånd fungerer)
- [x] 3D-formatet er riktig verktøy (stasjoner-i-rekke er spatial læring)

---

## 7. Retro-refleksjon

- **Hva fungerer:** Sorensen som hovedkilde bryter Henry-Ford-myten. Etikk-dialogen gir læringen moralsk dybde.
- **Hva kan forbedres:** Arbeiderne er pynt - dialog med dem hadde åpnet for perspektiv-læring. Tidsbytte mellom 1908 og 1914 er abrupt; en mer gradvis utvikling gjennom flere mellomår kunne forsterket forståelsen.
