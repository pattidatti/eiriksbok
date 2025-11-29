# Forslag til Navigasjon og Innholdsstruktur

For å redusere antall klikk og gjøre det lettere å finne frem i et voksende bibliotek av artikler, har jeg utarbeidet følgende forslag.

## 1. "Netflix"-stil på Forsiden (Anbefalt)
I stedet for å bare vise store kort for hvert fag, viser vi innholdet direkte på forsiden i horisontale rader.

*   **Struktur:**
    *   **Overskrift:** Fagets navn (f.eks. "Samfunnsfag") - Klikk for å se alt.
    *   **Innhold:** En horisontal "karusell" eller grid med **Emner** (Topics) direkte under overskriften.
*   **Fordel:** Brukeren ser umiddelbart emnene (f.eks. "Den industrielle revolusjon", "Demografi") og kan klikke seg rett inn, og hopper dermed over "Fag"-siden.
*   **Visuelt:** Passer godt med "Dark Immersion"-stilen med store, lekre bilder for hvert emne.

## 2. Utvidede Fagkort
Behold dagens store fagkort, men legg til direkte lenker til populære eller alle emner direkte i kortet.

*   **Design:** Når man holder musen over (eller alltid synlig), vises en liste med "Snarveier":
    *   *Historie*
    *   *Geografi*
    *   *Sosiologi*
*   **Fordel:** Ryddig forside, men gir raskere tilgang.

## 3. Global Søk og Filtrering (Spotlight)
Implementer en "Command K" / "Spotlight"-lignende søkefunksjon som alltid er tilgjengelig, eller ligger sentralt på forsiden.

*   **Funksjon:** Et søkefelt som lar deg filtrere på tvers av alt innhold umiddelbart.
*   **Filtre:**
    *   Filtrer på Fag (Norsk, Samfunnsfag)
    *   Filtrer på Type (Artikkel, Quiz, Oppgave)
    *   Sortering (Nyeste, Alfabetisk)
*   **Fordel:** Den raskeste måten å finne noe spesifikt på for viderekomne brukere.

## 4. "Nylig og Utvalgt" Seksjon
Legg til en seksjon øverst på forsiden som viser:
*   "Fortsett der du slapp" (hvis vi har lokal lagring av historikk)
*   "Nye artikler"
*   "Utvalgte emner"

---

## Forslag til Bedre Strukturering av Innhold

For å håndtere store mengder artikler, foreslår jeg følgende metadata-forbedringer i `manifest.json`:

1.  **Tags / Emneknagger:**
    *   La artikler ha tags som går på tvers av fag (f.eks. #demokrati, #bærekraft, #retorikk).
    *   Dette muliggjør "Temasider" som samler innhold fra både Norsk og Samfunnsfag.

2.  **Nivå/Vanskelighetsgrad:**
    *   Markere artikler med nivå (f.eks. "Intro", "Fordypning").
    *   Lar brukeren filtrere bort for tungt eller for enkelt stoff.

3.  **Listevisninger vs. Gallerivisning:**
    *   På emnesidene (Topic Page), gi brukeren valg mellom:
        *   **Grid:** Store bilder (bra for utforskning).
        *   **Liste:** Kompakt liste med titler og ingress (bra for å skanne mange artikler).

## Neste Steg
Jeg anbefaler at vi starter med **Forslag 1 ("Netflix"-stil)** for forsiden, da dette direkte løser problemet med "for mange klikk" på en visuelt appellerende måte.

Samtidig kan vi begynne å legge inn **Tags** i datastrukturen for å forberede bedre filtrering.
