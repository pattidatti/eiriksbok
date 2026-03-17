# Guide: Design og Utvikling av Tidsreiser (Scenarier)

Denne guiden beskriver hvordan du designer og implementerer interaktive "Tidsreise"-scenarier i Eiriksbok. Systemet er bygget for å gi elevene en dyp, narrativ opplevelse der de tar valg som påvirker deres stats, ressurser og skjebne.

## 1. Konseptuell Oppbygging

Hvert scenario er en **graf av noder**. Eleven starter i en `startingNodeId` og navigerer gjennom noder via `choices`.

### De 8 Søylene i et Scenario:
1.  **Narrativ (Noder):** Teksten, taleren og bakgrunnsbildet som setter scenen.
2.  **Mekanikk (Stats):** Tallverdier som Disiplin, Moral eller Gull som endres basert på valg. For stats som representerer katastrofe (f.eks. atomspenning, pest-spredning), bruk `gameOverConditions` for automatisk game-over dersom terskelen nås.
3.  **Økonomi (Inventory):** Gjenstander som kan finnes, brukes eller kombineres (Crafting).
4.  **Utfordringer (Minigames):** Spesialiserte noder for 15 ulike utfordringer (kamp, prioritering, sensur, taler, propaganda, proxy-strategi, m.m.).
5.  **Hukommelse (Flags):** Narrativ hukommelse via `setFlags`/`hasFlag`/`lacksFlag`. Flags er hendelser, ikke tall - de husker hva spilleren *valgte*, ikke bare tallresultatet. NPC-er kan kommentere dem, og epilogen personaliseres basert på dem. `visitedFlag` på kartpunkter i hub-noder fungerer som automatiske fullforingsflagg - de settes når spilleren returnerer fra et stoppested og brukes til å gate fremgang med `condition.all`. `isHistoricalChoice`/`historicalConsequence` på valg fungerer som faktaflagg - de vises i EndComparisonScreen og forteller eleven hva som faktisk skjedde historisk.
6.  **Forankring (Discovery Events):** Historiske fakta-ankre via `discoveryEvent`. Når spilleren oppdager en historisk realitet for første gang, vises et læreskjold med faktaboks, artikkelkobling og refleksjonsspørsmål. Kobler fiksjon til fakta.
7.  **Refleksjon (Epilogue + Ethics):** Personalisert epilog (`epilogue`) med flag-drevne tekster, `historicalEcho` og klasseromsspørsmål. `ethicsLens` på moralske valg gir tre filosofiske perspektiver (Kant, utilitarisme, dygdsetikk) via etikk-modus i HUD. Alle tre felt er uavhengig valgfrie - bruk kun de rammeverka som genuint gjelder det moralske spørsmålet.
8.  **Perspektiv (Perspectives):** I scenarier med mange historiske aktører fra ulike nasjoner kan `perspectives`-ordboken gi stemmer, fraksjoner og flagg til alle talere. Dette gjør dialogen rikere og gir elevene visuell kontekst om hvem som snakker og fra hvilken side av konflikten. Bruk når scenariet har 6+ navngitte figurer.

Se `public/content/scenarios/nikolaj-ii.json` for et komplett eksempel på de klassiske minigame-typene. Se `public/content/scenarios/kald-krig.json` for bruk av `perspectives`, `gameOverConditions`, `propaganda`, `domino`, `visitedFlag`-basert hub-navigasjon, og multiple victory endings.

---

## 2. Teknisk Struktur (JSON)

Scenarier lagres i `public/content/scenarios/[scenario-id].json`.

### 2.1 Metadata & Konfigurasjon
```json
{
  "id": "roman-soldier",
  "title": "Legionærens Liv",
  "subtitle": "Undertittel (valgfritt - anbefalt for lengre scenarier)",
  "heroImage": "/images/chronos/[scenario-id]/hero.webp",
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
- `setFlags`: Setter narrativt flagg (f.eks. `["hjalp_fienden"]`). Snake_case. Konsistente IDer på tvers av hele scenariet.
- `clearFlags`: Fjerner et flagg som tidligere ble satt.
- `condition.hasFlag` / `condition.lacksFlag`: Låser/åpner valg basert på hendelser (i stedet for eller i tillegg til stat-betingelser).
- `ethicsLens`: Tre filosofiske perspektiver (`deontological`, `consequentialist`, `virtue`) som vises i pause-modal når etikk-modus er aktiv. Bruk på valg med moralsk vekt.
- `updateInventory`: Legg til eller fjern gjenstander (`add` / `remove`).
- `checkInventory`: Lås valg basert på om eleven har en gjenstand (`hasItem`).
- `updateEnvironment`: Endre tid på døgnet (`time: "night"`) eller vær (`weather: "rain"`).

---

## 3. Minispill og Spesialmoduser

Alle minigame-noder bruker `"choices": []` (tom liste) - routing skjer via `config`-feltet. For fullstendige JSON-skjemaer, se `build_scenario.md` seksjon 2.5.

### Informasjonsbehandling

#### `telegram` - Prioritering under press
Faglig egnet for: beslutningsprosesser under informasjonsoverbelastning, krigsdiplomati, krisekommunikasjon.
Routing: `onComplete.nextNodeId`.
Begrensning: Score beregnes internt - ingen egendefinerte effekter fra minigamen.

#### `censor` - Kildekritikk og sensur-etikk
Faglig egnet for: pressefrihet, propaganda, etikk rundt informasjonskontroll.
Routing: `onComplete.nextNodeId`.
Begrensning: Komponenten har et hardkodet brevhode - passer best i VK1-kontekst.

#### `signal` - Observasjon og tolkning
Faglig egnet for: kildekritikk, etterretning, vitenskapelig metode.
Routing: `winNodeId`/`lossNodeId` (binært utfall, nøyaktig én rett svar).

---

### Ressursforvaltning

#### `allocation` - Ressursfordelingsbeslutninger
Faglig egnet for: prioritering i krig, budsjett, politisk økonomi.
Routing: `onComplete.nextNodeId`. Bruk oppfølgingsnode for å vise konsekvenser av fordelingen.

#### `rationing` - Moralsk ressursallokering
Faglig egnet for: etikk under knapphet, solidaritet, menneskelig prioritering.
Routing: `onComplete.nextNodeId`. Effekter (`ifGiven`/`ifSkipped`) summeres og påføres stats.

#### `triage` - Medisinsk/etisk prioritering
Faglig egnet for: medisinsk etikk, krigshistorie, nødhjelp.
Routing: `onComplete.nextNodeId`.
Begrensning: Effekter på `moral`/`overlevelse` beregnes internt - kan ikke overstyres fra JSON.

---

### Relasjoner og makt

#### `intrigue` - Tillit og svik
Faglig egnet for: politisk analyse, sosiale nettverk, historisk spionasje.
Routing: `onComplete.nextNodeId`. Score beregnes internt. Bruk 5-7 karakterer, 2-3 forrædere.

#### `speech` - Retorikk og innramming
Faglig egnet for: politisk kommunikasjon, norsk retorikk, historiske taler.
Routing: `onComplete.nextNodeId`. Kombo av kolonnevalg bestemmer utfall - siste `outcomes`-innslag er fallback.

---

### Krise og handling

#### `crowd` - Sanntids krisehåndtering
Faglig egnet for: revolusjon, folkeopprør, krisepolitikk.
Routing: `winNodeId`/`lossNodeId`. **Eneste minigame med ekte tidspress** - bruk sparsomt (maks én per scenario).

#### `gasmask` - Tidsbegrenset overlevelse
Faglig egnet for: første verdenskrig, kjemisk krigføring, øyeblikksbeslutninger.
Routing: per-option `nextNodeId` + `noMaskNextNodeId` + `timeoutNextNodeId`. Mest granulær routing. Bruk sparsomt (maks én per scenario).

---

### Konflikt

#### `battle` - Historisk forankret strid
Et turbasert kampsystem basert på "Stein-Saks-Papir"-logikk.
Routing: `winNodeId`/`lossNodeId`. `move.type` må være `attack|defend|maneuver`. `counters` inneholder *typer*, ikke ID-er.

#### `dice` - Tilfeldighet og skjebne
Enkel sannsynlighetssjekk - formidler at historien ikke alltid er bestemt av valg.
Routing: `winNodeId`/`lossNodeId` (strings, ikke objekter).

#### `justice` - Etisk domsavsigelse
Faglig egnet for: rettferdighet, middelalderrett, etikk.
Routing: `onComplete.nextNodeId`. Hvert `case` har `mercy`- og `harsh`-utfall med egne `nextNodeId`.

---

### Medier og geopolitikk

#### `propaganda` - Redaktøren som propagandist
Faglig egnet for: presseetikk under autoritære regimer, Sovjet-propaganda, informasjonskontroll, glasnost.
Routing: `onComplete.nextNodeId`. Intern `credibilityChange`-score gir ikke direkte stats-effekt, men valgene kan sette flagg (`setsFlag`) som brukes i epilogen og ha egne `effects` på stats.
Begrensning: visuell stil er knyttet til outlet-type - tilpass `outlet`-navn og `outletType` til konteksten.
Sammenlignet med `censor`: I `censor` redigerer eleven andres brev for å skjule sannhet. I `propaganda` er eleven sjefsredaktøren som velger hvordan staten presenterer sin egen virkelighet (aktiv propagandist-rolle).

#### `domino` - Proxy-strategi
Faglig egnet for: den kalde krigen, neokolonialisme, proxy-konflikter, utilsiktede konsekvenser.
Routing: `winNodeId`/`lossNodeId`. Score basert på totale `successBonus` fra handlinger som ikke slo tilbake.
Begrensning: `backfireChance` er probabilistisk - samme valg kan gi ulikt utfall. Ikke bruk `domino` der pedagogikken krever et deterministisk svar.
Pedagogisk poeng: elevene opplever at ressursallokering under usikkerhet alltid innebærer avveininger og risiko for utilsiktede konsekvenser.

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

### Minigame-plassering

- **Maks 1 minigame per node** - én mekanikk om gangen.
- **Minst 2-3 ulike typer** per scenario for variasjon og pedagogisk bredde.
- **`crowd` og `gasmask` gir ekte stress** - bruk sparsomt (maks én per scenario). Disse er høyintensitet og bør etterfølges av en rolig narrativnode.
- **Noder med minigame trenger kortere `text`** (30-60 ord) - minigamen er innholdet, teksten er kun kontekstsetting.
- **Følg opp `allocation` og `rationing`** med en narrativnode som viser konsekvensene av valget - disse minigamene produserer ikke egne utfall-tekster.

### Perspektiver og game-over

- **Perspektiver og historisk stemme:** Dersom scenariet har mange talere fra ulike nasjoner, bruk `perspectives` for konsistent visuell identitet. Gi alltid `"Forteller"` en entry i `perspectives` med `"faction": "forteller"` og `"flag": "📖"`.
- **Automatisk game-over vs. manuell routing:** For stats som representerer uopprettelige katastrofer (atomkrig, massedød, systemkollaps), bruk `gameOverConditions` for umiddelbar feedback når terskelen nås. For stats som representerer gradvise tap, bruk manuell tap-routing via valg-betingelser. Ikke bruk begge metodene på samme stat.
