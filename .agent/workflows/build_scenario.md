---
description: Bygger et fullstendig Tidsreise-scenario-JSON fra en godkjent Blueprint. Implementerer alle noder, stats, items og registrerer i manifest.
---

# Workflow: Build Scenario

**Input:** `[scenario-id]` - ID-en til et godkjent scenario (blueprint skal eksistere).

**Forutsetning:** `/plan_scenario` er fullført og blueprinfilen finnes.

---

## 1. Les Kontekst

*   File: `docs/Design documents/[scenario-id]-scenario-blueprint.md` - PRIMÆRKILDEN. Følg denne nøye.
*   File: `docs/SCENARIO_DESIGN_GUIDE.md` - Teknisk spec for alle node-typer og felter.
*   File: `public/content/scenarios/nikolaj-ii.json` - Gold-standard. Les denne først. Viser bruk av alle 10 minigame-typer, heroImage og subtitle.
*   File: `public/content/scenarios/roman-soldier.json` - Enklere referanse (battle + dice).
*   File: `public/content/manifest.json` - For å finne riktig `subjectId` og `topicId` til registrering.

---

## 2. Opprett Scenario-JSON

Opprett `public/content/scenarios/[scenario-id].json`.

### 2.1 Rotstruktur (Metadata)

```json
{
  "id": "[scenario-id]",
  "title": "...",
  "subtitle": "Undertittel (valgfritt - anbefalt for lengre scenarier)",
  "heroImage": "/images/chronos/[scenario-id]/hero.webp",
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
*   `heroImage` - 16:9 WebP-bilde vist på scenario-kortet og intro-skjermen. Valgfritt men anbefalt.
*   `subtitle` - Valgfri undertittel, f.eks. epoke eller historisk kontekst. Vises under tittelen.
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
    *   `itemType: "letter"` - brevvisning med sepia-stil, Fra/Til/Dato og brødtekst som `<p>`-elementer.
    *   `itemType: "object"` - standard gjenstandsvisning (brukes sjelden; gjenstander *uten* `content` bruker samme visning automatisk).
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
*   `uiType: "map"` - Bruk KUN for hub-noder. Utelat feltet for alle andre noder.
*   `journalPrompt` - Bruk ved viktige veiskiller (før stor konflikt, etter minigame). Tving refleksjon.
*   `backgroundImage` - Alltid `/images/chronos/[beskrivende-filnavn].webp`. Filen trenger ikke eksistere ennå.
*   `speaker` - Bruk "Forteller" for narratorscener. Bruk karakternavn for dialog.
*   `discoveryEvent` - Bruk ved historisk viktige noder (første gang eleven møter en realitet: gassangrep, krigsrett, hungersnød). Kun én per node. Vises automatisk første gang eleven besøker noden. Bruk på minst 1-2 noder i scenariet.
*   `npcDialogue` - Bruk på noder der en NPC snakker og det finnes en `rel_[navn]`-stat. Velg `statId` lik den aktuelle relasjonens stat-ID. Relasjonsverdien styrer hvilken tone som vises automatisk.

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
*   Bruk `checkInventory` for valg som krever en gjenstand - disse låses automatisk i UI.
*   Skriv valgtext slik at eleven forstår den historiske implikasjonen.
*   `setFlags` - bruk på valg som representerer en *hendelse* eleven husker (hjalp fienden, nektet ordre, tok gjenstand). Snake_case. Flag-IDer må være konsistente på tvers av hele scenariet.
*   `condition.hasFlag` / `condition.lacksFlag` - brukes i stedet for (eller i tillegg til) stat-betingelser for å låse/åpne valg basert på hendelser.
*   `ethicsLens` - bruk på valg med moralsk vekt. Aktiveres kun dersom eleven har slått på etikk-modus i HUD. Gir tre filosofiske perspektiver i en pause-modal før eleven bekrefter valget.

### 2.5 Minispill-noder

Alle minigame-noder har `"choices": []` (tom liste) - routing skjer via minigame-config.

#### Valgguide: Pedagogisk funksjon per type

| Type | Pedagogisk funksjon | Routing |
|---|---|---|
| `telegram` | Prioritering under press / informasjonsoverbelastning | `onComplete` |
| `allocation` | Ressursfordelingsbeslutninger | `onComplete` |
| `speech` | Retorikk og innramming med kombo-utfall | `onComplete` |
| `intrigue` | Tillit og svik, sosial analyse | `onComplete` |
| `crowd` | Sanntids krisehåndtering (eneste med ekte tidspress) | `winNodeId`/`lossNodeId` |
| `triage` | Medisinsk/etisk prioritering under knapphet | `onComplete` |
| `signal` | Enkelt observasjons-/tolkningsutfordring | `winNodeId`/`lossNodeId` |
| `gasmask` | Tidsbegrenset overlev med inventarkrav | Per-option `nextNodeId` |
| `rationing` | Moralsk ressursallokering med kumulativ effekt | `onComplete` |
| `censor` | Kildekritikk / sensur-etikk | `onComplete` |
| `battle` | Historisk forankret strid (stein-saks-papir) | `winNodeId`/`lossNodeId` |
| `dice` | Tilfeldighet og skjebne som historisk faktor | `winNodeId`/`lossNodeId` |
| `justice` | Etisk domsavsigelse | `onComplete` |

---

**battle:**
```json
"node_id": {
  "id": "node_id",
  "type": "battle",
  "text": "Introduksjonstekst for kampen.",
  "choices": [],
  "config": {
    "enemyName": "Fiendenavn",
    "playerHealth": 15,
    "enemyHealth": 15,
    "winNodeId": "seier_node",
    "lossNodeId": "tap_node",
    "moves": [
      { "id": "angrep", "label": "Angrep", "type": "attack", "counters": ["maneuver"] },
      { "id": "forsvar", "label": "Forsvar", "type": "defend", "counters": ["attack"] },
      { "id": "manøver", "label": "Manøver", "type": "maneuver", "counters": ["defend"] }
    ]
  }
}
```
> `type` må være `attack|defend|maneuver`. `counters` inneholder *typer* som flytten slår, ikke ID-er.

---

**dice:**
```json
"node_id": {
  "id": "node_id",
  "type": "dice",
  "text": "Terningkast-scene.",
  "choices": [],
  "config": {
    "targetScore": 4,
    "winNodeId": "seier_node",
    "lossNodeId": "tap_node"
  }
}
```

---

**justice:**
```json
"node_id": {
  "id": "node_id",
  "type": "justice",
  "text": "Domsscene.",
  "choices": [],
  "config": {
    "onComplete": { "nextNodeId": "neste_node" },
    "cases": [
      {
        "id": "case_id",
        "description": "Tvistebeskrivelse.",
        "mercy": { "nextNodeId": "...", "effects": { "stat": 10 } },
        "harsh": { "nextNodeId": "...", "effects": { "stat": -10 } }
      }
    ]
  }
}
```

---

**telegram:**
```json
"node_id": {
  "id": "node_id",
  "type": "telegram",
  "text": "Introduksjonstekst.",
  "choices": [],
  "config": {
    "onComplete": { "nextNodeId": "neste_node" },
    "telegrams": [
      { "id": "tg1", "from": "Avsender", "preview": "Meldingstekst...", "correctBucket": "urgent" },
      { "id": "tg2", "from": "Avsender 2", "preview": "Tekst...", "correctBucket": "wait" }
    ]
  }
}
```
> `correctBucket`: `"urgent"` eller `"wait"`. Bruk 4-6 telegrammer. Score beregnes internt.

---

**allocation:**
```json
"node_id": {
  "id": "node_id",
  "type": "allocation",
  "text": "Introduksjonstekst.",
  "choices": [],
  "config": {
    "onComplete": { "nextNodeId": "neste_node" },
    "totalPoints": 100,
    "categories": [
      { "id": "militær", "label": "Militær front", "description": "Utstyr og forsyninger til hæren" },
      { "id": "mat", "label": "Mat til folket", "description": "Korn til bybefolkningen" }
    ]
  }
}
```
> Alltid 3-4 kategorier. Ingen effekter fra minigamen selv - bruk en oppfølgende narrativnode for konsekvenser.

---

**speech:**
```json
"node_id": {
  "id": "node_id",
  "type": "speech",
  "text": "Introduksjonstekst.",
  "choices": [],
  "config": {
    "onComplete": { "nextNodeId": "konsekvens_node" },
    "columns": [
      { "label": "Tone", "options": [{ "id": "streng", "text": "Streng" }, { "id": "mild", "text": "Mild" }] },
      { "label": "Fokus", "options": [{ "id": "krig", "text": "Krigen" }, { "id": "folk", "text": "Folket" }] }
    ],
    "outcomes": [
      { "combo": "streng_krig", "feedback": "Duma-representantene forlater i stillhet.", "effects": { "autoritet": 5, "folkets_stotte": -20 } },
      { "combo": "mild_folk", "feedback": "Forsiktig optimisme i salen.", "effects": { "autoritet": -5, "folkets_stotte": 20 } }
    ]
  }
}
```
> `combo`-nøkkel: option-ID-er i kolonneordenen, adskilt med `_`. Siste `outcomes`-innslag brukes som fallback.

---

**intrigue:**
```json
"node_id": {
  "id": "node_id",
  "type": "intrigue",
  "text": "Introduksjonstekst.",
  "choices": [],
  "config": {
    "onComplete": { "nextNodeId": "neste_node" },
    "tokens": 3,
    "characters": [
      { "id": "char1", "name": "Navn", "role": "Rolle", "description": "Hvem er dette?", "isTraitor": false, "feedback": "Historisk utfall." },
      { "id": "char2", "name": "Navn 2", "role": "Rolle 2", "description": "...", "isTraitor": true, "feedback": "Forræder." }
    ]
  }
}
```
> Score beregnes internt. Bruk 5-7 karakterer, 2-3 forrædere.

---

**crowd:**
```json
"node_id": {
  "id": "node_id",
  "type": "crowd",
  "text": "Introduksjonstekst.",
  "choices": [],
  "config": {
    "winNodeId": "ro_gjenopprettet",
    "lossNodeId": "revolusjon_bryter_ut",
    "timeLimit": 25,
    "fillRate": 4,
    "responses": [
      { "id": "korn", "label": "Tilby korn", "description": "Nødhjelp", "pressureChange": -18, "cooldown": 6 },
      { "id": "militær", "label": "Send tropper", "description": "Risikerer eskalering", "pressureChange": 12, "cooldown": 3 }
    ]
  }
}
```
> Starttrykk er hardkodet til 15. `fillRate` = trykk per sekund (3-6). `pressureChange` < 0 = reduksjon.

---

**triage:**
```json
"node_id": {
  "id": "node_id",
  "type": "triage",
  "text": "Introduksjonstekst.",
  "choices": [],
  "config": {
    "onComplete": { "nextNodeId": "neste_node" },
    "treatCapacity": 3,
    "patients": [
      { "id": "p1", "name": "Soldat Hansen", "wound": "Skuddsår i brystet, bevissthetssvikt", "correctBucket": "treat_now" },
      { "id": "p2", "name": "Menig Berg", "wound": "Brudd i armen", "correctBucket": "can_wait" },
      { "id": "p3", "name": "Kapteinen", "wound": "Hodeskade, ingen puls", "correctBucket": "expectant" }
    ]
  }
}
```
> **NB:** Komponenten beregner effekter på `moral` og `overlevelse` internt basert på score-prosent. Egendefinerte effekter kan ikke injiseres fra JSON.

---

**signal:**
```json
"node_id": {
  "id": "node_id",
  "type": "signal",
  "text": "Introduksjonstekst.",
  "choices": [],
  "config": {
    "winNodeId": "riktig_rapport",
    "lossNodeId": "feil_rapport",
    "situation": "Beskriv scenen som skal tolkes...",
    "options": [
      { "id": "opt1", "label": "Tolkning A", "isCorrect": true },
      { "id": "opt2", "label": "Tolkning B", "isCorrect": false }
    ],
    "correctFeedback": "Rapporten var nøyaktig.",
    "incorrectFeedback": "Feil analyse - konsekvensene merkes."
  }
}
```
> Nøyaktig én `isCorrect: true`.

---

**gasmask:**
```json
"node_id": {
  "id": "node_id",
  "type": "gasmask",
  "text": "Introduksjonstekst.",
  "choices": [],
  "config": {
    "situation": "Situasjonsbeskrivelse...",
    "timeLimit": 8,
    "options": [
      { "id": "opt1", "text": "Ta på gassmasken", "requiresItem": "gassmask_item_id", "nextNodeId": "overlevde", "effects": { "stat": 10 } },
      { "id": "opt2", "text": "Hjelp kameraten", "nextNodeId": "hjalp_kameraten" }
    ],
    "noMaskMessage": "Du rekker etter masken - den er ikke der.",
    "noMaskNextNodeId": "gass_skade",
    "noMaskEffects": { "stat": -20 },
    "timeoutNextNodeId": "gass_timeout",
    "timeoutEffects": { "stat": -15 }
  }
}
```
> Mest granulær routing. Hvert option har eget `nextNodeId`. `requiresItem` sjekker inventar - mangler varen, brukes `noMaskNextNodeId`.

---

**rationing:**
```json
"node_id": {
  "id": "node_id",
  "type": "rationing",
  "text": "Introduksjonstekst.",
  "choices": [],
  "config": {
    "onComplete": { "nextNodeId": "neste_node" },
    "rations": 3,
    "soldiers": [
      { "id": "s1", "name": "Navn", "role": "Rolle", "context": "Kontekst om soldaten", "effects": { "ifGiven": { "moral": 5 }, "ifSkipped": { "moral": -5 } } }
    ]
  }
}
```
> `rations` = maks antall soldater som kan motta. Alle effekter summeres og påføres stats.

---

**censor:**
```json
"node_id": {
  "id": "node_id",
  "type": "censor",
  "text": "Introduksjonstekst.",
  "choices": [],
  "config": {
    "onComplete": { "nextNodeId": "neste_node" },
    "paragraphs": [
      {
        "id": "p1",
        "tokens": [
          { "type": "text", "content": "Kjære mor, " },
          { "type": "phrase", "id": "ph1", "text": "fronten er et helvete", "shouldCensor": true, "reason": "Senker moral hjemme." },
          { "type": "text", "content": " men vi holder ut." }
        ]
      }
    ]
  }
}
```
> **NB:** Komponenten har hardkodet brevhode - visuelt kontekst-spesifikt. Vurder om det passer scenariet.

---

## 3. Avslutningsnoder

Alltid inkludér minst to avslutningsnoder:

*   **`victory`** - Positiv avslutning. Inkludér `journalPrompt` som oppsummerer hva eleven lærte.
*   **`defeat`** - Negativ avslutning. Reflekter over hva som gikk galt historisk.

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
    "reflectionQuestion": "Ett åpent spørsmål til klassen.",
    "classroomQuestions": [
      "Åpent spørsmål 1 rettet mot klassen.",
      "Åpent spørsmål 2 med historiefaglig kjerne."
    ]
  }
}
```

**Regler:**
*   Minst én `entries`-oppføring per viktig flagg i scenariet.
*   `historicalEcho` kobler fiksjon til fakta - det som faktisk skjedde historisk.
*   `reflectionQuestion` er rettet mot klassen, ikke spilleren - brukes som samtalestart.
*   `classroomQuestions` (valgfritt) - array med åpne diskusjonsspørsmål for læreren. **NB:** Feltet er i JSON men rendres ikke av UI-et automatisk - det er pedagogisk dokumentasjon for læreren/plan.

---

## 4. Valider JSON

Sjekk at:

- [ ] Alle `nextNodeId`-referanser peker på eksisterende node-ID-er.
- [ ] Alle `checkInventory.hasItem`-verdier er definert i `config.items`.
- [ ] Brev-items (`itemType: "letter"`) har utfylte `from`, `to`, `date` og minst 3 `body`-elementer.
- [ ] Alle `effects`-nøkler matcher en `id` i `config.stats`.
- [ ] `startingNodeId` finnes i `nodes`.
- [ ] Ingen node mangler `choices`-array (selv om den er tom).
- [ ] `setFlags`-IDer er konsistente - samme streng brukt på tvers av `setFlags`, `hasFlag`, `lacksFlag` og `epilogue.entries`.
- [ ] Alle end-noder har `epilogue` med minst én `historicalEcho`.
- [ ] Noder med `npcDialogue` peker på en `statId` som finnes i `config.stats`.
- [ ] `discoveryEvent` er brukt på minst 1-2 noder i scenariet.
- [ ] Minigame med `onComplete`: `onComplete.nextNodeId` finnes i `nodes`.
- [ ] Minigame med `winNodeId`/`lossNodeId` (battle, dice, crowd, signal): begge finnes i `nodes`.
- [ ] `gasmask`: alle `option[].nextNodeId`, `noMaskNextNodeId` og `timeoutNextNodeId` finnes i `nodes`.
- [ ] Alle minigame-noder har `"choices": []` (tom liste).

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
    icon: Shield,   // Shield|Crown|Sword - velg passende
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
