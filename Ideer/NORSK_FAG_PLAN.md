# Plan for Norskfaget: Moduler, Artikler, Spill og Leksjoner

Denne planen beskriver utviklingen av nytt innhold for norskfaget, med fokus på grunleggende grammatikk og setningsstruktur.

## 1. Ordklasser (Parts of Speech)

Målet er å gi en grundig forståelse av de ulike ordklassene gjennom en kombinasjon av teori og praksis.

### Moduler og Artikler
Vi skal lage dedikerte artikler/moduler for hver av hovedordklassene:
*   **Substantiv**: Konkret vs. abstrakt, kjønn (hankjønn, hunkjønn, intetkjønn), entall/flertall, bestemt/ubestemt form.
*   **Verb**: Tider (presens, preteritum, presens perfektum), sterke og svake verb, hjelpeverb.
*   **Adjektiv**: Samsvarsbøying, gradbøying.
*   **Pronomen**: Personlige, eiendomspronomen, spørrepronomen.
*   **Preposisjoner**: Sted, tid, og faste uttrykk.
*   **Adverb**: Tidsadverb, stedsadverb, måtesadverb.
*   **Konjunksjoner og Subjunksjoner**: Bindeord og ord som innleder leddsetninger.

### Spill og Aktiviteter
*   **Ordklasse-sortering (Søppelbøtta)**: Dra og slipp ord ned i riktig "bøtte" (f.eks. "Verb", "Substantiv", "Adjektiv"). Økende vanskelighetsgrad.
*   **Ordjakt**: En tekst vises, og eleven må klikke på alle ord av en gitt klasse (f.eks. "Finn alle verbene i teksten").
*   **Alias / Gjett ordet**: Beskriv et substantiv uten å bruke selve ordet (fokus på adjektiver og verb).

---

## 2. Setningsoppbygging (Nivåbasert)

Vi bygger forståelse stein for stein, fra enkle helsetninger til komplekse sammensatte setninger.

### Nivå 1: Grunnmuren (S-V)
*   **Fokus**: Subjekt og Verbal.
*   **Teori**: Hva er en setning? Hvem gjør noe (subjekt), og hva gjøres (verbal)?
*   **Oppgave**: Identifiser subjekt og verbal i enkle setninger.

### Nivå 2: Objekt og Adverbial (S-V-O / S-V-A)
*   **Fokus**: Utvide setninger med objekt (hva/hvem blir påvirket) og adverbial (tid/sted/måte).
*   **Teori**: Direkte og indirekte objekt.
*   **Oppgave**: Bygg setninger ved å sette sammen puslespillbrikker (Ord).

### Nivå 3: V2-Regelen (Verbets plass)
*   **Fokus**: Verbet skal *alltid* være det andre leddet i en fortellende helsetning.
*   **Teori**: Inversjon (når setningen starter med noe annet enn subjekt). Eks: "I dag *går* jeg" (ikke "I dag jeg går").
*   **Spill**: "V2-Politiet" – Rett opp setninger hvor verbet er feilplassert.

### Nivå 4: Leddsetninger og "ikke"-plassering
*   **Fokus**: Helsetninger vs. leddsetninger. Plassering av setningsadverbialet "ikke".
*   **Teori**: "Ikke" kommer *etter* verbet i helsetninger, men *før* verbet i leddsetninger.
*   **Oppgave**: Pute-leken – Plasser "ikke" på riktig sted i ulike setninger.

---

## 3. Punktum og Komma (Tegnsetting)

Praktiske øvelser for å automatisere tegnsetting.

### Punktum (.)
*   **Oppgave**: "Tekstvask". En tekst presenteres helt uten punktum og store bokstaver. Eleven må klikke der punktum skal være, og neste bokstav blir automatisk stor.
*   **Fokus**: Skille mellom setninger.

### Komma (,)
*   **Modul: Oppramsing**: Komma mellom ledd i en oppramsing.
*   **Modul: Men, for, eller, så**: Komma før visse konjunksjoner når de binder sammen to helsetninger.
*   **Modul: Leddsetninger**: Komma etter en leddsetning som starter helsetningen (når leddsetningen kommer først). Eks: "Når du kommer hjem, **må** du spise."
*   **Spill**: "Komma-kanonen" – Skyt inn komma på riktig plass i en løpende tekststrøm eller setning.

---

## Teknisk Implementasjon

*   **Datastruktur**: Utvide `gameData.ts` eller opprette `grammarData.ts` for å holde på oppgaver og setningsstrukturer.
*   **Nye Komponenter**:
    *   `DragDropSentenceBuilder`: For setningsoppbygging.
    *   `TextHighlighter`: For å markere ordklasser eller sette inn tegn.
    *   `GrammarRuleCard`: Visuelle kort som forklarer reglene kjapt før en oppgave.
*   **Integrering**: Legges under en ny fane eller seksjon under "Norsk" -> "Språk og Grammatikk".
