# Forslag til Nye Læringssti-komponenter

Dette dokumentet beskriver 10 ideer til nye, gjenbrukbare komponenter for Eiriksbok, rangert etter implementasjonskompleksitet. Målet er å skape "Avant-Garde" opplevelser med høy pedagogisk verdi.

## Kategori 1: "The Visual Hooks" (Lav til Medium Kompleksitet)
Disse komponentene er visuelt slående, men teknisk overkommelige.

### 1. **"The Censor" (Sensurkontoret)**
*   **Konsept:** Eleven får utdelt et brev fra en soldat ved fronten. Oppgaven er å bruke "svart blekk" (musa) for å stryke over sensitiv informasjon før brevet sendes hjem.
*   **Wow Factor:** Blekket flyter organisk og trekker inn i "papiret" (SVG filters/CSS blend modes). Lyden av pennesstrøk.
*   **Pedagogikk:** Lærer eleven om informasjonskontroll, propaganda og hva soldatene faktisk fikk lov til å formidle. Gjenbrukbar for moderne overvåkningstemaer.
*   **Teknisk:** Canvas-basert eller SVG-maskering.

### 2. **"Perspective Prism" (Perspektivprismet)**
*   **Konsept:** En 3D-roterbar prisme (eller kube) midt på skjermen. Hver side representerer en kilde (f.eks. Tysk avis, Britisk avis, Privat dagbok) som beskriver *samme hendelse*.
*   **Wow Factor:** Glatt 3D-rotasjon (CSS 3D transforms). Bakgrunnsfargen skifter subtilt basert på hvilken side som er aktiv (f.eks. prøyssisk blå vs britisk rød).
*   **Pedagogikk:** Kildekritikk i praksis. Viser hvordan sannhet er subjektivt i krig.
*   **Teknisk:** React state + CSS 3D.

### 3. **"The Time Lens" (Tidslinsen)**
*   **Konsept:** Et historisk bilde vises. Eleven drar en "magisk linse" over bildet. Inni linsen ser man hvordan det *samme stedet* ser ut i dag (eller før krigen).
*   **Wow Factor:** "Glass-effekt" på linsen med lysbrytning. Høy kvalitet på overgangen.
*   **Pedagogikk:** Viser de fysiske arrene etter krigen, eller kontrasten mellom idyll (Belle Époque) og ødeleggelse.
*   **Teknisk:** Maskering av to overlappende bilder.

## Kategori 2: "The Thinkers" (Medium til Høy Kompleksitet)
Disse krever mer logikk og interaksjon fra eleven.

### 4. **"Chain Reaction" (Dominoeffekten)**
*   **Konsept:** Et nettverk av nodepunkter (f.eks. Alliansesystemet). Noder er koblet sammen med "strikker" (fysikksimulering). Eleven kutter én tråd (f.eks. "Franz Ferdinand dør"), og ser hvordan hele systemet kollapser og drar med seg noder som virket trygge.
*   **Wow Factor:** Fysikkbasert animasjon (React Spring / Framer Motion). Føles taktilt og "levende".
*   **Pedagogikk:** Systemforståelse. Viser kausalitet på en måte tekst ikke kan.
*   **Teknisk:** D3.js eller lettvekts fysikkmotor.

### 5. **"The Cryptograph" (Kodemaskinen)**
*   **Konsept:** En virtuell Enigma-lignende maskin eller chiffer-hjul. Eleven må tyde en melding ved å finne riktig nøkkel basert på hint i teksten.
*   **Wow Factor:** Mekaniske lyder (klikk). Hjul som spinner med tyngde.
*   **Pedagogikk:** Problemløsning og historieforståelse (etterretningens rolle).
*   **Teknisk:** State-maskin for krypteringslogikk.

### 6. **"Propaganda Press" (Plakatmakeren)**
*   **Konsept:** Et "drag-and-drop" verksted hvor eleven skal sette sammen en propagandaplakat. De velger bilde, slagord og farger for å oppnå en bestemt effekt (f.eks. "Rekrutter flere soldater" eller "Demoniser fienden").
*   **Wow Factor:** Papiret eldes foran øynene dine. "Trykkeprosessen" animeres når du er ferdig.
*   **Pedagogikk:** Medieforståelse. Lærer virkemidlene i visuell kommunikasjon.
*   **Teknisk:** Komposisjonsverktøy (Canvas).

### 7. **"The Moral Scale" (Det Etiske Dilemma)**
*   **Konsept:** En skålevekter i "brutalistisk" stein-design. Eleven får et dilemma (f.eks. "Bomb en ammunisjonsfabrikk nær en skole"). De legger "argumenter" (vekter) på skålene. Vekten tipper fysisk.
*   **Wow Factor:** Tung fysikk. Lyddesign (stein mot stein). Skyggespill.
*   **Pedagogikk:** Etisk refleksjon. Tvinger eleven til å veie verdier mot hverandre.
*   **Teknisk:** Enkel fysikksimulering.

## Kategori 3: "The Simulations" (Høy Kompleksitet)
Disse er mini-spill som kan bære en hel sekvens alene.

### 8. **"Squad Manager" (De Som Ikke Kom Hjem)**
*   **Konsept:** Du får utdelt 5 soldater med navn, alder og foto. Gjennom læringsstien må du velge hvem som skal gjøre farlige oppdrag (hente vann, reparere piggtråd). Når en dør, blir bildet borte for alltid.
*   **Wow Factor:** Ekte gamle bilder. Mørk, emosjonell estetikk. Navnet skrives over med rødt.
*   **Pedagogikk:** "Human cost of war". Gjør statistikk om til individer.
*   **Teknisk:** Kompleks tilstandshåndtering (Redux/Context). Persisting av state gjennom stien.

### 9. **"Supply Chain" (Logistikk-puslespill)**
*   **Konsept:** Kartbasert ressursstyring. Du må trekke toglinjer fra fabrikker til fronten. Linjene kan bli bombet. Du må velge: Mat eller Granater?
*   **Wow Factor:** Kartet ser ut som et levende generalstabskart med flyttbare brikker.
*   **Pedagogikk:** Viser at krig avgjøres av industri og logistikk, ikke bare heltemot.
*   **Teknisk:** Pathfinding algoritmer, spill-loop.

### 10. **"The Fog of War" (Audio-Visuell Radar)**
*   **Konsept:** Skjermen er nesten helt mørk/tåkete. Eleven er en lyttepost. Man hører lyder (flydur, marsjering) i 3D-lydbildet (høyre/venstre). Man må flytte en "lyskaster" eller markør dit man tror fienden kommer fra.
*   **Wow Factor:** 3D Audio (Web Audio API). Atmosfærisk skrekk.
*   **Pedagogikk:** Sanselig læring. Forstår usikkerheten og frykten i krig.
*   **Teknisk:** Avansert lydprogrammering.
