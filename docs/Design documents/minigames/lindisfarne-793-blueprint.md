# Mini-spill Blueprint: Lindisfarne 793

> **Status:** `Built - retrospektiv` (dokumentert i etterkant, 2026-04-24)
> **ID:** `lindisfarne-793`
> **Mappe:** `src/games/lindisfarne-793/`
> **Estimert omfang:** `~900 linjer (narrativt flerfase)`

---

## 1. Pedagogisk kjerne

- **Fag:** `historie`
- **Målgruppe:** 8.-10. klasse. Ingen forkunnskaper nødvendig, men kjennskap til vikingtiden hjelper.
- **Læreplankobling:** LK20 Samfunnsfag/Historie - "gjøre rede for vikingtiden og samspill mellom Norge og resten av Europa".
- **Læringsmål:**
  1. Eleven kan forklare hvorfor raidet på Lindisfarne 8. juni 793 regnes som vikingtidens startdato i europeisk historiografi.
  2. Eleven kan beskrive vikingtiden som kompleks periode - handel, bosetting og raid side om side - ikke kun plyndring.
  3. Eleven kan reflektere over at historiske hendelser består av individuelle valg med moralske konsekvenser.
- **Suksesskriterier:** Eleven gjennomfører raidet til en av to slutter (moralsk tung vs moralsk lettere) og ser at valget om Broder Eadfrith og den hellige boken påvirker opplevelsen. End-text reflekterer hva eleven valgte.
- **Hva kan IKKE læres i dette formatet?** Geografisk spredning av vikingene, handelsnettverk, norrøn religion i dybde - disse hører til artikkel/læringssti.

---

## 2. Narrativ kjerne

- **Setting:** Lindisfarne, Northumbria, 8. juni 793 e.Kr. Kvelds-daggry-atmosfære. Kloster på en liten øy - kapell, bibliotek, sovesal.
- **Spillerens rolle:** Torstein, ung viking på sitt første raid.
- **Hovedspenning:** Eleven må velge hvordan møte Broder Eadfrith og hva som skal skje med den hellige boken. Dine valg bestemmer utfallet.
- **Emosjonell bue:** Fra eventyrlyst til moralsk tvil.

---

## 3. Mekanisk kjerne

- **Spill-type:** `utendørs-utforskning` (open preset) med fler-fase quest
- **Quest-struktur:**

| Fase | Mål | Pedagogisk funksjon |
|---|---|---|
| 1 | Seiling til Lindisfarne | Setter scene og historisk tyngde |
| 2 | Landing og oppstiging | Eleven møter klosterets sårbarhet |
| 3 | Utforsking (kapell, bibliotek, sovesal) | Eleven ser det som skal plyndres |
| 4 | Konfrontasjon med Broder Eadfrith | Moralsk valg - det viktigste i spillet |
| 5 | Retur til båt (to ender basert på valg) | Eleven ser konsekvensen |

- **NPCer:**
  - `sigurd` - Høvding Sigurd (`noble`, triumphant) - lederen som driver framover
  - `den-eldre` - Den eldre (`scientist`, worried) - erfaren veteran, moralsk kontrapunkt
  - `ulv` - Ulv (`farmer`, glad) - mannskap, representerer den vanlige viking
  - `eadfrith` - Broder Eadfrith (`monk`, worried) - munken i biblioteket, det moralske ankeret
- **Nøkkel-items:** Ingen fysiske items. Historien handler om valg, ikke gjenstander.
- **Valg som driver læring:** Møtet med Eadfrith og valget rundt boken setter flagg som påvirker end-text.
- **Slutt-tekst(er):** Variabel basert på flagg - viser konsekvensen av valget.

---

## 4. Visuell kjerne

- **Miljø:** `utendørs`
- **Tid på døgnet:** `0.72` (sen ettermiddag / tidlig kveld)
- **Stemning:** Nordisk kyst, truende hellig, melankoli.
- **Fargepalett:** Blågrønn himmel `0x7a9ab8`, sandtoner, steinklosteret i gråtoner.
- **Periode-autentisitet:** Middelaldersk kloster-arkitektur, vikingbåt, tidsriktige klær og utstyr.

---

## 5. Teknisk skisse

- **Rom-dimensjoner:** Open preset, stor øy med kloster-kompleks.
- **Player startPosition:** `[0, 0, 0]` (overstyres av setupScene - seated i båten).
- **NPC-plassering:** Sigurd og mannskapet i båten, Eadfrith i biblioteket.
- **Dør/gating:** Fase-gating via quest-progresjon, ikke dør-flagg.
- **Monologer:** Mange proximity-triggere underveis gir indre stemme til Torstein.

---

## 6. Pedagogisk sjekkliste (retrospektiv)

- [x] Læringsmålene er konkrete
- [x] 14-åring forstår teksten
- [x] Valg har synlige konsekvenser (to ender)
- [x] Suksesskriteriene kan observeres (end-text varierer)
- [x] 3D-formatet er riktig verktøy (atmosfære og stedsfølelse bærer fortellingen)

---

## 7. Retro-refleksjon

- **Hva fungerer:** Monolog-triggers gir indre stemme uten å avbryte spilleren. Moralsk valg er reelt - begge utfall er historisk plausible. Stemning og setting bærer læringen.
- **Hva kan forbedres:** Mellomfasene (2-3) er lineære. En åpnere utforskning der eleven kan oppdage ting i ulike rekkefølger hadde gitt mer eierskap.
