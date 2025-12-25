# Historisk Detektiv: Guide til Motor og Saksopprettelse

Detektiv-motoren er designet for å lære elever historisk metode gjennom aktiv etterforskning. Hver "sak" er en JSON-drevet opplevelse som leder eleven fra rå fragmenter til ekspertanalyse.

## 1. Pedagogiske Kjerneprinsipper

Hver sak må følge den **Pedagogiske Trakten**:

1.  **Narrativ Introduksjon (`introduction`):**
    - **Formål:** Gi støtte til elever med null forkunnskaper.
    - **Tone:** Fortellende, inviterende og ufarliggjørende.
    - **Krav:** Må starte med en variant av: *"Det første/neste vi skal undersøke er et [kildetype]..."*.
    - **Eksempel:** *"Det første vi skal undersøke er en 'tingbok' fra Vardø. En tingbok er en slags dagbok fra rettssalen..."*

2.  **Ekspertveiledning (`guidance`):**
    - **Formål:** Gi den formelle historiske "linsen" (Ekspertanalyse).
    - **Tone:** Profesjonell, analytisk, men lettfattelig.
    - **Fokus:** Diskutere historisk kontekst, hvorfor kilden finnes, og hvilke skjevheter (bias) den kan ha.

3.  **Kritisk Refleksjon (`provenance` & `uncertainty`):**
    - **Proveniens:** Hvor er det fysiske dokumentet nå? (f.eks. "Digitalarkivet").
    - **Usikkerhet:** Hvorfor kan denne kilden være upålitelig? (f.eks. "Skrevet 200 år senere").

4.  **Bevisoppdagelse (`clues`):**
    - Elevene må klikke på uthevede fraser for å "høste" bevis.
    - Hvert spor skal gi en `insight` som kobler kilden tilbake til det overordnede mysteriet.

## 2. Teknisk Struktur (JSON-skjema)

Saker lagres i `public/content/interactive/detective/[case-id].json`.

### Viktige felter:
- `engine`: Alltid `"historical-detective"`.
- `briefing`: Intro-skjermen (tittel, kontekst, mysterium, oppdrag, bilde).
- `suspects`: De ulike teoriene/vinklene elevene kan utforske.
- `steps`: En liste med etterforskningsskritt. Hvert skritt inneholder `sources`.
- `sources`:
  - `type`: `"textual"`, `"visual"`, eller `"scientific"`.
  - `original`: Råtekst eller banen til et bilde.
  - `translation` / `interpretation`: Fullstendig moderne norsk versjon.
  - `introduction`: Den narrative kroken.
  - `guidance`: Ekspertanalysen.

## 3. Visuell Standard
- **Hero-bilder:** 16:9 kinematiske bilder (generert via verktøy).
- **Stil:** Mørk, oppslukende, "etterforsknings-estetikk".
- **Merkelapper:** Bruk "Originalfragment" og "Oversatt tolkning" for å tydeliggjøre dataene.

## 4. Integrasjon i appen
1. Legg JSON-filen i `public/content/interactive/detective/`.
2. Registrer verktøyet i `public/content/manifest.json` under relevant emne.
3. Legg saken til i `cases`-arrayen i `src/pages/DetectiveHubPage.tsx`.
