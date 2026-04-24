# Mini-spill Blueprint: Lysalvendalen (Demo-world)

> **Status:** `Built - retrospektiv` (dokumentert i etterkant, 2026-04-24)
> **ID:** `demo-world`
> **Mappe:** `src/games/demo-world/`
> **Estimert omfang:** `~1400 linjer - stort`

> **Merknad:** Lysalvendalen er **ikke et produksjonsspill** - det er referanse-showcase for alle motor-features (sky, hav, vær, vegetasjon, fysikk, volumetrisk lys). Pedagogisk innhold er begrenset og sekundært. Blueprinten dokumenterer likevel hva spillet gjør, så motoren kan sammenligne nye spill mot referansen.

---

## 1. Pedagogisk kjerne (begrenset)

- **Fag:** `historie` (teknisk rammeverk, ikke reelt pedagogisk primærmål)
- **Målgruppe:** Utviklere og designere - ikke elever.
- **Læreplankobling:** Ingen direkte.
- **Læringsmål:**
  1. Eleven (eller utvikleren) kan oppleve motorens fulle grafikk-kapabilitet.
  2. Eksperimentell lekeflate - utforsk, kast steiner, skift vær/tid.
  3. Reell quest (samle runesteiner → alter) som demonstrerer quest-system.
- **Suksesskriterier:** Finner tre runesteiner, bringer dem til kapell-alter, ser hemmelig kammer åpnes.
- **Hva kan IKKE læres i dette formatet?** Ingenting konkret pedagogisk - dette er demo, ikke læringsspill.

---

## 2. Narrativ kjerne

- **Setting:** Fiktiv fjorddal "Lysalvendalen" med middelalder-elementer (kapell, brygge, steinringer).
- **Spillerens rolle:** Eventyrer som hjelper munken Alvstein finne tre tapte runesteiner.
- **Hovedspenning:** Mystisk kammer i kapellet som åpnes når runesteinene legges på alteret.
- **Emosjonell bue:** Fra utforskning til oppdagelse.

---

## 3. Mekanisk kjerne

- **Spill-type:** `utendørs-utforskning` med quest-chain
- **Quest-struktur:**

| Fase | Mål | Demo-funksjon |
|---|---|---|
| 1 | Møt Alvstein | Dialog-system, NPC-AI |
| 2 | Finn tre runesteiner (steinring, bålfyr, skog) | Utforskning, quest-markers |
| 3 | Bring dem til kapell-alter | Inventar, station-puzzle |
| 4 | Kammer åpnes | Door-unlock via flag, grafikk-galleri |

- **NPCer:**
  - `alvstein` - Alvstein (`monk`, glad) - guide ved spawn, tilbyr tur-meny
  - `vandreren` - Vandreren (`farmer`, glad) - patruljerer, snur seg mot spiller
- **Nøkkel-items:** Runesteiner (×3, stackable).
- **Valg som driver læring:** Lek-flate - ikke primært valg-drevet.
- **Slutt-tekst:** Bekreftelse og åpning av grafikk-galleriet.

---

## 4. Visuell kjerne

- **Miljø:** `utendørs` (fjorddal)
- **Tid på døgnet:** Valgfritt (spilleren kan skifte)
- **Stemning:** Fredelig, magisk, dag-og-natt-valgfri.
- **Fargepalett:** Blå himmel `0xa8c8e8`, grønt gress, steiner og trematerialer.
- **Periode-autentisitet:** Ikke historisk presis - fiktiv "middelalder-fantasy-lett" stil.

---

## 5. Teknisk skisse

- **Rom-dimensjoner:** Open preset (stor utendørs-verden).
- **Player startPosition:** `[0, 1, 8]`
- **Demonstrerte systemer:** Procedural sky, hav, vær-system, vegetation patches, volumetrisk lys, cascaded shadows, partikler, dynamisk musikk, physics.

---

## 6. Pedagogisk sjekkliste (retrospektiv)

- [~] Læringsmålene er konkrete (svakt - demo-spill, ikke læringsspill)
- [x] 14-åring forstår teksten
- [~] Valg har synlige konsekvenser (delvis - primært utforskning)
- [x] Suksesskriteriene kan observeres (kammer åpnes)
- [x] 3D-formatet er riktig verktøy (dette ER 3D-motoren i aksjon)

---

## 7. Retro-refleksjon

- **Hva fungerer:** Showcaser motorens kapabilitet på en måte som er gøy å bruke. Servere som referanse når nye spill skal bygges.
- **Hva kan forbedres:** Ca 1045 linjer raw Three.js i Assets-filen bryter den deklarative filosofien. Burde refaktoreres til builders der mulig, eller flyttes til `engine/declarative/` hvis det er gjenbruktbart.
- **Bruk:** Viser teknisk *hva som er mulig*, ikke *hvordan produsere et læringsspill raskt*. Nye mini-spill bør bruke `blueprint-quest/` som utgangspunkt, ikke demo-world.
