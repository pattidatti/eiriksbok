# Guide: Design og Utvikling av Tidsreiser (Scenarier)

Denne guiden beskriver hvordan du designer og implementerer interaktive "Tidsreise"-scenarier i Eiriksbok. Systemet er bygget for å gi elevene en dyp, narrativ opplevelse der de tar valg som påvirker deres stats, ressurser og skjebne.

## 1. Konseptuell Oppbygging

Hvert scenario er en **graf av noder**. Eleven starter i en `startingNodeId` og navigerer gjennom noder via `choices`.

### De 4 Søylene i et Scenario:
1.  **Narrativ (Noder):** Teksten, taleren og bakgrunnsbildet som setter scenen.
2.  **Mekanikk (Stats):** Tallverdier som Disiplin, Moral eller Gull som endres basert på valg.
3.  **Økonomi (Inventory):** Gjenstander som kan finnes, brukes eller kombineres (Crafting).
4.  **Utfordringer (Minigames):** Spesialiserte noder for kamp, terningspill eller domsavsigelser.

---

## 2. Teknisk Struktur (JSON)

Scenarier lagres i `public/content/scenarios/[scenario-id].json`.

### 2.1 Metadata & Konfigurasjon
```json
{
  "id": "roman-soldier",
  "title": "Legionærens Liv",
  "role": "Romersk Soldat",
  "year": "122 e.Kr.",
  "config": {
    "stats": [
      { "id": "discipline", "label": "Disiplin", "icon": "shield", "value": 50, "max": 100 }
    ],
    "items": [
      { "id": "gladius", "name": "Gladius", "description": "Et romersk sverd.", "icon": "sword" }
    ],
    "theme": { "primaryColor": "#b45309", "font": "serif" }
  }
}
```

### 2.2 Noder (`nodes`)
Hver node representerer ett "skjermbilde" i spillet.
- `text`: Hovedteksten i noden.
- `speaker`: Navnet på den som snakker (valgfritt).
- `backgroundImage`: Sti til 16:9 WebP-bilde.
- `choices`: Array med valgmuligheter.
- `uiType`: Sett til `"map"` for å vise et interaktivt kart i stedet for knapper.

### 2.3 Valg (`choices`)
Valg driver historien fremover og endrer spilltilstanden.
- `effects`: Endrer stats (f.eks. `{"discipline": 10}`).
- `updateInventory`: Legg til eller fjern gjenstander (`add` / `remove`).
- `checkInventory`: Lås valg baser på om eleven har en gjenstand (`hasItem`).
- `updateEnvironment`: Endre tid på døgnet (`time: "night"`) eller vær (`weather: "rain"`).

---

## 3. Minispill og Spesialmoduser

### 3.1 Battle (`type: "battle"`)
Et turbasert kampsystem basert på "Stein-Saks-Papir"-logikk (`counters`).
- `moves`: Definerer spillerens angrep. Hvert angrep bør "slå" en viss type fiendtlige trekk.

### 3.2 Justice (`type: "justice"`)
Brukt i Baronen-scenariet for å dømme i tvister.
- Definerer `cases` med `mercy` eller `harsh` utfall.

### 3.3 Dice (`type: "dice"`)
Enkel sannsynlighetssjekk mot en `targetScore`.

---

## 4. Design-prosess: Fasevis Utvikling

Siden disse scenariene er komplekse, bør de utvikles i faser:

### Fase 1: Design (Blueprint)
Bruk `scenario-blueprint-template.md` til å tegne opp grafen.
- Definer 3-5 kjerne-stats.
- Skissér de kritiske nodene (Start, Konflikt, Avslutning).
- Planlegg "loopen" (f.eks. Kart -> Hendelse -> Valg -> Tilbake til Kart).

### Fase 2: Skjelett (JSON)
Opprett JSON-filen med alle node-ID-er og grunnleggende navigasjon.
- Ikke bry deg om finpussing av tekst eller bilder ennå.
- Test at man kan klikke seg gjennom hele historien fra start til slutt.

### Fase 3: Mekanikk & Balansering
Legg inn stats-endringer og krevde gjenstander.
- Sørg for at det er mulig å vinne, men at det krever strategiske valg.

### Fase 4: Visuell Polering & AI-generering
Generer kinematiske 16:9-bilder i WebP-format.
- Bruk konsekvent stil (f.eks. "Cinematic oil painting" eller "Gritty realism").
- Legg inn `JournalPrompt` for å tvinge eleven til refleksjon mellom slagene.

---

## 5. Beste Praksis
- **Scaffolding:** Start alltid med en introduksjon som forklarer rollen og målet.
- **Konsekvenser:** La spilleren føle at stats har betydning (lås valg for de med lav Disiplin).
- **Refleksjon:** Bruk `journalPrompt` før store overganger for å la eleven skrive ned sine egne vurderinger.
- **Universell Utforming:** Bruk tydelige ikoner og unngå for lange tekstblokker i dialog-vinduet.
