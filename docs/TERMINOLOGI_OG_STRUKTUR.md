# Terminologi og Hierarki

Dette dokumentet beskriver strukturen og terminologien som brukes i Gravity Lærebok-prosjektet.

## Hierarki

Strukturen er bygget opp hierarkisk for å organisere læringsinnholdet på en logisk måte.

### 1. Fag (Subject)
Det øverste nivået i hierarkiet. Representerer de overordnede skolefagene.
*   **Eksempler**: Norsk, Historie, Samfunnskunnskap, KRLE, Musikk.
*   **Teknisk**: `ManifestSubject` i koden.
*   **Ansvar**: Samler alle emner som tilhører et fagområde.

### 2. Emne / Tema (Topic)
En inndeling av et fag. Dette er de store overskriftene eller kapidlene i faget.
*   **Eksempler**: Grammatikk (i Norsk), Andre verdenskrig (i Historie), Demografi (i Samfunnskunnskap).
*   **Teknisk**: `ManifestTopic` i koden. Kan også inneholde *Undertema* (`ManifestSubTopic`) for ytterligere inndeling.

### 3. Leksjon / Modul (Lesson / Module)
Den minste enheten for organisert læringsinnhold. Dette er siden eleven faktisk lander på.
*   **Eksempler**: Setningsanalyse, Trekanthandelen, Demografi & Økonomi.
*   **Teknisk**: `Lesson` eller `ManifestLesson`.
*   **Innhold**: En leksjon kan bestå av flere ulike *komponenter* (se under).

---

## Innholdskomponenter

Hver leksjon eller modul kan settes sammen av ulike byggeklosser for å formidle kunnskap.

### Begreper (Concepts)
Kortfattede definisjoner av nøkkelord.
*   **Funksjon**: Gir eleven rask tilgang til definisjoner og eksempler.
*   **Visning**: Vises som interactive cards i artikler ("Fagbegreper") eller i den globale ordlisten.
*   **Teknisk**: Lagres globalt i TinaCMS (`content/concepts`) eller lokalt i leksjoner.


### Kontekst (Context)
Viser sammenhenger mellom begreper eller hendelser.
*   **Funksjon**: Hjelper eleven å se det store bildet.
*   **Visning**: Tidslinjer, tankekart eller relasjonsdiagrammer.

### Interaktive Moduler / Spill (Interactive Modules)
Spesialiserte komponenter for dypere læring gjennom handling.
*   **Eksempler**:
    *   *Demografimodellen*: En interaktiv befolkningspyramide.
    *   *Malthus-simulatoren*: Et spill om befolkningsvekst vs. matproduksjon.
    *   *Bank-simulatoren*: Demonstrerer hvordan penger skapes.
*   **Teknisk**: React-komponenter (f.eks. `DemographySection`, `MalthusSection`).

### Quiz / Test deg selv
Enkle tester for å sjekke forståelse.
*   **Funksjon**: Gir umiddelbar tilbakemelding på læring.

---

## Filstruktur og Dataflyt

*   **`public/content/manifest.json`**: Definerer hele strukturen (Fag -> Emner -> Leksjoner).
*   **`public/content/<fag>/<emne>/<leksjon>.json`**: Inneholder selve dataene for en standard leksjon (tekst, begreper, quiz).
*   **Spesialleksjoner**: Noen leksjoner (som Demografi) har egne React-komponenter og rutes direkte i koden for å tilby avansert funksjonalitet som ikke dekkes av standard JSON-formatet.

## Tidslinje og Datering

For å støtte tidslinjevisningen, kan leksjoner i `manifest.json` ha følgende valgfrie felt:

*   **`date`**: Dato for hendelsen eller temaet (format: YYYY-MM-DD).
    *   *Logikk*: Leksjoner **uten** dato vises kun i den hierarkiske oversikten, ikke på tidslinjen.
*   **`description`**: En kort beskrivelse som gir kontekst på tidslinjen.
    *   *Visning*: Vises under tittelen.
    *   *Kontekst*: Tidslinjen viser automatisk navnet på **Undertemaet** (f.eks. "Andre verdenskrig") som en tydelig merkelapp over datoen for å gi historisk kontekst.
