# Håndbok: Lage nye læringsstier i Eiriksbok

Dette dokumentet beskriver den komplette prosessen for å opprette, strukturere og implementere nye læringsstier. En læringssti er en kuratert reise gjennom et emne, som binder sammen artikler, oppgaver og interaktive spill.

## 1. Konsept og Planlegging

Før du skriver kode, må du strukturere stien pedagogisk.

### Sjekkliste for innhold
*   **Tema**: Hva er den røde tråden? (F.eks "Vikingtiden" eller "Den industrielle revolusjon")
*   **Målgruppe**: Er det for introduksjon eller fordypning?
*   **Omfang**: En god sti bør ha 10-20 steg.
*   **Artikler**: Har vi de nødvendige underliggende artiklene? (Hvis ikke, må disse opprettes som "placeholders" først).
*   **Narrativ bue**: Lag en gjennomgående historie. Bruk "Du"-perspektiv som utvikler seg (f.eks. fra bonde til konge).

## 2. Filstruktur

Læringsstier lagres som JSON-filer sammen med emnets artikler.

**Eksempel:**
```
public/content/historie/vikingtiden/vikingtiden-sti.json
```

Navngivingen bør følge mønsteret `[emne]-sti.json`.

## 3. JSON-Struktur

En læringssti består av metadata og en liste med steg.

### Baseskjema (`LearningPathData`)

```json
{
    "id": "mitt-emne-sti",
    "title": "Læringssti: Tittel",
    "description": "Kort innsalg til eleven.",
    "layout": "learning-path",
    "category": "Læringssti",
    "year": "Tidsperiode",
    "readTime": "Estimat (f.eks 2-3 timer)",
    "learningPathData": {
        "id": "mitt-emne-sti",
        "title": "Tittel inne i selve komponenten",
        "description": "Lengre beskrivelse...",
        "steps": [ ... ]
    }
}
```

### Steg-struktur (`LearningPathStep`)

Hvert steg i `steps`-arrayet kan være av typen:
*   `fakta`: Ren informasjon.
*   `refleksjon`: Spørsmål til ettertanke.
*   `utfordring`: Noe vanskeligere.
*   `oppgave`: Konkrete gjøremål.
*   `ressurs`: Lenker til fordypning.

```json
{
    "id": "unik-id-for-steget",
    "phase": "Fase 1: Oppstart (Valgfritt, lager overskrift)",
    "title": "Stegets tittel",
    "type": "fakta", 
    "content": "Selve teksten som vises i kortet. Bør være 50-80 ord. Sett scenen: 'Du står på torget...'. Skap kontekst før fakta.",
    "tasks": [
        "Oppgave 1 - Enkel fakta",
        "Oppgave 2 - ...",
        "Oppgave 8 - Refleksjon (Mål: 5-8 oppgaver med stigende vanskelighetsgrad)"
    ],
    "links": [
        {
            "title": "Les mer om dette",
            "url": "/historie/emne/artikkel"
        }
    ]
}
```

### Interaktive Komponenter (Fase 2)

Du kan legge inn spill og verktøy direkte i et steg ved å bruke `component`-feltet.

> **Tips:** Hvis ingen av de eksisterende komponentene passer til ditt innhold, ikke nøl med å **foreslå nye!** Vi utvider stadig biblioteket med skreddersydde verktøy for spesifikke læringsmål.

#### Tilgjengelige komponenter:

**1. PackTheBag (Ressursstyring)**
Brukes for forberedelser, reiser eller økonomi.
```json
"component": {
    "name": "PackTheBag",
    "props": {
        "capacity": 500,
        "targetValue": 80,
        "items": [
           { "id": "item1", "name": "Navn", "weight": 50, "value": 30, "icon": "🐟" }
        ]
    }
}
```

**2. ScenarioRoleplay (Valg-basert historie)**
Brukes for dilemmaer og historisk empati.
```json
"component": {
    "name": "ScenarioRoleplay",
    "props": {
        "title": "Tittel",
        "intro": "Intro tekst...",
        "startId": "start",
        "scenarios": [
            {
                "id": "start",
                "text": "Hva gjør du?",
                "options": [
                    { "label": "Valg A", "nextId": "a" },
                    { "label": "Valg B", "nextId": "b" }
                ]
            }
        ]
    }
}
```

**3. DebateSimulator (Argumentasjon)**
Brukes for politikk, rettssaker eller konflikter.
```json
"component": {
    "name": "DebateSimulator",
    "props": {
        "topic": "Saken gjelder...",
        "opponentName": "Motstander",
        "context": "Bakgrunn...",
        "winningScore": 15,
        "arguments": [
             { "id": "a1", "text": "Ditt argument", "strength": 5, "type": "mercy", "response": "Motstanders svar" }
        ]
    }
}
```

**4. DragDropTimeline (Rekkefølge)**
Brukes for hendelsesforløp.
```json
"component": {
    "name": "DragDropTimeline",
    "props": {
        "title": "Sett i rekkefølge",
        "events": [
            { "id": "e1", "year": 1000, "label": "Hendelse A" },
            { "id": "e2", "year": 1066, "label": "Hendelse B" }
        ]
    }
}
```

## 4. Registrering i Manifest

For at stien skal vises i systemet, må den registreres i `public/content/manifest.json` under riktig `topic`.

```json
{
    "id": "mitt-emne",
    "tools": [
        {
            "id": "mitt-emne-sti",
            "title": "Læringssti: Tittel",
            "description": "Beskrivelse...",
            "link": "/historie/mitt-emne/mitt-emne-sti",
            "icon": "map"
        }
    ],
    "lessons": [ ... ]
}
```

> **VIKTIG:** Læringsstier skal registreres i `tools`-listen til et emne, **ikke** under `lessons`.

## 5. Feilsøking og Kvalitetssikring

### Kritiske Sjekkpunkter (Unngå disse feilene!)

#### 1. "Spøkelsesdata" (Duplikate oppføringer)
**Symptom:** Endringer i manifestet vises ikke, eller gamle data henger igjen.
**Årsak:** Det finnes flere oppføringer for samme `id` i manifestet (f.eks to blokker med `"id": "den-kalde-krigen"`). Systemet velger ofte den første den finner.
**Løsning:** Før du limer inn noe nytt, søk etter ID-en i filen for å se om den allerede eksisterer. Slett eller oppdater den eksisterende blokken.

#### 2. Koding og Norske Tegn
**Symptom:** Tekst vises som "Ã¦", "Ã¸", "Ã¥".
**Årsak:** Manuell redigering eller kopiering har ødelagt tegnsettet (UTF-8).
**Løsning:** Vær nøye med encoding når du redigerer `manifest.json`. Ser du rare tegn, fiks dem umiddelbart.

#### 3. Synlighet i Sidebar
**Symptom:** Læringsstien dukker ikke opp i menyen til høyre inne på artikler.
**Årsak:** Læringsstien er ikke registrert korrekt i `tools`-listen i manifestet, eller koden finner den ikke.
**Løsning:** Sjekk at `tools`-blokken ligger på samme nivå som `lessons` inne i emnet.

#### 4. Navigasjon på Emnekort
**Symptom:** Klikk på emnet går rett til første artikkel, ikke oversikten.
**Årsak:** Systemet tror emnet bare har én leksjon og hopper over forsiden.
**Løsning:** Sørg for at `tools` er definert. Navigasjonslogikken skal prioritere oversiktssiden hvis verktøy finnes.

> **VIKTIG:** Sørg for at `id` i manifestet matcher filnavnet (uten .json) og `id` inne i JSON-filen.

## 5. Sjekkliste for Kvalitetssikring

Før du sier deg ferdig:

1.  [ ] **Lenker**: Fungerer alle interne lenker til artikler? Har du laget placeholder-artikler for manglende innhold?
2.  [ ] **Bilder**: Har alle interaktive komponenter nødvendige ikoner/bilder?
3.  [ ] **Progresjon**: Er det en logisk rekkefølge fra enkle fakta til komplekse oppgaver?
4.  [ ] **Variasjon**: Bland lesing, refleksjon og interaktive spill. Unngå 10 "fakta"-kort på rad.
5.  [ ] **Testing**: Åpne stien i nettleseren og klikk gjennom alle stegene. Spill gjennom scenariene for å sjekke at logikken holder.

## 6. Tips & Triks

*   **Bruk "Faser"**: Gruppér stegene med `phase`-feltet for å gi eleven oversikt (f.eks "Fase 1: Oppstart", "Fase 2: Fordypning").
*   **Tooltips**: Bruk `<GlossaryTooltip term="ord" definition="forklaring" />` inne i React-komponenter der det er mulig (krever koding), eller skriv definisjoner i parantes i JSON-teksten.
*   **Ikke bruk fet tekst**: Vi bruker ikke **fet tekst** for utheving i brødtekst, la innholdet stå for seg selv.
*   **Integrert interaktivitet**: Introduser spill i teksten. F.eks: 'Offiseren beordrer deg til å pakke...' før en PackTheBag-komponent.
*   **Kronologisk nøyaktighet**: Vær streng på tidslinjen. Ikke snakk om keisere i republikkens tid.
*   **Tverrfaglighet**: Læringsstien bør lenke til artikler utenfor hovedemnet for å vise helhet (f.eks. lenke til Religion når man snakker om Lov og Rett).
*   **Flere lenker**: Et enkelt steg kan og bør ha flere lenker hvis det belyser temaet fra ulike sider.
