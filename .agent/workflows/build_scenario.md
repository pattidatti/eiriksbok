---
description: Bygger et fullstendig Tidsreise-scenario-JSON fra en godkjent Blueprint. Implementerer alle noder, stats, items og registrerer i manifest.
---

# Workflow: Build Scenario

**Input:** `[scenario-id]` — ID-en til et godkjent scenario (blueprint skal eksistere).

**Forutsetning:** `/plan_scenario` er fullført og blueprinfilen finnes.

---

## 1. Les Kontekst

*   File: `docs/Design documents/[scenario-id]-scenario-blueprint.md` — PRIMÆRKILDEN. Følg denne nøye.
*   File: `docs/SCENARIO_DESIGN_GUIDE.md` — Teknisk spec for alle node-typer og felter.
*   File: `public/content/scenarios/roman-soldier.json` — Referanseimplementasjon for JSON-struktur.
*   File: `public/content/manifest.json` — For å finne riktig `subjectId` og `topicId` til registrering.

---

## 2. Opprett Scenario-JSON

Opprett `public/content/scenarios/[scenario-id].json`.

### 2.1 Rotstruktur (Metadata)

```json
{
  "id": "[scenario-id]",
  "title": "...",
  "era": "...",
  "year": "...",
  "role": "...",
  "summary": "...",
  "startingNodeId": "intro",
  "randomEvents": [],
  "config": { ... },
  "nodes": { ... }
}
```

*   `summary` skal være 1-2 setninger som gir eleven lyst til å starte.
*   `randomEvents` fylles med node-ID-er for hendelser som kan trigges tilfeldig fra hub-noden (kan være tom liste).

### 2.2 Config-objekt

```json
"config": {
  "stats": [
    { "id": "stat_id", "label": "Visningsnavn", "icon": "shield|heart|crown|users", "value": 50, "max": 100, "category": "relation|null" }
  ],
  "items": [
    { "id": "item_id", "name": "Navn", "description": "Beskrivelse.", "icon": "sword|star|gem|scroll" },
    {
      "id": "brev_id", "name": "Brev fra X", "description": "Kort ingress.", "icon": "scroll",
      "content": {
        "itemType": "letter",
        "from": "Avsender, Sted",
        "to": "Mottaker, Enhet",
        "date": "DD. måned ÅÅÅÅ",
        "body": ["Kjære X,", "Avsnitt 2.", "Hilsen Y"]
      }
    }
  ],
  "recipes": [
    { "id": "recipe_id", "result": "item_id", "ingredients": ["item_a", "item_b"] }
  ],
  "theme": {
    "primaryColor": "#hex",
    "font": "serif|sans-serif"
  }
}
```

*   Bruk `category: "relation"` for alle stats som representerer relasjoner til personer/grupper.
*   `recipes` kan være en tom liste `[]` dersom ingen crafting er planlagt.
*   **Gjenstander med `content`** vises med en klikkbar modal i ryggsekken:
    *   `itemType: "letter"` — brevvisning med sepia-stil, Fra/Til/Dato og brødtekst som `<p>`-elementer.
    *   `itemType: "object"` — standard gjenstandsvisning (brukes sjelden; gjenstander *uten* `content` bruker samme visning automatisk).
    *   Brev skal alltid ha `"icon": "scroll"` eller `"icon": "book"`.
    *   `body`-arrayen: ett element per avsnitt. Første element er gjerne tiltalen ("Kjære X,"), siste er underskriften.

### 2.3 Noder

Bygg ut ALLE noder definert i blueprinten. Hvert node-objekt:

```json
"node_id": {
  "id": "node_id",
  "text": "Narrativ tekst (2-4 setninger, levende og historisk forankret).",
  "speaker": "Forteller|[Karakternavn]",
  "backgroundImage": "/images/chronos/[filnavn].webp",
  "uiType": "map",
  "discoveryEvent": {
    "title": "Historisk faktum",
    "fact": "1-2 setninger med ekte historisk data.",
    "articleLink": "/fag/emne/artikkel",
    "reflectionQuestion": "Hva tenker du om...?"
  },
  "npcDialogue": {
    "statId": "rel_[navn]",
    "cold": "Han snur seg bort.",
    "neutral": "'Hva vil du?'",
    "warm": "'[Navn]! Kom og sett deg.'"
  },
  "journalPrompt": "Hva mener du om...",
  "choices": [ ... ]
}
```

**Felt-regler:**
*   `uiType: "map"` — Bruk KUN for hub-noder. Utelat feltet for alle andre noder.
*   `journalPrompt` — Bruk ved viktige veiskiller (før stor konflikt, etter minigame). Tving refleksjon.
*   `backgroundImage` — Alltid `/images/chronos/[beskrivende-filnavn].webp`. Filen trenger ikke eksistere ennå.
*   `speaker` — Bruk "Forteller" for narratorscener. Bruk karakternavn for dialog.
*   `discoveryEvent` — Bruk ved historisk viktige noder (første gang eleven møter en realitet: gassangrep, krigsrett, hungersnød). Kun én per node. Vises automatisk første gang eleven besøker noden. Bruk på minst 1–2 noder i scenariet.
*   `npcDialogue` — Bruk på noder der en NPC snakker og det finnes en `rel_[navn]`-stat. Velg `statId` lik den aktuelle relasjonens stat-ID. Relasjonsverdien styrer hvilken tone som vises automatisk.

### 2.4 Valg (choices)

```json
{
  "id": "c_[node_id]_[nummer]",
  "text": "Handlingsrettet valgtext (verb + konsekvens-hint)",
  "nextNodeId": "neste_node",
  "effects": { "stat_id": 10, "annen_stat": -5 },
  "setFlags": ["flagg_id"],
  "clearFlags": ["flagg_som_fjernes"],
  "condition": {
    "hasFlag": "krev_dette_flagget",
    "lacksFlag": "blokker_hvis_dette_flagget"
  },
  "ethicsLens": {
    "deontological": "Kant: ...",
    "consequentialist": "Utilitarisme: ...",
    "virtue": "Aristoteles: ..."
  },
  "updateInventory": { "add": "item_id" },
  "checkInventory": { "hasItem": "item_id" },
  "updateEnvironment": { "time": "day|night", "weather": "rain|clear" }
}
```

*   Hvert valg skal ha **minst ett `effects`-objekt** (stats endres alltid).
*   Bruk `checkInventory` for valg som krever en gjenstand — disse låses automatisk i UI.
*   Skriv valgtext slik at eleven forstår den historiske implikasjonen.
*   `setFlags` — bruk på valg som representerer en *hendelse* eleven husker (hjalp fienden, nektet ordre, tok gjenstand). Snake_case. Flag-IDer må være konsistente på tvers av hele scenariet.
*   `condition.hasFlag` / `condition.lacksFlag` — brukes i stedet for (eller i tillegg til) stat-betingelser for å låse/åpne valg basert på hendelser.
*   `ethicsLens` — bruk på valg med moralsk vekt. Aktiveres kun dersom eleven har slått på etikk-modus i HUD. Gir tre filosofiske perspektiver i en pause-modal før eleven bekrefter valget.

### 2.5 Minispill-noder

**Battle:**
```json
"node_id": {
  "id": "node_id",
  "type": "battle",
  "text": "Introduksjonstekst for kampen.",
  "enemy": { "name": "Fiendenavn", "health": 3, "moves": ["move_a", "move_b"] },
  "moves": [
    { "id": "move_id", "name": "Angrepsnavn", "counters": ["fiende_move"], "effects": { "stat": 5 } }
  ],
  "onWin": { "nextNodeId": "victory_node", "effects": { "stat": 20 } },
  "onLoss": { "nextNodeId": "defeat_node", "effects": { "stat": -20 } }
}
```

**Dice:**
```json
"node_id": {
  "id": "node_id",
  "type": "dice",
  "text": "Terningkast-scene.",
  "targetScore": 4,
  "onWin": { "nextNodeId": "..." },
  "onLoss": { "nextNodeId": "..." }
}
```

**Justice:**
```json
"node_id": {
  "id": "node_id",
  "type": "justice",
  "text": "Domsscene.",
  "cases": [
    {
      "id": "case_id",
      "description": "Tvistebeskrivelse.",
      "mercy": { "nextNodeId": "...", "effects": { "stat": 10 } },
      "harsh": { "nextNodeId": "...", "effects": { "stat": -10 } }
    }
  ]
}
```

---

## 3. Avslutningsnoder

Alltid inkludér minst to avslutningsnoder:

*   **`victory`** — Positiv avslutning. Inkludér `journalPrompt` som oppsummerer hva eleven lærte.
*   **`defeat`** — Negativ avslutning. Reflekter over hva som gikk galt historisk.

Avslutningsnoder har `"choices": []` (tom liste) og **skal alltid ha `epilogue`**:

```json
"slutt_victory": {
  "id": "slutt_victory",
  "text": "...",
  "isEnd": true,
  "endType": "victory",
  "choices": [],
  "epilogue": {
    "entries": [
      { "hasFlag": "flagg_id", "text": "Personalisert linje basert på hva som skjedde." },
      { "lacksFlag": "flagg_id", "text": "Alternativ linje." }
    ],
    "historicalEcho": "Hva skjedde faktisk i denne perioden historisk sett.",
    "reflectionQuestion": "Ett åpent spørsmål til klassen."
  }
}
```

**Regler:**
*   Minst én `entries`-oppføring per viktig flagg i scenariet.
*   `historicalEcho` kobler fiksjon til fakta — det som faktisk skjedde historisk.
*   `reflectionQuestion` er rettet mot klassen, ikke spilleren — brukes som samtalestart.

---

## 4. Valider JSON

Sjekk at:

- [ ] Alle `nextNodeId`-referanser peker på eksisterende node-ID-er.
- [ ] Alle `checkInventory.hasItem`-verdier er definert i `config.items`.
- [ ] Brev-items (`itemType: "letter"`) har utfylte `from`, `to`, `date` og minst 3 `body`-elementer.
- [ ] Alle `effects`-nøkler matcher en `id` i `config.stats`.
- [ ] `startingNodeId` finnes i `nodes`.
- [ ] Ingen node mangler `choices`-array (selv om den er tom).
- [ ] `setFlags`-IDer er konsistente — samme streng brukt på tvers av `setFlags`, `hasFlag`, `lacksFlag` og `epilogue.entries`.
- [ ] Alle end-noder har `epilogue` med minst én `historicalEcho`.
- [ ] Noder med `npcDialogue` peker på en `statId` som finnes i `config.stats`.
- [ ] `discoveryEvent` er brukt på minst 1–2 noder i scenariet.

---

## 5. Registrer i Manifest

Åpne `public/content/manifest.json` og legg til scenariet under riktig topic sin `tools`-array:

```json
{
  "id": "[scenario-id]",
  "title": "[Tittel]",
  "description": "[summary-teksten fra JSON]",
  "link": "/oving/tidsreise/[scenario-id]",
  "icon": "clock"
}
```

**Viktig:** Legg til under `tools`, IKKE `lessons`.

---

## 5b. Oppdater TimeTravelPage.tsx

Åpne `src/pages/TimeTravelPage.tsx` og legg til scenariet i `scenarios`-arrayen:

```typescript
{
    id: '[scenario-id]',
    title: '[Kortversjon av tittel]',
    era: '[År/periode]',
    difficulty: 'Lett|Middels|Vanskelig',
    description: '[1 setning fra summary]',
    icon: Shield,   // Shield|Crown|Sword – velg passende
    color: 'bg-[farge]-[nyanse]',   // Historisk passende farge
    disabled: false
}
```

**Viktig:** Legg også til scenario-tittelen i lookup-objektet i graveyard-seksjonen (ca. linje 117):

```tsx
{ 'roman-soldier': 'Romersk Legionær', 'medieval-baron': 'Baron av Rhinen', '[scenario-id]': '[Tittel]' }[log.scenarioId] ?? log.scenarioId
```

---

## 6. Generer Asset-liste

List opp alle `backgroundImage`-verdier fra JSON-en og gi brukeren klare AI-bildeprompts for hver:

```
Fil: /images/chronos/[filnavn].webp
Prompt: A highly realistic 4K cinematic photograph of [scene], [historical period]. [Lighting]. [Camera angle]. 16:9 ratio, WebP.
```

Bruk stil-reglene fra `docs/image-style-guide.md`.

---

## 7. Ferdig

*   Informer bruker: "Scenario `[scenario-id]` er bygget og registrert."
*   Kjør: `npm run scan:content` (oppdaterer content-index)
*   Gi bruker URL: `/oving/tidsreise/[scenario-id]`
